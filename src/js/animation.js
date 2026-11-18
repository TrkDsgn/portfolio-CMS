/* Boucle d'animation du plan de travail : dérive automatique, inertie, molette en douceur,
   séparation des couleurs selon la vitesse. Le canvas n'est redessiné que si quelque chose a bougé. */
import { $, reducedMotion, mobileQuery } from "./utils.js";
import { camera, app, dom } from "./state.js";
import { stepTweens, isTweening } from "./camera.js";
import { render, stepInk } from "./webgl/renderer.js";

/** Vitesse de la dérive automatique de l'accueil, en px/s. */
const DRIFT = 16;
/** Glissement après un lâcher : part de la vitesse conservée à chaque image (plus proche de 1 = plus long). */
const INERTIA = 0.94;
let lastNow = 0;

const readoutLeft = $("#ro-l");
const readoutRight = $("#ro-r");

/** Met à jour ce qui, dans le DOM, suit la caméra : coordonnées affichées, bandeau décalé avec les panneaux. */
export function updateDom() {
  readoutLeft.textContent = (camera.off[0] / 1000).toFixed(6);
  readoutRight.textContent = (-camera.off[1] / 1000).toFixed(6);
  dom.ticker.style.marginLeft = mobileQuery.matches ? "" : camera.shift + "px";
}

function frame(now) {
  const dt = Math.min(64, now - (lastNow || now));
  lastNow = now;
  camera.time += dt / 1000;
  stepTweens(now);
  // globe du chargement : les couleurs défilent en continu
  if (camera.spectrum > 0) camera.dirty = true;
  // traînée de couleur de la souris
  if (stepInk(dt)) camera.dirty = true;

  // Dérive lente quand personne n'interagit
  const still = Math.abs(camera.vel[0]) + Math.abs(camera.vel[1]) < 0.5;
  if (app.view !== "project" && !app.dragging && app.hoverId === -1 && !reducedMotion.matches && still) {
    // vu de loin (chargement), le globe tourne nettement plus vite
    camera.off[0] += (DRIFT * (1 + 40 * camera.orbit) * dt) / 1000 / camera.zoom;
    camera.dirty = true;
  }

  // Molette : la caméra rejoint sa cible en douceur
  if (camera.target) {
    if (app.dragging || isTweening("off")) {
      camera.target = null;
    } else {
      camera.off[0] += (camera.target[0] - camera.off[0]) * 0.3;
      camera.off[1] += (camera.target[1] - camera.off[1]) * 0.3;
      camera.dirty = true;
      const remaining = Math.abs(camera.target[0] - camera.off[0]) + Math.abs(camera.target[1] - camera.off[1]);
      if (remaining < 0.3) camera.target = null;
    }
  }

  // Inertie après un glisser
  if (!app.dragging && (Math.abs(camera.vel[0]) > 0.02 || Math.abs(camera.vel[1]) > 0.02)) {
    camera.off[0] += camera.vel[0];
    camera.off[1] += camera.vel[1];
    camera.vel[0] *= INERTIA;
    camera.vel[1] *= INERTIA;
    camera.dirty = true;
  }

  // Séparation des couleurs proportionnelle à la vitesse
  const mx = camera.off[0] - camera.prev[0];
  const my = camera.off[1] - camera.prev[1];
  camera.prev = camera.off.slice();
  const speed = Math.hypot(mx, my) * (16 / Math.max(dt, 1)) * camera.zoom;
  const target = app.view === "project" || camera.orbit > 0 ? 0 : Math.min(1, Math.max(0, (speed - 3) / 32));
  camera.aberration += (target - camera.aberration) * (target > camera.aberration ? 0.3 : 0.08);
  if (speed > 0.5) {
    const length = Math.hypot(mx, my) || 1;
    camera.dir = [mx / length, my / length];
  }
  if (camera.aberration > 0.002) camera.dirty = true;

  if (camera.dirty) {
    render();
    updateDom();
    camera.dirty = false;
  }
  requestAnimationFrame(frame);
}

/** Démarre la boucle. */
export function startAnimation() {
  requestAnimationFrame(frame);
}
