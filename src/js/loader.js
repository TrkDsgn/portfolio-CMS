/* Écran de chargement : logo, anneau de progression et globe en fil de fer.
   Des bandes de couleur (vert, bleu, violet, crème) balaient le globe et le nom ;
   à la fin, le globe grossit et s'efface pendant que la caméra plonge dans le plan de travail. */
import { $, reducedMotion, ease } from "./utils.js";
import { camera, app } from "./state.js";
import { tween } from "./camera.js";
import { revealText } from "./reveal.js";

/** Durée minimale d'affichage, pour que le globe ait le temps d'apparaître. */
const LOADER_MIN_MS = 2000;
const loadStart = performance.now();

/* ------------------------------------------------------------------ Couleurs */

/** Lit le dégradé dans les variables CSS --spectrum-1 … --spectrum-4 (tokens.css). */
function readSpectrum() {
  const cs = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4].map(i => {
    const hex = cs.getPropertyValue(`--spectrum-${i}`).trim();
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  });
}

/** Couleur du dégradé cyclique à la position f (0 → 1). */
function spectrumAt(stops, f) {
  const x = (((f % 1) + 1) % 1) * stops.length;
  const i = Math.floor(x);
  const t = x - i;
  const a = stops[i];
  const b = stops[(i + 1) % stops.length];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* --------------------------------------------------------------------- Globe */

const MERIDIANS = 24;
const PARALLELS = 13;
const STEPS = 48; // points par ligne
const TILT = 0.38; // inclinaison de l'axe, en radians
const SPIN = 0.55; // vitesse de rotation, en radians par seconde
const SWEEP = 0.28; // vitesse de défilement des couleurs, en tours par seconde

/** Lignes du globe en coordonnées 3D (sphère de rayon 1). */
function sphereLines() {
  const lines = [];
  for (let m = 0; m < MERIDIANS; m++) {
    const lon = (m / MERIDIANS) * Math.PI * 2;
    const pts = [];
    for (let s = 0; s <= STEPS; s++) {
      const lat = -Math.PI / 2 + (s / STEPS) * Math.PI;
      pts.push([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]);
    }
    lines.push(pts);
  }
  for (let p = 1; p <= PARALLELS; p++) {
    const lat = -Math.PI / 2 + (p / (PARALLELS + 1)) * Math.PI;
    const pts = [];
    for (let s = 0; s <= STEPS * 2; s++) {
      const lon = (s / (STEPS * 2)) * Math.PI * 2;
      pts.push([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]);
    }
    lines.push(pts);
  }
  return lines;
}

function drawGlobe(ctx, size, time, stops, lines) {
  ctx.clearRect(0, 0, size, size);
  const grow = reducedMotion.matches ? 1 : 0.55 + 0.45 * ease.out(Math.min(1, time / 1.8));
  const radius = size * 0.44 * grow;
  const cx = size / 2;
  const cy = size / 2;
  const spin = reducedMotion.matches ? 0.6 : time * SPIN;
  const sweep = reducedMotion.matches ? 0 : time * SWEEP;
  const cosY = Math.cos(spin);
  const sinY = Math.sin(spin);
  const cosX = Math.cos(TILT);
  const sinX = Math.sin(TILT);
  ctx.lineWidth = Math.max(1, size / 260);
  // le globe sort du noir entre 0,3 et 1,2 s
  const appear = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, (time - 0.3) / 0.9));

  for (const pts of lines) {
    let prev = null;
    for (const [x, y, z] of pts) {
      // rotation autour de l'axe vertical, puis inclinaison
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const point = [cx + x1 * radius, cy - y2 * radius, z2, y2];
      if (prev) {
        const depth = (prev[2] + point[2]) / 2; // > 0 : face avant
        const [r, g, b] = spectrumAt(stops, (1 - (prev[3] + point[3]) / 2) * 0.5 + sweep);
        const alpha = depth > 0 ? 0.35 + 0.6 * depth : 0.12 + 0.08 * (1 + depth);
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha * appear})`;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(point[0], point[1]);
        ctx.stroke();
      }
      prev = point;
    }
  }
}

/** Fait tourner le globe tant que l'écran de chargement est là. Renvoie une fonction d'arrêt. */
function startGlobe() {
  const canvas = $("#ld-globe");
  if (!canvas) return () => {};
  const density = Math.min(devicePixelRatio || 1, 2);
  const size = Math.round(canvas.getBoundingClientRect().width * density) || 320;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const stops = readSpectrum();
  const lines = sphereLines();
  let running = true;
  const frame = now => {
    if (!running) return;
    drawGlobe(ctx, size, (now - loadStart) / 1000, stops, lines);
    if (!reducedMotion.matches) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => (running = false);
}

/* ------------------------------------------------------------------- Écran */

let stopGlobe = () => {};

/** Avance l'anneau de progression (0 → 1). */
export function setLoaderProgress(value) {
  const ring = document.getElementById("ld-fg");
  if (ring) ring.style.strokeDashoffset = String(100 - 100 * value);
}

/** Affiche l'écran de chargement (appelé au démarrage). */
export function startLoader() {
  document.body.classList.add("loading");
  setTimeout(() => setLoaderProgress(0.25), 200);
  stopGlobe = startGlobe();
}

/** Plongée : la grille part très courbée et de loin, ses lignes teintées, puis se pose. */
function diveIntoGrid() {
  if (reducedMotion.matches || app.view === "project") return;
  camera.curve = 0.95;
  camera.zoom = 0.62;
  camera.lineTint = 1;
  tween(camera, "curve", 0.32, 1500, ease.out);
  tween(camera, "zoom", 1, 1500, ease.out);
  tween(camera, "lineTint", 0, 2200, ease.inOut);
}

/** Termine le chargement (au moins LOADER_MIN_MS après le début). */
export function finishLoader(frame) {
  setLoaderProgress(1);
  const remaining = Math.max(0, LOADER_MIN_MS - (performance.now() - loadStart));
  return new Promise(resolve => setTimeout(resolve, remaining)).then(() => {
    const loader = $("#loader");
    loader.classList.add("done");
    setTimeout(
      () => {
        loader.classList.add("out");
        document.body.classList.remove("loading");
        diveIntoGrid();
        camera.dirty = true;
        revealText(frame, 200);
      },
      reducedMotion.matches ? 0 : 650,
    );
    setTimeout(() => {
      stopGlobe();
      loader.remove();
    }, 2000);
  });
}
