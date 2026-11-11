import { readFile } from 'node:fs/promises';
const repository=process.env.GITHUB_REPOSITORY;
const token=process.env.GITHUB_TOKEN;
if(!repository||!token)throw new Error('Run this publisher in the repository’s GitHub Actions workflow.');
const base='https://api.github.com/repos/'+repository;
async function api(path,method='GET',body) {
  const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw new Error('GitHub Pages publishing request failed: HTTP '+response.status);
  return response.status===204?null:response.json();
}
const content=(await readFile(new URL('../pages/index.html',import.meta.url))).toString('base64');
const current=await api('/contents/index.html?ref=gh-pages');
if(current.content.replace(/\s/g,'')!==content) {
  await api('/contents/index.html','PUT',{branch:'gh-pages',message:'Publish tested Common Ground build',sha:current.sha,content});
  // GITHUB_TOKEN pushes do not trigger Pages automatically, so request the build.
  await api('/pages/builds','POST',{});
  console.log('Updated the GitHub Pages branch and requested publication.');
} else console.log('GitHub Pages already has this exact build.');
