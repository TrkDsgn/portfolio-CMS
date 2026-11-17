/* Mockups animés : l'app qui tourne dans un téléphone. draw(ctx, W, H, p, A). */
import { seg, lerp, io, out, rr } from "./shared.js";

const ok = im => im && im.width;
function contain(c, im, x, y, w, h) {
  if (!ok(im)) return;
  const s = Math.min(w / im.width, h / im.height);
  c.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s);
}

/* icônes génériques du dock (aucune marque) */
function glyph(c, k, kind, x, y, s) {
  c.save();
  c.translate(x, y);
  c.strokeStyle = "#fff";
  c.fillStyle = "#fff";
  c.lineWidth = s * 0.07;
  c.lineCap = c.lineJoin = "round";
  if (kind === "chat") {
    rr(c, -s * 0.3, -s * 0.24, s * 0.6, s * 0.42, s * 0.12);
    c.stroke();
    c.beginPath();
    c.moveTo(-s * 0.12, s * 0.18);
    c.lineTo(-s * 0.2, s * 0.3);
    c.lineTo(0, s * 0.18);
    c.stroke();
  }
  if (kind === "photo") {
    rr(c, -s * 0.3, -s * 0.22, s * 0.6, s * 0.44, s * 0.08);
    c.stroke();
    c.beginPath();
    c.arc(0, 0, s * 0.12, 0, 7);
    c.stroke();
  }
  if (kind === "pin") {
    c.beginPath();
    c.arc(0, -s * 0.06, s * 0.2, Math.PI * 0.85, Math.PI * 2.15);
    c.lineTo(0, s * 0.3);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.arc(0, -s * 0.06, s * 0.07, 0, 7);
    c.fill();
  }
  if (kind === "music") {
    c.beginPath();
    c.moveTo(-s * 0.08, s * 0.2);
    c.lineTo(-s * 0.08, -s * 0.26);
    c.lineTo(s * 0.22, -s * 0.32);
    c.lineTo(s * 0.22, s * 0.14);
    c.stroke();
    c.beginPath();
    c.arc(-s * 0.16, s * 0.2, s * 0.09, 0, 7);
    c.arc(s * 0.14, s * 0.14, s * 0.09, 0, 7);
    c.fill();
  }
  c.restore();
}

function phone(c, k, x, y, w, h, screens, p, cfg, A) {
  /* cadre */
  c.save();
  c.shadowColor = "rgba(20,20,30,.22)";
  c.shadowBlur = 50 * k;
  c.shadowOffsetY = 24 * k;
  rr(c, x * k, y * k, w * k, h * k, 62 * k);
  c.fillStyle = "#1B1B1F";
  c.fill();
  c.restore();
  rr(c, (x + 3) * k, (y + 3) * k, (w - 6) * k, (h - 6) * k, 59 * k);
  c.strokeStyle = "#5A5A60";
  c.lineWidth = 2 * k;
  c.stroke();
  const sx = x + 14,
    sy = y + 14,
    sw = w - 28,
    sh = h - 28;
  c.save();
  rr(c, sx * k, sy * k, sw * k, sh * k, 48 * k);
  c.clip();
  c.fillStyle = cfg.screenBg;
  c.fillRect(sx * k, sy * k, sw * k, sh * k);
  const bar = 54,
    vy = sy + bar,
    vh = sh - bar;
  /* écrans : chacun a sa fenêtre de temps, glisse vers la gauche pour laisser place au suivant */
  const n = screens.length,
    start = 0.1,
    slot = (1 - start - 0.06) / n;
  const launch = out(seg(p, 0.04, 0.12));
  screens.forEach((key, i) => {
    const im = A[key];
    if (!ok(im)) return;
    const t0 = start + i * slot,
      enter = i === 0 ? launch : io(seg(p, t0 - 0.05, t0)),
      leave = i === n - 1 ? io(seg(p, 0.94, 1)) : io(seg(p, t0 + slot - 0.05, t0 + slot));
    if (enter <= 0 || leave >= 1) return;
    const dx = i === 0 ? 0 : (1 - enter) * sw,
      dxl = -leave * sw * 0.35;
    const s = sw / im.width,
      ih = im.height * s,
      scroll = Math.max(0, ih - vh) * io(seg(p, t0 + slot * 0.15, t0 + slot * 0.8));
    c.save();
    c.beginPath();
    c.rect(sx * k, vy * k, sw * k, vh * k);
    c.clip();
    const sc = i === 0 ? lerp(0.86, 1, launch) : 1,
      a = i === 0 ? launch : 1;
    c.globalAlpha = a * (1 - leave * 0.5);
    c.translate((sx + sw / 2 + dx + dxl) * k, (vy + vh / 2) * k);
    c.scale(sc, sc);
    c.translate(-(sx + sw / 2) * k, -(vy + vh / 2) * k);
    c.fillStyle = cfg.screenBg;
    c.fillRect(sx * k, vy * k, sw * k, vh * k);
    c.drawImage(im, sx * k, (vy - scroll) * k, sw * k, ih * k);
    c.restore();
  });
  /* barre d'état + île */
  c.fillStyle = cfg.screenBg;
  c.globalAlpha = 1;
  c.fillRect(sx * k, sy * k, sw * k, bar * k);
  c.fillStyle = "#111";
  c.font = `600 ${21 * k}px -apple-system, "Inter Tight", system-ui, sans-serif`;
  c.textBaseline = "middle";
  c.fillText("9:41", (sx + 40) * k, (sy + 30) * k);
  for (let b = 0; b < 4; b++) {
    c.fillRect((sx + sw - 104 + b * 8) * k, (sy + 34 - b * 4) * k, 5 * k, (6 + b * 4) * k);
  }
  rr(c, (sx + sw - 62) * k, (sy + 22) * k, 32 * k, 15 * k, 4 * k);
  c.lineWidth = 2 * k;
  c.strokeStyle = "#111";
  c.stroke();
  c.fillRect((sx + sw - 59) * k, (sy + 25) * k, 24 * k, 9 * k);
  rr(c, (sx + sw / 2 - 62) * k, (sy + 12) * k, 124 * k, 36 * k, 18 * k);
  c.fillStyle = "#0A0A0C";
  c.fill();
  c.restore();
  c.textBaseline = "alphabetic";
}

function mockup(cfg) {
  return function (c, W, H, p, A) {
    const k = W / 1600,
      DH = H / k;
    c.fillStyle = cfg.panelBg;
    c.fillRect(0, 0, W, H);
    const pad = 40,
      pw = 1600 - 2 * pad,
      ph = DH - 2 * pad;
    /* un seul panneau : le téléphone qui défile, sortant du bas du cadre */
    rr(c, pad * k, pad * k, pw * k, ph * k, 44 * k);
    c.fillStyle = cfg.panel;
    c.fill();
    /* téléphone */
    const fw = Math.min(520, (ph - 20) / 1.9),
      fh = fw * 2.05,
      fx = pad + (pw - fw) / 2,
      fy = pad + 60;
    c.save();
    c.beginPath();
    rr(c, pad * k, pad * k, pw * k, ph * k, 44 * k);
    c.clip();
    phone(c, k, fx, fy, fw, fh, cfg.screens, p, cfg, A);
    c.restore();
  };
}

/* Kioui */
const KF = '"Montserrat Alternates", "Inter Tight", system-ui, sans-serif';
const kioui = mockup({
  screenBg: "#FEFDFB",
  panel: "#DBDF0D",
  panelBg: "#FAF1E5",
  iconBg: "#DBDF0D",
  screens: ["m_k_home", "m_k_recipe", "m_k_profile"],
  icon(c, k, x, y, s, A) {
    contain(c, A.k_logo, (x + s * 0.12) * k, (y + s * 0.3) * k, s * 0.76 * k, s * 0.4 * k);
  },
  widget(c, k, x, y, w, h, p, A) {
    c.fillStyle = "#DBDF0D";
    c.fillRect(x * k, y * k, w * k, h * k);
    c.fillStyle = "rgba(255,255,255,.22)";
    c.beginPath();
    c.arc((x + w * 0.82) * k, (y + h * 1.05) * k, h * 0.75 * k, 0, 7);
    c.fill();
    c.fillStyle = "#1B1820";
    c.font = `600 ${30 * k}px ${KF}`;
    c.fillText("CO₂ évité ce mois", (x + 40) * k, (y + 62) * k);
    const v = (1.2 * io(seg(p, 0.05, 0.3))).toFixed(1).replace(".", ",");
    c.font = `700 ${92 * k}px ${KF}`;
    c.fillText(v, (x + 40) * k, (y + h * 0.62) * k);
    const vw = c.measureText(v).width / k;
    c.font = `600 ${40 * k}px ${KF}`;
    c.fillText(" kg", (x + 40 + vw) * k, (y + h * 0.62) * k);
    const pts = Math.round(lerp(237, 637, io(seg(p, 0.3, 0.55))));
    rr(c, (x + 40) * k, (y + h - 100) * k, 250 * k, 64 * k, 32 * k);
    c.fillStyle = "#1B1820";
    c.fill();
    c.fillStyle = "#fff";
    c.font = `600 ${26 * k}px ${KF}`;
    c.textBaseline = "middle";
    c.fillText(pts + " points", (x + 68) * k, (y + h - 67) * k);
    c.textBaseline = "alphabetic";
    c.strokeStyle = "rgba(27,24,32,.85)";
    c.lineWidth = 5 * k;
    c.save();
    c.translate((x + w - 120) * k, (y + 110) * k);
    c.beginPath();
    c.moveTo(-34 * k, 34 * k);
    c.quadraticCurveTo(-38 * k, -34 * k, 38 * k, -38 * k);
    c.quadraticCurveTo(34 * k, 34 * k, -34 * k, 34 * k);
    c.moveTo(-34 * k, 34 * k);
    c.lineTo(8 * k, -4 * k);
    c.stroke();
    c.restore();
  },
});

/* LACES */
const LF = '"Outfit", "Inter Tight", system-ui, sans-serif';
const laces = mockup({
  screenBg: "#FBFAF8",
  panel: "#CFF59D",
  panelBg: "#FBFAF8",
  iconBg: "#2F2B3B",
  screens: ["m_l_splash", "m_l_home", "m_l_product"],
  icon(c, k, x, y, s, A) {
    contain(c, A.l_logo, (x + s * 0.1) * k, (y + s * 0.3) * k, s * 0.8 * k, s * 0.4 * k);
  },
  widget(c, k, x, y, w, h, p, A) {
    c.fillStyle = "#CFF59D";
    c.fillRect(x * k, y * k, w * k, h * k);
    c.strokeStyle = "rgba(255,255,255,.45)";
    c.lineWidth = 26 * k;
    c.beginPath();
    c.arc((x + w * 0.7) * k, (y + h * 1.2) * k, h * 0.8 * k, 0, 7);
    c.stroke();
    c.beginPath();
    c.arc((x + w * 0.25) * k, (y + h * 1.35) * k, h * 0.6 * k, 0, 7);
    c.stroke();
    c.fillStyle = "#2F2B3B";
    c.font = `500 ${32 * k}px ${LF}`;
    c.fillText("Vos points", (x + 40) * k, (y + 62) * k);
    const v = Math.round(350 * io(seg(p, 0.05, 0.3)));
    c.font = `600 ${96 * k}px ${LF}`;
    c.fillText(String(v), (x + 40) * k, (y + h * 0.6) * k);
    const vw = c.measureText(String(v)).width / k;
    c.font = `500 ${30 * k}px ${LF}`;
    c.fillText("  pts", (x + 40 + vw) * k, (y + h * 0.6 - 40) * k);
    const bw = (w - 100) / 2,
      by = y + h - 104;
    rr(c, (x + 40) * k, by * k, bw * k, 68 * k, 34 * k);
    c.fillStyle = "#fff";
    c.fill();
    rr(c, (x + 60 + bw) * k, by * k, bw * k, 68 * k, 34 * k);
    c.fillStyle = "#2F2B3B";
    c.fill();
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `500 ${28 * k}px ${LF}`;
    c.fillStyle = "#2F2B3B";
    c.fillText("Acheter", (x + 40 + bw / 2) * k, (by + 35) * k);
    c.fillStyle = "#fff";
    c.fillText("Échanger  ⇄", (x + 60 + bw * 1.5) * k, (by + 35) * k);
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    rr(c, (x + w - 92) * k, (y + 26) * k, 64 * k, 64 * k, 32 * k);
    c.fillStyle = "#fff";
    c.fill();
    c.strokeStyle = "#2F2B3B";
    c.lineWidth = 3 * k;
    c.beginPath();
    c.moveTo((x + w - 60) * k, (y + 44) * k);
    c.lineTo((x + w - 60) * k, (y + 72) * k);
    c.moveTo((x + w - 74) * k, (y + 58) * k);
    c.lineTo((x + w - 46) * k, (y + 58) * k);
    c.stroke();
  },
});

export default {
  m_kioui: {
    hd: true,
    draw: kioui,
    ratio: 1.5,
    dur: 12000,
    still: 0.2,
    label: "Mockup Kioui : l'app qui défile dans un téléphone (accueil, recette, profil)",
  },
  m_laces: {
    hd: true,
    draw: laces,
    ratio: 1.5,
    dur: 12000,
    still: 0.4,
    label: "Mockup LACES : l'app qui défile dans un téléphone (ouverture, accueil, fiche produit)",
  },
};
