/* Écran de chargement : logo, anneau de progression et globe.
   Le globe est le plan de travail lui-même (webgl/), vu de loin : une sphère quadrillée que des bandes
   de couleur (--spectrum-1…4) balaient, comme le nom. À la fin, la caméra plonge vers la sphère jusqu'à
   ce que sa surface devienne l'accueil ; les couleurs s'effacent et les vignettes apparaissent.
   Animations réduites : pas de globe, l'accueil apparaît directement. */
import { $, reducedMotion, ease } from "./utils.js";
import { camera, app } from "./state.js";
import { tween } from "./camera.js";
import { revealText } from "./reveal.js";

/** Durée minimale d'affichage, pour que le globe ait le temps d'apparaître. */
const LOADER_MIN_MS = 2000;
/** Durée de la plongée vers l'accueil. */
const DIVE_MS = 1800;
const loadStart = performance.now();

/** Avance l'anneau de progression (0 → 1). */
export function setLoaderProgress(value) {
  const ring = document.getElementById("ld-fg");
  if (ring) ring.style.strokeDashoffset = String(100 - 100 * value);
}

/** Place le globe sous l'anneau (centre de l'emplacement #ld-globe). */
export function placeGlobe() {
  const slot = $("#ld-globe");
  if (!slot) return;
  const r = slot.getBoundingClientRect();
  camera.globeCenter = [r.left + r.width / 2, r.top + r.height / 2];
  camera.globeRadius = r.width / 2;
  camera.dirty = true;
}

/** Affiche l'écran de chargement (appelé au démarrage). */
export function startLoader() {
  document.body.classList.add("loading");
  setTimeout(() => setLoaderProgress(0.25), 200);
  if (reducedMotion.matches) {
    document.body.classList.add("loading-still");
    return;
  }
  camera.orbit = 1;
  camera.spectrum = 1;
  camera.tiles = 0;
  placeGlobe();
}

/** Plongée : le globe grandit jusqu'à devenir l'accueil. */
function dive() {
  if (reducedMotion.matches) return;
  if (app.view === "project") {
    // arrivée directe sur une étude de cas : pas de plongée, l'accueil est prêt derrière
    camera.orbit = 0;
    camera.spectrum = 0;
    camera.tiles = 1;
    return;
  }
  tween(camera, "orbit", 0, DIVE_MS, ease.inOut);
  tween(camera, "spectrum", 0, DIVE_MS * 1.2, ease.inOut);
  setTimeout(() => tween(camera, "tiles", 1, DIVE_MS * 0.6, ease.out), DIVE_MS * 0.45);
}

/** Termine le chargement (au moins LOADER_MIN_MS après le début). */
export function finishLoader(frame) {
  setLoaderProgress(1);
  const remaining = Math.max(0, LOADER_MIN_MS - (performance.now() - loadStart));
  return new Promise(resolve => setTimeout(resolve, remaining)).then(() => {
    const loader = $("#loader");
    loader.classList.add("done");
    dive();
    setTimeout(
      () => {
        loader.classList.add("out");
        document.body.classList.remove("loading", "loading-still");
        camera.dirty = true;
        revealText(frame, 200);
      },
      reducedMotion.matches ? 0 : DIVE_MS * 0.55,
    );
    setTimeout(() => loader.remove(), DIVE_MS + 400);
  });
}
