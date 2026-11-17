/* Remplit la page avec le contenu du CMS : en-tête, bandeau, À propos, Contact, listes des projets. */
import { $, $$, esc } from "./utils.js";
import { SITE, PROJECTS } from "./content.js";

const ICON_EXTERNAL = `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 8L8 2M3.5 2H8v4.5"/></svg>`;
export const ICON_COPY = `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>`;

const socialLinks = () =>
  SITE.links
    .map(l => `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}${ICON_EXTERNAL}</a>`)
    .join("");

/** Groupes « Compétences » puis « Parcours » du panneau À propos (--i : rang d'apparition). */
function aboutGroups() {
  let rank = 2;
  let html = "";
  SITE.about.skills.forEach(group => {
    const items = group.items.map((x, k) => `<li style="--i:${k}">${esc(x)}</li>`).join("");
    html += `<div class="group rv" style="--i:${rank++}"><span class="t-label accent">${esc(group.label)}</span><ul class="rules t-list">${items}</ul></div>`;
  });
  const path = SITE.about.path
    .map(
      (p, k) =>
        `<li style="--i:${k}"><span class="yr t-micro">${esc(p.year)}</span><span><span>${esc(p.role)}</span> <span class="muted">— <span>${esc(p.org)}</span></span></span></li>`,
    )
    .join("");
  html += `<div class="group rv" style="--i:${rank++}"><span class="t-label accent">Parcours</span><ul class="rules t-list">${path}</ul></div>`;
  return html;
}

export function fillPage() {
  document.documentElement.style.setProperty("--logo", 'url("/images/logo.png")');

  // En-tête et boutons
  $("#tag1").innerHTML = SITE.taglineLeft.map(esc).join('<span class="plus">+</span>');
  $("#social").innerHTML = socialLinks();
  $$("[data-cta]").forEach(b => (b.textContent = SITE.cta));
  $$("[data-cta-short]").forEach(b => (b.textContent = SITE.ctaShort));
  $("#submit").textContent = SITE.submit;
  $("#status-email").textContent = SITE.email;

  // Bandeau défilant (doublé pour boucler sans saut)
  const ticker = SITE.ticker.map(x => `<span>${esc(x)} •</span>`).join("");
  $("#ticker-track").innerHTML = ticker + ticker;

  // À propos
  $("#about-title").textContent = SITE.about.title;
  $("#about-body").innerHTML = SITE.about.body.map(p => `<p class="t-body">${esc(p)}</p>`).join("");
  $("#about-groups").innerHTML = aboutGroups();

  // Contact
  $("#contact-title").textContent = SITE.contact.title;
  $("#contact-body").textContent = SITE.contact.body;
  $("#contact-links").innerHTML =
    `<dt>Email</dt><dd><a class="link" href="mailto:${esc(SITE.email)}" id="email-txt">${esc(SITE.email)}</a> ` +
    `<button class="copy copy-ic" type="button" id="copy-email" aria-label="Copier l'adresse email" title="Copier">${ICON_COPY}</button></dd>` +
    `<dt>Réseaux</dt><dd class="c-social">${socialLinks()}</dd>`;

  // Projets : liste accessible (lecteurs d'écran, clavier) et menu de la barre projet
  $("#projets-liste").innerHTML = PROJECTS.map(
    p =>
      `<li><a href="#projet-${p.slug}" data-focus="${p.slug}">${esc(p.title)} — ${esc(p.category)}, ${esc(p.year)}</a></li>`,
  ).join("");
  $("#p-select").innerHTML = PROJECTS.map(p => `<option value="${p.slug}">${esc(p.title)}</option>`).join("");
}
