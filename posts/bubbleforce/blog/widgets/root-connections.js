/* Clockwise neighbors in the complex plane; edges use endpoint RGB midpoints. */
(()=>{
 const cache=new Map();
 function rgb(color){
  if(cache.has(color))return cache.get(color);
  let out,m;
  if((m=/^#([0-9a-f]{6})$/i.exec(color)))out=[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16));
  else if((m=/hsl\(\s*([\d.+-]+)[ ,]+([\d.]+)%[ ,]+([\d.]+)%\s*\)/.exec(color))){
   const h=((+m[1]%360)+360)%360/60,s=+m[2]/100,l=+m[3]/100,c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h%2-1)),a=l-c/2;
   const base=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];out=base.map(v=>255*(v+a));
  }else throw new Error('Unsupported root color: '+color);
  cache.set(color,out);return out;
 }
 const mean=(a,b)=>{const x=rgb(a),y=rgb(b);return 'rgb('+x.map((v,i)=>Math.round((v+y[i])/2)).join(',')+')'};
 function edges(points){
  const order=points.map((p,i)=>({p,i,angle:Math.atan2(p.im,p.re)})).sort((a,b)=>b.angle-a.angle||Math.hypot(a.p.re,a.p.im)-Math.hypot(b.p.re,b.p.im)||a.i-b.i);
  const n=order.length;if(n<2)return [];
  return order.slice(0,n===2?1:n).map((a,i)=>{const b=order[(i+1)%n];return {a:a.p,b:b.p,color:mean(a.p.color,b.p.color)}});
 }
 function draw(ctx,points,width=1){ctx.save();ctx.lineWidth=width;ctx.lineJoin='round';for(const e of edges(points)){ctx.strokeStyle=e.color;ctx.beginPath();ctx.moveTo(e.a.x,e.a.y);ctx.lineTo(e.b.x,e.b.y);ctx.stroke()}ctx.restore()}
 window.RootConnections={rgb,mean,edges,draw};
})();
