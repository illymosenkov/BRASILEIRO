const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
const {app,assert}=require('./dom.cjs');
const archive=process.argv[2];
if(!archive)throw Error('Supply the original Bora 5.0 APK');
const asset=name=>execFileSync('unzip',['-p',archive,'assets/public/'+name],{encoding:'utf8',maxBuffer:4000000});
const html=asset('index.html').replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>'<script>'+asset(file)+'</script>');
const prior=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',beforeParse(w){
 w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=()=>{};
}});
const old=code=>prior.window.eval(code);
assert.equal(old('state.version'),5);
old("state.sound=false;settings().focus=80;startDay();advancePractice();go('grammar');beginPractice('Fazer',[formTask('fazer',0,0,'recall'),formTask('fazer',1,0,'recall')]);gradePractice('ошибка');gradePractice(activeTask().answers[0]);advancePractice();gradePractice(activeTask().answers[0]);save()");
const raw=prior.window.localStorage.getItem('bora_civic_v5'),original=JSON.parse(raw);
assert.equal(Object.keys(original.skills).length,2);
const next=app({bora_civic_v5:raw}),{run,w}=next;
assert.equal(run('state.version'),6);
assert.equal(w.localStorage.getItem('bora_civic_v5'),raw);
for(const field of ['words','xp','days','selfRatings','skills','completedLevels','calendar','practice','exposure']){
 assert.deepEqual(JSON.parse(run('JSON.stringify(state.'+field+')')),original[field],field);
}
assert.equal(run('settings().focus'),80);
assert.equal(run("state.skills['form|fazer|0|0'].firstWrong"),1);
assert.equal(run("state.skills['form|fazer|1|0'].firstRight"),1);
w.oldFile=JSON.stringify({app:'bora-civic',state:original});
assert.ok(run('restoreProgress(oldFile)'));assert.ok(run('restoreProgress(oldFile)'));
assert.deepEqual(JSON.parse(run('JSON.stringify(state.skills)')),original.skills);
run("go('calendar');startDay()");assert.equal(run('state.practice.index'),1);
prior.window.close();next.dom.window.close();
console.log('Genuine 5.0 APK → 5.1: paused daily lesson, XP, settings, two independent conjugations, old raw snapshot and repeat import preserved.');
