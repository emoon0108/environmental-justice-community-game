import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const repository=process.env.GITHUB_REPOSITORY||'emoon0108/environmental-justice-community-game';
if(!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(repository))throw new Error('Invalid repository name.');
async function api(path,method='GET',body) {
  const args=['api','repos/'+repository+path,'--method',method];
  if(body)args.push('--input','-');
  const output=execFileSync('gh',args,{encoding:'utf8',...(body?{input:JSON.stringify(body)}:{})});
  return output.trim()?JSON.parse(output):null;
}
const content=(await readFile(new URL('../pages/index.html',import.meta.url))).toString('base64');
const current=await api('/contents/index.html?ref=gh-pages');
if(current.content.replace(/\s/g,'')!==content) {
  await api('/contents/index.html','PUT',{branch:'gh-pages',message:'Publish tested Common Ground build',sha:current.sha,content});
  // GITHUB_TOKEN pushes do not trigger Pages automatically, so request the build.
  await api('/pages/builds','POST',{});
  console.log('Updated the GitHub Pages branch and requested publication.');
} else console.log('GitHub Pages already has this exact build.');
