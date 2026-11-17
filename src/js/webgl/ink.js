/* Encre : quand la souris bouge sur le plan de travail, elle laisse une traînée de couleur douce
   qui se diffuse puis s'efface. La couleur parcourt le dégradé (--spectrum-1…4) au fil du temps
   et selon la direction du geste. La traînée est peinte dans un petit canvas, envoyé au shader
   comme texture : elle illumine surtout les lignes de la grille. */
import { reducedMotion } from "../utils.js";

const SCALE = 0.25; // résolution du canvas d'encre, × l'écran
const FADE = 0.045; // part de l'encre effacée à chaque image
const RADIUS = 0.09; // rayon d'une touche d'encre, × la plus grande dimension de l'écran

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let stops = [];
let hue = 0;
let energy = 0; // > 0 tant qu'il reste de l'encre visible
const queue = [];
let last = null;

/** Lit le dégradé dans les variables CSS. */
export function readInkColors() {
  const cs = getComputedStyle(document.documentElement);
  stops = [1, 2, 3, 4].map(i => {
    const n = parseInt(cs.getPropertyValue(`--spectrum-${i}`).trim().slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  });
}

function colorAt(f) {
  const x = (((f % 1) + 1) % 1) * stops.length;
  const i = Math.floor(x);
  const t = x - i;
  const a = stops[i];
  const b = stops[(i + 1) % stops.length];
  return [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * t));
}

/** Adapte le canvas à la taille de l'écran. */
export function resizeInk(width, height) {
  canvas.width = Math.max(8, Math.round(width * SCALE));
  canvas.height = Math.max(8, Math.round(height * SCALE));
}

/** Enregistre un déplacement de la souris (coordonnées écran). */
export function inkPointer(x, y) {
  if (reducedMotion.matches) return;
  if (last) {
    const dx = x - last[0];
    const dy = y - last[1];
    const speed = Math.hypot(dx, dy);
    if (speed > 0.5) {
      queue.push([x, y, dx, dy, speed]);
      if (queue.length > 12) queue.shift();
    }
  }
  last = [x, y];
}

/** Oublie la dernière position (sortie de la fenêtre, glisser). */
export function inkLift() {
  last = null;
}

/** Met à jour l'encre ; renvoie true si la texture doit être envoyée au shader. */
export function updateInk(dt) {
  if (!stops.length) readInkColors();
  const hasInput = queue.length > 0;
  if (!hasInput && energy <= 0.002) return false;

  // estompe ce qui est déjà peint
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = `rgba(0,0,0,${FADE})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  energy *= 1 - FADE;

  if (hasInput) {
    ctx.globalCompositeOperation = "lighter";
    const radius = Math.max(canvas.width, canvas.height) * RADIUS;
    for (const [x, y, dx, dy, speed] of queue) {
      // la teinte avance avec le temps et tourne un peu selon la direction du geste
      hue = (hue + 0.0009 * dt + Math.atan2(dy, dx) * 0.0006 + 1) % 1;
      const [r, g, b] = colorAt(hue);
      const strength = Math.min(0.12, 0.02 + speed * 0.0025);
      const gx = x * SCALE;
      const gy = y * SCALE;
      const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
      gradient.addColorStop(0, `rgba(${r},${g},${b},${strength})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
      energy = Math.min(1, energy + strength);
    }
    queue.length = 0;
  }
  return true;
}

export const inkCanvas = canvas;
export const inkActive = () => energy > 0.002;
