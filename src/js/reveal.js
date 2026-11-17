/* Apparition des textes : chaque texte est découpé en mots, et chaque mot glisse hors d'un masque.
   Titres et libellés courts : mot par mot. Paragraphes : ligne par ligne.
   Rien ne se passe si les animations sont réduites (le texte est déjà visible). */
import { $$, reducedMotion } from "./utils.js";

export const EASE_FLY = "cubic-bezier(.16,1,.3,1)";
export const EASE_RISE = "cubic-bezier(.22,1,.36,1)";

/** Éléments de texte animés. */
const TEXT_SELECTOR = [
  ".t-display",
  "h1",
  "h2",
  ".t-body",
  ".t-label",
  ".t-micro",
  ".steps b",
  ".steps span",
  ".kpi .v",
  ".kpi .k",
  ".rules li",
  ".f-nav a",
  ".f-tag",
  ".f-logo .name",
  ".f-right .row1 a",
  ".f-right .btn",
  ".m-nav a",
  ".c-links dt",
  ".c-links dd",
].join(", ");
const BIG_SELECTOR = ".t-display, h1, h2, .kpi .v, .f-logo .name";

/** Enveloppe chaque mot de el dans <span class="w"><span class="wi">mot</span></span>. */
function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  const walk = node => {
    // Dans un conteneur flex ou grid, les mots d'un même texte sont regroupés pour ne pas devenir des cases séparées
    const flex = /flex|grid/.test(getComputedStyle(node).display);
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement("span");
          mask.className = "w";
          const word = document.createElement("span");
          word.className = "wi";
          word.textContent = part;
          mask.appendChild(word);
          fragment.appendChild(mask);
        });
        if (flex) {
          const run = document.createElement("span");
          run.className = "wl";
          run.appendChild(fragment);
          child.replaceWith(run);
        } else {
          child.replaceWith(fragment);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE && !child.matches("svg,canvas,input,select,textarea,button,.w")) {
        walk(child);
      }
    });
  };
  walk(el);
}

/** Fait apparaître les textes de root, en commençant après `delay` ms. */
export function revealText(root, delay = 0) {
  if (!root || reducedMotion.matches || !Element.prototype.animate) return;
  let t = delay;
  $$(TEXT_SELECTOR, root).forEach(el => {
    // déjà pris en charge par un parent découpé
    if (!el.dataset.split && el.parentElement && el.parentElement.closest("[data-split]")) return;
    if (el.closest("[hidden]") || !el.getClientRects().length) return;
    splitWords(el);
    const words = $$(".wi", el);
    if (!words.length) return;
    const big = el.matches(BIG_SELECTOR);
    if (big || words.length <= 4) {
      // titres et libellés courts : mot par mot
      words.forEach((w, i) =>
        w.animate([{ transform: "translateY(115%)" }, { transform: "translateY(0)" }], {
          duration: big ? 650 : 500,
          delay: Math.min(t + i * (big ? 35 : 18), 900),
          easing: EASE_FLY,
          fill: "backwards",
        }),
      );
      t += big ? 90 : 40;
    } else {
      // paragraphes : ligne par ligne, chaque ligne sort du sol
      let line = -1;
      let lastTop = null;
      words.forEach(w => {
        const top = w.parentElement.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          line++;
          lastTop = top;
        }
        w.animate([{ transform: "translateY(120%)" }, { transform: "translateY(0)" }], {
          duration: 600,
          delay: Math.min(t + line * 55, 1000),
          easing: EASE_RISE,
          fill: "backwards",
        });
      });
      t += 50 + line * 30;
    }
  });
}
