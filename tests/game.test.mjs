import test from 'node:test';
import assert from 'node:assert/strict';
import { FINISH, CARDS, CATEGORIES, makePlayer, newGame, activePlayer, takeAction, categoryAt, randomInt } from '../src/game.js';
const players=()=>['Alex','Maya','Jordan','Sam'].map((name,i)=>makePlayer(name,['leaf','water','sun','flower'][i]));
const spin=(game,roll=6)=>takeAction(game,activePlayer(game).id,'spin',{},max=>max===10?roll-1:0);
const answer=(game,correct=true)=>{const c=CARDS.find(c=>c.id===game.card);return takeAction(game,activePlayer(game).id,'answer',{answer:correct?c.answer:(c.answer+1)%3});};
const next=game=>takeAction(game,activePlayer(game).id,'next');

test('a spin moves only the active neighbor and draws the landed category',()=>{
  const original=newGame(players());const game=spin(original,7);
  assert.equal(original.players[0].position,0);assert.equal(game.players[0].position,7);
  assert.ok(game.players.slice(1).every(p=>p.position===0));
  assert.equal(CARDS.find(c=>c.id===game.card).type,categoryAt(7));assert.equal(game.phase,'card');
});
test('another player cannot spin, answer, or pass the active turn',()=>{
  const game=newGame(players());for(const action of ['spin','answer','next'])assert.throws(()=>takeAction(game,game.players[1].id,action,{answer:0}),/another player/);
});
test('a player must resolve a card before spinning or passing',()=>{
  const game=spin(newGame(players()));assert.throws(()=>spin(game),/Finish your current/);assert.throws(()=>next(game),/Complete your card/);
});
test('answers contribute once to the player and the shared goal',()=>{
  const game=answer(spin(newGame(players())));
  assert.equal(game.players[0].points,5);assert.equal(game.community,5);assert.equal(game.players[0].answered,1);assert.equal(game.players[0].correct,1);
  assert.throws(()=>answer(game),/no question/);
});
test('mistakes still teach and earn participation points',()=>{
  const game=answer(spin(newGame(players())),false);
  assert.equal(game.community,2);assert.equal(game.players[0].correct,0);assert.equal(game.feedback.correct,false);assert.ok(game.feedback.explanation.length>30);
});
test('invalid answers cannot alter the game',()=>{
  const game=spin(newGame(players()));for(const value of [-1,3,0.5,null,'0'])assert.throws(()=>takeAction(game,activePlayer(game).id,'answer',{answer:value}),/Choose an answer/);
});
test('turns rotate and the round increments after the last neighbor',()=>{
  let game=newGame(players());for(let i=0;i<4;i++){assert.equal(game.turn,i);game=next(answer(spin(game)));}
  assert.equal(game.turn,0);assert.equal(game.round,2);
});
test('finished players are skipped while their neighbors keep playing',()=>{
  let game=newGame(players());game.players[0].position=35;game=next(spin(game,10));
  assert.equal(game.players[0].position,FINISH);assert.equal(game.turn,1);
  for(let i=0;i<3;i++)game=next(answer(spin(game,1)));
  assert.equal(game.turn,1);assert.equal(game.status,'playing');
});
test('a complete cooperative game ends only when everyone arrives',()=>{
  let game=newGame(players()),safety=0;
  while(game.status!=='complete'&&safety++<200){game=spin(game,10);if(game.phase==='card')game=answer(game);game=next(game);}
  assert.equal(game.status,'complete');assert.ok(game.players.every(p=>p.position===FINISH));assert.ok(game.players.every(p=>p.answered===3));
  assert.equal(game.community,game.players.reduce((sum,p)=>sum+p.points,0));assert.equal(game.community,80);
});
test('a category deck cycles only after every card is drawn',()=>{
  let game=newGame(players());const seen=new Set();
  const count=CARDS.filter(c=>c.type==='knowledge').length;
  for(let i=0;i<count;i++){game.players[game.turn].position=0;game=spin(game,6);assert.ok(!seen.has(game.card));seen.add(game.card);game=next(answer(game));}
  game.players[game.turn].position=0;game=spin(game,6);assert.ok(seen.has(game.card));assert.equal(seen.size,count);
});
test('every card has a valid answer, explanation, category, and source',()=>{
  assert.equal(new Set(CARDS.map(c=>c.id)).size,CARDS.length);
  for(const c of CARDS){assert.ok(CATEGORIES[c.type]);assert.ok(c.options[c.answer]);assert.ok(c.explanation.length>30);assert.ok(['www.epa.gov','www.cdc.gov'].includes(new URL(c.source).hostname));}
});
test('only a host can start a ready online room',()=>{
  let game=newGame(players().slice(0,1),'online');assert.throws(()=>takeAction(game,game.host,'start'),/At least two/);
  game.players.push(players()[1]);assert.throws(()=>takeAction(game,game.players[1].id,'start'),/Only the host/);
  game=takeAction(game,game.host,'start');assert.equal(game.status,'playing');
});
test('names are bounded and characters must be supported',()=>{
  assert.throws(()=>makePlayer(' ','leaf'),/Enter your name/);assert.throws(()=>makePlayer('Alex','unknown'),/Choose a character/);
  assert.equal(makePlayer('a'.repeat(100),'leaf').name.length,24);assert.ok(!makePlayer('<Alex>','leaf').name.includes('<'));
});
test('random wheel draws stay in their declared range',()=>{
  for(let i=0;i<1000;i++){const value=randomInt(10);assert.ok(Number.isInteger(value)&&value>=0&&value<=9);}
});
