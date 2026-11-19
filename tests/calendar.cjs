const {app,assert}=require('./dom.cjs');
const read=s=>JSON.parse(JSON.stringify(s));
function snapshot(a){return Object.fromEntries(Object.keys(a.w.localStorage).map(k=>[k,a.w.localStorage.getItem(k)]));}
(async()=>{
let a=app({},'2026-12-31T12:00:00'),today=a.run('localDay()');assert.equal(today,'2026-12-31');
const initial=a.run('JSON.stringify(ensureCalendar())');assert.equal(a.run('Object.keys(state.calendar).length'),7);
a.click('[data-day]');a.click('[data-advance]');assert.equal(a.run('state.calendar[localDay()].cursor'),1);
let b=app(snapshot(a),'2026-12-31T18:00:00');b.click('[data-day]');assert.equal(b.run('state.practice.index'),1);
b.run("go('grammar');startGrammar();go('calendar');startDay()");assert.equal(b.run('state.practice.index'),1);
let c=app(snapshot(b),'2027-01-02T08:00:00');
assert.ok(['missed','moved'].includes(c.run("state.calendar['2026-12-31'].status")));
assert.ok(c.run("['missed','moved'].includes(state.calendar['2027-01-01'].status)"));
assert.equal(c.run('state.calendar[localDay()].status'),'planned');assert.equal(c.run('state.calendar[localDay()].actual'),'');
const plan=c.run('JSON.stringify(state.calendar)');let d=app(snapshot(c),'2027-01-02T21:00:00');assert.equal(d.run('JSON.stringify(state.calendar)'),plan);
d.run("settings().intensity='light';ensureCalendar(localDay(),true)");assert.ok(d.run('state.calendar[localDay()].blocks.flatMap(b=>b.ids).length<=3'));
d.run("settings().intensity='intense';ensureCalendar(localDay(),true)");assert.ok(d.run('state.calendar[localDay()].blocks.length<=2'));
d.run("startDay();while(!state.practice.finished){const q=activeTask();if(q.mode!=='intro')gradePractice(q.answers[0]);advancePractice();}");
assert.equal(d.run('state.calendar[localDay()].actual'),'2027-01-02');
const e=app(snapshot(d),'2027-01-03T09:00:00');assert.ok(e.run('ensureCalendar().optional'));assert.equal(e.run('ensureCalendar().status'),'planned');
await new Promise(resolve=>setImmediate(resolve));
for(const item of [a,b,c,d,e]){assert.deepEqual(item.errors,[]);item.dom.window.close();}
console.log('Calendar: New Year boundary, saved queue, extracurricular interruption, missed days, stable reopening, load and explicit completion OK.');

})().catch(err=>{console.error(err);process.exitCode=1});

{
 const learner=app({},'2026-10-24T23:30:00');
 const {run}=learner;
 run("go('blocks');const b=blocks[0];beginPractice(b.title,lessonQueue(b.ids));while(!state.practice.finished){if(activeTask().mode!=='intro')gradePractice(activeTask().answers[0]);advancePractice();}");
 assert.ok(run("ensureCalendar().blocks.flatMap(b=>b.ids).every(id=>!seenWord(id))"));
 assert.equal(run("shiftDay('2026-10-24',2)"),'2026-10-26');
 run("state.calendar={};state.words={};state.exposure={};state.skills={};state.preferences.intensity='normal';");
 const count=()=>run("planFor('2026-10-26').blocks.flatMap(b=>b.ids).length");
 const initial=count();
 run(`for(let i=0;i<4;i++)recordEvent(state,{key:wordKey(verbs[i].id,'ru-pt'),mode:'recall'},'wrong','first','2026-10-24');`);
 assert.equal(count(),initial);
 run(`for(let i=4;i<8;i++)recordEvent(state,{key:wordKey(verbs[i].id,'ru-pt'),mode:'recall'},'wrong','second','2026-10-25');`);
 assert.ok(count()<initial);assert.ok(count()>0);
 setImmediate(()=>learner.dom.window.close());
 console.log('Free study refreshes today, DST day math, sustained difficulty changes new workload, one session does not.');
}
