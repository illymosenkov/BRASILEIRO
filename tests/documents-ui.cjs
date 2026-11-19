// Operate the system document picker on the clean Android QA emulator.
const {execFileSync}=require('node:child_process');
const adb=(...args)=>execFileSync('adb',args,{encoding:'utf8'}).trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tapDocumentNode(match){
 let last='';
 for(let i=0;i<8;i++){
  await wait(550);adb('shell','uiautomator','dump','/sdcard/bora-picker.xml');
  last=adb('shell','cat','/sdcard/bora-picker.xml');
  const node=(last.match(/<node\b[^>]+>/g)||[]).find(match);
  if(!node)continue;
  const rect=node.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if(!rect)continue;
  adb('shell','input','tap',String(Math.floor((+rect[1]+ +rect[3])/2)),String(Math.floor((+rect[2]+ +rect[4])/2)));return;
 }
 throw Error('Expected system picker control missing: '+last.slice(-1800));
}
module.exports={tapDocumentNode};
