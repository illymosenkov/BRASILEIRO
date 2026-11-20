const tenses = [
  ['Presente do Indicativo', 'A1', 'сейчас или обычно'],
  ['Pretérito Perfeito', 'A2', 'завершённое действие'],
  ['Pretérito Imperfeito', 'A2', 'фон или привычка в прошлом'],
  ['Futuro do Presente', 'B1', 'простое будущее'],
  ['Futuro do Pretérito', 'B1', 'условие или вежливость'],
  ['Presente do Subjuntivo', 'B1', 'желание или возможность'],
  ['Ir + infinitivo', 'A2', 'планы на будущее']
];
const people = ['eu','você','ele/ela','nós','vocês','eles/elas','a gente'];
const slots = [0,1,1,2,3,3,1];
const irregular = new Set('ser estar ter ir fazer querer poder dizer saber ver vir dar pôr dormir sair trazer pedir ouvir sentir ler'.split(' '));
const formOf = (v,t,p) => t === 6 ? paradigms.ir[0].split(' ')[slots[p]] + ' ' + v : paradigms[v][t].split(' ')[slots[p]];
const grammarKey = (v,t,p) => ['form',v,t,p].join('|');
const modeNames = {recall:'Вспомни форму',translate:'Переведи предложение',choice:'Выбери форму',fix:'Исправь ошибку',mix:'Смешанная тренировка'};
const grammarPick = {verb:'fazer', tense:0, mode:'mix', irregular:false, level:'A1'};
const levelTenses = {A1:[0], A2:[0,1,2,6], B1:[0,1,2,6,4,5,3], B2:[0,1,2,6,4,5,3]};
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
const pickOne = a => a[Math.floor(Math.random()*a.length)];
function formTask(v,t,p,mode,advanced=false) {
  const [tail,ruNow,ruPast,ruInf] = verbContexts[v];
  const subj = people[p].split('/')[0];
  const right = formOf(v,t,p);
  const prefix = ['Normalmente,','Ontem,','Naquela época,','No próximo ano,','Se pudesse,','Talvez','Amanhã,'][t];
  const context = advanced ? ['Pelo que sei,','Segundo a Ana, ontem','Quando era criança,','Pelo que foi combinado, amanhã','Se tivesse a oportunidade,','É possível que','Pelo que combinamos, amanhã'][t] : prefix;
  const frame = context+' '+subj+' ___ '+tail+'.';
  const distractors = shuffle([...new Set([...people.map((_,j)=>formOf(v,t,j)),...tenses.map((_,j)=>formOf(v,j,p))])].filter(x=>x!==right && normalizeRecall(x,true)!==normalizeRecall(right,true)));
  const base = {key:grammarKey(v,t,p), mode, label:v+' · '+people[p]+' · '+tenses[t][0], answers:[right], hint:byId.get('v:'+v).meaning, explanation:frame.replace('___',right), prompt:'Напиши форму для '+people[p]+'.'};
  if(mode==='choice') return {...base,prompt:frame,options:shuffle([right,...distractors.slice(0,3)])};
  if(mode==='fix') return {...base,prompt:'Исправь выделенную форму',context:frame.replace('___','【'+distractors[0]+'】'),answers:[right,frame.replace('___',right)]};
  if(mode==='translate') {
    // Prompts explicitly name the target tense so other possible tenses remain distinguishable.
    const stems=[cap(ruNow)+'.','Я '+ruPast+' вчера.','Раньше '+ruNow.replace(/^я /,'я обычно ')+'.','В будущем я буду '+ruInf+'.','Я бы '+ruPast+'.','Возможно, '+ruNow+'.','Я собираюсь '+ruInf+'.'];
    const imperfect = grammarImperfect[v];
    const prompt=t===2?'Раньше '+imperfect+'.':t===3?'Переведи в простом будущем: '+ruInf+' (я).':stems[t];
    const f=formOf(v,t,0), core=f+' '+tail;
    const answers = t===1?['Eu '+core+' ontem','Ontem eu '+core,core+' ontem','Ontem '+core]:
      t===5?['Talvez eu '+core,'Talvez '+core]:t===2?['Antes eu '+core,'Antes '+core,'Antigamente eu '+core,'Eu '+core+' antes','Antigamente '+core]:['Eu '+core,core];
    if(t===5) answers.push('É possível que eu '+core,'Pode ser que eu '+core);
    if(t===2) answers.push('Eu '+core+' antigamente');
    if(t===4) answers.push('Se pudesse eu '+core);
    if(v==='fazer'&&t===1) answers.push('Eu fiz isto ontem','Ontem eu fiz isto');
    return {...base,key:grammarKey(v,t,0),label:v+' · eu · '+tenses[t][0],prompt,answers,hint:'Начало: '+answers[0].split(' ').slice(0,2).join(' '),explanation:answers[0]+'.'};
  }
  return base;
}
const grammarImperfect = Object.fromEntries(Object.keys(verbContexts).map((v,i)=>[v,[
'я был местным','я был дома','у меня было время','я ходил на пляж','я делал это','я хотел кофе','я мог помочь','я говорил правду','я знал ответ','я видел море','я приходил сюда','я проводил урок','я накрывал на стол','я разговаривал с Аной','я ел рис','я пил воду','я рано ложился спать','я жил в Бразилии','мне нравилась музыка','мне нужна была помощь','я понимал вопрос','я знал город','я находил ключ','я думал об этом','я работал дома','я учил португальский','я покупал хлеб','я продавал книги','я приходил рано','я выходил из дома','я заходил в магазин','я возвращался домой','я оставался дома','я заходил в булочную','я оставлял сообщение','я садился на автобус','я брал с собой телефон','я приносил кофе','я просил счёт','я слушал музыку','я скучал','я встречал Ану','я вызывал такси','я ждал автобус','я начинал курс','я заканчивал курс','я открывал дверь','я закрывал окно','я писал сообщение','я читал книгу'][i]]));
function pronunciationClue(v,t,p){
  const form=formOf(v,t,p),w=byId.get('v:'+v);
  if(t===0&&p===0)return 'эу '+w.euPron;
  if(t===6)return ['воу','вай','вай','ВА-мус','ва̃у','ва̃у','вай'][p]+' '+w.pron;
  if(/[ãõ]/.test(form))return 'Носовой звук в '+(form.match(/(?:ão|õe|ãe|ã|õ)/)||[''])[0];
  if(/[áéíóúêôâ]/.test(form))return 'Ударение на '+form.match(/[áéíóúêôâ]/)[0];
  if(form.includes('ç'))return 'ç читается как «с»';
  return '';
}
function formRow(v,t,p){
  const s=state.skills?.[grammarKey(v,t,p)],status=s?.status||'neutral',clue=pronunciationClue(v,t,p);
  return '<div class="settings-row"><span>'+people[p]+'<small class="skill-state '+status+'">'+knowledge[status]+'</small></span><span><b>'+formOf(v,t,p)+'</b>'+(clue?'<small class="skill-pron">'+esc(clue)+'</small>':'')+'</span></div>';
}
function selectedGrammarVerbs(){
 const g=grammarPick, selected=g.selected||[g.verb];
 return [...new Set(selected)].filter(v=>verbContexts[v]&&(!g.irregular||irregular.has(v)));
}
function grammarPage() {
  const g=grammarPick, list=Object.keys(verbContexts).filter(v=>!g.irregular||irregular.has(v));
  if(!list.includes(g.verb)) g.verb=list[0];
  const chosen=selectedGrammarVerbs();
  const v=g.verb,w=byId.get('v:'+v);
  const select=(id,label,options,value)=>'<label class="field">'+label+'<select class="input" data-grammar="'+id+'">'+options.map(([k,s])=>'<option value="'+k+'" '+(k==value?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></label>';
  const known=people.filter((_,p)=>state.skills?.[grammarKey(v,g.tense,p)]?.checks).length;
  $('view').innerHTML='<div class="content"><h2>Глаголы и спряжения</h2><div class="card">'+
    select('level','Уровень',Object.keys(levelTenses).map(k=>[k,k]),g.level)+
    '<label><input type="checkbox" data-grammar="irregular" '+(g.irregular?'checked':'')+'> Только неправильные глаголы</label>'+
    '<details class="grammar-selection"><summary>Глаголы для урока · '+chosen.length+'</summary>'+
    list.map(k=>'<label class="grammar-check"><input type="checkbox" data-grammar-verb="'+k+'" '+(chosen.includes(k)?'checked':'')+'><span>'+esc(k)+' — '+esc(byId.get('v:'+k).meaning)+'</span></label>').join('')+'</details>'+
    '<p class="muted">'+esc(chosen.join(' · ')||'Выбери хотя бы один глагол')+'</p>'+
    select('verb','Посмотреть формы глагола',list.map(k=>[k,k+' — '+byId.get('v:'+k).meaning]),v)+
    select('tense','Время',levelTenses[g.level].map(t=>[t,tenses[t][0]+' · '+tenses[t][2]]),g.tense)+
    '<p><b>'+esc(w.meaning)+'</b> · '+(irregular.has(v)?'неправильный':'правильный')+' · '+esc(w.pron)+'</p><p>Eu '+formOf(v,0,0)+' '+verbContexts[v][0]+'.<br>'+cap(verbContexts[v][1])+'.</p><details><summary>Формы · проверено '+known+' из 7</summary>'+
    people.map((_,p)=>formRow(v,g.tense,p)).join('')+
    '<p class="muted">A gente означает «мы» и сочетается с формой третьего лица единственного числа.</p></details></div><div class="card">'+
    select('mode','Упражнение',Object.entries(modeNames),g.mode)+'<button class="btn wide" data-practice-grammar '+(chosen.length?'':'disabled')+'>Начать тренировку</button></div></div>';
}
function startGrammar() {
  const g=grammarPick, selected=selectedGrammarVerbs();
  if(!selected.length){toast('Выбери хотя бы один глагол.');return;}
  const ordered=shuffle(selected);
  const queue=Array.from({length:Math.max(7,selected.length)},(_,i)=>{
    const mode=g.mode==='mix'?['recall','choice','translate','fix'][i%4]:g.mode;
    return formTask(ordered[i%ordered.length],g.tense,i%people.length,mode,g.level==='B2');
  });
  beginPractice('Глаголы и спряжения',queue,'','grammar');
}
document.addEventListener('change', e=>{
  const verb=e.target.dataset.grammarVerb;
  if(verb){
    const selected=new Set(selectedGrammarVerbs());
    if(e.target.checked)selected.add(verb);else selected.delete(verb);
    grammarPick.selected=[...selected];
    settings().grammarVerbs=[...selected];save();grammarPage();return;
  }
  const k=e.target.dataset.grammar;
  if(!k)return;
  grammarPick[k]=k==='irregular'?e.target.checked:k==='tense'?Number(e.target.value):e.target.value;
  if(!levelTenses[grammarPick.level].includes(grammarPick.tense))grammarPick.tense=0;
  grammarPage();
});
