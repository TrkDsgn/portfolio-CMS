/* Shaders du plan de travail : une grille infinie, courbée comme un objectif grand angle,
   avec un « cluster » de 4 × 2 cellules par projet. Chaque cluster affiche la couverture
   du projet, lue dans un atlas (une texture qui contient toutes les couvertures). */

/** Un triangle qui couvre tout l'écran. */
export const VERTEX_SHADER = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

export const FRAGMENT_SHADER = `precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform vec2 uOff; uniform float uZoom; uniform float uCurve; uniform vec2 uCenter;
uniform float uCell; uniform sampler2D uTex; uniform float uN; uniform vec2 uHover; uniform float uHoverAmt;
uniform vec3 uBg; uniform vec3 uLine; uniform vec3 uDeep; uniform float uR;
uniform float uCols; uniform float uAb; uniform vec2 uDir;

/* déformation « grand angle » : plus on s'éloigne du centre, plus la grille s'étire */
vec2 warp(vec2 q, float c){ return q * (1.0 + c * dot(q, q)); }
/* distance signée à un rectangle aux coins arrondis */
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }

void main(){
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q = (sp - uCenter) / uR;
  vec2 qd = warp(q, uCurve);
  vec2 w = qd * uR / uZoom + uOff;                              /* position dans le monde */
  float px = (1.0 + 3.0 * uCurve * dot(q, q)) / uZoom;           /* taille d'un pixel en unités monde */
  float C = uCell;

  /* grille */
  vec2 g = abs(fract(w / C + 0.5) - 0.5) * C;
  float d = min(g.x, g.y);
  float pxd = px / uDpr;                                         /* un pixel physique */
  float line = 1.0 - smoothstep(pxd * 0.3, pxd * 1.0, d);       /* filet d'1 px */
  vec3 col = mix(uBg, uLine, line);

  /* clusters : période 6 × 4 cellules, une rangée sur deux décalée de 3 cellules */
  vec2 P = vec2(6.0*C, 4.0*C);
  float cy = floor(w.y / P.y);
  float xo = mod(cy, 2.0) * 3.0 * C;
  float cx = floor((w.x - xo) / P.x);
  vec2 local = w - vec2(cx * P.x + xo, cy * P.y) - vec2(C, C);
  vec2 lc = vec2(2.0*C, C);

  /* le cluster survolé grossit légèrement */
  float hov = (abs(cx-uHover.x)<.5 && abs(cy-uHover.y)<.5) ? uHoverAmt : 0.0;
  local = lc + (local - lc) / (1.0 + 0.045 * hov);
  float pxl = px / (1.0 + 0.045 * hov);

  if(local.x > -C && local.x < 5.0*C && local.y > -C && local.y < 3.0*C){
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
      vec3 tex = texture2D(uTex, (slot + uv) / vec2(uCols, uCols)).rgb;
      /* séparation des couleurs pendant un mouvement rapide */
      vec2 ab = uDir * uAb * 0.018;
      if(uAb > 0.001){
        tex.r = texture2D(uTex, (slot + clamp(uv + ab, 0.001, 0.999)) / vec2(uCols, uCols)).r;
        tex.b = texture2D(uTex, (slot + clamp(uv - ab, 0.001, 0.999)) / vec2(uCols, uCols)).b;
      }
      tex = mix(tex, tex * 1.06, hov);
      col = mix(col, tex, inside);
    }
  }

  /* horizon : assombrit les bords quand la courbure est active */
  float vig = smoothstep(0.55, 1.35, length(q)) * clamp(uCurve * 3.0, 0.0, 1.0);
  col = mix(col, uDeep, vig * 0.85);
  gl_FragColor = vec4(col, 1.0);
}`;
