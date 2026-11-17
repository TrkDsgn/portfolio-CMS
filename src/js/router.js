/* Navigation par l'adresse (#about, #contact, #projet-<slug>, ou rien pour l'accueil).
   Ouvre et ferme les panneaux, et fait zoomer la caméra sur un projet avant d'afficher son étude de cas. */
import { $, $$, mobileQuery, ease } from "./utils.js";
import { PROJECTS } from "./content.js";
import { camera, app, dom } from "./state.js";
import { tween, viewCenter, cellSize, clusterCenter, nearestCluster } from "./camera.js";
import { setHover } from "./input.js";
import { revealText } from "./reveal.js";
import { renderProject } from "./project/case-study.js";
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

async function openProject(slug, previous) {
  const id = PROJECTS.findIndex(p => p.slug === slug);
  const P = PROJECTS[id];
  dom.panelAbout.classList.remove("open");
  dom.panelContact.classList.remove("open");

  if (previous !== "project") {
    app.homeState = { off: camera.off.slice(), zoom: camera.zoom };
    const pending = app.pendingCluster;
    const cluster = pending && pending.id === id ? pending : nearestCluster(id);
    app.pendingCluster = null;
    app.view = "project";
    dom.frame.classList.add("is-hidden");
    dom.ticker.style.opacity = "0";
    // la caméra aplatit la grille et zoome sur le projet (sauf à l'arrivée directe sur le lien)
    if (cluster && !app.firstGo) {
      camera.vel = [0, 0];
      tween(camera, "shift", 0, 400, ease.out);
      tween(camera, "curve", 0, 620, ease.inOut);
      const zoom = Math.min((camera.W * 0.82) / (4 * cellSize()), (camera.H * 0.7) / (2 * cellSize()));
      tween(camera, "zoom", zoom, 650, ease.inOut);
      await tween(camera, "off", clusterCenter(cluster.cx, cluster.cy), 650, ease.inOut);
    }
  }

  app.view = "project";
  document.body.classList.add("is-project");
  const [cx, cy] = viewCenter();
  const cw = 4 * cellSize() * camera.zoom;
  const ch = 2 * cellSize() * camera.zoom;
  const fromCover = previous !== "project" ? { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch } : null;

  renderProject(P, id);
  $("#p-select").value = slug;
  dom.pill.classList.add("on");
  dom.pill.setAttribute("aria-hidden", "false");
  dom.project.classList.add("open");
  dom.project.scrollTop = 0;
  animateGallery(fromCover);
  revealText($(".p-text", dom.project), fromCover ? 200 : 80);
  document.title = `${P.title} — Tarik Bouabid`;
  dom.project.focus({ preventScroll: true });
}

async function closeProject() {
  document.body.classList.remove("is-project");
  dom.project.classList.remove("open");
  dom.pill.classList.remove("on");
  dom.pill.setAttribute("aria-hidden", "true");
  dom.frame.classList.remove("is-hidden");
  dom.ticker.style.opacity = "";
  const home = app.homeState || { off: camera.off.slice(), zoom: 1 };
  tween(camera, "curve", 0.32, 600, ease.inOut);
  tween(camera, "zoom", 1, 600, ease.inOut);
  await tween(camera, "off", home.off, 600, ease.inOut);
}

/** Affiche la vue correspondant à l'adresse courante. */
export async function go() {
  const route = parseHash();
  const previous = app.view;
  setHover(null);
  camera.dirty = true;

  if (route.view === "project") {
    await openProject(route.slug, previous);
  } else {
    if (previous === "project") await closeProject();
    const view = (app.view = route.view);
    const { panelAbout, panelContact } = dom;
    panelAbout.classList.toggle("open", view === "about");
    panelContact.classList.toggle("open", view === "contact");
    panelAbout.setAttribute("aria-hidden", view !== "about");
    panelContact.setAttribute("aria-hidden", view !== "contact");
    tween(camera, "shift", panelShift(view), 420, ease.out);
    if (view === "about" && previous !== "about") revealText(panelAbout, 180);
    else if (view === "contact" && previous !== "contact") revealText(panelContact, 180);
    document.title = view === "about" ? "À propos — Tarik Bouabid" : view === "contact" ? "Contact — Tarik Bouabid" : HOME_TITLE;
    if (view === "about") panelAbout.focus({ preventScroll: true });
    else if (view === "contact") panelContact.focus({ preventScroll: true });
    else if (previous !== "home") dom.canvas.focus({ preventScroll: true });
  }
  setNav(app.view);
  app.firstGo = false;
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
