const {app,assert}=require('./dom.cjs');
const a=app();
try {
  assert.equal(a.run('byId.size'),773);
  assert.ok(a.run('blocks.every(b=>b.ids.every(id=>byId.has(id)))'));
  assert.ok(a.run('packs.every(p=>p.words.every(w=>byId.get(w.id)===w))'));
  assert.equal(a.run("new Set([wordKey('v:fazer','pt-ru'),wordKey('v:fazer','ru-pt'),grammarKey('fazer',0,0),grammarKey('fazer',1,0)]).size"),4);
  assert.equal(a.run("byId.get('n:10:5').meaning"),'домкрат');
  assert.equal(a.run("byId.get('n:23:7').meaning"),'обезьяна');
  console.log('Identity: 773 entries, pack and block references, two meanings of macaco and separate skills verified.');
} finally {a.dom.window.close();}
