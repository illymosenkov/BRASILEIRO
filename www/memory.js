// Local civil-day arithmetic is independent of UTC offsets and DST.
const dayNumber = day => Date.parse(day+'T12:00:00Z')/86400000;
function shiftDay(day,delta) {
  const date=new Date(day+'T12:00:00');
  date.setDate(date.getDate()+delta);
  return localDay(date);
}
const wordKey=(id,dir)=>'word|'+id+'|'+dir;
function emptySkill(){
  return {checks:0,firstRight:0,firstWrong:0,errors:0,attempts:0,hints:0,streak:0,ease:2.5,interval:0,confidence:0,difficulty:0,status:'neutral',last:'',due:'',history:[]};
}
function recordEvent(model,q,kind,sessionId,day=localDay(),method='typed',source='practice'){
  if(!['hint','right','partial','wrong'].includes(kind))throw Error('Unknown learning result');
  const skills=model.skills??={};
  const s=skills[q.key]??=emptySkill();
  q.trial??=newId();
  let event=s.history.at(-1);
  if(event?.id!==q.trial)event=s.history.find(h=>h.id===q.trial);
  if(!event){
    event={id:q.trial,session:sessionId,date:day,mode:q.mode,method,source,attempts:0,errors:0,hints:0,first:null,correct:false,retry:!!q.retry};
    s.history.push(event);
  }
  if(event.correct||event.closed)return false;
  if(kind==='hint'){if(!event.hints){event.hints=1;s.hints++;}return true;}
  const first=event.attempts===0;
  const outcome=kind==='right'&&event.hints?'partial':kind;
  event.attempts++;s.attempts++;event.lastOutcome=outcome;
  if(kind==='wrong'){event.errors++;s.errors++;}
  else event.correct=kind==='right';
  if(method==='card'||kind==='partial')event.closed=true;
  if(first)event.firstOutcome=outcome;
  if(first&&!event.retry){
    s.checks++;event.first=outcome==='right';
    if(event.first)s.firstRight++;
    if(outcome==='wrong')s.firstWrong++;
    if(outcome==='partial')s.partials=(s.partials||0)+1;
    if(outcome==='right'){
      if(!s.streak||(s.last!==day&&day>=s.due)){
        s.streak++;
        const base=[0,1,3,7,14,30][s.streak];
        s.interval=s.streak<3?base:Math.min(60,Math.max(s.interval+1,Math.round(base?base*s.ease/2.5:s.interval*s.ease)));
        s.ease=Math.min(2.65,s.ease+.035);s.due=shiftDay(day,s.interval);
      }
    }else{
      s.ease=Math.max(1.3,s.ease-(outcome==='partial'?.12:.22));
      s.interval=outcome==='partial'?Math.min(3,Math.floor(s.interval/3)):0;
      s.streak=0;s.due=shiftDay(day,s.interval);
    }
    s.last=day;
  }
  const recent=s.history.filter(h=>!h.retry&&h.attempts).slice(-8);
  const rate=recent.reduce((n,h)=>n+(h.first?1:h.firstOutcome==='partial'?.4:0),0)/Math.max(1,recent.length);
  s.confidence=Math.round(100*rate*Math.min(1,s.streak/3));
  s.difficulty=Math.round(100*(1-rate));
  s.status=!s.checks?'neutral':s.streak>=3&&s.confidence>=70?'green':!s.streak&&event.firstOutcome==='wrong'?'red':s.status==='red'&&event.retry?'red':'yellow';
  return true;
}
Bora.attempt=(q,ok,id)=>recordEvent(state,q,ok?'right':'wrong',id);
Bora.noteHint=(q,id)=>recordEvent(state,q,'hint',id);
function legacyProbe(s,q) {
  if(!q.probe){
    const isForm=!isRecall(s.mode)&&q.kind!=='meaning';
    q.probe={key:isForm?grammarKey(q.w.inf,0,0):wordKey(q.w.id,s.mode==='ru-pt'?'ru-pt':'pt-ru'),mode:s.mode,retry:q.retry};
  }
  s.uid??=newId();return q.probe;
}
function legacyAnswer(s,q,ok){
  const probe=legacyProbe(s,q);
  if(s.revealed){
    state.selfRatings??={};
    const ratings=state.selfRatings[probe.key]??={known:0,unknown:0};
    ratings[ok?'known':'unknown']++;
  }else Bora.attempt(probe,ok,s.uid);
}
function legacyReveal(s,q,typed){
  const probe=legacyProbe(s,q);
  if(typed)Bora.attempt(probe,false,s.uid);
  Bora.noteHint(probe,s.uid);save();
}
Bora.beforeAdvance=(s,q)=>{
  if((!q.errors&&!q.hinted)||q.retry||!q.answers)return;
  const again={...q,retry:true};
  for(const k of ['trial','errors','hinted','solved','skipped'])delete again[k];
  let gap=Math.min(6,s.queue.length-s.index-1);
  // At the end of a short lesson, borrow distinct exercises already seen in it.
  const used=new Set([q.key,...s.queue.slice(s.index+1,s.index+1+gap).map(x=>x.key)]);
  for(const old of s.queue.slice(0,s.index).reverse()){
    if(gap>=5)break;
    if(!old.answers||used.has(old.key))continue;
    used.add(old.key);
    s.queue.push({...old,retry:true,trial:undefined,errors:0,hinted:false,solved:false,skipped:false});
    gap++;
  }
  if(gap)s.queue.splice(s.index+1+gap,0,again);
};
