// Usage: node video-src/ice-giants/encode.cjs http://127.0.0.1:8892
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('node:child_process');const {once}=require('node:events');const fs=require('node:fs');const path=require('node:path');
(async()=>{const root=path.resolve(__dirname,'../..'),base=process.argv[2]||'http://127.0.0.1:8892';const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1200,height:760},deviceScaleFactor:1});await page.goto(base+'/video-src/ice-giants/render.html');
for(const[kind,duration,poster]of[['uranus',11.5,10.2],['neptune',8,6.6]]){
 if(process.argv[3]&&process.argv[3]!==kind)continue;
 await page.setViewportSize({width:1200,height:kind==='uranus'?900:760});
 const dest=path.join(root,'media',`ice-giants-${kind}.mp4`);
 const proc=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-vcodec','png','-r','30','-i','-','-an','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',dest],{stdio:['pipe','inherit','inherit']});const ended=once(proc,'close');
 for(let i=0;i<duration*30;i++){await page.evaluate(([k,t])=>draw(k,t),[kind,i/30]);const frame=Buffer.from(await page.evaluate(()=>document.querySelector('canvas').toDataURL('image/png').split(',')[1]),'base64');if(!proc.stdin.write(frame))await once(proc.stdin,'drain');if(i%60===0)console.log(kind,i)}proc.stdin.end();const[code]=await ended;if(code)throw Error('ffmpeg '+code);
 await page.evaluate(([k,t])=>draw(k,t),[kind,poster]);await page.locator('canvas').screenshot({path:path.join(root,'media',`ice-giants-${kind}-poster.png`)});console.log('encoded',kind,duration);
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
