/* Navigation par l'adresse (#about, #contact, #projet-<slug>, ou rien pour l'accueil).
   Ouvre et ferme les panneaux et les études de cas. */
import { $, $$, mobileQuery, ease } from "./utils.js";
import { PROJECTS } from "./content.js";
import { camera, app, dom } from "./state.js";
import { tween } from "./camera.js";
import { setHover } from "./input.js";
import { revealText } from "./reveal.js";
import { renderProject, hideCursorLabel } from "./project/case-study.js";
import { animateGallery } from "./project/gallery.js";

const HOME_TITLE = "Tarik Bouabid — Product designer";

/** Lit l'adresse : { view, slug? }. */
function parseHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash === "about") return { view: "about" };
  if (hash === "contact") return { view: "contact" };
  if (hash.startsWith("projet-")) {
    const slug = hash.slice(7);
    if (PROJECTS.some(p => p.slug === slug)) return { view: "project", slug };
  }
  return { view: "home" };
}

/** Marque le lien de la page courante ; sur mobile, « À propos » / « Contact » deviennent « Fermer ». */
function setNav(view) {
  $$("[data-nav]").forEach(link => {
    if (link.dataset.nav === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const toggles = [
    [$("#m-about"), "about", "À propos"],
    [$("#m-contact"), "contact", "Contact"],
  ];
  toggles.forEach(([link, name, label]) => {
    const open = view === name;
    link.textContent = open ? "Fermer" : label;
    link.href = open ? "#" : "#" + name;
    link.classList.toggle("accent", open);
  });
}

/** Décalage de la caméra pour garder le plan de travail centré à côté d'un panneau ouvert. */
export function panelShift(view) {
  if (mobileQuery.matches) return 0;
  const width = view === "about" ? (camera.W * 16) / 44 : view === "contact" ? (camera.W * 30) / 44 : 0;
  return width / 2;
}

/** Ouvre l'étude de cas directement (sans zoom de caméra) ; le plan de travail reste derrière. */
function openProject(slug, previous) {
  const id = PROJECTS.findIndex(p => p.slug === slug);
  const P = PROJECTS[id];
  const fromHome = previous !== "project";
  dom.panelAbout.classList.remove("open");
  dom.panelContact.classList.remove("open");
  app.pendingCluster = null;
  app.view = "project";
  camera.vel = [0, 0];
  dom.frame.classList.add("is-hidden");
  dom.ticker.style.opacity = "0";
  document.body.classList.add("is-project");

  renderProject(P, id);
  $("#p-select").value = slug;
  dom.pill.classList.add("on");
  dom.pill.setAttribute("aria-hidden", "false");
  dom.project.classList.add("open");
  dom.project.scrollTop = 0;
  animateGallery(fromHome);
  revealText($(".p-text", dom.project), fromHome ? 200 : 80);
  document.title = `${P.title} — Tarik Bouabid`;
  dom.project.focus({ preventScroll: true });
}

function closeProject() {
  hideCursorLabel();
  document.body.classList.remove("is-project");
  dom.project.classList.remove("open");
  dom.pill.classList.remove("on");
  dom.pill.setAttribute("aria-hidden", "true");
  dom.frame.classList.remove("is-hidden");
  dom.ticker.style.opacity = "";
}

/** Affiche la vue correspondant à l'adresse courante. */
export async function go() {
  const route = parseHash();
  const previous = app.view;
  setHover(null);
  camera.dirty = true;

  if (route.view === "project") {
    openProject(route.slug, previous);
  } else {
    if (previous === "project") closeProject();
    const view = (app.view = route.view);
    const { panelAbout, panelContact } = dom;
    panelAbout.classList.toggle("open", view === "about");
    panelContact.classList.toggle("open", view === "contact");
    panelAbout.setAttribute("aria-hidden", view !== "about");
    panelContact.setAttribute("aria-hidden", view !== "contact");
    tween(camera, "shift", panelShift(view), 420, ease.out);
    if (view === "about" && previous !== "about") revealText(panelAbout, 180);
    else if (view === "contact" && previous !== "contact") revealText(panelContact, 180);
    document.title =
      view === "about" ? "À propos — Tarik Bouabid" : view === "contact" ? "Contact — Tarik Bouabid" : HOME_TITLE;
    if (view === "about") panelAbout.focus({ preventScroll: true });
    else if (view === "contact") panelContact.focus({ preventScroll: true });
    else if (previous !== "home") dom.canvas.focus({ preventScroll: true });
  }
  setNav(app.view);
}

/** Branche la navigation. */
export function initRouter() {
  addEventListener("hashchange", go);
  // menu déroulant de la barre projet
  $("#p-select").addEventListener("change", e => {
    location.hash = "projet-" + e.target.value;
  });
  // « Projet suivant » : repartir du haut de la page
  dom.project.addEventListener("click", e => {
    if (e.target.closest("a.next")) dom.project.scrollTop = 0;
  });
  // Échap : retour à l'accueil
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && app.view !== "home") location.hash = "";
  });
}
