/* Caméra du plan de travail : projection écran ↔ monde (sphère vue en biais), position des projets
   sur la grille, et petites animations de valeurs (tweens). */
import { reducedMotion, ease, mod } from "./utils.js";
import { camera, gridCount } from "./state.js";

/* --------------------------------------------------------------- Géométrie */

/** Taille d'une cellule de la grille, en px. */
export const cellSize = () => camera.cell;

/* La grille est posée sur une sphère, vue par une caméra inclinée (comme la surface d'une planète
   vue d'avion) : le bas de l'écran est proche et presque plat, le haut s'éloigne et se courbe.
   - camera.curve : 0 = plan (étude de cas), 0,32 = accueil ; règle à la fois le rayon et l'inclinaison.
   - camera.orbit : 0 = accueil, 1 = globe entier vu de loin (écran de chargement).
   Le même calcul sert au shader (webgl/shaders.js) et à screenToWorld, pour viser juste au clic. */

const HOME_CURVE = 0.32;
const TILT = 0.58; // inclinaison de la caméra à l'accueil, en radians (perspective : le haut s'éloigne)
const RADIUS = 4.2; // rayon de la sphère à l'accueil, × la plus grande dimension de l'écran (grand = presque plat)
const FOCAL = 0.75; // focale, × la plus grande dimension de l'écran

/** Courbure effective (plate si les animations sont réduites). */
export const curveNow = () => (reducedMotion.matches ? 0 : camera.curve);

/** Centre de la vue : milieu de l'écran sous l'en-tête (décalé quand un panneau est ouvert),
    ou centre du globe pendant le chargement. */
export function viewCenter() {
  const home = [camera.W / 2 + camera.shift, camera.headPx + (camera.H - camera.headPx) / 2];
  const o = camera.orbit;
  if (o <= 0) return home;
  const g = camera.globeCenter || [camera.W / 2, camera.H / 2];
  return [home[0] + (g[0] - home[0]) * o, home[1] + (g[1] - home[1]) * o];
}

/** Paramètres de projection : focale, inclinaison, rayon (0 = plan), hauteur de la caméra (px). */
export function projection() {
  const size = Math.max(camera.W, camera.H);
  const k = Math.max(0, curveNow() / HOME_CURVE);
  const o = Math.min(1, Math.max(0, camera.orbit));
  const focal = FOCAL * size;
  const tilt0 = TILT * Math.min(k, 1);
  // grande sphère : les rangées restent lisibles, seuls les coins du haut plongent vers le fond
  const raw = k > 0.001 ? (RADIUS * size) / k : 0;
  // globe vu de loin : rayon ajusté pour que le tour complet tombe juste sur la grille (pas de couture)
  const period = 16 * camera.cell * camera.zoom;
  const snapped = raw > 0 ? (Math.max(1, Math.round((2 * Math.PI * raw) / period)) * period) / (2 * Math.PI) : 0;
  const radius = raw + (snapped - raw) * Math.min(1, camera.orbit * 4);
  let tilt = tilt0;
  tilt *= 1 - o;
  // hauteur pour qu'au centre 1 px d'écran = 1 unité du monde ; de loin, le globe tient dans son emplacement
  const near = focal * Math.cos(tilt);
  let height = near;
  if (o > 0 && radius > 0) {
    const far = (focal * radius) / camera.globeRadius - radius; // le globe tient dans son emplacement
    const e = o * o * (3 - 2 * o);
    height = Math.exp(Math.log(near) + (Math.log(Math.max(far, near)) - Math.log(near)) * e);
  }
  return { focal, tilt, radius, height };
}

/** Rayon issu d'un point de l'écran → point touché sur la grille (unités du monde), ou null (ciel). */
export function screenToWorld(x, y) {
  const [cx, cy] = viewCenter();
  const { focal, tilt, radius, height } = projection();
  const px = x - cx;
  const py = cy - y;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  // direction du rayon : avant (0, sin, -cos) × focale + droite × px + haut (0, cos, sin) × py
  let dx = px;
  let dy = st * focal + ct * py;
  let dz = -ct * focal + st * py;
  const len = Math.hypot(dx, dy, dz);
  dx /= len;
  dy /= len;
  dz /= len;
  let u;
  let v;
  if (radius <= 0) {
    if (dz >= -1e-6) return null;
    const t = -height / dz;
    u = t * dx;
    v = -(t * dy);
  } else {
    const oz = height + radius;
    const b = oz * dz;
    const disc = b * b - (oz * oz - radius * radius);
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    const qx = t * dx;
    const qy = t * dy;
    const qz = oz + t * dz;
    u = Math.atan2(qx, qz) * radius;
    v = -Math.asin(Math.max(-1, Math.min(1, qy / radius))) * radius;
  }
  return [u / camera.zoom + camera.off[0], v / camera.zoom + camera.off[1]];
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
