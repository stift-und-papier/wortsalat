// Aufbereitung der Gemini-Bilder (Teilaufgabe 4): Magenta weg, alle Stufen gleich stark verkleinert, jede Farbe auf die Sprout-Lands-Palette.
// JPEG vorher in PNG umwandeln (z. B. PowerShell System.Drawing). Aufruf aus dem Projektordner:
//   node docs/farm/pixeln.cjs roh.png assets/neu/vogelhaus 5 16 32   (Glitzern: ... glitzern 3 16 16 streifen)
// Ergebnis liegt in assets/neu/ (nicht im Repo).
const fs=require('fs');const {PNG}=require(process.cwd()+'/node_modules/pngjs')
const [,,src,ziel,anz,mb,mh]=process.argv;const im=PNG.sync.read(fs.readFileSync(src)),W=im.width,H=im.height
const pal=PNG.sync.read(fs.readFileSync('assets/Sprout Lands defautlt palette.png'));const P=[]
for(let i=0;i<pal.data.length;i+=4)if(pal.data[i+3])P.push([pal.data[i],pal.data[i+1],pal.data[i+2]])
const px=(x,y)=>{const i=(y*W+x)*4;return [im.data[i],im.data[i+1],im.data[i+2]]}
const magenta=([r,g,b])=>r>140&&b>140&&g<90&&Math.abs(r-b)<60
const cache=new Map();const snap=c=>{const key=c.join();if(cache.has(key))return cache.get(key);let b=0,d=1e9;P.forEach((p,i)=>{const e=(p[0]-c[0])**2*.3+(p[1]-c[1])**2*.59+(p[2]-c[2])**2*.11;if(e<d){d=e;b=i}});cache.set(key,[b,d]);return [b,d]}
const belegt=[...Array(W)].map((_,x)=>{let n=0;for(let y=0;y<H;y++)if(!magenta(px(x,y)))n++;return n>=4})
let grp=[];for(let i=0;i<W;i++)if(belegt[i]){if(grp.length&&grp.at(-1)[1]>=i-3)grp.at(-1)[1]=i;else grp.push([i,i])}
grp=grp.filter(([a,b])=>b-a>4)
while(grp.length>+anz){let m=1;for(let k=1;k<grp.length;k++)if(grp[k][0]-grp[k-1][1]<grp[m][0]-grp[m-1][1])m=k;grp.splice(m-1,2,[grp[m-1][0],grp[m][1]])}
const streifen=process.argv[7]==='streifen'
let boxen=grp.map(([a,b])=>{let y0=H,y1=-1;for(let x=a;x<=b;x++)for(let y=0;y<H;y++)if(!magenta(px(x,y))){y0=Math.min(y0,y);y1=Math.max(y1,y)}return [a,y0,b,y1]})
if(streifen){const y0=Math.min(...boxen.map(b=>b[1])),y1=Math.max(...boxen.map(b=>b[3]));boxen=[...Array(+anz)].map((_,k)=>[Math.round(k*W/anz),y0,Math.round((k+1)*W/anz)-1,y1])}
const f=Math.max(...boxen.map(([a,y0,b,y1])=>Math.max((b-a+1)/+mb,(y1-y0+1)/+mh))) // Quellpixel je Zielpixel
console.log(src.split('/').pop(),'Faktor',f.toFixed(1))
boxen.forEach(([a,y0,b,y1],n)=>{const w=Math.round((b-a+1)/f),h=Math.round((y1-y0+1)/f),o=new PNG({width:w,height:h})
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const z=new Map();let leer=0,alle=0
  for(let y=Math.floor(y0+j*f);y<Math.min(y1+1,Math.floor(y0+(j+1)*f));y++)for(let x=Math.floor(a+i*f);x<Math.min(b+1,Math.floor(a+(i+1)*f));x++){alle++;const c=px(x,y);if(magenta(c)){leer++;continue}const [k,d]=snap(c);z.set(k,(z.get(k)||0)+1/(1+d/150))}
  if(!alle||leer/alle>0.55)continue;const k=[...z].sort((p,q)=>q[1]-p[1])[0][0],q=(j*w+i)*4;o.data[q]=P[k][0];o.data[q+1]=P[k][1];o.data[q+2]=P[k][2];o.data[q+3]=255}
 fs.writeFileSync(`${ziel}_${n+1}.png`,PNG.sync.write(o));console.log(' Stufe',n+1,w+'×'+h)})
