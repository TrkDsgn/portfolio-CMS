/* Point d'entrée du portfolio.
   Pas d'écran de chargement : le titre et l'en-tête sont lisibles tout de suite ;
   seul le plan de travail apparaît en fondu, une fois ses vignettes prêtes.

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

document.body.classList.add("loading");
fillPage();
revealText(dom.frame, 0);
revealText($("#intro"), 120);

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
new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
reducedMotion.addEventListener("change", () => (camera.dirty = true));

initInput();
initRouter();
initContact();
startLoopClock();

fontsReady()
  .then(() => {
    resize();
    return webglOk ? buildAtlas() : showFallback();
  })
  .then(() => {
    document.body.classList.remove("loading");
    camera.dirty = true;
  });

if (webglOk) startAnimation();
else updateDom();
go();
