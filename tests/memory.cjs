const {readFileSync}=require('node:fs');
const vm=require('node:vm'),assert=require('node:assert/strict');
const c={Bora:{},newId:(()=>{let n=0;return()=>String(++n)})(),localDay:d=>d?new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10):'2026-11-19'};
vm.createContext(c);vm.runInContext(readFileSync(__dirname+'/../www/memory.js','utf8'),c);
const m={},k='word|v:fazer|ru-pt';
function attempt(day,kind='right',q={key:k,mode:'write'}){c.recordEvent(m,q,kind,day,day);return m.skills[k];}
const q={key:k,mode:'write'};let s=attempt('2026-11-19','wrong',q);
attempt('2026-11-19','wrong',q);attempt('2026-11-19','right',q);
assert.deepEqual([s.checks,s.firstRight,s.firstWrong,s.errors,s.attempts,s.due],[1,0,1,2,3,'2026-11-19']);
const hint={key:k,mode:'write'};attempt('2026-11-20','hint',hint);attempt('2026-11-20','right',hint);assert.equal(s.firstRight,0);
for(const day of ['2026-11-21','2026-11-22','2026-11-25'])attempt(day);
assert.equal(s.streak,3);assert.equal(s.interval,6);assert.equal(s.status,'yellow');
const prev=s.interval;attempt('2026-11-25');assert.equal(s.interval,prev);
attempt(s.due);attempt(s.due);assert.equal(s.status,'green');
attempt(s.due,'wrong');assert.equal(s.interval,0);assert.equal(s.status,'red');
for(const key of ['word|v:fazer|pt-ru','form|fazer|0|0','form|fazer|1|0','form|fazer|0|3'])attempt('2026-12-01','right',{key});
assert.equal(Object.keys(m.skills).length,5);
assert.equal(c.shiftDay('2026-12-31',1),'2027-01-01');console.log('Memory: first answer, hints, retries, dates, intervals, lapse and independent skills OK.');
