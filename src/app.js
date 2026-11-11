import { FINISH, CHARACTERS, CATEGORIES, CARDS, categoryAt, makePlayer, newGame, takeAction, activePlayer } from './game.js';

const $ = selector => document.querySelector(selector);
const API_BASE = document.querySelector('meta[name="game-api"]')?.content || '';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
  leaf:'<path d="M19 4C10 3 4 7 5 13c1 6 10 8 14-9Z"/><path d="m4 21 10-11"/>',
  sprout:'<path d="M12 21v-9M12 15C4 15 3 10 3 7c7-1 10 3 9 8ZM12 11c0-6 4-8 9-8 1 6-3 10-9 8Z"/>',
  drop:'<path d="M12 3S5 11 5 16a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M8 16a4 4 0 0 0 4 4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  flower:'<path d="M12 9C7 1 2 6 7 11c-8 2-5 9 2 5-1 9 7 9 6 0 7 4 10-3 2-5 5-5 0-10-5-2Z"/><circle cx="12" cy="12" r="2"/>',
  bird:'<path d="M3 15c3 1 6 0 7-3 0-7 8-9 9-3l3 1-3 2c-1 7-9 10-16 3Z"/><path d="m5 8 5 4m5-4h.01"/>',
  book:'<path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14m0-10H4v16h16v-6"/>',
  rotate:'<path d="M20 7A9 9 0 1 0 21 14M20 2v6h-6"/>',
  heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 2 11 8 15 6-4 13-10 8-15Z"/>',
  expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
  activity:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  check:'<path d="m5 12 4 4L20 5"/>',
  flag:'<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  shield:'<path d="m12 2 9 4v6c0 5-5 9-9 10-4-1-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>'
};
function icon(name, extra = '') { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '+extra+'>'+(paths[name] || paths.leaf)+'</svg>'; }
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon)); }
function character(id) { return CHARACTERS.find(c => c.id === id) || CHARACTERS[0]; }
function avatar(player, active = false) { const c = character(player.character); return '<span class="player-avatar '+(active ? 'active' : '')+'" style="--avatar-color:'+c.color+';--avatar-light:'+c.light+'">'+icon(c.icon)+'</span>'; }
function readStorage(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function setStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
let game = readStorage('common-ground-local-v1', null);
if (!game || game.version !== 1 || !Array.isArray(game.players) || !game.players.length || game.players.some(p => !CHARACTERS.some(c => c.id === p.character))) game = newGame(['Alex','Maya','Jordan','Sam'].map((n,i) => makePlayer(n,CHARACTERS[i].id)));
let session = readStorage('common-ground-session-v1', null);
let online = false, busy = false, wheelRotation = 0, selectedCharacter = 'leaf', currentModal = '', pollErrors = 0;
let toastTimer;
const modal = $('#modal');
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('toast-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('toast-visible'), 4000); }
function announce(message) { $('#announcer').textContent = message; }
function isMyTurn() { return !online || activePlayer(game)?.id === session?.playerId; }
function mine(player) { return online ? player.id === session?.playerId : player.id === game.players[0].id; }
function saveLocal() { if (!online) setStorage('common-ground-local-v1',game); }
function showModal(type, content, locked = false) { currentModal = type; $('#modal-content').innerHTML = content; modal.classList.toggle('no-close',locked); hydrateIcons(modal); if (!modal.open) modal.showModal(); }
function closeModal() { if (currentModal === 'card' && game.phase !== 'spin' && game.status === 'playing') return; modal.close(); currentModal = ''; }
modal.addEventListener('cancel', e => { if (currentModal === 'card' || (currentModal === 'lobby' && online)) e.preventDefault(); else currentModal = ''; });
modal.addEventListener('click', e => { if (e.target === modal && !['card','lobby'].includes(currentModal)) closeModal(); });

const coordinates = [[84,495],[150,495],[216,495],[282,495],[348,495],[414,495],[480,495],[546,495],[612,495],[678,495],[744,495],[810,495],[876,495],[876,429],[876,363],[876,297],[810,297],[744,297],[678,297],[612,297],[546,297],[480,297],[414,297],[348,297],[282,297],[216,297],[150,297],[150,231],[150,165],[216,165],[282,165],[348,165],[414,165],[480,165],[546,165],[612,165],[678,165]];
function tree(x,y,s=1,c='#91b68b') { return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cy="18" rx="17" ry="6" fill="#a6b598" opacity=".25"/><path d="M0 17V-8" stroke="#9b9a75" stroke-width="4"/><ellipse cy="-11" rx="15" ry="19" fill="'+c+'"/><ellipse cx="-5" cy="-16" rx="10" ry="14" fill="#c8dbb1" opacity=".38"/></g>'; }
function pine(x,y,s=1) { return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cy="16" rx="14" ry="5" fill="#acb89d" opacity=".3"/><path d="M0 17V-4" stroke="#a09b7a" stroke-width="4"/><path d="M0-35-15 2h9L-17 11h34L6 2h9Z" fill="#7fa88b"/><path d="M0-35 0 11h17L6 2h9Z" fill="#6b967b"/></g>'; }
function house(x,y,color='#d6bb8c',s=1) { return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="28" cy="48" rx="40" ry="10" fill="#b7c4a6" opacity=".3"/><path d="M50 4 64 13v33L50 42Z" fill="#d8d0b5"/><rect y="2" width="51" height="41" rx="2" fill="#fff9e8"/><path d="M-7 3 25-21 57 3Z" fill="'+color+'"/><path d="m25-21 14-4 31 26-13 2Z" fill="'+color+'" opacity=".7"/><rect x="22" y="21" width="11" height="22" rx="1" fill="#aab8a3"/><path d="M7 14h9v10H7Zm31 0h9v10h-9Z" fill="#b4d3cd"/><path d="M11 14v10m-4-5h9m26-5v10m-4-5h9" stroke="#f8f8e9" stroke-width="1.5"/><path d="M-1 43h54" stroke="#ece3cc" stroke-width="4"/><rect x="42" y="-17" width="6" height="14" fill="#dad0b6"/></g>'; }
function bench(x,y) { return '<g transform="translate('+x+' '+y+')"><path d="M0 0h29m-29 5h29m-29 5h29" stroke="#c2a77a" stroke-width="3"/><path d="M4-2v18m21-18v18" stroke="#a4a387" stroke-width="2"/></g>'; }
function garden(x,y) { return '<g transform="translate('+x+' '+y+')"><rect width="91" height="46" rx="11" fill="#e0e6ce"/><g stroke="#bda985" stroke-width="4"><path d="M10 10h70m-70 13h70m-70 13h70"/></g><g fill="#85ad73">'+[17,34,51,68].map(a => [10,23,36].map(b=>'<ellipse cx="'+a+'" cy="'+b+'" rx="5" ry="3"/>').join('')).join('')+'</g></g>'; }
function buildBoard() {
  const route = coordinates.map((c,i) => (i?'L':'M')+c[0]+','+c[1]).join(' ');
  let scenery = '<rect width="1000" height="620" fill="#eaf0e3"/><path d="M0 48c65 18 45 99 51 141s43 80 19 143S30 435 55 502s-2 86-17 118H0Z" fill="#c6e0de"/><path d="M11 75c33 50 14 96 25 142s34 66 18 113-41 79-27 121" fill="none" stroke="#deece4" stroke-width="3"/><path d="M87 53c80-26 118 16 166-3s84-15 126 0M78 563c94 10 149-10 202 0s164-9 217 0 190-5 235-1 160 2 199-27" fill="none" stroke="#e0e8d5" stroke-width="22" stroke-linecap="round"/><path d="M215 358c85-25 146 10 228-9s158-6 207 13 89-14 157 5" fill="none" stroke="#e2e9d7" stroke-width="47" stroke-linecap="round"/><path d="M224 359c85-25 146 10 228-9s158-6 207 13 89-14 148 5" fill="none" stroke="#edf1e6" stroke-width="25" stroke-linecap="round"/>';
  scenery += '<path d="M768 70c100-20 159 3 167 65s-19 105-66 98-118 7-125-47 0-78 24-116Z" fill="#dde9cf"/><path d="M777 84c26 16 12 40 25 57s43 20 55 47" fill="none" stroke="#edf2e2" stroke-width="12" stroke-linecap="round"/>';
  scenery += '<g fill="#d4dfc4" opacity=".6"><ellipse cx="350" cy="226" rx="56" ry="19"/><ellipse cx="660" cy="565" rx="79" ry="13"/><ellipse cx="434" cy="406" rx="82" ry="32"/></g>';
  scenery += tree(94,103,.8)+tree(113,63,.6)+pine(197,72,.8)+house(263,66,'#c8987f',.94)+house(354,81,'#a1b2bb',.72)+pine(419,75,.85)+tree(588,73,.9)+tree(622,57,.6)+tree(757,84,.72)+tree(802,92,.9)+tree(905,150,.9)+pine(920,210,.75)+tree(824,203,.8)+bench(842,155)+pine(760,214,.8);
  scenery += '<g transform="translate(468 48)"><ellipse cx="32" cy="59" rx="50" ry="10" fill="#bac9a6" opacity=".25"/><rect x="-5" y="13" width="81" height="41" rx="2" fill="#f9f5df"/><path d="m-13 13 48-24 49 24Z" fill="#b6b6a0"/><rect x="21" y="-2" width="27" height="57" rx="1" fill="#fff9e4"/><path d="m17-2 18-12 18 12Z" fill="#b0ac95"/><circle cx="35" cy="9" r="6" fill="#e4dabb"/><path d="M35 5v4l3 2" stroke="#b4af93" stroke-width="1" fill="none"/><rect x="29" y="34" width="13" height="21" fill="#aab9a5"/><path d="M5 25h8v12H5Zm51 0h8v12h-8Z" fill="#b2cfcb"/></g>';
  scenery += '<text x="119" y="115" font-size="9" fill="#8ea58d" letter-spacing="2" class="board-title-caption">RIVERSIDE</text><text x="790" y="257" font-size="8" fill="#8ba382" letter-spacing="2.8">THE COMMONS</text>';
  scenery += house(242,387,'#c29e86',1)+house(324,393,'#b6b2cc',.8)+tree(207,417,.85)+tree(410,409,.8)+garden(444,376)+pine(548,419,.8);
  scenery += '<g transform="translate(599 365)"><ellipse cx="43" cy="70" rx="62" ry="11" fill="#b9c8a6" opacity=".3"/><rect y="6" width="90" height="58" rx="3" fill="#fbf6e7"/><path d="M-9 8 45-21 100 8Z" fill="#c8957f"/><path d="M5 15h80" stroke="#e4d8c2" stroke-width="3"/><rect x="34" y="32" width="22" height="32" rx="2" fill="#b0c3a7"/><path d="M45 32v32" stroke="#edf3e2" stroke-width="2"/><g fill="#b5d0ca"><path d="M10 25h13v16H10Zm57 0h13v16H67Z"/></g><text x="45" y="23" font-size="5.5" text-anchor="middle" letter-spacing=".8" fill="#999b80">COMMUNITY CENTER</text><path d="M-7 64h104" stroke="#ded7bf" stroke-width="5"/></g>';
  scenery += tree(720,425,1)+tree(765,394,.8)+bench(777,433)+pine(940,392,.9)+tree(942,466,.65)+tree(938,531,.8)+house(920,292,'#b2bca2',.7)+pine(940,337,.6)+tree(118,377,.7)+tree(101,434,.8);
  scenery += '<g transform="translate(770 555)"><path d="M0 0h24m-24 4h24" stroke="#ccc7a3" stroke-width="2"/><circle cx="2" cy="11" r="5" fill="#abc1a2"/><circle cx="23" cy="11" r="5" fill="#abc1a2"/></g><g stroke="#d0ddc1" stroke-width="2" stroke-linecap="round">'+[[198,551],[318,558],[467,73],[550,224],[700,73],[905,92],[210,235],[532,555],[731,557],[836,557]].map(([x,y])=>'<path d="M'+x+' '+y+'v-5m-4 3 4 2 4-2"/>').join('')+'</g>';
  scenery += '<text x="680" y="85" text-anchor="middle" fill="#718866" font-size="7" letter-spacing="2">A HEALTHIER FUTURE</text><text x="680" y="110" text-anchor="middle" fill="#405b40" font-size="20" font-weight="700" letter-spacing="-.8" class="board-title-caption">Common Ground</text>';
  scenery += '<path d="'+route+'" fill="none" stroke="#d4dec9" stroke-width="69" stroke-linecap="round" stroke-linejoin="round"/><path d="'+route+'" fill="none" stroke="#f7f8ed" stroke-width="65" stroke-linecap="round" stroke-linejoin="round"/>';
  const colors = {knowledge:['#b8d1e7','#658db5'],challenge:['#ead0aa','#b78a55'],action:['#bdd5b6','#779a70']};
  scenery += coordinates.map(([x,y],i) => {
    const cat = categoryAt(i), [fill,stroke] = colors[cat], special = i===0 || i===FINISH;
    const glyph = i===0?'sprout':i===FINISH?'flag':CATEGORIES[cat].icon;
    return '<g class="board-tile" role="button" tabindex="0" data-space="'+i+'" aria-label="'+(i===0?'Start':i===FINISH?'Finish: Common Ground':'Space '+i+', '+CATEGORIES[cat].name)+'"><rect class="tile-base" x="'+(x-28)+'" y="'+(y-28)+'" width="56" height="56" rx="9" fill="'+(special?'#6e9167':fill)+'" stroke="'+(special?'#64865e':'#ffffff')+'" stroke-width="2"/><text class="tile-num" x="'+(x-20)+'" y="'+(y-14)+'" font-size="7.5" font-weight="600" fill="'+(special?'#dfebd3':stroke)+'">'+(special?'':String(i).padStart(2,'0'))+'</text><g transform="translate('+(x-10)+' '+(y-10)+') scale(.84)" fill="none" stroke="'+(special?'#e9f0df':stroke)+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[glyph]+'</g>'+(special?'<text x="'+x+'" y="'+(y+20)+'" text-anchor="middle" font-size="6" letter-spacing="1.2" fill="#f5f8ee">'+(i===0?'START':'FINISH')+'</text>':'')+'</g>';
  }).join('');
  scenery += '<path d="m770 530-10 6 10 6m-10-6h25" stroke="#a2b58f" stroke-width="2" fill="none"/><text x="85" y="548" text-anchor="middle" fill="#829b76" font-size="6.5" letter-spacing="1">START SOMETHING GOOD</text><g id="board-pieces"></g>';
  $('#board').innerHTML = '<svg viewBox="0 0 1000 620" role="group" aria-label="A shared neighborhood board with 36 spaces and a finish line">'+scenery+'</svg>';
}
function renderPieces() {
  $('#board-pieces').innerHTML = game.players.map((p,i) => {
    const c = character(p.character), [x,y] = coordinates[p.position] || coordinates[0];
    const colocated = game.players.filter(a=>a.position===p.position), idx = colocated.findIndex(a=>a.id===p.id);
    const dx = colocated.length > 1 ? (idx%3-((Math.min(colocated.length,3)-1)/2))*20 : 0;
    const dy = colocated.length > 3 && idx >= 3 ? 18 : -5;
    const current = i===game.turn && game.status!=='complete';
    return '<g class="board-piece" transform="translate('+(x+dx)+' '+(y+dy)+')" aria-label="'+esc(p.name)+', '+(p.position===0?'at start':p.position===FINISH?'at finish':'space '+p.position)+'"><title>'+esc(p.name)+' · '+p.position+'/'+FINISH+'</title><ellipse cy="17" rx="13" ry="5" fill="#40563a" opacity=".2"/>'+(current?'<circle cy="-2" r="19" fill="none" stroke="'+c.color+'" stroke-width="1.6" stroke-dasharray="3 3" opacity=".7"/>':'')+'<path d="M-9 11 0 19 9 11" fill="'+c.color+'"/><circle cy="-2" r="14" fill="'+c.color+'" stroke="#fffdf3" stroke-width="2.5"/><g transform="translate(-8 -10) scale(.67)" stroke="white" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[c.icon]+'</g></g>';
  }).join('');
}
function buildWheel() {
  const colors = ['#d2dfbb','#c4d4e5','#e6c6b5','#dfdab6','#c8d9cb','#d5cde0','#e4d5b4','#b8cfd3','#d4ddc4','#d5c1c4'];
  $('#wheel-svg').innerHTML = colors.map((color,i)=>{
    const a=(i*36-90)*Math.PI/180, b=((i+1)*36-90)*Math.PI/180, m=(a+b)/2;
    return '<path d="M110 110 110 110 L'+(110+108*Math.cos(a))+' '+(110+108*Math.sin(a))+' A108 108 0 0 1 '+(110+108*Math.cos(b))+' '+(110+108*Math.sin(b))+' Z" fill="'+color+'" stroke="#f6f6e8" stroke-width="1.8"/><text x="'+(110+80*Math.cos(m))+'" y="'+(110+80*Math.sin(m))+'" dy=".35em" text-anchor="middle" fill="#566254" font-family="DM Sans, sans-serif" font-size="16" font-weight="500" transform="rotate('+(i*36+18)+' '+(110+80*Math.cos(m))+' '+(110+80*Math.sin(m))+')">'+(i+1)+'</text>';
  }).join('');
}
function render() {
  const current = activePlayer(game), waiting = online && !isMyTurn();
  if (!busy && game.lastSpin) $('#wheel-result').textContent = game.lastSpin;
  $('#session-label').textContent = online ? 'Room '+session.code+' · '+game.players.length+' players' : 'Shared device · '+game.players.length+' players';
  $('#round-label').textContent = 'ROUND '+String(game.round).padStart(2,'0');
  $('#turn-title').textContent = game.status==='complete' ? 'Look what we built.' : game.status==='lobby' ? 'Gather your people.' : current.name + (waiting?' is up.':', you’re up.');
  $('#turn-description').textContent = game.status==='complete'?'Everyone made it. Every contribution mattered.':game.status==='lobby'?'Invite your neighbors. Make a little change together.':waiting?'Cheer on your neighbor. Your turn is coming.':'Give the wheel a spin. See where change takes you.';
  $('#turn-indicator').textContent = game.status==='complete'?'TOGETHER':game.status==='lobby'?'LOBBY':waiting?'THEIR TURN':online?'YOUR TURN':current.name.toUpperCase()+'’S TURN';
  $('#spin-button').disabled = busy || (waiting && game.status==='playing');
  $('#spin-label').textContent = busy?'Spinning…':game.status==='complete'?'See our story':game.status==='lobby'?'Open game room':game.phase!=='spin'?'Continue your turn':waiting?'Waiting for '+current.name:'Spin the wheel';
  $('#spin-footnote').textContent = game.status==='complete'?'A finish line for everyone. A win we share.':waiting?'The board updates automatically.':game.phase==='card'?'A new perspective is waiting for you.':'Move 1–10 spaces. Make your move count.';
  $('#player-count').textContent = game.players.length;
  $('#players-list').innerHTML = game.players.map((p,i)=>'<div class="player-row">'+avatar(p,i===game.turn && game.status==='playing')+'<div class="player-meta"><div class="player-name">'+esc(p.name)+(mine(p)?'<small>you</small>':'')+'</div><div class="player-status">'+(p.position===FINISH?'At Common Ground':p.points+' community points')+'</div><div class="player-progress" style="--avatar-color:'+character(p.character).color+'"><span style="width:'+(p.position/FINISH*100)+'%"></span></div></div><span class="player-position '+(i===game.turn&&game.status==='playing'?'active':'')+'">'+(p.position===FINISH?'✓':i===game.turn&&game.status==='playing'?'PLAYING':p.position+'/'+FINISH)+'</span></div>').join('');
  $('#manage-players').textContent = online?'Room':'Edit';
  $('#community-points').textContent = game.community;
  $('#community-bar').style.width = Math.min(100,game.community)+'%';
  $('.progress-track[role]').setAttribute('aria-valuenow',Math.min(100,game.community));
  $('#latest-activity').textContent = game.history[0]?.text || 'The neighborhood is ready.';
  renderPieces(); saveLocal();
  if (currentModal==='lobby' && online) showLobby();
}

function instructions() { showModal('instructions','<span class="eyebrow">WELCOME TO THE NEIGHBORHOOD</span><h2>A shared board.<br>A little change, together.</h2><p class="modal-intro">There’s no race to beat your neighbors. Everyone makes it to Common Ground.</p><ol class="instruction-list"><li><div><strong>Gather your community</strong>Play with 2–6 people on one device, or create an online room and share its code. Each player chooses a name and a distinct piece.</div></li><li><div><strong>Take your turn</strong>Spin the wheel to move 1–10 spaces. Your piece moves automatically. Follow the highlighted player to see who’s up.</div></li><li><div><strong>Explore a new perspective</strong>Land on a knowledge, challenge, or community action space. Read your card, choose an answer, and discover why it matters.</div></li><li><div><strong>Grow something good</strong>Thoughtful answers earn 5–10 community points. Every attempt earns 2. Aim for 100 together and keep learning as you go.</div></li><li><div><strong>Bring everyone home</strong>Players who reach the finish cheer on the rest. The game ends when everyone arrives, with a shared story of your impact.</div></li></ol><div class="game-note">No prior knowledge needed. Discuss the choices together. In shared-device mode, pass the device when the next player is up.</div><button class="button primary-button wide-button" data-action="close">Let’s make a move '+icon('arrow')+'</button>'); }
function purpose() { showModal('mission','<span class="eyebrow">THE WORLD WE SHARE</span><h2>Every neighborhood<br>deserves a healthy future.</h2><p>Clean air. Welcoming green spaces. A voice in the decisions that shape home. These opportunities should belong to everyone.</p><h3>Start with a different perspective.</h3><p>Common Ground explores environmental justice through everyday choices and community challenges. You’ll discover how environmental burdens can be shared unequally, and how residents can work together for fairer outcomes.</p><h3>No one moves forward alone.</h3><p>This is a cooperative game for middle and high school learners. We celebrate curiosity, discussion, and collective action. The characters are neighbors with equal abilities; none starts with an advantage.</p><div class="game-note">The neighborhood and scenarios are fictional. Community points are a learning tool, not a real-world measure of environmental health.</div><button class="button primary-button wide-button" data-action="close">Meet your neighborhood '+icon('arrow')+'</button>'); }
function setup() {
  const players = online ? ['Alex','Maya','Jordan','Sam'].map((n,i)=>makePlayer(n,CHARACTERS[i].id)) : game.players;
  showModal('setup','<span class="eyebrow">A FRESH START</span><h2>Who’s in your community?</h2><p>Pick your people and a piece for everyone. You’ll take turns on this device.</p><div class="modal-subheading"><h3>Your neighbors</h3><span class="small-note">2–6 players</span></div><div id="setup-players">'+players.map((p,i)=>setupRow(p,i)).join('')+'</div><button class="text-button" data-action="add-player">'+icon('plus')+' Add a neighbor</button><div id="setup-error"></div><div class="game-note">Starting a fresh game resets the board and community points. Your current shared-device game is saved until you start.</div><button class="button primary-button wide-button" data-action="start-local">Start our game '+icon('arrow')+'</button><button class="text-button" style="margin:13px auto 0" data-action="invite">Playing on different devices? Create a room.</button>');
}
function setupRow(p,i) { return '<div class="setup-player">'+avatar(p)+'<input aria-label="Player '+(i+1)+' name" placeholder="Player name" value="'+esc(p.name)+'" maxlength="24"><select aria-label="Player '+(i+1)+' character">'+CHARACTERS.map(c=>'<option value="'+c.id+'" '+(c.id===p.character?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select><button class="icon-button" data-action="remove-player" aria-label="Remove player '+(i+1)+'">'+icon('close')+'</button></div>'; }
function characterChoices() { return '<div class="character-grid">'+CHARACTERS.map(c=>'<button class="character-choice '+(c.id===selectedCharacter?'selected':'')+'" data-action="character" data-character="'+c.id+'" aria-pressed="'+(c.id===selectedCharacter)+'">'+avatar({character:c.id})+'<span>'+c.name+'</span></button>').join('')+'</div>'; }
function invite(tab = 'create') {
  if (online) return showLobby();
  showModal('invite','<span class="eyebrow">BRING YOUR PEOPLE</span><h2>Good company.<br>Common Ground.</h2><p>Play on separate devices with a shared board that stays in sync.</p><div class="mode-tabs"><button class="'+(tab==='create'?'active':'')+'" data-action="invite-create">Create a room</button><button class="'+(tab==='join'?'active':'')+'" data-action="invite-join">Join a room</button></div><form id="online-form" data-mode="'+tab+'"><label class="field">Your name<input id="online-name" name="name" autocomplete="given-name" placeholder="What should we call you?" maxlength="24" required value="'+esc(game.players[0]?.name || '')+'"></label>'+(tab==='join'?'<label class="field">Room code<input id="room-code" class="room-code-input" name="code" placeholder="ABCDEF" pattern="[A-Za-z2-9]{6}" minlength="6" maxlength="6" autocomplete="off" required value="'+esc(new URL(location.href).searchParams.get('room') || '')+'"></label>':'')+'<label class="field">Choose your piece</label>'+characterChoices()+'<div id="online-error"></div><button type="submit" class="button primary-button wide-button">'+(tab==='create'?'Create our room':'Join the neighborhood')+' '+icon('arrow')+'</button></form><p class="small-note">2–6 players. Room codes work for 24 hours after the last activity. Share the page link and room code to play together.</p>');
}
function showLobby() {
  const host = game.host===session.playerId;
  const started = game.status!=='lobby';
  showModal('lobby','<span class="eyebrow">YOUR COMMUNITY ROOM</span><h2>'+(started?'You’re in good company.':'A place for your people.')+'</h2><p>'+(started?'Your game is underway. Everyone’s board updates automatically.':'Share the room code. Your neighbors can join before the game starts.')+'</p><div class="room-code"><p>YOUR ROOM CODE</p><strong>'+esc(session.code)+'</strong><button class="text-button" data-action="copy-invite" style="margin:auto">'+icon('copy')+' Copy invitation link</button></div><div>'+game.players.map(p=>'<div class="lobby-player">'+avatar(p)+'<span class="player-name">'+esc(p.name)+(mine(p)?' <small>(you)</small>':'')+'</span><span class="muted">'+(p.id===game.host?'Host':'Ready')+'</span></div>').join('')+'</div>'+(started?'<button class="button primary-button wide-button" data-action="room-close">Back to the board '+icon('arrow')+'</button>':host?'<button class="button primary-button wide-button" data-action="start-online" '+(game.players.length<2?'disabled':'')+'>Start our game '+icon('arrow')+'</button><p class="small-note">'+(game.players.length<2?'Waiting for at least one more neighbor.':'Everyone here? The host can start whenever you’re ready.')+'</p>':'<p class="game-note">Your host will start the game when everyone is here.</p>')+'<button class="text-button" data-action="leave-room" style="margin:18px auto 0">Leave this room</button>',!started);
}
function tag(type) { const cat=CATEGORIES[type]; return '<span class="card-tag" style="--tag-color:'+cat.color+';--tag-light:'+cat.light+'">'+icon(cat.icon)+cat.name+'</span>'; }
function showCard() {
  const p=activePlayer(game), card=CARDS.find(c=>c.id===game.card), fb=game.feedback, canAnswer=isMyTurn();
  if (!card && fb?.finished) {
    showModal('card','<div class="summary-illustration">'+icon('flag')+'</div><div class="summary-heading"><span class="eyebrow" style="justify-content:center">A NEW CHAPTER</span><h2>'+esc(p.name)+' made it home.</h2><p>'+esc(fb.explanation)+'</p></div><div class="score-grid"><div class="score-tile"><strong>'+p.points+'</strong><span>Points contributed</span></div><div class="score-tile"><strong>'+p.answered+'</strong><span>Perspectives explored</span></div><div class="score-tile"><strong>'+game.players.filter(a=>a.position===FINISH).length+'/'+game.players.length+'</strong><span>Neighbors home</span></div></div>'+(canAnswer?'<button class="button primary-button wide-button" data-action="next">'+(game.players.every(a=>a.position===FINISH)?'See our shared story':'Cheer on the neighborhood')+' '+icon('arrow')+'</button>':'<p class="small-note">Waiting for '+esc(p.name)+' to continue.</p>'),true); return;
  }
  if (!card) return;
  showModal('card','<div style="display:flex;justify-content:space-between;align-items:center">'+tag(card.type)+'<span class="eyebrow" style="font-size:8px">'+esc(p.name.toUpperCase())+' · SPACE '+p.position+'</span></div><h2>'+esc(card.title)+'</h2><span class="eyebrow" style="font-size:8px">'+esc(card.topic.toUpperCase())+'</span><p class="question">'+esc(card.question)+'</p><div class="answer-options">'+card.options.map((option,i)=>'<button class="answer-option '+(fb?(i===card.answer?'correct':i===fb.selected?'wrong':''):'')+'" data-action="answer" data-answer="'+i+'" data-letter="'+String.fromCharCode(65+i)+'" '+(fb||!canAnswer?'disabled':'')+'>'+esc(option)+'</button>').join('')+'</div>'+(fb?'<div class="feedback-box"><span class="earned">+'+fb.points+' community points</span><h3>'+(fb.correct?'A thoughtful choice. A stronger community.':'Every perspective is a chance to learn.')+'</h3><p>'+esc(fb.explanation)+'</p><a class="card-source" href="'+card.source+'" target="_blank" rel="noopener noreferrer">Explore the learning source '+icon('external')+'</a></div>'+(canAnswer?'<button class="button primary-button wide-button" data-action="next">Pass the turn '+icon('arrow')+'</button>':'<p class="small-note">Waiting for '+esc(p.name)+' to pass the turn.</p>'):(!canAnswer?'<p class="small-note">Discuss the choices together. '+esc(p.name)+' will choose an answer.</p>':'')),true);
}
function impact(summary=false) {
  const total=game.players.reduce((n,p)=>n+p.answered,0), correct=game.players.reduce((n,p)=>n+p.correct,0);
  showModal(summary?'summary':'impact',(summary?'<div class="summary-illustration">'+icon('sprout')+'</div><div class="summary-heading"><span class="eyebrow" style="justify-content:center">EVERYONE MADE IT</span><h2>Look what we grew together.</h2><p>Different neighbors. A shared journey. Every small step helped build something better.</p></div>':'<span class="eyebrow">THE DIFFERENCE WE MAKE</span><h2>Small choices.<br>A shared impact.</h2><p>Your answers grow our community and help us explore a healthier neighborhood.</p>')+'<div class="score-grid"><div class="score-tile"><strong>'+game.community+'</strong><span>Community points</span></div><div class="score-tile"><strong>'+total+'</strong><span>Cards explored</span></div><div class="score-tile"><strong>'+correct+'</strong><span>Thoughtful choices</span></div></div>'+(game.community>=100?'<div class="badge-message">'+icon('check','style="display:inline;width:12px;height:12px;vertical-align:middle"')+' Our 100-point community goal: reached together.</div>':'<p class="small-note">'+Math.max(0,100-game.community)+' points to our shared 100-point goal. Every attempt helps.</p>')+Object.entries({air:'Clean air & community voice',water:'Water & neighborhood resilience',green:'Green spaces & shared care'}).map(([key,label])=>'<div class="impact-row"><div><span>'+label+'</span><strong>'+game.health[key]+'%</strong></div><div class="progress-track"><div style="width:'+game.health[key]+'%"></div></div></div>').join('')+'<h3 style="margin-top:25px">Every neighbor made a difference.</h3>'+game.players.map(p=>'<div class="contribution-row">'+avatar(p)+'<div><div class="player-name">'+esc(p.name)+'</div><div class="player-status">'+p.answered+' cards explored · '+p.correct+' thoughtful choices</div></div><strong>+'+p.points+'</strong></div>').join('')+(summary?'<h3>Take it beyond the board.</h3><p>What environmental challenge did you notice? Whose voice needs to be heard? What could your class do together?</p><div class="modal-actions"><button class="button white-button" data-action="download-summary">'+icon('copy')+' Save our story</button><button class="button primary-button" data-action="new-game">Play again '+icon('arrow')+'</button></div>':'<p class="small-note">These are fictional game indicators, not measurements of real environmental conditions.</p><button class="button primary-button wide-button" data-action="close">Back to the neighborhood '+icon('arrow')+'</button>')); }
function library(type='knowledge') {
  showModal('library','<span class="eyebrow">A DIFFERENT PERSPECTIVE</span><h2>A little learning<br>goes a long way.</h2><p>Explore the deck. In the game, the space you land on draws a random card from its category.</p><div class="mode-tabs library-tabs">'+Object.entries(CATEGORIES).map(([key,c])=>'<button class="'+(key===type?'active':'')+'" data-action="library-tab" data-type="'+key+'">'+c.name+'</button>').join('')+'</div>'+CARDS.filter(c=>c.type===type).map(c=>'<div class="library-item"><span class="eyebrow" style="font-size:7px">'+esc(c.topic.toUpperCase())+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.question)+'</p><details><summary class="text-button" style="cursor:pointer;display:list-item;margin-top:8px">Explore this perspective</summary><p style="margin-top:8px">'+esc(c.explanation)+'</p><a class="card-source" target="_blank" rel="noopener noreferrer" href="'+c.source+'">Learning source '+icon('external')+'</a></details></div>').join(''));
}
function sources() { showModal('sources','<span class="eyebrow">KEEP YOUR CURIOSITY GROWING</span><h2>Beyond the board.</h2><p>Our fictional scenarios introduce real environmental ideas. These resources offer more context for learners and educators.</p><ul class="sources-list"><li><a href="https://www.epa.gov/sites/default/files/2015-02/documents/ips-final-report.pdf" target="_blank" rel="noopener noreferrer">EPA: environmental justice and public participation</a><span class="source-description">A historical EPA report describing fair treatment and meaningful community involvement.</span></li><li><a href="https://www.epa.gov/green-infrastructure/benefits-green-infrastructure" target="_blank" rel="noopener noreferrer">EPA: benefits of green infrastructure</a><span class="source-description">How green infrastructure can support water quality, resilience, and communities.</span></li><li><a href="https://www.epa.gov/heatislands/benefits-trees-and-vegetation" target="_blank" rel="noopener noreferrer">EPA: benefits of trees and vegetation</a><span class="source-description">How trees and vegetation can help cool urban areas.</span></li></ul><div class="game-note">The game simplifies complex issues for discussion. Real projects involve trade-offs, local expertise, sustained funding, and community leadership. There is no single solution for every neighborhood.</div>'); }
function showActivity() { showModal('activity','<span class="eyebrow">AROUND THE NEIGHBORHOOD</span><h2>Our story so far.</h2><p>Every turn is a small part of something shared.</p><div class="history-list">'+game.history.map(h=>'<div class="history-item">'+icon(CATEGORIES[h.type]?.icon||'sprout')+'<span>'+esc(h.text)+'</span></div>').join('')+'</div>'); }
function inspectSpace(position) {
  const residents=game.players.filter(p=>p.position===position);
  const c=CATEGORIES[categoryAt(position)];
  showModal('space',(position===0?'<span class="eyebrow">THE FIRST SMALL STEP</span><h2>Start something good.</h2><p>Every neighbor begins here, with the same opportunity to learn and contribute.</p>':position===FINISH?'<span class="eyebrow">THE PLACE WE’RE BUILDING</span><h2>Common Ground.</h2><p>Our shared finish line. The game ends when every neighbor arrives, and everyone’s contributions are celebrated.</p>':tag(categoryAt(position))+'<h2>Space '+position+': '+c.name.toLowerCase()+'.</h2><p>'+({knowledge:'Learn about environmental justice, green spaces, water, and a community’s right to participate.',challenge:'Consider a neighborhood challenge and explore a thoughtful way forward.',action:'Discover how neighbors can work together to create lasting change.'}[categoryAt(position)])+'</p>')+(residents.length?'<h3>Your neighbors here</h3>'+residents.map(p=>'<div class="lobby-player">'+avatar(p)+'<span class="player-name">'+esc(p.name)+'</span></div>').join(''):'')+'<button class="button primary-button wide-button" data-action="close">Back to the board '+icon('arrow')+'</button>');
}

async function api(path, body, auth = true) {
  const response = await fetch(API_BASE+'/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(auth&&session?{'Authorization':'Bearer '+session.token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  let result; try { result=await response.json(); } catch { throw new Error('The game service is unavailable. Please try again.'); }
  if(!response.ok) { const error = new Error(result.error||'Could not update the game. Try again.'); error.status=response.status; throw error; }
  return result;
}
async function perform(action,data={}) {
  if(busy) return;
  try {
    if(action==='spin') {
      busy=true; render(); $('#wheel-result').textContent='';
      const next=online?(await api('rooms/'+session.code+'/action',{action,...data})).game:takeAction(game,activePlayer(game).id,action,data);
      const target=(360-((next.lastSpin-1)*36+18))%360;
      wheelRotation=Math.ceil(wheelRotation/360)*360+1440+target;
      $('#wheel').style.transform='rotate('+wheelRotation+'deg)';
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      await new Promise(resolve=>setTimeout(resolve,reduced?100:2350));
      game=next; $('#wheel-result').textContent=game.lastSpin; busy=false; render();
      announce(activePlayer(game).name+' spun '+game.lastSpin+' and moved to space '+activePlayer(game).position+'.');
      showCard();
    } else {
      busy=true;
      modal.querySelectorAll('[data-action="answer"],[data-action="next"],[data-action="start-online"]').forEach(b=>b.disabled=true);
      const previous=game;
      game=online?(await api('rooms/'+session.code+'/action',{action,...data})).game:takeAction(game,activePlayer(game).id,action,data);
      busy=false; render();
      if (game.status==='complete') impact(true);
      else if(action==='answer') { showCard(); announce('You contributed '+game.feedback.points+' community points.'); }
      else { modal.close(); currentModal=''; if (action==='next') { toast(activePlayer(game).name+'’s turn. '+(online?'Let’s keep growing.':'Pass the device.')); announce(activePlayer(game).name+'’s turn.'); } }
    }
  } catch(error) { busy=false; render(); toast(error.message); if(game.phase!=='spin' && currentModal==='card') showCard(); }
}
async function pollRoom() {
  if(!online||!session||busy) return;
  try {
    const result=await api('rooms/'+session.code);
    pollErrors=0;
    if(result.game.revision!==game.revision) {
      const beforePhase=game.phase, beforeTurn=activePlayer(game)?.id;
      game=result.game; render();
      if(game.status==='complete') impact(true);
      else if(game.status==='lobby') showLobby();
      else if(game.phase!=='spin') showCard();
      else if(['lobby','card'].includes(currentModal)) { modal.close(); currentModal=''; }
      if(beforeTurn!==activePlayer(game)?.id) announce(activePlayer(game).name+'’s turn.');
    }
    $('#session-label').classList.remove('connection-error');
  } catch(error) {
    if(error.status===404||error.status===401) { online=false; session=null; setStorage('common-ground-session-v1',null); game=readStorage('common-ground-local-v1',game); modal.close(); currentModal=''; render(); toast('That room is no longer available. Your shared-device game is ready.'); }
    else if(++pollErrors>=3) { $('#session-label').classList.add('connection-error'); $('#session-label').textContent='Reconnecting to room '+session.code+'…'; }
  }
}
async function connectRoom(form) {
  const button=form.querySelector('[type="submit"]'); button.disabled=true; button.textContent='Connecting…';
  try {
    const name=$('#online-name').value.trim(), mode=form.dataset.mode;
    const result=await api(mode==='create'?'rooms':'rooms/'+$('#room-code').value.trim().toUpperCase()+'/join',{name,character:selectedCharacter},false);
    session={code:result.code,token:result.token,playerId:result.playerId}; online=true;game=result.game;
    setStorage('common-ground-session-v1',session); const url=new URL(location.href);url.searchParams.delete('room');history.replaceState({},'',url);render();showLobby();
  } catch(error) { $('#online-error').innerHTML='<div class="error-message">'+esc(error.message)+'</div>'; button.disabled=false;button.innerHTML=(form.dataset.mode==='create'?'Create our room':'Join the neighborhood')+' '+icon('arrow'); }
}
async function leaveRoom() {
  try { await api('rooms/'+session.code+'/leave',{}); } catch(error) { if(error.status!==404) { toast(error.message); return; } }
  online=false;session=null;setStorage('common-ground-session-v1',null);game=readStorage('common-ground-local-v1',null)||newGame(['Alex','Maya'].map((n,i)=>makePlayer(n,CHARACTERS[i].id)));modal.close();currentModal='';render();toast('You left the room. Your shared-device game is ready.');
}
function saveSummary() {
  const text='COMMON GROUND — Our shared story\n\nCommunity points: '+game.community+' / 100\nCards explored: '+game.players.reduce((s,p)=>s+p.answered,0)+'\n\nOur neighbors\n'+game.players.map(p=>p.name+': '+p.points+' points, '+p.answered+' cards explored').join('\n')+'\n\nKeep the conversation growing\nWhat environmental challenge did you notice?\nWhose voice needs to be heard?\nWhat could your class do together?\n';
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='common-ground-our-story.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',async event=>{
  const space=event.target.closest('[data-space]');if(space){inspectSpace(Number(space.dataset.space));return;}
  const target=event.target.closest('[data-action]');if(!target||target.disabled)return;
  const action=target.dataset.action;
  if(action==='play') { closeModal(); $('#game').scrollIntoView({behavior:'smooth'}); }
  else if(action==='close') closeModal();
  else if(action==='instructions') instructions();
  else if(action==='mission') purpose();
  else if(action==='new-game'||action==='players') { if(online) showLobby(); else setup(); }
  else if(action==='invite'||action==='invite-create') invite('create');
  else if(action==='invite-join') invite('join');
  else if(action==='character') { selectedCharacter=target.dataset.character;document.querySelectorAll('.character-choice').forEach(b=>{b.classList.toggle('selected',b.dataset.character===selectedCharacter);b.setAttribute('aria-pressed',b.dataset.character===selectedCharacter);}); }
  else if(action==='add-player') { const rows=$$('#setup-players .setup-player');if(rows.length>=6){toast('There’s room for up to six neighbors.');return;}const used=rows.map(r=>r.querySelector('select').value);const c=CHARACTERS.find(c=>!used.includes(c.id));$('#setup-players').insertAdjacentHTML('beforeend',setupRow({name:'',character:c?.id||'leaf'},rows.length)); }
  else if(action==='remove-player') { if($$('#setup-players .setup-player').length<=2){toast('A community needs at least two neighbors.');return;}target.closest('.setup-player').remove(); }
  else if(action==='start-local') {
    try { const players=$$('#setup-players .setup-player').map(row=>makePlayer(row.querySelector('input').value,row.querySelector('select').value));if(new Set(players.map(p=>p.character)).size!==players.length) throw new Error('Choose a different piece for each neighbor.');if(new Set(players.map(p=>p.name.toLowerCase())).size!==players.length)throw new Error('Give each neighbor a different name.');game=newGame(players);$('#wheel-result').textContent='↗';modal.close();currentModal='';render();toast('Welcome, neighbors. '+players[0].name+' goes first.'); } catch(error){$('#setup-error').innerHTML='<div class="error-message">'+esc(error.message)+'</div>';}
  }
  else if(action==='spin') { if(game.status==='complete')impact(true);else if(game.status==='lobby')showLobby();else if(game.phase==='spin')await perform('spin');else showCard(); }
  else if(action==='answer') await perform('answer',{answer:Number(target.dataset.answer)});
  else if(action==='next') await perform('next');
  else if(action==='start-online') { await perform('start'); }
  else if(action==='room-close') {modal.close();currentModal='';if(game.phase!=='spin')showCard();}
  else if(action==='leave-room') await leaveRoom();
  else if(action==='copy-invite') { const url=new URL(location.href);url.searchParams.set('room',session.code);try{await navigator.clipboard.writeText(url.toString());toast('Invitation link copied. Share it with your neighbors.');}catch{toast('Share room code '+session.code+' with your neighbors.');} }
  else if(action==='impact') impact();
  else if(action==='library') library(target.dataset.type||'knowledge');
  else if(action==='library-tab') library(target.dataset.type);
  else if(action==='activity')showActivity();
  else if(action==='sources')sources();
  else if(action==='download-summary')saveSummary();
  else if(action==='fullscreen') {const panel=$('.board-panel');panel.classList.toggle('board-expanded');target.setAttribute('aria-label',panel.classList.contains('board-expanded')?'Close expanded board':'Expand game board');}
});
function $$(selector) {return [...document.querySelectorAll(selector)];}
document.addEventListener('submit',event=>{if(event.target.id==='online-form'){event.preventDefault();connectRoom(event.target);}});
document.addEventListener('keydown',event=>{if(event.key==='Escape')$('.board-panel').classList.remove('board-expanded');if((event.key==='Enter'||event.key===' ')&&event.target.hasAttribute('data-space')){event.preventDefault();inspectSpace(Number(event.target.dataset.space));}});
document.addEventListener('change',event=>{if(event.target.matches('.setup-player select')){const row=event.target.closest('.setup-player');row.querySelector('.player-avatar').outerHTML=avatar({character:event.target.value});}});
$('#deck-grid').innerHTML=Object.entries(CATEGORIES).map(([key,c])=>'<button class="deck-card" data-action="library" data-type="'+key+'" style="--deck-light:'+c.light+';--deck-color:'+c.color+';--deck-shadow:'+c.color+'25"><span class="deck-visual">'+icon(c.icon)+'</span><span><h3>'+c.name+' cards</h3><p>'+c.short+'</p></span><span class="deck-arrow">'+icon('arrow')+'</span></button>').join('');
hydrateIcons();buildBoard();buildWheel();render();
setInterval(pollRoom,1800);
async function init() {
  if(session) {
    try {const result=await api('rooms/'+session.code);online=true;game=result.game;render();if(game.status==='lobby')showLobby();else if(game.status==='complete')impact(true);else if(game.phase!=='spin')showCard();return;}
    catch(error){if(error.status===404||error.status===401){session=null;setStorage('common-ground-session-v1',null);}else toast('Could not reconnect to your online room. Reload to try again.');}
  }
  const room=new URL(location.href).searchParams.get('room');
  if(room && /^[A-Z2-9]{6}$/i.test(room))invite('join');
  else if(game.status==='complete')impact(true);
  else if(game.phase!=='spin')showCard();
}
init();
