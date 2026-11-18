/* Shaders du plan de travail : une grille infinie posée sur une sphère, vue par une caméra inclinée.
   Chaque pixel lance un rayon depuis la caméra ; le point touché sur la sphère donne une position
   dans le monde (longitude, latitude × rayon). De loin, on voit le globe entier ; de près, la surface
   devient l'accueil. Un « cluster » de 4 × 2 cellules par projet affiche la couverture du projet,
   lue dans un atlas. Une traînée de couleur (encre) suit la souris et illumine les lignes. */

/** Un triangle qui couvre tout l'écran. */
export const VERTEX_SHADER = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

export const FRAGMENT_SHADER = `#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform vec2 uOff; uniform float uZoom; uniform vec2 uCenter;
uniform float uFocal; uniform float uTilt; uniform float uRadius; uniform float uHeight; uniform float uCurve;
uniform float uCell; uniform sampler2D uTex; uniform float uN;
uniform vec3 uBg; uniform vec3 uLine; uniform vec3 uDeep;
uniform float uCols; uniform float uAb; uniform vec2 uDir;
uniform float uTiles; uniform float uSpectrum; uniform float uTime;
uniform vec3 uS0; uniform vec3 uS1; uniform vec3 uS2; uniform vec3 uS3;
uniform sampler2D uInk; uniform float uInkOn;
uniform float uOrbit; uniform float uPaint; uniform float uLineAlpha;

/* distance signée à un rectangle aux coins arrondis */
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }

/* dégradé cyclique à 4 couleurs */
vec3 spectrum(float f){
  f = fract(f) * 4.0; float t = fract(f);
  if(f < 1.0) return mix(uS0, uS1, t);
  if(f < 2.0) return mix(uS1, uS2, t);
  if(f < 3.0) return mix(uS2, uS3, t);
  return mix(uS3, uS0, t);
}

/* filets d'une grille d'espacement s, épais d'un pixel et lissés sur un pixel et demi (pas d'escalier
   au loin) ; ils s'effacent quand ils deviennent trop serrés à l'écran (pas de moiré) */
float grid(vec2 w, float s, vec2 fw){
  vec2 g = abs(fract(w / s + 0.5) - 0.5) * s / fw;             /* distance au filet, en pixels */
  vec2 a = 1.0 - smoothstep(-0.25, 1.25, g - 0.5);
  vec2 dense = smoothstep(3.0, 9.0, s / fw);                    /* espacement à l'écran, par direction */
  return max(a.x * dense.x, a.y * dense.y);
}

void main(){
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 p = vec2(sp.x - uCenter.x, uCenter.y - sp.y);

  /* rayon de la caméra */
  float ct = cos(uTilt), st = sin(uTilt);
  vec3 d = normalize(vec3(p.x, st * uFocal + ct * p.y, -ct * uFocal + st * p.y));
  vec2 w; float dist; float hit = 1.0;
  vec3 qn = vec3(0.0, 0.0, 1.0);                                  /* point touché, sur la sphère unité */
  if(uRadius <= 0.0){
    float t = -uHeight / min(d.z, -1e-4);
    vec3 S = vec3(0.0, 0.0, uHeight) + t * d;
    w = vec2(S.x, -S.y); dist = t;
  } else {
    float oz = uHeight + uRadius;
    float b = oz * d.z;
    float disc = b * b - (oz * oz - uRadius * uRadius);
    if(disc < 0.0) hit = 0.0;
    float t = -b - sqrt(max(disc, 0.0));
    vec3 Q = vec3(0.0, 0.0, oz) + t * d;
    qn = Q / uRadius;
    w = vec2(atan(Q.x, Q.z), -asin(clamp(qn.y, -1.0, 1.0))) * uRadius;
    dist = t;
  }
  w = w / uZoom + uOff;                                          /* position dans le monde */

#ifdef GL_OES_standard_derivatives
  vec2 fw = max(fwidth(w), vec2(1e-5));                          /* un pixel physique, en unités monde */
#else
  vec2 fw = vec2(dist / uFocal / uZoom / uDpr);
#endif
  float C = uCell;

  /* grille, avec des niveaux plus larges quand on s'éloigne */
  float line = max(grid(w, C, fw), max(grid(w, C * 4.0, fw), grid(w, C * 16.0, fw)));
  /* globe vu de loin : méridiens et parallèles fins (48 × 24), fondus vers la grille en approchant */
  float globe = smoothstep(0.35, 0.85, uOrbit);
  if(globe > 0.0){
    vec2 ll = vec2(atan(qn.x, qn.z) * 7.6394, asin(clamp(qn.y, -1.0, 1.0)) * 7.6394); /* 48 / 2π, 24 / π */
#ifdef GL_OES_standard_derivatives
    vec2 fl = max(fwidth(ll), vec2(1e-5));
#else
    vec2 fl = vec2(0.02);
#endif
    line = mix(line, grid(ll, 1.0, fl), globe);
  }
  line *= uLineAlpha;
  /* couleur qui se répand depuis le centre du globe (chargement), sinon filets gris */
  float ang = acos(clamp(qn.z, -1.0, 1.0));
  float paint = (1.0 - smoothstep(uPaint * 2.0 - 0.4, uPaint * 2.0 + 0.05, ang)) * uSpectrum;
  vec3 paintCol = spectrum(ang * 1.3 - uTime * 0.22) * 1.15;
  vec3 lineCol = mix(uLine, paintCol, paint);

  /* encre : traînée de couleur laissée par la souris, séparée en rouge / vert / bleu */
  vec3 ink = vec3(0.0);
  if(uInkOn > 0.0){
    vec2 uv = sp / (uRes / uDpr);
    vec2 so = uDir * 0.002 + vec2(0.0015, 0.0);
    /* le canvas est envoyé sans prémultiplication : la couleur est pondérée par sa transparence */
    vec4 i1 = texture2D(uInk, uv + so), i2 = texture2D(uInk, uv), i3 = texture2D(uInk, uv - so);
    ink = vec3(i1.r * i1.a, i2.g * i2.a, i3.b * i3.a) * uInkOn * 2.5;
  }
  vec3 col = mix(uBg, lineCol + ink * 1.5, line) + ink * 0.035 + paintCol * paint * 0.05 * hit;

  /* clusters : période 6 × 4 cellules, une rangée sur deux décalée de 3 cellules */
  vec2 P = vec2(6.0*C, 4.0*C);
  float cy = floor(w.y / P.y);
  float xo = mod(cy, 2.0) * 3.0 * C;
  float cx = floor((w.x - xo) / P.x);
  vec2 local = w - vec2(cx * P.x + xo, cy * P.y) - vec2(C, C);

  float pxl = max(fw.x, fw.y) * uDpr;

  if(uTiles > 0.0 && local.x > -C && local.x < 5.0*C && local.y > -C && local.y < 3.0*C){
    float gap = C * 0.035;
    vec2 tc = vec2(2.0 * C, C);
    vec2 hb = vec2(2.0*C - gap, C - gap);
    float sd = sdBox(local - tc, hb, C*0.09);
    float inside = (local.x >= 0.0 && local.x <= 4.0*C && local.y >= 0.0 && local.y <= 2.0*C) ? 1.0 - smoothstep(-pxl*0.5, pxl*0.5, sd) : 0.0;
    if(inside > 0.0){
      /* quel projet ? on parcourt la liste en diagonale */
      float id = mod(cx + cy * 2.0, uN);
      vec2 uv = clamp(local / vec2(4.0*C, 2.0*C), 0.001, 0.999);
      vec2 slot = vec2(mod(id, uCols), floor(id / uCols));
      vec4 texel = texture2D(uTex, (slot + uv) / vec2(uCols, uCols));
      vec3 tex = texel.rgb;
      /* séparation des couleurs pendant un mouvement rapide */
      vec2 ab = uDir * uAb * 0.018;
      if(uAb > 0.001){
        tex.r = texture2D(uTex, (slot + clamp(uv + ab, 0.001, 0.999)) / vec2(uCols, uCols)).r;
        tex.b = texture2D(uTex, (slot + clamp(uv - ab, 0.001, 0.999)) / vec2(uCols, uCols)).b;
      }
      tex += ink * 0.08;
      /* atlas prémultiplié : transparent entre les vignettes, la grille se voit */
      float m = inside * uTiles;
      col = col * (1.0 - m * texel.a) + tex * m;
    }
  }

  /* lointain : la surface se fond dans le noir en s'éloignant (et le ciel au-delà de l'horizon) */
  float far = smoothstep(uFocal * 1.15, uFocal * 2.6, dist) * clamp(uCurve * 3.0, 0.0, 1.0) * (1.0 - uSpectrum);
  col = mix(col, uDeep, far * 0.8);
  col = mix(uDeep, col, hit);
  gl_FragColor = vec4(col, 1.0);
}`;
