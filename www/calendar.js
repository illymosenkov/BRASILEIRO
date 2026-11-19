const paceNames={light:['Лёгкий','около 5 мин',3,3],normal:['Обычный','10–15 мин',6,6],intense:['Интенсивный','20–30 мин',12,12]};
const dayLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
const mondayOf=d=>shiftDay(d,-((new Date(d+'T12:00:00').getDay()+6)%7));
const statusNames={planned:'Запланировано',active:'В процессе',done:'Выполнено',missed:'Пропущено',moved:'Перенесено'};
let calendarWeek=0;
function learningProfile(day){
 const recent=Object.values(state.skills||{}).flatMap(s=>s.history.filter(h=>!h.retry&&h.attempts&&dayNumber(day)-dayNumber(h.date)<=14));
 const sessions=new Set(recent.map(h=>h.session)).size;
 const rate=recent.filter(h=>h.first).length/Math.max(1,recent.length);
 const due=reviewCandidates(day).filter(x=>x.overdue>0||state.skills?.[x.key]?.due===day).length;
 const prior=Object.values(state.calendar||{}).filter(p=>p.actual&&p.actual<day).sort((a,b)=>b.actual.localeCompare(a.actual)).slice(0,4);
 const demanding=prior.filter(p=>{
   const ids=new Set(p.blocks.flatMap(b=>b.ids));
   const rows=Object.entries(state.skills||{}).filter(([k])=>ids.has(k.split('|')[1])).flatMap(([,s])=>s.history.filter(h=>h.date===p.actual&&!h.retry&&h.attempts));
   return ids.size>=5&&rows.length>=4&&rows.filter(h=>h.first).length/rows.length<.65;
 }).length>=2;
 const difficult=demanding||(sessions>=2&&recent.length>=6&&rate<.65);
 const strong=sessions>=3&&recent.length>=12&&rate>=.85;
 const grammar=[...new Set(Object.entries(state.skills||{}).filter(([k,s])=>k.startsWith('form|')&&s.streak>=2).map(([k])=>k.split('|')[2]))];
 return {difficult,strong,due,grammar};
}
function routeBlocks(day){
 const weekday=new Date(day+'T12:00:00').getDay();
 const order=[
 ['p0','base0','g0'],['g0','base0','g1'],['p0','p1','g1'],['n0','n1','base1'],
 ['p2','base0','g0'],['base0','base1','g2'],['p14','f0','f1']
 ][weekday];
 if(!Object.keys(state.words).length&&!Object.keys(state.exposure||{}).length){
   order.unshift('base0','p0','g0');
 }
 const preferred=blocks.filter(b=>order.includes(b.parent)).sort((a,b)=>order.indexOf(a.parent)-order.indexOf(b.parent));
 return [...preferred,...blocks.filter(b=>!preferred.includes(b))];
}
function planFor(day,reserved=new Set()){
 const setting=settings().intensity,pace=paceNames[setting],profile=learningProfile(day);
 const weekend=new Date(day+'T12:00:00').getDay()===0;
 let capacity=weekend?0:pace[2];
 if(profile.difficult||profile.due>=12)capacity=Math.max(weekend?0:2,Math.floor(capacity/2));
 if(profile.strong&&!weekend&&setting==='normal')capacity=7;
 const plan={day,status:'planned',intensity:setting,blocks:[],reviews:[],grammar:[],cursor:0,total:0,optional:weekend,actual:'',carried:[]};
 for(const b of routeBlocks(day)){
   if(!capacity||plan.blocks.length>=(setting==='intense'?2:1))break;
   const ids=b.ids.filter(id=>!seenWord(id)&&!reserved.has(id)).slice(0,capacity);
   if(!ids.length)continue;
   plan.blocks.push({id:b.id,title:b.title,ids});capacity-=ids.length;
 }
 const n=weekend?Math.min(4,pace[3]):pace[3]+(profile.difficult||profile.due>12?3:0);
 plan.reviews=selectedReviews(n,day);
 const knownVerb=plan.blocks.flatMap(b=>b.ids).map(id=>byId.get(id)).find(w=>paradigms[w?.inf])||
   (verbs.find(w=>seenWord(w.id)&&paradigms[w.inf]));
 if(knownVerb&&!weekend){
   const studied=Object.keys(state.skills||{}).filter(k=>k.startsWith('form|')&&state.skills[k].streak>=2).length;
   const tier=studied>=18?[4,5,3]:studied>=5?[1,2,6]:[0];
   const t=profile.difficult?0:tier[(new Date(day+'T12:00:00').getDate()-1)%tier.length];
   plan.grammar=[grammarKey(knownVerb.inf,t,0)];
   if(setting!=='light')plan.grammar.push(grammarKey(knownVerb.inf,t,6));
 }
 return plan;
}
function ensureCalendar(day=localDay(),replan=false){
 state.calendar??={};const cal=state.calendar;
 if(state.calendarDay===day&&cal[day]&&!replan)return cal[day];
 const old=cal[day];
 if(!old||old.status==='planned'){
   const today=planFor(day);cal[day]=today;
   const older=Object.values(cal).filter(p=>p.day<day&&['active','planned','missed'].includes(p.status)).sort((a,b)=>a.day.localeCompare(b.day));
   for(const p of older){
     if(p.status==='active'&&!p.paused&&state.practice?.date===p.day)p.paused=state.practice;
     if(p.status!=='missed')p.status='missed';
   }
   // Transfer one small unfinished group, keeping its source date and original record.
   const interrupted=older.find(p=>p.paused?.queue?.slice(p.paused.index).some(q=>q.answers));
   if(interrupted&&!today.optional){
     const todo=[...new Set(interrupted.paused.queue.slice(interrupted.paused.index).filter(q=>q.answers&&!q.solved).map(q=>q.key))].slice(0,Math.min(3,paceNames[today.intensity][3]));
     if(todo.length){
       today.reviews=[...new Set([...todo,...today.reviews])].slice(0,Math.max(todo.length,today.reviews.length));
       today.carried.push({day:interrupted.day,ids:[]});interrupted.status='moved';interrupted.movedTo=day;
     }
   }
   const source=older.find(p=>!p.optional&&p.blocks.some(b=>b.ids.some(id=>!seenWord(id))));
   if(source&&!today.optional&&today.blocks.length){
     const from=source.blocks.find(b=>b.ids.some(id=>!seenWord(id)));
     const ids=from.ids.filter(id=>!seenWord(id)).slice(0,today.blocks[0].ids.length);
     today.blocks[0]={id:from.id,title:from.title,ids};
     today.carried=today.carried.filter(c=>c.day!==source.day);today.carried.push({day:source.day,ids});source.status='moved';source.movedTo=day;
   }else if(old?.carried?.length&&!today.optional&&today.blocks.length){
     const first=old.blocks[0];
     const remaining=first.ids.filter(id=>!seenWord(id)).slice(0,today.blocks[0].ids.length);
     if(remaining.length){today.blocks[0]={...first,ids:remaining};today.carried=old.carried;}
   }
 }
 const reserved=new Set(cal[day].blocks.flatMap(b=>b.ids));
 for(let i=1;i<=6;i++){
   const date=shiftDay(day,i);
   if(!cal[date]||(replan&&cal[date].status==='planned'))cal[date]=planFor(date,reserved);
   cal[date].blocks.forEach(b=>b.ids.forEach(id=>reserved.add(id)));
 }
 state.calendarDay=day;save();return cal[day];
}
function makeDailyQueue(plan){
 const queue=plan.blocks.flatMap(b=>lessonQueue(b.ids));
 const practice=[...plan.reviews.map(key=>{
   const q=taskForKey(key),h=state.skills?.[key]?.history||[];
   const trouble=h.filter(x=>x.errors&&!x.retry).slice(-3);
   if(q.key.startsWith('form|')&&trouble.length>=2){
     const [,v,t,p]=key.split('|');
     if(paradigms[v])return formTask(v,+t,+p,trouble.at(-1).mode==='choice'?'fix':'choice');
   }
   return q;
 }),...plan.grammar.map((k,i)=>{
   const [,v,t,p]=k.split('|');return formTask(v,+t,+p,i?'choice':'recall');
 })];
 // Interleave reviews between short learning sequences.
 practice.forEach((q,i)=>queue.splice(Math.min(queue.length,3+i*4),0,q));
 return queue;
}
function startDay(){
 const p=ensureCalendar();
 if(p.status==='done'){go('calendar');return;}
 if(p.status==='active'&&state.practice?.date===p.day&&!state.practice.finished){showPractice();return;}
 if(p.status==='active'&&p.paused){state.practice=p.paused;delete p.paused;save();showPractice();return;}
 const queue=makeDailyQueue(p);
 if(!queue.length){go('blocks');return;}
 p.status='active';p.total=queue.length;beginPractice(p.blocks[0]?.title||'Свободное повторение',queue,p.day);
}
function dailyCard(p){
 const fresh=p.blocks.flatMap(b=>b.ids).length;
 const text=p.blocks.map(b=>esc(b.title)).join(' + ')||(p.optional?'Воскресенье · отдых или короткое повторение':'Закрепляем знакомое');
 return '<div class="card daily"><div class="eyebrow">'+esc(dayLabel(p.day))+'</div><h2>'+text+'</h2><p>'+paceNames[p.intensity][1]+' · новых слов '+fresh+' · повторений '+p.reviews.length+(p.grammar.length?' · форм '+p.grammar.length:'')+'</p><div class="bar"><i style="width:'+(p.total?100*p.cursor/p.total:0)+'%"></i></div><p>'+statusNames[p.status]+(p.total?' · '+p.cursor+' из '+p.total:'')+'</p><button class="btn wide" data-day>'+({done:'Посмотреть неделю',active:'Продолжить обучение'}[p.status]||(p.optional&&!p.reviews.length?'Выбрать необязательную тему':'Начать обучение'))+'</button></div>';
}
function calendarPage(){
 ensureCalendar();const first=shiftDay(mondayOf(localDay()),7*calendarWeek),days=Array.from({length:7},(_,i)=>shiftDay(first,i));
 const completed=Object.values(state.calendar).filter(p=>p.actual&&days.includes(p.actual)).length;
 $('view').innerHTML='<div class="content"><h2>Мой учебный план</h2><div class="settings-row"><button class="back" data-week="-1">← Раньше</button><b>'+first+'</b><button class="back" data-week="1">Позже →</button></div><p>За неделю выполнено уроков: '+completed+'. Дней занятий: '+days.filter(d=>state.days[d]).length+'.</p>'+
 days.map(day=>{
  const p=state.calendar[day];
  if(!p)return '<div class="row"><b>'+dayLabel(day)+'</b><small> · Пока нет плана</small></div>';
  return '<details class="card" '+(day===localDay()?'open':'')+'><summary>'+dayLabel(day)+' · '+statusNames[p.status]+'</summary><p>'+esc(p.blocks.map(b=>b.title).join(' + ')||(p.optional?'Отдых / необязательное повторение':'Повторение'))+'</p><small>Новых: '+p.blocks.flatMap(b=>b.ids).length+' · повторений: '+p.reviews.length+'</small>'+
  (p.actual?'<p>Выполнено '+p.actual+'</p>':'')+(p.movedTo?'<p>Перенос на '+p.movedTo+'</p>':'')+(p.carried.length?'<p>Материал от '+p.carried.map(x=>x.day).join(', ')+'</p>':'')+(day===localDay()&&p.status!=='done'?'<button class="btn wide" data-day>Открыть занятие</button>':'')+'</details>';
 }).join('')+'</div>';
}
Bora.pages.calendar=calendarPage;
Bora.refreshToday=()=>{
 const day=localDay(),p=state.calendar?.[day];
 if(!p||p.status!=='planned')return;
 if(p.blocks.some(b=>b.ids.some(seenWord)))ensureCalendar(day,true);
 else p.reviews=selectedReviews(paceNames[p.intensity][3],day);
};
Bora.complete=s=>{if(!s.date)Bora.refreshToday();if(s.date&&state.calendar?.[s.date]){const p=state.calendar[s.date];p.status='done';p.actual=localDay();p.cursor=p.total=s.queue.length;delete p.paused;}};
Bora.paceControl=()=>{$('pace').innerHTML='<div class="card"><label class="field">Интенсивность<select class="input" id="intensity">'+Object.entries(paceNames).map(([k,[name,time]])=>'<option value="'+k+'" '+(k===settings().intensity?'selected':'')+'>'+name+' · '+time+'</option>').join('')+'</select></label></div>';};
document.addEventListener('change',e=>{if(e.target.id==='intensity'){settings().intensity=e.target.value;ensureCalendar(localDay(),true);save();}});
document.addEventListener('click',e=>{const d=e.target.closest('button')?.dataset;if(!d)return;if('day'in d)startDay();if('week'in d){calendarWeek+=Number(d.week);calendarPage();}});
