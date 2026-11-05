// Serve repository at localhost:8875. Existing dialogue font and MathJax.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const out=process.env.PLATES_DIR||'/tmp/qwilfish-equilibrium';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:1600,height:1120}});
 const config={loader:{paths:{mathjax:'/vendor/mathjax'},load:['[tex]/enclose']},tex:{packages:{'[+]':['enclose']},inlineMath:[['$','$']],macros:{bubbleforce:'\\mathord{\\enclose{circle}{F}}'}},svg:{fontCache:'none'}};
 await p.route('**/equilibrium-menu-render',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><style>
 @font-face{font-family:Gen2;src:url('/v71/qwilfish/gen2-dialogue.woff2')}*{box-sizing:border-box}body{margin:0;background:transparent;color:#292824}#menu{background:#fffef8;border:4px solid #263041;border-radius:8px;padding:4px}.inner{border:3px solid #263041;height:100%;padding:2px 16px;display:flex;flex-direction:column;justify-content:center;font:26px/34px Gen2}.line{white-space:nowrap}mjx-container{font-size:20px!important;margin:0!important}code{font:23px ui-monospace,monospace;font-weight:600}
 </style><script>window.MathJax=${JSON.stringify(config)}</script><script src="/vendor/mathjax/tex-svg.js"></script><div id="menu"><div class="inner"></div></div>`}));
 await p.goto('http://127.0.0.1:8875/equilibrium-menu-render');await p.evaluate(()=>MathJax.startup.promise);await p.evaluate(()=>document.fonts.ready);
 const menus=[
 ['equilibrium-bottom',1568,120,26,[String.raw`Bubbleforce $\bubbleforce$ is the expansion force $\eta\lambda$ at this pulsing equilibrium.`]],
 ['callout',390,78,20,[String.raw`Bubbleforce $\bubbleforce$`]],
 ['root-contact-bottom',1568,120,26,[String.raw`We calculate bubbleforce $\bubbleforce$ by increasing $P(z)$'s expansion force $\eta\lambda$ until`,String.raw`<code>numpy</code>'s <code>chebroots</code> says the biggest root touches the complex unit circle.`]]];
 for(const [id,w,h,size,lines]of menus){await p.evaluate(async({w,h,size,lines})=>{const m=document.querySelector('#menu'),inner=m.firstElementChild;MathJax.typesetClear([inner]);m.style.width=w+'px';m.style.height=h+'px';inner.style.fontSize=size+'px';inner.style.lineHeight=(size===21?28:34)+'px';inner.innerHTML=lines.map(x=>'<div class="line">'+x+'</div>').join('');await MathJax.typesetPromise([inner]);},{w,h,size,lines});
  const check=await p.evaluate(()=>{const m=document.querySelector('.inner');return {errors:document.querySelectorAll('mjx-merror').length,overflow:[...m.children].some(x=>x.scrollWidth>x.clientWidth+1),height:m.scrollHeight>m.clientHeight+1}});await p.locator('#menu').screenshot({path:path.join(out,id+'.png'),omitBackground:true});if(check.errors||check.overflow||check.height)throw Error(id+JSON.stringify(check));
 }
 await p.setContent(`<style>body{margin:0}</style><svg width="1600" height="1120" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#ac4147" stroke-width="1.7"/></marker></defs><path d="M730 561 L1000 561" stroke="#ac4147" stroke-width="3.5" fill="none" marker-end="url(#arrow)"/></svg>`);
 await p.locator('svg').screenshot({path:path.join(out,'pointer.png'),omitBackground:true});await b.close();
})();
