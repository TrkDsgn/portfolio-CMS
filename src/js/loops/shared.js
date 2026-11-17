/* Outils communs aux animations des projets.
   Chaque animation est une fonction déterministe de p ∈ [0, 1) : draw(ctx, W, H, p, A),
   où A contient les images chargées ; dessiner p = 0 et p = 1 donne la même image (boucle). */

/** Borne x entre a et b. */
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Progression de 0 à 1 de p dans l'intervalle [a, b] (bornée). */
export const seg = (p, a, b) => clamp((p - a) / (b - a));

/** Interpolation linéaire de a vers b. */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Courbe « ease in-out » cubique. */
export const io = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Courbe « ease out » cubique. */
export const out = t => 1 - Math.pow(1 - t, 3);

/** Trace un rectangle aux coins arrondis (rayon limité à la moitié du côté le plus court). */
export function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
