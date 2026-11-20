// QA build only: Android WebView exposes its debug socket in the emulator.
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {tapDocumentNode}=require('./documents-ui.cjs');
const adb=(...args)=>execFileSync('adb',args,{encoding:'utf8'}).trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(){
 for(let i=0;i<60;i++){
  try{
   const pid=adb('shell','pidof','br.bora.civic43').split(' ')[0];
   adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);
   const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json();
   const page=pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl);if(!page)throw Error();
   const ws=new WebSocket(page.webSocketDebuggerUrl);
   await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
   let id=0;
   async function run(expression){
    const call=++id;
    return new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>{ws.removeEventListener('message',onmessage);reject(Error('WebView timeout'));},12000);
     function onmessage(e){const m=JSON.parse(e.data);if(m.id!==call)return;ws.removeEventListener('message',onmessage);clearTimeout(timer);
      if(m.error||m.result?.exceptionDetails)reject(Error(JSON.stringify(m.error||m.result.exceptionDetails)));else resolve(m.result.result.value);}
     ws.addEventListener('message',onmessage);ws.send(JSON.stringify({id:call,method:'Runtime.evaluate',params:{expression,returnByValue:true,awaitPromise:true}}));
    });
   }
   if(await run("typeof go==='function' && !!document.querySelector('#nav button')"))return {run,ws};
   ws.close();
  }catch{}
  await wait(1000);
 }
 throw Error('Bora WebView did not start');
}
(async()=>{
 const {run,ws}=await connect();
 try{
 console.log('WebView ready',await run("JSON.stringify({origin:location.origin,version:state.version,xp:state.xp,keys:Object.keys(localStorage),legacyXp:JSON.parse(localStorage.getItem('bora_civic_v3')||'null')?.xp,locked:typeof storageBlocked==='undefined'?null:storageBlocked})"));
 if(process.argv[2]==='reopen'){assert.equal(await run('state.xp'),100);return;}
 if(process.argv[2]==='legacy'){assert.equal(await run("state.sound=false;start('v0','quiz');while(!session.finished){submitAnswer(true);next();}save();state.xp"),100);assert.equal(await run("JSON.parse(localStorage.getItem('bora_civic_v3')).xp"),100);return;}
 if(process.argv[2]==='legacy50'){
  assert.equal(await run('state.xp'),100);assert.equal(await run('state.version'),5);
  assert.equal(await run("go('grammar');startGrammar();gradePractice('wrong');gradePractice(activeTask().answers[0]);state.skills[activeTask().key].firstWrong"),1);
  assert.equal(await run('state.xp'),105);return;
 }
 assert.equal(await run('state.xp'),105);assert.equal(await run('state.version'),6);
 assert.equal(await run('state.skills[activeTask().key].firstWrong'),1);
 assert.equal(await run("go('learn');document.querySelector('[data-topic=g0]').click();document.querySelector('[data-unit]').click();window.reviewKey=activeTask().key;document.querySelector('[data-flip]').click();document.querySelector('[data-grade=wrong]').click();go('reviews');reviewCandidates().some(row=>row.key===reviewKey)"),true);
 assert.ok(await run("document.documentElement.scrollWidth<=innerWidth && document.querySelectorAll('#nav button').length===3"));
 assert.ok(await run("go('profile');!!backupPlugin()"));
 await run("document.querySelector('[data-export]').click();true");await wait(1800);
 assert.match(adb('shell','dumpsys','activity','activities'),/documentsui|DocumentsActivity/i);
 await tapDocumentNode(node=>/resource-id="[^"]*id\/button1"/.test(node)||/text="Save"/i.test(node));
 await wait(1200);
 const file=adb('shell','find','/sdcard/Download','-name','bora-progress.json').split('\n')[0];
 assert.ok(file,'Saved JSON in Downloads');
 const saved=JSON.parse(adb('shell','cat',file));assert.equal(saved.state.version,6);
 assert.equal(saved.state.xp,105);
 await run("state.xp=0;save();window.confirm=()=>true;document.querySelector('[data-import]').click();true");
 await wait(900);
 await tapDocumentNode(node=>/text="bora-progress(?:\.json)?"/i.test(node));
 for(let i=0;i<25&&await run('state.xp')!==105;i++)await wait(300);
 assert.equal(await run('state.xp'),105);
 console.log('Emulator: 4.3 → 5.0 → 5.1 retained 105 XP and original mistakes. Catalog card, shared review queue, mobile width and Android SAF export/restore OK.');
 }finally{ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
