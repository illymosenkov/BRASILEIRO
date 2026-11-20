const foundation=[
  ['Личные местоимения',[
    ['eu','я','эу','Eu moro na Noruega.','Я живу в Норвегии.'],['você','ты / вы','во-СЕ','Você trabalha aqui?','Ты здесь работаешь?'],
    ['ele','он','Э-ли','Ele fala português.','Он говорит по-португальски.'],['ela','она','Э-ла','Ela estuda comigo.','Она учится со мной.'],
    ['nós','мы','нос','Nós vamos juntos.','Мы идём вместе.'],['a gente','мы (разговорное)','а ЖЕ̃Н-чи','A gente vai amanhã.','Мы пойдём завтра.']]],
  ['Как описать вещь',[
    ['bom','хороший','бон','O café está bom.','Кофе хороший.'],['ruim','плохой','ху-И̃Н','O sinal está ruim.','Сигнал плохой.'],
    ['grande','большой','ГРАН-джи','O carro é grande.','Машина большая.'],['pequeno','маленький','пе-КЕ-ну','O quarto é pequeno.','Комната маленькая.'],
    ['caro','дорогой','КА-ру','Esse celular é caro.','Этот телефон дорогой.'],['barato','дешёвый','ба-РА-ту','O ingresso é barato.','Билет дешёвый.']]]
].map(([title,items],i)=>({id:'base'+i,title,words:items.map(([word,meaning,pron,example,translation],j)=>({id:'b:'+i+':'+j,type:'basic',word,meaning,pron,example,translation}))}));
for(const g of foundation)for(const w of g.words){allWords.push(w);byId.set(w.id,w);}
const nounNames=[
'Продукты на кухне|Что положить на тарелку','Утром и за обедом|Заказ у стойки','Фрукты на рынке|Для сока и десерта','Комнаты|Части дома','Основная мебель|Что стоит в комнате','Родители и дети|Близкие родственники','Знакомые люди|Люди вокруг нас','По делам в городе|Городские учреждения','Городские маршруты|Как добраться','Устройство машины|Управление и трансмиссия','Инструменты и крепёж|Обслуживание машины','Люди и оплата|Рабочий день','На занятии|Вопросы и язык','Что надеть|Обувь и верхняя одежда','Лицо|Тело и конечности','Симптомы|На приёме','У воды и в горах|В лесу и на берегу','Прогноз|Температура и небо','Части дня и недели|Единицы времени','Сборы и документы|В дороге','Устройства и доступ|Связь и приложения','Музыка на слух|Музыка на сцене','Цена и оплата|После покупки','Домашние животные|Животные вокруг нас'
].map(x=>x.split('|'));
const phraseNames=['Познакомиться|Продолжить разговор','Попросить уточнить|Попросить о помощи','Выбрать напиток|Оформить заказ','За столом|Уточнить и рассчитаться','Подобрать вещь|Решить купить','У кассы|Вернуть товар','Спросить дорогу|Понять маршрут','На автобусе|В такси','Заселиться|Решить вопрос','Начало смены|В течение дня','Объяснить проблему|Обсудить ремонт','На дороге|Помощь с машиной','Назвать симптомы|Лечение и самочувствие','Срочная помощь|Объяснить ситуацию','Договориться|На пути к встрече','Как я себя чувствую|Погода и отдых'].map(x=>x.split('|'));
const blocks=[];
function addBlocks(group,names=[]){
 const count=Math.ceil(group.words.length/7),size=Math.floor(group.words.length/count),extra=group.words.length%count;
 let offset=0;
 for(let i=0;i<count;i++){
  const words=group.words.slice(offset,offset+size+(i<extra?1:0));offset+=words.length;
  const subtitle=names[i]|| (count>1?words.slice(0,2).map(w=>w.inf||w.word).join(' / '):'');
  blocks.push({id:group.id+'.'+i,parent:group.id,title:group.title+(subtitle?' · '+subtitle:''),ids:words.map(w=>w.id)});
 }
}
foundation.forEach(g=>addBlocks(g));verbGroups.forEach(g=>addBlocks(g));topics.forEach((g,i)=>addBlocks(g,nounNames[i]));phraseTopics.forEach((g,i)=>addBlocks(g,phraseNames[i]));funkTopics.forEach(g=>addBlocks(g));
function seenWord(id){
 return !!(state.exposure?.[id]||state.words[id]||state.skills?.[wordKey(id,'ru-pt')]?.checks||state.skills?.[wordKey(id,'pt-ru')]?.checks);
}
const nounExamples={
 'n:0:0':['O pão está quente.','Хлеб горячий.'],'n:0:1':['O arroz está pronto.','Рис готов.'],'n:0:2':['Vou preparar o feijão.','Я приготовлю фасоль.'],
 'n:0:3':['A carne está na geladeira.','Мясо в холодильнике.'],'n:0:4':['O peixe está fresco.','Рыба свежая.'],'n:0:5':['O frango está no forno.','Курица в духовке.'],
 'n:0:6':['Vou cozinhar o ovo.','Я сварю яйцо.'],'n:0:7':['Cadê o queijo?','Где сыр?'],'n:0:8':['A sopa está quente.','Суп горячий.'],'n:0:9':['A salada está pronta.','Салат готов.']
};
function exampleFor(w){
 if(w.example)return [w.example,w.translation];
 if(verbContexts[w.inf])return ['Eu '+formOf(w.inf,0,0)+' '+verbContexts[w.inf][0]+'.',cap(verbContexts[w.inf][1])+'.'];
 if(w.type==='phrase')return [w.word,w.meaning];
 return nounExamples[w.id]||null;
}
function clozeTask(w){
 const ex=exampleFor(w);if(!ex)return null;
 if(verbContexts[w.inf]){
   const q=formTask(w.inf,0,0,'recall');q.mode='cloze';q.prompt=ex[0].replace(formOf(w.inf,0,0),'___');q.context=ex[1];return q;
 }
 const sentence=ex[0],parts=(w.word||'').split(/\s+/);
 const target=w.type==='phrase'?(parts.filter(x=>x.replace(/[^\p{L}]/gu,'').length>=3)[0]||parts[0]).replace(/[^\p{L}-]/gu,''):w.word.replace(/^(o|a|os|as) /,'');
 const at=sentence.toLocaleLowerCase().indexOf(target.toLocaleLowerCase());
 if(at<0||!target)return null;
 return {...wordTask(w.id,'ru-pt'),key:w.type==='phrase'?'cloze|'+w.id+'|ru-pt':wordKey(w.id,'ru-pt'),mode:'cloze',prompt:sentence.slice(0,at)+'___'+sentence.slice(at+target.length),context:ex[1],answers:[target],explanation:sentence};
}
function lessonQueue(ids){
 const queue=[];
 for(let i=0;i<ids.length;i+=2){
  const batch=ids.slice(i,i+2).map(id=>byId.get(id));
  for(const w of batch){
   const ex=exampleFor(w);
   queue.push({key:wordKey(w.id,'pt-ru'),mode:'intro',label:'Знакомство',prompt:(w.inf||w.word)+' — '+w.meaning,context:[w.pron,ex&&ex.join(' — '),w.note].filter(Boolean).join('\n')});
  }
  for(const w of batch)queue.push(wordTask(w.id,'pt-ru','choice'));
  if(i>=2)queue.push(wordTask(ids[i-2],'ru-pt'));
  for(const w of batch.slice().reverse())queue.push(wordTask(w.id,'ru-pt'));
  const application=clozeTask(batch[0]);if(application)queue.push(application);
 }
 return queue;
}
function blocksPage(){
 $('view').innerHTML='<div class="content"><h2>Небольшие темы</h2>'+[...foundation,...verbGroups,...topics,...phraseTopics,...funkTopics].map(g=>'<details class="card"><summary>'+esc(g.title)+'</summary>'+blockButtons(blocks.filter(b=>b.parent===g.id))+'</details>').join('')+'</div>';
}
function blockButtons(list){return list.map(b=>'<button class="chunk" data-block="'+b.id+'"><span><b>'+esc(b.title)+'</b><small>'+b.ids.length+' слов · знакомо '+b.ids.filter(seenWord).length+'</small></span><span>→</span></button>').join('');}
Bora.pages.blocks=blocksPage;
document.addEventListener('click',e=>{
 const id=e.target.closest('[data-block]')?.dataset.block;if(!id)return;
 const b=blocks.find(x=>x.id===id);if(b)beginPractice(b.title,lessonQueue(b.ids));
});
const memoryAdvance=Bora.beforeAdvance;
Bora.beforeAdvance=(s,q)=>{
 if(q.mode==='intro'){state.exposure??={};state.exposure[q.key.split('|')[1]]??=localDay();Bora.onKnowledgeChanged(q.key);}
 memoryAdvance(s,q);
};
