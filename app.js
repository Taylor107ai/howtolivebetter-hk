'use strict';
const $ = id => document.getElementById(id);
const entries = [...document.querySelectorAll('[data-entry]')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const index = entries.map(el => ({el,text:el.textContent.toLowerCase()}));
let toastTimer, searchTimer;
function toast(text){ $('toast').textContent=text; $('toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').hidden=true,2400); }
function search(){
  const q=$('search').value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);
  let shown=0;
  for(const item of index){const match=terms.every(t=>item.text.includes(t));item.el.hidden=!match;if(match)shown++;}
  for(const section of chapters)section.hidden=![...section.querySelectorAll('[data-entry]')].some(el=>!el.hidden);
  $('directory').hidden=!!q; $('longforms').hidden=!!q; $('search-status').hidden=!q; $('clear-search').hidden=!q;
  $('search-status').textContent=`「${$('search').value.trim()}」：${shown} 條相關建議`;
  $('empty').hidden=!q||shown>0;
  document.body.classList.toggle('searching',!!q);
}
function clearSearch(){ $('search').value='';clearTimeout(searchTimer);search(); }
$('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,150);});
$('clear-search').addEventListener('click',()=>{clearSearch();$('search').focus();});
$('open-toc').addEventListener('click',()=>$('toc-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));

function go(hash){
  let target=$(decodeURIComponent(hash.replace(/^#/,'')));if(!target)return;
  if($('search').value)clearSearch();
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(target.matches('details'))target.open=true;
  for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.matches('details'))parent.open=true;
  requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'instant'});target.classList.remove('flash');void target.offsetWidth;target.classList.add('flash');});
}
document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href^="#"]');if(!a)return;
  const href=a.getAttribute('href');if(!$(href.slice(1)))return;
  ev.preventDefault();history.pushState(null,'',location.pathname+href);go(href);
});
window.addEventListener('hashchange',()=>go(location.hash));
window.addEventListener('popstate',()=>go(location.hash||'#directory'));

async function share(id){
  const url=new URL(location.pathname,location.origin); if(id)url.hash=id;
  const target=id?$(id):null;
  const title=target?.querySelector('h3,h2')?.textContent||'高性價比人生指南・繁體閱讀版';
  if(navigator.share){try{await navigator.share({title,url:url.href});return;}catch(e){if(e.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(url.href);toast('連結已複製，可以傳俾朋友');}
  catch{ $('copy-url').value=url.href;$('copy-dialog').showModal();$('copy-url').select(); }
}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-share]');if(b)share(b.dataset.share);});
$('share-page').addEventListener('click',()=>share(location.hash.slice(1)));
$('copy-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('copy-url').value);$('copy-dialog').close();toast('連結已複製');}catch{$('copy-url').focus();$('copy-url').select();toast('長按連結，再揀複製');}});
if(location.hash)requestAnimationFrame(()=>go(location.hash));
