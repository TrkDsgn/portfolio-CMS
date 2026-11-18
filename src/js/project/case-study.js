/* Construction de la page d'une étude de cas : colonne de texte, galerie, lien vers le projet suivant. */
import { $, $$, esc } from "../utils.js";
import { PROJECTS } from "../content.js";
import { dom, app } from "../state.js";
import { drawTile, drawProjectCover } from "../webgl/tiles.js";
import { renderMedia, stopLoops } from "./gallery.js";

const section = (label, inner) =>
  `<section class="p-sec"><span class="t-label accent">${label}</span>${inner}</section>`;

function textColumn(P) {
  return `<article class="p-text">
      <header class="p-head">
        <div class="eyebrow t-micro"><span class="accent">${esc(P.category)}</span><span class="muted">${esc(P.year)}</span></div>
        <h1 class="t-display">${esc(P.title)}</h1>
        <p class="t-body muted">${esc(P.summary)}</p>
      </header>
      ${section("Contexte", `<p class="t-body">${esc(P.context)}</p>`)}
      ${section("Rôle", `<ul class="rules t-list">${P.role.map((x, k) => `<li style="--i:${k}">${esc(x)}</li>`).join("")}</ul>`)}
      ${section("Problème", `<p class="t-body">${esc(P.problem)}</p>`)}
      ${section("Process", `<ol class="steps">${P.process.map(s => `<li><div><b>${esc(s.t)}</b><span>${esc(s.d)}</span></div></li>`).join("")}</ol>`)}
      ${section("Solution", `<p class="t-body">${esc(P.solution)}</p>`)}
      ${section(
        P.resultsLabel || "Résultats",
        `<div class="kpis">${P.results.map(r => `<div class="kpi"><span class="v">${esc(r.v)}</span><span class="k">${esc(r.k)}</span></div>`).join("")}</div>`,
      )}
    </article>`;
}

function nextLink(N) {
  return `<a class="next" href="#projet-${N.slug}">
      <div class="next-h"><span class="t-label accent">Projet suivant</span><div class="t-display">${esc(N.title)}</div><span class="t-micro muted">${esc(N.category)} — ${esc(N.year)}</span></div>
      <div class="preview"><canvas width="1024" height="512" aria-hidden="true"></canvas></div>
    </a>`;
}

/* Projet sans médias : galerie provisoire de visuels générés */
const PLACEHOLDER_LAYOUT = [
  ["g4", 2],
  ["g1", 0],
  ["g1", 1],
  ["g2", 5],
  ["g2", 4],
  ["g1", 3],
  ["g1", 0],
  ["g4", 2],
];
const PLACEHOLDER_CAPTIONS = {
  desktop: "Écran desktop",
  phone: "Écran mobile",
  swatch: "Palette",
  type: "Typographie",
  flow: "Parcours",
  chart: "Données",
  icons: "Iconographie",
};

function renderPlaceholders(P) {
  const gallery = $("#gallery");
  PLACEHOLDER_LAYOUT.forEach(([cls, k]) => {
    const fig = document.createElement("figure");
    fig.className = cls;
    fig.dataset.k = k;
    const canvas = document.createElement("canvas");
    const W = cls === "g4" ? 1600 : cls === "g2" ? 1200 : 700;
    const H = cls === "g4" ? 900 : cls === "g2" ? 600 : 700;
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute("role", "img");
    const kind = P.tiles[k % P.tiles.length];
    canvas.setAttribute("aria-label", `${P.title} : ${PLACEHOLDER_CAPTIONS[kind] || "visuel"} (visuel provisoire)`);
    fig.appendChild(canvas);
    const caption = document.createElement("figcaption");
    caption.className = "t-micro";
    caption.textContent = PLACEHOLDER_CAPTIONS[kind] || "";
    fig.appendChild(caption);
    gallery.appendChild(fig);
    drawTile(canvas.getContext("2d"), P, k, 0, 0, W, H);
  });
}

/** Tablette et mobile : le texte se glisse entre les visuels
    (en-tête, image d'ouverture, puis une section toutes les deux rangées). Sans effet sur desktop. */
function arrangeFlow() {
  const project = dom.project;
  const head = $(".p-head", project);
  const sections = $$(".p-sec", project);
  const figures = $$("#gallery > *", project);
  const next = $(".next", project);

  // regroupe les visuels en rangées (deux demi-largeurs = une rangée)
  const rows = [];
  let half = 0;
  figures.forEach(fig => {
    const isHalf = fig.classList.contains("g2") || fig.classList.contains("g3");
    if (isHalf && half % 2 === 1) {
      rows[rows.length - 1].push(fig);
      half++;
    } else {
      rows.push([fig]);
      half = isHalf ? 1 : 0;
    }
  });

  // répartit les sections de texte entre les rangées
  const sequence = [head];
  const slots = sections.map((s, k) =>
    k === 0 ? 0 : Math.min(rows.length - 1, Math.round((k * (rows.length - 1)) / sections.length)),
  );
  rows.forEach((row, i) => {
    sequence.push(...row);
    sections.forEach((s, k) => {
      if (slots[k] === i) sequence.push(s);
    });
  });
  sequence.forEach((el, i) => {
    if (el) el.style.order = i + 1;
  });
  if (next) next.style.order = sequence.length + 10;
}

/* Étiquette qui suit le curseur sur l'étude de cas : les rôles du projet défilent dedans */
export function initCursorLabel() {
  const tag = dom.hovertag;
  dom.project.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || app.view !== "project") return;
    tag.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 20}px)`;
    tag.classList.add("on", "is-project");
  });
  dom.project.addEventListener("pointerleave", () => tag.classList.remove("on"));
}

/** Retire l'étiquette (fermeture de l'étude de cas). */
export function hideCursorLabel() {
  dom.hovertag.classList.remove("on", "is-project");
}

function setCursorLabel(P) {
  const text = (P.role.length ? P.role : [P.category]).map(esc).join(" · ");
  dom.hovertag.innerHTML = `<span class="tag-track"><span>${text} ·&nbsp;</span><span>${text} ·&nbsp;</span></span>`;
}

/** Affiche le projet P (index id) dans #project. */
export function renderProject(P, id) {
  setCursorLabel(P);
  const next = PROJECTS[(id + 1) % PROJECTS.length];
  dom.project.innerHTML = `<div class="p-wrap">
    ${textColumn(P)}
    <div class="gallery" id="gallery" aria-label="Visuels du projet"></div>
    ${nextLink(next)}</div>`;
  stopLoops();
  if (P.media) {
    renderMedia(P);
    arrangeFlow();
  } else {
    renderPlaceholders(P);
  }
  drawProjectCover($(".next canvas", dom.project).getContext("2d"), next, 0, 0, 1024, 512);
}
