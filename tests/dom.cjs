const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../www');
const inline=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>'<script>'+fs.readFileSync(path.join(root,f),'utf8')+'</script>');
function app(storage={},date){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e)));
 const dom=new JSDOM(inline,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:true});w.confirm=()=>true;
 if(date){const Real=w.Date;w.Date=class extends Real{constructor(...a){super(...(a.length?a:[date]));}static now(){return new Real(date).getTime();}};}
 for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);
 }});
 assert.deepEqual(errors,[]);const w=dom.window,find=s=>w.document.querySelector(s);
 return {dom,w,errors,run:s=>w.eval(s),find,click:s=>{assert.ok(find(s),s);find(s).click();assert.deepEqual(errors,[]);}};
}
module.exports={app,assert};
if(require.main===module){
 const {dom,run,click,find}=app();
 assert.equal(run('allWords.length'),773);
 assert.equal(run('new Set(blocks.flatMap(b=>b.ids)).size'),773);
 assert.ok(run('blocks.every(b=>b.ids.length<=7)'));
 assert.equal(run("lessonQueue(blocks[0].ids).slice(0,4).map(q=>q.mode).join('/')"),'intro/intro/choice/choice');
 run("go('grammar')");click('[data-practice-grammar]');
 run("gradePractice('неверно');gradePractice(activeTask().answers[0].toUpperCase().normalize('NFD').replace(/\\p{M}/gu,''))");
 assert.equal(run('Object.values(state.skills)[0].firstWrong'),1);
 click('[data-advance]');assert.ok(find('[data-practice-option]'));
 run("go('weak')");click('[data-errors]');
 console.log('DOM: 761 original entries plus 12 foundation entries, full block coverage, gradual introduction, grammar and error training OK.');
 dom.window.close();
}
