const STORE='bora_civic_v51', PREVIOUS=STORE+'_previous', V50='bora_civic_v5', LEGACY='bora_civic_v3';
let storageBlocked=false;
function checkedState(input){
 const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),num=v=>Number.isSafeInteger(v)&&v>=0;
 const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&shiftDay(v,0)===v;
 const optDate=v=>v===''||date(v);
 const valid=(b)=>{if(!b)throw Error('Некорректная структура копии');};
 const str=v=>typeof v==='string';
 const dict=(v,fn)=>{valid(obj(v));for(const [k,x] of Object.entries(v))valid(fn(k,x));};
 const key=k=>{if(!str(k))return false;const [kind,id,t,p,...rest]=k.split('|');
   if(kind==='cloze')return byId.get(id)?.type==='phrase'&&t==='ru-pt'&&p===undefined;
   if(kind==='word')return byId.has(id)&&['ru-pt','pt-ru'].includes(t)&&p===undefined;
   return kind==='form'&&byId.has('v:'+id)&&/^[0-6]$/.test(t)&&/^[0-6]$/.test(p)&&!rest.length&&(!!paradigms[id]||(t==='0'&&p==='0'));};
 const task=q=>obj(q)&&key(q.key)&&str(q.mode)&&str(q.prompt)&&str(q.label)&&
   (q.mode==='intro'||(Array.isArray(q.answers)&&q.answers.length>0&&q.answers.every(str)))&&
   (!q.options||Array.isArray(q.options)&&q.options.every(str))&&
   ['hint','context','explanation','trial'].every(k=>q[k]===undefined||str(q[k]))&&
   ['retry','solved','skipped','hinted','flipped','loggedActivity'].every(k=>q[k]===undefined||typeof q[k]==='boolean')&&
   (q.rating===undefined||['right','partial','wrong'].includes(q.rating))&&(q.errors===undefined||num(q.errors));
 const returnContext=c=>c===undefined||(obj(c)&&['home','calendar','topic','learn','grammar','reviews','weak'].includes(c.route)&&
   ['topic','mode','query','filter'].every(k=>c[k]===undefined||str(c[k]))&&
   (c.week===undefined||Number.isSafeInteger(c.week))&&
   (c.grammar===undefined||obj(c.grammar)&&Object.keys(verbContexts).includes(c.grammar.verb)&&Object.hasOwn(levelTenses,c.grammar.level)&&
    Object.hasOwn(modeNames,c.grammar.mode)&&typeof c.grammar.irregular==='boolean'&&num(c.grammar.tense)&&c.grammar.tense<=6));
 const run=s=>obj(s)&&returnContext(s.returnTo)&&str(s.id)&&str(s.title)&&optDate(s.date)&&typeof s.finished==='boolean'&&Array.isArray(s.queue)&&s.queue.length>0&&
   s.queue.every(task)&&num(s.index)&&(s.finished?s.index===s.queue.length:s.index<s.queue.length)&&(!s.credited||Array.isArray(s.credited)&&s.credited.every(id=>byId.has(id)));
 valid(obj(input)&&[3,5,6].includes(input.version)&&num(input.xp)&&num(input.streak)&&optDate(input.lastDay)&&
   (input.sound===undefined||typeof input.sound==='boolean'));
 // Guard object map keys before using any imported records for dynamic lookup.
 const guard=x=>{if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){valid(!['__proto__','constructor','prototype'].includes(k));guard(v);}};guard(input);
 dict(input.words,(id,w)=>byId.has(id)&&obj(w)&&num(w.wins)&&num(w.interval)&&date(w.due));
 dict(input.days,(d,x)=>date(d)&&num(x));
 if(input.version===3){
   const migrated={...emptyState(),...input,version:5,skills:{},preferences:defaults(),calendar:{},calendarDay:'',selfRatings:{},exposure:{},completedLevels:{}};
   for(const t of [...packs,...topics,...phraseTopics,...funkTopics])if(t.words.every(w=>input.words[w.id]?.wins>=2))migrated.completedLevels[t.id]=true;
   return checkedState(migrated);
 }
 const s=input;
 valid(obj(s.preferences)&&num(s.preferences.focus)&&s.preferences.focus<=100&&s.preferences.focus%10===0&&Object.hasOwn(paceNames,s.preferences.intensity));
 dict(s.skills,(k,v)=>{
   if(!key(k)||!obj(v)||!['checks','firstRight','firstWrong','errors','attempts','hints','streak','interval','confidence','difficulty'].every(f=>num(v[f])))return false;
   if(v.confidence>100||v.difficulty>100||!Number.isFinite(v.ease)||v.ease<1||v.ease>3||!Object.hasOwn(knowledge,v.status)||!optDate(v.last)||!optDate(v.due)||!Array.isArray(v.history))return false;
   if(!v.history.every(h=>obj(h)&&str(h.id)&&str(h.session)&&date(h.date)&&str(h.mode)&&num(h.attempts)&&num(h.hints)&&num(h.errors)&&h.errors<=h.attempts&&[true,false,null].includes(h.first)&&typeof h.correct==='boolean'&&typeof h.retry==='boolean'))return false;
   const h=v.history, sum=k=>h.reduce((n,e)=>n+e[k],0);
   return new Set(h.map(e=>e.id)).size===h.length&&v.checks===h.filter(e=>!e.retry&&e.attempts).length&&v.firstRight===h.filter(e=>e.first===true).length&&v.firstWrong===h.filter(e=>e.first===false&&e.errors&&!e.retry).length&&v.attempts===sum('attempts')&&v.errors===sum('errors')&&v.hints===sum('hints');
 });
 dict(s.selfRatings,(k,v)=>key(k)&&obj(v)&&num(v.known)&&num(v.unknown));
 dict(s.exposure,(id,d)=>byId.has(id)&&date(d));
 if(s.completedBlocks!==undefined)dict(s.completedBlocks,(id,v)=>/^[a-z]+[0-9]+\.[0-9]+$/.test(id)&&v===true);
 dict(s.completedLevels,(id,v)=>!!getLesson(id)&&v===true);
 if(s.version===6){
   valid(['card','typed'].includes(s.preferences.answerMode));
   for(const skill of Object.values(s.skills)){
     valid(num(skill.partials||0)&&skill.history.filter(h=>!h.retry&&h.firstOutcome==='partial').length===(skill.partials||0));
     for(const h of skill.history){
       if(h.firstOutcome!==undefined)valid(['right','partial','wrong'].includes(h.firstOutcome));
       if(h.method!==undefined)valid(['card','typed','choice'].includes(h.method));
     }
   }
 }
 valid(optDate(s.calendarDay));
 dict(s.calendar,(d,p)=>date(d)&&obj(p)&&p.day===d&&Object.hasOwn(statusNames,p.status)&&Object.hasOwn(paceNames,p.intensity)&&
    typeof p.optional==='boolean'&&num(p.total)&&num(p.cursor)&&p.cursor<=p.total&&optDate(p.actual)&&(p.status==='done'?!!p.actual:!p.actual)&&
    Array.isArray(p.blocks)&&p.blocks.every(b=>obj(b)&&blocks.some(group=>group.id===b.id)&&str(b.title)&&Array.isArray(b.ids)&&b.ids.length<=7&&b.ids.every(id=>byId.has(id)))&&
    Array.isArray(p.reviews)&&p.reviews.every(key)&&Array.isArray(p.grammar)&&p.grammar.every(k=>key(k)&&k.startsWith('form|'))&&
    Array.isArray(p.carried)&&p.carried.every(c=>obj(c)&&date(c.day)&&Array.isArray(c.ids)&&c.ids.every(id=>byId.has(id)))&&
    (!p.movedTo||date(p.movedTo))&&(!p.paused||run(p.paused)&&p.paused.date===d));
 valid(!s.practice||run(s.practice)&&(!s.practice.date||Object.hasOwn(s.calendar,s.practice.date)));
 if(s.version===5)return {...s,version:6,preferences:{...s.preferences,answerMode:'card'}};
 return s;
}
function bootStorage(){
 const candidates=[STORE,PREVIOUS,V50,V50+'_previous',LEGACY];
 for(const key of candidates){
   const raw=localStorage.getItem(key);
   if(raw===null)continue;
   try{
     const parsed=checkedState(JSON.parse(raw));
     if(key!==STORE){
       const damaged=localStorage.getItem(STORE);
       if(damaged!==null)localStorage.setItem(STORE+'_damaged',damaged);
       localStorage.setItem(STORE,JSON.stringify(parsed));
     }
     return parsed;
   }catch{
     // A damaged current snapshot may only fall back to its own previous version.
     if(key===STORE&&localStorage.getItem(PREVIOUS)!==null)continue;
     if(key===V50&&localStorage.getItem(V50+'_previous')!==null)continue;
     storageBlocked=true;break;
   }
 }
 return checkedState(emptyState());
}
function persist(){
 if(storageBlocked){toast('Сохранение приостановлено. Восстанови резервную копию в разделе «Прогресс».');return false;}
 try{localStorage.setItem(STORE,JSON.stringify(state));return true;}catch{toast('Прогресс не записан. Экспортируй копию до закрытия приложения.');return false;}
}
// FNV-1a over the serialized UTF-16 state detects accidental changes in a portable file.
function backupChecksum(value){
 let result=0x811c9dc5;
 for(let i=0;i<value.length;i++)result=Math.imul(result^value.charCodeAt(i),0x01000193);
 return (result>>>0).toString(16).padStart(8,'0');
}
function backupEnvelope(){
 return JSON.stringify({app:'bora-civic',format:2,checksum:backupChecksum(JSON.stringify(state)),state});
}
function restoreChecked(json){
 let incoming;
 try{const data=JSON.parse(json);if(data.app!=='bora-civic'||(data.format!==undefined&&data.format!==2))throw Error();
   if((data.format===2||data.state?.version===6)&&data.checksum!==backupChecksum(JSON.stringify(data.state)))throw Error();
   incoming=checkedState(data.state);}
 catch{toast('Копия повреждена или несовместима. Текущий прогресс сохранён.');return false;}
 if(!confirm('Заменить текущий прогресс данными из резервной копии?'))return false;
 try{
   const prior=localStorage.getItem(STORE);
   if(prior){localStorage.setItem(PREVIOUS,prior);}
   localStorage.setItem(STORE,JSON.stringify(incoming));
 }catch{toast('Недостаточно места для безопасного восстановления.');return false;}
 state=incoming;storageBlocked=false;go('profile');toast('Прогресс восстановлен.');return true;
}
