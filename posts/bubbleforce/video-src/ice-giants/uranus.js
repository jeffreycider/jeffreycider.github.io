// Three scenes with schematic blur; magnification labels are rendered from LaTeX.
(function(){
  'use strict';
  const PAPER='#f5f0e6';
  function smooth(u){u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)}
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawUranusDisc(ctx, x, y, rad) {
    // Seeing halo: the atmosphere smears the limb slightly.
    var hg = ctx.createRadialGradient(x, y, rad * 0.8, x, y, rad * 1.9);
    hg.addColorStop(0, 'rgba(150,215,225,0.30)');
    hg.addColorStop(0.5, 'rgba(120,190,205,0.08)');
    hg.addColorStop(1, 'rgba(100,170,190,0)');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(x, y, rad * 1.9, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.clip();

    // Base: pale cyan with the sun slightly up-left.
    var lx = x - rad * 0.32, ly = y - rad * 0.28;
    var bg = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad * 1.45);
    bg.addColorStop(0, '#d9f4f3');
    bg.addColorStop(0.35, '#a8dfe0');
    bg.addColorStop(0.75, '#6fb9c6');
    bg.addColorStop(1, '#3a7d92');
    ctx.fillStyle = bg;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);

    // Very faint latitudinal banding, tilted like Uranus' pole-on-ish aspect.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.55);
    ctx.globalAlpha = 0.07;
    for (var i = -3; i <= 3; i++) {
      var by = i * rad * 0.26;
      var bw = Math.sqrt(Math.max(0, rad * rad - by * by));
      ctx.fillStyle = (i % 2 === 0) ? '#ffffff' : '#2d6f86';
      ctx.fillRect(-bw, by - rad * 0.09, bw * 2, rad * 0.18);
    }
    ctx.restore();

    // Limb darkening.
    var ld = ctx.createRadialGradient(x, y, rad * 0.55, x, y, rad);
    ld.addColorStop(0, 'rgba(20,50,70,0)');
    ld.addColorStop(0.8, 'rgba(20,50,70,0.22)');
    ld.addColorStop(1, 'rgba(10,30,50,0.62)');
    ctx.fillStyle = ld;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);

    // Soft specular bloom.
    var sp = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad * 0.5);
    sp.addColorStop(0, 'rgba(255,255,255,0.22)');
    sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sp;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);

    ctx.restore();

    // Blur the edge a touch so it reads as seen through air, not drawn.
    ctx.strokeStyle = 'rgba(150,215,225,0.25)';
    ctx.lineWidth = Math.max(0.8, rad * 0.08);
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.stroke();
  }


  const mathImages=new Map();
  const factor=n=>String.raw`${n}\times`;
  async function cacheMath(tex,color){
    const key=tex+'|'+color;if(mathImages.has(key))return;
    const node=MathJax.tex2svg(tex,{display:false}),svg=node.querySelector('svg').cloneNode(true);
    const vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
    svg.setAttribute('width',vb[2]/vb[3]*80);svg.setAttribute('height',80);svg.style.color=color;svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg))});
    mathImages.set(key,{img,ratio:vb[2]/vb[3]});
  }
  function mathLabel(ctx,tex,x,y,h,color,align='center'){
    const m=mathImages.get(tex+'|'+color);if(!m)throw Error('Unprepared math: '+tex);
    const w=h*m.ratio;ctx.drawImage(m.img,x-(align==='center'?w/2:align==='right'?w:0),y-h/2,w,h);
  }
  window.prepareUranusMath=async t=>{
    const z=smooth((t-3.8)/4),zoom=Math.exp(Math.log(932/227)*z),g=1+.3*(zoom-1)/(932/227-1);
    const jobs=[[factor(Math.round(227*zoom)),'#dae8f4'],[factor(227),'#bac8db'],[factor(Math.round(227*zoom)),'#bac8db'],[factor(zoom.toFixed(1)),'#b3eff0'],[factor(g.toFixed(1)),'#f3e4c7'],[String.raw`\boxed{4.1\times}`,'#a03539'],[String.raw`\text{Telescope zoom:}\quad\boxed{4.1\times}`,'#a03539']];
    await Promise.all(jobs.map(([tex,color])=>cacheMath(tex,color)));
  };
  // Three simultaneous close-ups beside a persistent telescope view.
  function wrapMenu(ctx,lines,x,y,w,h,size=32){
    window.menu(ctx,'',x,y,w,h,size);
    ctx.save();ctx.font=size+'px Pokemon';ctx.fillStyle='#252b35';ctx.textAlign='center';ctx.textBaseline='middle';
    const step=size*1.3,top=y+h/2-(lines.length-1)*step/2;
    lines.forEach((line,i)=>ctx.fillText(line,x+w/2,top+i*step));ctx.restore();
  }
  function halo(ctx,x,y,r,alpha,tint='255,244,224'){
    ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,'rgba('+tint+',.9)');g.addColorStop(.25,'rgba('+tint+',.5)');g.addColorStop(.65,'rgba('+tint+',.10)');g.addColorStop(1,'rgba('+tint+',0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();ctx.restore();
  }
  function object(ctx,kind,x,y,r,blur){
    if(kind==='star'){
      halo(ctx,x,y,r*2.6,blur);
      ctx.fillStyle='#fff9ea';ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();return;
    }
    if(kind==='uranus'){
      // Isolate the physical disk from the separately toggled spread of its light.
      ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();drawUranusDisc(ctx,x,y,r);ctx.restore();
      halo(ctx,x,y,r+13,blur*.22,'164,235,239');
    }else{
      ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
      const g=ctx.createRadialGradient(x-r*.3,y-r*.35,0,x,y,r);g.addColorStop(0,'#efd2a5');g.addColorStop(.6,'#c17f5f');g.addColorStop(1,'#77412e');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
      ctx.globalAlpha=.25;ctx.fillStyle='#683f35';ctx.beginPath();ctx.ellipse(x+r*.15,y+r*.12,r*.46,r*.20,-.55,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x-r*.38,y-r*.2,r*.22,r*.29,.4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.65;ctx.fillStyle='#f7e6d7';ctx.beginPath();ctx.ellipse(x,y-r*.86,r*.22,r*.1,0,0,Math.PI*2);ctx.fill();ctx.restore();halo(ctx,x,y,r+13,blur*.2,'243,199,155');
    }
  }
  const skyStars=(()=>{const rand=rng(1981),out=[];for(let i=0;i<170;i++){const x=(rand()-.5)*650,y=(rand()-.5)*650;if(Math.hypot(x,y)>70)out.push([x,y,.4+rand()*1.2])}return out})();
  window.drawUranus=function(ctx,t){
    t=Math.max(0,Math.min(11.5,t));
    const stage=t<3.5?0:t<9?1:2;
    const z=smooth((t-3.8)/4),zoom=Math.exp(Math.log(932/227)*z);
    const blur=stage===2?.9:.05+.95*(.5+.5*Math.cos(2*Math.PI*t/2.0));
    const growStar=1+.3*(zoom-1)/(932/227-1);
    ctx.fillStyle=PAPER;ctx.fillRect(0,0,1200,900);
    const sky={x:20,y:170,w:570,h:689},cx=305,cy=510;
    ctx.save();ctx.beginPath();ctx.roundRect(sky.x,sky.y,sky.w,sky.h,14);ctx.clip();
    const night=ctx.createRadialGradient(cx,cy,0,cx,cy,420);night.addColorStop(0,'#0d1726');night.addColorStop(1,'#02050c');ctx.fillStyle=night;ctx.fillRect(sky.x,sky.y,sky.w,sky.h);
    for(const [x,y,r]of skyStars){const px=cx+x*zoom,py=cy+y*zoom;halo(ctx,px,py,5*r*growStar,blur*.6);ctx.fillStyle='#e6edff';ctx.beginPath();ctx.arc(px,py,r*.5,0,Math.PI*2);ctx.fill()}
    const positions=[[cx-31*zoom,cy-42*zoom],[cx+29*zoom,cy+44*zoom],[cx+44*zoom,cy-57*zoom]];
    ['uranus','mars','star'].forEach((kind,i)=>object(ctx,kind,...positions[i],(i===0?9:i===1?10.35:9)*(i===2?growStar:zoom),blur));
    ctx.restore();ctx.strokeStyle='#a8aaae';ctx.lineWidth=2;ctx.strokeRect(sky.x,sky.y,sky.w,sky.h);
    mathLabel(ctx,factor(Math.round(227*zoom)),42,195,26,'#dae8f4','left');
    const labels=['Uranus','Mars','Star'],kinds=['uranus','mars','star'];
    for(let i=0;i<3;i++){
      const x=616,y=170+i*232,w=564,h=219,base=i===0?13:i===1?14.95:11;
      ctx.fillStyle='#0c1524';ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fill();
      ctx.fillStyle=i===0?'#b3eff0':i===1?'#ebc29c':'#f3e4c7';ctx.font='33px Pokemon';ctx.textAlign='left';ctx.fillText(labels[i],x+22,y+38);
      const oldX=x+139,newX=x+374,oy=y+142;
      object(ctx,kinds[i],oldX,oy,base,blur);
      if(stage>0){
        ctx.save();ctx.globalAlpha=smooth((t-3.5)/.4);object(ctx,kinds[i],newX,oy,base*(i===2?growStar:zoom),blur);ctx.restore();
        mathLabel(ctx,factor(227),oldX,y+68,21,'#bac8db');mathLabel(ctx,factor(Math.round(227*zoom)),newX,y+68,21,'#bac8db');
        if(stage===2&&i<2){ctx.fillStyle='#ffeddf';ctx.beginPath();ctx.roundRect(x+w-127,y+7,109,43,6);ctx.fill();mathLabel(ctx,String.raw`\boxed{4.1\times}`,x+w-25,y+29,29,'#a03539','right')}
        else mathLabel(ctx,factor((i===2?growStar:zoom).toFixed(1)),x+w-20,y+27,26,i===2?'#f3e4c7':'#b3eff0','right');
      }
    }
    if(stage===0)wrapMenu(ctx,["Most of a faraway star's visual area","is blur that our atmosphere creates."],20,16,1160,132,33);
    else if(stage===1)wrapMenu(ctx,['Nearby real objects all increase proportional','to the zoom. Optical artifacts like blurs','grow slower than the zoom.'],20,16,1160,132,29);
    else{
      wrapMenu(ctx,[],20,16,1160,132,40);
      mathLabel(ctx,String.raw`\text{Telescope zoom:}\quad\boxed{4.1\times}`,600,81,54,'#a03539');
      // This menu occupies the middle of the sky; its pointers touch only planets.
      const mx=52,my=452,mw=506,mh=112;
      ctx.strokeStyle='#f3ead2';ctx.lineWidth=3;ctx.beginPath();
      ctx.moveTo(positions[0][0],my);ctx.lineTo(positions[0][0],positions[0][1]+42);
      ctx.moveTo(positions[1][0],my+mh);ctx.lineTo(positions[1][0],positions[1][1]-46);ctx.stroke();
      wrapMenu(ctx,['Nearby!','Definitely not stars!'],mx,my,mw,mh,30);
    }
  };
  window.drawUranus.duration=11.5;window.drawUranus.width=1200;window.drawUranus.height=900;
})();
