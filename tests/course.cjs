const {app,assert}=require('./dom.cjs');
const a=app(),{run,click,find,w}=a;
run('state.sound=false');
const coverage=run(`(()=>{
 let count=0;
 for(const v of Object.keys(verbContexts))for(let t=0;t<7;t++)for(let p=0;p<7;p++){
  const answer=formOf(v,t,p);if(!answer||answer.includes('undefined'))throw Error(v);
  if(t===6&&answer!==['vou','vai','vai','vamos','vão','vão','vai'][p]+' '+v)throw Error(answer);
  for(const mode of ['recall','choice','fix','translate']){
   const q=formTask(v,t,p,mode);if(q.options&&(q.options.filter(x=>x===q.answers[0]).length!==1||new Set(q.options).size!==q.options.length))throw Error(v+' choices');
   if(!q.prompt||!q.answers[0]||q.prompt.includes('undefined'))throw Error(v+' '+mode);
   count++;
  }
 }
 return count;})()`);
assert.equal(coverage,9800);
run("go('grammar');grammarPick.irregular=true;grammarPick.mode='mix';grammarPage()");
click('[data-practice-grammar]');
assert.ok(run("state.practice.queue.every(q=>irregular.has(q.key.split('|')[1]))"));
assert.equal(run('new Set(state.practice.queue.map(q=>q.mode)).size'),4);
run("beginPractice('Проверка',lessonQueue(blocks.find(b=>b.parent==='base0').ids));while(activeTask().mode==='intro')advancePractice();window.targetKey=activeTask().key;gradePractice('???');gradePractice(activeTask().answers[0]);advancePractice()");
assert.ok(run("state.practice.queue.slice(state.practice.index+5).some(q=>q.retry&&q.key===targetKey)"));
run("go('preferences')");find('#focus-slider').value='80';find('#focus-slider').dispatchEvent(new w.Event('input',{bubbles:true}));
assert.equal(run("JSON.parse(localStorage.getItem('bora_civic_v5')).preferences.focus"),80);
for(const page of ['home','learn','phrases','funk','dictionary','profile','blocks','grammar','reviews','weak','preferences','calendar']){
 run("go('"+page+"')");assert.ok(find('#view').textContent.trim().length>20,page);
}
run("start('f0','ru-pt');reveal();submitAnswer(true)");assert.ok(run('Object.values(state.selfRatings).some(r=>r.known===1)'));
run("start('n0','pt-ru');window.legacyKey=wordKey(session.queue[0].w.id,'pt-ru');document.querySelector('#typed').value='неправильно';writeAnswer();submitAnswer(true)");
assert.equal(run('state.skills[legacyKey].firstWrong'),1);assert.equal(run('state.skills[legacyKey].firstRight'),0);
assert.deepEqual(a.errors,[]);a.dom.window.close();
console.log('9,800 generated mode/person/tense cases; irregular and mixed practice, delayed repair, settings, routes and separate self-rating OK.');
