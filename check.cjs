const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/www/index.html','utf8');
const data=JSON.parse(html.match(/<script id="bora-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)][1][1];
const elements=new Map(),saved=new Map();
function el(id){if(!elements.has(id))elements.set(id,{textContent:id==='bora-data'?JSON.stringify(data):'',style:{},innerHTML:'',value:'',setAttribute(){},scrollIntoView(){},querySelector(){return {disabled:false}},focus(){}});return elements.get(id)}
const context=vm.createContext({console,Date,Math,Map,Set,JSON,Number,String,Blob,URL,setTimeout:()=>{},confirm:()=>true,matchMedia:()=>({matches:true}),document:{getElementById:el,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({click(){}})},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},window:{scrollTo(){}},AudioContext:undefined});
vm.runInContext(script,context);
function run(s){return vm.runInContext(s,context)}
assert.equal(run('verbs.length'),300);assert.equal(run('new Set(verbs.map(v=>v.inf)).size'),300);assert.equal(run('topics.length'),24);assert.equal(run('allWords.length'),540);
for(const v of data.verbs)assert.ok(v.inf&&v.eu&&v.meaning&&v.pron&&v.euPron);
assert.equal(run("verbs.find(v=>v.inf==='fazer').eu"),'faco');assert.equal(run("verbs.find(v=>v.inf==='pedir').eu"),'peco');assert.equal(run("verbs.find(v=>v.inf==='dirigir').eu"),'dirijo');
run("start('v0')");assert.equal(run('session.queue.length'),10);
run('submitAnswer(false)');assert.equal(run('session.queue.length'),11);assert.equal(run('state.xp'),0);
run('submitAnswer(true)');assert.equal(run('state.xp'),0,'double-click must not award points');
run('next()');run('submitAnswer(true)');assert.equal(run('state.xp'),10);
run('while(!session.finished){if(!session.answered)submitAnswer(true);else next()}');
assert.equal(run('session.finished'),true);assert.equal(run('session.firstRight'),9);assert.equal(run('state.xp'),100);assert.equal(run('session.repeats'),1);
assert.equal(run('state.streak'),1);assert.equal(JSON.parse(saved.get('bora_civic_v3')).xp,100);
run("start('v0','flash');reveal();submitAnswer(true)");assert.equal(run('session.index'),1);assert.ok(run('session.lesson.words.some(mastered)'));
run("start('v0','write');document.getElementById('typed').value='';writeAnswer()");assert.equal(run('session.answered'),false);
run("document.getElementById('typed').value='eu '+session.queue[0].w.eu;writeAnswer()");assert.equal(run('session.answered'),true);
assert.equal(run("normalize(' eu FACO ')"),'faco');
run("screen='home';go('dictionary');document.getElementById('search').value='falar';dictionaryResults()");assert.ok(el('word-list').innerHTML.includes('eu falo'));assert.ok(!el('word-list').innerHTML.includes('eu como'));
run("start('n9')");assert.equal(run('session.queue[0].kind'),'meaning');assert.equal(run('session.lesson.words.length'),10);
assert.equal(run("normalize('<script>')"),'<script>');assert.equal(run("esc('<script>')"),'&lt;script&gt;');
console.log('PASS: 300 unique verbs, 240 nouns, forms, pronunciation fields, error requeue, duplicate-answer guard, XP, persistence, cards, typed eu and dictionary search.');

