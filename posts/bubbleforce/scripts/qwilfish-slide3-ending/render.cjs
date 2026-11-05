// Serve this repository at localhost:8875. Render with the existing dialogue font and MathJax.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1600,height:160}});
  await page.route('**/slide3-ending-menu', route => route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><style>
@font-face{font-family:Gen2;src:url('/v71/qwilfish/gen2-dialogue.woff2')}
*{box-sizing:border-box}body{margin:0;background:transparent}#menu{width:1568px;height:120px;border:4px solid #263041;border-radius:9px;background:#fffef8;padding:4px}
.inner{height:100%;border:3px solid #263041;padding:8px 20px;display:flex;flex-direction:column;justify-content:center;font:26px/34px Gen2;color:#292824}.line{white-space:nowrap}mjx-container{font-size:20px!important;margin:0!important}
</style><script>window.MathJax={tex:{inlineMath:[['$','$']]},svg:{fontCache:'none'}};</script><script src='/vendor/mathjax/tex-svg.js'></script></head><body><div id="menu"><div class="inner"><div class="line">It's ok if $P(z)$ is very mysterious. We'll define it later. Just vibe.</div></div></div></body></html>`}));
  await page.goto('http://127.0.0.1:8875/slide3-ending-menu');
  await page.evaluate(()=>MathJax.startup.promise);await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('mjx-merror').count())throw Error('Math rendering failed');
  const fits=await page.locator('.line').evaluate(e=>e.scrollWidth<=e.clientWidth);if(!fits)throw Error('Menu text overflows');
  await page.locator('#menu').screenshot({path:'/tmp/qwilfish-slide3-ending-menu.png',omitBackground:true});
  await browser.close();
})();
