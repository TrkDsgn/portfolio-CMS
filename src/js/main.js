/* Point d'entrée du portfolio.

   Organisation :
     content.js          contenu du CMS          state.js     état partagé (caméra, vue, éléments)
     page.js             remplissage des textes  camera.js    géométrie de la grille, tweens
     webgl/              rendu du plan de travail animation.js boucle d'animation
     input.js            souris, doigt, clavier  router.js    navigation (#about, #projet-…)
     project/            étude de cas, galerie   reveal.js    apparition des textes
     loops/              animations des projets  contact.js   formulaire
     fallback.js         repli sans WebGL */
import { $, reducedMotion } from "./utils.js";
import { camera, app, dom } from "./state.js";
import { cellSize } from "./camera.js";
import { fillPage } from "./page.js";
import { initGL, buildAtlas, readColors, resize } from "./webgl/renderer.js";
import { startAnimation, updateDom } from "./animation.js";
import { initInput } from "./input.js";
import { initRouter, go, panelShift } from "./router.js";
import { revealText } from "./reveal.js";
import { startLoopClock } from "./project/gallery.js";
import { initContact } from "./contact.js";
import { showFallback } from "./fallback.js";

/** Attend les polices (2,5 s au plus) : les couvertures dessinées en canvas en ont besoin. */
function fontsReady() {
  if (!document.fonts || !document.fonts.ready) return Promise.resolve();
  const timeout = new Promise(resolve => setTimeout(resolve, 2500));
  const faces = ['600 1em "Bricolage Grotesque"', '400 1em "Inter Tight"', '500 1em "Roboto Mono"'];
  return Promise.race([document.fonts.ready, timeout]).then(() =>
    Promise.all(faces.map(face => document.fonts.load(face).catch(() => {}))),
  );
}

/* Écran de chargement : l'anneau progresse (polices, puis vignettes), reste affiché au moins 1,7 s,
   puis s'efface ; le plan de travail et l'en-tête apparaissent en fondu. */
const LOADER_MIN_MS = 1700;
const loadStart = performance.now();
function setLoaderProgress(value) {
  const ring = document.getElementById("ld-fg");
  if (ring) ring.style.strokeDashoffset = String(100 - 100 * value);
}
function hideLoader() {
  const loader = $("#loader");
  loader.classList.add("done");
  setTimeout(
    () => {
      loader.classList.add("out");
      document.body.classList.remove("loading");
      camera.dirty = true;
      revealText(dom.frame, 200);
    },
    reducedMotion.matches ? 0 : 650,
  );
  setTimeout(() => loader.remove(), 2000);
}

document.body.classList.add("loading");
setTimeout(() => setLoaderProgress(0.25), 200);
fillPage();

let webglOk = false;
try {
  webglOk = initGL();
} catch (err) {
  console.warn(err);
}
resize();
readColors();
camera.off = [3 * cellSize(), 0.1 * cellSize()];
camera.prev = camera.off.slice();

addEventListener("resize", () => {
  resize();
  camera.shift = panelShift(app.view);
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
new MutationObserver(readColors).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
reducedMotion.addEventListener("change", () => (camera.dirty = true));

initInput();
initRouter();
initContact();
startLoopClock();

fontsReady()
  .then(() => {
    resize();
    setLoaderProgress(0.55);
    return webglOk ? buildAtlas() : showFallback();
  })
  .then(() => {
    setLoaderProgress(1);
    const remaining = Math.max(0, LOADER_MIN_MS - (performance.now() - loadStart));
    return new Promise(resolve => setTimeout(resolve, remaining));
  })
  .then(hideLoader);

if (webglOk) startAnimation();
else updateDom();
go();
