const {app,assert}=require('./dom.cjs');
const a=app();const source=a.run('JSON.stringify(state)');
const old=JSON.parse(source);old.version=5;delete old.preferences.answerMode;
old.xp=180;old.achievements={firstLesson:true};old.selfRatings['word|v:fazer|pt-ru']={known:2,unknown:1};
const raw=JSON.stringify(old),b=app({bora_civic_v5:raw});
assert.equal(b.w.localStorage.getItem('bora_civic_v5'),raw);
assert.equal(b.run('state.version'),6);assert.equal(b.run('state.xp'),180);
assert.ok(b.run('state.achievements.firstLesson'));assert.equal(b.run('Object.keys(state.skills).length'),0);
for(const [kind,id] of [['partial','v:ser'],['right','v:ter'],['wrong','v:ir']]){
 b.w.args={kind,id};b.run("const q={mode:'recall',key:wordKey(args.id,'pt-ru')};recordEvent(state,q,args.kind,'one',localDay(),'card','topic');recordEvent(state,q,args.kind,'one',localDay(),'card','topic');save()");
}
assert.ok(b.run("state.skills[wordKey('v:ser','pt-ru')].due<state.skills[wordKey('v:ter','pt-ru')].due"));
assert.ok(b.run("Object.values(state.skills).every(s=>s.checks===1&&s.history.length===1)"));
assert.equal(b.run("state.skills[wordKey('v:ir','pt-ru')].firstWrong"),1);
assert.equal(b.run("state.skills[wordKey('v:ser','pt-ru')].partials"),1);
const c=app({bora_civic_v51:b.w.localStorage.getItem('bora_civic_v51')});assert.equal(c.run('storageBlocked'),false);assert.equal(c.run('state.xp'),180);
[a,b,c].forEach(x=>x.dom.window.close());console.log('Schema 5→6, preserved raw 5.0 storage, outcome isolation, duplicate submission, partial interval and restart OK');
