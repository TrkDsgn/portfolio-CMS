/* Petits outils partagés : sélecteurs DOM, échappement HTML, préférences du système, courbes, images. */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const HTML_ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
/** Échappe un texte avant de l'insérer dans du HTML. */
export const esc = value => String(value).replace(/[&<>"]/g, ch => HTML_ENTITIES[ch]);

/** Réglage système « réduire les animations ». */
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
/** Écran mobile (même seuil que le CSS). */
export const mobileQuery = matchMedia("(max-width:799.98px)");

/** Courbes d'animation (t de 0 à 1). */
export const ease = {
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 4),
};

/** Modulo toujours positif. */
export const mod = (a, n) => ((a % n) + n) % n;

const imageCache = {};
/** Charge une image une seule fois ; la promesse donne l'image, ou null en cas d'erreur. */
export function loadImage(src) {
  if (!imageCache[src]) {
    imageCache[src] = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }
  return imageCache[src];
}
