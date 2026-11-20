const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:360,height:780},timezoneId:'Europe/Oslo'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../www/index.html')).href);
 assert.deepEqual(errors,[]);
 const inspect=await page.evaluate(()=>({
 words:allWords.length,unique:new Set(allWords.map(w=>w.id)).size,blocks:blocks.length,
 covers:new Set(blocks.flatMap(b=>b.ids)).size,max:Math.max(...blocks.map(b=>b.ids.length)),
 first:lessonQueue(blocks[0].ids).slice(0,5).map(q=>q.mode),corpus:[verbs.length,topics.length,phraseTopics.length,funkTopics.length]}));
 assert.equal(inspect.words,inspect.unique);assert.equal(inspect.covers,inspect.unique);assert.ok(inspect.max<=7);assert.deepEqual(inspect.first.slice(0,4),['intro','intro','choice','choice']);assert.deepEqual(inspect.corpus,[300,24,16,9]);
 await page.evaluate(()=>go('preferences'));await page.locator('#answer-mode').selectOption('typed');await page.evaluate(()=>go('grammar'));await page.locator('[data-practice-grammar]').click();
 await page.locator('#practice-input').fill('неверно');await page.locator('#practice-answer button').click();
 await page.locator('#practice-input').fill(await page.evaluate(()=>activeTask().answers[0].toUpperCase().normalize('NFD').replace(/\p{M}/gu,'')));await page.locator('#practice-answer button').click();
 assert.equal(await page.evaluate(()=>Object.values(state.skills)[0].firstWrong),1);
 await page.locator('[data-advance]').click();assert.ok(await page.locator('[data-practice-option]').count()>1);
 await page.evaluate(()=>go('preferences'));await page.locator('#focus-slider').fill('80');await page.reload();
 assert.equal(await page.evaluate(()=>settings().focus),80);
 await page.evaluate(()=>go('weak'));assert.ok(await page.locator('[data-errors]').isVisible());
 assert.deepEqual(errors,[]);console.log(inspect,'mobile grammar flow, retention and filters OK.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
