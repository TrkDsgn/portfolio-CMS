/* Boucles animées Prisme — fonctions déterministes de p ∈ [0,1). draw(ctx, W, H, p, A). */
import { seg, lerp, io, out, rr } from "./shared.js";

const PX = {
  bg: "#F6F5FB",
  card: "#FDFCFF",
  line: "#E4E2EE",
  ink: "#14112A",
  ink2: "#514D69",
  mute: "#8E8AA6",
  dark: "#0E0C1F",
  dark2: "#1C1A36",
  i50: "#F0EEFF",
  i100: "#E1DDFF",
  i200: "#C4BDFF",
  i300: "#A399FF",
  i400: "#7F72FF",
  i500: "#5B4CFF",
  i600: "#4636E6",
  i700: "#3527B8",
  i800: "#261C85",
  i900: "#181255",
  blue: "#2563EB",
  green: "#15803D",
  yellow: "#F5B800",
  red: "#DC2626",
};
const F = '"Poppins", "Inter Tight", system-ui, sans-serif',
  MONO = '"Roboto Mono", ui-monospace, monospace';
const back = t => {
  if (t <= 0) return 0;
  const c1 = 1.6,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const font = (k, w, s, fam = F) => `${w} ${s * k}px ${fam}`;
const fade = p => Math.min(seg(p, 0, 0.04), 1 - seg(p, 0.9, 0.98));

/* 1. Atomic design : un atome devient une page */
function atomic(c, W, H, p) {
  const k = W / 1600,
    DH = H / k;
  c.fillStyle = PX.bg;
  c.fillRect(0, 0, W, H);
  const ga = fade(p);
  if (ga <= 0) return;
  c.globalAlpha = ga;
  const labels = ["Atome", "Molécule", "Organisme", "Template", "Page"],
    n = 5,
    cw = 250,
    gap = 40,
    x0 = (1600 - n * cw - (n - 1) * gap) / 2,
    y0 = DH * 0.2,
    ch = DH * 0.5;
  labels.forEach((lb, i) => {
    const x = x0 + i * (cw + gap),
      a = back(seg(p, 0.05 + i * 0.12, 0.15 + i * 0.12));
    if (a <= 0) return;
    c.save();
    c.translate((x + cw / 2) * k, (y0 + ch / 2) * k);
    c.scale(a, a);
    c.translate(-(x + cw / 2) * k, -(y0 + ch / 2) * k);
    rr(c, x * k, y0 * k, cw * k, ch * k, 22 * k);
    c.fillStyle = PX.card;
    c.fill();
    c.strokeStyle = PX.line;
    c.lineWidth = 1.5 * k;
    c.stroke();
    const ix = x + 20,
      iy = y0 + 20,
      iw = cw - 40,
      ih = ch * 0.55;
    rr(c, ix * k, iy * k, iw * k, ih * k, 14 * k);
    c.fillStyle = PX.i50;
    c.fill();
    const cx = ix + iw / 2,
      cy = iy + ih / 2;
    c.fillStyle = PX.i500;
    if (i === 0) {
      c.beginPath();
      c.arc(cx * k, cy * k, 34 * k, 0, 7);
      c.fill();
    }
    if (i === 1) {
      [PX.i500, PX.i400, PX.i700].forEach((col, j) => {
        c.fillStyle = col;
        c.beginPath();
        c.arc((cx - 70 + j * 70) * k, cy * k, 22 * k, 0, 7);
        c.fill();
      });
      c.strokeStyle = PX.i300;
      c.lineWidth = 4 * k;
      c.beginPath();
      c.moveTo((cx - 44) * k, cy * k);
      c.lineTo((cx - 26) * k, cy * k);
      c.moveTo((cx + 26) * k, cy * k);
      c.lineTo((cx + 44) * k, cy * k);
      c.stroke();
    }
    if (i === 2) {
      rr(c, (ix + 24) * k, (iy + 30) * k, iw * 0.6 * k, 22 * k, 6 * k);
      c.fill();
      c.fillStyle = PX.i200;
      rr(c, (ix + 24) * k, (iy + 66) * k, (iw - 48) * k, 12 * k, 6 * k);
      c.fill();
      rr(c, (ix + 24) * k, (iy + 88) * k, iw * 0.7 * k, 12 * k, 6 * k);
      c.fill();
      c.fillStyle = PX.i700;
      rr(c, (ix + 24) * k, (iy + 114) * k, iw * 0.4 * k, 26 * k, 6 * k);
      c.fill();
    }
    if (i === 3) {
      c.setLineDash([6 * k, 5 * k]);
      c.strokeStyle = PX.mute;
      c.lineWidth = 2 * k;
      c.strokeRect((ix + 20) * k, (iy + 20) * k, (iw - 40) * k, 22 * k);
      c.strokeRect((ix + 20) * k, (iy + 52) * k, iw * 0.25 * k, (ih - 72) * k);
      c.strokeRect((ix + 30 + iw * 0.25) * k, (iy + 52) * k, (iw * 0.75 - 50) * k, (ih - 72) * k);
      c.setLineDash([]);
    }
    if (i === 4) {
      c.fillStyle = PX.i500;
      rr(c, (ix + 20) * k, (iy + 20) * k, (iw - 40) * k, 22 * k, 6 * k);
      c.fill();
      c.fillStyle = PX.i200;
      c.fillRect((ix + 20) * k, (iy + 52) * k, iw * 0.25 * k, (ih - 72) * k);
      const g = c.createLinearGradient((ix + 30 + iw * 0.25) * k, 0, (ix + iw - 20) * k, 0);
      g.addColorStop(0, PX.i400);
      g.addColorStop(1, PX.i800);
      c.fillStyle = g;
      c.fillRect((ix + 30 + iw * 0.25) * k, (iy + 52) * k, (iw * 0.75 - 50) * k, (ih - 72) * k);
    }
    c.fillStyle = PX.ink;
    c.font = font(k, 600, 30);
    c.fillText(lb, (x + 20) * k, (iy + ih + 50) * k);
    c.fillStyle = PX.mute;
    c.font = font(k, 500, 16, MONO);
    c.fillText("0" + (i + 1), (x + 20) * k, (iy + ih + 84) * k);
    c.restore();
    if (i < n - 1) {
      const ar = out(seg(p, 0.12 + i * 0.12, 0.18 + i * 0.12));
      if (ar > 0) {
        const ax = x + cw + 6,
          ay = y0 + ch / 2;
        c.strokeStyle = PX.i300;
        c.lineWidth = 4 * k;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(ax * k, ay * k);
        c.lineTo((ax + (gap - 12) * ar) * k, ay * k);
        c.stroke();
        c.lineCap = "butt";
      }
    }
  });
  c.globalAlpha = 1;
}

/* 2. Tokens : primitif → sémantique → composant, puis le bouton change */
const ROWS = [
  ["indigo-500", "color.action.primary", "button.primary.bg", PX.i500],
  ["neutral-900", "color.text.default", "input.text", "#14112A"],
  ["red-600", "color.feedback.error", "alert.error.border", PX.red],
];
function tokens(c, W, H, p) {
  const k = W / 1600,
    DH = H / k;
  c.fillStyle = PX.dark;
  c.fillRect(0, 0, W, H);
  const ga = fade(p);
  if (ga <= 0) return;
  c.globalAlpha = ga;
  const cols = [80, 600, 1120],
    cw = 400,
    rh = 70;
  ["Primitifs", "Sémantiques", "Composants"].forEach((t, j) => {
    c.fillStyle = "#fff";
    c.font = font(k, 600, 28);
    c.fillText(t, cols[j] * k, 90 * k);
  });
  ROWS.forEach((r, i) => {
    const y = 130 + i * (rh + 22);
    for (let j = 0; j < 3; j++) {
      const a = out(seg(p, 0.05 + i * 0.1 + j * 0.07, 0.12 + i * 0.1 + j * 0.07));
      if (a <= 0) continue;
      c.globalAlpha = ga * a;
      const x = cols[j] + (1 - a) * 20;
      rr(c, x * k, y * k, cw * k, rh * k, 12 * k);
      c.fillStyle = PX.dark2;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.08)";
      c.lineWidth = 1.5 * k;
      c.stroke();
      let tx = x + 24;
      if (j === 0) {
        rr(c, (x + 22) * k, (y + 19) * k, 32 * k, 32 * k, 8 * k);
        c.fillStyle = r[3];
        c.fill();
        if (i === 1) {
          c.strokeStyle = "rgba(255,255,255,.4)";
          c.stroke();
        }
        tx = x + 70;
      }
      c.fillStyle = "#EDEBFA";
      c.font = font(k, 500, 24, MONO);
      c.textBaseline = "middle";
      c.fillText(r[j], tx * k, (y + rh / 2 + 1) * k);
      c.textBaseline = "alphabetic";
      if (j < 2) {
        const ar = out(seg(p, 0.1 + i * 0.1 + j * 0.07, 0.16 + i * 0.1 + j * 0.07));
        c.strokeStyle = PX.i400;
        c.lineWidth = 4 * k;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo((cols[j] + cw + 22) * k, (y + rh / 2) * k);
        c.lineTo((cols[j] + cw + 22 + 60 * ar) * k, (y + rh / 2) * k);
        c.stroke();
        c.lineCap = "butt";
      }
    }
  });
  c.globalAlpha = ga;
  /* démonstration : on change la primitive, le bouton suit */
  const sw = io(seg(p, 0.52, 0.6)) - io(seg(p, 0.78, 0.86));
  const base = [0x5b, 0x4c, 0xff],
    alt = [0x0e, 0x9f, 0x6e],
    col = `rgb(${base.map((v, i) => Math.round(lerp(v, alt[i], sw))).join(",")})`;
  const ba = out(seg(p, 0.4, 0.48));
  if (ba > 0) {
    c.globalAlpha = ga * ba;
    c.fillStyle = "rgba(237,235,250,.6)";
    c.font = font(k, 400, 24);
    c.fillText("On change une primitive, tout suit :", 80 * k, (DH - 92) * k);
    rr(c, 560 * k, (DH - 130) * k, 220 * k, 64 * k, 12 * k);
    c.fillStyle = col;
    c.fill();
    c.fillStyle = "#fff";
    c.font = font(k, 600, 24);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Valider", 670 * k, (DH - 97) * k);
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    rr(c, 102 * k, 149 * k, 32 * k, 32 * k, 8 * k);
    c.fillStyle = col;
    c.fill();
  }
  c.globalAlpha = 1;
}

/* 3. Indigo : dix nuances, la base se distingue */
const SH = [
  ["50", "F0EEFF"],
  ["100", "E1DDFF"],
  ["200", "C4BDFF"],
  ["300", "A399FF"],
  ["400", "7F72FF"],
  ["500", "5B4CFF"],
  ["600", "4636E6"],
  ["700", "3527B8"],
  ["800", "261C85"],
  ["900", "181255"],
];
function indigo(c, W, H, p) {
  const k = W / 1600,
    DH = H / k;
  c.fillStyle = PX.bg;
  c.fillRect(0, 0, W, H);
  const ga = fade(p);
  if (ga <= 0) return;
  c.globalAlpha = ga;
  const x0 = 80,
    tw = 1440,
    y0 = DH * 0.18,
    h = DH * 0.62,
    sw = tw / 10;
  c.save();
  rr(c, x0 * k, y0 * k, tw * k, h * k, 26 * k);
  c.clip();
  SH.forEach(([n, hex], i) => {
    const a = io(seg(p, 0.04 + i * 0.035, 0.2 + i * 0.035));
    if (a <= 0) return;
    const hh = h * a,
      yy = y0 + h - hh,
      base = i === 5,
      lift = base ? out(seg(p, 0.5, 0.58)) * (1 - seg(p, 0.8, 0.86)) : 0;
    c.fillStyle = "#" + hex;
    c.fillRect((x0 + i * sw) * k, (yy - lift * 16) * k, (sw + 1) * k, (hh + lift * 16) * k);
    const dark = i < 4;
    c.fillStyle = dark ? PX.ink : "#fff";
    c.globalAlpha = ga * out(seg(p, 0.2 + i * 0.035, 0.3 + i * 0.035));
    c.font = font(k, 600, 26);
    c.fillText(n, (x0 + i * sw + 18) * k, (y0 + h - 60) * k);
    c.font = font(k, 500, 18, MONO);
    c.fillText(hex, (x0 + i * sw + 18) * k, (y0 + h - 26) * k);
    c.globalAlpha = ga;
  });
  c.restore();
  const b = back(seg(p, 0.52, 0.6)) * (1 - seg(p, 0.8, 0.86));
  if (b > 0) {
    const bx = x0 + 5 * sw + 18,
      by = y0 + 20;
    c.save();
    c.translate((bx + 46) * k, (by + 20) * k);
    c.scale(b, b);
    rr(c, -46 * k, -20 * k, 92 * k, 40 * k, 20 * k);
    c.fillStyle = "#fff";
    c.fill();
    c.fillStyle = PX.i700;
    c.font = font(k, 600, 22);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Base", 0, 2 * k);
    c.restore();
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
  }
  c.globalAlpha = 1;
}

/* 4. Hiérarchie typographique : du Display au H6 */
const TY = [
  ["Display — Hero", 64, 600],
  ["H1 — Titre de page", 48, 600],
  ["H2 — Titre de section", 40, 600],
  ["H3 — Sous-section", 32, 600],
  ["H4 — Titre de carte", 24, 500],
  ["H5 — Titre de groupe", 20, 500],
  ["H6 — Petit titre", 18, 500],
];
function type(c, W, H, p) {
  const k = W / 1600,
    DH = H / k;
  c.fillStyle = PX.i500;
  c.fillRect(0, 0, W, H);
  const ga = fade(p);
  if (ga <= 0) return;
  c.globalAlpha = ga;
  /* grand Aa */
  rr(c, 80 * k, 70 * k, 460 * k, (DH - 140) * k, 28 * k);
  c.fillStyle = "#5040E8";
  c.fill();
  const ws = [400, 500, 600, 700],
    wi = Math.floor(p * 4) % 4;
  c.fillStyle = "#fff";
  c.font = font(k, ws[wi], 230);
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("Aa", 310 * k, (DH / 2 + 6) * k);
  c.font = font(k, 500, 20, MONO);
  c.fillStyle = "rgba(255,255,255,.75)";
  c.fillText("Poppins " + ws[wi], 310 * k, (DH - 110) * k);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  let y = 90;
  TY.forEach(([t, s, w], i) => {
    const a = out(seg(p, 0.05 + i * 0.06, 0.15 + i * 0.06));
    const sz = s * 1.05;
    y += sz * 1.12;
    c.save();
    c.beginPath();
    c.rect(620 * k, (y - sz * 1.1) * k, 940 * k, sz * 1.35 * k);
    c.clip();
    c.fillStyle = "#fff";
    c.font = font(k, w, sz);
    c.fillText(t, 620 * k, (y + (1 - a) * sz * 1.3) * k);
    c.fillStyle = "rgba(255,255,255,.6)";
    c.font = font(k, 500, 17, MONO);
    c.textAlign = "right";
    c.fillText(`${s} / ${w}`, 1540 * k, (y + (1 - a) * sz * 1.3) * k);
    c.textAlign = "left";
    c.restore();
    y += 14;
  });
  c.globalAlpha = 1;
}

/* 5. Contrastes : les ratios se mesurent */
const CT = [
  ["#5B4CFF", "#fff", 5.35, "Blanc / Indigo 500", "AA"],
  ["#fff", PX.i600, 7.17, "Indigo 600 / Blanc", "AAA"],
  ["#fff", "#14112A", 18.37, "Neutral 900 / Blanc", "AAA"],
  [PX.blue, "#fff", 5.17, "Blanc / Info", "AA"],
  [PX.green, "#fff", 5.02, "Blanc / Succès", "AA"],
  [PX.red, "#fff", 4.83, "Blanc / Erreur", "AA"],
];
function contrast(c, W, H, p) {
  const k = W / 1600,
    DH = H / k;
  c.fillStyle = PX.dark;
  c.fillRect(0, 0, W, H);
  const ga = fade(p);
  if (ga <= 0) return;
  c.globalAlpha = ga;
  const cw = 460,
    chh = (DH - 200) / 2,
    gx = (1600 - 3 * cw - 2 * 30) / 2;
  CT.forEach(([bg, fg, ratio, label, lvl], i) => {
    const x = gx + (i % 3) * (cw + 30),
      y = 70 + Math.floor(i / 3) * (chh + 30),
      d = 0.04 + i * 0.06;
    const a = out(seg(p, d, d + 0.1));
    if (a <= 0) return;
    c.globalAlpha = ga * a;
    rr(c, x * k, (y + (1 - a) * 16) * k, cw * k, chh * k, 18 * k);
    c.fillStyle = PX.dark2;
    c.fill();
    const sq = 92,
      sy = y + (chh - sq) / 2;
    rr(c, (x + 26) * k, sy * k, sq * k, sq * k, 12 * k);
    c.fillStyle = bg;
    c.fill();
    c.fillStyle = fg;
    c.font = font(k, 600, 40);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Aa", (x + 26 + sq / 2) * k, (sy + sq / 2 + 2) * k);
    c.textAlign = "left";
    const v = ratio * io(seg(p, d + 0.04, d + 0.28));
    c.fillStyle = "#fff";
    c.font = font(k, 600, 44);
    c.fillText(v.toFixed(2).replace(".", ",") + ":1", (x + 144) * k, (sy + 30) * k);
    c.fillStyle = "rgba(237,235,250,.6)";
    c.font = font(k, 400, 21);
    c.fillText(label, (x + 144) * k, (sy + 72) * k);
    const bp = back(seg(p, d + 0.26, d + 0.34));
    if (bp > 0) {
      c.save();
      c.translate((x + cw - 56) * k, (sy + 30) * k);
      c.scale(bp, bp);
      rr(c, -40 * k, -20 * k, 80 * k, 40 * k, 20 * k);
      c.fillStyle = PX.i700;
      c.fill();
      c.fillStyle = "#fff";
      c.font = font(k, 600, 20);
      c.textAlign = "center";
      c.fillText(lvl, 0, 2 * k);
      c.restore();
      c.textAlign = "left";
    }
    c.textBaseline = "alphabetic";
  });
  c.globalAlpha = 1;
}

export default {
  p_atomic: {
    draw: atomic,
    ratio: 2,
    dur: 7000,
    still: 0.8,
    label: "Atomic Design : atome, molécule, organisme, template et page apparaissent l'un après l'autre",
  },
  p_tokens: {
    draw: tokens,
    ratio: 2,
    dur: 7500,
    still: 0.45,
    label: "Tokens en trois couches : primitifs, sémantiques, composants ; changer une primitive change le bouton",
  },
  p_indigo: {
    draw: indigo,
    ratio: 21 / 9,
    dur: 6000,
    still: 0.6,
    label: "Palette indigo : dix nuances de 50 à 900, la 500 est la couleur de base",
  },
  p_type: {
    draw: type,
    ratio: 2,
    dur: 6000,
    still: 0.7,
    label: "Typographie Poppins : la hiérarchie du Display au H6, et les quatre graisses",
  },
  p_contrast: {
    draw: contrast,
    ratio: 2,
    dur: 6500,
    still: 0.7,
    label: "Contrastes mesurés : six paires de couleurs avec leur ratio et leur niveau WCAG",
  },
};
