const {app,assert}=require('./dom.cjs');
const a=app();
a.run("beginPractice('Спряжения',[formTask('poder',0,3,'fix')]);state.sound=false");
assert.equal(a.find('.answer-translation'),null);
a.click('[data-flip]');
assert.equal(a.find('.answer-translation').textContent,'Обычно мы можем помочь.');
a.run("beginPractice('Спряжения',[formTask('beber',1,5,'choice')]);gradePractice('wrong')");
assert.equal(a.find('.answer-translation').textContent,'Вчера они выпили воды.');
a.run("gradePractice(activeTask().answers[0])");
assert.equal(a.find('.answer-translation').textContent,'Вчера они выпили воды.');
assert.equal(a.run("grammarTranslation(formTask('ter',2,6,'recall',true))"),'В детстве у нас было время.');
assert.equal(a.run("grammarTranslation(formTask('fazer',3,0,'translate'))"),'Я буду делать это.');
for(const verb of a.run('Object.keys(verbContexts)')){
 a.w.verbUnderTest=verb;
 assert.ok(a.run("tenses.every((_,t)=>people.every((_,p)=>!grammarTranslation(formTask(verbUnderTest,t,p,'recall')).match(/undefined/)))"),verb);
}
a.dom.window.close();
console.log('Sentence translation appears after reveal, wrong answers and correct choices, with person and tense coverage.');
