# Portfolio — Tarik Bouabid

Site statique généré par **Node.js**, contenu éditable sans code via **Decap CMS** sur `/admin`, hébergé sur **Vercel**.

```
content/                 le contenu (modifié par le CMS)
  site.json              textes généraux, À propos, Contact, SEO
  projects/*.json        un fichier par projet
public/                  fichiers servis tels quels
  images/                images (uploads du CMS dans images/uploads/)
  admin/                 interface du CMS (index.html + config.yml)
src/
  index.html             gabarit de la page
  css/
    main.css             importe les fichiers ci-dessous, dans l'ordre
    tokens.css           variables : couleurs, tailles de texte, espacements
    base.css             socle, accessibilité, styles de texte
    components.css       liens, bouton, logo, listes, champs
    layout.css           plan de travail, en-tête, coordonnées, bandeau
    pages/panels.css     panneaux À propos et Contact
    pages/project.css    étude de cas et galerie
    motion.css           écran de chargement, apparitions, « réduire les animations »
  js/
    main.js              point d'entrée (démarrage)
    content.js           contenu du CMS          state.js       état partagé
    page.js              remplissage des textes  camera.js      géométrie de la grille
    webgl/               rendu du plan de travail : sphère (shaders), couvertures, traînée de couleur (ink.js)
    loader.js            écran de chargement : globe qui grandit jusqu’à devenir l’accueil
    animation.js         boucle d'animation      input.js       souris, doigt, clavier
    router.js            navigation              reveal.js      apparition des textes
    project/             étude de cas, galerie   contact.js     formulaire
    loops/               animations des projets (un fichier par projet + index.js)
    fallback.js          repli sans WebGL
scripts/
  build.mjs              build : content + src + public → dist/
  images.mjs             versions légères des images (480/960/1600 px)
  dev.mjs                serveur local (fichiers source, sans build)
  preview.mjs            sert le build dist/ en local
api/                     fonctions Node sur Vercel : connexion GitHub du CMS (auth, callback), formulaire (contact)
```

## Travailler en local

Node.js est installé dans `~/.local/node`. Si `node` n'est pas reconnu dans le terminal :

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

```bash
npm install       # une fois : esbuild, sharp, prettier
npm run dev       # site sur http://localhost:3000, admin sur http://localhost:3000/admin/
npm run cms       # (2e terminal) permet à /admin d'écrire directement dans les fichiers locaux
npm run build     # génère dist/ (ce que fait Vercel)
npm run preview   # build + sert dist/ sur http://localhost:4000
npm run format    # remet en forme tout le code (Prettier)
```

Le build :
- assemble et minifie le CSS et le JS (esbuild), avec un nom versionné (`main.<hash>.js`) ;
- crée des versions WebP plus légères de chaque image : le site charge celle qui convient à l'écran ;
- vérifie le contenu : champs obligatoires, identifiants uniques, animations qui existent bien.

## Où modifier quoi

| Je veux… | Fichier |
|---|---|
| changer une couleur, une taille de texte, un espacement | `src/css/tokens.css` |
| retoucher l’en-tête, les coordonnées, le bandeau | `src/css/layout.css` |
| retoucher l'étude de cas ou la galerie | `src/css/pages/project.css`, `src/js/project/` |
| modifier une animation de projet | `src/js/loops/<projet>.js` |
| ajouter une animation | la coder dans `src/js/loops/<projet>.js`, puis ajouter son nom dans `public/admin/config.yml` (le build vérifie) |
| changer le comportement du plan de travail | `src/js/camera.js`, `src/js/animation.js`, `src/js/input.js` |

## Modifier le contenu (au quotidien)

1. Aller sur `https://<ton-domaine>/admin/` et se connecter avec GitHub.
2. **Projets** : modifier, créer (« + Projet »), réordonner (champ « Ordre »), masquer (« Brouillon ») ou supprimer.
3. **Réglages du site** : accroche, À propos, parcours, contact, réseaux, SEO.
4. **Publier** → commit sur GitHub → Vercel redéploie en ~1 minute.

Un projet n'a besoin que d'un identifiant et d'un titre : tout le reste a des valeurs par défaut
(palette, visuels générés). Les images sans ratio prennent automatiquement leurs proportions.
Les animations « boucles » sont du code (`src/js/loops.js`) : le CMS permet de choisir parmi les existantes.

## Mise en ligne

- Dépôt GitHub : `TrkDsgn/portfolio-CMS`, branche `main`. Chaque commit sur `main` (y compris ceux du CMS)
  redéploie https://tarikbouabid.vercel.app en ~1 minute.
- Une autre branche poussée sur GitHub donne une **URL de prévisualisation** Vercel, sans toucher au site en ligne.
- Vercel : projet `portfolio`, Framework Preset « Other » (le `vercel.json` règle build et dossier de sortie).
- Connexion au CMS : OAuth App GitHub « Portfolio CMS » (callback `https://tarikbouabid.vercel.app/api/callback`)
  et variables `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` dans Vercel.

- Formulaire de contact : `api/contact.js` envoie chaque message par e-mail via Resend.
  Variable `RESEND_API_KEY` dans Vercel (et facultatives : `CONTACT_TO`, `CONTACT_FROM`).
  Sans clé, ou si l'envoi échoue, le formulaire ouvre la messagerie avec le message prêt.

> La connexion au CMS fonctionne sur le domaine de production (celui déclaré dans l'OAuth App),
> pas sur les URLs de preview Vercel.

## Régénérer depuis l'ancien site

`scripts/migrate-legacy.mjs` a servi une seule fois à découper l'ancien `index.html` (8 Mo, images en base64).
Ne pas le relancer : il écraserait le contenu modifié depuis.
