/* Read-only manuscript: math, marginal notes, and media controls. */
(()=>{'use strict';
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
window.bubbleforceReady=MathJax.startup.promise.then(()=>MathJax.typesetPromise([document.querySelector('main')])).then(()=>{scheduleNotes();return new Promise(resolve=>requestAnimationFrame(resolve))});
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const kind=e.data?.type;if(!['blog-root-height','qwilfish-height','aipom-height'].includes(kind))return;for(const frame of document.querySelectorAll('.root-card iframe,.player-frame'))if(frame.contentWindow===e.source){const h=Number(e.data.height);if(Number.isFinite(h))frame.style.height=Math.max(220,Math.min(1200,h))+'px'}});

// Full local media objects support reliable seeking even when hosted range requests do not.
const mediaCache=new Map();function prepareVideo(video){if(video.dataset.ready==='true')return Promise.resolve();if(video._readyPromise)return video._readyPromise;video._readyPromise=(async()=>{video.dataset.loading='true';const url=video.dataset.originalSrc||video.getAttribute('src')||video.querySelector('source')?.getAttribute('src');video.dataset.originalSrc=url;try{if(!mediaCache.has(url))mediaCache.set(url,fetch(url,{credentials:'same-origin'}).then(async response=>{if(!response.ok)throw Error('Video download failed');return URL.createObjectURL(await response.blob())}).catch(e=>{mediaCache.delete(url);throw e}));const blob=await mediaCache.get(url);const wasPlaying=!video.paused,at=video.currentTime;video.src=blob;video.preload='auto';video.load();await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',reject,{once:true})});video.dataset.ready='true';if(at>0)video.currentTime=Math.min(at,video.duration);if(wasPlaying)video.play().catch(()=>{})}catch{video.dataset.loading='false';video._readyPromise=null;video.addEventListener('pointerdown',()=>prepareVideo(video),{once:true});throw Error('Video download failed')}})();return video._readyPromise}
const mediaObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){prepareVideo(e.target).catch(()=>{});mediaObserver.unobserve(e.target)}},{rootMargin:'600px'});document.querySelectorAll('video').forEach(video=>{video.controls=false;video.removeAttribute('controls');installVideoControls(video);mediaObserver.observe(video)});
function installVideoControls(video){
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

})();
