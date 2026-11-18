/* Écran de chargement :
   1. le nom apparaît seul, en gris ;
   2. un petit globe à peine visible sort du noir sous le nom (c'est le plan de travail, vu de loin) ;
   3. la couleur (--spectrum-1…4) s'y répand en taches depuis le centre, et les lettres du nom
      s'allument au même rythme, en changeant de couleur avec le globe ;
   4. plongée : l'en-tête apparaît, le nom glisse jusqu'à devenir le nom de l'en-tête, le globe grandit
      jusqu'à remplir l'écran, puis les vignettes apparaissent une par une et la grille redevient grise.
   Animations réduites : pas de globe, l'accueil apparaît directement. */
import { $, $$, reducedMotion, ease } from "./utils.js";
import { camera, app, dom } from "./state.js";
import { tween } from "./camera.js";
import { revealText } from "./reveal.js";

/** Durée minimale d'affichage : le temps que la couleur couvre le globe. */
const LOADER_MIN_MS = 5600;
/** Apparition du globe. */
const GLOBE_DELAY_MS = 1500;
const GLOBE_FADE_MS = 900;
/** Extension de la couleur sur le globe. */
const PAINT_DELAY_MS = 2400;
const PAINT_MS = 2900;
/** Durée de la plongée vers l'accueil. */
const DIVE_MS = 1700;
const loadStart = performance.now();

let letters = [];
let stops = [];
let running = false;

/* ------------------------------------------------------------------ Couleurs */

function readStops() {
  const cs = getComputedStyle(document.documentElement);
  stops = [1, 2, 3, 4].map(i => {
    const n = parseInt(cs.getPropertyValue(`--spectrum-${i}`).trim().slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  });
}

function spectrumAt(f) {
  const x = (((f % 1) + 1) % 1) * stops.length;
  const i = Math.floor(x);
  const t = x - i;
  const a = stops[i];
  const b = stops[(i + 1) % stops.length];
  return [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * t));
}

/* --------------------------------------------------------------------- Nom */

/** Découpe le nom en lettres (une couleur par lettre, mise à jour à chaque image). */
function splitName() {
  const name = $("#ld-name");
  if (!name) return;
  const text = name.textContent;
  name.setAttribute("aria-label", text);
  name.textContent = "";
  letters = [...text].map(ch => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.setAttribute("aria-hidden", "true");
    name.appendChild(span);
    return span;
  });
}

/** Les lettres s'allument de gauche à droite au rythme de la couleur du globe, puis changent de teinte. */
function colorLetters(time) {
  const lit = camera.paint * (letters.length + 2);
  letters.forEach((span, i) => {
    const on = Math.min(1, Math.max(0, lit - i));
    if (on <= 0) {
      span.style.color = "";
      return;
    }
    const [r, g, b] = spectrumAt(time * 0.22 + i * 0.05);
    // mélange avec le gris de départ tant que la lettre s'allume
    const grey = [85, 82, 78];
    const c = [r, g, b].map((v, k) => Math.round(grey[k] + (v - grey[k]) * on));
    span.style.color = `rgb(${c[0]},${c[1]},${c[2]})`;
  });
}

function loop(now) {
  if (!running) return;
  colorLetters((now - loadStart) / 1000);
  requestAnimationFrame(loop);
}

/** Le nom du chargement glisse jusqu'au nom de l'en-tête, puis lui laisse la place. */
function flyNameToHeader() {
  const name = $("#ld-name");
  const target = $(".f-logo .name", dom.frame);
  if (!name || !target) return;
  const from = name.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  // l'en-tête est encore décalé (il arrive en glissant) : on vise sa position finale
  const shift = new DOMMatrix(getComputedStyle(dom.frame).transform).m42;
  const scale = to.height / from.height;
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top - shift + to.height / 2 - (from.top + from.height / 2);
  document.body.classList.add("ld-flying");
  name.style.transition = "transform 1.1s cubic-bezier(.65,0,.35,1)";
  name.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  // les lettres reprennent la couleur de l'encre en arrivant
  setTimeout(() => {
    running = false;
    letters.forEach(span => {
      span.style.transition = "color .5s";
      span.style.color = "var(--ink)";
    });
  }, 500);
  setTimeout(() => {
    document.body.classList.remove("ld-flying");
    name.style.opacity = "0";
  }, 1150);
}

/* ------------------------------------------------------------------- Globe */

/** Place le globe sous le nom (centre de l'emplacement #ld-globe). */
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
  readStops();
  splitName();
  if (reducedMotion.matches) {
    document.body.classList.add("loading-still");
    camera.paint = 1;
    colorLetters(0);
    return;
  }
  camera.orbit = 1;
  camera.spectrum = 1;
  camera.paint = 0;
  camera.globeAlpha = 0;
  camera.tiles = 0;
  placeGlobe();
  running = true;
  requestAnimationFrame(loop);
  setTimeout(() => tween(camera, "globeAlpha", 1, GLOBE_FADE_MS, ease.out), GLOBE_DELAY_MS);
  setTimeout(() => tween(camera, "paint", 1, PAINT_MS, ease.inOut), PAINT_DELAY_MS);
}

/** Plongée : le globe grandit jusqu'à remplir l'écran, puis les vignettes apparaissent. */
function dive() {
  camera.globeAlpha = 1;
  camera.paint = 1;
  if (app.view === "project") {
    // arrivée directe sur une étude de cas : pas de plongée, l'accueil est prêt derrière
    camera.orbit = 0;
    camera.spectrum = 0;
    camera.tiles = 1;
    return;
  }
  tween(camera, "orbit", 0, DIVE_MS, ease.inOut);
  setTimeout(() => tween(camera, "spectrum", 0, DIVE_MS, ease.inOut), DIVE_MS * 0.5);
  setTimeout(() => tween(camera, "tiles", 1, 1500, ease.inOut), DIVE_MS * 0.7);
}

/** Termine le chargement (au moins LOADER_MIN_MS après le début). */
export function finishLoader(frame) {
  const remaining = Math.max(0, LOADER_MIN_MS - (performance.now() - loadStart));
  return new Promise(resolve => setTimeout(resolve, remaining)).then(() => {
    const loader = $("#loader");
    if (reducedMotion.matches) {
      document.body.classList.remove("loading", "loading-still");
      loader.remove();
      camera.dirty = true;
      return;
    }
    dive();
    // l'en-tête apparaît dès le début de la plongée ; le nom du chargement le rejoint
    flyNameToHeader();
    document.body.classList.remove("loading");
    revealText(frame, 300);
    camera.dirty = true;
    setTimeout(() => {
      running = false;
      loader.remove();
      $$(".ld-name span").forEach(span => span.remove());
    }, DIVE_MS + 800);
  });
}
