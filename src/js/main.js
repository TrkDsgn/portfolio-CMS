/* Images des études de cas (intégrées à la page) */
const ASSETS = window.__CONTENT.assets;
/* =====================================================================
   CONTENU — tout le texte du site est ici. Ajouter / retirer un projet :
   ajouter / retirer un objet dans PROJECTS (16 projets max sur la grille).
   images: [] → laisse vide pour les visuels générés, ou mets des URLs
   (data: ou fichiers publiés avec la page) pour tes vraies images.
   ===================================================================== */
const SITE = window.__CONTENT.site;
const PROJECTS = window.__CONTENT.projects;

/* ============================ Utilitaires ============================ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const mobileQ = matchMedia("(max-width:799.98px)");
const ease = { inOut:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, out:t=>1-Math.pow(1-t,4) };
document.documentElement.style.setProperty("--logo", 'url("/images/logo.png")');

/* ======================= Remplissage du contenu ====================== */
function fill(){
  $("#tag1").innerHTML = SITE.taglineLeft.map(esc).join('<span class="plus">+</span>');
  $("#social").innerHTML = SITE.links.map(l=>`<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 8L8 2M3.5 2H8v4.5"/></svg></a>`).join("");
  $$("[data-cta]").forEach(b=>b.textContent = SITE.cta);
  $$("[data-cta-short]").forEach(b=>b.textContent = SITE.ctaShort);
  $("#submit").textContent = SITE.submit;
  $("#status-email").textContent = SITE.email;
  const t = SITE.ticker.map(x=>`<span>${esc(x)} •</span>`).join("");
  $("#ticker-track").innerHTML = t + t;
  $("#about-title").textContent = SITE.about.title;
  $("#about-body").innerHTML = SITE.about.body.map((p,j)=>`<p class="t-body" data-edit="site.about.body.${j}">${esc(p)}</p>`).join("");
  let i = 2, html = "";
  SITE.about.skills.forEach((g,gi)=>{ html += `<div class="group rv" style="--i:${i++}"><span class="t-label accent" data-edit="site.about.skills.${gi}.label">${esc(g.label)}</span><ul class="rules t-list">${g.items.map((x,k)=>`<li style="--i:${k}" data-edit="site.about.skills.${gi}.items.${k}">${esc(x)}</li>`).join("")}</ul></div>`; });
  html += `<div class="group rv" style="--i:${i++}"><span class="t-label accent">Parcours</span><ul class="rules t-list">${SITE.about.path.map((p,k)=>`<li style="--i:${k}"><span class="yr t-micro" data-edit="site.about.path.${k}.year">${esc(p.year)}</span><span><span data-edit="site.about.path.${k}.role">${esc(p.role)}</span> <span class="muted">— <span data-edit="site.about.path.${k}.org">${esc(p.org)}</span></span></span></li>`).join("")}</ul></div>`;
  $("#about-groups").innerHTML = html;
  $("#contact-title").textContent = SITE.contact.title;
  $("#contact-body").textContent = SITE.contact.body;
  $("#contact-links").innerHTML = `<dt>Email</dt><dd><a class="link" href="mailto:${esc(SITE.email)}" id="email-txt" data-edit="site.email">${esc(SITE.email)}</a> <button class="copy copy-ic" type="button" id="copy-email" aria-label="Copier l'adresse email" title="Copier"><svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg></button></dd>` +
    `<dt>Réseaux</dt><dd class="c-social">` + SITE.links.map(l=>`<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 8L8 2M3.5 2H8v4.5"/></svg></a>`).join("") + `</dd>`;
  $("#projets-liste").innerHTML = PROJECTS.map(p=>`<li><a href="#projet-${p.slug}" data-focus="${p.slug}">${esc(p.title)} — ${esc(p.category)}, ${esc(p.year)}</a></li>`).join("");
  $("#p-select").innerHTML = PROJECTS.map(p=>`<option value="${p.slug}">${esc(p.title)}</option>`).join("");
}

/* ===================== Visuels générés (placeholders) ================= */
function rr(c,x,y,w,h,r){ c.beginPath(); c.roundRect ? c.roundRect(x,y,w,h,r) : c.rect(x,y,w,h); }
function hexA(h,a){ const n=parseInt(h.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
function wrap(c, text, x, y, maxW, lh, maxLines=3){ const words=text.split(" "); let line="", n=0;
  for(const w of words){ const t=line?line+" "+w:w; if(c.measureText(t).width>maxW && line){ c.fillText(line,x,y); y+=lh; line=w; if(++n>=maxLines-1){} } else line=t; }
  c.fillText(line,x,y); }
const DRAW = {
  desktop(c,x,y,w,h,p,P){ c.fillStyle=p.soft; c.fillRect(x,y,w,h);
    const m=Math.min(w,h)*.08, bx=x+m, by=y+m*1.2, bw=w-2*m, bh=h-m*1.2;
    c.fillStyle=p.bg; rr(c,bx,by,bw,bh,m*.35); c.fill();
    c.fillStyle=hexA(p.fg,.15); c.fillRect(bx,by+bh*.09,bw,1);
    [0,1,2].forEach(i=>{ c.beginPath(); c.arc(bx+bh*.045+i*bh*.04, by+bh*.045, bh*.012,0,7); c.fill(); });
    for(let i=0;i<4;i++){ c.fillRect(bx+bw*.55+i*bw*.09, by+bh*.04, bw*.06, bh*.012); }
    c.fillStyle=p.fg; c.font=`600 ${bh*.11}px "Bricolage Grotesque", "Inter Tight", sans-serif`; c.textBaseline="alphabetic";
    wrap(c, P.title, bx+bw*.07, by+bh*.3, bw*.48, bh*.11, 2);
    c.fillStyle=hexA(p.fg,.35); for(let i=0;i<3;i++) c.fillRect(bx+bw*.07, by+bh*(.55+i*.05), bw*(.38-i*.06), bh*.018);
    c.fillStyle=p.accent; rr(c,bx+bw*.07, by+bh*.74, bw*.16, bh*.08, bh*.04); c.fill();
    for(let i=0;i<3;i++){ c.fillStyle=i===1?p.accent:p.soft; rr(c, bx+bw*(.6+i*.02), by+bh*(.2+i*.17), bw*.32, bh*.22, bh*.03); c.fill();
      c.fillStyle=hexA(i===1?p.bg:p.fg,.5); c.fillRect(bx+bw*(.63+i*.02), by+bh*(.27+i*.17), bw*.18, bh*.018); c.fillRect(bx+bw*(.63+i*.02), by+bh*(.32+i*.17), bw*.12, bh*.018); } },
  phone(c,x,y,w,h,p,P){ c.fillStyle=p.accent; c.fillRect(x,y,w,h);
    const ph=h*.84, pw=ph*.48, px=x+(w-pw)/2, py=y+h*.08;
    c.fillStyle=p.fg; rr(c,px,py,pw,ph,pw*.14); c.fill();
    c.fillStyle=p.bg; rr(c,px+pw*.05,py+pw*.05,pw*.9,ph-pw*.1,pw*.1); c.fill();
    const ix=px+pw*.13, iw=pw*.74; c.fillStyle=p.fg; c.font=`600 ${pw*.1}px "Bricolage Grotesque", "Inter Tight", sans-serif`; wrap(c, P.title.split(" ")[0], ix, py+ph*.17, iw, pw*.1, 1);
    for(let i=0;i<4;i++){ c.fillStyle=i===0?p.soft:hexA(p.fg,.07); rr(c, ix, py+ph*(.24+i*.13), iw, ph*.1, pw*.05); c.fill();
      c.fillStyle=hexA(p.fg,.45); c.fillRect(ix+iw*.1, py+ph*(.28+i*.13), iw*.5, ph*.012); }
    c.fillStyle=p.accent; rr(c, ix, py+ph*.82, iw, ph*.07, ph*.035); c.fill(); },
  swatch(c,x,y,w,h,p){ const cols=[p.bg,p.soft,p.accent,p.fg]; const horiz=w>h*1.3;
    cols.forEach((col,i)=>{ c.fillStyle=col; if(horiz) c.fillRect(x+w*i/4,y,w/4+1,h); else c.fillRect(x,y+h*i/4,w,h/4+1);
      c.fillStyle=(i>=2)?p.bg:p.fg; c.font=`500 ${Math.min(w,h)*.045}px "Roboto Mono", monospace`;
      const tx=horiz?x+w*i/4+w*.02:x+w*.06, ty=horiz?y+h*.92:y+h*(i+1)/4-h*.03; c.fillText(col.toUpperCase(), tx, ty); }); },
  type(c,x,y,w,h,p){ c.fillStyle=p.fg; c.fillRect(x,y,w,h); c.fillStyle=p.bg;
    const s=Math.min(w,h); c.font=`500 ${s*.55}px "Bricolage Grotesque", "Inter Tight", sans-serif`; c.textBaseline="alphabetic"; c.fillText("Aa", x+w*.1, y+h*.7);
    c.fillStyle=p.accent; c.font=`500 ${s*.045}px "Roboto Mono", monospace`; c.fillText("DISPLAY / 72", x+w*.1, y+h*.88);
    c.fillStyle=hexA(p.bg,.6); c.font=`${s*.05}px "Inter Tight", sans-serif`; c.fillText("Abc 0123 — Regular", x+w*.1, y+h*.15); },
  flow(c,x,y,w,h,p){ c.fillStyle=p.soft; c.fillRect(x,y,w,h); const n=w>h*1.3?4:3; const nw=w*(w>h*1.3?.16:.24), nh=h*.16;
    const pts=[]; for(let i=0;i<n;i++){ pts.push([x+w*(.1+i*(.8-nw/w)/(n-1)), y+h*(i%2?.58:.28)]); }
    c.strokeStyle=hexA(p.fg,.5); c.lineWidth=Math.max(1,h*.006); c.setLineDash([h*.015,h*.015]);
    for(let i=0;i<n-1;i++){ c.beginPath(); c.moveTo(pts[i][0]+nw, pts[i][1]+nh/2); c.bezierCurveTo(pts[i][0]+nw*1.4, pts[i][1]+nh/2, pts[i+1][0]-nw*.4, pts[i+1][1]+nh/2, pts[i+1][0], pts[i+1][1]+nh/2); c.stroke(); }
    c.setLineDash([]); pts.forEach((q,i)=>{ c.fillStyle=i===n-1?p.accent:p.bg; rr(c,q[0],q[1],nw,nh,nh*.2); c.fill();
      c.fillStyle=hexA(i===n-1?p.bg:p.fg,.55); c.fillRect(q[0]+nw*.12,q[1]+nh*.4,nw*.6,nh*.12); }); },
  chart(c,x,y,w,h,p){ c.fillStyle=p.bg; c.fillRect(x,y,w,h); const m=Math.min(w,h)*.1;
    c.fillStyle=p.soft; rr(c,x+m,y+m,w-2*m,h-2*m,m*.3); c.fill();
    c.strokeStyle=hexA(p.fg,.12); c.lineWidth=1; for(let i=1;i<4;i++){ const yy=y+m+(h-2*m)*i/4; c.beginPath(); c.moveTo(x+m*1.5,yy); c.lineTo(x+w-m*1.5,yy); c.stroke(); }
    const n=9, ys=[.7,.62,.66,.5,.54,.4,.44,.3,.26]; c.strokeStyle=p.accent; c.lineWidth=Math.max(2,h*.012); c.beginPath();
    ys.forEach((v,i)=>{ const xx=x+m*1.5+(w-3*m)*i/(n-1), yy=y+h*v; i?c.lineTo(xx,yy):c.moveTo(xx,yy); }); c.stroke();
    c.fillStyle=p.accent; const lx=x+w-m*1.5, ly=y+h*.26; c.beginPath(); c.arc(lx,ly,h*.02,0,7); c.fill();
    c.fillStyle=hexA(p.fg,.25); for(let i=0;i<6;i++){ const bh=h*(.08+((i*37)%5)*.02); c.fillRect(x+m*1.5+i*(w-3*m)/6, y+h-m*1.5-bh, (w-3*m)/9, bh); } },
  icons(c,x,y,w,h,p){ c.fillStyle=p.bg; c.fillRect(x,y,w,h); const cols=w>h*1.3?8:4, rows=4, cw=w/(cols+1), chh=h/(rows+1); c.lineWidth=Math.max(1.5,Math.min(w,h)*.008);
    for(let r=0;r<rows;r++) for(let k=0;k<cols;k++){ const cx=x+cw*(k+1), cy=y+chh*(r+1), s=Math.min(cw,chh)*.28, t=(r*cols+k)%5;
      c.strokeStyle=(r+k)%7===0?p.accent:p.fg; c.beginPath();
      if(t===0) c.arc(cx,cy,s,0,7); else if(t===1) c.rect(cx-s,cy-s,s*2,s*2); else if(t===2){ c.moveTo(cx-s,cy+s); c.lineTo(cx,cy-s); c.lineTo(cx+s,cy+s); c.closePath(); }
      else if(t===3){ c.moveTo(cx-s,cy); c.lineTo(cx+s,cy); c.moveTo(cx,cy-s); c.lineTo(cx,cy+s); } else { c.moveTo(cx-s,cy); c.lineTo(cx-s*.2,cy+s*.7); c.lineTo(cx+s,cy-s*.6); }
      c.stroke(); } }
};
/* Cluster 4×2 cellules : rangée de 25 % / 25 % / 50 % (×2) */
const SLOTS = [[0,0,1],[1,0,1],[2,0,2],[0,1,1],[1,1,1],[2,1,2]];
const imgCache = {};
function loadImg(src){ return imgCache[src] || (imgCache[src] = new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src=src; })); }
function drawCover(c,im,x,y,w,h){ const s=Math.max(w/im.width,h/im.height), iw=im.width*s, ih=im.height*s; c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); c.drawImage(im, x+(w-iw)/2, y+(h-ih)/2, iw, ih); c.restore(); }
async function drawTile(c, P, k, x, y, w, h){
  const src = P.images && P.images[k];
  const im = src ? await loadImg(src) : null;
  if(im) drawCover(c,im,x,y,w,h); else DRAW[P.tiles[k % P.tiles.length]](c,x,y,w,h,P.pal,P);
}

/* Cover : l'image du projet, plein cadre */
async function drawCover(c, P, ox, oy, W, H){
  c.save(); c.beginPath(); c.rect(ox, oy, W, H); c.clip();
  c.fillStyle = "#161616"; c.fillRect(ox, oy, W, H);
  const src = P.cover || (P.images && P.images[2]);
  const im = src ? await loadImg(src) : null;
  if(im){ const s = Math.max(W/im.width, H/im.height), iw = im.width*s, ih = im.height*s;
    const fx = P.coverFx == null ? .5 : P.coverFx, fy = P.coverFy == null ? .5 : P.coverFy;
    c.drawImage(im, ox + (W-iw)*fx, oy + (H-ih)*fy, iw, ih); }
  else DRAW.desktop(c, ox, oy, W, H, P.pal, P);
  c.restore();
}

async function drawCluster(c, P, ox, oy, W, H){
  const cw=W/4, ch=H/2, g=Math.round(W*.006);
  c.fillStyle = "rgba(0,0,0,0)"; c.clearRect(ox,oy,W,H);
  for(let k=0;k<6;k++){ const [col,row,span]=SLOTS[k]; const x=ox+[0,1,2][col]*cw+g, y=oy+row*ch+g, w=cw*span-2*g, h=ch-2*g;
    c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); await drawTile(c,P,k,x,y,w,h); c.restore(); }
}

/* ============================== WebGL ================================ */
const canvas = $("#gl");
const gl = canvas.getContext("webgl", { antialias:false, alpha:false, premultipliedAlpha:false });
const MAXP = 16;
const ATLAS_COLS = PROJECTS.length <= 4 ? 2 : 4;
const S = { prev:[0,0], suck:0, ab:0, dir:[0,1], off:[0,0], zoom:1, curve:.32, shift:0, hover:[1e6,1e6], hoverAmt:0, vel:[0,0], dirty:true, cell:72, W:1, H:1, dpr:1, headPx:144 };
let prog, uni = {}, atlasTex, colors = {};

const VS = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;
const FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform vec2 uOff; uniform float uZoom; uniform float uCurve; uniform vec2 uCenter;
uniform float uCell; uniform sampler2D uTex; uniform float uN; uniform vec2 uHover; uniform float uHoverAmt;
uniform vec3 uBg; uniform vec3 uLine; uniform vec3 uDeep; uniform float uR;
uniform float uCols; uniform float uSuck; uniform float uAb; uniform vec2 uDir;
vec2 warp(vec2 q, float c){ return q * (1.0 + c * dot(q, q)); }
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
void main(){
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q = (sp - uCenter) / uR;
  vec2 qd = warp(q, uCurve);
  vec2 w = qd * uR / uZoom + uOff;
  float px = (1.0 + 3.0 * uCurve * dot(q, q)) / uZoom;           /* taille d'un pixel en unités monde */
  float C = uCell;
  /* grille */
  vec2 g = abs(fract(w / C + 0.5) - 0.5) * C;
  float d = min(g.x, g.y);
  float pxd = px / uDpr;                                    /* un pixel physique */
  float line = 1.0 - smoothstep(pxd * 0.3, pxd * 1.0, d);  /* filet d'1 px, comme le site source */
  vec3 col = mix(uBg, uLine, line);
  /* clusters : période 6×4 cellules, rangées décalées de 3 cellules */
  vec2 P = vec2(6.0*C, 4.0*C);
  float cy = floor(w.y / P.y);
  float xo = mod(cy, 2.0) * 3.0 * C;
  float cx = floor((w.x - xo) / P.x);
  vec2 local = w - vec2(cx * P.x + xo, cy * P.y) - vec2(C, C);
  vec2 lc = vec2(2.0*C, C);
  float hov = (abs(cx-uHover.x)<.5 && abs(cy-uHover.y)<.5) ? uHoverAmt : 0.0;
  local = lc + (local - lc) / (1.0 + 0.045 * hov);
  float pxl = px / (1.0 + 0.045 * hov);
  if(local.x > -C && local.x < 5.0*C && local.y > -C && local.y < 3.0*C){
    float row = 0.0;
    float tx = local.x / C;
    float gap = C * 0.035;
    vec2 tc = vec2(2.0 * C, C);
    vec2 hb = vec2(2.0*C - gap, C - gap);
    float sd = sdBox(local - tc, hb, C*0.09);
    float inside = (local.x >= 0.0 && local.x <= 4.0*C && local.y >= 0.0 && local.y <= 2.0*C) ? 1.0 - smoothstep(-pxl*0.5, pxl*0.5, sd) : 0.0;
    if(inside > 0.0){
      float id = mod(cx + cy * 2.0, uN);
      vec2 uv = clamp(local / vec2(4.0*C, 2.0*C), 0.001, 0.999);
      vec2 slot = vec2(mod(id, uCols), floor(id / uCols));
      vec2 ab = uDir * uAb * 0.018;
      vec3 tex = texture2D(uTex, (slot + uv) / vec2(uCols, uCols)).rgb;
      if(uAb > 0.001){
        tex.r = texture2D(uTex, (slot + clamp(uv + ab, 0.001, 0.999)) / vec2(uCols, uCols)).r;
        tex.b = texture2D(uTex, (slot + clamp(uv - ab, 0.001, 0.999)) / vec2(uCols, uCols)).b;
      }
      tex = mix(tex, tex * 1.06, hov);
      col = mix(col, tex, inside);
    }
  }
  /* horizon : assombrit les bords quand la courbure est active */
  float vig = smoothstep(0.55, 1.35, length(q)) * clamp(uCurve * 3.0, 0.0, 1.0);
  col = mix(col, uDeep, vig * 0.85);
  gl_FragColor = vec4(col, 1.0);
}`;

function readColors(){
  const cs = getComputedStyle(document.documentElement);
  const toRGB = v => { const ctx = document.createElement("canvas").getContext("2d"); ctx.fillStyle = v.trim(); const h = ctx.fillStyle; if(h[0]==="#"){ const n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; } const m=h.match(/[\d.]+/g); return [m[0]/255,m[1]/255,m[2]/255]; };
  colors = { bg:toRGB(cs.getPropertyValue("--bg")), line:toRGB(cs.getPropertyValue("--line")), deep:toRGB(cs.getPropertyValue("--bg-deep")) };
  S.dirty = true;
}

function initGL(){
  if(!gl) return false;
  const sh = (t,src)=>{ const s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER,VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog,"a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  ["uRes","uDpr","uOff","uZoom","uCurve","uCenter","uCell","uTex","uN","uHover","uHoverAmt","uBg","uLine","uDeep","uR","uSuck","uAb","uDir","uCols"].forEach(n=>uni[n]=gl.getUniformLocation(prog,n));
  atlasTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([40,38,36,255]));
  return true;
}
async function buildAtlas(){
  /* Atlas en puissance de 2 (requis par WebGL 1 pour les mipmaps) : 4 × 4 covers */
  const maxTex = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
  const SW = 1024, SH = 512, cv=document.createElement("canvas"); cv.width=SW*ATLAS_COLS; cv.height=SH*ATLAS_COLS; const c=cv.getContext("2d");
  c.fillStyle="#222"; c.fillRect(0,0,cv.width,cv.height);
  const list = PROJECTS.slice(0,MAXP);
  for(let i=0;i<list.length;i++) await drawCover(c, list[i], (i%ATLAS_COLS)*SW, Math.floor(i/ATLAS_COLS)*SH, SW, SH);
  if(!gl) return;
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  S.dirty = true;
}
function resize(){
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  S.cell = Math.round(9 * rem * (mobileQ.matches ? 0.95 : 1));
  S.headPx = $("#frame").getBoundingClientRect().height;
  document.documentElement.style.setProperty("--cell", S.cell + "px");
  S.dpr = Math.min(devicePixelRatio || 1, 1.5); S.W = innerWidth; S.H = innerHeight;
  canvas.width = Math.round(S.W*S.dpr); canvas.height = Math.round(S.H*S.dpr);
  if(gl) gl.viewport(0,0,canvas.width,canvas.height);
  S.dirty = true;
}
const center = () => [S.W/2 + S.shift, S.headPx + (S.H - S.headPx)/2];
const R = () => Math.max(S.W, S.H) * .5;
function curveNow(){ return reduce.matches ? 0 : S.curve; }
function warpQ(qx, qy){ const k = 1 + curveNow()*(qx*qx + qy*qy); return [qx*k, qy*k]; }
function screenToWorld(x,y){ const [cx,cy]=center(), r=R(); const [dx,dy]=warpQ((x-cx)/r, (y-cy)/r); return [dx*r/S.zoom+S.off[0], dy*r/S.zoom+S.off[1]]; }
function worldToScreen(wx,wy){ const [cx,cy]=center(), r=R(); const dx=(wx-S.off[0])*S.zoom/r, dy=(wy-S.off[1])*S.zoom/r; let qx=dx, qy=dy;
  for(let i=0;i<24;i++){ const [wx2,wy2]=warpQ(qx,qy); qx+=(dx-wx2)*.6; qy+=(dy-wy2)*.6; } return [cx+qx*r, cy+qy*r, 1]; }
const C = () => S.cell;
const mod = (a,n) => ((a%n)+n)%n;
function clusterAt(wx,wy){ const c=C(), Py=4*c, Px=6*c; const cy=Math.floor(wy/Py), xo=mod(cy,2)*3*c, cx=Math.floor((wx-xo)/Px);
  const lx=wx-(cx*Px+xo)-c, ly=wy-cy*Py-c; if(lx<0||lx>4*c||ly<0||ly>2*c) return null;
  const n=Math.min(PROJECTS.length,MAXP); return { cx, cy, id: mod(cx+cy*2, n) }; }
function clusterCenter(cx,cy){ const c=C(); return [cx*6*c + mod(cy,2)*3*c + 3*c, cy*4*c + 2*c]; }
function nearestCluster(id){ const c=C(); const n=Math.min(PROJECTS.length,MAXP); let best=null, bd=Infinity;
  const ccy=Math.round((S.off[1]-2*c)/(4*c)); for(let cy=ccy-6; cy<=ccy+6; cy++){ const xo=mod(cy,2)*3*c; const ccx=Math.round((S.off[0]-xo-3*c)/(6*c));
    for(let cx=ccx-8; cx<=ccx+8; cx++){ if(mod(cx+cy*2,n)!==id) continue; const [x,y]=clusterCenter(cx,cy); const d=Math.hypot(x-S.off[0],y-S.off[1]); if(d<bd){bd=d; best={cx,cy};} } }
  return best; }

function render(){
  if(!gl) return;
  const [cx,cy]=center();
  gl.uniform2f(uni.uRes, canvas.width, canvas.height); gl.uniform1f(uni.uDpr, S.dpr);
  gl.uniform2f(uni.uOff, S.off[0], S.off[1]); gl.uniform1f(uni.uZoom, S.zoom); gl.uniform1f(uni.uCurve, curveNow());
  gl.uniform2f(uni.uCenter, cx, cy); gl.uniform1f(uni.uR, R()); gl.uniform1f(uni.uCell, C());
  gl.uniform1i(uni.uTex, 0); gl.uniform1f(uni.uN, Math.min(PROJECTS.length,MAXP));
  gl.uniform2f(uni.uHover, S.hover[0], S.hover[1]); gl.uniform1f(uni.uHoverAmt, S.hoverAmt);
  gl.uniform3fv(uni.uBg, colors.bg); gl.uniform3fv(uni.uLine, colors.line); gl.uniform3fv(uni.uDeep, colors.deep);
  gl.uniform1f(uni.uCols, ATLAS_COLS); gl.uniform1f(uni.uSuck, reduce.matches ? 0 : S.suck); gl.uniform1f(uni.uAb, reduce.matches ? 0 : S.ab); gl.uniform2f(uni.uDir, S.dir[0], S.dir[1]);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/* ============================ Animation =============================== */
const tweens = [];
function tween(obj, key, to, dur, fn=ease.inOut){ return new Promise(res=>{
  for(let i=tweens.length-1;i>=0;i--) if(tweens[i].obj===obj && tweens[i].key===key) tweens.splice(i,1);
  const from = Array.isArray(obj[key]) ? obj[key].slice() : obj[key];
  if(reduce.matches || dur<=0){ obj[key] = Array.isArray(to)?to.slice():to; S.dirty=true; return res(); }
  tweens.push({obj,key,from,to,dur,fn,t0:performance.now(),res}); }); }
function stepTweens(now){
  for(let i=tweens.length-1;i>=0;i--){ const t=tweens[i]; const p=Math.min(1,(now-t.t0)/t.dur), e=t.fn(p);
    t.obj[t.key] = Array.isArray(t.from) ? t.from.map((v,k)=>v+(t.to[k]-v)*e) : t.from+(t.to-t.from)*e;
    S.dirty = true; if(p>=1){ tweens.splice(i,1); t.res(); } } }

let INTRO_W = [0,0];
function updateDom(){
  if(!mobileQ.matches) ticker.style.marginLeft = S.shift + "px"; else ticker.style.marginLeft = "";
}
let dragging=false, moved=false, last=[0,0], lastT=0;
const DRIFT = 16; /* vitesse de rotation automatique, en px/s */
let lastNow = 0;
function loop(now){
  const dt = Math.min(64, now - (lastNow || now)); lastNow = now;
  stepTweens(now);
  if(view!=="project" && !dragging && hoverId===-1 && !reduce.matches && Math.abs(S.vel[0])+Math.abs(S.vel[1]) < .5){ S.off[0] += DRIFT * dt / 1000 / S.zoom; S.dirty = true; }
  if(S.tgt){ if(dragging || tweens.some(t=>t.key==="off")){ S.tgt = null; } else { S.off[0] += (S.tgt[0]-S.off[0])*.3; S.off[1] += (S.tgt[1]-S.off[1])*.3; S.dirty = true; if(Math.abs(S.tgt[0]-S.off[0]) + Math.abs(S.tgt[1]-S.off[1]) < .3) S.tgt = null; } }
  if(!dragging && (Math.abs(S.vel[0])>.02 || Math.abs(S.vel[1])>.02)){ S.off[0]+=S.vel[0]; S.off[1]+=S.vel[1]; S.vel[0]*=.86; S.vel[1]*=.86; S.dirty=true; }
  /* aspiration au défilement vertical + séparation des couleurs pendant le mouvement */
  const mx = S.off[0] - S.prev[0], my = S.off[1] - S.prev[1]; S.prev = S.off.slice();
  const f = 16 / Math.max(dt, 1), sp = Math.hypot(mx, my) * f * S.zoom;
  const tSuck = view === "project" ? 0 : Math.min(1, Math.abs(my) * f * S.zoom / 38);
  const tAb = view === "project" ? 0 : Math.min(1, Math.max(0, (sp - 3) / 32));
  S.suck += (tSuck - S.suck) * (tSuck > S.suck ? .18 : .06);
  S.ab += (tAb - S.ab) * (tAb > S.ab ? .3 : .08);
  if(sp > .5){ S.dir = [mx / (Math.hypot(mx,my) || 1), my / (Math.hypot(mx,my) || 1)]; }
  if(S.suck > .002 || S.ab > .002) S.dirty = true;
  if(S.dirty){ render(); updateDom(); S.dirty=false; }
  requestAnimationFrame(loop);
}

/* ============================ Interaction ============================= */
const hovertag = $("#hovertag");
let hoverId = -1;
function setHover(cl, mx, my){
  if(cl){ if(S.hover[0]!==cl.cx || S.hover[1]!==cl.cy){ S.hover=[cl.cx,cl.cy]; S.hoverAmt=0; tween(S,"hoverAmt",1,350,ease.out); }
    const P=PROJECTS[cl.id]; if(hoverId!==cl.id){ hovertag.textContent = `${P.title} — ${P.category} — ${P.year}`; hoverId=cl.id; }
    hovertag.style.transform = `translate(${mx+16}px, ${my+18}px)`; hovertag.classList.add("on"); canvas.classList.add("on-card"); }
  else { if(S.hoverAmt>0) tween(S,"hoverAmt",0,250,ease.out); hovertag.classList.remove("on"); canvas.classList.remove("on-card"); hoverId=-1; }
}
canvas.addEventListener("pointerdown", e=>{ if(view!=="home" && view!=="about" && view!=="contact") return; dragging=true; moved=false; last=[e.clientX,e.clientY]; lastT=performance.now(); S.vel=[0,0]; canvas.setPointerCapture(e.pointerId); canvas.classList.add("dragging"); });
canvas.addEventListener("pointermove", e=>{
  if(dragging){ const dx=e.clientX-last[0], dy=e.clientY-last[1]; if(Math.abs(dx)+Math.abs(dy)>3) moved=true;
    S.off[0]-=dx/S.zoom; S.off[1]-=dy/S.zoom; const now=performance.now(), dt=Math.max(8,now-lastT);
    S.vel=[-dx/S.zoom*16/dt, -dy/S.zoom*16/dt]; last=[e.clientX,e.clientY]; lastT=now; S.dirty=true; if(moved) setHover(null); return; }
  if(view==="home" && e.pointerType==="mouse"){ const [wx,wy]=screenToWorld(e.clientX,e.clientY); setHover(clusterAt(wx,wy), e.clientX, e.clientY); }
});
function endDrag(e){ if(!dragging) return; dragging=false; canvas.classList.remove("dragging");
  if(reduce.matches) S.vel=[0,0];
  if(!moved){ S.vel=[0,0]; const [wx,wy]=screenToWorld(e.clientX,e.clientY); const cl=clusterAt(wx,wy);
    if(cl){ pendingCluster=cl; location.hash = "projet-" + PROJECTS[cl.id].slug; }
    else if(view!=="home") location.hash=""; } }
canvas.addEventListener("pointerup", endDrag); canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("pointerleave", ()=>{ if(!dragging) setHover(null); });
canvas.addEventListener("wheel", e=>{ if(view==="project") return; e.preventDefault();
  const mul = e.deltaMode === 1 ? 32 : 1, dx = (e.shiftKey ? e.deltaY : e.deltaX) * mul, dy = (e.shiftKey ? 0 : e.deltaY) * mul;
  if(reduce.matches){ S.off[0] += dx/S.zoom; S.off[1] += dy/S.zoom; S.dirty = true; }
  else { S.vel = [0,0]; if(!S.tgt) S.tgt = S.off.slice(); S.tgt[0] += dx / S.zoom; S.tgt[1] += dy / S.zoom; S.dirty = true; }
  setHover(null); }, {passive:false});
canvas.addEventListener("keydown", e=>{ const step=C()*1.5, m={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(m){ e.preventDefault(); tween(S,"off",[S.off[0]+m[0], S.off[1]+m[1]],350,ease.out); } });
/* Focus clavier sur la liste accessible → la caméra va chercher le projet */
$("#projets-liste").addEventListener("focusin", e=>{ const a=e.target.closest("[data-focus]"); if(!a||view!=="home") return;
  const id=PROJECTS.findIndex(p=>p.slug===a.dataset.focus); const cl=nearestCluster(id); if(!cl) return;
  const [x,y]=clusterCenter(cl.cx,cl.cy); tween(S,"off",[x,y],600,ease.inOut); S.hover=[cl.cx,cl.cy]; tween(S,"hoverAmt",1,350,ease.out); });

/* =============================== Router =============================== */
let view = "home", pendingCluster = null, homeState = null, current = null;
let firstGo = true; /* arrivée directe sur un lien : pas d animation de caméra avant le contenu */
const frame=$("#frame"), pill=$("#pill"), proj=$("#project"), pAbout=$("#panel-about"), pContact=$("#panel-contact"), ticker=$("#ticker");
function parse(){ const h=decodeURIComponent(location.hash.slice(1));
  if(h==="about") return {view:"about"}; if(h==="contact") return {view:"contact"};
  if(h.startsWith("projet-")){ const slug=h.slice(7); if(PROJECTS.some(p=>p.slug===slug)) return {view:"project", slug}; }
  return {view:"home"}; }
function setNav(v){ $$("[data-nav]").forEach(a=>{ if(a.dataset.nav===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const mA=$("#m-about"), mC=$("#m-contact");
  if(v==="about"){ mA.textContent="Fermer"; mA.href="#"; mA.classList.add("accent"); } else { mA.textContent="À propos"; mA.href="#about"; mA.classList.remove("accent"); }
  if(v==="contact"){ mC.textContent="Fermer"; mC.href="#"; mC.classList.add("accent"); } else { mC.textContent="Contact"; mC.href="#contact"; mC.classList.remove("accent"); } }
function panelShift(v){ if(mobileQ.matches) return 0; const w=v==="about"?S.W*16/44:v==="contact"?S.W*30/44:0; return w/2; }
async function go(){
  const r = parse(), prev = view;
  setHover(null); S.dirty = true;
  if(r.view==="project"){ await openProject(r.slug, prev); }
  else {
    if(prev==="project") await closeProject();
    view = r.view;
    pAbout.classList.toggle("open", view==="about"); pContact.classList.toggle("open", view==="contact");
    pAbout.setAttribute("aria-hidden", view!=="about"); pContact.setAttribute("aria-hidden", view!=="contact");
    tween(S,"shift",panelShift(view),420,ease.out);
    if(view==="about" && prev!=="about") revealText(pAbout, 180); else if(view==="contact" && prev!=="contact") revealText(pContact, 180);
    document.title = view==="about" ? "À propos — Tarik Bouabid" : view==="contact" ? "Contact — Tarik Bouabid" : "Tarik Bouabid — Product designer";
    if(view==="about") pAbout.focus({preventScroll:true}); else if(view==="contact") pContact.focus({preventScroll:true});
    else if(prev!=="home") canvas.focus({preventScroll:true});
  }
  setNav(view);
  firstGo = false;
}
async function openProject(slug, prev){
  const id = PROJECTS.findIndex(p=>p.slug===slug); const P = PROJECTS[id];
  pAbout.classList.remove("open"); pContact.classList.remove("open");
  if(prev!=="project"){
    homeState = { off:S.off.slice(), zoom:S.zoom };
    const cl = (pendingCluster && pendingCluster.id===id) ? pendingCluster : nearestCluster(id); pendingCluster=null;
    view = "project";
    frame.classList.add("is-hidden"); ticker.style.opacity="0";
    if(cl && !firstGo){ const [x,y]=clusterCenter(cl.cx,cl.cy); S.vel=[0,0];
      tween(S,"shift",0,400,ease.out); tween(S,"curve",0,620,ease.inOut);
      tween(S,"zoom", Math.min(S.W*.82/(4*C()), (S.H*.7)/(2*C())), 650, ease.inOut);
      await tween(S,"off",[x,y],650,ease.inOut); }
  }
  view = "project"; document.body.classList.add("is-project");
  const [ccx, ccy] = center(), cw = 4*C()*S.zoom, chh = 2*C()*S.zoom;
  const fromRect = prev!=="project" ? { x:ccx-cw/2, y:ccy-chh/2, w:cw, h:chh } : null;
  renderProject(P, id);
  $("#p-select").value = slug;
  pill.classList.add("on"); pill.setAttribute("aria-hidden","false");
  proj.classList.add("open"); proj.scrollTop = 0;
  animateGallery(fromRect);
  revealText($(".p-text", proj), fromRect ? 200 : 80);
  document.title = `${P.title} — Tarik Bouabid`;
  proj.focus({preventScroll:true});
}
async function closeProject(){
  document.body.classList.remove("is-project");
  proj.classList.remove("open"); pill.classList.remove("on"); pill.setAttribute("aria-hidden","true");
  frame.classList.remove("is-hidden"); ticker.style.opacity="";
  const hs = homeState || { off:S.off.slice(), zoom:1 };
  tween(S,"curve",.32,600,ease.inOut); tween(S,"zoom",1,600,ease.inOut); await tween(S,"off",hs.off,600,ease.inOut);
}
function renderProject(P, id){
  const N = PROJECTS[(id+1)%PROJECTS.length];
  const pp = "p." + P.slug;
  const sec = (label, inner) => `<section class="p-sec"><h2 class="t-label accent">${label}</h2>${inner}</section>`;
  proj.innerHTML = `<div class="p-wrap">
    <article class="p-text">
      <header class="p-head">
      <h1 class="t-display" data-edit="${pp}.title">${esc(P.title)}</h1>
      <p class="p-meta"><span data-edit="${pp}.category">${esc(P.category)}</span>, <span data-edit="${pp}.year">${esc(P.year)}</span></p>
      <p class="t-body" data-edit="${pp}.summary">${esc(P.summary)}</p></header>
      ${sec("Contexte", `<p class="t-body" data-edit="${pp}.context">${esc(P.context)}</p>`)}
      ${sec("Rôle", `<ul class="rules t-list">${P.role.map((x,k)=>`<li style="--i:${k}" data-edit="${pp}.role.${k}">${esc(x)}</li>`).join("")}</ul>`)}
      ${sec("Problème", `<p class="t-body" data-edit="${pp}.problem">${esc(P.problem)}</p>`)}
      ${sec("Process", `<ol class="steps">${P.process.map((s,k)=>`<li><div><b data-edit="${pp}.process.${k}.t">${esc(s.t)}</b><span data-edit="${pp}.process.${k}.d">${esc(s.d)}</span></div></li>`).join("")}</ol>`)}
      ${sec("Solution", `<p class="t-body" data-edit="${pp}.solution">${esc(P.solution)}</p>`)}
      ${sec(P.resultsLabel || "Résultats", `<div class="kpis">${P.results.map((r,k)=>`<div class="kpi"><span class="v" data-edit="${pp}.results.${k}.v">${esc(r.v)}</span><span class="k" data-edit="${pp}.results.${k}.k">${esc(r.k)}</span></div>`).join("")}</div>`)}
    </article>
    <div class="gallery" id="gallery" aria-label="Visuels du projet"></div>
    <a class="next" href="#projet-${N.slug}">
      <div class="next-h"><span class="t-label accent">Projet suivant</span><div class="t-display">${esc(N.title)}</div><span class="t-micro muted">${esc(N.category)} — ${esc(N.year)}</span></div>
      <div class="preview"><canvas width="1024" height="512" aria-hidden="true"></canvas></div>
    </a></div>`;
  stopLoops();
  if(P.media){ renderMedia(P); arrangeFlow(); drawCover($(".next canvas", proj).getContext("2d"), N, 0, 0, 1024, 512); return; }
  const layout = [["g4",2],["g1",0],["g1",1],["g2",5],["g2",4],["g1",3],["g1",0],["g4",2]];
  const caps = { desktop:"Écran desktop", phone:"Écran mobile", swatch:"Palette", type:"Typographie", flow:"Parcours", chart:"Données", icons:"Iconographie" };
  const gal = $("#gallery");
  layout.forEach(([cls,k],i)=>{ const fig=document.createElement("figure"); fig.className=cls; fig.dataset.k=k;
    const cv=document.createElement("canvas"); const W = cls==="g4"?1600:cls==="g2"?1200:700, H = cls==="g4"?900:cls==="g2"?600:700;
    cv.width=W; cv.height=H; cv.setAttribute("role","img"); const kind=P.tiles[k%P.tiles.length];
    cv.setAttribute("aria-label", `${P.title} : ${caps[kind]||"visuel"} (visuel provisoire)`);
    fig.appendChild(cv); const fc=document.createElement("figcaption"); fc.className="t-micro"; fc.textContent=caps[kind]||""; fig.appendChild(fc); gal.appendChild(fig);
    drawTile(cv.getContext("2d"), P, k, 0, 0, W, H); });
  drawCover($(".next canvas", proj).getContext("2d"), N, 0, 0, 1024, 512);
}

/* Galerie « media » : images et boucles animées (une seule horloge, seulement les boucles visibles) */
const LOOP_IMG = {};
let activeLoops = [], loopIO = null, loopRO = null;
function loopImages(){ ["hero","th0","th1","th2","th3","th4","th5","k_logo","k_scanMascot","k_pat0","k_pat1","k_pat2","k_pat3","k_pat4","k_pat5","k_pat6","l_shoe1","l_shoe2","l_logo","m_k_home","m_k_recipe","m_k_profile","m_l_splash","m_l_home","m_l_product"].forEach(n=>{ if(!LOOP_IMG[n] && ASSETS[n]){ const im=new Image(); im.src=ASSETS[n]; LOOP_IMG[n]=im; } }); }
function stopLoops(){ activeLoops = []; if(loopIO) loopIO.disconnect(); if(loopRO) loopRO.disconnect(); }
function sizeLoop(L){ const r=L.cv.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,L.def&&L.def.hd?2:1.25); const w=Math.max(2,Math.round(r.width*d)), h=Math.max(2,Math.round(r.height*d)); if(L.cv.width!==w||L.cv.height!==h){ L.cv.width=w; L.cv.height=h; } }
function drawLoop(L, p){ sizeLoop(L); L.def.draw(L.ctx, L.cv.width, L.cv.height, p, LOOP_IMG); }
/* Tablette et mobile : le texte se glisse entre les visuels (en-tête, image d'ouverture, puis une section toutes les deux rangées) */
function arrangeFlow(){
  const head = $(".p-head", proj), secs = $$(".p-sec", proj), figs = $$("#gallery > *", proj), next = $(".next", proj);
  const rows = []; let half = 0;
  figs.forEach(f => { const isHalf = f.classList.contains("g2") || f.classList.contains("g3"); if(isHalf && half % 2 === 1){ rows[rows.length-1].push(f); half++; } else { rows.push([f]); half = isHalf ? 1 : 0; } });
  const seq = [head]; const M = secs.length, Nr = rows.length;
  const slots = secs.map((s, k) => k === 0 ? 0 : Math.min(Nr - 1, Math.round(k * (Nr - 1) / M)));
  rows.forEach((r, i) => { seq.push(...r); secs.forEach((s, k) => { if(slots[k] === i) seq.push(s); }); });
  seq.forEach((el, i) => { if(el) el.style.order = i + 1; });
  if(next) next.style.order = seq.length + 10;
}
function renderMedia(P){
  loopImages();
  const gal = $("#gallery");
  loopIO = new IntersectionObserver(es=>es.forEach(e=>{ const L=activeLoops.find(l=>l.fig===e.target); if(L) L.visible=e.isIntersecting; }), { root:proj });
  loopRO = new ResizeObserver(()=>activeLoops.forEach(L=>{ if(reduce.matches) drawLoop(L, L.def.still); }));
  P.media.forEach((m,i)=>{
    if(m.text){ const b=document.createElement("div"), base=`p.${P.slug}.media.${i}.`; b.className="gtxt";
      b.innerHTML = `<h2></h2><div>${m.text?"<p class=\"t-body\"></p>":""}${m.list?"<dl></dl>":""}</div>`;
      const h=b.querySelector("h2"), t=b.querySelector(".t-body");
      h.textContent=m.h||""; h.dataset.edit=base+"h"; if(t){ t.textContent=m.text; t.dataset.edit=base+"text"; }
      (m.list||[]).forEach((it,j)=>{ const d=document.createElement("div"); d.innerHTML="<dt><b></b></dt><dd class=\"t-body\"></dd>";
        const bb=d.querySelector("b"), dd=d.querySelector("dd.t-body");
        bb.textContent=it.b; bb.dataset.edit=`${base}list.${j}.b`; dd.textContent=it.s; dd.dataset.edit=`${base}list.${j}.s`; b.querySelector("dl").appendChild(d); });
      gal.appendChild(b); return; }
    const fig=document.createElement("figure"); fig.className = ({full:"g4",half:"g2",third:"g3"})[m.span]||"g2"; if(m.rows===2){ fig.classList.add("rs2"); fig.style.setProperty("--ar", m.ratio); } fig.dataset.k = 99;
    if(m.bg) fig.style.background = m.bg;
    if(m.loop){
      const def = (window.EK_LOOPS||{})[m.loop] || (window.KX_LOOPS||{})[m.loop] || (window.LC_LOOPS||{})[m.loop] || (window.PR_LOOPS||{})[m.loop] || (window.MK_LOOPS||{})[m.loop]; fig.style.aspectRatio = def.ratio;
      const cv=document.createElement("canvas"); cv.setAttribute("role","img"); cv.setAttribute("aria-label", def.label); fig.appendChild(cv);
      const L={ fig, cv, ctx:cv.getContext("2d"), def, visible:false, t0:performance.now() + i*137 }; activeLoops.push(L); loopIO.observe(fig); loopRO.observe(fig);
    } else {
      fig.style.aspectRatio = m.ratio || "16/9";
      const im=document.createElement("img"); im.src=m.src || ASSETS[m.img]; im.dataset.editImg = `p.${P.slug}.media.${i}.src`; im.alt=m.alt||m.cap||""; im.decoding="async";
      if(!m.ratio) im.addEventListener("load", ()=>{ if(im.naturalWidth) fig.style.aspectRatio = im.naturalWidth + "/" + im.naturalHeight; }, { once:true });
      if(m.fit) im.style.objectFit=m.fit; if(m.pos) im.style.objectPosition="center "+m.pos; fig.appendChild(im);
    }
    if(m.cap){ const fc=document.createElement("figcaption"); fc.className="t-micro"; fc.textContent=m.cap; fig.appendChild(fc); }
    gal.appendChild(fig);
  });
  requestAnimationFrame(()=>activeLoops.forEach(L=>drawLoop(L, reduce.matches ? L.def.still : 0)));
}
let loopLast = 0;
function loopTick(now){
  if(now - loopLast < 32){ requestAnimationFrame(loopTick); return; } loopLast = now;
  if(view==="project" && !reduce.matches) activeLoops.forEach(L=>{ if(L.visible){ const d=L.def.dur; drawLoop(L, ((now - L.t0) % d + d) % d / d); } });
  requestAnimationFrame(loopTick);
}
requestAnimationFrame(loopTick);

/* Entrée des images : chaque visuel sort du sol (masque qui s'ouvre vers le haut + image qui remonte dans son cadre) */
let galleryIO = null;
const EASE_FLY = "cubic-bezier(.16,1,.3,1)";
const EASE_RISE = "cubic-bezier(.22,1,.36,1)";
function riseFig(f, delay){
  f.style.clipPath = ""; f.style.visibility = "";
  f.animate([{ clipPath:"inset(100% 0 0 0)", transform:"translateY(8rem)" }, { clipPath:"inset(0% 0 0 0)", transform:"translateY(0)" }],
    { duration:720, delay, easing:EASE_RISE, fill:"backwards" });
  const inner = f.querySelector("canvas, img");
  if(inner) inner.animate([{ transform:"translateY(-18%) scale(1.18)" }, { transform:"translateY(0) scale(1)" }],
    { duration:820, delay, easing:EASE_RISE, fill:"backwards" });
}
function animateGallery(src){
  if(galleryIO) galleryIO.disconnect();
  if(reduce.matches || !Element.prototype.animate) return;
  let batch = 0, batchT = 0;
  galleryIO = new IntersectionObserver(entries=>{
    const now = performance.now(); if(now - batchT > 200){ batch = 0; } batchT = now;
    entries.forEach(en=>{ if(!en.isIntersecting) return; galleryIO.unobserve(en.target); riseFig(en.target, batch++ * 60); });
  }, { root:proj, rootMargin:"0px 0px -6% 0px" });
  const vh = innerHeight, base = src ? 120 : 40; let n = 0;
  const txtIO = new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ txtIO.unobserve(en.target); revealText(en.target, 0); } }), { root:proj, rootMargin:"0px 0px -10% 0px" });
  $$("#gallery .gtxt", proj).forEach(b=>{ const r=b.getBoundingClientRect(); if(r.top < vh) revealText(b, base + 200); else txtIO.observe(b); });
  $$("#gallery figure", proj).forEach(f=>{
    const r = f.getBoundingClientRect();
    if(r.top < vh && r.bottom > 0) riseFig(f, base + n++ * 70);
    else { f.style.clipPath = "inset(100% 0 0 0)"; galleryIO.observe(f); }
  });
}

/* Text reveal staggered : découpe en mots, chaque mot glisse hors de son masque */
const TEXT_SEL = ".t-display, h1, h2, .t-body, .intro-hook, .t-label, .t-micro, .steps b, .steps span, .kpi .v, .kpi .k, .rules li, .f-nav a, .f-tag, .f-logo .name, .f-right .row1 a, .f-right .btn, .m-nav a, .c-links dt, .c-links dd";
function splitWords(el){
  if(el.dataset.split) return; el.dataset.split = "1";
  const walk = n => { const flex = /flex|grid/.test(getComputedStyle(n).display); [...n.childNodes].forEach(c=>{
    if(c.nodeType===3){ const parts=c.textContent.split(/(\s+)/); if(!c.textContent.trim()) return;
      const fr=document.createDocumentFragment();
      parts.forEach(p=>{ if(!p) return; if(/^\s+$/.test(p)) fr.appendChild(document.createTextNode(p));
        else { const w=document.createElement("span"); w.className="w"; const i=document.createElement("span"); i.className="wi"; i.textContent=p; w.appendChild(i); fr.appendChild(w); } });
      if(flex){ const run=document.createElement("span"); run.className="wl"; run.appendChild(fr); c.replaceWith(run); } else c.replaceWith(fr); }
    else if(c.nodeType===1 && !c.matches("svg,canvas,input,select,textarea,button,.w")) walk(c); }); };
  walk(el);
}
function revealText(root, base=0){
  if(!root || (typeof editing !== "undefined" && editing) || reduce.matches || !Element.prototype.animate) return;
  let t = base;
  $$(TEXT_SEL, root).forEach(el=>{
    if(!el.dataset.split && el.parentElement && el.parentElement.closest("[data-split]")) return;
    if(el.closest("[hidden]") || !el.getClientRects().length) return;
    splitWords(el);
    const ws = $$(".wi", el); if(!ws.length) return;
    const big = el.matches(".t-display, h1, h2, .kpi .v, .f-logo .name");
    if(big || ws.length <= 4){
      /* titres et libellés courts : mot par mot */
      ws.forEach((w,i)=> w.animate([{transform:"translateY(115%)"},{transform:"translateY(0)"}],
        { duration: big ? 650 : 500, delay: Math.min(t + i*(big?35:18), 900), easing: EASE_FLY, fill:"backwards" }));
      t += big ? 90 : 40;
    } else {
      /* corps de texte : ligne par ligne, chaque ligne sort du sol */
      let line = -1, lastTop = null;
      ws.forEach(w=>{ const top = w.parentElement.offsetTop; if(lastTop===null || Math.abs(top-lastTop) > 2){ line++; lastTop = top; }
        w.animate([{transform:"translateY(120%)"},{transform:"translateY(0)"}],
          { duration: 600, delay: Math.min(t + line*55, 1000), easing: EASE_RISE, fill:"backwards" }); });
      t += 50 + line*30;
    }
  });
}
$("#p-select").addEventListener("change", e=>{ location.hash = "projet-" + e.target.value; });
proj.addEventListener("click", e=>{ const a=e.target.closest("a.next"); if(a){ proj.scrollTop=0; } });

/* ============================== Contact =============================== */
const form = $("#form");
function composed(){ const f=new FormData(form); return `Nom : ${f.get("name")}\nEmail : ${f.get("email")}\nEntreprise : ${f.get("company")||"—"}\nType : ${f.get("type")}\n\n${f.get("message")}`; }
form.addEventListener("submit", e=>{ e.preventDefault(); let ok=true, first=null;
  [["f-name",v=>v.trim().length>1],["f-email",v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],["f-type",v=>!!v],["f-msg",v=>v.trim().length>5]].forEach(([id,test])=>{
    const el=$("#"+id), bad=!test(el.value); el.closest(".field").classList.toggle("err",bad); el.setAttribute("aria-invalid",bad); if(bad){ ok=false; first=first||el; } });
  if(!ok){ first.focus(); return; } $("#status").hidden=false; $("#copy-msg").focus();
  const ml = document.createElement("a"); ml.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent("Projet : " + $("#f-type").value + " - " + $("#f-name").value) + "&body=" + encodeURIComponent(composed()); ml.target = "_top"; document.body.appendChild(ml); ml.click(); ml.remove(); });
form.addEventListener("input", e=>{ const f=e.target.closest(".field"); if(f && f.classList.contains("err")){ f.classList.remove("err"); e.target.removeAttribute("aria-invalid"); } });
async function copyText(txt, btn){ const old=btn.textContent; try{ await navigator.clipboard.writeText(txt); btn.textContent="Copié"; }
  catch(_){ const r=document.createRange(); const n=btn.previousElementSibling||btn; r.selectNodeContents(n); const s=getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent="Sélectionné, copie avec Ctrl+C"; }
  setTimeout(()=>btn.textContent=old, 2200); }
const ICON_COPY = `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>`, ICON_OK = `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`;
async function copyIcon(txt, btn){ try{ await navigator.clipboard.writeText(txt); }
  catch(_){ const r=document.createRange(); r.selectNodeContents(btn.previousElementSibling||btn); const sl=getSelection(); sl.removeAllRanges(); sl.addRange(r); return; }
  btn.innerHTML = ICON_OK; btn.classList.add("ok"); btn.setAttribute("aria-label","Adresse copiée"); btn.title = "Copié";
  setTimeout(()=>{ btn.innerHTML = ICON_COPY; btn.classList.remove("ok"); btn.setAttribute("aria-label","Copier l'adresse email"); btn.title = "Copier"; }, 2000); }
document.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b) return; if(b.id==="copy-msg") copyText(composed(), b); if(b.id==="copy-email") copyIcon(SITE.email, b); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && view!=="home") location.hash=""; });

/* ============================ Repli sans WebGL ======================== */
function fallback(){
  canvas.hidden = true;
  const wrap = document.createElement("div"); wrap.className="fallback";
  PROJECTS.forEach(P=>{ const a=document.createElement("a"); a.href="#projet-"+P.slug; const cv=document.createElement("canvas"); cv.width=1024; cv.height=512; a.appendChild(cv);
    a.insertAdjacentHTML("beforeend", `<span class="t-micro">${esc(P.title)} — ${esc(P.category)} — ${esc(P.year)}</span>`); wrap.appendChild(a); drawCover(cv.getContext("2d"),P,0,0,1024,512); });
  document.body.insertBefore(wrap, $("#frame"));
}

/* ================================ Boot ================================ */

/* Pas d écran de chargement : le titre et le cadre sont lisibles tout de suite,
   seul le plan de travail apparaît en fondu une fois ses vignettes prêtes. */
document.body.classList.add("loading");
fill();
revealText(frame, 0); revealText(document.getElementById("intro"), 120);
let glOk = false; try{ glOk = initGL(); }catch(err){ console.warn(err); glOk=false; }
resize(); readColors();
INTRO_W = [3*C(), 0];
S.off = [3*C(), .1*C()]; S.prev = S.off.slice();
addEventListener("resize", ()=>{ resize(); S.shift = panelShift(view); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
new MutationObserver(readColors).observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
reduce.addEventListener("change", ()=>S.dirty=true);
addEventListener("hashchange", go);
(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))]) : Promise.resolve())
  .then(()=> Promise.all(['600 1em "Bricolage Grotesque"','400 1em "Inter Tight"','500 1em "Roboto Mono"'].map(f=>document.fonts.load(f).catch(()=>{}))))
  .then(()=>{ resize(); return glOk ? buildAtlas() : fallback(); })
  .then(()=>{ document.body.classList.remove("loading"); S.dirty = true; });
if(glOk) requestAnimationFrame(loop); else { updateDom(); }
go();
