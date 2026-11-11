import { CHARACTERS, FINISH, makePlayer, newGame, takeAction, randomInt, log } from '../src/game.js';

// The build embeds the complete HTML/CSS/JS application here, producing one Worker.
const HTML = '__COMMON_GROUND_HTML__';
const DAY = 24 * 60 * 60 * 1000;
const PAGES_ORIGIN = 'https://emoon0108.github.io';
function allowedOrigin(origin,url) { return !origin || origin===url.origin || origin===PAGES_ORIGIN; }
function cors(response,request,url) {
  const origin=request.headers.get('origin');
  if(origin && allowedOrigin(origin,url)) {
    response.headers.set('Access-Control-Allow-Origin',origin);
    response.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age','600');
    response.headers.set('Vary','Origin');
  }
  return response;
}
class HttpError extends Error { constructor(status,message) { super(message);this.status=status; } }
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function hash(token) { const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''); }
function token() { return crypto.randomUUID()+crypto.randomUUID(); }
function roomCode() { const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join(''); }
async function parseBody(request) {
  if(Number(request.headers.get('content-length'))>8192)throw new HttpError(413,'That request is too large.');
  const text=await request.text();if(text.length>8192)throw new HttpError(413,'That request is too large.');
  try {const body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();return body;}catch{throw new HttpError(400,'Please send a valid game request.');}
}
async function loadRoom(db,code) {
  const row=await db.prepare('SELECT code,state,members,revision,updated_at FROM rooms WHERE code = ?').bind(code).first();
  if(!row || row.updated_at<Date.now()-DAY)throw new HttpError(404,'This room has expired or does not exist. Check the code, or create a new room.');
  return {...row,game:JSON.parse(row.state),members:JSON.parse(row.members)};
}
async function saveRoom(db,room,game,members=room.members) {
  const revision=room.revision+1;game.revision=revision;
  const result=await db.prepare('UPDATE rooms SET state = ?, members = ?, revision = ?, updated_at = ? WHERE code = ? AND revision = ?').bind(JSON.stringify(game),JSON.stringify(members),revision,Date.now(),room.code,room.revision).run();
  if(!result.meta.changes)throw new HttpError(409,'The room just changed. Please try that again.');
  return game;
}
async function authenticate(request,room) {
  const auth=request.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer ')||auth.length>200)throw new HttpError(401,'Rejoin this room to continue.');
  const digest=await hash(auth.slice(7));
  const member=Object.entries(room.members).find(([id,t])=>t===digest);
  if(!member)throw new HttpError(401,'Rejoin this room to continue.');
  return member[0];
}
async function handleAPI(request,env,url) {
  if(!env.DB)throw new HttpError(503,'Online rooms are unavailable right now. Shared-device play is ready to use.');
  if(request.method==='POST'&&!allowedOrigin(request.headers.get('origin'),url))throw new HttpError(403,'Open the game directly to continue.');
  const path=url.pathname.replace(/\/$/,'');
  if(path==='/api/rooms'&&request.method==='POST') {
    const body=await parseBody(request);
    let player;try{player=makePlayer(body.name,body.character);}catch(e){throw new HttpError(400,e.message);}
    const t=token(),game=newGame([player],'online'),members={[player.id]:await hash(t)};
    const code=roomCode();
    await env.DB.prepare('INSERT INTO rooms (code,state,members,revision,updated_at) VALUES (?, ?, ?, 0, ?)').bind(code,JSON.stringify(game),JSON.stringify(members),Date.now()).run();
    if(randomInt(10)===0)await env.DB.prepare('DELETE FROM rooms WHERE updated_at < ?').bind(Date.now()-DAY).run();
    return json({code,token:t,playerId:player.id,game},201);
  }
  const match=path.match(/^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|action|leave))?$/);
  if(!match)throw new HttpError(404,'That game route does not exist.');
  const [,code,operation]=match,room=await loadRoom(env.DB,code);
  if(operation==='join'&&request.method==='POST') {
    if(room.game.status!=='lobby')throw new HttpError(409,'This game has already started. Join a new room before it begins.');
    if(room.game.players.length>=6)throw new HttpError(409,'This room is full. A room has space for six neighbors.');
    const body=await parseBody(request);
    let player;try{player=makePlayer(body.name,body.character);}catch(e){throw new HttpError(400,e.message);}
    if(room.game.players.some(p=>p.character===player.character))throw new HttpError(409,'A neighbor has that piece. Choose a different character.');
    if(room.game.players.some(p=>p.name.toLowerCase()===player.name.toLowerCase()))throw new HttpError(409,'A neighbor has that name. Add an initial or choose another name.');
    const t=token();room.game.players.push(player);room.members[player.id]=await hash(t);log(room.game,player.name+' joined the neighborhood.','start');
    const game=await saveRoom(env.DB,room,room.game,room.members);
    return json({code,token:t,playerId:player.id,game},201);
  }
  const playerId=await authenticate(request,room);
  if(!operation&&request.method==='GET')return json({game:room.game,code});
  if(operation==='action'&&request.method==='POST') {
    const body=await parseBody(request);
    if(!['start','spin','answer','next'].includes(body.action))throw new HttpError(400,'Choose a valid game action.');
    let next;try{next=takeAction(room.game,playerId,body.action,{answer:body.answer});}catch(e){throw new HttpError(409,e.message);}
    return json({game:await saveRoom(env.DB,room,next)});
  }
  if(operation==='leave'&&request.method==='POST') {
    const game=room.game,previousCurrentId=game.players[game.turn]?.id,index=game.players.findIndex(p=>p.id===playerId),player=game.players[index];
    game.players.splice(index,1);delete room.members[playerId];
    if(!game.players.length) {await env.DB.prepare('DELETE FROM rooms WHERE code = ? AND revision = ?').bind(code,room.revision).run();return json({left:true});}
    if(game.host===playerId)game.host=game.players[0].id;
    if(previousCurrentId===playerId) {game.turn=index%game.players.length;game.phase='spin';game.card=null;game.feedback=null;}
    else game.turn=game.players.findIndex(p=>p.id===previousCurrentId);
    if(game.status==='playing') {
      if(game.players.every(p=>p.position===FINISH))game.status='complete';
      else while(game.players[game.turn].position===FINISH)game.turn=(game.turn+1)%game.players.length;
    }
    log(game,player.name+' left the neighborhood.','start');await saveRoom(env.DB,room,game,room.members);return json({left:true});
  }
  throw new HttpError(405,'That request method is not supported.');
}
export default {
  async fetch(request,env={}) {
    const url=new URL(request.url);
    try {
      if(url.pathname.startsWith('/api/')) {
        if(request.method==='OPTIONS')return cors(new Response(null,{status:allowedOrigin(request.headers.get('origin'),url)?204:403}),request,url);
        return cors(await handleAPI(request,env,url),request,url);
      }
      if(url.pathname==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
      if(url.pathname!=='/'&&url.pathname!=='/index.html')return new Response('Not found',{status:404});
      return new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'"}});
    } catch(error) {
      if(error instanceof HttpError)return cors(json({error:error.message},error.status),request,url);
      return cors(json({error:'The neighborhood service is taking a break. Please try again shortly.'},503),request,url);
    }
  }
};
