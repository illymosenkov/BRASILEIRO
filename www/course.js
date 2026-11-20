// All top-level navigation is resolved here. Topic membership and progress stay separate.
const groups=[...foundation,...verbGroups,...topics,...phraseTopics,...funkTopics];
const shelves=[
 ['Основы',foundation],['Глаголы',verbGroups],['Слова по темам',topics],
 ['Повседневные фразы',phraseTopics],['Разговорная речь и фанк',funkTopics]
];
let selectedTopic='',catalogQuery='',topicMode='pt-ru';
const getTopic=id=>groups.find(g=>g.id===id)||getLesson(id);
const returnRoutes=['home','calendar','topic','learn','grammar','reviews','weak'];
Bora.captureReturn=(date,source)=>{
 const route=returnRoutes.includes(screen)?screen:date?'home':source==='grammar'?'grammar':source==='review'?'reviews':'learn';
 return {route,topic:selectedTopic,mode:topicMode,query:catalogQuery,grammar:{...grammarPick},week:calendarWeek,filter:weakFilter};
};
Bora.returnLabel=s=>({
 home:'К сегодняшнему плану',calendar:'Вернуться к календарю',topic:'Вернуться к теме',
 learn:'Вернуться в каталог',grammar:'Вернуться к спряжениям',reviews:'Вернуться к повторениям',weak:'К слабым словам'
})[s.returnTo?.route|| (s.date?'home':s.source==='grammar'?'grammar':s.source==='review'?'reviews':'learn')];
function returnFromPractice(){
 const s=state.practice;
 const context=s?.returnTo||{route:s?.date?'home':s?.source==='grammar'?'grammar':s?.source==='review'?'reviews':'learn'};
 if(context.topic&&getTopic(context.topic))selectedTopic=context.topic;
 if(['pt-ru','ru-pt','guided','quiz','write'].includes(context.mode))topicMode=context.mode;
 if(typeof context.query==='string')catalogQuery=context.query;
 if(context.grammar)Object.assign(grammarPick,context.grammar);
 if(Number.isSafeInteger(context.week))calendarWeek=context.week;
 if(typeof context.filter==='string')weakFilter=context.filter;
 go(context.route==='topic'&&!getTopic(selectedTopic)?'learn':context.route);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-return]'))returnFromPractice();});
function nav(){
 const owner={calendar:'home',topic:'learn',grammar:'learn',weak:'reviews'}[screen]||screen;
 $('nav').innerHTML=[['home','⌂','Сегодня'],['learn','▤','Учиться'],['reviews','↻','Повторить']].map(([id,icon,title])=>
  '<button data-go="'+id+'" '+(owner===id?'class="active" aria-current="page"':'')+'><span aria-hidden="true">'+icon+'</span>'+title+'</button>').join('');
 $('nav').hidden=screen==='practice';
}
function go(route){
 const dest=({blocks:'learn',phrases:'learn',funk:'learn',dictionary:'learn'})[route]||route;
 if(!Bora.pages[dest])return;
 stopVictory();screen=dest;nav();renderSound();Bora.pages[dest]();window.scrollTo(0,0);
}
function todayPage(){
 const p=ensureCalendar(),free=state.practice&&!state.practice.finished&&!state.practice.date;
 $('view').innerHTML='<div class="content today"><div class="today-heading"><h1>Сегодня</h1><span>'+activeStreak()+' дн. подряд</span></div>'+
  '<img class="civic-panorama" src="'+HERO+'" alt="Зелёный Honda Civic в Рио">'+dailyCard(p)+
  '<div class="today-footer"><button class="back" data-go="calendar">Календарь занятий →</button>'+
  (free?'<button class="back" data-resume-practice>Вернуться к тренировке</button>':'')+'</div></div>';
}
function catalogPage(){
 $('view').innerHTML='<div class="content"><h1>Учиться</h1><input id="catalog-search" class="input" type="search" aria-label="Найти слово или тему" placeholder="Найти слово или тему" value="'+esc(catalogQuery)+'"><div id="catalog-list"></div></div>';
 catalogResults();
}
function catalogResults(){
 const query=normalizeRecall(catalogQuery,true);
 const matches=s=>normalizeRecall(s,true).includes(query);
 const renderTopic=g=>'<button class="catalog-topic" data-topic="'+g.id+'"><b>'+esc(g.title)+'</b><small>'+g.words.length+' · '+g.words.filter(w=>seenWord(w.id)).length+' знакомо</small><span>›</span></button>';
 if(query){
  const found=allWords.filter(w=>[w.inf,w.word,w.eu,w.meaning,w.pron].some(s=>s&&matches(s)));
  $('catalog-list').innerHTML=groups.filter(g=>matches(g.title)).map(renderTopic).join('')+(found.length?'<div class="card">'+found.map(materialRow).join('')+'</div>':'<p class="muted">Совпадений среди слов нет.</p>');return;
 }
 $('catalog-list').innerHTML='<button class="catalog-topic grammar-link" data-go="grammar"><b>Глаголы и спряжения</b><small>50 глаголов · формы и практика</small><span>›</span></button>'+
 shelves.map(([name,list])=>'<details class="catalog-shelf"><summary>'+name+'</summary>'+list.map(renderTopic).join('')+'</details>').join('');
}
function materialRow(w){
 return wordRow(w)+'<div class="word-actions"><button class="back" data-material="'+w.id+'">Повторить слово</button>'+
 (paradigms[w.inf]?'<button class="back" data-verb="'+esc(w.inf)+'">Спряжения →</button>':'')+'</div>';
}
function topicBlocks(t){
 const standard=blocks.filter(b=>b.parent===t.id);if(standard.length)return standard;
 const count=Math.ceil(t.words.length/7),rows=[];
 for(let i=0;i<count;i++)rows.push({id:t.id+'.'+i,parent:t.id,ids:t.words.slice(Math.floor(i*t.words.length/count),Math.floor((i+1)*t.words.length/count)).map(w=>w.id)});
 return rows;
}
function topicPage(){
 const t=getTopic(selectedTopic);if(!t){go('learn');return;}
 const list=topicBlocks(t),parent=t.groupId?getTopic(t.groupId):t;
 const scopes=parent.children?.length?'<label class="field">Состав темы<select id="topic-scope" class="input">'+[parent,...parent.children].map((g,i)=>'<option value="'+g.id+'" '+(t.id===g.id?'selected':'')+'>'+(i?'Набор '+i+' · '+g.words.length+' слов':'Вся тема · '+g.words.length+' слов')+'</option>').join('')+'</select></label>':'';
 const modes=[['pt-ru','PT → RU'],['ru-pt','RU → PT'],['guided','С примерами и заданиями'],['quiz','Выбор перевода']];
 if(t.words[0].type==='verb')modes.push(['write','Формы eu']);
 if(!modes.some(([id])=>id===topicMode))topicMode='pt-ru';
 $('view').innerHTML='<div class="content"><button class="back" data-go="learn">← Учиться</button><h1>'+esc(parent.title)+'</h1>'+scopes+
 '<label class="field">Практика<select class="input" id="topic-mode">'+modes.map(([id,s])=>'<option value="'+id+'" '+(id===topicMode?'selected':'')+'>'+s+'</option>').join('')+'</select></label>'+
 list.map((b,i)=>'<button class="catalog-topic" data-unit="'+i+'"><b>'+esc(b.ids.slice(0,2).map(id=>byId.get(id).inf||byId.get(id).word).join(' · '))+'</b><small>'+b.ids.length+' слов'+(state.completedBlocks?.[b.id]?' · пройдено':'')+'</small><span>›</span></button>').join('')+
 '<details class="card"><summary>Все слова темы · '+t.words.length+'</summary>'+t.words.map(materialRow).join('')+'</details></div>';
}
function launchUnit(i){
 const topic=getTopic(selectedTopic),b=topicBlocks(topic)[i];if(!b)return;
 const queue=topicMode==='guided'?lessonQueue(b.ids):b.ids.map(id=>topicMode==='write'?taskForKey(grammarKey(byId.get(id).inf,0,0)):wordTask(id,topicMode==='ru-pt'?'ru-pt':'pt-ru',topicMode==='quiz'?'choice':'recall'));
 beginPractice(topic.title,queue,'','topic');state.practice.blockId=b.id;state.practice.topicId=topic.id;save();
}
const calendarComplete=Bora.complete;
Bora.complete=s=>{
 if(s.blockId&&s.topicId){
  (state.completedBlocks??={})[s.blockId]=true;
  const topic=getTopic(s.topicId);
  if(topic&&topicBlocks(topic).every(b=>state.completedBlocks[b.id])&&getLesson(topic.id))state.completedLevels[topic.id]=true;
 }
 calendarComplete(s);
};
function garagePage(){
 profile();
 const card=$('view').querySelector('.backup-card');
 card.insertAdjacentHTML('beforebegin','<button class="btn secondary wide" data-go="preferences">Настройки обучения</button>'+measuredStats()+
 '<details class="card"><summary>Пройденные уровни · '+Object.keys(state.completedLevels).length+'</summary>'+Object.keys(state.completedLevels).map(id=>'<p>'+esc(getLesson(id)?.title||id)+'</p>').join('')+'</details>');
}
Object.assign(Bora.pages,{home:todayPage,learn:catalogPage,topic:topicPage,profile:garagePage});
document.addEventListener('click',e=>{
 const d=e.target.closest('button')?.dataset;if(!d)return;
 if(d.topic){selectedTopic=d.topic;go('topic');}
 if('unit'in d)launchUnit(+d.unit);
 if(d.verb){grammarPick.verb=d.verb;grammarPick.irregular=false;go('grammar');}
 if(d.material)beginPractice(byId.get(d.material).inf||byId.get(d.material).word,[wordTask(d.material,topicMode==='ru-pt'?'ru-pt':'pt-ru')],'','catalog');
});
document.addEventListener('input',e=>{if(e.target.id==='catalog-search'){catalogQuery=e.target.value;catalogResults();}});
document.addEventListener('change',e=>{
 if(e.target.id==='topic-scope'){selectedTopic=e.target.value;topicPage();}
 if(e.target.id==='topic-mode')topicMode=e.target.value;
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state&&state.calendarDay!==localDay()&&['home','calendar'].includes(screen))go(screen);});
state=bootStorage();
go('home');
