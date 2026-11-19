import { VERSION, SPACES, FINISH, CALL_TO_ACTION, CHARACTERS, SPACE_TYPES, DISASTERS, SOLUTIONS, ORGANIZING, FACTS, BOARD, FACT_SPACES, disasterById, solutionById, organizingById, factById, previousNormal, makePlayer, newGame, takeAction, activePlayer } from './game.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const API_BASE = document.querySelector('meta[name="game-api"]')?.content || '';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOCAL_KEY = 'common-ground-local-v2', SESSION_KEY = 'common-ground-session-v2', SOUND_KEY = 'common-ground-sound';

// ---------- Icons ----------
const paths = {
  leaf: '<path d="M19 4C10 3 4 7 5 13c1 6 10 8 14-9Z"/><path d="m4 21 10-11"/>',
  sprout: '<path d="M12 21v-9M12 15C4 15 3 10 3 7c7-1 10 3 9 8ZM12 11c0-6 4-8 9-8 1 6-3 10-9 8Z"/>',
  drop: '<path d="M12 3S5 11 5 16a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M8 16a4 4 0 0 0 4 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  flower: '<path d="M12 9C7 1 2 6 7 11c-8 2-5 9 2 5-1 9 7 9 6 0 7 4 10-3 2-5 5-5 0-10-5-2Z"/><circle cx="12" cy="12" r="2"/>',
  bird: '<path d="M3 15c3 1 6 0 7-3 0-7 8-9 9-3l3 1-3 2c-1 7-9 10-16 3Z"/><path d="m5 8 5 4m5-4h.01"/>',
  book: '<path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-10H4v16h16v-6"/>',
  heart: '<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 2 11 8 15 6-4 13-10 8-15Z"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  flag: '<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
  shield: '<path d="m12 2 9 4v6c0 5-5 9-9 10-4-1-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  'volume-off': '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="m22 9-6 6m0-6 6 6"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
  alert: '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
  card: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 6H4a3 3 0 0 0 3 4m10-4h3a3 3 0 0 1-3 4"/>',
  thermometer: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7"/>',
  smog: '<path d="M7 15a4 4 0 1 1 1.5-7.7A5 5 0 0 1 18 9a3 3 0 0 1 0 6Z"/><path d="M4 19h9m3 0h4"/>',
  basket: '<path d="M3 10h18l-2 10H5Z"/><path d="m8 10 4-6 4 6M9 14v3m6-3v3"/>',
  soil: '<path d="M3 8h18M3 13h18M3 18h18"/><path d="m9 8 2 5-2 5m6-10-1 5 2 5"/>',
  snowflake: '<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/><path d="m9 4 3 2 3-2m-6 16 3-2 3 2"/>',
  stump: '<path d="M5 21h14M8 21V11h8v10"/><ellipse cx="12" cy="11" rx="4" ry="1.6"/><path d="m16 7 3-3m-1 5h3"/>',
  'wifi-off': '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/><path d="m3 3 18 18"/>',
  factory: '<path d="M3 21V10l6 4v-4l6 4V5h4v16Z"/><path d="M7 17h2m4 0h2"/>',
  fan: '<rect x="3" y="5" width="18" height="9" rx="2"/><path d="M7 11h10M8 18l-1 3m5-3v3m4-3 1 3"/>',
  lungs: '<path d="M12 4v8m0 0-3 3m3-3 3 3"/><path d="M9 7C5 7 3 13 3 17c0 2 1 3 3 3s3-1 3-3V7Zm6 0c4 0 6 6 6 10 0 2-1 3-3 3s-3-1-3-3V7Z"/>',
  bottle: '<path d="M10 2h4v3l2 3v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-3Z"/><path d="M8 12h8"/>',
  wheat: '<path d="M12 22V8"/><path d="M12 8c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Z"/>',
  house: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  tree: '<path d="M12 22v-6"/><path d="M12 2 5 12h4l-3 4h12l-3-4h4Z"/>',
  library: '<path d="M3 21h18M4 10h16M12 3l9 5H3Z"/><path d="M6 10v8m4-8v8m4-8v8m4-8v8"/>',
  megaphone: '<path d="M3 10v4a1 1 0 0 0 1 1h3l9 5V4L7 9H4a1 1 0 0 0-1 1Z"/><path d="m7 15 1 5h3l-1-4M20 9v6"/>'
};
function icon(name, extra = '') { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + extra + '>' + (paths[name] || paths.leaf) + '</svg>'; }
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
function character(id) { return CHARACTERS.find(c => c.id === id) || CHARACTERS[0]; }
function avatar(player, active = false) { const c = character(player.character); return '<span class="player-avatar ' + (active ? 'active' : '') + '" style="--avatar-color:' + c.color + ';--avatar-light:' + c.light + '">' + icon(c.icon) + '</span>'; }
function readStorage(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
function setStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
const plural = (n, word, many = word + 's') => n + ' ' + (n === 1 ? word : many);
const spaceName = index => index === 0 ? 'the start' : index === FINISH ? 'the finish line' : 'space ' + index;

// ---------- Sound effects (synthesized, so no audio files are needed) ----------
const sound = (() => {
  let context = null, enabled = readStorage(SOUND_KEY, true) !== false;
  function audio() {
    if (!enabled) return null;
    try {
      if (!context) { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return null; context = new AudioContext(); }
      if (context.state === 'suspended') context.resume();
      return context;
    } catch { return null; }
  }
  function tone(freq, at, duration, type = 'sine', volume = 0.1, endFreq) {
    const c = audio(); if (!c) return;
    const t = c.currentTime + at, osc = c.createOscillator(), gain = c.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + 0.012); gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(c.destination); osc.start(t); osc.stop(t + duration + 0.03);
  }
  function rattle(at) {
    const c = audio(); if (!c) return;
    const length = Math.floor(c.sampleRate * 0.035), buffer = c.createBuffer(1, length, c.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    const source = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1500 + Math.random() * 1800; filter.Q.value = 2.2; gain.gain.value = 0.55;
    source.connect(filter).connect(gain).connect(c.destination); source.start(c.currentTime + at);
  }
  return {
    get enabled() { return enabled; },
    toggle() { enabled = !enabled; setStorage(SOUND_KEY, enabled); if (enabled) tone(660, 0, 0.12); return enabled; },
    roll() { for (let i = 0; i < 11; i++) rattle(i * 0.06 + Math.random() * 0.02); },
    step(backward = false) { tone(backward ? 440 : 560, 0, 0.1, 'triangle', 0.1, backward ? 300 : 780); },
    fact() { tone(880, 0, 0.16, 'sine', 0.07); tone(1175, 0.1, 0.26, 'sine', 0.06); },
    card() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.22, 'sine', 0.08)); },
    disaster() { tone(311, 0, 0.32, 'sawtooth', 0.045, 196); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.38, 'triangle', 0.09)); }
  };
})();

// ---------- State ----------
const DEMO_NAMES = ['Player 1', 'Player 2'];
function validGame(g) { return g && g.version === VERSION && Array.isArray(g.players) && g.players.every(p => CHARACTERS.some(c => c.id === p.character) && Array.isArray(p.cards)); }
let game = readStorage(LOCAL_KEY, null);
if (!validGame(game)) game = newGame([]);
let session = readStorage(SESSION_KEY, null);
let online = false, busy = false, polling = false, selectedCharacter = 'leaf', currentModal = '', pollErrors = 0, toastTimer, rollTimer;
let animatedSeq = game.move?.seq ?? 0;
const display = {}; // temporary piece positions while a move animates
const modal = $('#modal');

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('toast-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('toast-visible'), 4500); }
function announce(message) { $('#announcer').textContent = message; }
function isMyTurn() { return !online || activePlayer(game)?.id === session?.playerId; }
function viewer() { return online ? game.players.find(p => p.id === session?.playerId) : activePlayer(game); }
function saveLocal() { if (!online) setStorage(LOCAL_KEY, game); }
function eventLocked() { return currentModal === 'event' && game.status === 'playing' && game.phase === 'event'; }
function showModal(type, content, locked = false) {
  currentModal = type;
  $('#modal-content').innerHTML = content;
  const title = modal.querySelector('h2'); if (title) title.id = 'modal-title';
  modal.querySelectorAll('button:not([type])').forEach(button => { button.type = 'button'; });
  modal.classList.toggle('no-close', locked);
  modal.dataset.kind = type;
  hydrateIcons(modal);
  if (!modal.open) modal.showModal();
  (modal.querySelector('[data-autofocus]') || modal.querySelector('.modal-top .icon-button'))?.focus({ preventScroll: true });
  modal.scrollTop = 0;
}
function closeModal() { if (eventLocked() || (currentModal === 'lobby' && online && game.status === 'lobby')) return; modal.close(); currentModal = ''; }
modal.addEventListener('cancel', e => { if (eventLocked() || (currentModal === 'lobby' && online && game.status === 'lobby')) e.preventDefault(); else currentModal = ''; });
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ---------- Board ----------
// Position 0 is the start, 1–36 are the board spaces, and 37 is the finish line.
const coordinates = [[84,495],[150,495],[216,495],[282,495],[348,495],[414,495],[480,495],[546,495],[612,495],[678,495],[744,495],[810,495],[876,495],[876,429],[876,363],[876,297],[810,297],[744,297],[678,297],[612,297],[546,297],[480,297],[414,297],[348,297],[282,297],[216,297],[150,297],[150,231],[150,165],[216,165],[282,165],[348,165],[414,165],[480,165],[546,165],[612,165],[678,165],[756,165]];
const TILE = {
  normal: { fill: '#fbf6e4', stroke: '#e3d6ae', ink: '#97690f' },
  mystery: { fill: '#e6defa', stroke: '#c5b6ee', ink: '#5a46a6' },
  disaster: { fill: '#fbd9cd', stroke: '#eeae99', ink: '#a63d25' },
  special: { fill: '#4f7f4b', stroke: '#456f42', ink: '#f1f6e9' }
};
function tree(x, y, s = 1, c = '#91b68b') { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cy="18" rx="17" ry="6" fill="#a6b598" opacity=".25"/><path d="M0 17V-8" stroke="#9b9a75" stroke-width="4"/><ellipse cy="-11" rx="15" ry="19" fill="' + c + '"/><ellipse cx="-5" cy="-16" rx="10" ry="14" fill="#c8dbb1" opacity=".38"/></g>'; }
function pine(x, y, s = 1) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cy="16" rx="14" ry="5" fill="#acb89d" opacity=".3"/><path d="M0 17V-4" stroke="#a09b7a" stroke-width="4"/><path d="M0-35-15 2h9L-17 11h34L6 2h9Z" fill="#7fa88b"/><path d="M0-35 0 11h17L6 2h9Z" fill="#6b967b"/></g>'; }
function house(x, y, color = '#d6bb8c', s = 1) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="28" cy="48" rx="40" ry="10" fill="#b7c4a6" opacity=".3"/><path d="M50 4 64 13v33L50 42Z" fill="#d8d0b5"/><rect y="2" width="51" height="41" rx="2" fill="#fff9e8"/><path d="M-7 3 25-21 57 3Z" fill="' + color + '"/><path d="m25-21 14-4 31 26-13 2Z" fill="' + color + '" opacity=".7"/><rect x="22" y="21" width="11" height="22" rx="1" fill="#aab8a3"/><path d="M7 14h9v10H7Zm31 0h9v10h-9Z" fill="#b4d3cd"/><path d="M-1 43h54" stroke="#ece3cc" stroke-width="4"/></g>'; }
function factory(x, y) { return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="34" cy="44" rx="46" ry="8" fill="#b7c4a6" opacity=".3"/><path d="M0 42V18l16 9v-9l16 9v-9l16 9V0h10v42Z" fill="#e6ddd0"/><path d="M48 0h10v6H48Z" fill="#c9b8a6"/><g fill="#d9d4cc" opacity=".8"><circle cx="56" cy="-9" r="7"/><circle cx="66" cy="-18" r="9"/><circle cx="80" cy="-24" r="8"/></g><path d="M8 32h6m8 0h6m8 0h6" stroke="#c4b5a2" stroke-width="3"/></g>'; }
function buildBoard() {
  const route = coordinates.map((c, i) => (i ? 'L' : 'M') + c[0] + ',' + c[1]).join(' ');
  let s = '<rect width="1000" height="620" fill="#eaf0e3"/>';
  s += '<path d="M0 48c65 18 45 99 51 141s43 80 19 143S30 435 55 502s-2 86-17 118H0Z" fill="#c6e0de"/><path d="M11 75c33 50 14 96 25 142s34 66 18 113-41 79-27 121" fill="none" stroke="#deece4" stroke-width="3"/>';
  s += '<path d="M78 563c94 10 149-10 202 0s164-9 217 0 190-5 235-1 160 2 199-27" fill="none" stroke="#e0e8d5" stroke-width="22" stroke-linecap="round"/><path d="M215 358c85-25 146 10 228-9s158-6 207 13 89-14 157 5" fill="none" stroke="#e2e9d7" stroke-width="47" stroke-linecap="round"/>';
  s += '<path d="M800 70c90-16 140 6 146 62s-17 96-58 92-96 6-104-42 0-74 16-112Z" fill="#dde9cf"/>';
  s += tree(94, 103, .8) + tree(113, 63, .6) + pine(172, 74, .8) + house(212, 66, '#c8987f', .94) + house(296, 81, '#a1b2bb', .72) + pine(372, 78, .8) + tree(668, 72, .9) + tree(700, 56, .6) + tree(842, 96, .8) + tree(905, 150, .9) + pine(920, 210, .75) + tree(862, 205, .7);
  s += house(242, 387, '#c29e86', 1) + house(324, 393, '#b6b2cc', .8) + tree(207, 417, .85) + tree(410, 409, .8) + factory(470, 375) + pine(590, 419, .8);
  s += '<g transform="translate(640 365)"><ellipse cx="43" cy="70" rx="62" ry="11" fill="#b9c8a6" opacity=".3"/><rect y="6" width="90" height="58" rx="3" fill="#fbf6e7"/><path d="M-9 8 45-21 100 8Z" fill="#c8957f"/><rect x="34" y="32" width="22" height="32" rx="2" fill="#b0c3a7"/><g fill="#b5d0ca"><path d="M10 25h13v16H10Zm57 0h13v16H67Z"/></g><text x="45" y="21" font-size="6" text-anchor="middle" letter-spacing=".8" fill="#8d8f74">LIBRARY</text></g>';
  s += tree(765, 410, .9) + pine(940, 392, .9) + tree(942, 466, .65) + tree(938, 531, .8) + house(920, 292, '#b2bca2', .7) + tree(118, 377, .7) + tree(101, 434, .8);
  s += '<text x="515" y="92" text-anchor="middle" fill="#6b8465" font-size="11" letter-spacing="2.5" font-weight="600">BUILD FOR EVERYONE</text><text x="515" y="118" text-anchor="middle" fill="#3c5a3d" font-size="22" font-weight="750" letter-spacing="-.6" class="board-title">Leave No One Behind!</text>';
  s += '<path d="' + route + '" fill="none" stroke="#d4dec9" stroke-width="69" stroke-linecap="round" stroke-linejoin="round"/><path d="' + route + '" fill="none" stroke="#f7f8ed" stroke-width="65" stroke-linecap="round" stroke-linejoin="round"/>';
  s += BOARD.map(space => tileMarkup(space)).join('');
  s += '<text x="84" y="548" text-anchor="middle" fill="#5f7d55" font-size="10" font-weight="600" letter-spacing="1">START HERE</text><g id="board-pieces"></g>';
  $('#board').innerHTML = '<svg viewBox="0 0 1000 620" role="group" aria-label="Game board: a start space, 36 spaces, and a finish line">' + s + '</svg>';
}
function spaceLabel(space) {
  if (space.type === 'start') return 'Start';
  if (space.type === 'finish') return 'Finish line';
  if (space.type === 'normal') return 'Space ' + space.index + ': Normal space, ' + (space.fact ? 'learning fact' : 'blank');
  if (space.type === 'mystery') return 'Space ' + space.index + ': Mystery space';
  return 'Space ' + space.index + ': Disaster space, ' + disasterById(space.disaster).name;
}
function tileMarkup(space) {
  const [x, y] = coordinates[space.index], special = space.type === 'start' || space.type === 'finish';
  const t = TILE[special ? 'special' : space.type];
  const glyph = space.type === 'start' ? 'sprout' : space.type === 'finish' ? 'flag' : space.type === 'mystery' ? 'question' : space.type === 'disaster' ? disasterById(space.disaster).icon : space.fact ? 'bulb' : null;
  let out = '<g class="board-tile tile-' + space.type + '" role="button" tabindex="0" data-space="' + space.index + '" aria-label="' + esc(spaceLabel(space)) + '"><title>' + esc(spaceLabel(space)) + '</title>';
  out += '<rect class="tile-base" x="' + (x - 28) + '" y="' + (y - 28) + '" width="56" height="56" rx="10" fill="' + t.fill + '" stroke="' + t.stroke + '" stroke-width="2"/>';
  if (!special) out += '<text class="tile-num" x="' + (x - 22) + '" y="' + (y - 15) + '" font-size="10" font-weight="700" fill="' + t.ink + '">' + space.index + '</text>';
  if (space.type === 'disaster') out += '<g transform="translate(' + (x + 9) + ' ' + (y - 25) + ') scale(.6)" fill="none" stroke="' + t.ink + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + paths.alert + '</g>';
  if (glyph) out += '<g transform="translate(' + (x - 11) + ' ' + (y - (special ? 16 : 8)) + ') scale(.92)" fill="none" stroke="' + t.ink + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths[glyph] + '</g>';
  if (special) out += '<text x="' + x + '" y="' + (y + 20) + '" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="1" fill="' + t.ink + '">' + (space.type === 'start' ? 'START' : 'FINISH') + '</text>';
  return out + '</g>';
}
function renderPieces() {
  const layer = $('#board-pieces'); if (!layer) return;
  const positions = Object.fromEntries(game.players.map(p => [p.id, display[p.id] ?? p.position]));
  layer.querySelectorAll('.board-piece').forEach(el => { if (!positions.hasOwnProperty(el.dataset.player)) el.remove(); });
  game.players.forEach((p, i) => {
    const c = character(p.character), pos = positions[p.id], [x, y] = coordinates[pos] || coordinates[0];
    const together = game.players.filter(a => positions[a.id] === pos), idx = together.findIndex(a => a.id === p.id);
    const dx = together.length > 1 ? (idx % 3 - (Math.min(together.length, 3) - 1) / 2) * 18 : 0;
    const dy = together.length > 3 ? (idx >= 3 ? 12 : -14) : -4;
    const current = i === game.turn && game.status === 'playing';
    let el = layer.querySelector('[data-player="' + p.id + '"]');
    if (!el) { el = document.createElementNS('http://www.w3.org/2000/svg', 'g'); el.setAttribute('class', 'board-piece'); el.dataset.player = p.id; layer.appendChild(el); }
    el.innerHTML = '<title>' + esc(p.name) + ' · ' + esc(spaceName(pos)) + '</title><ellipse cy="17" rx="13" ry="5" fill="#40563a" opacity=".22"/>' + (current ? '<circle class="piece-ring" cy="-2" r="20" fill="none" stroke="' + c.color + '" stroke-width="2.2" stroke-dasharray="4 3"/>' : '') + '<path d="M-9 11 0 19 9 11" fill="' + c.color + '"/><circle cy="-2" r="14" fill="' + c.color + '" stroke="#fffdf3" stroke-width="2.5"/><g transform="translate(-8 -10) scale(.67)" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths[c.icon] + '</g>';
    el.style.transform = 'translate(' + (x + dx) + 'px,' + (y + dy) + 'px)';
    if (current) layer.appendChild(el); // keep the active piece on top
  });
}
async function animateMove(move) {
  if (!move) return;
  if (move.seq === animatedSeq) { delete display[move.player]; renderPieces(); return; }
  animatedSeq = move.seq;
  const mover = game.players.find(p => p.id === move.player); if (!mover) return;
  let pos = move.from;
  for (const [n, stop] of move.stops.entries()) {
    if (n > 0) await wait(450);
    const step = stop > pos ? 1 : -1;
    if (reducedMotion()) { pos = stop; display[mover.id] = pos; renderPieces(); sound.step(step < 0); await wait(200); continue; }
    while (pos !== stop) { pos += step; display[mover.id] = pos; renderPieces(); sound.step(step < 0); await wait(260); }
  }
  delete display[mover.id]; renderPieces();
}

// ---------- Die ----------
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function renderDie(value) {
  const die = $('#die');
  die.innerHTML = value ? Array.from({ length: 9 }, (_, i) => '<span class="' + (PIPS[value].includes(i) ? 'pip' : '') + '"></span>').join('') : '';
  die.classList.toggle('die-empty', !value);
  die.setAttribute('aria-label', value ? 'The die shows ' + value : 'Six-sided die, ready to roll');
}
function startTumble() { $('#die').classList.add('rolling'); sound.roll(); clearInterval(rollTimer); rollTimer = setInterval(() => renderDie(1 + Math.floor(Math.random() * 6)), reducedMotion() ? 400 : 85); }
function stopTumble(value) { clearInterval(rollTimer); $('#die').classList.remove('rolling'); renderDie(value); }

// ---------- Sidebar ----------
function cardChip(id, count = 1) {
  const s = solutionById(id), d = disasterById(s.disaster);
  return '<div class="solution-chip"><span class="chip-icon">' + icon(s.icon) + '</span><span class="chip-text"><strong>' + esc(s.short) + (count > 1 ? ' <span class="chip-count">×' + count + '</span>' : '') + '</strong><span>Stops: ' + esc(d.name) + '</span></span></div>';
}
function groupCards(cards) { const counts = {}; cards.forEach(id => { counts[id] = (counts[id] || 0) + 1; }); return SOLUTIONS.filter(s => counts[s.id]).map(s => [s.id, counts[s.id]]); }
function renderHand() {
  const p = viewer();
  $('#hand-heading').textContent = p ? (online ? 'Your solution cards' : p.name + '’s solution cards') : 'Solution cards';
  $('#hand-count').textContent = p ? p.cards.length : 0;
  $('#hand').innerHTML = !p ? '<p class="empty-note">Players collect Solution Cards from Mystery spaces.</p>' : p.cards.length ? '<div class="chip-list">' + groupCards(p.cards).map(([id, n]) => cardChip(id, n)).join('') + '</div>' : '<p class="empty-note">No Solution Cards yet. Land on a Mystery space to draw one.</p>';
}
function playerStatus(p) {
  if (game.winner === p.id) return 'Reached the finish first!';
  return (p.position === 0 ? 'At the start' : 'Space ' + p.position + ' of ' + SPACES) + ' · ' + plural(p.cards.length, 'card');
}
function render() {
  const current = activePlayer(game), waiting = online && !isMyTurn(), playing = game.status === 'playing';
  const winner = game.players.find(p => p.id === game.winner);
  $('#session-label').textContent = online ? 'Room ' + session.code + ' · ' + game.players.length + ' players' : game.status === 'setup' ? 'Shared device · choose players to begin' : 'Shared device · ' + game.players.length + ' players';
  $('#round-label').textContent = 'ROUND ' + game.round;
  let eyebrow = 'YOUR MOVE', indicator = '', title = '', description = '', label = 'Roll the die', footnote = 'Roll 1–6 and move that many spaces.';
  if (game.status === 'setup') { eyebrow = 'GET STARTED'; indicator = 'SETUP'; title = 'Welcome!'; description = 'Choose 2–6 players and pick a character for each one.'; label = 'Choose players'; footnote = 'New here? Open the Instructions first.'; }
  else if (game.status === 'lobby') { eyebrow = 'GAME ROOM'; indicator = 'LOBBY'; title = 'Gather your players.'; description = 'Share the room code. The host starts when everyone is in.'; label = 'Open game room'; footnote = '2–6 players, each on their own device.'; }
  else if (game.status === 'complete') { eyebrow = 'GAME OVER'; indicator = 'FINISHED'; title = (winner ? winner.name : 'Someone') + ' wins!'; description = 'Every player learned something along the way.'; label = 'See the results'; footnote = CALL_TO_ACTION; }
  else if (waiting) { eyebrow = 'PLAYING NOW'; indicator = 'THEIR TURN'; title = current.name + ' is up.'; description = 'Watch the board. Your turn is coming.'; label = 'Waiting for ' + current.name; footnote = 'The board updates automatically.'; }
  else { indicator = online ? 'YOUR TURN' : current.name.toUpperCase() + '’S TURN'; title = current.name + ', you’re up.'; description = game.phase === 'event' ? 'Finish your turn to pass the die.' : 'Roll the die to see where you land.'; if (game.phase === 'event') label = 'Finish your turn'; }
  if (busy) label = 'Rolling…';
  $('#turn-eyebrow').textContent = eyebrow; $('#turn-indicator').textContent = indicator; $('#turn-title').textContent = title; $('#turn-description').textContent = description;
  $('#roll-label').textContent = label; $('#roll-footnote').textContent = footnote;
  $('#roll-button').disabled = busy || (waiting && playing);
  if (!busy) renderDie(game.lastRoll);
  $('#player-count').textContent = game.players.length;
  $('#players-list').innerHTML = game.players.length ? game.players.map((p, i) => {
    const active = i === game.turn && playing, c = character(p.character);
    return '<div class="player-row' + (active ? ' is-active' : '') + '">' + avatar(p, active) + '<div class="player-meta"><div class="player-name">' + esc(p.name) + (online && p.id === session?.playerId ? '<small>you</small>' : '') + '</div><div class="player-status">' + esc(playerStatus(p)) + '</div><div class="player-progress" style="--avatar-color:' + c.color + '"><span style="width:' + (Math.min(p.position, SPACES) / SPACES * 100) + '%"></span></div></div>' + (active ? '<span class="player-badge">UP NOW</span>' : game.winner === p.id ? '<span class="player-badge winner">WINNER</span>' : '') + '</div>';
  }).join('') : '<p class="empty-note">No players yet. Choose players to set up the board.</p>';
  $('#manage-players').textContent = online ? 'Room' : game.status === 'setup' ? 'Add' : 'Edit';
  renderHand();
  $('#latest-activity').textContent = game.history[0]?.text || 'A new game begins.';
  const soundButton = $('#sound-toggle');
  soundButton.setAttribute('aria-pressed', String(sound.enabled)); soundButton.setAttribute('aria-label', sound.enabled ? 'Sound effects on' : 'Sound effects off'); soundButton.innerHTML = icon(sound.enabled ? 'volume' : 'volume-off');
  renderPieces(); saveLocal();
  if (currentModal === 'lobby' && online) showLobby();
}

// ---------- Event pop-ups ----------
function tag(kind, text) { const icons = { fact: 'bulb', solution: 'card', organizing: 'people', disaster: 'alert', normal: 'bulb', mystery: 'question', finish: 'flag' }; return '<span class="card-tag tag-' + kind + '">' + icon(icons[kind] || 'bulb') + esc(text) + '</span>'; }
function continueButton(p) { return isMyTurn() ? '<button class="button primary-button wide-button" data-action="continue" data-autofocus>Continue to Game ' + icon('arrow') + '</button>' : '<p class="small-note">Waiting for ' + esc(p.name) + ' to continue.</p>'; }
function showEvent() {
  const p = activePlayer(game), ev = game.event;
  if (!ev || game.status !== 'playing') return;
  const where = '<span class="event-where">' + esc(p.name) + ' · Space ' + ev.space + '</span>';
  let body = '';
  if (ev.type === 'fact') {
    const fact = factById(ev.fact);
    body = '<div class="event-head">' + tag('fact', 'Learning fact') + where + '</div><div class="event-illustration fact">' + icon('bulb') + '</div><h2>' + esc(fact.topic) + '</h2><p class="fact-text">' + esc(fact.text) + '</p>' + continueButton(p);
  } else if (ev.type === 'solution') {
    const s = solutionById(ev.card), d = disasterById(s.disaster);
    body = '<div class="event-head">' + tag('mystery', 'Mystery space') + where + '</div><div class="game-card solution-card"><span class="game-card-kind">' + icon('card') + ' SOLUTION CARD</span><div class="game-card-icon">' + icon(s.icon) + '</div><h2>' + esc(s.name) + '</h2><p>' + esc(s.text) + '</p><div class="protects">' + icon('shield') + '<span>Use it on the <strong>' + esc(d.name) + '</strong> Disaster space to avoid moving back.</span></div></div><p class="result-note">' + (isMyTurn() ? 'You keep' : esc(p.name) + ' keeps') + ' this card until ' + (isMyTurn() ? 'you choose' : 'they choose') + ' to use it.</p>' + continueButton(p);
  } else if (ev.type === 'organizing') {
    const o = organizingById(ev.card);
    body = '<div class="event-head">' + tag('mystery', 'Mystery space') + where + '</div><div class="game-card organizing-card"><span class="game-card-kind">' + icon('people') + ' COMMUNITY ORGANIZING CARD</span><h2>' + esc(o.title) + '</h2><p>' + esc(o.text) + '</p><div class="why"><strong>Why it matters</strong><span>' + esc(o.why) + '</span></div></div>' + continueButton(p);
  } else if (ev.type === 'disaster') {
    const d = disasterById(ev.disaster), s = solutionById(d.solution), me = isMyTurn();
    let outcome;
    if (ev.outcome === 'choose') outcome = '<div class="outcome good">' + icon('shield') + '<div><strong>' + (me ? 'You have' : esc(p.name) + ' has') + ' the ' + esc(s.short) + ' card!</strong><span>Use it to stay on space ' + ev.space + '. The card is discarded after use.</span></div></div>' + (me ? '<div class="modal-actions"><button class="button primary-button" data-action="use-card" data-autofocus>' + icon('shield') + ' Use ' + esc(s.short) + ' card</button><button class="button white-button" data-action="move-back">Keep card, move back to ' + esc(spaceName(previousNormal(ev.space))) + '</button></div>' : '<p class="small-note">Waiting for ' + esc(p.name) + ' to decide.</p>');
    else if (ev.outcome === 'used') outcome = '<div class="outcome good">' + icon('check') + '<div><strong>' + (me ? 'You used' : esc(p.name) + ' used') + ' the ' + esc(s.short) + ' card.</strong><span>' + (me ? 'You stay' : esc(p.name) + ' stays') + ' on space ' + ev.space + '. The card has been discarded.</span></div></div>' + continueButton(p);
    else {
      const kept = p.cards.includes(s.id), who = me ? 'You' : esc(p.name), to = esc(spaceName(ev.backTo));
      const headline = kept ? who + ' kept the ' + esc(s.short) + ' card and moved back to ' + to + '.' : (me ? 'You don’t' : who + ' doesn’t') + ' have the ' + esc(s.short) + ' card, so ' + (me ? 'you move' : who + ' moves') + ' back to ' + to + '.';
      const detail = kept ? 'The card stays in ' + (me ? 'your' : esc(p.name) + '’s') + ' hand for later.' : 'The matching Solution Card is <em>' + esc(s.name) + '</em>: ' + esc(s.text);
      outcome = '<div class="outcome bad">' + icon('back') + '<div><strong>' + headline + '</strong><span>' + detail + '</span></div></div>' + continueButton(p);
    }
    body = '<div class="event-head">' + tag('disaster', 'Disaster space') + where + '</div><div class="event-illustration disaster">' + icon(d.icon) + '</div><h2>' + esc(d.name) + '</h2>' + (d.detail ? '<p class="disaster-detail">' + esc(d.detail) + '</p>' : '') + '<p>' + esc(d.text) + '</p>' + outcome;
  }
  showModal('event', body, true);
}
function playEventSound() {
  const ev = game.event; if (!ev) return;
  if (game.status === 'complete') sound.win();
  else if (ev.type === 'fact') sound.fact();
  else if (ev.type === 'solution' || ev.type === 'organizing') sound.card();
  else if (ev.type === 'disaster') ev.outcome === 'choose' ? sound.card() : sound.disaster();
}
function describeMove() {
  // Toast and screen-reader summary after a move, e.g. for blank spaces that have no pop-up.
  const mover = game.players.find(p => p.id === game.move?.player); if (!mover) return;
  const landed = game.move.stops[0], space = BOARD[landed];
  if (game.status === 'complete') { announce(mover.name + ' rolled ' + game.lastRoll + ' and reached the finish line. ' + mover.name + ' wins!'); return; }
  if (space.type === 'normal' && !space.fact) {
    const next = activePlayer(game);
    toast(mover.name + ' landed on blank space ' + landed + '. Nothing happens. ' + next.name + ', you’re up' + (online ? '!' : ' — pass the device.'));
    announce(mover.name + ' rolled ' + game.lastRoll + ' and landed on blank space ' + landed + '. Nothing happens. It is ' + next.name + '’s turn.');
  } else announce(mover.name + ' rolled ' + game.lastRoll + ' and landed on ' + spaceLabel(space) + '.');
}
function showSummary() {
  const winner = game.players.find(p => p.id === game.winner);
  const factsFound = new Set(game.players.flatMap(p => p.facts)).size;
  const used = game.players.reduce((n, p) => n + p.used, 0), organizing = game.players.reduce((n, p) => n + p.organizing, 0);
  showModal('summary', '<div class="summary-illustration">' + icon('trophy') + '</div><div class="summary-heading"><span class="eyebrow centered">WE HAVE A WINNER</span><h2>' + esc(winner?.name || 'A player') + ' reached the finish line first!</h2><p>The race is over, but the learning isn’t. Here’s what your group discovered together.</p></div><div class="score-grid"><div class="score-tile"><strong>' + factsFound + '/' + FACTS.length + '</strong><span>Learning facts found</span></div><div class="score-tile"><strong>' + used + '</strong><span>Solution Cards used</span></div><div class="score-tile"><strong>' + organizing + '</strong><span>Organizing cards read</span></div></div><h3>Every player made progress.</h3>' + game.players.map(p => '<div class="contribution-row">' + avatar(p) + '<div><div class="player-name">' + esc(p.name) + (p.id === game.winner ? ' <span class="player-badge winner">WINNER</span>' : '') + '</div><div class="player-status">' + plural(p.facts.length, 'learning fact') + ' · ' + plural(p.collected, 'Solution Card') + ' collected, ' + p.used + ' used · ' + plural(p.setbacks, 'setback') + '</div></div></div>').join('') + '<h3>Talk it over</h3><ul class="reflection"><li>Which disaster surprised you most? Who is most affected by it in real life?</li><li>Which Solution Card or community action could help your own neighborhood?</li><li>What would it take to build for everyone and leave no one behind?</li></ul><div class="cta-banner">' + esc(CALL_TO_ACTION) + '</div><div class="modal-actions"><button class="button white-button" data-action="download-summary">' + icon('download') + ' Save summary</button>' + (online ? '<button class="button primary-button" data-action="leave-room">Leave room ' + icon('arrow') + '</button>' : '<button class="button primary-button" data-action="rematch" data-autofocus>Play again ' + icon('arrow') + '</button>') + '</div>');
}

// ---------- Information pop-ups ----------
function instructions() {
  showModal('instructions', '<span class="eyebrow">INSTRUCTIONS</span><h2>How to play</h2><p class="modal-intro">Race to the finish line while you learn about environmental justice and how communities solve problems together.</p><ol class="instruction-list">'
    + '<li><div><strong>Choose your players</strong>Play with 2–6 people. Each player picks a name and a character piece. Share one device and pass it around, or play on separate devices with a room code.</div></li>'
    + '<li><div><strong>Take turns rolling</strong>On your turn, press <em>Roll the die</em>. Your piece moves forward the number of spaces shown (1–6). The highlighted player is up.</div></li>'
    + '<li><div><strong>See what happens</strong>The board has 36 spaces of three types:<div class="rule-list"><div class="rule"><span class="legend-swatch normal">' + icon('bulb') + '</span><span><b>Normal spaces (18).</b> 12 have a lightbulb icon. Land on one and a learning fact pops up. Read it, then press <em>Continue to Game</em>. The other 6 are blank: nothing happens, and the next player goes.</span></div><div class="rule"><span class="legend-swatch mystery">' + icon('question') + '</span><span><b>Mystery spaces (9).</b> Draw a card. It is either a Solution Card or a Community Organizing Card, which shows how people can work together to help their community.</span></div><div class="rule"><span class="legend-swatch disaster">' + icon('alert') + '</span><span><b>Disaster spaces (9).</b> An environmental disaster strikes. If you have the matching Solution Card, you can use it to stay where you are. If not, you move back to the closest Normal space behind you.</span></div></div></div></li>'
    + '<li><div><strong>Collect Solution Cards</strong>There’s no limit to how many Solution Cards you can hold. Keep them until you need them. When you use a card on its matching disaster, it is discarded. Your cards appear in the <em>Solution cards</em> panel.</div></li>'
    + '<li><div><strong>Reach the finish line</strong>The first player to reach the finish line wins. Along the way, talk about the issues and solutions you find. The real goal is to build for everyone and leave no one behind.</div></li>'
    + '</ol><button class="text-button" data-action="library" data-type="disasters">' + icon('card') + ' See every disaster and its matching Solution Card</button><button class="button primary-button wide-button" data-action="' + (game.status === 'setup' ? 'players' : 'close') + '" data-autofocus>' + (game.status === 'setup' ? 'Choose players' : 'Back to the game') + ' ' + icon('arrow') + '</button>');
}
function purpose() {
  showModal('mission', '<span class="eyebrow">ABOUT THE GAME</span><h2>Every community deserves a healthy home.</h2><p>Marginalized communities often face more pollution and environmental hazards, with less access to clean water, healthy food, safe infrastructure, and technology. Many young people never learn about these inequalities or how they shape everyday life.</p><h3>Learn by playing</h3><p>Common Ground is a multiplayer board game for middle and high school students. As you move around the board, you’ll face environmental disasters, collect solutions, and discover real facts about environmental justice.</p><h3>Better together</h3><p>Community Organizing Cards show how people work together to protect their neighborhoods. Everyone races to the same finish line, but the bigger win is understanding how to make change.</p><div class="cta-banner">' + esc(CALL_TO_ACTION) + '</div><button class="button primary-button wide-button" data-action="close" data-autofocus>Back to the game ' + icon('arrow') + '</button>');
}
function library(type = 'disasters') {
  const tabs = { disasters: 'Disasters & solutions', organizing: 'Community organizing', facts: 'Learning facts' };
  let content = '';
  if (type === 'disasters') content = DISASTERS.map(d => { const s = solutionById(d.solution), at = BOARD.find(b => b.disaster === d.id).index; return '<div class="pair"><div class="pair-side disaster-side"><span class="pair-icon">' + icon(d.icon) + '</span><div><span class="mini-label">DISASTER · SPACE ' + at + '</span><h3>' + esc(d.name) + '</h3><p>' + esc(d.text) + '</p></div></div><div class="pair-side solution-side"><span class="pair-icon">' + icon(s.icon) + '</span><div><span class="mini-label">MATCHING SOLUTION CARD</span><h3>' + esc(s.name) + '</h3><p>' + esc(s.text) + '</p></div></div></div>'; }).join('');
  else if (type === 'organizing') content = ORGANIZING.map(o => '<div class="library-item"><h3>' + esc(o.title) + '</h3><p>' + esc(o.text) + '</p><p class="why-line"><strong>Why it matters:</strong> ' + esc(o.why) + '</p></div>').join('');
  else {
    const found = new Set(game.players.flatMap(p => p.facts));
    content = '<p class="small-note">' + found.size + ' of ' + FACTS.length + ' facts found this game. The facts are shuffled onto the lightbulb spaces at the start of every game.</p>' + FACTS.map(f => found.has(f.id) ? '<div class="library-item"><span class="mini-label">' + icon('bulb', 'class="inline-icon"') + ' FOUND</span><h3>' + esc(f.topic) + '</h3><p>' + esc(f.text) + '</p></div>' : '<div class="library-item locked"><span class="mini-label">NOT FOUND YET</span><h3>' + icon('bulb', 'class="inline-icon"') + ' Land on a lightbulb space to reveal this fact.</h3></div>').join('');
  }
  showModal('library', '<span class="eyebrow">THE CARDS</span><h2>Know your cards.</h2><div class="mode-tabs library-tabs" role="tablist">' + Object.entries(tabs).map(([key, name]) => '<button role="tab" aria-selected="' + (key === type) + '" class="' + (key === type ? 'active' : '') + '" data-action="library" data-type="' + key + '">' + name + '</button>').join('') + '</div>' + content);
}
function sources() {
  const links = [
    ['https://www.epa.gov/heatislands/learn-about-heat-islands', 'EPA: Learn about heat islands', 'Why cities can be hotter than surrounding areas.'],
    ['https://www.weather.gov/lot/1995_heatwave', 'National Weather Service: the 1995 Chicago heat wave', 'Temperatures, impacts, and lessons from July 1995.'],
    ['https://washdata.org/', 'WHO/UNICEF Joint Monitoring Programme', 'Global data on drinking water and sanitation.'],
    ['https://www.itu.int/itu-d/reports/statistics/facts-figures-2025/', 'ITU: Facts and Figures 2025', 'How many people around the world are online and offline.'],
    ['https://www.ers.usda.gov/data-products/food-access-research-atlas/', 'USDA: Food Access Research Atlas', 'Maps of low-income and low-access areas in the United States.'],
    ['https://www.epa.gov/history/epa-history-love-canal', 'EPA History: Love Canal', 'The story of Love Canal and the public health emergency.'],
    ['https://drought.unl.edu/dustbowl/', 'National Drought Mitigation Center: The Dust Bowl', 'Drought, dust storms, and their effect on families in the 1930s.'],
    ['https://www.canr.msu.edu/dpfli/', 'MSU-Detroit Partnership for Food, Learning and Innovation', 'Urban agriculture research and community food work in Detroit.'],
    ['https://www.epa.gov/sites/default/files/2015-02/documents/ips-final-report.pdf', 'EPA: Environmental justice and public participation', 'A report on fair treatment and meaningful community involvement.']
  ];
  showModal('sources', '<span class="eyebrow">KEEP LEARNING</span><h2>Learning resources</h2><p>The facts in this game come from real data. These resources offer more context for students and teachers.</p><ul class="sources-list">' + links.map(([href, name, desc]) => '<li><a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(name) + '</a><span class="source-description">' + esc(desc) + '</span></li>').join('') + '</ul><div class="game-note">The neighborhood on the board is fictional. Real solutions take local knowledge, funding, and community leadership, and there is no single answer for every place.</div>');
}
function historyIcon(type) { return { start: 'sprout', blank: 'arrow', fact: 'bulb', solution: 'card', organizing: 'people', disaster: 'alert', used: 'shield', finish: 'flag' }[type] || 'activity'; }
function showActivity() { showModal('activity', '<span class="eyebrow">GAME LOG</span><h2>What’s happened so far</h2><div class="history-list">' + game.history.map(h => '<div class="history-item history-' + esc(h.type) + '">' + icon(historyIcon(h.type)) + '<span>' + esc(h.text) + '</span></div>').join('') + '</div>'); }
function inspectSpace(index) {
  const space = BOARD[index], here = game.players.filter(p => p.position === index);
  let body;
  if (space.type === 'start') body = '<span class="eyebrow">START</span><h2>Every player starts here.</h2><p>Roll the die to move onto the board.</p>';
  else if (space.type === 'finish') body = '<span class="eyebrow">FINISH LINE</span><h2>The first player here wins.</h2><p>Any roll that reaches or passes space 36 crosses the finish line.</p>';
  else if (space.type === 'normal') body = tag('normal', 'Normal space') + '<h2>Space ' + index + (space.fact ? ': learning fact' : ': blank') + '</h2><p>' + (space.fact ? 'A learning fact pops up when you land here. Read it, then continue the game.' : 'Nothing happens here. The next player takes their turn.') + '</p>';
  else if (space.type === 'mystery') body = tag('mystery', 'Mystery space') + '<h2>Space ' + index + ': mystery</h2><p>Draw a card: a Solution Card to keep, or a Community Organizing Card to read.</p>';
  else { const d = disasterById(space.disaster), s = solutionById(d.solution); body = tag('disaster', 'Disaster space') + '<h2>Space ' + index + ': ' + esc(d.name) + '</h2><p>' + esc(d.text) + '</p><div class="outcome good">' + icon(s.icon) + '<div><strong>Matching Solution Card: ' + esc(s.name) + '</strong><span>Without it, you move back to ' + esc(spaceName(previousNormal(index))) + '.</span></div></div>'; }
  showModal('space', body + (here.length ? '<h3>Here now</h3>' + here.map(p => '<div class="lobby-player">' + avatar(p) + '<span class="player-name">' + esc(p.name) + '</span></div>').join('') : '') + '<button class="button primary-button wide-button" data-action="close" data-autofocus>Back to the board ' + icon('arrow') + '</button>');
}

// ---------- Setup and online rooms ----------
function setup() {
  const players = game.players.length ? game.players : DEMO_NAMES.map((n, i) => ({ name: n, character: CHARACTERS[i].id }));
  showModal('setup', '<span class="eyebrow">NEW GAME</span><h2>Who’s playing?</h2><p>Add 2–6 players and choose a different character for each. You’ll take turns on this device.</p><div class="modal-subheading"><h3>Players</h3><span class="small-note">2–6 players</span></div><div id="setup-players">' + players.map((p, i) => setupRow(p, i)).join('') + '</div><button class="text-button" data-action="add-player">' + icon('plus') + ' Add a player</button><div id="setup-error"></div>' + (game.status === 'playing' ? '<div class="game-note">Starting a new game resets the board and everyone’s cards.</div>' : '') + '<button class="button primary-button wide-button" data-action="start-local">Start the game ' + icon('arrow') + '</button><div class="setup-links"><button class="text-button" data-action="instructions">' + icon('book') + ' Read the instructions</button><button class="text-button" data-action="invite">' + icon('people') + ' Playing on separate devices? Create a room.</button></div>');
}
function setupRow(p, i) { return '<div class="setup-player">' + avatar(p) + '<input aria-label="Player ' + (i + 1) + ' name" placeholder="Player name" value="' + esc(p.name) + '" maxlength="24"><select aria-label="Player ' + (i + 1) + ' character">' + CHARACTERS.map(c => '<option value="' + c.id + '" ' + (c.id === p.character ? 'selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select><button class="icon-button" data-action="remove-player" aria-label="Remove player ' + (i + 1) + '">' + icon('close') + '</button></div>'; }
function characterChoices() { return '<div class="character-grid">' + CHARACTERS.map(c => '<button class="character-choice ' + (c.id === selectedCharacter ? 'selected' : '') + '" data-action="character" data-character="' + c.id + '" aria-pressed="' + (c.id === selectedCharacter) + '">' + avatar({ character: c.id }) + '<span>' + c.name + '</span></button>').join('') + '</div>'; }
function invite(tab = 'create') {
  if (online) return showLobby();
  showModal('invite', '<span class="eyebrow">SEPARATE DEVICES</span><h2>Play together from anywhere.</h2><p>Each player joins from their own phone, tablet, or computer. Everyone sees the same board.</p><div class="mode-tabs"><button class="' + (tab === 'create' ? 'active' : '') + '" data-action="invite-create">Create a room</button><button class="' + (tab === 'join' ? 'active' : '') + '" data-action="invite-join">Join a room</button></div><form id="online-form" data-mode="' + tab + '"><label class="field">Your name<input id="online-name" name="name" autocomplete="given-name" placeholder="What should we call you?" maxlength="24" required value=""></label>' + (tab === 'join' ? '<label class="field">Room code<input id="room-code" class="room-code-input" name="code" placeholder="ABCDEF" pattern="[A-Za-z2-9]{6}" minlength="6" maxlength="6" autocomplete="off" required value="' + esc(new URL(location.href).searchParams.get('room') || '') + '"></label>' : '') + '<span class="field">Choose your character</span>' + characterChoices() + '<div id="online-error"></div><button type="submit" class="button primary-button wide-button">' + (tab === 'create' ? 'Create a room' : 'Join the room') + ' ' + icon('arrow') + '</button></form><p class="small-note">2–6 players. Rooms stay open for 24 hours after the last move.</p>');
}
function showLobby() {
  const host = game.host === session.playerId, started = game.status !== 'lobby';
  showModal('lobby', '<span class="eyebrow">GAME ROOM</span><h2>' + (started ? 'The game is underway.' : 'Waiting for players.') + '</h2><p>' + (started ? 'Everyone’s board updates automatically.' : 'Share the room code. Players can join until the host starts.') + '</p><div class="room-code"><p>ROOM CODE</p><strong>' + esc(session.code) + '</strong><button class="text-button" data-action="copy-invite">' + icon('copy') + ' Copy invitation link</button></div><div>' + game.players.map(p => '<div class="lobby-player">' + avatar(p) + '<span class="player-name">' + esc(p.name) + (p.id === session.playerId ? ' <small>(you)</small>' : '') + '</span><span class="muted">' + (p.id === game.host ? 'Host' : 'Ready') + '</span></div>').join('') + '</div>' + (started ? '<button class="button primary-button wide-button" data-action="room-close">Back to the board ' + icon('arrow') + '</button>' : host ? '<button class="button primary-button wide-button" data-action="start-online" ' + (game.players.length < 2 ? 'disabled' : '') + '>Start the game ' + icon('arrow') + '</button><p class="small-note">' + (game.players.length < 2 ? 'Waiting for at least one more player.' : 'Everyone here? Start whenever you’re ready.') + '</p>' : '<p class="game-note">The host will start the game when everyone is here.</p>') + '<button class="text-button centered" data-action="leave-room">Leave this room</button>', !started);
}
async function api(path, body, auth = true) {
  const response = await fetch(API_BASE + '/api/' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(auth && session ? { Authorization: 'Bearer ' + session.token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let result; try { result = await response.json(); } catch { throw new Error('The game service is unavailable. Please try again.'); }
  if (!response.ok) { const error = new Error(result.error || 'Could not update the game. Try again.'); error.status = response.status; throw error; }
  return result;
}
async function checkServerVersion() {
  let info = null; try { info = await api('version', null, false); } catch {}
  if (info?.version !== VERSION) throw new Error('Online rooms are being updated for the new game rules. For now, play together on one shared device.');
}

// ---------- Turn flow ----------
async function afterMove() {
  describeMove();
  if (game.status === 'complete') { sound.win(); showSummary(); }
  else if (game.phase === 'event') { playEventSound(); showEvent(); }
}
async function perform(action) {
  if (busy) return;
  try {
    if (action === 'roll') {
      busy = true; render(); startTumble();
      const started = Date.now();
      const next = online ? (await api('rooms/' + session.code + '/action', { action })).game : takeAction(game, activePlayer(game).id, action);
      await wait(Math.max(0, (reducedMotion() ? 300 : 800) - (Date.now() - started)));
      stopTumble(next.lastRoll);
      game = next;
      if (game.move) display[game.move.player] = game.move.from;
      render();
      await wait(250);
      await animateMove(game.move);
      busy = false; render();
      await afterMove();
    } else {
      busy = true;
      modal.querySelectorAll('[data-action="continue"],[data-action="use-card"],[data-action="move-back"],[data-action="start-online"]').forEach(b => { b.disabled = true; });
      const next = online ? (await api('rooms/' + session.code + '/action', { action })).game : takeAction(game, activePlayer(game).id, action);
      const moved = next.move && next.move.seq !== game.move?.seq;
      game = next;
      if (moved) { display[game.move.player] = game.move.from; render(); if (modal.open) { modal.close(); currentModal = ''; } await animateMove(game.move); }
      busy = false; render();
      if (action === 'use-card') { sound.card(); showEvent(); announce('Solution Card used. You stay on this space.'); }
      else if (action === 'move-back') { showEvent(); announce('You moved back to ' + spaceName(game.event.backTo) + '.'); }
      else if (action === 'start') { modal.close(); currentModal = ''; toast('The game has started! ' + activePlayer(game).name + ' rolls first.'); }
      else { modal.close(); currentModal = ''; const next = activePlayer(game); toast(next.name + ', you’re up!' + (online ? '' : ' Pass the device.')); announce('It is ' + next.name + '’s turn.'); }
    }
  } catch (error) {
    busy = false; stopTumble(game.lastRoll); render(); toast(error.message);
    if (game.phase === 'event' && game.status === 'playing') showEvent();
  }
}
async function pollRoom() {
  if (!online || !session || busy || polling) return;
  polling = true;
  try {
    const result = await api('rooms/' + session.code);
    pollErrors = 0; $('#session-label').classList.remove('connection-error');
    if (result.game.revision !== game.revision) {
      const beforeTurn = activePlayer(game)?.id;
      game = result.game;
      const moved = game.move && game.move.seq !== animatedSeq;
      if (moved) {
        if (currentModal === 'event' || currentModal === 'lobby') { modal.close(); currentModal = ''; }
        if (game.move.roll) { startTumble(); await wait(reducedMotion() ? 200 : 600); stopTumble(game.move.roll); }
        display[game.move.player] = game.move.from; render();
        await animateMove(game.move);
      }
      render();
      if (game.status === 'complete') { if (currentModal !== 'summary') { sound.win(); showSummary(); } }
      else if (game.status === 'lobby') showLobby();
      else if (game.phase === 'event') { if (moved) playEventSound(); showEvent(); }
      else if (['lobby', 'event'].includes(currentModal)) { modal.close(); currentModal = ''; }
      if (moved) describeMove();
      if (beforeTurn !== activePlayer(game)?.id && game.status === 'playing') { if (isMyTurn()) toast('Your turn! Roll the die.'); announce('It is ' + activePlayer(game).name + '’s turn.'); }
    }
  } catch (error) {
    if (error.status === 404 || error.status === 401) { dropSession('That room is no longer available. You can play on this device instead.'); }
    else if (++pollErrors >= 3) { $('#session-label').classList.add('connection-error'); $('#session-label').textContent = 'Reconnecting to room ' + session.code + '…'; }
  } finally { polling = false; }
}
function dropSession(message) {
  online = false; session = null; setStorage(SESSION_KEY, null);
  game = readStorage(LOCAL_KEY, null); if (!validGame(game)) game = newGame([]);
  animatedSeq = game.move?.seq ?? 0;
  if (modal.open) modal.close(); currentModal = ''; $('#board-pieces').innerHTML = ''; render(); if (message) toast(message);
}
async function connectRoom(form) {
  const button = form.querySelector('[type="submit"]'); button.disabled = true; button.textContent = 'Connecting…';
  try {
    await checkServerVersion();
    const name = $('#online-name').value.trim(), mode = form.dataset.mode;
    const result = await api(mode === 'create' ? 'rooms' : 'rooms/' + $('#room-code').value.trim().toUpperCase() + '/join', { name, character: selectedCharacter }, false);
    saveLocal();
    session = { code: result.code, token: result.token, playerId: result.playerId }; online = true; game = result.game; animatedSeq = game.move?.seq ?? 0;
    setStorage(SESSION_KEY, session);
    const url = new URL(location.href); url.searchParams.delete('room'); history.replaceState({}, '', url);
    $('#board-pieces').innerHTML = ''; render(); showLobby();
  } catch (error) {
    $('#online-error').innerHTML = '<div class="error-message">' + esc(error.message) + '</div>';
    button.disabled = false; button.innerHTML = (form.dataset.mode === 'create' ? 'Create a room' : 'Join the room') + ' ' + icon('arrow');
  }
}
async function leaveRoom() {
  try { await api('rooms/' + session.code + '/leave', {}); } catch (error) { if (error.status !== 404 && error.status !== 401) { toast(error.message); return; } }
  dropSession('You left the room. You can play on this device instead.');
}
function saveSummary() {
  const winner = game.players.find(p => p.id === game.winner);
  const text = 'COMMON GROUND: THE ENVIRONMENTAL JUSTICE GAME\n' + CALL_TO_ACTION + '\n\nWinner: ' + (winner?.name || 'none yet') + '\n\nPlayers\n' + game.players.map(p => '- ' + p.name + ': ' + spaceName(p.position) + ', ' + plural(p.facts.length, 'learning fact') + ', ' + plural(p.collected, 'Solution Card') + ' collected, ' + p.used + ' used').join('\n') + '\n\nLearning facts we found\n' + [...new Set(game.players.flatMap(p => p.facts))].map(id => '- ' + factById(id).text).join('\n') + '\n\nTalk it over\n- Which disaster surprised you most? Who is most affected by it in real life?\n- Which Solution Card or community action could help your own neighborhood?\n- What would it take to build for everyone and leave no one behind?\n';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = 'common-ground-summary.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Events ----------
document.addEventListener('click', async event => {
  const space = event.target.closest('[data-space]'); if (space) { inspectSpace(Number(space.dataset.space)); return; }
  const target = event.target.closest('[data-action]'); if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === 'close') closeModal();
  else if (action === 'instructions') instructions();
  else if (action === 'mission') purpose();
  else if (action === 'sound') { sound.toggle(); render(); toast(sound.enabled ? 'Sound effects on.' : 'Sound effects off.'); }
  else if (action === 'new-game' || action === 'players') { if (online) showLobby(); else setup(); }
  else if (action === 'invite' || action === 'invite-create') invite('create');
  else if (action === 'invite-join') invite('join');
  else if (action === 'character') { selectedCharacter = target.dataset.character; $$('.character-choice').forEach(b => { b.classList.toggle('selected', b.dataset.character === selectedCharacter); b.setAttribute('aria-pressed', b.dataset.character === selectedCharacter); }); }
  else if (action === 'add-player') { const rows = $$('#setup-players .setup-player'); if (rows.length >= 6) { toast('There’s room for up to six players.'); return; } const used = rows.map(r => r.querySelector('select').value); const c = CHARACTERS.find(c => !used.includes(c.id)); $('#setup-players').insertAdjacentHTML('beforeend', setupRow({ name: 'Player ' + (rows.length + 1), character: c?.id || 'leaf' }, rows.length)); }
  else if (action === 'remove-player') { if ($$('#setup-players .setup-player').length <= 2) { toast('The game needs at least two players.'); return; } target.closest('.setup-player').remove(); }
  else if (action === 'start-local') {
    try {
      const players = $$('#setup-players .setup-player').map(row => makePlayer(row.querySelector('input').value, row.querySelector('select').value));
      if (new Set(players.map(p => p.character)).size !== players.length) throw new Error('Choose a different character for each player.');
      if (new Set(players.map(p => p.name.toLowerCase())).size !== players.length) throw new Error('Give each player a different name.');
      game = newGame(players); animatedSeq = 0; $('#board-pieces').innerHTML = ''; modal.close(); currentModal = ''; render();
      toast('Let’s play! ' + players[0].name + ' rolls first.'); announce('New game started. ' + players[0].name + ' rolls first.');
    } catch (error) { $('#setup-error').innerHTML = '<div class="error-message">' + esc(error.message) + '</div>'; }
  }
  else if (action === 'rematch') { game = newGame(game.players.map(p => makePlayer(p.name, p.character, p.id))); animatedSeq = 0; modal.close(); currentModal = ''; render(); toast('New game! ' + game.players[0].name + ' rolls first.'); }
  else if (action === 'roll') { if (game.status === 'setup') setup(); else if (game.status === 'complete') showSummary(); else if (game.status === 'lobby') showLobby(); else if (game.phase === 'roll') await perform('roll'); else showEvent(); }
  else if (['continue', 'use-card', 'move-back'].includes(action)) await perform(action);
  else if (action === 'start-online') await perform('start');
  else if (action === 'room-close') { modal.close(); currentModal = ''; if (game.phase === 'event') showEvent(); }
  else if (action === 'leave-room') await leaveRoom();
  else if (action === 'copy-invite') { const url = new URL(location.href); url.searchParams.set('room', session.code); try { await navigator.clipboard.writeText(url.toString()); toast('Invitation link copied.'); } catch { toast('Share room code ' + session.code + ' with your friends.'); } }
  else if (action === 'library') library(target.dataset.type || 'disasters');
  else if (action === 'activity') showActivity();
  else if (action === 'sources') sources();
  else if (action === 'download-summary') saveSummary();
  else if (action === 'fullscreen') { const panel = $('.board-panel'); panel.classList.toggle('board-expanded'); target.setAttribute('aria-label', panel.classList.contains('board-expanded') ? 'Close expanded board' : 'Expand game board'); }
});
document.addEventListener('submit', event => { if (event.target.id === 'online-form') { event.preventDefault(); connectRoom(event.target); } });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') $('.board-panel').classList.remove('board-expanded');
  if ((event.key === 'Enter' || event.key === ' ') && event.target.hasAttribute?.('data-space')) { event.preventDefault(); inspectSpace(Number(event.target.dataset.space)); }
});
document.addEventListener('change', event => { if (event.target.matches('.setup-player select')) { const row = event.target.closest('.setup-player'); row.querySelector('.player-avatar').outerHTML = avatar({ character: event.target.value }); } });

$('#guide-grid').innerHTML = [
  ['normal', 'bulb', 'Normal spaces', SPACE_TYPES.normal.count, FACT_SPACES.length + ' show a learning fact. ' + (SPACE_TYPES.normal.count - FACT_SPACES.length) + ' are blank.', 'facts'],
  ['mystery', 'question', 'Mystery spaces', SPACE_TYPES.mystery.count, 'Draw a Solution Card or a Community Organizing Card.', 'organizing'],
  ['disaster', 'alert', 'Disaster spaces', SPACE_TYPES.disaster.count, 'Use the matching Solution Card, or move back.', 'disasters']
].map(([kind, glyph, name, count, text, tab]) => '<button class="guide-card guide-' + kind + '" data-action="library" data-type="' + tab + '"><span class="guide-icon">' + icon(glyph) + '</span><span class="guide-text"><span class="guide-title">' + name + ' <span class="guide-count">' + count + '</span></span><span class="guide-desc">' + text + '</span></span><span class="guide-arrow">' + icon('arrow') + '</span></button>').join('');
hydrateIcons(); buildBoard(); render();
setInterval(pollRoom, 1800);
async function init() {
  if (session) {
    try {
      const result = await api('rooms/' + session.code);
      if (result.game.version !== VERSION) throw Object.assign(new Error('outdated'), { status: 404 });
      online = true; game = result.game; animatedSeq = game.move?.seq ?? 0; $('#board-pieces').innerHTML = ''; render();
      if (game.status === 'lobby') showLobby(); else if (game.status === 'complete') showSummary(); else if (game.phase === 'event') showEvent();
      return;
    } catch (error) { if (error.status === 404 || error.status === 401) { session = null; setStorage(SESSION_KEY, null); } else toast('Could not reconnect to your online room. Reload to try again.'); }
  }
  const room = new URL(location.href).searchParams.get('room');
  if (room && /^[A-Z2-9]{6}$/i.test(room)) invite('join');
  else if (game.status === 'complete') showSummary();
  else if (game.phase === 'event' && game.status === 'playing') showEvent();
}
init();
