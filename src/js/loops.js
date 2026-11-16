/* Boucles animées Electroni[k] — chaque boucle est une fonction déterministe de p ∈ [0,1).
   draw(ctx, W, H, p, A) : A = images chargées. render(0) === render(1). */
(function(){
const EK = { ink:"#18151E", ink2:"#2F2B3B", ink3:"#474059", ink4:"#5E5676", v1:"#4D16E9", v2:"#7145ED", v3:"#9473F2", v4:"#B8A2F6",
  cream:"#F3F1EC", paper:"#FBFAF7", mute:"#B3ADC4", lav:"#ECE6FD", line:"#D6D1E4" };
const SANS = '"Manrope", "Inter Tight", system-ui, sans-serif';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const seg = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,t) => a + (b-a)*t;
const io = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const out = t => 1-Math.pow(1-t,3);
const expo = t => t===0?0:t===1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2;
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function cover(c, img, x, y, w, h, zoom=1, fx=.5, fy=.5){
  if(!img || !img.width) { c.fillStyle = EK.ink2; c.fillRect(x,y,w,h); return; }
  const s = Math.max(w/img.width, h/img.height) * zoom, iw = img.width*s, ih = img.height*s;
  c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); c.drawImage(img, x + (w-iw)*fx, y + (h-ih)*fy, iw, ih); c.restore();
}
const font = (k, w, s, fam=SANS, it="") => `${it}${w} ${s*k}px ${fam}`;

/* 1. Entrée en scène : noir → l'image s'ouvre → plein cadre → titre et navigation */
function intro(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = "#0B0A0F"; c.fillRect(0,0,W,H);
  const open = io(seg(p,.07,.2)), grow = expo(seg(p,.3,.5));
  if(open > 0){
    const sw = 420, sh = 236;
    const smallH = sh*open;
    const x = lerp(800-sw/2, 0, grow), w = lerp(sw, 1600, grow);
    const hh = lerp(smallH, DH, grow), y = lerp(DH/2 - smallH/2, 0, grow);
    c.save(); c.beginPath(); c.rect(x*k, y*k, w*k, hh*k); c.clip();
    const fw = lerp(sw, 1600, grow), fh = lerp(sh, DH, grow), fx = lerp(800-sw/2, 0, grow), fy = lerp(DH/2-sh/2, 0, grow);
    cover(c, A.hero, fx*k, fy*k, fw*k, fh*k, lerp(1.12, 1, out(seg(p,.2,.62))));
    /* titre + navigation masqués jusqu'à l'étape 04 */
    const ui = 1 - out(seg(p,.56,.68));
    if(ui > 0){
      c.globalAlpha = ui;
      const g = c.createLinearGradient(0, fy*k, 0, (fy + fh*.56)*k);
      g.addColorStop(0, "rgba(11,10,15,1)"); g.addColorStop(.72, "rgba(11,10,15,.96)"); g.addColorStop(1, "rgba(11,10,15,0)");
      c.fillStyle = g; c.fillRect(fx*k, fy*k, fw*k, fh*.56*k);
      const g2 = c.createLinearGradient((fx+fw*.8)*k, 0, (fx+fw)*k, 0);
      g2.addColorStop(0, "rgba(11,10,15,0)"); g2.addColorStop(.5, "rgba(11,10,15,.95)");
      c.fillStyle = g2; c.fillRect((fx+fw*.8)*k, (fy+fh*.84)*k, fw*.2*k, fh*.16*k);
      c.globalAlpha = 1;
    }
    c.restore();
  }
  const fade = io(seg(p,.88,1));
  if(fade > 0){ c.fillStyle = `rgba(11,10,15,${fade})`; c.fillRect(0,0,W,H); }
}

/* 2. Audit : quatre chiffres qui montent puis s'effacent */
function audit(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = EK.ink; c.fillRect(0,0,W,H);
  const gin = io(seg(p,0,.08)), gout = 1 - io(seg(p,.86,.97)), ga = Math.min(gin, gout);
  if(ga <= 0) return;
  c.globalAlpha = ga;
  const cols = 4, mx = 80, gap = 48, cw = (1600 - 2*mx - gap*(cols-1))/cols, top = DH*.33;
  const items = [
    { kind:"grade", label:"Éco-conception · 46/100" },
    { kind:"num", to:4.87, dec:2, unit:" Mo", label:"Poids de la page d'accueil" },
    { kind:"num", to:82, dec:0, unit:"", label:"Requêtes serveur" },
    { kind:"num", to:13, dec:0, unit:"", label:"Rubriques sur un seul niveau" }
  ];
  items.forEach((it, i) => {
    const x = mx + i*(cw+gap), d = .05 + i*.07;
    const ln = out(seg(p, d, d+.16));
    c.fillStyle = "rgba(243,241,236,.18)"; c.fillRect(x*k, top*k, cw*ln*k, Math.max(1, k));
    const t = io(seg(p, d+.04, d+.34));
    const big = 112, by = top + 40 + big*.82;
    c.save(); c.beginPath(); c.rect(x*k, (top+20)*k, cw*k, (big+40)*k); c.clip();
    if(it.kind === "grade"){
      const rise = out(seg(p, d+.06, d+.24));
      const g = c.createLinearGradient(x*k, 0, (x+110)*k, 0); g.addColorStop(0, EK.v1); g.addColorStop(1, EK.v4);
      c.fillStyle = g; c.font = font(k, 800, big); c.textBaseline = "alphabetic";
      c.fillText("D", x*k, (by + (1-rise)*big*1.1)*k);
    } else {
      const v = it.to * t, txt = v.toFixed(it.dec).replace(".", ",");
      c.fillStyle = EK.cream; c.font = font(k, 800, big); c.textBaseline = "alphabetic";
      c.fillText(txt, x*k, by*k);
      if(it.unit){ const wv = c.measureText(txt).width; c.font = font(k, 800, 44); c.fillText(it.unit, x*k + wv + 6*k, by*k); }
    }
    c.restore();
    c.globalAlpha = ga * out(seg(p, d+.12, d+.3));
    c.fillStyle = EK.mute; c.font = font(k, 400, 24); c.fillText(it.label, x*k, (by + 62)*k);
    c.globalAlpha = ga;
  });
  c.globalAlpha = 1;
}

/* 3. Architecture : 13 rubriques barrées → 6 sections */
const BEFORE = ["Agenda","Installations & performances","Formations","Ateliers","Actions culturelles","Festival","L'association","Actualités","Souvenirs","Valeurs & engagement","Adhérer","Partenaire","Contact"];
const AFTER = [["Agenda"],["Actualités"],["Créations"],["Actions culturelles","Formations","Ateliers","Dispositifs"],["L'association","Notre histoire","Nos partenaires","Nos valeurs"],["Contact"]];
function ia(c, W, H, p, A){
  const k = W/1600;
  c.fillStyle = EK.cream; c.fillRect(0,0,W,H);
  const ga = 1 - io(seg(p,.9,.985)); if(ga <= 0) return;
  c.globalAlpha = ga; c.textBaseline = "middle";
  /* AVANT */
  c.fillStyle = EK.ink4; c.font = font(k, 600, 22); c.fillText("AVANT · 13 RUBRIQUES", 80*k, 100*k);
  c.font = font(k, 500, 25);
  let x = 80, y = 140; const ph = 58, gapx = 12, gapy = 14;
  BEFORE.forEach((t, i) => {
    const tw = c.measureText(t).width/k, w = tw + 44;
    if(x + w > 1520){ x = 80; y += ph + gapy; }
    const a = out(seg(p, .02 + i*.008, .1 + i*.008)), s = io(seg(p, .17 + i*.012, .25 + i*.012));
    c.globalAlpha = ga * a * (1 - .5*s);
    rr(c, x*k, (y + (1-a)*14)*k, w*k, ph*k, ph/2*k); c.strokeStyle = EK.line; c.lineWidth = 1.5*k; c.stroke();
    c.fillStyle = EK.ink3; c.fillText(t, (x+22)*k, (y + ph/2 + (1-a)*14)*k);
    if(s > 0){ c.strokeStyle = EK.ink3; c.lineWidth = 1.6*k; c.beginPath(); c.moveTo((x+18)*k, (y+ph/2)*k); c.lineTo((x+18+(tw+8)*s)*k, (y+ph/2)*k); c.stroke(); }
    x += w + gapx;
  });
  c.globalAlpha = ga;
  /* APRÈS */
  const top = 400;
  c.globalAlpha = ga * out(seg(p,.36,.44));
  c.fillStyle = EK.v1; c.font = font(k, 600, 22); c.fillText("APRÈS · 6 SECTIONS", 80*k, top*k);
  const ra = out(seg(p,.38,.46));
  c.globalAlpha = ga * ra;
  const rw = 240, rh = 66, rx = 800 - rw/2, ry = top + 30 + (1-ra)*16;
  rr(c, rx*k, ry*k, rw*k, rh*k, rh/2*k); c.fillStyle = EK.ink; c.fill();
  c.fillStyle = EK.cream; c.font = font(k, 600, 26); c.textAlign = "center"; c.fillText("Accueil", 800*k, (ry + rh/2)*k); c.textAlign = "left";
  const n = AFTER.length, bx0 = 80, bw = (1440 - (n-1)*16)/n, by = top + 168;
  const cxs = AFTER.map((_, i) => bx0 + i*(bw+16) + bw/2);
  const ln = io(seg(p,.44,.54));
  c.globalAlpha = ga; c.strokeStyle = EK.v4; c.lineWidth = 2*k; c.beginPath();
  const midY = top + 30 + rh + 34;
  c.moveTo(800*k, (top+30+rh)*k); c.lineTo(800*k, lerp(top+30+rh, midY, clamp(ln*2))*k);
  if(ln > .5){ const t = (ln - .5)*2; c.moveTo(lerp(800, cxs[0], t)*k, midY*k); c.lineTo(lerp(800, cxs[n-1], t)*k, midY*k);
    cxs.forEach(cx => { c.moveTo(cx*k, midY*k); c.lineTo(cx*k, lerp(midY, by, t)*k); }); }
  c.stroke();
  AFTER.forEach((col, i) => {
    const bx = bx0 + i*(bw+16), a = out(seg(p, .5 + i*.025, .6 + i*.025));
    c.globalAlpha = ga * a;
    const bh = 96, yy = by + (1-a)*20;
    rr(c, bx*k, yy*k, bw*k, bh*k, 10*k); c.fillStyle = EK.v1; c.fill();
    c.fillStyle = "#fff"; c.font = font(k, 600, 27); c.textBaseline = "top";
    const words = col[0].split(" "); let line = "", ly = yy + 18;
    words.forEach(wd => { const t = line ? line + " " + wd : wd; if(c.measureText(t).width/k > bw - 32 && line){ c.fillText(line, (bx+16)*k, ly*k); ly += 33; line = wd; } else line = t; });
    c.fillText(line, (bx+16)*k, ly*k);
    col.slice(1).forEach((s, j) => {
      const sa = out(seg(p, .62 + i*.02 + j*.03, .7 + i*.02 + j*.03));
      c.globalAlpha = ga * sa; const sy = by + bh + 10 + j*60 + (1-sa)*10;
      rr(c, bx*k, sy*k, bw*k, 52*k, 8*k); c.fillStyle = EK.lav; c.fill();
      c.fillStyle = EK.ink3; c.font = font(k, 500, 23); c.fillText(s, (bx+16)*k, (sy+14)*k);
    });
    c.textBaseline = "middle";
  });
  c.globalAlpha = 1; c.textBaseline = "alphabetic";
}

/* 4. Langage visuel : la grotesque structure, l'italique change de mot */
const WORDS = ["à la création", "à la transmission", "à l'inclusion"];
function typo(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = EK.ink; c.fillRect(0,0,W,H);
  const x0 = 110, y1 = DH*.42, y2 = y1 + 128;
  c.fillStyle = EK.cream; c.font = font(k, 600, 112); c.textBaseline = "alphabetic";
  c.fillText("Une association", x0*k, y1*k);
  c.fillText("dédiée", x0*k, y2*k);
  const wx = x0 + c.measureText("dédiée ").width/k;
  const n = WORDS.length, f = p*n, idx = Math.floor(f) % n, t = f - Math.floor(f);
  const tr = seg(t, .74, 1);
  const size = 124;
  c.save(); c.beginPath(); c.rect(wx*k, (y2 - size*1.05)*k, 1600*k, size*1.42*k); c.clip();
  const drawWord = (word, phase, dir) => {
    c.font = font(k, 500, size, SERIF, "italic "); c.fillStyle = EK.v4;
    let cx = wx; [...word].forEach((ch, i) => {
      const lt = io(clamp((phase - i*.025) / .55));
      const off = dir < 0 ? -lt*size*1.3 : (1-lt)*size*1.3;
      c.fillText(ch, cx*k, (y2 + off)*k); cx += c.measureText(ch).width/k;
    });
  };
  if(tr <= 0) drawWord(WORDS[idx], 0, -1);
  else { drawWord(WORDS[idx], tr*1.4, -1); drawWord(WORDS[(idx+1)%n], tr*1.4 - .25, 1); }
  c.restore();
  /* légende fixe */
  c.font = font(k, 500, 22); c.fillStyle = EK.mute;
  c.fillText("Manrope — structure", x0*k, (DH - 92)*k);
  c.font = font(k, 500, 26, SERIF, "italic "); c.fillStyle = EK.v4;
  c.fillText("Cormorant Garamond — la touche humaine", (x0 + 300)*k, (DH - 92)*k);
  const sw = [EK.ink2, EK.ink3, EK.ink4, EK.v1, EK.v2, EK.v3, EK.v4];
  sw.forEach((col, i) => { rr(c, (1600 - 110 - (sw.length - i)*52)*k, (DH - 122)*k, 40*k, 40*k, 8*k); c.fillStyle = col; c.fill(); });
}

/* 5. Catalogue filtrable : la sélection glisse, les cartes se recomposent */
const CARDS = [
  { t:"Olímpicos", tag:"Expositions", img:"th0" }, { t:"Urbanimal", tag:"Performance", img:"th1" },
  { t:"Ciné cité", tag:"Installations", img:"th2" }, { t:"Instabilités", tag:"Expositions", img:"th3" },
  { t:"La grande histoire du dessin", tag:"Performance", img:"th4" }, { t:"Piafs !", tag:"Installations", img:"th5" }
];
const CHIPS = ["Tous", "Installations", "Performance", "Expositions"];
const STATES = [{ chip:0, set:[0,1,2,3,4,5] }, { chip:3, set:[0,3] }, { chip:2, set:[1,4] }, { chip:0, set:[0,1,2,3,4,5] }];
const T = [[.16,.25],[.42,.51],[.68,.77]];
function catalogue(c, W, H, p, A){
  const k = W/1600;
  c.fillStyle = EK.paper; c.fillRect(0,0,W,H);
  c.textBaseline = "middle";
  c.fillStyle = EK.ink; c.font = font(k, 600, 22); c.fillText("Filtrer par :", 80*k, 92*k);
  /* puces */
  c.font = font(k, 500, 22);
  let x = 230; const chips = CHIPS.map(t => { const w = c.measureText(t).width/k + 40; const r = { x, w, t }; x += w + 12; return r; });
  /* état courant */
  let a = 0, b = 0, tt = 0;
  if(p < T[0][0]) { a = b = 0; } else if(p < T[0][1]) { a = 0; b = 1; tt = io(seg(p, ...T[0])); }
  else if(p < T[1][0]) { a = b = 1; } else if(p < T[1][1]) { a = 1; b = 2; tt = io(seg(p, ...T[1])); }
  else if(p < T[2][0]) { a = b = 2; } else if(p < T[2][1]) { a = 2; b = 3; tt = io(seg(p, ...T[2])); } else { a = b = 3; }
  const ca = chips[STATES[a].chip], cb = chips[STATES[b].chip];
  const selX = lerp(ca.x, cb.x, tt), selW = lerp(ca.w, cb.w, tt);
  chips.forEach(ch => { rr(c, ch.x*k, 68*k, ch.w*k, 48*k, 6*k); c.strokeStyle = EK.ink; c.lineWidth = 1.3*k; c.stroke(); });
  rr(c, selX*k, 68*k, selW*k, 48*k, 6*k); c.fillStyle = EK.ink; c.fill();
  chips.forEach(ch => { c.fillStyle = EK.ink; c.fillText(ch.t, (ch.x + 20)*k, 92*k); });
  c.save(); rr(c, selX*k, 68*k, selW*k, 48*k, 6*k); c.clip();
  chips.forEach(ch => { c.fillStyle = EK.paper; c.fillText(ch.t, (ch.x + 20)*k, 92*k); });
  c.restore();
  /* curseur */
  const prev = [0,3,2,0];
  let cur = chips[0];
  for(let i = 0; i < 3; i++){ if(p >= T[i][0] - .09){ const m = io(seg(p, T[i][0] - .09, T[i][0] - .01)); const A1 = chips[prev[i]], B1 = chips[prev[i+1]]; cur = { x: lerp(A1.x, B1.x, m), w: lerp(A1.w, B1.w, m) }; } }
  /* cartes */
  const gx = 80, colW = (1440 - 2*32)/3, thH = 236, cardH = 350, gy = 160;
  const slot = s => ({ x: gx + (s%3)*(colW+32), y: gy + Math.floor(s/3)*(cardH+24) });
  CARDS.forEach((cd, j) => {
    const sa = STATES[a].set.indexOf(j), sb = STATES[b].set.indexOf(j);
    let pos, al, sc = 1;
    if(sa >= 0 && sb >= 0){ const A1 = slot(sa), B1 = slot(sb), m = io(seg(tt, .3, 1)); pos = { x: lerp(A1.x, B1.x, m), y: lerp(A1.y, B1.y, m) }; al = 1; }
    else if(sa >= 0){ const f = seg(tt, 0, .4); pos = slot(sa); al = 1 - f; sc = lerp(1, .94, f); }
    else if(sb >= 0){ const f = out(seg(tt, .55, 1)); pos = slot(sb); al = f; sc = lerp(.94, 1, f); }
    else return;
    if(al <= 0) return;
    c.save(); c.globalAlpha = al;
    const cx = pos.x + colW/2, cy = pos.y + cardH/2;
    c.translate(cx*k, cy*k); c.scale(sc, sc); c.translate(-cx*k, -cy*k);
    cover(c, A[cd.img], pos.x*k, pos.y*k, colW*k, thH*k);
    const ty = pos.y + thH + 16;
    c.font = font(k, 500, 17);
    const t1 = "Tout public", w1 = c.measureText(t1).width/k + 22;
    c.fillStyle = EK.ink; c.fillRect(pos.x*k, ty*k, w1*k, 32*k); c.fillStyle = EK.paper; c.fillText(t1, (pos.x+11)*k, (ty+16)*k);
    const w2 = c.measureText(cd.tag).width/k + 22;
    c.strokeStyle = EK.ink; c.lineWidth = 1.2*k; c.strokeRect((pos.x + w1 + 10)*k, ty*k, w2*k, 32*k);
    c.fillStyle = EK.ink; c.fillText(cd.tag, (pos.x + w1 + 21)*k, (ty+16)*k);
    c.font = font(k, 600, 26); c.fillText(cd.t.toUpperCase(), pos.x*k, (ty + 64)*k);
    c.restore();
  });
  /* flèche du curseur */
  const px = (cur.x + cur.w*.62)*k, py = 104*k, s = k*1.1;
  c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + 30*s); c.lineTo(px + 8*s, py + 23*s); c.lineTo(px + 14*s, py + 36*s); c.lineTo(px + 19*s, py + 34*s); c.lineTo(px + 13*s, py + 21*s); c.lineTo(px + 23*s, py + 21*s); c.closePath();
  c.fillStyle = "#fff"; c.fill(); c.strokeStyle = EK.ink; c.lineWidth = 1.6*k; c.stroke();
  c.textBaseline = "alphabetic";
}

const LOOPS = {
  intro: { draw:intro, ratio:16/9, dur:6000, still:.8, label:"Animation d'entrée : la photo sort du noir, s'ouvre en plein écran, puis le titre et la navigation apparaissent" },
  audit: { draw:audit, ratio:21/9, dur:5000, still:.7, label:"Audit : score d'éco-conception D, 4,87 Mo, 82 requêtes, 13 rubriques" },
  ia: { draw:ia, ratio:16/9, dur:7000, still:.82, label:"Architecture : 13 rubriques barrées, remplacées par 6 sections" },
  typo: { draw:typo, ratio:2, dur:6000, still:.1, label:"Langage visuel : Manrope pour la structure, Cormorant Garamond en italique pour les mots qui changent" },
  catalogue: { draw:catalogue, ratio:16/9, dur:7000, still:.3, label:"Catalogue : les filtres changent de sélection et les cartes se recomposent" }
};
if(typeof window !== "undefined") window.EK_LOOPS = LOOPS;
})();

/* Boucles animées Kioui — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
(function(){
const KX = { lime:"#DBDF0D", linen:"#FAF1E5", green:"#013D2A", pumpkin:"#FF7006", rose:"#FF316F", ink:"#1B1820",
  peach:"#FFD6B5", mint:"#E6ECEA", sand:"#E9DED3", pink:"#FFD3EE", cream:"#F6F3EC", grey:"#6E6660", line:"#E3D9CC", leaf:"#12B26C" };
const F = '"Montserrat Alternates", "Inter Tight", system-ui, sans-serif';
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const seg = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,t) => a + (b-a)*t;
const io = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const out = t => 1-Math.pow(1-t,3);
const back = t => { const c1 = 1.7, c3 = c1+1; return t<=0 ? 0 : 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
function rr(c,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
const font = (k, w, s) => `${w} ${s*k}px ${F}`;
function leafIcon(c, x, y, s, col){ c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = s*.12; c.beginPath();
  c.moveTo(-s*.4, s*.4); c.quadraticCurveTo(-s*.45, -s*.4, s*.45, -s*.45); c.quadraticCurveTo(s*.4, s*.4, -s*.4, s*.4); c.moveTo(-s*.4, s*.4); c.lineTo(s*.1, -s*.05); c.stroke(); c.restore(); }
function badge(c, k, x, y, val){ /* pastille de points : fond encre, nombre + feuille */
  c.font = font(k, 600, 20); const t = String(val), tw = c.measureText(t).width/k;
  const w = tw + 58; rr(c, x*k, y*k, w*k, 34*k, 17*k); c.fillStyle = KX.ink; c.fill();
  c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(t, (x+14)*k, (y+18)*k);
  leafIcon(c, (x + tw + 34)*k, (y+17)*k, 16*k, "#fff"); c.textBaseline = "alphabetic"; return w; }

/* 1. Scanner : un geste pour l'inventaire */
const INGR = [["Échalotes",4,"#C9A3B8"],["Saumon (frais)",2,"#FF8A5C"],["Salade",1,"#7FC97A"],["Viande",4,"#E86A5A"],["Moutarde",1,"#C9A227"],["Vinaigre",1,"#B5652E"],["Lentilles",1,"#8B6B4A"]];
function scan(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = KX.mint; c.fillRect(0,0,W,H);
  const pw = 360, ph = Math.min(760, DH - 70), px = 800 - pw/2, py = (DH - ph)/2;
  /* bulles latérales */
  const pill = (txt, num, x, y, a, alignRight) => { if(a <= 0) return; c.save(); c.globalAlpha = a;
    c.font = font(k, 600, 24); const tw = c.measureText(txt).width/k, w = tw + 92, xx = alignRight ? x - w : x, yy = y + (1-a)*12;
    rr(c, xx*k, yy*k, w*k, 60*k, 30*k); c.fillStyle = KX.lime; c.fill();
    c.beginPath(); c.arc((xx+32)*k, (yy+30)*k, 16*k, 0, 7); c.fillStyle = KX.ink; c.fill();
    c.fillStyle = "#fff"; c.font = font(k, 700, 18); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(num, (xx+32)*k, (yy+31)*k);
    c.textAlign = "left"; c.fillStyle = KX.ink; c.font = font(k, 600, 24); c.fillText(txt, (xx+62)*k, (yy+31)*k); c.restore(); c.textBaseline = "alphabetic"; };
  /* téléphone */
  c.save(); c.shadowColor = "rgba(27,24,32,.18)"; c.shadowBlur = 40*k; c.shadowOffsetY = 18*k;
  rr(c, px*k, py*k, pw*k, ph*k, 56*k); c.fillStyle = KX.ink; c.fill(); c.restore();
  const sx = px + 11, sy = py + 11, sw = pw - 22, sh = ph - 22;
  c.save(); rr(c, sx*k, sy*k, sw*k, sh*k, 46*k); c.clip();
  /* écran A : scanner */
  c.fillStyle = "#E6ECEA"; c.fillRect(sx*k, sy*k, sw*k, sh*k);
  const header = (bg) => { if(A.k_logo && A.k_logo.width){ const lh = 26, lw = lh * A.k_logo.width / A.k_logo.height; c.drawImage(A.k_logo, (sx+24)*k, (sy+34)*k, lw*k, lh*k); }
    badge(c, k, sx + sw - 92, sy + 30, 237); };
  header();
  const fcx = sx + sw/2, fcy = sy + sh*.38, fs = 74 * (1 + .04*Math.sin(p*Math.PI*8) * (p < .2 ? 1 : 0));
  c.strokeStyle = KX.ink; c.lineWidth = 9*k; c.lineCap = "round";
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => { c.beginPath();
    c.moveTo((fcx + dx*fs)*k, (fcy + dy*fs*.45)*k); c.lineTo((fcx + dx*fs)*k, (fcy + dy*fs*.85)*k);
    c.quadraticCurveTo((fcx + dx*fs)*k, (fcy + dy*fs)*k, (fcx + dx*fs*.85)*k, (fcy + dy*fs)*k); c.lineTo((fcx + dx*fs*.45)*k, (fcy + dy*fs)*k); c.stroke(); });
  const sc = seg(p, .2, .42), ly = fcy + (sc > 0 && sc < 1 ? -Math.cos(sc*Math.PI*4) * -fs*.7 : 0);
  c.beginPath(); c.moveTo((fcx - fs*.9)*k, ly*k); c.lineTo((fcx + fs*.9)*k, ly*k); c.stroke();
  if(sc > 0 && sc < 1){ const g = c.createLinearGradient(0, (ly-40)*k, 0, ly*k); g.addColorStop(0, "rgba(219,223,13,0)"); g.addColorStop(1, "rgba(219,223,13,.45)"); c.fillStyle = g; c.fillRect((fcx - fs*.9)*k, (ly-40)*k, fs*1.8*k, 40*k); }
  c.lineCap = "butt";
  c.fillStyle = KX.ink; c.font = font(k, 500, 17); c.textAlign = "center"; c.fillText("Appuyer pour scanner", fcx*k, (fcy + fs + 44)*k);
  if(A.k_scanMascot && A.k_scanMascot.width){ const mh = 150, mw = mh * A.k_scanMascot.width / A.k_scanMascot.height; c.drawImage(A.k_scanMascot, (sx + sw - mw)*k, (sy + sh*.62)*k, mw*k, mh*k); }
  const bsY = sy + sh - 178;
  rr(c, sx*k, bsY*k, sw*k, 260*k, 32*k); c.fillStyle = "#fff"; c.fill();
  const bw = 210, bx = fcx - bw/2, by = bsY + 34;
  rr(c, bx*k, by*k, bw*k, 54*k, 27*k); c.fillStyle = KX.sand; c.fill();
  c.fillStyle = KX.ink; c.font = font(k, 500, 18); c.fillText("Scannes ton frigo", fcx*k, (by + 33)*k);
  c.font = font(k, 500, 16); c.fillText("Passer  →", fcx*k, (by + 98)*k); c.textAlign = "left";
  const tap = seg(p, .11, .2);
  if(tap > 0 && tap < 1){ c.beginPath(); c.arc(fcx*k, (by+27)*k, (10 + 70*out(tap))*k, 0, 7); c.fillStyle = `rgba(27,24,32,${.18*(1-tap)})`; c.fill(); }
  /* écran B : ingrédients (monte, puis redescend) */
  const up = io(seg(p, .42, .52)) - io(seg(p, .9, .99));
  if(up > 0){
    const oy = (1 - up) * sh;
    c.save(); c.translate(0, oy*k);
    c.fillStyle = "#fff"; c.fillRect(sx*k, sy*k, sw*k, sh*k);
    header();
    c.fillStyle = KX.ink; c.font = font(k, 600, 22); c.fillText("Tes ingrédients", (sx+24)*k, (sy+118)*k);
    INGR.forEach(([name, q, col], i) => {
      const a = back(seg(p, .52 + i*.022, .6 + i*.022)); if(a <= 0) return;
      const ry = sy + 144 + i*50; c.save(); c.globalAlpha = clamp(a);
      c.font = font(k, 500, 15); const tw = c.measureText(name).width/k;
      const cx0 = sx + 24, scl = lerp(.85, 1, clamp(a));
      c.translate(cx0*k, (ry+17)*k); c.scale(scl, scl); c.translate(-cx0*k, -(ry+17)*k);
      rr(c, cx0*k, ry*k, (tw + 54)*k, 34*k, 17*k); c.fillStyle = "#F7F0E8"; c.fill();
      c.beginPath(); c.ellipse((cx0+18)*k, (ry+17)*k, 9*k, 6*k, -.5, 0, 7); c.fillStyle = col; c.fill();
      c.fillStyle = KX.ink; c.textBaseline = "middle"; c.fillText(name, (cx0+34)*k, (ry+18)*k);
      const isS = i === 1, hl = isS ? seg(p, .72, .76) - seg(p, .84, .88) : 0;
      const qv = isS && p >= .74 && p < .9 ? 3 : q;
      rr(c, (sx + sw - 70)*k, (ry+4)*k, 46*k, 26*k, 13*k); c.fillStyle = hl > 0 ? KX.lime : KX.sand; c.fill();
      c.fillStyle = KX.ink; c.font = font(k, 600, 14); c.fillText(String(qv) + " ↕", (sx + sw - 61)*k, (ry+18)*k);
      c.textBaseline = "alphabetic"; c.restore();
    });
    const vb = sy + sh - 150; rr(c, sx*k, vb*k, sw*k, 200*k, 32*k); c.fillStyle = "#fff"; c.fill();
    c.strokeStyle = "rgba(27,24,32,.06)"; c.lineWidth = 2*k; c.stroke();
    rr(c, (fcx-80)*k, (vb+30)*k, 160*k, 52*k, 26*k); c.fillStyle = KX.sand; c.fill();
    c.fillStyle = KX.ink; c.font = font(k, 500, 18); c.textAlign = "center"; c.fillText("Je valide", fcx*k, (vb+62)*k);
    c.font = font(k, 500, 16); c.fillText("Passer  →", fcx*k, (vb+116)*k); c.textAlign = "left";
    c.restore();
  }
  c.restore();
  pill("Appuyer pour scanner", "1", px - 40, py + ph*.3, out(seg(p,.1,.16)) * (1 - seg(p,.4,.45)), true);
  pill("Quantités ajustables", "2", px + pw + 40, py + ph*.55, out(seg(p,.72,.78)) * (1 - seg(p,.88,.92)), false);
}

/* 2. Impact : les grammes deviennent des points */
function points(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = KX.green; c.fillRect(0,0,W,H);
  const ga = Math.min(seg(p, 0, .05), 1 - seg(p, .88, .97)); if(ga <= 0) return;
  c.globalAlpha = ga;
  const top = DH*.3;
  c.fillStyle = KX.lime; c.font = font(k, 600, 22); c.letterSpacing = (4*k) + "px"; c.fillText("TU AS ÉCONOMISÉ", 120*k, top*k); c.letterSpacing = "0px";
  const v = Math.round(400 * io(seg(p, .06, .34)));
  c.fillStyle = "#F4F1EA"; c.font = font(k, 700, 128); c.fillText(String(v), 120*k, (top + 140)*k);
  const vw = c.measureText(String(v)).width/k;
  c.font = font(k, 600, 48); c.fillText(" g de CO₂", (120 + vw)*k, (top + 140)*k);
  c.globalAlpha = ga * out(seg(p, .3, .4)); c.fillStyle = "rgba(244,241,234,.7)"; c.font = font(k, 500, 24);
  c.fillText("Soit 0,1 d'un trajet Paris / Rennes", 120*k, (top + 196)*k);
  c.globalAlpha = ga;
  /* flèche */
  const ar = io(seg(p, .38, .47)), ax0 = 880, ax1 = 1010, ay = top + 92;
  if(ar > 0){ c.strokeStyle = KX.lime; c.lineWidth = 4*k; c.lineCap = "round"; c.beginPath(); c.moveTo(ax0*k, ay*k); c.lineTo(lerp(ax0, ax1, ar)*k, ay*k);
    if(ar > .9){ c.moveTo((ax1-18)*k, (ay-16)*k); c.lineTo(ax1*k, ay*k); c.lineTo((ax1-18)*k, (ay+16)*k); } c.stroke(); c.lineCap = "butt"; }
  /* pilule points */
  const pa = back(seg(p, .46, .56));
  if(pa > 0){ c.save(); const bx = 1060, by = top + 44, bw = 380, bh = 96;
    c.translate((bx + bw/2)*k, (by + bh/2)*k); c.scale(pa, pa); c.translate(-(bx + bw/2)*k, -(by + bh/2)*k);
    rr(c, bx*k, by*k, bw*k, bh*k, 48*k); c.fillStyle = KX.lime; c.fill();
    c.beginPath(); c.arc((bx+50)*k, (by+48)*k, 28*k, 0, 7); c.fillStyle = KX.rose; c.fill();
    c.fillStyle = "#fff"; c.font = font(k, 700, 30); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("★", (bx+50)*k, (by+50)*k);
    c.textAlign = "left"; c.fillStyle = KX.ink; c.font = font(k, 700, 42); c.fillText("+400 points", (bx+96)*k, (by+50)*k); c.textBaseline = "alphabetic"; c.restore(); }
  /* total */
  const ta = out(seg(p, .56, .62));
  if(ta > 0){ c.globalAlpha = ga * ta; const tot = Math.round(lerp(237, 637, io(seg(p, .58, .76))));
    c.fillStyle = "rgba(244,241,234,.7)"; c.font = font(k, 500, 22); c.fillText("Ton total", 1060*k, (top + 196)*k);
    c.save(); const bx = 1200, by = top + 168; c.font = font(k, 700, 30); const tw = c.measureText(String(tot)).width/k;
    rr(c, bx*k, by*k, (tw + 84)*k, 50*k, 25*k); c.fillStyle = KX.ink; c.fill();
    c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(String(tot), (bx+20)*k, (by+26)*k); leafIcon(c, (bx + tw + 52)*k, (by+25)*k, 22*k, "#fff"); c.restore(); }
  c.globalAlpha = 1;
}

/* 3. Démarche : six étapes qui s'allument */
const STEPS = [["Brainstorm","Cadrer le sujet et les envies.",KX.ink,KX.lime],["Benchmark","Analyser les apps anti-gaspi.","#E3D9CC",KX.ink],["Wireframes","Structurer le parcours.","#CFDDE6",KX.ink],
  ["Moodboard","Trouver le ton visuel.",KX.peach,KX.ink],["Design system","Atomes, molécules, organismes.","#FFC5DE",KX.ink],["Maquettes","L'UI finale, écran par écran.",KX.lime,KX.ink]];
function demarche(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = KX.linen; c.fillRect(0,0,W,H);
  const ga = Math.min(seg(p, 0, .04), 1 - seg(p, .88, .97)); if(ga <= 0) return;
  c.globalAlpha = ga;
  const x0 = 110, step = 236, cy = DH*.38;
  STEPS.forEach(([t, d, bg, fg], i) => {
    const x = x0 + i*step, s = back(seg(p, .04 + i*.09, .12 + i*.09));
    const ln = io(seg(p, .1 + i*.09, .17 + i*.09));
    if(ln > 0){ c.strokeStyle = KX.line; c.lineWidth = 3*k; c.beginPath(); c.moveTo((x+40)*k, cy*k); c.lineTo((x + 40 + (step - 50)*ln)*k, cy*k); c.stroke(); }
    if(s > 0){ c.save(); c.translate((x+34)*k, cy*k); c.scale(s, s);
      c.beginPath(); c.arc(0, 0, 34*k, 0, 7); c.fillStyle = bg; c.fill();
      c.fillStyle = fg; c.font = font(k, 600, 22); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("0" + (i+1), 0, 2*k); c.restore(); }
    const ta = out(seg(p, .08 + i*.09, .18 + i*.09));
    c.save(); c.beginPath(); c.rect(x*k, (cy + 62)*k, (step - 4)*k, 60*k); c.clip();
    c.fillStyle = KX.ink; c.font = font(k, 700, 28); c.fillText(t, x*k, (cy + 106 + (1-ta)*50)*k); c.restore();
    c.globalAlpha = ga * out(seg(p, .14 + i*.09, .24 + i*.09));
    c.fillStyle = KX.grey; c.font = `500 ${21*k}px "Inter Tight", system-ui, sans-serif`;
    const words = d.split(" "); let line = "", ly = cy + 156;
    words.forEach(w => { const tt = line ? line + " " + w : w; if(c.measureText(tt).width/k > step - 40 && line){ c.fillText(line, x*k, ly*k); ly += 30; line = w; } else line = tt; });
    c.fillText(line, x*k, ly*k); c.globalAlpha = ga;
  });
  c.globalAlpha = 1;
}

/* 4. Motifs : les sept motifs alimentaires défilent sans fin */
function motifs(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = KX.ink; c.fillRect(0,0,W,H);
  /* une seule ligne de motifs qui défile vers la gauche */
  const n = 7, pad = 36, ts = DH - 2*pad, gap = 24, per = n*(ts + gap), off = -per*p;
  for(let i = 0; i < 2*n + 1; i++){
    const x = off + i*(ts + gap); if(x > 1600 || x + ts < 0) continue;
    const img = A["k_pat" + (i % n)];
    c.save(); rr(c, x*k, pad*k, ts*k, ts*k, 26*k); c.clip();
    if(img && img.width) c.drawImage(img, x*k, pad*k, ts*k, ts*k); else { c.fillStyle = KX.peach; c.fillRect(x*k, pad*k, ts*k, ts*k); }
    c.restore();
  }
}

/* 5. Profil : les courbes se tracent, la jauge se remplit */
const REAL = [380,300,250,260,300,330,300,240,220,200,175,150], SAVED = [120,170,220,250,230,210,230,260,250,230,180,160];
function profil(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = KX.pink; c.fillRect(0,0,W,H);
  const ga = Math.min(seg(p, 0, .04), 1 - seg(p, .88, .97)); if(ga <= 0) return;
  c.globalAlpha = ga;
  const cx = 110, cy = 100, cw = 900, ch = DH - 200;
  rr(c, cx*k, cy*k, cw*k, ch*k, 30*k); c.fillStyle = "#FFFDFB"; c.fill();
  c.fillStyle = KX.ink; c.font = font(k, 600, 26); c.fillText("Émissions de CO₂", (cx+48)*k, (cy+64)*k);
  const gx = cx + 60, gy = cy + 110, gw = cw - 110, gh = ch - 220;
  c.strokeStyle = "#EEE8E2"; c.lineWidth = 1.5*k; for(let i = 0; i <= 4; i++){ c.beginPath(); c.moveTo(gx*k, (gy + gh*i/4)*k); c.lineTo((gx+gw)*k, (gy + gh*i/4)*k); c.stroke(); }
  const draw = io(seg(p, .05, .45));
  const curve = (data, col) => { c.save(); c.beginPath(); c.rect(gx*k, (gy-20)*k, gw*draw*k, (gh+40)*k); c.clip();
    c.strokeStyle = col; c.lineWidth = 5*k; c.lineJoin = "round"; c.beginPath();
    const pts = data.map((v, i) => [gx + gw*i/(data.length-1), gy + gh*(1 - v/420)]);
    c.moveTo(pts[0][0]*k, pts[0][1]*k);
    for(let i = 1; i < pts.length; i++){ const [x0,y0] = pts[i-1], [x1,y1] = pts[i], mx = (x0+x1)/2; c.bezierCurveTo(mx*k, y0*k, mx*k, y1*k, x1*k, y1*k); }
    c.stroke(); c.restore(); };
  curve(REAL, "#C3C70A"); curve(SAVED, KX.leaf);
  c.font = font(k, 500, 20);
  [["Consommation réelle","#C3C70A"],["Consommation évitée",KX.leaf]].forEach(([t, col], i) => { const lx = gx + i*330, ly = cy + ch - 56;
    c.beginPath(); c.arc((lx+8)*k, (ly-6)*k, 8*k, 0, 7); c.fillStyle = col; c.fill(); c.fillStyle = KX.ink; c.fillText(t, (lx+26)*k, ly*k); });
  /* jauge */
  const ox = 1290, oy = DH*.52, R = 190, a0 = Math.PI*.8, a1 = Math.PI*2.2, fill = io(seg(p, .35, .65));
  c.lineCap = "round"; c.lineWidth = 34*k;
  c.strokeStyle = "rgba(1,61,42,.12)"; c.beginPath(); c.arc(ox*k, oy*k, R*k, a0, a1); c.stroke();
  if(fill > 0){ c.strokeStyle = KX.leaf; c.beginPath(); c.arc(ox*k, oy*k, R*k, a0, lerp(a0, a0 + (a1-a0)*.72, fill)); c.stroke(); }
  c.lineCap = "butt";
  /* deux feuilles */
  const ls = 1 + .06*Math.sin(p*Math.PI*4);
  c.save(); c.translate(ox*k, (oy-10)*k); c.scale(ls, ls);
  [[-1,"#34D58A"],[1,"#0E9F5C"]].forEach(([d, col]) => { c.beginPath(); c.moveTo(0, 30*k); c.quadraticCurveTo(d*80*k, 10*k, d*70*k, -60*k); c.quadraticCurveTo(d*10*k, -40*k, 0, 30*k); c.fillStyle = col; c.fill(); });
  c.restore();
  const val = Math.round(237 * fill); c.font = font(k, 700, 30); const tw = c.measureText(String(val)).width/k;
  const bx = ox - (tw + 74)/2, by = oy + 120; rr(c, bx*k, by*k, (tw + 74)*k, 52*k, 26*k); c.fillStyle = KX.ink; c.fill();
  c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(String(val), (bx+20)*k, (by+27)*k); leafIcon(c, (bx + tw + 44)*k, (by+26)*k, 22*k, "#fff"); c.textBaseline = "alphabetic";
  c.globalAlpha = 1;
}

const LOOPS = {
  k_scan: { draw:scan, ratio:16/9, dur:8000, still:.62, label:"Scanner : le bouton lance le scan du frigo, puis la liste des ingrédients apparaît avec des quantités ajustables" },
  k_points: { draw:points, ratio:21/9, dur:6000, still:.8, label:"Impact : 400 g de CO₂ évités deviennent +400 points, le total passe de 237 à 637" },
  k_demarche: { draw:demarche, ratio:21/9, dur:6500, still:.8, label:"Démarche en six étapes : brainstorm, benchmark, wireframes, moodboard, design system, maquettes" },
  k_motifs: { draw:motifs, ratio:4, dur:14000, still:.1, label:"Les sept motifs alimentaires du design system : citron, poisson, viande, saucisse, cœur, salade, boisson" },
  k_profil: { draw:profil, ratio:2, dur:6500, still:.8, label:"Profil : les courbes de consommation réelle et évitée se tracent, la jauge de points se remplit" }
};
if(typeof window !== "undefined") window.KX_LOOPS = LOOPS;
})();

/* Boucles animées LACES — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
(function(){
const LC = { tea:"#CFF59D", teaSoft:"#EDFBD3", blush:"#F96995", raisin:"#2F2B3B", ink:"#1B1A22", paper:"#FBFAF8", linen:"#F4F1EC", sage:"#9DB86E", mute:"#7A7486", line:"#E4DFD8", red:"#E5564A" };
const F = '"Outfit", "Inter Tight", system-ui, sans-serif';
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const seg = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,t) => a + (b-a)*t;
const io = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const out = t => 1-Math.pow(1-t,3);
const back = t => { if(t<=0) return 0; const c1 = 1.7, c3 = c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
function rr(c,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
const font = (k, w, s) => `${w} ${s*k}px ${F}`;
function img(c, im, x, y, w, h){ if(im && im.width){ const s = Math.min(w/im.width, h/im.height), iw = im.width*s, ih = im.height*s; c.drawImage(im, x + (w-iw)/2, y + (h-ih)/2, iw, ih); } }

/* 1. Troc : deux paires changent de main */
function troc(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.paper; c.fillRect(0,0,W,H);
  const cw = 440, ch = 470, y = (DH - ch)/2 - 10, xL = 170, xR = 1600 - 170 - cw;
  const users = [["Jean B.", "4,2", LC.blush], ["Laurent H.", "4,7", LC.sage]];
  /* phase d'échange */
  const sw = io(seg(p, .34, .56)), back2 = io(seg(p, .78, .97));
  const t = sw - back2; /* 0 → 1 → 0 */
  const arc = Math.sin(Math.PI * sw) * (1 - back2) + Math.sin(Math.PI * back2) * (back2 > 0 ? 1 : 0);
  [0,1].forEach(i => {
    const x = i ? xR : xL;
    rr(c, x*k, y*k, cw*k, ch*k, 36*k); c.fillStyle = LC.linen; c.fill();
    c.beginPath(); c.arc((x+56)*k, (y+58)*k, 26*k, 0, 7); c.fillStyle = users[i][2]; c.fill();
    c.fillStyle = "#fff"; c.font = font(k, 600, 22); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(users[i][0][0], (x+56)*k, (y+59)*k);
    c.textAlign = "left"; c.fillStyle = LC.ink; c.font = font(k, 600, 24); c.fillText(users[i][0], (x+96)*k, (y+48)*k);
    c.fillStyle = "#E3A92B"; c.font = font(k, 500, 18); c.fillText("★ " + users[i][1], (x+96)*k, (y+74)*k);
    rr(c, (x+24)*k, (y+110)*k, (cw-48)*k, 250*k, 22*k); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = LC.tea; c.lineWidth = 2*k; c.stroke();
    c.textBaseline = "alphabetic";
  });
  /* chaussures (bougent) */
  const shoes = [A.l_shoe1, A.l_shoe2], names = [["Nike Air Max Plus", "150 €"], ["Asics GEL-Kayano", "190 €"]];
  [0,1].forEach(i => {
    const from = i ? xR : xL, to = i ? xL : xR;
    const x = lerp(from, to, t), lift = -arc * 120 * (i ? -1 : 1);
    const rot = Math.sin(Math.PI * clamp(t)) * (i ? -.12 : .12);
    c.save(); c.translate((x + cw/2)*k, (y + 235 + lift)*k); c.rotate(rot);
    img(c, shoes[i], -170*k, -100*k, 340*k, 200*k); c.restore();
    const ta = 1 - clamp(Math.min(t*4, (1-t)*4) < 1 ? 1 - Math.min(t*4, (1-t)*4) : 0);
    c.globalAlpha = t < .02 || t > .98 ? 1 : 0;
    const tx = t > .5 ? to : from;
    c.fillStyle = LC.ink; c.font = font(k, 600, 26); c.fillText(names[i][0], (tx+30)*k, (y+404)*k);
    c.fillStyle = LC.mute; c.font = font(k, 500, 22); c.fillText(names[i][1], (tx+30)*k, (y+438)*k);
    c.globalAlpha = 1;
  });
  /* bouton Échanger au centre */
  const bp = back(seg(p, .14, .24)) * (1 - seg(p, .6, .66));
  const press = seg(p, .27, .31) - seg(p, .31, .35);
  if(bp > 0){ const bx = 800, by = DH/2; c.save(); c.translate(bx*k, by*k); c.scale(bp*(1 - .08*press), bp*(1 - .08*press));
    rr(c, -110*k, -36*k, 220*k, 72*k, 36*k); c.fillStyle = LC.tea; c.fill();
    c.fillStyle = LC.ink; c.font = font(k, 600, 26); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("⇄  Échanger", 0, 2*k); c.restore(); c.textAlign = "left"; c.textBaseline = "alphabetic"; }
  /* confirmation */
  const ok = back(seg(p, .56, .64)) * (1 - seg(p, .74, .79));
  if(ok > 0){ c.save(); c.translate(800*k, (DH/2)*k); c.scale(ok, ok); c.rotate(-.08);
    const n = 14; c.beginPath(); for(let i = 0; i < n*2; i++){ const r = (i%2 ? 70 : 98)*k, a = i*Math.PI/n; c.lineTo(Math.cos(a)*r*1.25, Math.sin(a)*r); } c.closePath();
    c.fillStyle = LC.sage; c.fill(); c.lineWidth = 7*k; c.strokeStyle = "#fff"; c.stroke();
    c.fillStyle = "#fff"; c.font = font(k, 800, 34); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("TROC !", 0, 2*k); c.restore(); c.textAlign = "left"; c.textBaseline = "alphabetic"; }
}

/* 2. Arborescence : le parcours se dessine */
const NODES = { log:[0,0,"Log page"], onb:[0,1,"Onboarding"], acc:[0,2,"Accueil"], all:[0,3.3,"Tous les articles"], fp:[0,4.5,"Fiche produit"],
  pan:[1.6,2,"Panier"], liv:[1.6,3,"Livraison"], pay:[1.6,4,"Paiement"], val:[1.6,5,"Validation"], msg:[3,2,"Messages"], ven:[4.2,2,"Vendre"], pro:[5.3,2,"Profil"] };
const EDGES = [["log","onb"],["onb","acc"],["acc","all"],["all","fp"],["fp","pan"],["acc","pan"],["pan","liv"],["liv","pay"],["pay","val"],["pan","msg"],["msg","ven"],["ven","pro"]];
const ORDER = ["log","onb","acc","all","fp","pan","liv","pay","val","msg","ven","pro"];
function arbo(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.paper; c.fillRect(0,0,W,H);
  const ga = Math.min(seg(p,0,.04), 1 - seg(p,.88,.97)); if(ga <= 0) return; c.globalAlpha = ga;
  const ox = 220, oy = 80, dx = 236, dy = (DH - 160)/5.2;
  const pos = id => { const [cx, cy] = NODES[id]; return [ox + cx*dx, oy + cy*dy]; };
  const at = id => .05 + ORDER.indexOf(id) * .045;
  c.lineWidth = 3*k; c.strokeStyle = "#C8C2CF";
  EDGES.forEach(([a, b]) => {
    const t = io(seg(p, at(b) - .03, at(b) + .02)); if(t <= 0) return;
    const [x0, y0] = pos(a), [x1, y1] = pos(b);
    c.beginPath(); c.moveTo(x0*k, y0*k);
    if(Math.abs(y0 - y1) < 1 || Math.abs(x0 - x1) < 1) c.lineTo(lerp(x0, x1, t)*k, lerp(y0, y1, t)*k);
    else { const mx = x0 + 110; if(t < .5){ c.lineTo(lerp(x0, mx, t*2)*k, y0*k); } else { c.lineTo(mx*k, y0*k); c.lineTo(mx*k, lerp(y0, y1, (t-.5)*2)*k); } }
    c.stroke();
  });
  ORDER.forEach(id => {
    const s = back(seg(p, at(id), at(id) + .07)); if(s <= 0) return;
    const [x, y] = pos(id), label = NODES[id][2];
    c.font = font(k, 600, 22); const w = c.measureText(label).width/k + 44;
    c.save(); c.translate(x*k, y*k); c.scale(s, s);
    rr(c, -w/2*k, -26*k, w*k, 52*k, 26*k); c.fillStyle = id === "acc" ? LC.ink : LC.blush; c.fill();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, 0, 2*k); c.restore();
  });
  c.textAlign = "left"; c.textBaseline = "alphabetic"; c.globalAlpha = 1;
}

/* 3. Éléments décoratifs : les stickers se collent */
function sticker(c, k, kind, s){
  c.lineJoin = "round";
  if(kind === "dollar"){ c.font = font(k, 800, 230*s); c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 26*k*s; c.strokeStyle = "#fff"; c.strokeText("$", 0, 0); c.fillStyle = LC.raisin; c.fillText("$", 8*k*s, 8*k*s); c.fillStyle = LC.blush; c.fillText("$", 0, 0); }
  else if(kind === "like"){ const r = 92*k*s; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = "#fff"; c.fill(); c.beginPath(); c.arc(0, 0, r - 8*k*s, 0, 7); c.fillStyle = LC.tea; c.fill();
    c.fillStyle = LC.raisin; c.font = font(k, 600, 19*s); c.textAlign = "center"; c.textBaseline = "middle";
    const txt = "LIKE · LIKE · LIKE · LIKE · ", step = 2*Math.PI/27; [...txt].forEach((ch, i) => { c.save(); c.rotate(-Math.PI*1.05 + i*step); c.fillText(ch, 0, -(r - 26*k*s)); c.restore(); });
    c.save(); c.scale(s, s); c.strokeStyle = LC.raisin; c.lineWidth = 4*k; c.beginPath(); c.moveTo(0, 26*k); c.bezierCurveTo(-46*k, -6*k, -24*k, -38*k, 0, -16*k); c.bezierCurveTo(24*k, -38*k, 46*k, -6*k, 0, 26*k); c.stroke(); c.restore();
    c.beginPath(); c.moveTo(r*.25, r*.97); c.quadraticCurveTo(r*.8, r*.7, r*.97, r*.25); c.lineTo(r*.62, r*.62); c.closePath(); c.fillStyle = "#F1EFEA"; c.fill(); }
  else if(kind === "omg"){ const n = 16; c.beginPath(); for(let i = 0; i < n*2; i++){ const rr2 = (i%2 ? 66 : 100)*k*s, a = i*Math.PI/n; c.lineTo(Math.cos(a)*rr2*1.35, Math.sin(a)*rr2); } c.closePath();
    c.fillStyle = LC.sage; c.fill(); c.lineWidth = 10*k*s; c.strokeStyle = "#fff"; c.stroke();
    c.beginPath(); for(let i = 0; i < n*2; i++){ const rr2 = (i%2 ? 46 : 70)*k*s, a = i*Math.PI/n + .1; c.lineTo(Math.cos(a)*rr2*1.35, Math.sin(a)*rr2); } c.closePath(); c.fillStyle = LC.tea; c.fill();
    c.font = font(k, 800, 52*s); c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 8*k*s; c.strokeStyle = LC.raisin; c.strokeText("OMG!", 0, 4*k*s); c.fillStyle = "#fff"; c.fillText("OMG!", 0, 4*k*s); }
  else if(kind === "spark"){ const star = (x, y, r) => { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r*.8, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r*.8, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); };
    c.fillStyle = LC.sage; star(-20*k*s, -20*k*s, 80*k*s); star(46*k*s, 50*k*s, 46*k*s); }
  c.textAlign = "left"; c.textBaseline = "alphabetic";
}
const STK = [["dollar", 250, -.12, .05], ["like", 620, .15, .13], ["omg", 1010, -.08, .21], ["spark", 1370, 0, .29]];
function deco(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.linen; c.fillRect(0,0,W,H);
  STK.forEach(([kind, x, rot, d], i) => {
    const pop = back(seg(p, d, d + .12)), gone = io(seg(p, .82 + i*.03, .9 + i*.03));
    const s = pop * (1 - gone); if(s <= .001) return;
    const wob = Math.sin((p - d) * Math.PI * 6) * .04 * (1 - seg(p, d + .1, d + .35)) + Math.sin(p * Math.PI * 4 + i) * .015;
    const fl = kind === "like" ? 1 : 1;
    c.save(); c.translate(x*k, (DH/2 + Math.sin(p*Math.PI*2 + i*1.3)*8)*k); c.rotate(rot + wob); c.scale(s*fl*1.3, s*1.3);
    c.shadowColor = "rgba(47,43,59,.14)"; c.shadowBlur = 24*k; c.shadowOffsetY = 10*k;
    sticker(c, k, kind, 1); c.restore();
  });
}

/* 4. Bandeaux défilants : POUR VOUS · NIKE · PROFIL */
const BANDS = [["POUR VOUS", LC.paper, LC.ink, -14, 1], ["NIKE", LC.tea, LC.ink, 6, -1], ["PROFIL", LC.raisin, LC.paper, -4, 1], ["DESIGN SYSTEM", LC.blush, "#fff", 12, -1]];
function bands(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.linen; c.fillRect(0,0,W,H);
  BANDS.forEach(([word, bg, fg, deg, dir], i) => {
    c.save(); c.translate(800*k, (DH*(.22 + i*.19))*k); c.rotate(deg*Math.PI/180);
    const bh = 84; c.fillStyle = bg; c.fillRect(-1200*k, -bh/2*k, 2400*k, bh*k);
    c.strokeStyle = fg; c.globalAlpha = .9; c.lineWidth = 2*k; c.beginPath(); c.moveTo(-1200*k, (-bh/2+8)*k); c.lineTo(1200*k, (-bh/2+8)*k); c.moveTo(-1200*k, (bh/2-8)*k); c.lineTo(1200*k, (bh/2-8)*k); c.stroke(); c.globalAlpha = 1;
    c.font = font(k, 600, 40); c.fillStyle = fg; c.textBaseline = "middle";
    const unit = c.measureText(word + "  •  ").width/k;
    const per = unit, off = dir * per * p * 2;
    for(let x = -1300 + ((off % per) + per) % per - per; x < 1300; x += per) c.fillText(word + "  •  ", x*k, 2*k);
    c.restore();
  });
  c.textBaseline = "alphabetic";
}

/* 5. Bouton : les états du design system */
const STATES = [["Default", LC.tea, LC.ink, 0], ["Hover", "#BFE884", LC.ink, 0], ["Click", "#A9CC74", LC.ink, 1], ["Focus", LC.tea, LC.ink, 0], ["Disabled", "#E6E4EA", "#A7A3B0", 0]];
function button(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.paper; c.fillRect(0,0,W,H);
  const n = STATES.length, f = p*n, idx = Math.floor(f), t = f - idx, nx = (idx + 1) % n;
  const mix = io(seg(t, .8, 1));
  const S0 = STATES[idx], S1 = STATES[nx];
  /* liste des états à gauche */
  STATES.forEach(([name], i) => {
    const on = i === idx ? 1 - mix : i === nx ? mix : 0;
    c.font = font(k, 500, 26); c.fillStyle = on > .5 ? LC.ink : "#B9B4C2"; c.fillText(name, 180*k, (DH/2 - 150 + i*72)*k);
    if(on > 0){ c.fillStyle = LC.blush; c.globalAlpha = on; c.beginPath(); c.arc(150*k, (DH/2 - 159 + i*72)*k, 7*k, 0, 7); c.fill(); c.globalAlpha = 1; }
  });
  /* gros bouton */
  const bx = 980, by = DH/2, bw = 560, bh = 140;
  const lerpCol = (a, b, t) => { const pa = [1,3,5].map(i => parseInt(a.slice(i, i+2), 16)), pb = [1,3,5].map(i => parseInt(b.slice(i, i+2), 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(",")})`; };
  const press = (S0[3] ? 1 - mix : 0) * (Math.sin(Math.PI * seg(t, .1, .5)));
  const sc = 1 - .05*press;
  c.save(); c.translate(bx*k, by*k); c.scale(sc, sc);
  if((idx === 3 && mix < 1) || (nx === 3 && mix > 0)){ const fa = idx === 3 ? 1 - mix : mix; c.globalAlpha = fa; rr(c, (-bw/2 - 14)*k, (-bh/2 - 14)*k, (bw + 28)*k, (bh + 28)*k, (bh/2 + 14)*k); c.strokeStyle = LC.blush; c.lineWidth = 4*k; c.setLineDash([12*k, 8*k]); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; }
  rr(c, -bw/2*k, -bh/2*k, bw*k, bh*k, bh/2*k); c.fillStyle = lerpCol(S0[1], S1[1], mix); c.fill();
  c.fillStyle = lerpCol(S0[2], S1[2], mix); c.font = font(k, 600, 44); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Échanger  ⇄", 0, 3*k);
  c.restore(); c.textAlign = "left"; c.textBaseline = "alphabetic";
  /* curseur */
  const hov = idx === 1 || idx === 2 ? 1 - (idx === 2 ? mix : 0) : idx === 0 ? mix : 0;
  const cx = lerp(bx + 380, bx + 120, io(hov)), cy = lerp(by + 150, by + 20, io(hov));
  if(idx !== 4 && !(idx === 3 && mix > .5)){ const s = k*1.6, px = cx*k, py = cy*k;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + 30*s); c.lineTo(px + 8*s, py + 23*s); c.lineTo(px + 14*s, py + 36*s); c.lineTo(px + 19*s, py + 34*s); c.lineTo(px + 13*s, py + 21*s); c.lineTo(px + 23*s, py + 21*s); c.closePath();
    c.fillStyle = "#fff"; c.fill(); c.strokeStyle = LC.ink; c.lineWidth = 1.8*k; c.stroke(); }
  c.fillStyle = LC.mute; c.font = font(k, 500, 22); c.textAlign = "center"; c.fillText("Molécules → Boutons", bx*k, (by + 190)*k); c.textAlign = "left";
}

const GLYPHS = {"A":{"adv":715,"segs":[["M",20,0],["L",303,703],["L",414,703],["L",696,0],["L",551,0],["L",502,131],["L",212,131],["L",162,0],["Z"],["M",458,245],["L",358,511],["L",256,245],["Z"]],"len":3254},"g":{"adv":579,"segs":[["M",260,-214],["Q",183,-214,124.0,-186.5],["Q",65,-159,30,-109],["L",113,-26],["Q",141,-59,175.5,-76.5],["Q",210,-94,259,-94],["Q",320,-94,355.5,-63.0],["Q",391,-32,391,23],["L",391,63],["Q",373,45,349,34],["Q",307,13,254,13],["Q",189,13,137.0,44.5],["Q",85,76,55.5,131.0],["Q",26,186,26.0,254.0],["Q",26,322,55.5,376.0],["Q",85,430,137.0,461.5],["Q",189,493,254,493],["Q",308,493,350,472],["Q",374,460,392,442],["L",392,483],["L",522,483],["L",522,25],["Q",522,-47,488.5,-100.5],["Q",455,-154,396.0,-184.0],["Q",337,-214,260,-214],["Z"],["M",280,132],["Q",316,132,342.5,147.5],["Q",369,163,384.0,190.5],["Q",399,218,399,253],["Q",399,289,384.0,316.0],["Q",369,343,342.5,358.5],["Q",316,374,280.0,374.0],["Q",244,374,217.0,358.5],["Q",190,343,175.0,315.5],["Q",160,288,160,253],["Q",160,219,175.0,191.5],["Q",190,164,217.0,148.0],["Q",244,132,280,132],["Z"]],"len":3619}};

/* 6. Couleurs : trois grandes pastilles qui montent, puis chacune prend la place pour dire son rôle */
const SW = [["TeaGreen", "#CFF59D", LC.ink, "Actions et boutons", "RVB 207 · 245 · 157"], ["Blush", "#F96995", "#fff", "Accents et stickers", "RVB 249 · 105 · 149"], ["RaisinBlack", "#2F2B3B", "#fff", "Texte et navigation", "RVB 47 · 43 · 59"]];
function colors(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.linen; c.fillRect(0,0,W,H);
  const pad = 60, gap = 24, total = 1600 - 2*pad - 2*gap, top = 56, bh = DH - 2*top;
  /* chaque couleur s'élargit à son tour */
  const focus = [0,1,2].map(i => Math.sin(Math.PI * seg(p, .2 + i*.22, .42 + i*.22)) );
  const fw = focus.map(f => 1 + 1.3*io(Math.min(1, f*1.6)));
  const sum = fw.reduce((a,b)=>a+b, 0);
  let x = pad;
  SW.forEach(([name, hex, fg, role, rgb], i) => {
    const w = total * fw[i] / sum;
    const rise = back(seg(p, .02 + i*.05, .14 + i*.05)), gone = io(seg(p, .9 + i*.02, .98));
    const y = top + (1 - rise) * (bh + 80) + gone * (bh + 80);
    c.save(); c.shadowColor = "rgba(47,43,59,.12)"; c.shadowBlur = 30*k; c.shadowOffsetY = 12*k;
    rr(c, x*k, y*k, w*k, bh*k, 40*k); c.fillStyle = hex; c.fill(); c.restore();
    c.save(); rr(c, x*k, y*k, w*k, bh*k, 40*k); c.clip();
    c.fillStyle = fg; c.textBaseline = "alphabetic";
    c.font = font(k, 600, 46); c.fillText(name, (x + 40)*k, (y + 84)*k);
    c.font = font(k, 500, 26); c.globalAlpha = .75; c.fillText(hex.toUpperCase(), (x + 40)*k, (y + 124)*k); c.globalAlpha = 1;
    const f = io(clamp(focus[i]*1.8));
    if(f > 0){ c.globalAlpha = f;
      c.font = font(k, 600, 30); c.fillText(role, (x + 40)*k, (y + bh - 76 + (1-f)*20)*k);
      c.font = font(k, 500, 22); c.globalAlpha = f*.7; c.fillText(rgb, (x + 40)*k, (y + bh - 40 + (1-f)*20)*k); c.globalAlpha = 1; }
    c.restore();
    x += w + gap;
  });
}

/* 7. Typographie : Outfit en gros plan, contour tracé à la plume avec ses points et poignées de Bézier */
function glyphPath(g, ox, oy, s, k){ const P = new Path2D(); g.segs.forEach(sg => {
  if(sg[0] === "M") P.moveTo((ox + sg[1]*s)*k, (oy - sg[2]*s)*k);
  else if(sg[0] === "L") P.lineTo((ox + sg[1]*s)*k, (oy - sg[2]*s)*k);
  else if(sg[0] === "Q") P.quadraticCurveTo((ox + sg[1]*s)*k, (oy - sg[2]*s)*k, (ox + sg[3]*s)*k, (oy - sg[4]*s)*k);
  else P.closePath(); }); return P; }
function type(c, W, H, p, A){
  const k = W/1600, DH = H/k;
  c.fillStyle = LC.paper; c.fillRect(0,0,W,H);
  const s = .62, base = 92 + 703*s, ox = 190;
  const fadeAll = 1 - io(seg(p, .9, .99));
  /* lignes de métrique */
  const lines = [[703, "Capitale 703"], [483, "Hauteur d'x 483"], [0, "Ligne de base"], [-214, "Jambage −214"]];
  const lf = io(seg(p, 0, .08)) * fadeAll;
  c.globalAlpha = lf; c.lineWidth = 1.5*k; c.strokeStyle = LC.line; c.fillStyle = LC.mute; c.font = font(k, 500, 17);
  lines.forEach(([v, lab]) => { const y = base - v*s; c.beginPath(); c.moveTo(40*k, y*k); c.lineTo(1040*k, y*k); c.stroke(); c.fillText(lab, 44*k, (y - 8)*k); });
  c.globalAlpha = 1;
  /* glyphes */
  let x = ox + 40; const gs = [];
  ["A","g"].forEach(ch => { const g = GLYPHS[ch]; gs.push([g, x]); x += g.adv*s + 10; });
  const draw = io(seg(p, .06, .42)), pts = seg(p, .22, .46), fill = io(seg(p, .5, .64)), dim = io(seg(p, .7, .8));
  gs.forEach(([g, gx], gi) => {
    const P = glyphPath(g, gx, base, s, k);
    if(fill > 0){ c.globalAlpha = fill * fadeAll; c.fillStyle = LC.tea; c.fill(P); c.globalAlpha = 1; }
    const L = g.len * s * k * 1.02, t = clamp(draw*1.15 - gi*.15);
    c.save(); c.globalAlpha = fadeAll; c.setLineDash([L*t, L]); c.lineWidth = 3*k; c.strokeStyle = LC.raisin; c.lineJoin = "round"; c.stroke(P); c.restore();
    /* points et poignées */
    let cur = null, start = null, n = 0; const N = g.segs.length;
    g.segs.forEach((sg, si) => {
      const appear = back(clamp((pts - si/N*.6) / .4)) * fadeAll * (1 - .55*dim); if(appear <= .01){ if(sg[0]==="M") start = cur = [sg[1], sg[2]]; else if(sg[0]==="L") cur = [sg[1], sg[2]]; else if(sg[0]==="Q") cur = [sg[3], sg[4]]; else cur = start; return; }
      const X = v => (gx + v*s)*k, Y = v => (base - v*s)*k;
      const anchor = (ax, ay) => { const r = 7*k*appear; c.fillStyle = "#fff"; c.strokeStyle = LC.raisin; c.lineWidth = 2*k; c.fillRect(X(ax) - r, Y(ay) - r, 2*r, 2*r); c.strokeRect(X(ax) - r, Y(ay) - r, 2*r, 2*r); };
      if(sg[0] === "M"){ start = cur = [sg[1], sg[2]]; anchor(sg[1], sg[2]); }
      else if(sg[0] === "L"){ cur = [sg[1], sg[2]]; anchor(sg[1], sg[2]); }
      else if(sg[0] === "Q"){
        c.globalAlpha = appear > 1 ? 1 : appear; c.strokeStyle = LC.blush; c.lineWidth = 1.6*k; c.beginPath(); c.moveTo(X(cur[0]), Y(cur[1])); c.lineTo(X(sg[1]), Y(sg[2])); c.lineTo(X(sg[3]), Y(sg[4])); c.stroke();
        c.beginPath(); c.arc(X(sg[1]), Y(sg[2]), 5.5*k*appear, 0, 7); c.fillStyle = LC.blush; c.fill(); c.globalAlpha = 1;
        cur = [sg[3], sg[4]]; anchor(sg[3], sg[4]); }
      else cur = start;
    });
  });
  /* spécimen à droite */
  const rx = 1080;
  const item = (i) => { const a = io(seg(p, .14 + i*.05, .3 + i*.05)) * fadeAll; return [a, (1 - a)*24]; };
  c.fillStyle = LC.raisin; c.textBaseline = "alphabetic";
  let [a, dy] = item(0); c.globalAlpha = a; c.font = font(k, 600, 112); c.fillText("Outfit", rx*k, (196 + dy)*k);
  [a, dy] = item(1); c.globalAlpha = a*.7; c.font = font(k, 500, 24); c.fillText("Géométrique, ronde, lisible", rx*k, (242 + dy)*k);
  [a, dy] = item(2); c.globalAlpha = a; [[500, "Medium"], [600, "SemiBold"], [800, "ExtraBold"]].forEach(([w, n], i) => { c.font = font(k, w, 34); c.fillText(n, rx*k, (330 + i*50 + dy)*k); });
  [a, dy] = item(3); c.globalAlpha = a; c.font = font(k, 500, 30); c.fillText("Aa Bb Cc Dd Ee Ff Gg", rx*k, (520 + dy)*k);
  c.globalAlpha = a*.7; c.fillText("0123456789 !?&€", rx*k, (566 + dy)*k);
  c.globalAlpha = 1;
}

const LOOPS = {
  l_troc: { draw:troc, ratio:16/9, dur:6000, still:.05, label:"Troc : deux utilisateurs échangent leurs paires de sneakers" },
  l_arbo: { draw:arbo, ratio:2, dur:6500, still:.82, label:"Arborescence : de la page de connexion au profil, en passant par l'accueil, la fiche produit et le paiement" },
  l_colors: { draw:colors, ratio:21/9, dur:9000, still:.32, label:"Couleurs : TeaGreen pour les actions, Blush pour les accents, RaisinBlack pour le texte" },
  l_type: { draw:type, ratio:21/9, dur:9000, still:.66, label:"Typographie Outfit : le contour de Ag tracé à la plume, avec ses points d'ancrage et ses poignées de Bézier" },
  l_deco: { draw:deco, ratio:21/9, dur:5000, still:.6, label:"Éléments décoratifs : dollar, sticker like, OMG et étincelles" },
  l_bands: { draw:bands, ratio:21/9, dur:8000, still:.2, label:"Bandeaux défilants de l'interface : pour vous, Nike, profil, design system" },
  l_button: { draw:button, ratio:2, dur:7000, still:.05, label:"Design system : le bouton passe par ses états default, hover, click, focus et disabled" }
};
if(typeof window !== "undefined") window.LC_LOOPS = LOOPS;
})();

/* Boucles animées Prisme — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
(function(){
const PX = { bg:"#F6F5FB", card:"#FDFCFF", line:"#E4E2EE", ink:"#14112A", ink2:"#514D69", mute:"#8E8AA6", dark:"#0E0C1F", dark2:"#1C1A36",
  i50:"#F0EEFF", i100:"#E1DDFF", i200:"#C4BDFF", i300:"#A399FF", i400:"#7F72FF", i500:"#5B4CFF", i600:"#4636E6", i700:"#3527B8", i800:"#261C85", i900:"#181255",
  blue:"#2563EB", green:"#15803D", yellow:"#F5B800", red:"#DC2626" };
const F = '"Poppins", "Inter Tight", system-ui, sans-serif', MONO = '"Roboto Mono", ui-monospace, monospace';
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const seg = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,t) => a + (b-a)*t;
const io = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const out = t => 1-Math.pow(1-t,3);
const back = t => { if(t<=0) return 0; const c1 = 1.6, c3 = c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
function rr(c,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
const font = (k, w, s, fam=F) => `${w} ${s*k}px ${fam}`;
const fade = p => Math.min(seg(p,0,.04), 1 - seg(p,.9,.98));

/* 1. Atomic design : un atome devient une page */
function atomic(c, W, H, p){
  const k = W/1600, DH = H/k; c.fillStyle = PX.bg; c.fillRect(0,0,W,H);
  const ga = fade(p); if(ga <= 0) return; c.globalAlpha = ga;
  const labels = ["Atome","Molécule","Organisme","Template","Page"], n = 5, cw = 250, gap = 40, x0 = (1600 - n*cw - (n-1)*gap)/2, y0 = DH*.2, ch = DH*.5;
  labels.forEach((lb, i) => {
    const x = x0 + i*(cw+gap), a = back(seg(p, .05 + i*.12, .15 + i*.12)); if(a <= 0) return;
    c.save(); c.translate((x+cw/2)*k, (y0+ch/2)*k); c.scale(a, a); c.translate(-(x+cw/2)*k, -(y0+ch/2)*k);
    rr(c, x*k, y0*k, cw*k, ch*k, 22*k); c.fillStyle = PX.card; c.fill(); c.strokeStyle = PX.line; c.lineWidth = 1.5*k; c.stroke();
    const ix = x + 20, iy = y0 + 20, iw = cw - 40, ih = ch*.55; rr(c, ix*k, iy*k, iw*k, ih*k, 14*k); c.fillStyle = PX.i50; c.fill();
    const cx = ix + iw/2, cy = iy + ih/2;
    c.fillStyle = PX.i500;
    if(i === 0){ c.beginPath(); c.arc(cx*k, cy*k, 34*k, 0, 7); c.fill(); }
    if(i === 1){ [PX.i500, PX.i400, PX.i700].forEach((col, j) => { c.fillStyle = col; c.beginPath(); c.arc((cx - 70 + j*70)*k, cy*k, 22*k, 0, 7); c.fill(); });
      c.strokeStyle = PX.i300; c.lineWidth = 4*k; c.beginPath(); c.moveTo((cx-44)*k, cy*k); c.lineTo((cx-26)*k, cy*k); c.moveTo((cx+26)*k, cy*k); c.lineTo((cx+44)*k, cy*k); c.stroke(); }
    if(i === 2){ rr(c,(ix+24)*k,(iy+30)*k,(iw*.6)*k,22*k,6*k); c.fill(); c.fillStyle = PX.i200; rr(c,(ix+24)*k,(iy+66)*k,(iw-48)*k,12*k,6*k); c.fill(); rr(c,(ix+24)*k,(iy+88)*k,(iw*.7)*k,12*k,6*k); c.fill(); c.fillStyle = PX.i700; rr(c,(ix+24)*k,(iy+114)*k,(iw*.4)*k,26*k,6*k); c.fill(); }
    if(i === 3){ c.setLineDash([6*k,5*k]); c.strokeStyle = PX.mute; c.lineWidth = 2*k; c.strokeRect((ix+20)*k,(iy+20)*k,(iw-40)*k,22*k); c.strokeRect((ix+20)*k,(iy+52)*k,(iw*.25)*k,(ih-72)*k); c.strokeRect((ix+30+iw*.25)*k,(iy+52)*k,(iw*.75-50)*k,(ih-72)*k); c.setLineDash([]); }
    if(i === 4){ c.fillStyle = PX.i500; rr(c,(ix+20)*k,(iy+20)*k,(iw-40)*k,22*k,6*k); c.fill(); c.fillStyle = PX.i200; c.fillRect((ix+20)*k,(iy+52)*k,(iw*.25)*k,(ih-72)*k);
      const g = c.createLinearGradient((ix+30+iw*.25)*k, 0, (ix+iw-20)*k, 0); g.addColorStop(0, PX.i400); g.addColorStop(1, PX.i800); c.fillStyle = g; c.fillRect((ix+30+iw*.25)*k,(iy+52)*k,(iw*.75-50)*k,(ih-72)*k); }
    c.fillStyle = PX.ink; c.font = font(k, 600, 30); c.fillText(lb, (x+20)*k, (iy + ih + 50)*k);
    c.fillStyle = PX.mute; c.font = font(k, 500, 16, MONO); c.fillText("0" + (i+1), (x+20)*k, (iy + ih + 84)*k);
    c.restore();
    if(i < n-1){ const ar = out(seg(p, .12 + i*.12, .18 + i*.12)); if(ar > 0){ const ax = x + cw + 6, ay = y0 + ch/2;
      c.strokeStyle = PX.i300; c.lineWidth = 4*k; c.lineCap = "round"; c.beginPath(); c.moveTo(ax*k, ay*k); c.lineTo((ax + (gap-12)*ar)*k, ay*k); c.stroke(); c.lineCap = "butt"; } }
  });
  c.globalAlpha = 1;
}

/* 2. Tokens : primitif → sémantique → composant, puis le bouton change */
const ROWS = [["indigo-500","color.action.primary","button.primary.bg",PX.i500],["neutral-900","color.text.default","input.text","#14112A"],["red-600","color.feedback.error","alert.error.border",PX.red]];
function tokens(c, W, H, p){
  const k = W/1600, DH = H/k; c.fillStyle = PX.dark; c.fillRect(0,0,W,H);
  const ga = fade(p); if(ga <= 0) return; c.globalAlpha = ga;
  const cols = [80, 600, 1120], cw = 400, rh = 70;
  ["Primitifs","Sémantiques","Composants"].forEach((t, j) => { c.fillStyle = "#fff"; c.font = font(k, 600, 28); c.fillText(t, cols[j]*k, 90*k); });
  ROWS.forEach((r, i) => {
    const y = 130 + i*(rh + 22);
    for(let j = 0; j < 3; j++){
      const a = out(seg(p, .05 + i*.1 + j*.07, .12 + i*.1 + j*.07)); if(a <= 0) continue;
      c.globalAlpha = ga*a; const x = cols[j] + (1-a)*20;
      rr(c, x*k, y*k, cw*k, rh*k, 12*k); c.fillStyle = PX.dark2; c.fill(); c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1.5*k; c.stroke();
      let tx = x + 24; if(j === 0){ rr(c, (x+22)*k, (y+19)*k, 32*k, 32*k, 8*k); c.fillStyle = r[3]; c.fill(); if(i===1){ c.strokeStyle = "rgba(255,255,255,.4)"; c.stroke(); } tx = x + 70; }
      c.fillStyle = "#EDEBFA"; c.font = font(k, 500, 24, MONO); c.textBaseline = "middle"; c.fillText(r[j], tx*k, (y + rh/2 + 1)*k); c.textBaseline = "alphabetic";
      if(j < 2){ const ar = out(seg(p, .1 + i*.1 + j*.07, .16 + i*.1 + j*.07)); c.strokeStyle = PX.i400; c.lineWidth = 4*k; c.lineCap = "round";
        c.beginPath(); c.moveTo((cols[j] + cw + 22)*k, (y+rh/2)*k); c.lineTo((cols[j] + cw + 22 + 60*ar)*k, (y+rh/2)*k); c.stroke(); c.lineCap = "butt"; }
    }
  });
  c.globalAlpha = ga;
  /* démonstration : on change la primitive, le bouton suit */
  const sw = io(seg(p, .52, .6)) - io(seg(p, .78, .86));
  const base = [0x5B,0x4C,0xFF], alt = [0x0E,0x9F,0x6E], col = `rgb(${base.map((v,i)=>Math.round(lerp(v, alt[i], sw))).join(",")})`;
  const ba = out(seg(p, .4, .48)); if(ba > 0){ c.globalAlpha = ga*ba;
    c.fillStyle = "rgba(237,235,250,.6)"; c.font = font(k, 400, 24); c.fillText("On change une primitive, tout suit :", 80*k, (DH - 92)*k);
    rr(c, 560*k, (DH - 130)*k, 220*k, 64*k, 12*k); c.fillStyle = col; c.fill(); c.fillStyle = "#fff"; c.font = font(k, 600, 24); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Valider", 670*k, (DH - 97)*k); c.textAlign = "left"; c.textBaseline = "alphabetic";
    rr(c, (102)*k, (149)*k, 32*k, 32*k, 8*k); c.fillStyle = col; c.fill(); }
  c.globalAlpha = 1;
}

/* 3. Indigo : dix nuances, la base se distingue */
const SH = [["50","F0EEFF"],["100","E1DDFF"],["200","C4BDFF"],["300","A399FF"],["400","7F72FF"],["500","5B4CFF"],["600","4636E6"],["700","3527B8"],["800","261C85"],["900","181255"]];
function indigo(c, W, H, p){
  const k = W/1600, DH = H/k; c.fillStyle = PX.bg; c.fillRect(0,0,W,H);
  const ga = fade(p); if(ga <= 0) return; c.globalAlpha = ga;
  const x0 = 80, tw = 1440, y0 = DH*.18, h = DH*.62, sw = tw/10;
  c.save(); rr(c, x0*k, y0*k, tw*k, h*k, 26*k); c.clip();
  SH.forEach(([n, hex], i) => {
    const a = io(seg(p, .04 + i*.035, .2 + i*.035)); if(a <= 0) return;
    const hh = h*a, yy = y0 + h - hh, base = i === 5, lift = base ? out(seg(p, .5, .58)) * (1 - seg(p, .8, .86)) : 0;
    c.fillStyle = "#" + hex; c.fillRect((x0 + i*sw)*k, (yy - lift*16)*k, (sw + 1)*k, (hh + lift*16)*k);
    const dark = i < 4; c.fillStyle = dark ? PX.ink : "#fff"; c.globalAlpha = ga*out(seg(p, .2 + i*.035, .3 + i*.035));
    c.font = font(k, 600, 26); c.fillText(n, (x0 + i*sw + 18)*k, (y0 + h - 60)*k);
    c.font = font(k, 500, 18, MONO); c.fillText(hex, (x0 + i*sw + 18)*k, (y0 + h - 26)*k); c.globalAlpha = ga;
  });
  c.restore();
  const b = back(seg(p, .52, .6)) * (1 - seg(p, .8, .86));
  if(b > 0){ const bx = x0 + 5*sw + 18, by = y0 + 20; c.save(); c.translate((bx+46)*k, (by+20)*k); c.scale(b, b);
    rr(c, -46*k, -20*k, 92*k, 40*k, 20*k); c.fillStyle = "#fff"; c.fill(); c.fillStyle = PX.i700; c.font = font(k, 600, 22); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Base", 0, 2*k); c.restore(); c.textAlign = "left"; c.textBaseline = "alphabetic"; }
  c.globalAlpha = 1;
}

/* 4. Hiérarchie typographique : du Display au H6 */
const TY = [["Display — Hero",64,600],["H1 — Titre de page",48,600],["H2 — Titre de section",40,600],["H3 — Sous-section",32,600],["H4 — Titre de carte",24,500],["H5 — Titre de groupe",20,500],["H6 — Petit titre",18,500]];
function type(c, W, H, p){
  const k = W/1600, DH = H/k; c.fillStyle = PX.i500; c.fillRect(0,0,W,H);
  const ga = fade(p); if(ga <= 0) return; c.globalAlpha = ga;
  /* grand Aa */
  rr(c, 80*k, 70*k, 460*k, (DH - 140)*k, 28*k); c.fillStyle = "#5040E8"; c.fill();
  const ws = [400, 500, 600, 700], wi = Math.floor(p*4) % 4;
  c.fillStyle = "#fff"; c.font = font(k, ws[wi], 230); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Aa", 310*k, (DH/2 + 6)*k);
  c.font = font(k, 500, 20, MONO); c.fillStyle = "rgba(255,255,255,.75)"; c.fillText("Poppins " + ws[wi], 310*k, (DH - 110)*k); c.textAlign = "left"; c.textBaseline = "alphabetic";
  let y = 90; TY.forEach(([t, s, w], i) => {
    const a = out(seg(p, .05 + i*.06, .15 + i*.06)); const sz = s*1.05; y += sz*1.12;
    c.save(); c.beginPath(); c.rect(620*k, (y - sz*1.1)*k, 940*k, (sz*1.35)*k); c.clip();
    c.fillStyle = "#fff"; c.font = font(k, w, sz); c.fillText(t, 620*k, (y + (1-a)*sz*1.3)*k);
    c.fillStyle = "rgba(255,255,255,.6)"; c.font = font(k, 500, 17, MONO); c.textAlign = "right"; c.fillText(`${s} / ${w}`, 1540*k, (y + (1-a)*sz*1.3)*k); c.textAlign = "left";
    c.restore(); y += 14;
  });
  c.globalAlpha = 1;
}

/* 5. Contrastes : les ratios se mesurent */
const CT = [["#5B4CFF","#fff",5.35,"Blanc / Indigo 500","AA"],["#fff",PX.i600,7.17,"Indigo 600 / Blanc","AAA"],["#fff","#14112A",18.37,"Neutral 900 / Blanc","AAA"],
  [PX.blue,"#fff",5.17,"Blanc / Info","AA"],[PX.green,"#fff",5.02,"Blanc / Succès","AA"],[PX.red,"#fff",4.83,"Blanc / Erreur","AA"]];
function contrast(c, W, H, p){
  const k = W/1600, DH = H/k; c.fillStyle = PX.dark; c.fillRect(0,0,W,H);
  const ga = fade(p); if(ga <= 0) return; c.globalAlpha = ga;
  const cw = 460, chh = (DH - 200)/2, gx = (1600 - 3*cw - 2*30)/2;
  CT.forEach(([bg, fg, ratio, label, lvl], i) => {
    const x = gx + (i%3)*(cw + 30), y = 70 + Math.floor(i/3)*(chh + 30), d = .04 + i*.06;
    const a = out(seg(p, d, d + .1)); if(a <= 0) return; c.globalAlpha = ga*a;
    rr(c, x*k, (y + (1-a)*16)*k, cw*k, chh*k, 18*k); c.fillStyle = PX.dark2; c.fill();
    const sq = 92, sy = y + (chh - sq)/2; rr(c, (x+26)*k, sy*k, sq*k, sq*k, 12*k); c.fillStyle = bg; c.fill();
    c.fillStyle = fg; c.font = font(k, 600, 40); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Aa", (x+26+sq/2)*k, (sy + sq/2 + 2)*k); c.textAlign = "left";
    const v = ratio * io(seg(p, d + .04, d + .28));
    c.fillStyle = "#fff"; c.font = font(k, 600, 44); c.fillText(v.toFixed(2).replace(".", ",") + ":1", (x + 144)*k, (sy + 30)*k);
    c.fillStyle = "rgba(237,235,250,.6)"; c.font = font(k, 400, 21); c.fillText(label, (x + 144)*k, (sy + 72)*k);
    const bp = back(seg(p, d + .26, d + .34)); if(bp > 0){ c.save(); c.translate((x + cw - 56)*k, (sy + 30)*k); c.scale(bp, bp);
      rr(c, -40*k, -20*k, 80*k, 40*k, 20*k); c.fillStyle = PX.i700; c.fill(); c.fillStyle = "#fff"; c.font = font(k, 600, 20); c.textAlign = "center"; c.fillText(lvl, 0, 2*k); c.restore(); c.textAlign = "left"; }
    c.textBaseline = "alphabetic";
  });
  c.globalAlpha = 1;
}

const LOOPS = {
  p_atomic: { draw:atomic, ratio:2, dur:7000, still:.8, label:"Atomic Design : atome, molécule, organisme, template et page apparaissent l'un après l'autre" },
  p_tokens: { draw:tokens, ratio:2, dur:7500, still:.45, label:"Tokens en trois couches : primitifs, sémantiques, composants ; changer une primitive change le bouton" },
  p_indigo: { draw:indigo, ratio:21/9, dur:6000, still:.6, label:"Palette indigo : dix nuances de 50 à 900, la 500 est la couleur de base" },
  p_type: { draw:type, ratio:2, dur:6000, still:.7, label:"Typographie Poppins : la hiérarchie du Display au H6, et les quatre graisses" },
  p_contrast: { draw:contrast, ratio:2, dur:6500, still:.7, label:"Contrastes mesurés : six paires de couleurs avec leur ratio et leur niveau WCAG" }
};
if(typeof window !== "undefined") window.PR_LOOPS = LOOPS;
})();

/* Mockups animés : l'app qui tourne dans un téléphone. draw(ctx, W, H, p, A). */
(function(){
const clamp = (x,a=0,b=1) => Math.min(b, Math.max(a, x));
const seg = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,t) => a + (b-a)*t;
const io = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const out = t => 1-Math.pow(1-t,3);
function rr(c,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
const ok = im => im && im.width;
function contain(c, im, x, y, w, h){ if(!ok(im)) return; const s = Math.min(w/im.width, h/im.height); c.drawImage(im, x + (w - im.width*s)/2, y + (h - im.height*s)/2, im.width*s, im.height*s); }

/* icônes génériques du dock (aucune marque) */
function glyph(c, k, kind, x, y, s){
  c.save(); c.translate(x, y); c.strokeStyle = "#fff"; c.fillStyle = "#fff"; c.lineWidth = s*.07; c.lineCap = c.lineJoin = "round";
  if(kind === "chat"){ rr(c, -s*.3, -s*.24, s*.6, s*.42, s*.12); c.stroke(); c.beginPath(); c.moveTo(-s*.12, s*.18); c.lineTo(-s*.2, s*.3); c.lineTo(0, s*.18); c.stroke(); }
  if(kind === "photo"){ rr(c, -s*.3, -s*.22, s*.6, s*.44, s*.08); c.stroke(); c.beginPath(); c.arc(0, 0, s*.12, 0, 7); c.stroke(); }
  if(kind === "pin"){ c.beginPath(); c.arc(0, -s*.06, s*.2, Math.PI*.85, Math.PI*2.15); c.lineTo(0, s*.3); c.closePath(); c.stroke(); c.beginPath(); c.arc(0, -s*.06, s*.07, 0, 7); c.fill(); }
  if(kind === "music"){ c.beginPath(); c.moveTo(-s*.08, s*.2); c.lineTo(-s*.08, -s*.26); c.lineTo(s*.22, -s*.32); c.lineTo(s*.22, s*.14); c.stroke(); c.beginPath(); c.arc(-s*.16, s*.2, s*.09, 0, 7); c.arc(s*.14, s*.14, s*.09, 0, 7); c.fill(); }
  c.restore();
}

function phone(c, k, x, y, w, h, screens, p, cfg, A){
  /* cadre */
  c.save(); c.shadowColor = "rgba(20,20,30,.22)"; c.shadowBlur = 50*k; c.shadowOffsetY = 24*k;
  rr(c, x*k, y*k, w*k, h*k, 62*k); c.fillStyle = "#1B1B1F"; c.fill(); c.restore();
  rr(c, (x+3)*k, (y+3)*k, (w-6)*k, (h-6)*k, 59*k); c.strokeStyle = "#5A5A60"; c.lineWidth = 2*k; c.stroke();
  const sx = x + 14, sy = y + 14, sw = w - 28, sh = h - 28;
  c.save(); rr(c, sx*k, sy*k, sw*k, sh*k, 48*k); c.clip();
  c.fillStyle = cfg.screenBg; c.fillRect(sx*k, sy*k, sw*k, sh*k);
  const bar = 54, vy = sy + bar, vh = sh - bar;
  /* écrans : chacun a sa fenêtre de temps, glisse vers la gauche pour laisser place au suivant */
  const n = screens.length, start = .1, slot = (1 - start - .06) / n;
  const launch = out(seg(p, .04, .12));
  screens.forEach((key, i) => {
    const im = A[key]; if(!ok(im)) return;
    const t0 = start + i*slot, enter = i === 0 ? launch : io(seg(p, t0 - .05, t0)), leave = i === n-1 ? io(seg(p, .94, 1)) : io(seg(p, t0 + slot - .05, t0 + slot));
    if(enter <= 0 || leave >= 1) return;
    const dx = i === 0 ? 0 : (1 - enter) * sw, dxl = -leave * sw * .35;
    const s = sw / im.width, ih = im.height * s, scroll = Math.max(0, ih - vh) * io(seg(p, t0 + slot*.15, t0 + slot*.8));
    c.save(); c.beginPath(); c.rect(sx*k, vy*k, sw*k, vh*k); c.clip();
    const sc = i === 0 ? lerp(.86, 1, launch) : 1, a = i === 0 ? launch : 1;
    c.globalAlpha = a * (1 - leave*.5);
    c.translate((sx + sw/2 + dx + dxl)*k, (vy + vh/2)*k); c.scale(sc, sc); c.translate(-(sx + sw/2)*k, -(vy + vh/2)*k);
    c.fillStyle = cfg.screenBg; c.fillRect(sx*k, vy*k, sw*k, vh*k);
    c.drawImage(im, sx*k, (vy - scroll)*k, sw*k, ih*k);
    c.restore();
  });
  /* barre d'état + île */
  c.fillStyle = cfg.screenBg; c.globalAlpha = 1; c.fillRect(sx*k, sy*k, sw*k, bar*k);
  c.fillStyle = "#111"; c.font = `600 ${21*k}px -apple-system, "Inter Tight", system-ui, sans-serif`; c.textBaseline = "middle"; c.fillText("9:41", (sx + 40)*k, (sy + 30)*k);
  for(let b = 0; b < 4; b++){ c.fillRect((sx + sw - 104 + b*8)*k, (sy + 34 - b*4)*k, 5*k, (6 + b*4)*k); }
  rr(c, (sx + sw - 62)*k, (sy + 22)*k, 32*k, 15*k, 4*k); c.lineWidth = 2*k; c.strokeStyle = "#111"; c.stroke(); c.fillRect((sx + sw - 59)*k, (sy + 25)*k, 24*k, 9*k);
  rr(c, (sx + sw/2 - 62)*k, (sy + 12)*k, 124*k, 36*k, 18*k); c.fillStyle = "#0A0A0C"; c.fill();
  c.restore(); c.textBaseline = "alphabetic";
}

function mockup(cfg){
  return function(c, W, H, p, A){
    const k = W/1600, DH = H/k;
    c.fillStyle = cfg.panelBg; c.fillRect(0,0,W,H);
    const pad = 40, pw = 1600 - 2*pad, ph = DH - 2*pad;
    /* un seul panneau : le téléphone qui défile, sortant du bas du cadre */
    rr(c, pad*k, pad*k, pw*k, ph*k, 44*k); c.fillStyle = cfg.panel; c.fill();
    /* téléphone */
    const fw = Math.min(520, (ph - 20) / 1.9), fh = fw * 2.05, fx = pad + (pw - fw)/2, fy = pad + 60;
    c.save(); c.beginPath(); rr(c, pad*k, pad*k, pw*k, ph*k, 44*k); c.clip();
    phone(c, k, fx, fy, fw, fh, cfg.screens, p, cfg, A); c.restore();
  };
}

/* Kioui */
const KF = '"Montserrat Alternates", "Inter Tight", system-ui, sans-serif';
const kioui = mockup({
  screenBg:"#FEFDFB", panel:"#DBDF0D", panelBg:"#FAF1E5", iconBg:"#DBDF0D", screens:["m_k_home","m_k_recipe","m_k_profile"],
  icon(c, k, x, y, s, A){ contain(c, A.k_logo, (x + s*.12)*k, (y + s*.3)*k, s*.76*k, s*.4*k); },
  widget(c, k, x, y, w, h, p, A){
    c.fillStyle = "#DBDF0D"; c.fillRect(x*k, y*k, w*k, h*k);
    c.fillStyle = "rgba(255,255,255,.22)"; c.beginPath(); c.arc((x + w*.82)*k, (y + h*1.05)*k, h*.75*k, 0, 7); c.fill();
    c.fillStyle = "#1B1820"; c.font = `600 ${30*k}px ${KF}`; c.fillText("CO₂ évité ce mois", (x + 40)*k, (y + 62)*k);
    const v = (1.2 * io(seg(p, .05, .3))).toFixed(1).replace(".", ",");
    c.font = `700 ${92*k}px ${KF}`; c.fillText(v, (x + 40)*k, (y + h*.62)*k); const vw = c.measureText(v).width/k;
    c.font = `600 ${40*k}px ${KF}`; c.fillText(" kg", (x + 40 + vw)*k, (y + h*.62)*k);
    const pts = Math.round(lerp(237, 637, io(seg(p, .3, .55))));
    rr(c, (x + 40)*k, (y + h - 100)*k, 250*k, 64*k, 32*k); c.fillStyle = "#1B1820"; c.fill();
    c.fillStyle = "#fff"; c.font = `600 ${26*k}px ${KF}`; c.textBaseline = "middle"; c.fillText(pts + " points", (x + 68)*k, (y + h - 67)*k); c.textBaseline = "alphabetic";
    c.strokeStyle = "rgba(27,24,32,.85)"; c.lineWidth = 5*k; c.save(); c.translate((x + w - 120)*k, (y + 110)*k); c.beginPath(); c.moveTo(-34*k, 34*k); c.quadraticCurveTo(-38*k, -34*k, 38*k, -38*k); c.quadraticCurveTo(34*k, 34*k, -34*k, 34*k); c.moveTo(-34*k, 34*k); c.lineTo(8*k, -4*k); c.stroke(); c.restore();
  }
});

/* LACES */
const LF = '"Outfit", "Inter Tight", system-ui, sans-serif';
const laces = mockup({
  screenBg:"#FBFAF8", panel:"#CFF59D", panelBg:"#FBFAF8", iconBg:"#2F2B3B", screens:["m_l_splash","m_l_home","m_l_product"],
  icon(c, k, x, y, s, A){ contain(c, A.l_logo, (x + s*.1)*k, (y + s*.3)*k, s*.8*k, s*.4*k); },
  widget(c, k, x, y, w, h, p, A){
    c.fillStyle = "#CFF59D"; c.fillRect(x*k, y*k, w*k, h*k);
    c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 26*k; c.beginPath(); c.arc((x + w*.7)*k, (y + h*1.2)*k, h*.8*k, 0, 7); c.stroke(); c.beginPath(); c.arc((x + w*.25)*k, (y + h*1.35)*k, h*.6*k, 0, 7); c.stroke();
    c.fillStyle = "#2F2B3B"; c.font = `500 ${32*k}px ${LF}`; c.fillText("Vos points", (x + 40)*k, (y + 62)*k);
    const v = Math.round(350 * io(seg(p, .05, .3)));
    c.font = `600 ${96*k}px ${LF}`; c.fillText(String(v), (x + 40)*k, (y + h*.6)*k); const vw = c.measureText(String(v)).width/k;
    c.font = `500 ${30*k}px ${LF}`; c.fillText("  pts", (x + 40 + vw)*k, (y + h*.6 - 40)*k);
    const bw = (w - 100)/2, by = y + h - 104;
    rr(c, (x + 40)*k, by*k, bw*k, 68*k, 34*k); c.fillStyle = "#fff"; c.fill();
    rr(c, (x + 60 + bw)*k, by*k, bw*k, 68*k, 34*k); c.fillStyle = "#2F2B3B"; c.fill();
    c.textAlign = "center"; c.textBaseline = "middle"; c.font = `500 ${28*k}px ${LF}`;
    c.fillStyle = "#2F2B3B"; c.fillText("Acheter", (x + 40 + bw/2)*k, (by + 35)*k); c.fillStyle = "#fff"; c.fillText("Échanger  ⇄", (x + 60 + bw*1.5)*k, (by + 35)*k);
    c.textAlign = "left"; c.textBaseline = "alphabetic";
    rr(c, (x + w - 92)*k, (y + 26)*k, 64*k, 64*k, 32*k); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#2F2B3B"; c.lineWidth = 3*k; c.beginPath();
    c.moveTo((x + w - 60)*k, (y + 44)*k); c.lineTo((x + w - 60)*k, (y + 72)*k); c.moveTo((x + w - 74)*k, (y + 58)*k); c.lineTo((x + w - 46)*k, (y + 58)*k); c.stroke();
  }
});

const LOOPS = {
  m_kioui: { hd:true, draw:kioui, ratio:1.5, dur:12000, still:.2, label:"Mockup Kioui : l'app qui défile dans un téléphone (accueil, recette, profil)" },
  m_laces: { hd:true, draw:laces, ratio:1.5, dur:12000, still:.4, label:"Mockup LACES : l'app qui défile dans un téléphone (ouverture, accueil, fiche produit)" }
};
if(typeof window !== "undefined") window.MK_LOOPS = LOOPS;
})();
