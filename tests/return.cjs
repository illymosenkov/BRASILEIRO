const {app,assert}=require('./dom.cjs');
function finish(a){a.run("state.sound=false;while(!state.practice.finished){if(activeTask().mode==='intro'||activeTask().solved)advancePractice();else gradePractice(activeTask().answers[0]);}");assert.ok(a.find('[data-return]'));a.click('[data-return]');}
const a=app();
a.run("go('grammar');grammarPick.verb='ter';grammarPick.tense=1;grammarPick.level='A2';grammarPage();startGrammar()");
finish(a);assert.equal(a.run('screen'),'grammar');assert.equal(a.run('grammarPick.verb'),'ter');assert.equal(a.run('grammarPick.tense'),1);
a.run("selectedTopic='v0';topicMode='ru-pt';go('topic');launchUnit(1)");
const storage=Object.fromEntries(Object.keys(a.w.localStorage).map(k=>[k,a.w.localStorage.getItem(k)]));
const b=app(storage);b.run('showPractice()');finish(b);
assert.equal(b.run('screen'),'topic');assert.equal(b.run('selectedTopic'),'v0');assert.equal(b.run('topicMode'),'ru-pt');
a.run("go('reviews');beginPractice('Повторение',[wordTask('v:fazer','pt-ru')],'','review')");finish(a);assert.equal(a.run('screen'),'reviews');
a.run("go('calendar');startDay()");finish(a);assert.equal(a.run('screen'),'calendar');
a.dom.window.close();b.dom.window.close();
console.log('Return after completion restores grammar filters, original topic after restart, review screen and calendar.');
