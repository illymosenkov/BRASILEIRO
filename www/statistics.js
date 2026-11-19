function measuredStats(){
 const skills=Object.entries(state.skills).filter(([,s])=>s.checks);
 const grouped=new Map();
 const add=(group,right,n)=>{const row=grouped.get(group)||[0,0];row[0]+=right;row[1]+=n;grouped.set(group,row);};
 for(const [k,s] of skills){
  const [kind,id,tense]=k.split('|');add(kind==='form'?tenses[+tense][0]:tense==='ru-pt'?'RU → PT':'PT → RU',s.firstRight,s.checks);
  for(const h of s.history.filter(h=>h.attempts&&!h.retry)){
    const label=({recall:'Вспоминание',write:'Письмо',choice:'Выбор',quiz:'Выбор',fix:'Исправление',translate:'Перевод предложения',cloze:'Пропуски','ru-pt':'Карточка RU → PT','pt-ru':'Карточка PT → RU'})[h.mode]||h.mode;
    add('Упражнение · '+label,Number(h.first===true),1);
  }
 }
 const top=[...grouped.entries()].sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1]);
 return '<div class="card"><h3>С первой попытки</h3>'+(top.length?top.map(([g,[r,n]])=>'<div class="settings-row"><span>'+esc(g)+'</span><b>'+r+' / '+n+' · '+percent(r,n)+'</b></div>').join(''):'<p>Статистика появится после первой проверки.</p>')+'</div>';
}
