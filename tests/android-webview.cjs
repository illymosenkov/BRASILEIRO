// QA build only: Android WebView exposes its debug socket in the emulator.
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
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
 if(process.argv[2]==='legacy'){assert.equal(await run("state.sound=false;start('v0','quiz');while(!session.finished){submitAnswer(true);next();}save();state.xp"),100);return;}
 assert.equal(await run('state.xp'),100);
 assert.equal(await run('state.version'),5);
 assert.equal(await run("go('grammar');startGrammar();gradePractice('wrong');gradePractice(activeTask().answers[0]);state.skills[activeTask().key].firstWrong"),1);
 assert.ok(await run("go('profile');!!backupPlugin()"));
 await run("document.querySelector('[data-export]').click();true");await wait(1800);
 assert.match(adb('shell','dumpsys','activity','activities'),/documentsui|DocumentsActivity/i);
 adb('shell','input','keyevent','4');await wait(1000);
 await run("document.querySelector('[data-import]').click();true");await wait(1600);
 assert.match(adb('shell','dumpsys','activity','activities'),/documentsui|DocumentsActivity/i);
 console.log('Emulator: installed update retained 100 XP, WebView practice and Android document pickers opened.');
 }finally{ws.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
