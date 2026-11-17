/* Boucles animées LACES — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
import { clamp, seg, lerp, io, rr } from "./shared.js";

const LC = { tea:"#CFF59D", teaSoft:"#EDFBD3", blush:"#F96995", raisin:"#2F2B3B", ink:"#1B1A22", paper:"#FBFAF8", linen:"#F4F1EC", sage:"#9DB86E", mute:"#7A7486", line:"#E4DFD8", red:"#E5564A" };
const F = '"Outfit", "Inter Tight", system-ui, sans-serif';
const back = t => { if(t<=0) return 0; const c1 = 1.7, c3 = c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
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

export default {
  l_troc: { draw:troc, ratio:16/9, dur:6000, still:.05, label:"Troc : deux utilisateurs échangent leurs paires de sneakers" },
  l_arbo: { draw:arbo, ratio:2, dur:6500, still:.82, label:"Arborescence : de la page de connexion au profil, en passant par l'accueil, la fiche produit et le paiement" },
  l_colors: { draw:colors, ratio:21/9, dur:9000, still:.32, label:"Couleurs : TeaGreen pour les actions, Blush pour les accents, RaisinBlack pour le texte" },
  l_type: { draw:type, ratio:21/9, dur:9000, still:.66, label:"Typographie Outfit : le contour de Ag tracé à la plume, avec ses points d'ancrage et ses poignées de Bézier" },
  l_deco: { draw:deco, ratio:21/9, dur:5000, still:.6, label:"Éléments décoratifs : dollar, sticker like, OMG et étincelles" },
  l_bands: { draw:bands, ratio:21/9, dur:8000, still:.2, label:"Bandeaux défilants de l'interface : pour vous, Nike, profil, design system" },
  l_button: { draw:button, ratio:2, dur:7000, still:.05, label:"Design system : le bouton passe par ses états default, hover, click, focus et disabled" }
};
