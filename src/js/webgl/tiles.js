/* Dessins 2D (canvas) : couvertures des projets et visuels générés quand un projet n'a pas d'image.
   Les visuels générés (DRAW) utilisent la palette du projet : p = { bg, fg, accent, soft }. */
import { loadImage } from "../utils.js";

const DISPLAY_FONT = '"Bricolage Grotesque", "Inter Tight", sans-serif';
const MONO_FONT = '"Roboto Mono", monospace';

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r);
  else c.rect(x, y, w, h);
}

/** Couleur hexadécimale #rrggbb → rgba() avec l'opacité a. */
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Écrit un texte en passant à la ligne quand il dépasse maxW. */
function wrapText(c, text, x, y, maxW, lineHeight) {
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? line + " " + word : word;
    if (c.measureText(test).width > maxW && line) {
      c.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  c.fillText(line, x, y);
}

/** Visuels générés, par type de case (champ « tiles » du projet). */
export const DRAW = {
  desktop(c, x, y, w, h, p, P) {
    c.fillStyle = p.soft;
    c.fillRect(x, y, w, h);
    const m = Math.min(w, h) * 0.08;
    const bx = x + m;
    const by = y + m * 1.2;
    const bw = w - 2 * m;
    const bh = h - m * 1.2;
    c.fillStyle = p.bg;
    roundRect(c, bx, by, bw, bh, m * 0.35);
    c.fill();
    c.fillStyle = hexA(p.fg, 0.15);
    c.fillRect(bx, by + bh * 0.09, bw, 1);
    [0, 1, 2].forEach(i => {
      c.beginPath();
      c.arc(bx + bh * 0.045 + i * bh * 0.04, by + bh * 0.045, bh * 0.012, 0, 7);
      c.fill();
    });
    for (let i = 0; i < 4; i++) c.fillRect(bx + bw * 0.55 + i * bw * 0.09, by + bh * 0.04, bw * 0.06, bh * 0.012);
    c.fillStyle = p.fg;
    c.font = `600 ${bh * 0.11}px ${DISPLAY_FONT}`;
    c.textBaseline = "alphabetic";
    wrapText(c, P.title, bx + bw * 0.07, by + bh * 0.3, bw * 0.48, bh * 0.11);
    c.fillStyle = hexA(p.fg, 0.35);
    for (let i = 0; i < 3; i++)
      c.fillRect(bx + bw * 0.07, by + bh * (0.55 + i * 0.05), bw * (0.38 - i * 0.06), bh * 0.018);
    c.fillStyle = p.accent;
    roundRect(c, bx + bw * 0.07, by + bh * 0.74, bw * 0.16, bh * 0.08, bh * 0.04);
    c.fill();
    for (let i = 0; i < 3; i++) {
      c.fillStyle = i === 1 ? p.accent : p.soft;
      roundRect(c, bx + bw * (0.6 + i * 0.02), by + bh * (0.2 + i * 0.17), bw * 0.32, bh * 0.22, bh * 0.03);
      c.fill();
      c.fillStyle = hexA(i === 1 ? p.bg : p.fg, 0.5);
      c.fillRect(bx + bw * (0.63 + i * 0.02), by + bh * (0.27 + i * 0.17), bw * 0.18, bh * 0.018);
      c.fillRect(bx + bw * (0.63 + i * 0.02), by + bh * (0.32 + i * 0.17), bw * 0.12, bh * 0.018);
    }
  },

  phone(c, x, y, w, h, p, P) {
    c.fillStyle = p.accent;
    c.fillRect(x, y, w, h);
    const ph = h * 0.84;
    const pw = ph * 0.48;
    const px = x + (w - pw) / 2;
    const py = y + h * 0.08;
    c.fillStyle = p.fg;
    roundRect(c, px, py, pw, ph, pw * 0.14);
    c.fill();
    c.fillStyle = p.bg;
    roundRect(c, px + pw * 0.05, py + pw * 0.05, pw * 0.9, ph - pw * 0.1, pw * 0.1);
    c.fill();
    const ix = px + pw * 0.13;
    const iw = pw * 0.74;
    c.fillStyle = p.fg;
    c.font = `600 ${pw * 0.1}px ${DISPLAY_FONT}`;
    wrapText(c, P.title.split(" ")[0], ix, py + ph * 0.17, iw, pw * 0.1);
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i === 0 ? p.soft : hexA(p.fg, 0.07);
      roundRect(c, ix, py + ph * (0.24 + i * 0.13), iw, ph * 0.1, pw * 0.05);
      c.fill();
      c.fillStyle = hexA(p.fg, 0.45);
      c.fillRect(ix + iw * 0.1, py + ph * (0.28 + i * 0.13), iw * 0.5, ph * 0.012);
    }
    c.fillStyle = p.accent;
    roundRect(c, ix, py + ph * 0.82, iw, ph * 0.07, ph * 0.035);
    c.fill();
  },

  swatch(c, x, y, w, h, p) {
    const colors = [p.bg, p.soft, p.accent, p.fg];
    const horizontal = w > h * 1.3;
    colors.forEach((col, i) => {
      c.fillStyle = col;
      if (horizontal) c.fillRect(x + (w * i) / 4, y, w / 4 + 1, h);
      else c.fillRect(x, y + (h * i) / 4, w, h / 4 + 1);
      c.fillStyle = i >= 2 ? p.bg : p.fg;
      c.font = `500 ${Math.min(w, h) * 0.045}px ${MONO_FONT}`;
      const tx = horizontal ? x + (w * i) / 4 + w * 0.02 : x + w * 0.06;
      const ty = horizontal ? y + h * 0.92 : y + (h * (i + 1)) / 4 - h * 0.03;
      c.fillText(col.toUpperCase(), tx, ty);
    });
  },

  type(c, x, y, w, h, p) {
    c.fillStyle = p.fg;
    c.fillRect(x, y, w, h);
    c.fillStyle = p.bg;
    const s = Math.min(w, h);
    c.font = `500 ${s * 0.55}px ${DISPLAY_FONT}`;
    c.textBaseline = "alphabetic";
    c.fillText("Aa", x + w * 0.1, y + h * 0.7);
    c.fillStyle = p.accent;
    c.font = `500 ${s * 0.045}px ${MONO_FONT}`;
    c.fillText("DISPLAY / 72", x + w * 0.1, y + h * 0.88);
    c.fillStyle = hexA(p.bg, 0.6);
    c.font = `${s * 0.05}px "Inter Tight", sans-serif`;
    c.fillText("Abc 0123 — Regular", x + w * 0.1, y + h * 0.15);
  },

  flow(c, x, y, w, h, p) {
    c.fillStyle = p.soft;
    c.fillRect(x, y, w, h);
    const wide = w > h * 1.3;
    const n = wide ? 4 : 3;
    const nw = w * (wide ? 0.16 : 0.24);
    const nh = h * 0.16;
    const pts = [];
    for (let i = 0; i < n; i++)
      pts.push([x + w * (0.1 + (i * (0.8 - nw / w)) / (n - 1)), y + h * (i % 2 ? 0.58 : 0.28)]);
    c.strokeStyle = hexA(p.fg, 0.5);
    c.lineWidth = Math.max(1, h * 0.006);
    c.setLineDash([h * 0.015, h * 0.015]);
    for (let i = 0; i < n - 1; i++) {
      c.beginPath();
      c.moveTo(pts[i][0] + nw, pts[i][1] + nh / 2);
      c.bezierCurveTo(
        pts[i][0] + nw * 1.4,
        pts[i][1] + nh / 2,
        pts[i + 1][0] - nw * 0.4,
        pts[i + 1][1] + nh / 2,
        pts[i + 1][0],
        pts[i + 1][1] + nh / 2,
      );
      c.stroke();
    }
    c.setLineDash([]);
    pts.forEach((q, i) => {
      c.fillStyle = i === n - 1 ? p.accent : p.bg;
      roundRect(c, q[0], q[1], nw, nh, nh * 0.2);
      c.fill();
      c.fillStyle = hexA(i === n - 1 ? p.bg : p.fg, 0.55);
      c.fillRect(q[0] + nw * 0.12, q[1] + nh * 0.4, nw * 0.6, nh * 0.12);
    });
  },

  chart(c, x, y, w, h, p) {
    c.fillStyle = p.bg;
    c.fillRect(x, y, w, h);
    const m = Math.min(w, h) * 0.1;
    c.fillStyle = p.soft;
    roundRect(c, x + m, y + m, w - 2 * m, h - 2 * m, m * 0.3);
    c.fill();
    c.strokeStyle = hexA(p.fg, 0.12);
    c.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const yy = y + m + ((h - 2 * m) * i) / 4;
      c.beginPath();
      c.moveTo(x + m * 1.5, yy);
      c.lineTo(x + w - m * 1.5, yy);
      c.stroke();
    }
    const n = 9;
    const ys = [0.7, 0.62, 0.66, 0.5, 0.54, 0.4, 0.44, 0.3, 0.26];
    c.strokeStyle = p.accent;
    c.lineWidth = Math.max(2, h * 0.012);
    c.beginPath();
    ys.forEach((v, i) => {
      const xx = x + m * 1.5 + ((w - 3 * m) * i) / (n - 1);
      const yy = y + h * v;
      if (i) c.lineTo(xx, yy);
      else c.moveTo(xx, yy);
    });
    c.stroke();
    c.fillStyle = p.accent;
    c.beginPath();
    c.arc(x + w - m * 1.5, y + h * 0.26, h * 0.02, 0, 7);
    c.fill();
    c.fillStyle = hexA(p.fg, 0.25);
    for (let i = 0; i < 6; i++) {
      const bh = h * (0.08 + ((i * 37) % 5) * 0.02);
      c.fillRect(x + m * 1.5 + (i * (w - 3 * m)) / 6, y + h - m * 1.5 - bh, (w - 3 * m) / 9, bh);
    }
  },

  icons(c, x, y, w, h, p) {
    c.fillStyle = p.bg;
    c.fillRect(x, y, w, h);
    const cols = w > h * 1.3 ? 8 : 4;
    const rows = 4;
    const cw = w / (cols + 1);
    const ch = h / (rows + 1);
    c.lineWidth = Math.max(1.5, Math.min(w, h) * 0.008);
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const cx = x + cw * (k + 1);
        const cy = y + ch * (r + 1);
        const s = Math.min(cw, ch) * 0.28;
        const shape = (r * cols + k) % 5;
        c.strokeStyle = (r + k) % 7 === 0 ? p.accent : p.fg;
        c.beginPath();
        if (shape === 0) c.arc(cx, cy, s, 0, 7);
        else if (shape === 1) c.rect(cx - s, cy - s, s * 2, s * 2);
        else if (shape === 2) {
          c.moveTo(cx - s, cy + s);
          c.lineTo(cx, cy - s);
          c.lineTo(cx + s, cy + s);
          c.closePath();
        } else if (shape === 3) {
          c.moveTo(cx - s, cy);
          c.lineTo(cx + s, cy);
          c.moveTo(cx, cy - s);
          c.lineTo(cx, cy + s);
        } else {
          c.moveTo(cx - s, cy);
          c.lineTo(cx - s * 0.2, cy + s * 0.7);
          c.lineTo(cx + s, cy - s * 0.6);
        }
        c.stroke();
      }
    }
  },
};

/** Dessine une image en remplissant tout le cadre (recadrée au centre). */
function drawImageCover(c, image, x, y, w, h) {
  const s = Math.max(w / image.width, h / image.height);
  const iw = image.width * s;
  const ih = image.height * s;
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.drawImage(image, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  c.restore();
}

/** Case k d'un projet : son image si elle existe, sinon un visuel généré. */
export async function drawTile(c, P, k, x, y, w, h) {
  const src = P.images && P.images[k];
  const image = src ? await loadImage(src) : null;
  if (image) drawImageCover(c, image, x, y, w, h);
  else DRAW[P.tiles[k % P.tiles.length]](c, x, y, w, h, P.pal, P);
}

/** Couverture d'un projet, plein cadre (cadrage réglable avec coverFx / coverFy). */
export async function drawProjectCover(c, P, ox, oy, W, H) {
  c.save();
  c.beginPath();
  c.rect(ox, oy, W, H);
  c.clip();
  c.fillStyle = "#161616";
  c.fillRect(ox, oy, W, H);
  const src = P.cover || (P.images && P.images[2]);
  const image = src ? await loadImage(src) : null;
  if (image) {
    const s = Math.max(W / image.width, H / image.height);
    const iw = image.width * s;
    const ih = image.height * s;
    const fx = P.coverFx == null ? 0.5 : P.coverFx;
    const fy = P.coverFy == null ? 0.5 : P.coverFy;
    c.drawImage(image, ox + (W - iw) * fx, oy + (H - ih) * fy, iw, ih);
  } else {
    DRAW.desktop(c, ox, oy, W, H, P.pal, P);
  }
  c.restore();
}
