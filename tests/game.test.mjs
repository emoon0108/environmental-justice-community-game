import test from 'node:test';
import assert from 'node:assert/strict';
import { SPACES, FINISH, BOARD, FACT_SPACES, DISASTERS, SOLUTIONS, ORGANIZING, FACTS, makePlayer, newGame, activePlayer, takeAction, previousNormal, factAt, randomInt, shuffle } from '../src/game.js';

const players = () => ['Alex', 'Maya', 'Jordan', 'Sam'].map((name, i) => makePlayer(name, ['leaf', 'water', 'sun', 'flower'][i]));
// A scripted random source: the die returns `roll`, coin flips return `coin`, card draws return `pick`.
const rngFor = ({ roll = 1, coin = 0, pick = 0 } = {}) => max => max === 6 ? roll - 1 : max === 2 ? coin : Math.min(pick, max - 1);
const act = (game, action, rng) => takeAction(game, activePlayer(game).id, action, {}, rng);
const roll = (game, value, extra = {}) => act(game, 'roll', rngFor({ roll: value, ...extra }));
const at = (game, position) => { game.players[game.turn].position = position; return game; };
const firstOf = (type, test = () => true) => BOARD.find(s => s.type === type && test(s)).index;

test('the board has exactly 36 spaces: 18 normal, 9 mystery, and 9 disaster', () => {
  const spaces = BOARD.filter(s => s.index >= 1 && s.index <= SPACES);
  assert.equal(spaces.length, 36);
  assert.equal(BOARD[0].type, 'start'); assert.equal(BOARD[FINISH].type, 'finish'); assert.equal(FINISH, 37);
  const count = type => spaces.filter(s => s.type === type).length;
  assert.equal(count('normal'), 18); assert.equal(count('mystery'), 9); assert.equal(count('disaster'), 9);
  assert.equal(spaces.length, count('normal') + count('mystery') + count('disaster'));
});
test('12 normal spaces show a learning fact and 6 are blank', () => {
  const normal = BOARD.filter(s => s.type === 'normal');
  assert.equal(normal.filter(s => s.fact).length, 12); assert.equal(normal.filter(s => !s.fact).length, 6);
  assert.equal(FACT_SPACES.length, 12); assert.equal(FACTS.length, 12);
});
test('every disaster appears once and has exactly one matching Solution Card', () => {
  const disasterSpaces = BOARD.filter(s => s.type === 'disaster').map(s => s.disaster);
  assert.deepEqual([...disasterSpaces].sort(), DISASTERS.map(d => d.id).sort());
  assert.equal(SOLUTIONS.length, 9);
  for (const d of DISASTERS) {
    const matches = SOLUTIONS.filter(s => s.disaster === d.id);
    assert.equal(matches.length, 1); assert.equal(matches[0].id, d.solution);
  }
});
test('every disaster space has a normal space behind it to move back to', () => {
  for (const s of BOARD.filter(s => s.type === 'disaster')) {
    const back = previousNormal(s.index);
    assert.ok(back > 0 && back < s.index); assert.equal(BOARD[back].type, 'normal');
    for (let i = back + 1; i < s.index; i++) assert.notEqual(BOARD[i].type, 'normal');
  }
});
test('learning facts are randomly scattered across the 12 icon spaces, one fact per space', () => {
  const orders = new Set();
  for (let i = 0; i < 20; i++) {
    const game = newGame(players());
    assert.deepEqual([...game.factOrder].sort(), FACTS.map(f => f.id).sort());
    assert.equal(new Set(FACT_SPACES.map(index => factAt(game, index).id)).size, 12);
    orders.add(game.factOrder.join());
  }
  assert.ok(orders.size > 1, 'fact placement should change between games');
  assert.equal(factAt(newGame(players()), firstOf('mystery')), null);
});
test('a roll moves only the active player 1–6 spaces', () => {
  const original = newGame(players());
  for (let value = 1; value <= 6; value++) {
    const game = roll(original, value);
    assert.equal(game.players[0].position, BOARD[value].type === 'disaster' ? previousNormal(value) : value);
    assert.equal(game.lastRoll, value);
    assert.ok(game.players.slice(1).every(p => p.position === 0));
  }
  assert.equal(original.players[0].position, 0);
});
test('the die only produces values from 1 to 6', () => {
  let game = newGame(players());
  for (let i = 0; i < 300; i++) {
    game = at(game, 0); game.phase = 'roll'; game.event = null;
    const next = act(game, 'roll');
    assert.ok(next.lastRoll >= 1 && next.lastRoll <= 6);
    game = next.event?.outcome === 'choose' ? act(act(next, 'use-card'), 'continue') : next.phase === 'event' ? act(next, 'continue') : next;
  }
});
test('another player cannot act during someone else’s turn', () => {
  const game = newGame(players());
  for (const action of ['roll', 'continue', 'use-card', 'move-back']) assert.throws(() => takeAction(game, game.players[1].id, action), /another player/);
});
test('a blank normal space does nothing and passes the turn', () => {
  const blank = firstOf('normal', s => !s.fact);
  const game = roll(newGame(players()), blank);
  assert.equal(game.players[0].position, blank); assert.equal(game.event, null);
  assert.equal(game.phase, 'roll'); assert.equal(game.turn, 1);
});
test('a learning-fact space shows its fact and continues to the next player', () => {
  const space = FACT_SPACES[0];
  let game = roll(newGame(players()), space);
  assert.equal(game.phase, 'event'); assert.equal(game.event.type, 'fact');
  assert.equal(game.event.fact, factAt(game, space).id);
  assert.deepEqual(game.players[0].facts, [game.event.fact]);
  assert.throws(() => roll(game, 1), /Finish your current turn/);
  game = act(game, 'continue');
  assert.equal(game.turn, 1); assert.equal(game.phase, 'roll'); assert.equal(game.event, null);
});
test('a mystery space can give a Solution Card that the player keeps', () => {
  const space = firstOf('mystery');
  let game = roll(newGame(players()), space, { coin: 0, pick: 0 });
  assert.equal(game.event.type, 'solution'); assert.equal(game.event.card, SOLUTIONS[0].id);
  assert.deepEqual(game.players[0].cards, [SOLUTIONS[0].id]);
  game = act(game, 'continue');
  assert.deepEqual(game.players[0].cards, [SOLUTIONS[0].id]); assert.equal(game.turn, 1);
});
test('a mystery space can give a Community Organizing Card, drawn without repeats', () => {
  const space = firstOf('mystery');
  let game = newGame(players());
  const seen = new Set();
  for (let i = 0; i < ORGANIZING.length; i++) {
    game = roll(at(game, space - 1), 1, { coin: 1, pick: 0 });
    assert.equal(game.event.type, 'organizing'); assert.ok(!seen.has(game.event.card)); seen.add(game.event.card);
    assert.deepEqual(game.players[game.turn].cards, []);
    game = act(game, 'continue');
  }
  assert.equal(seen.size, ORGANIZING.length);
  game = roll(at(game, space - 1), 1, { coin: 1 });
  assert.ok(seen.has(game.event.card), 'the deck reshuffles after every card is drawn');
});
test('players can collect an unlimited number of Solution Cards, including duplicates', () => {
  const space = firstOf('mystery');
  let game = newGame(players().slice(0, 1).concat(players()[1]));
  for (let i = 0; i < 40; i++) {
    game = roll(at(game, space - 1), 1, { coin: 0, pick: i % 9 });
    game = act(game, 'continue');
  }
  assert.equal(game.players[0].cards.length + game.players[1].cards.length, 40);
  assert.equal(game.players[0].cards.filter(id => id === SOLUTIONS[0].id).length, 3);
});
test('a disaster without the matching card moves the player back to the closest normal space', () => {
  const space = firstOf('disaster');
  const game = roll(newGame(players()), space);
  const back = previousNormal(space);
  assert.equal(game.players[0].position, back); assert.equal(game.players[0].setbacks, 1);
  assert.equal(game.event.type, 'disaster'); assert.equal(game.event.outcome, 'moved'); assert.equal(game.event.backTo, back);
  assert.deepEqual(game.move.stops, [space, back]);
  assert.equal(act(game, 'continue').turn, 1);
});
test('holding a different Solution Card does not protect you', () => {
  const space = firstOf('disaster'), d = DISASTERS.find(d => d.id === BOARD[space].disaster);
  const game = newGame(players());
  game.players[0].cards = SOLUTIONS.filter(s => s.id !== d.solution).map(s => s.id);
  const next = roll(game, space);
  assert.equal(next.event.outcome, 'moved'); assert.equal(next.players[0].cards.length, 8);
});
test('a matching Solution Card can be used to stay put, and is then discarded', () => {
  const space = firstOf('disaster'), d = DISASTERS.find(d => d.id === BOARD[space].disaster);
  let game = newGame(players());
  game.players[0].cards = [d.solution, d.solution, 'trees'];
  game = roll(game, space);
  assert.equal(game.event.outcome, 'choose'); assert.equal(game.players[0].position, space);
  assert.throws(() => act(game, 'continue'), /Choose whether/);
  assert.throws(() => roll(game, 1), /Finish your current turn/);
  game = act(game, 'use-card');
  assert.equal(game.event.outcome, 'used'); assert.equal(game.players[0].position, space);
  assert.deepEqual(game.players[0].cards, [d.solution, 'trees']); assert.equal(game.players[0].used, 1);
  assert.throws(() => act(game, 'use-card'), /no disaster/);
  assert.equal(act(game, 'continue').turn, 1);
});
test('a player may keep a matching card and move back instead', () => {
  const space = firstOf('disaster'), d = DISASTERS.find(d => d.id === BOARD[space].disaster);
  let game = newGame(players());
  game.players[0].cards = [d.solution];
  game = act(roll(game, space), 'move-back');
  assert.equal(game.players[0].position, previousNormal(space)); assert.deepEqual(game.players[0].cards, [d.solution]);
  assert.equal(game.event.outcome, 'moved'); assert.deepEqual(game.move.stops, [previousNormal(space)]);
});
test('turns rotate and the round increments after the last player', () => {
  const blank = firstOf('normal', s => !s.fact);
  let game = newGame(players());
  for (let i = 0; i < 4; i++) { assert.equal(game.turn, i); game = roll(at(game, 0), blank); }
  assert.equal(game.turn, 0); assert.equal(game.round, 2);
});
test('the first player to reach the finish line wins and the game ends', () => {
  let game = at(newGame(players()), SPACES - 1);
  game = roll(game, 6);
  assert.equal(game.players[0].position, FINISH); assert.equal(game.status, 'complete'); assert.equal(game.winner, game.players[0].id);
  for (const action of ['roll', 'continue']) assert.throws(() => act(game, action), /not in progress/);
});
test('a full random game always ends with exactly one winner', () => {
  for (let n = 0; n < 25; n++) {
    let game = newGame(players()), safety = 0;
    while (game.status === 'playing' && safety++ < 2000) {
      const ev = game.event;
      const action = game.phase === 'roll' ? 'roll' : ev.type === 'disaster' && ev.outcome === 'choose' ? (randomInt(2) ? 'use-card' : 'move-back') : 'continue';
      game = act(game, action);
    }
    assert.equal(game.status, 'complete'); assert.ok(game.players.some(p => p.id === game.winner && p.position === FINISH));
    assert.equal(game.players.filter(p => p.position === FINISH).length, 1);
  }
});
test('only a host can start a ready online room', () => {
  let game = newGame(players().slice(0, 1), 'online'); assert.throws(() => takeAction(game, game.host, 'start'), /At least two/);
  game.players.push(players()[1]); assert.throws(() => takeAction(game, game.players[1].id, 'start'), /Only the host/);
  game = takeAction(game, game.host, 'start'); assert.equal(game.status, 'playing');
});
test('a local game with no players waits in setup', () => {
  const game = newGame([]); assert.equal(game.status, 'setup');
});
test('names are bounded and characters must be supported', () => {
  assert.throws(() => makePlayer(' ', 'leaf'), /Enter your name/); assert.throws(() => makePlayer('Alex', 'unknown'), /Choose a character/);
  assert.equal(makePlayer('a'.repeat(100), 'leaf').name.length, 24); assert.ok(!makePlayer('<Alex>', 'leaf').name.includes('<'));
});
test('random draws and shuffles stay in range', () => {
  for (let i = 0; i < 1000; i++) { const value = randomInt(6); assert.ok(Number.isInteger(value) && value >= 0 && value <= 5); }
  assert.deepEqual(shuffle([1, 2, 3, 4]).sort(), [1, 2, 3, 4]);
});
test('every card and fact has readable content', () => {
  for (const d of DISASTERS) assert.ok(d.name && d.text.length > 40);
  for (const s of SOLUTIONS) assert.ok(s.name && s.short && s.text.length > 30);
  for (const o of ORGANIZING) assert.ok(o.title && o.text.length > 40 && o.why.length > 20);
  for (const f of FACTS) assert.ok(f.topic && f.text.length > 60);
  assert.equal(new Set([...DISASTERS, ...SOLUTIONS, ...ORGANIZING, ...FACTS].map(x => x.id)).size, 42);
});
