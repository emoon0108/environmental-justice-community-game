import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);mkdirSync('.local',{recursive:true});
const db=new DatabaseSync('.local/rooms.sqlite');
db.exec('PRAGMA journal_mode=WAL');
const exists=db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'rooms'").get();
if(!exists)db.exec(readFileSync('drizzle/0000_rooms.sql','utf8').replaceAll('--> statement-breakpoint',''));
const DB = {
  prepare(sql) {
    return {
      bind(...args) {
        const stmt = db.prepare(sql);
        return {
          async first() { return stmt.get(...args) || null; },
          async run() {
            const result = stmt.run(...args);
            return { meta: { changes: Number(result.changes) } };
          }
        };
      }
    };
  }
};
let worker,previous='';
async function refresh() {
  const sources=['src/index.html','src/styles.css','src/app.js','src/game.js','worker/index.js'];
  const next=sources.map(p=>readFileSync(p,'utf8')).join('');
  if(next!==previous){execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'pipe'});worker=(await import('file://'+resolve('dist/server/index.js')+'?v='+Date.now())).default;previous=next;}
}
await refresh();
const port=Number(process.env.PORT||4173);
const server=createServer(async(req,res)=>{
  try {
    await refresh();const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(value)headers.set(key,Array.isArray(value)?value.join(','):value);}
    const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
    const result=await worker.fetch(request,{DB});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
  }catch(error){console.error(error);res.writeHead(500);res.end('Preview unavailable. Check the local terminal.');}
});
server.listen(port,'0.0.0.0',()=>console.log('Common Ground is ready. Local: http://localhost:'+port));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
