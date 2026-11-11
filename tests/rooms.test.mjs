import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../worker/index.js';
function fixture() {
  const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_rooms.sql',import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
  const DB={prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null;},async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}};}};}};
  async function call(path,body,token,extra={}){
    const res=await worker.fetch(new Request('https://game.test/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})}),{DB});return {status:res.status,data:await res.json()};
  }
  return {call,db};
}
async function roomWithTwo(call) {
  const host=(await call('rooms',{name:'Alex',character:'leaf'})).data;
  const guest=(await call('rooms/'+host.code+'/join',{name:'Maya',character:'water'})).data;
  return {host,guest};
}
test('online rooms persist state and never expose authentication hashes',async()=>{
  const {call,db}=fixture();const {host,guest}=await roomWithTwo(call);
  assert.equal(host.code.length,6);const read=await call('rooms/'+host.code,null,host.token);
  assert.equal(read.status,200);assert.equal(read.data.game.players.length,2);assert.ok(!JSON.stringify(read.data).includes(host.token));assert.ok(!('members' in read.data));
  const row=db.prepare('SELECT members FROM rooms').get();assert.ok(!row.members.includes(host.token));
  assert.equal((await call('rooms/'+host.code)).status,401);assert.equal((await call('rooms/'+host.code,null,'fake')).status,401);db.close();
});
test('online turns are enforced by the server and visible to every neighbor',async()=>{
  const {call,db}=fixture();const {host,guest}=await roomWithTwo(call),path='rooms/'+host.code;
  assert.equal((await call(path+'/action',{action:'start'},guest.token)).status,409);
  assert.equal((await call(path+'/action',{action:'start'},host.token)).status,200);
  assert.equal((await call(path+'/action',{action:'spin'},guest.token)).status,409);
  const spin=await call(path+'/action',{action:'spin',position:35,points:9999},host.token);assert.equal(spin.status,200);
  assert.ok(spin.data.game.players[0].position>=1&&spin.data.game.players[0].position<=10);assert.equal(spin.data.game.community,0);
  const remote=await call(path,null,guest.token);assert.deepEqual(remote.data.game,spin.data.game);db.close();
});
test('room joins reject duplicate names, duplicate pieces, and started games',async()=>{
  const {call,db}=fixture();const {host}=await roomWithTwo(call),path='rooms/'+host.code;
  assert.equal((await call(path+'/join',{name:'alex',character:'sun'})).status,409);
  assert.equal((await call(path+'/join',{name:'Jordan',character:'leaf'})).status,409);
  await call(path+'/action',{action:'start'},host.token);
  assert.equal((await call(path+'/join',{name:'Jordan',character:'sun'})).status,409);db.close();
});
test('simultaneous joins cannot overwrite each other',async()=>{
  const {call,db}=fixture();const host=(await call('rooms',{name:'Alex',character:'leaf'})).data,path='rooms/'+host.code;
  const joined=await Promise.all([call(path+'/join',{name:'Maya',character:'water'}),call(path+'/join',{name:'Jordan',character:'sun'})]);
  assert.deepEqual(joined.map(r=>r.status).sort(),[201,409]);
  const retry=joined[0].status===409?{name:'Maya',character:'water'}:{name:'Jordan',character:'sun'};
  assert.equal((await call(path+'/join',retry)).status,201);assert.equal((await call(path,null,host.token)).data.game.players.length,3);db.close();
});
test('a room is limited to six neighbors',async()=>{
  const {call,db}=fixture();const host=(await call('rooms',{name:'Alex',character:'leaf'})).data,path='rooms/'+host.code;
  for(const [i,character] of ['water','sun','flower','bird','sprout'].entries())assert.equal((await call(path+'/join',{name:'Player '+i,character})).status,201);
  assert.equal((await call(path+'/join',{name:'Extra',character:'leaf'})).status,409);db.close();
});
test('the host role transfers when a host leaves',async()=>{
  const {call,db}=fixture();const {host,guest}=await roomWithTwo(call),path='rooms/'+host.code;
  assert.equal((await call(path+'/leave',{},host.token)).status,200);
  const read=await call(path,null,guest.token);assert.equal(read.data.game.host,guest.playerId);assert.equal(read.data.game.players.length,1);
  assert.equal((await call(path,null,host.token)).status,401);await call(path+'/leave',{},guest.token);assert.equal((await call(path,null,guest.token)).status,404);db.close();
});
test('leaving an active turn releases the turn to the next neighbor',async()=>{
  const {call,db}=fixture();const {host,guest}=await roomWithTwo(call),path='rooms/'+host.code;
  await call(path+'/action',{action:'start'},host.token);await call(path+'/action',{action:'spin'},host.token);await call(path+'/leave',{},host.token);
  const read=await call(path,null,guest.token);assert.equal(read.data.game.phase,'spin');assert.equal(read.data.game.players[read.data.game.turn].id,guest.playerId);
  assert.equal((await call(path+'/action',{action:'spin'},guest.token)).status,200);db.close();
});
test('expired rooms cannot be joined or resumed',async()=>{
  const {call,db}=fixture();const host=(await call('rooms',{name:'Alex',character:'leaf'})).data;
  db.prepare('UPDATE rooms SET updated_at = ? WHERE code = ?').run(Date.now()-25*3600*1000,host.code);
  assert.equal((await call('rooms/'+host.code,null,host.token)).status,404);assert.equal((await call('rooms/'+host.code+'/join',{name:'Maya',character:'water'})).status,404);db.close();
});
test('cross-origin writes and unsupported payloads are rejected',async()=>{
  const {call,db}=fixture();assert.equal((await call('rooms',{name:'Alex',character:'leaf'},null,{Origin:'https://other.test'})).status,403);
  assert.equal((await call('rooms',{name:'Alex',character:'unknown'})).status,400);
  assert.equal((await call('rooms',{name:'Alex',character:'leaf',large:'x'.repeat(9000)})).status,413);db.close();
});
test('the app remains usable when online storage is unavailable',async()=>{
  const res=await worker.fetch(new Request('https://game.test/api/rooms',{method:'POST',body:'{}'}),{});assert.equal(res.status,503);
  const body=await res.json();assert.match(body.error,/Shared-device play/);
});
test('GitHub Pages receives CORS headers, including on error responses',async()=>{
  const req=new Request('https://game.test/api/rooms/ABCDEF',{headers:{Origin:'https://emoon0108.github.io'}});
  const response=await worker.fetch(req,{});
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://emoon0108.github.io');
  const allowed=await worker.fetch(new Request('https://game.test/api/rooms',{method:'OPTIONS',headers:{Origin:'https://emoon0108.github.io'}}),{});
  assert.equal(allowed.status,204);assert.match(allowed.headers.get('Access-Control-Allow-Headers'),/Authorization/);
  const denied=await worker.fetch(new Request('https://game.test/api/rooms',{method:'OPTIONS',headers:{Origin:'https://unrelated.test'}}),{});
  assert.equal(denied.status,403);assert.equal(denied.headers.get('Access-Control-Allow-Origin'),null);
});
