/* Écran de chargement, comme une mise au point : le nom s'allume lettre par lettre au-dessus d'un petit
   globe gris au maillage fin. La couleur (--spectrum-1…4) se répand depuis le centre du globe, puis la
   caméra plonge vers la sphère jusqu'à ce que sa surface devienne l'accueil ; les couleurs s'effacent
   et les vignettes apparaissent. Le globe est le plan de travail lui-même (webgl/), vu de loin.
   Animations réduites : pas de globe, l'accueil apparaît directement. */
import { $, reducedMotion, ease } from "./utils.js";
import { camera, app } from "./state.js";
import { tween } from "./camera.js";
import { revealText } from "./reveal.js";

/** Durée minimale d'affichage : le temps que la couleur couvre le globe. */
const LOADER_MIN_MS = 3600;
/** Début et durée de l'extension de la couleur sur le globe. */
const PAINT_DELAY_MS = 500;
const PAINT_MS = 2800;
/** Durée de la plongée vers l'accueil. */
const DIVE_MS = 2000;
const loadStart = performance.now();

/** Découpe le nom en lettres, chacune avec sa couleur du dégradé et son rang d'allumage. */
function splitName() {
  const name = $("#ld-name");
  if (!name) return;
  const cs = getComputedStyle(document.documentElement);
  const stops = [1, 2, 3, 4].map(i => cs.getPropertyValue(`--spectrum-${i}`).trim());
  const letters = [...name.textContent];
  name.setAttribute("aria-label", name.textContent);
  name.textContent = "";
  letters.forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.setAttribute("aria-hidden", "true");
    // couleur : on parcourt les 3 premières couleurs du dégradé de gauche à droite
    const f = (i / Math.max(1, letters.length - 1)) * 2;
    const k = Math.min(1, Math.floor(f));
    span.style.setProperty(
      "--c",
      `color-mix(in srgb, ${stops[k]} ${Math.round((1 - (f - k)) * 100)}%, ${stops[k + 1]})`,
    );
    span.style.setProperty("--i", i);
    name.appendChild(span);
  });
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
  splitName();
  if (reducedMotion.matches) {
    document.body.classList.add("loading-still");
    return;
  }
  camera.orbit = 1;
  camera.spectrum = 1;
  camera.paint = 0;
  camera.tiles = 0;
  placeGlobe();
  // la couleur se répand depuis le centre du globe
  setTimeout(() => tween(camera, "paint", 1, PAINT_MS, ease.inOut), PAINT_DELAY_MS);
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
  camera.paint = 1;
  tween(camera, "orbit", 0, DIVE_MS, ease.inOut);
  // la grille arrive encore colorée, puis redevient grise
  setTimeout(() => tween(camera, "spectrum", 0, DIVE_MS * 0.9, ease.inOut), DIVE_MS * 0.5);
  setTimeout(() => tween(camera, "tiles", 1, DIVE_MS * 0.5, ease.out), DIVE_MS * 0.55);
}

/** Termine le chargement (au moins LOADER_MIN_MS après le début). */
export function finishLoader(frame) {
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
