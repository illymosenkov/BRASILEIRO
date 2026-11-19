const Bora = {pages:{grammar:grammarPage}};
const newId = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
function beginPractice(title,queue,date='') {
  if(!queue.length){toast('Пока нет заданий для этой тренировки.');return;}
  state.practice={id:newId(),title,queue,index:0,date,finished:false};
  screen='practice';nav();save();showPractice();
}
function activeTask() {const s=state.practice;return s?.queue[s.index];}
function showPractice() {
  const s=state.practice,q=activeTask();
  if(!s||!q){go('home');return;}
  screen='practice';nav();
  const feedback=q.solved?'<div class="feedback"><b>Верно!</b><p>'+esc(q.explanation||q.answers?.[0]||'')+'</p><button class="btn wide" data-advance>Дальше →</button></div>':
    q.mode==='intro'?'<button class="btn wide" data-advance>К практике →</button>':
    (q.options?q.options.map((x,i)=>'<button class="option" data-practice-option="'+i+'">'+esc(x)+'</button>').join(''):
    '<form id="practice-answer"><input id="practice-input" class="input" aria-label="Твой ответ" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Твой ответ"><button class="btn wide">Проверить</button></form>')+
    '<button class="back" data-hint>Подсказка</button>'+
    (q.hinted?'<p class="note-box">'+esc(q.hint||q.answers[0])+'</p>':'')+
    (q.errors?'<div class="feedback bad">Правильный вариант — <b>'+esc(q.answers[0])+'</b>. Попробуй ещё раз. <button class="back" data-skip>Пока пропустить</button></div>':'');
  $('view').innerHTML='<div class="content"><div class="session-top"><button class="back" data-go="home" aria-label="На главную">←</button><div class="bar"><i style="width:'+Math.round(100*s.index/s.queue.length)+'%"></i></div><span>'+ (s.index+1)+'/'+s.queue.length+'</span></div><p class="pack-name">'+esc(s.title)+'</p><div class="question"><span class="eyebrow">'+esc(q.label)+'</span><h2>'+esc(q.prompt)+'</h2>'+(q.context?'<p class="question-card">'+esc(q.context)+'</p>':'')+'</div>'+feedback+'</div>';
}
function gradePractice(input){
  const q=activeTask();if(!q||q.solved||q.mode==='intro'||!String(input).trim())return;
  const normalize=s=>normalizeRecall(s,!q.key.endsWith('|pt-ru'));
  const ok=q.answers.some(a=>normalize(a)===normalize(input));
  Bora.attempt?.(q,ok,state.practice.id);
  if(ok){q.solved=true;if(!q.retry){state.xp+=5;activity();}}
  else q.errors=(q.errors||0)+1;
  save();sound(ok);showPractice();
}
function advancePractice(){
  const s=state.practice,q=activeTask();
  if(!q||(!q.solved&&q.mode!=='intro'&&!q.skipped))return;
  Bora.beforeAdvance?.(s,q);
  s.index++;
  if(s.index===s.queue.length){
    s.finished=true;Bora.complete?.(s);save();screen='result';nav();
    $('view').innerHTML='<div class="content result"><h1>Mandou bem!</h1><p>'+esc(s.title)+' · тренировка завершена.</p>'+victoryScene()+'<button class="btn wide" data-go="home">На главную</button></div>';playVictory();return;
  }
  save();showPractice();window.scrollTo(0,0);
}
document.addEventListener('submit',e=>{if(e.target.id==='practice-answer'){e.preventDefault();gradePractice($('practice-input').value);}});
document.addEventListener('click',e=>{
  const d=e.target.closest('button')?.dataset;if(!d)return;
  if('practiceGrammar' in d)startGrammar();
  if('practiceOption' in d)gradePractice(activeTask().options[+d.practiceOption]);
  if('hint' in d){const q=activeTask();if(!q.hinted){q.hinted=true;Bora.noteHint?.(q,state.practice.id);}save();showPractice();}
  if('advance' in d)advancePractice();
  if('skip' in d&&activeTask()?.errors){activeTask().skipped=true;advancePractice();}
  if('resumePractice' in d)showPractice();
});
