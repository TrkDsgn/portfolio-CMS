/* Boucles animées Electroni[k] — chaque boucle est une fonction déterministe de p ∈ [0,1).
   draw(ctx, W, H, p, A) : A = images chargées. render(0) === render(1). */
import { clamp, seg, lerp, io, out, rr } from "./shared.js";

const EK = { ink:"#18151E", ink2:"#2F2B3B", ink3:"#474059", ink4:"#5E5676", v1:"#4D16E9", v2:"#7145ED", v3:"#9473F2", v4:"#B8A2F6",
  cream:"#F3F1EC", paper:"#FBFAF7", mute:"#B3ADC4", lav:"#ECE6FD", line:"#D6D1E4" };
const SANS = '"Manrope", "Inter Tight", system-ui, sans-serif';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const expo = t => t===0?0:t===1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2;
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

export default {
  intro: { draw:intro, ratio:16/9, dur:6000, still:.8, label:"Animation d'entrée : la photo sort du noir, s'ouvre en plein écran, puis le titre et la navigation apparaissent" },
  audit: { draw:audit, ratio:21/9, dur:5000, still:.7, label:"Audit : score d'éco-conception D, 4,87 Mo, 82 requêtes, 13 rubriques" },
  ia: { draw:ia, ratio:16/9, dur:7000, still:.82, label:"Architecture : 13 rubriques barrées, remplacées par 6 sections" },
  typo: { draw:typo, ratio:2, dur:6000, still:.1, label:"Langage visuel : Manrope pour la structure, Cormorant Garamond en italique pour les mots qui changent" },
  catalogue: { draw:catalogue, ratio:16/9, dur:7000, still:.3, label:"Catalogue : les filtres changent de sélection et les cartes se recomposent" }
};
