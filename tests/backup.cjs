const {app,assert}=require('./dom.cjs'),{execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
const base=process.argv[2];if(!base)throw Error('Supply original Bora 4.3 APK');
const asset=name=>execFileSync('unzip',['-p',base,'assets/public/'+name],{encoding:'utf8',maxBuffer:3000000});
const html=asset('index.html').replace('<script src="extra-phrases.js"></script>',()=>'<script>'+asset('extra-phrases.js')+'</script>');
const old=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=()=>{};}});
old.window.eval("state.sound=false;start('v0','quiz');while(!session.finished){submitAnswer(true);next();}stopVictory();save()");
const raw=old.window.localStorage.getItem('bora_civic_v3');assert.equal(JSON.parse(raw).xp,100);
const a=app({bora_civic_v3:raw});const {w,run,click}=a;
assert.equal(run('state.version'),5);assert.equal(run('state.xp'),100);assert.equal(run('JSON.stringify(state.words)'),JSON.stringify(JSON.parse(raw).words));
assert.equal(run('Object.keys(state.skills).length'),0);assert.equal(w.localStorage.getItem('bora_civic_v3'),raw);
run("go('profile');");let json;w.Capacitor={isPluginAvailable:()=>true,Plugins:{BoraBackup:{saveBackup:async arg=>{json=arg.json;return{};},openBackup:async()=>({json})}}};
(async()=>{
 await run('exportProgress()');assert.equal(JSON.parse(json).state.xp,100);
 run("startDay();advancePractice();go('grammar');startGrammar();gradePractice('нет');gradePractice(activeTask().answers[0]);advancePractice();go('preferences');settings().focus=20;save();go('profile')");
 await run('exportProgress()');
 const expected=JSON.parse(json).state;
 run('state.xp=0;save()');await run('chooseProgressFile()');
 assert.deepEqual(JSON.parse(run('JSON.stringify(state)')),expected);
 const saved=w.localStorage.getItem('bora_civic_v5');
 for(const corrupt of ['{',JSON.stringify({app:'bora-civic',state:{}}),...[
  s=>s.preferences.focus=101,s=>s.calendar[Object.keys(s.calendar)[0]].blocks='oops',s=>s.practice.index=-1,s=>Object.values(s.skills)[0].checks++,
  s=>s.version=999,s=>s.days['2026-99-40']=1
 ].map(change=>{const s=structuredClone(expected);change(s);return JSON.stringify({app:'bora-civic',state:s});})]){
  w.__bad=corrupt;assert.equal(run('restoreProgress(window.__bad)'),false);assert.equal(w.localStorage.getItem('bora_civic_v5'),saved);
 }
 const b=app({bora_civic_v5:saved});assert.deepEqual(JSON.parse(b.run('JSON.stringify(state)')),expected);
 const bad=app({bora_civic_v5:'broken'});assert.equal(bad.run('storageBlocked'),true);assert.equal(bad.w.localStorage.getItem('bora_civic_v5'),'broken');
 const recovered=app({bora_civic_v5:'broken',bora_civic_v5_previous:saved});assert.equal(recovered.run('state.xp'),expected.xp);
 w.__old=JSON.stringify({app:'bora-civic',state:JSON.parse(raw)});assert.equal(run('restoreProgress(__old)'),true);assert.equal(run('state.xp'),100);
 await new Promise(r=>setImmediate(r));[a,b,bad,recovered].forEach(x=>x.dom.window.close());old.window.close();
 console.log('Actual 4.3 quiz → 5.0 migration; native bridge save/open calls; complete round-trip, corrupt backups, old file import and recovery OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
