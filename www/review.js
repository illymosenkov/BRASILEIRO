const defaults=()=>({focus:60,intensity:'normal',answerMode:'card'});
const settings=()=>state.preferences??=defaults();
const knowledge={neutral:'Не изучено',red:'Слабое знание',yellow:'Неуверенно',green:'Уверенно'};
let weakFilter='Все';
function describeKey(key){
  const [kind,id,t,p]=key.split('|');
  const w=byId.get(kind==='form'?'v:'+id:id);
  if(!w)return null;
  const category=kind==='form'?'Спряжения':w.type==='verb'?'Глаголы':id.startsWith('f:')?(/фонк|фанк|танц|бит/i.test(w.topic)?'Фразы из фонка':'Сленг'):w.type==='phrase'?'Разговорные выражения':'Обычные слова';
  return {w,kind,category,title:kind==='form'?id+' · '+people[+p]+' · '+tenses[+t][0]:(w.inf||w.word)+' · '+(kind==='cloze'?'пропуск':t==='ru-pt'?'RU → PT':'PT → RU')};
}
function wordTask(id,dir,mode='recall'){
  const w=byId.get(id),pt=w.inf||w.word,back=dir==='ru-pt';
  let answers=back?[pt,...pt.split(' / ')]:[w.meaning,...w.meaning.split(/\s*[/;]\s*/)];
  if(back&&w.type==='noun')answers.push(pt.replace(/^(o|a|os|as) /,''));
  if(!back)answers=answers.flatMap(x=>[x,x.replace(/\s*\([^)]*\)\s*$/,'')]).filter(Boolean);
  const q={key:wordKey(id,dir),mode,label:back?'RU → PT':'PT → RU',prompt:back?w.meaning:pt,answers,hint:back?'Начинается с «'+pt.slice(0,2)+'…»':w.pron,explanation:pt+' — '+w.meaning};
  if(mode==='choice'){
    const pool=shuffle(allWords.filter(o=>o.type===w.type&&o.id!==id));
    const other=[...new Set(pool.map(o=>back?(o.inf||o.word):o.meaning))].filter(a=>!answers.includes(a));
    q.options=shuffle([answers[0],...other.slice(0,3)]);
  }
  return q;
}
function taskForKey(key){
  const [kind,id,t,p]=key.split('|');
  if(kind==='cloze')return clozeTask(byId.get(id));
  if(kind==='word')return wordTask(id,t);
  if(paradigms[id])return formTask(id,+t,+p,'recall');
  const w=byId.get('v:'+id);
  return {key,mode:'recall',label:id+' · Presente',prompt:'Вспомни форму eu.',answers:[w.eu,'eu '+w.eu],hint:w.euPron,explanation:'Eu '+w.eu};
}
function rankSkill(s,day){
  const overdue=s.due?Math.max(0,Math.round(dayNumber(day)-dayNumber(s.due))):0;
  const recent=s.history.filter(x=>x.attempts&&!x.retry).slice(-6);
  const misses=recent.filter(x=>x.first!==true).length;
  const badDays=new Set(recent.filter(x=>x.errors).map(x=>x.date)).size;
  return {weak:s.status==='red'||(misses>0&&s.status!=='green')||overdue>0,overdue,
    score:overdue*3+misses*3+badDays*2+(s.difficulty||0)/12+(100-(s.confidence||0))/15};
}
function reviewSelection(candidates,n,focus){
  const ordered=[...new Map(candidates.map(x=>[x.key,x])).values()].sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key));
  const weak=ordered.filter(x=>x.weak),rest=ordered.filter(x=>!x.weak);
  n=Math.min(n,ordered.length);
  const quota=Math.round(n*focus/100);
  const selected=[...weak.slice(0,quota),...rest.slice(0,n-quota)];
  const unique=new Set(selected.map(x=>x.key));
  for(const item of ordered){if(selected.length===n)break;if(!unique.has(item.key)){selected.push(item);unique.add(item.key);}}
  // Even a zero-focus setting must eventually service a long-overdue item.
  const oldest=weak.filter(x=>x.overdue>=7).sort((a,b)=>b.overdue-a.overdue)[0];
  if(oldest&&n&&!selected.includes(oldest))selected[n-1]=oldest;
  return selected;
}
function reviewCandidates(day=localDay()){
  const measured=Object.entries(state.skills||{}).filter(([k,s])=>describeKey(k)&&s.checks);
  const entries=measured.filter(([,s])=>s.due<=day).map(([key,s])=>({key,...rankSkill(s,day)}));
  const keys=new Set(measured.map(([k])=>k));
  // Use surviving legacy evidence only until this exact skill has a measured history.
  for(const [key,r] of Object.entries(state.selfRatings||{})){
    if(keys.has(key)||!r.unknown||!describeKey(key))continue;
    entries.push({key,weak:true,score:2+r.unknown,overdue:0});keys.add(key);
  }
  for(const [id,w] of Object.entries(state.words)){
    const key=wordKey(id,'pt-ru');if(!byId.has(id)||keys.has(key)||w.due>day)continue;
    const overdue=Math.max(0,Math.floor(dayNumber(day)-dayNumber(w.due)));
    entries.push({key,weak:w.wins===0||overdue>0,score:overdue*3+2,overdue});
  }
  return entries;
}
function selectedReviews(n,day=localDay()){
  return shuffle(reviewSelection(reviewCandidates(day),n,settings().focus).map(x=>x.key));
}
function weakRows(){
  const measured=Object.entries(state.skills||{}).filter(([k,s])=>s.checks&&describeKey(k)&&
    (s.status==='red'||(s.status!=='green'&&(s.firstWrong||s.hints||s.partials))));
  const historical=Object.entries(state.selfRatings||{}).filter(([k,r])=>r.unknown&&!state.skills?.[k]?.checks&&describeKey(k))
    .map(([k,r])=>[k,{historical:true,unknown:r.unknown,known:r.known}]);
  const priority=s=>s.historical?2+s.unknown:rankSkill(s,localDay()).score;
  return [...measured,...historical].sort((a,b)=>priority(b[1])-priority(a[1]))
    .filter(([k])=>weakFilter==='Все'||describeKey(k).category===weakFilter||(weakFilter==='Сленг'&&describeKey(k).w.id.startsWith('f:')&&Number(describeKey(k).w.id.split(':')[1])>=2));
}
const percent=(n,total)=>total?Math.round(100*n/total)+'%':'—';
function trend(s){
  const h=s.history.filter(x=>x.attempts&&!x.retry);
  if(h.length<4)return 'Мало данных для динамики';
  const n=Math.min(5,Math.floor(h.length/2)),rate=a=>a.filter(x=>x.first).length/n;
  const delta=Math.round(100*(rate(h.slice(-n))-rate(h.slice(-2*n,-n))));
  return (delta>0?'+':'')+delta+' п. п. за последние '+n+' проверок';
}
function difficultVerbs(rows){
 const tally=new Map();
 for(const [key,s] of rows){const {w}=describeKey(key);if(w.type==='verb')tally.set(w.inf,(tally.get(w.inf)||0)+(s.errors||0));}
 const leaders=[...tally].filter(([,n])=>n).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return leaders.length?'<details class="card"><summary>Глаголы с наибольшим числом ошибок</summary>'+leaders.map(([v,n])=>'<p>'+esc(v)+' · '+n+'</p>').join('')+'</details>':'';
}
function weakPage(){
  const rows=weakRows();
  $('view').innerHTML='<div class="content"><h2>Мои слабые слова</h2><label class="field">Материал<select class="input" id="weak-filter">'+['Все','Обычные слова','Глаголы','Спряжения','Разговорные выражения','Сленг','Фразы из фонка'].map(x=>'<option '+(x===weakFilter?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
    (rows.length?'<button class="btn wide" data-errors>Работа над ошибками · '+Math.min(10,rows.length)+'</button>':'<p class="note-box">Пока нет ошибок в этой категории. Результаты появятся после проверочных упражнений.</p>')+
    difficultVerbs(rows)+rows.map(([k,s])=>s.historical?'<div class="card"><b>'+esc(describeKey(k).title)+'</b><p>Самооценка в предыдущей версии · не вспомнил '+s.unknown+' · вспомнил '+s.known+'</p></div>':'<div class="card"><b>'+esc(describeKey(k).title)+'</b><p><span class="skill-state '+s.status+'">'+knowledge[s.status]+'</span>'+' · ошибок '+s.errors+' · с первого раза '+percent(s.firstRight,s.checks)+'</p><small>'+trend(s)+'<br>Последний ответ '+s.last+' · следующее повторение '+s.due+'</small></div>').join('')+'</div>';
}
function reviewPage(){
  const n=reviewCandidates().length;
  $('view').innerHTML='<div class="content"><h2>Повторения</h2><div class="card"><p>Доступно для повторения: '+n+'. Акцент на слабых словах — '+settings().focus+'%.</p>'+(n?'<button class="btn wide" data-review-now>Начать повторение</button>':'<button class="btn wide" data-go="learn">Открыть каталог</button>')+'</div><button class="btn secondary wide" data-go="weak">Мои слабые слова</button></div>';
}
function preferencesPage(){
  $('view').innerHTML='<div class="content"><h2>Настройки занятий</h2><div class="card"><label class="field">Акцент на слабых словах<input id="focus-slider" type="range" min="0" max="100" step="10" value="'+settings().focus+'"></label><b id="focus-value"></b><p class="muted">Доля заданий при повторении уже знакомого материала.</p></div><div class="card"><label class="field">Как отвечать<select class="input" id="answer-mode"><option value="card">Карточки с самооценкой</option><option value="typed">Ввод с клавиатуры</option></select></label></div><div id="pace"></div><button class="btn secondary wide" data-go="profile">Прогресс и резервная копия</button></div>';
  $('answer-mode').value=settings().answerMode;focusValue();Bora.paceControl?.();
}
function focusValue(){if($('focus-value'))$('focus-value').textContent=settings().focus+'% слабых · '+(100-settings().focus)+'% остальных';}
Object.assign(Bora.pages,{weak:weakPage,reviews:reviewPage,preferences:preferencesPage});
document.addEventListener('input',e=>{if(e.target.id==='focus-slider'){settings().focus=+e.target.value;focusValue();Bora.refreshToday?.();save();}});
document.addEventListener('change',e=>{if(e.target.id==='weak-filter'){weakFilter=e.target.value;weakPage();}});
document.addEventListener('click',e=>{
 const d=e.target.closest('button')?.dataset;if(!d)return;
 if('errors' in d)beginPractice('Работа над ошибками',weakRows().slice(0,10).map(([k])=>taskForKey(k)),'','review');
 if('reviewNow' in d)beginPractice('Интервальное повторение',selectedReviews(10).map(taskForKey),'','review');
});

document.addEventListener('change',e=>{if(e.target.id==='answer-mode'){settings().answerMode=e.target.value;save();}});
