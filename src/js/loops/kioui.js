/* Boucles animées Kioui — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
import { clamp, seg, lerp, io, out, rr } from "./shared.js";

const KX = { lime:"#DBDF0D", linen:"#FAF1E5", green:"#013D2A", pumpkin:"#FF7006", rose:"#FF316F", ink:"#1B1820",
  peach:"#FFD6B5", mint:"#E6ECEA", sand:"#E9DED3", pink:"#FFD3EE", cream:"#F6F3EC", grey:"#6E6660", line:"#E3D9CC", leaf:"#12B26C" };
const F = '"Montserrat Alternates", "Inter Tight", system-ui, sans-serif';
const back = t => { const c1 = 1.7, c3 = c1+1; return t<=0 ? 0 : 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
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

export default {
  k_scan: { draw:scan, ratio:16/9, dur:8000, still:.62, label:"Scanner : le bouton lance le scan du frigo, puis la liste des ingrédients apparaît avec des quantités ajustables" },
  k_points: { draw:points, ratio:21/9, dur:6000, still:.8, label:"Impact : 400 g de CO₂ évités deviennent +400 points, le total passe de 237 à 637" },
  k_demarche: { draw:demarche, ratio:21/9, dur:6500, still:.8, label:"Démarche en six étapes : brainstorm, benchmark, wireframes, moodboard, design system, maquettes" },
  k_motifs: { draw:motifs, ratio:4, dur:14000, still:.1, label:"Les sept motifs alimentaires du design system : citron, poisson, viande, saucisse, cœur, salade, boisson" },
  k_profil: { draw:profil, ratio:2, dur:6500, still:.8, label:"Profil : les courbes de consommation réelle et évitée se tracent, la jauge de points se remplit" }
};
