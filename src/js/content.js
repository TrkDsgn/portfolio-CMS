/* Contenu du site, géré par le CMS. Le build (scripts/build.mjs) le génère dans /content.js,
   chargé avant ce module : window.__CONTENT = { site, projects, assets }. */

const content = window.__CONTENT;

/** Textes généraux, À propos, Contact (content/site.json). */
export const SITE = content.site;
/** Projets publiés, triés par ordre (content/projects/*.json). */
export const PROJECTS = content.projects;
/** Images de public/images : nom de fichier sans extension → URL. */
export const ASSETS = content.assets;
