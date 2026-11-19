const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const c={Bora:{pages:{}},document:{addEventListener(){}}};vm.createContext(c);
vm.runInContext(fs.readFileSync(__dirname+'/../www/review.js','utf8'),c);
const items=Array.from({length:30},(_,i)=>({key:String(i),score:i,overdue:0,weak:i<15}));
for(const ratio of [0,20,60,80,100]){const got=c.reviewSelection(items,10,ratio);assert.equal(got.filter(i=>i.weak).length,ratio/10);assert.equal(new Set(got).size,10);}
const few=items.slice(13);assert.equal(c.reviewSelection(few,10,80).length,10);
assert.equal(c.reviewSelection(items.slice(15),10,100).length,10);
assert.equal(c.reviewSelection([],10,60).length,0);
items[0].overdue=10;assert.ok(c.reviewSelection(items,10,0).includes(items[0]));
console.log('Review quotas, fallback, uniqueness, overdue starvation: OK');
