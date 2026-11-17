/* Caméra du plan de travail : passage écran ↔ monde (avec la courbure), position des projets
   sur la grille, et petites animations de valeurs (tweens). */
import { reducedMotion, ease, mod } from "./utils.js";
import { camera, gridCount } from "./state.js";

/* --------------------------------------------------------------- Géométrie */

/** Taille d'une cellule de la grille, en px. */
export const cellSize = () => camera.cell;

/** Centre de la vue : milieu de l'écran sous l'en-tête, décalé quand un panneau est ouvert. */
export const viewCenter = () => [camera.W / 2 + camera.shift, camera.headPx + (camera.H - camera.headPx) / 2];

/** Rayon de référence de la courbure. */
export const viewRadius = () => Math.max(camera.W, camera.H) * 0.5;

/** Courbure effective (plate si les animations sont réduites). */
export const curveNow = () => (reducedMotion.matches ? 0 : camera.curve);

function warp(qx, qy) {
  const k = 1 + curveNow() * (qx * qx + qy * qy);
  return [qx * k, qy * k];
}

/** Point de l'écran → point du monde. */
export function screenToWorld(x, y) {
  const [cx, cy] = viewCenter();
  const r = viewRadius();
  const [dx, dy] = warp((x - cx) / r, (y - cy) / r);
  return [(dx * r) / camera.zoom + camera.off[0], (dy * r) / camera.zoom + camera.off[1]];
}

/* Les projets sont posés en clusters de 4 × 2 cellules, sur une période de 6 × 4 cellules ;
   une rangée sur deux est décalée de 3 cellules. Le projet d'un cluster = (cx + 2·cy) mod n. */

/** Cluster (et projet) sous un point du monde, ou null entre deux clusters. */
export function clusterAt(wx, wy) {
  const c = cellSize();
  const cy = Math.floor(wy / (4 * c));
  const xo = mod(cy, 2) * 3 * c;
  const cx = Math.floor((wx - xo) / (6 * c));
  const lx = wx - (cx * 6 * c + xo) - c;
  const ly = wy - cy * 4 * c - c;
  if (lx < 0 || lx > 4 * c || ly < 0 || ly > 2 * c) return null;
  return { cx, cy, id: mod(cx + cy * 2, gridCount) };
}

/** Centre d'un cluster, en unités monde. */
export function clusterCenter(cx, cy) {
  const c = cellSize();
  return [cx * 6 * c + mod(cy, 2) * 3 * c + 3 * c, cy * 4 * c + 2 * c];
}

/** Cluster le plus proche de la vue qui affiche le projet id. */
export function nearestCluster(id) {
  const c = cellSize();
  let best = null;
  let bestDist = Infinity;
  const ccy = Math.round((camera.off[1] - 2 * c) / (4 * c));
  for (let cy = ccy - 6; cy <= ccy + 6; cy++) {
    const xo = mod(cy, 2) * 3 * c;
    const ccx = Math.round((camera.off[0] - xo - 3 * c) / (6 * c));
    for (let cx = ccx - 8; cx <= ccx + 8; cx++) {
      if (mod(cx + cy * 2, gridCount) !== id) continue;
      const [x, y] = clusterCenter(cx, cy);
      const dist = Math.hypot(x - camera.off[0], y - camera.off[1]);
      if (dist < bestDist) {
        bestDist = dist;
        best = { cx, cy };
      }
    }
  }
  return best;
}

/* ------------------------------------------------------------------ Tweens */

const tweens = [];

/** Anime obj[key] (nombre ou tableau de nombres) jusqu'à `to` en `duration` ms. Instantané si animations réduites. */
export function tween(obj, key, to, duration, curve = ease.inOut) {
  return new Promise(resolve => {
    for (let i = tweens.length - 1; i >= 0; i--) {
      if (tweens[i].obj === obj && tweens[i].key === key) tweens.splice(i, 1);
    }
    const from = Array.isArray(obj[key]) ? obj[key].slice() : obj[key];
    if (reducedMotion.matches || duration <= 0) {
      obj[key] = Array.isArray(to) ? to.slice() : to;
      camera.dirty = true;
      return resolve();
    }
    tweens.push({ obj, key, from, to, duration, curve, start: performance.now(), resolve });
  });
}

/** Avance tous les tweens en cours (appelé à chaque image). */
export function stepTweens(now) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i];
    const progress = Math.min(1, (now - t.start) / t.duration);
    const e = t.curve(progress);
    t.obj[t.key] = Array.isArray(t.from) ? t.from.map((v, k) => v + (t.to[k] - v) * e) : t.from + (t.to - t.from) * e;
    camera.dirty = true;
    if (progress >= 1) {
      tweens.splice(i, 1);
      t.resolve();
    }
  }
}

/** Un tween est-il en cours sur cette propriété ? */
export const isTweening = key => tweens.some(t => t.key === key);
