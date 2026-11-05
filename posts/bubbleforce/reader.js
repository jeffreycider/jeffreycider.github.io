/* Read-only manuscript: math, marginal notes, and media controls. */
(()=>{'use strict';
const citation=document.getElementById('bibtex'),copyCitation=document.getElementById('copy-citation'),citationStatus=document.getElementById('citation-status');
if(citation&&copyCitation){
 let resetCopy;
 const copy=async()=>{
  let copied=false;
  try{await navigator.clipboard.writeText(citation.textContent);copied=true}catch{
   const range=document.createRange();range.selectNodeContents(citation);
   const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
   try{copied=document.execCommand('copy')}catch{}
   if(copied)selection.removeAllRanges();
  }
  clearTimeout(resetCopy);
  copyCitation.textContent=copied?'Copied!':'Copy BibTeX';
  citationStatus.textContent=copied?'BibTeX copied to clipboard.':'Citation selected. Use your browser’s Copy command.';
  if(copied)resetCopy=setTimeout(()=>{copyCitation.textContent='Copy BibTeX';citationStatus.textContent='Tap the citation to copy.'},2500);
 };
 copyCitation.addEventListener('click',copy);
 citation.closest('pre').addEventListener('click',()=>{if(!window.getSelection().toString())copy()});
}
const flow=document.querySelector('.paper-flow'),noteColumn=document.querySelector('.footnote-column'),columns=document.querySelector('.manuscript-columns');
const footnoteNodes=[...document.querySelectorAll('.marginal-note')];let noteFrame=0;
function fitDisplayMath(){
 for(const container of flow.querySelectorAll('.rendered mjx-container[display="true"]')){
  const svg=container.querySelector(':scope > svg');if(!svg||!container.getClientRects().length)continue;
  if(!('mathWidth' in svg.dataset))svg.dataset.mathWidth=svg.getAttribute('width')==='100%'?(svg.style.minWidth||container.style.minWidth||'100%'):svg.getAttribute('width');
  svg.style.width=svg.dataset.mathWidth;svg.style.height='';svg.style.transform='';
  const box=svg.getBoundingClientRect(),ink=(svg.querySelector(':scope > g')||svg).getBoundingClientRect(),available=container.getBoundingClientRect().width;
  if(!box.width||!box.height||!available)continue;
  const scale=Math.min(1,available/(ink.width+4)),offset=box.width/2-((ink.left+ink.right)/2-box.left);
  svg.style.width=box.width+'px';svg.style.height=box.height+'px';svg.style.transform=`translateX(${offset*scale}px) scale(${scale})`;
  container.style.height=(box.height*scale)+'px';
 }
}

function layoutFootnotes(){
 const mobile=matchMedia('(max-width:700px)').matches;
 if(mobile){noteColumn.style.minHeight='';for(const note of footnoteNodes){const anchor=document.getElementById(note.dataset.anchor),row=anchor?.closest('.asset-row');if(!row)continue;let slot=row.querySelector(':scope > .notes-for-row');if(!slot){slot=document.createElement('aside');slot.className='notes-for-row';slot.setAttribute('aria-label','Footnotes');row.append(slot)}if(note.parentNode!==slot)slot.append(note);note.style.top=''}return}
 for(const note of footnoteNodes)if(note.parentNode!==noteColumn)noteColumn.append(note);
 let bottom=0;const top=columns.getBoundingClientRect().top;
 for(const note of footnoteNodes){const anchor=document.getElementById(note.dataset.anchor);if(!anchor)continue;const reference=anchor.getClientRects().length?anchor:anchor.closest('.asset-row');const y=Math.max(0,(reference?.getBoundingClientRect().top??top)-top,bottom);note.style.top=y+'px';bottom=y+note.getBoundingClientRect().height+20}
 const minHeight=bottom?Math.ceil(bottom)+'px':'';if(noteColumn.style.minHeight!==minHeight)noteColumn.style.minHeight=minHeight;
}
function scheduleNotes(){cancelAnimationFrame(noteFrame);noteFrame=requestAnimationFrame(()=>{fitDisplayMath();layoutFootnotes()})}

new ResizeObserver(scheduleNotes).observe(flow);new ResizeObserver(scheduleNotes).observe(noteColumn);
window.addEventListener('resize',scheduleNotes);document.fonts?.ready.then(scheduleNotes);document.addEventListener('load',scheduleNotes,true);
// HTML pretty-printers may wrap TeX text labels. MathJax preserves their
// indentation, so collapse only ordinary whitespace inside these text commands.
const mathTextNodes=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
while(mathTextNodes.nextNode()){
 const node=mathTextNodes.currentNode;
 if(node.parentElement.closest('script,style,pre,code'))continue;
 node.nodeValue=node.nodeValue.replace(/(\\(?:text|textrm|textbf|textit|textnormal|mbox|tag)\{)([^{}]*)(\})/g,(_,start,label,end)=>start+label.replace(/\s+/g,' ')+end);
}
window.bubbleforceReady=MathJax.startup.promise.then(()=>MathJax.typesetPromise([document.querySelector('main')])).then(()=>{scheduleNotes();return new Promise(resolve=>requestAnimationFrame(resolve))});
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const kind=e.data?.type;if(!['blog-root-height','qwilfish-height','aipom-height'].includes(kind))return;for(const frame of document.querySelectorAll('.root-card iframe,.player-frame'))if(frame.contentWindow===e.source){const h=Number(e.data.height);if(Number.isFinite(h))frame.style.height=Math.max(220,Math.min(1200,h))+'px'}});

// Full local media objects support reliable seeking even when hosted range requests do not.
const mediaCache=new Map();function prepareVideo(video){if(video.dataset.ready==='true')return Promise.resolve();if(video._readyPromise)return video._readyPromise;video._readyPromise=(async()=>{video.dataset.loading='true';const url=video.dataset.originalSrc||video.getAttribute('src')||video.querySelector('source')?.getAttribute('src');video.dataset.originalSrc=url;try{if(!mediaCache.has(url))mediaCache.set(url,fetch(url,{credentials:'same-origin'}).then(async response=>{if(!response.ok)throw Error('Video download failed');return URL.createObjectURL(await response.blob())}).catch(e=>{mediaCache.delete(url);throw e}));const blob=await mediaCache.get(url);const wasPlaying=!video.paused,at=video.currentTime;video.src=blob;video.preload='auto';video.load();await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',reject,{once:true})});video.dataset.ready='true';if(at>0)video.currentTime=Math.min(at,video.duration);if(wasPlaying)video.play().catch(()=>{})}catch{video.dataset.loading='false';video._readyPromise=null;video.addEventListener('pointerdown',()=>prepareVideo(video),{once:true});throw Error('Video download failed')}})();return video._readyPromise}
const mediaObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){prepareVideo(e.target).catch(()=>{});mediaObserver.unobserve(e.target)}},{rootMargin:'600px'});document.querySelectorAll('video').forEach(video=>{video.controls=false;video.removeAttribute('controls');installVideoControls(video);mediaObserver.observe(video)});
function installVideoControls(video){
 if(video.closest('#figure-11'))return installPlanetSlides(video);
 const wrapper=document.createElement('div');wrapper.className='media-player';video.before(wrapper);wrapper.append(video);
 const bar=document.createElement('div');bar.className='media-controls';bar.innerHTML='<button type="button" class="media-play" aria-label="Play video">Play</button><input type="range" class="media-seek" min="0" max="1" value="0" step="0.01" disabled aria-label="Seek video"><output class="media-time">0:00 / 0:00</output><button type="button" class="media-fullscreen" aria-label="Fullscreen video">⛶</button>';wrapper.append(bar);
 const play=bar.querySelector('.media-play'),seek=bar.querySelector('input'),time=bar.querySelector('output');
 const clock=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
 const update=()=>{const duration=Number.isFinite(video.duration)?video.duration:0;seek.disabled=!duration;seek.max=duration||1;seek.value=video.currentTime;time.value=clock(video.currentTime)+' / '+clock(duration);play.textContent=video.paused?(video.ended?'Replay':'Play'):'Pause';play.setAttribute('aria-label',video.paused?'Play video':'Pause video')};
 play.onclick=async()=>{if(!video.paused){video.pause();return}play.disabled=true;try{await prepareVideo(video);if(video.ended)video.currentTime=0;await video.play()}catch{play.textContent='Retry'}finally{play.disabled=false}};
 seek.oninput=()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)};
 ['loadedmetadata','durationchange','timeupdate','play','pause','ended','seeked'].forEach(name=>video.addEventListener(name,update));
 bar.querySelector('.media-fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else wrapper.requestFullscreen?.()};update();
}

function installPlanetSlides(video){
 const clips=[[0,3.5],[3.5,9],null];let slide=0,raf=0,revision=0,loading=false;
 const wrapper=document.createElement('div');wrapper.className='media-player planet-slides';video.before(wrapper);
 const head=document.createElement('div');head.className='planet-player-heading';head.innerHTML='<output class="slide-number" aria-live="polite">1 / 3</output><button type="button" class="media-fullscreen" aria-label="Fullscreen slideshow">⛶</button>';
 const bar=document.createElement('nav');bar.className='slide-controls';bar.setAttribute('aria-label','Uranus slides');bar.innerHTML='<button type="button" class="slide-prev" aria-label="Previous slide">◀ Prev</button><button type="button" class="slide-replay" aria-label="Replay current slide">↻ Replay</button><button type="button" class="slide-next" aria-label="Next slide">Next ▶</button>';
 const seekBar=document.createElement('div');seekBar.className='media-controls slide-seek';seekBar.innerHTML='<button type="button" class="media-play" aria-label="Play slide">Play</button><input class="media-seek" type="range" min="0" max="3.5" step="0.01" value="0" disabled aria-label="Seek within current slide"><output class="media-time"></output>';
 const still=document.createElement('img');still.className='planet-still';still.src=video.poster;still.alt='At 932× magnification, Uranus and Mars have grown 4.1×; the comparison star has grown much less.';still.hidden=true;
 wrapper.append(head,video,still,seekBar,bar);
 const prev=bar.querySelector('.slide-prev'),next=bar.querySelector('.slide-next'),replay=bar.querySelector('.slide-replay'),play=seekBar.querySelector('.media-play'),seek=seekBar.querySelector('input');
 function update(){
  const isStill=clips[slide]===null;
  wrapper.classList.toggle('is-still',isStill);video.hidden=isStill;still.hidden=!isStill;seekBar.hidden=isStill;replay.hidden=isStill;
  prev.disabled=slide===0;next.disabled=slide===clips.length-1;head.querySelector('.slide-number').textContent=(slide+1)+' / '+clips.length;
  if(isStill)return;
  const[start,end]=clips[slide],at=Math.max(0,Math.min(end-start-.067,video.currentTime-start));
  seek.disabled=loading||!Number.isFinite(video.duration);play.disabled=loading;
  seek.max=end-start-.067;seek.value=at;
  seekBar.querySelector('output').textContent=at.toFixed(1)+' / '+(end-start).toFixed(1)+'s';
  play.textContent=video.paused?'Play':'Pause';play.setAttribute('aria-label',video.paused?'Play slide':'Pause slide');
 }
 function stopAtBoundary(){if(clips[slide]===null){update();return}if(!video.paused&&video.currentTime>=clips[slide][1]-.067){video.pause();video.currentTime=clips[slide][1]-.067}update()}
 function watch(){cancelAnimationFrame(raf);stopAtBoundary();if(!video.paused)raf=requestAnimationFrame(watch)}
 async function start(index,restart){
  const token=++revision;video.pause();slide=Math.max(0,Math.min(clips.length-1,index));loading=clips[slide]!==null;update();
  if(clips[slide]===null)return;
  try{await prepareVideo(video);if(token!==revision)return;
   if(restart||video.currentTime<clips[slide][0]||video.currentTime>=clips[slide][1]-.09)video.currentTime=clips[slide][0];
   await video.play();
  }catch{if(token===revision)play.title='Playback failed; click Play to retry.'}
  finally{if(token===revision){loading=false;update()}}
 }
 prev.onclick=()=>start(slide-1,true);next.onclick=()=>start(slide+1,true);replay.onclick=()=>start(slide,true);
 play.onclick=()=>{if(!video.paused){++revision;video.pause()}else start(slide,false)};
 seek.oninput=()=>{video.currentTime=clips[slide][0]+Number(seek.value);update()};
 video.addEventListener('play',watch);video.addEventListener('pause',()=>{cancelAnimationFrame(raf);update()});video.addEventListener('timeupdate',stopAtBoundary);
 ['loadedmetadata','seeked','ended'].forEach(e=>video.addEventListener(e,update));
 head.querySelector('.media-fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen?.():wrapper.requestFullscreen?.();update();
}
})();
