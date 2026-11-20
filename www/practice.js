const Bora = {pages:{grammar:grammarPage}};
const newId = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
function beginPractice(title,queue,date='',source='topic',lessonId='') {
  if(!queue.length){toast('Пока нет заданий для этой тренировки.');return;}
  const old=state.practice;
  if(old?.date&&!old.finished&&state.calendar?.[old.date]?.status==='active')state.calendar[old.date].paused=old;
  state.practice={id:newId(),title,queue,index:0,date,source:date?'calendar':source,lessonId,finished:false};
  screen='practice';nav();save();showPractice();
}
function activeTask() {const s=state.practice;return s?.queue[s.index];}
function showPractice() {
  const s=state.practice,q=activeTask();
  if(!s||!q){go('home');return;}
  screen='practice';nav();
  const mode=settings().answerMode;
  let feedback;
  if(q.solved)feedback='<div class="feedback"><b>Верно!</b><p>'+esc(q.explanation||q.answers[0])+'</p><button class="btn wide" data-advance>Дальше →</button></div>';
  else if(q.mode==='intro')feedback='<button class="btn wide" data-advance>Продолжить</button>';
  else if(q.options)feedback=q.options.map((x,i)=>'<button class="option" data-practice-option="'+i+'">'+esc(x)+'</button>').join('');
  else if(mode==='card'){
    feedback=q.flipped?'<div class="answer-side"><b>'+esc(q.answers[0])+'</b><p>'+esc(q.explanation||'')+'</p></div><div class="rating-row">'+
      [['wrong','Не вспомнил'],['partial','Почти вспомнил'],['right','Вспомнил']].map(([key,title])=>'<button class="rate '+key+'" data-grade="'+key+'">'+title+'</button>').join('')+'</div>':
      '<button class="btn wide" data-flip>Показать ответ</button>';
  }else feedback='<form id="practice-answer"><input id="practice-input" class="input" aria-label="Твой ответ" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Твой ответ"><button class="btn wide">Проверить</button></form>';
  if(q.mode!=='intro'&&!q.solved&&!q.flipped){
    feedback+='<button class="back" data-hint>Подсказка</button>';
    if(q.hinted)feedback+='<p class="note-box">'+esc(q.hint||q.answers[0])+'</p>';
    if(q.errors)feedback+='<div class="feedback bad">Ответ: <b>'+esc(q.answers[0])+'</b>. <button class="back" data-skip>Пропустить</button></div>';
  }
  $('view').innerHTML='<div class="content"><div class="session-top"><button class="back" data-go="home" aria-label="На главную">←</button><div class="bar"><i style="width:'+Math.round(100*s.index/s.queue.length)+'%"></i></div><span>'+ (s.index+1)+'/'+s.queue.length+'</span></div><p class="pack-name">'+esc(s.title)+'</p><div class="question"><span class="eyebrow">'+esc(q.label)+'</span><h2>'+esc(q.prompt)+'</h2>'+(q.context?'<p class="question-card">'+esc(q.context)+'</p>':'')+'</div>'+feedback+'</div>';
}
function matchesAnswer(q,input){
  const pt=!q.key.endsWith('|pt-ru');
  const canonical=s=>String(s).toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\bpra\b/g,'para').replace(/\bpro\b/g,'para o');
  if(q.answers.some(a=>canonical(a)===canonical(input)))return true;
  const [,v,t,p]=q.key.split('|');
  if(q.key.startsWith('form|')&&paradigms[v]){
    const target=formOf(v,+t,+p);
    const others=new Set(paradigms[v].flatMap(row=>row.split(' ')));
    for(const alt of others){
      if(alt!==target&&normalizeRecall(alt,true)===normalizeRecall(target,true)&&canonical(input).split(' ').includes(alt))return false;
    }
  }
  return q.answers.some(a=>normalizeRecall(canonical(a),pt)===normalizeRecall(canonical(input),pt));
}
function answerTask(kind,method){
  const q=activeTask(),s=state.practice;
  if(!q||q.solved||q.mode==='intro'||(method==='card'&&!q.flipped))return;
  if(!recordEvent(state,q,kind,s.id,localDay(),method,s.source||'practice'))return;
  if(!q.loggedActivity){activity();q.loggedActivity=true;}
  if(kind==='wrong')q.errors=(q.errors||0)+1;
  const complete=kind==='right'||method==='card';
  if(complete){
    q.solved=true;q.rating=kind==='right'&&(q.hinted||q.errors)?'partial':kind;
    if(!q.retry)state.xp+=q.rating==='right'?5:q.rating==='partial'?2:0;
  }
  Bora.onKnowledgeChanged?.(q.key);
  sound(kind==='right');
  if(method==='card'){advancePractice();return;}
  save();showPractice();
}
function gradePractice(input){
  const q=activeTask();
  if(!q||!String(input).trim())return;
  answerTask(matchesAnswer(q,input)?'right':'wrong',q.options?'choice':'typed');
}
function advancePractice(){
  const s=state.practice,q=activeTask();
  if(!q||(!q.solved&&q.mode!=='intro'&&!q.skipped))return;
  Bora.beforeAdvance?.(s,q);
  s.index++;
  if(s.date&&state.calendar?.[s.date]){state.calendar[s.date].cursor=s.index;state.calendar[s.date].total=s.queue.length;}
  if(s.index===s.queue.length){
    s.finished=true;if(s.lessonId)state.completedLevels[s.lessonId]=true;Bora.complete?.(s);save();screen='result';nav();
    $('view').innerHTML='<div class="content result"><h1>Mandou bem!</h1><p>'+esc(s.title)+'</p><p>'+s.queue.filter(q=>q.mode!=='intro'&&!q.retry&&q.solved&&!q.errors&&!q.hinted&&q.rating!=='partial').length+' самостоятельно · '+s.queue.filter(q=>!q.retry&&(q.errors||q.hinted||q.rating==='partial')).length+' к закреплению</p>'+victoryScene()+'<button class="btn wide" data-go="home">На главную</button></div>';playVictory();return;
  }
  save();showPractice();window.scrollTo(0,0);
}
document.addEventListener('submit',e=>{if(e.target.id==='practice-answer'){e.preventDefault();gradePractice($('practice-input').value);}});
document.addEventListener('click',e=>{
  const d=e.target.closest('button')?.dataset;if(!d)return;
  if('practiceGrammar' in d)startGrammar();
  if('practiceOption' in d)gradePractice(activeTask().options[+d.practiceOption]);
  if('flip' in d){const q=activeTask();if(q&&!q.solved){q.flipped=true;save();showPractice();}}
  if('grade' in d&&['right','partial','wrong'].includes(d.grade))answerTask(d.grade,'card');
  if('hint' in d){const q=activeTask();if(!q.hinted){q.hinted=true;recordEvent(state,q,'hint',state.practice.id,localDay(),q.options?'choice':settings().answerMode,state.practice.source||'practice');}save();showPractice();}
  if('advance' in d)advancePractice();
  if('skip' in d&&activeTask()?.errors){activeTask().skipped=true;advancePractice();}
  if('resumePractice' in d)showPractice();
});
