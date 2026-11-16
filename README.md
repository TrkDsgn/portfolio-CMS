# Portfolio — Tarik Bouabid

Site statique généré par **Node.js** (aucune dépendance), contenu éditable sans code via **Decap CMS** sur `/admin`, hébergé sur **Vercel**.

```
content/            ← le contenu (modifié par le CMS)
  site.json         textes généraux, À propos, Contact, SEO
  projects/*.json   un fichier par projet
public/             fichiers servis tels quels
  images/           images (uploads du CMS dans images/uploads/)
  admin/            interface du CMS (index.html + config.yml)
src/                gabarit HTML, CSS et JS du site
scripts/build.mjs   build : content + src + public → dist/
scripts/dev.mjs     serveur local
api/                connexion GitHub du CMS (fonctions Node sur Vercel)
```

## Travailler en local

Node.js est installé dans `~/.local/node`. Si `node` n'est pas reconnu dans le terminal :

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

```bash
npm run dev     # site sur http://localhost:3000, admin sur http://localhost:3000/admin/
npm run cms     # (2e terminal) permet à /admin d'écrire directement dans les fichiers locaux
npm run build   # génère dist/ (ce que fait Vercel)
```

## Modifier le contenu (au quotidien)

1. Aller sur `https://<ton-domaine>/admin/` et se connecter avec GitHub.
2. **Projets** : modifier, créer (« + Projet »), réordonner (champ « Ordre »), masquer (« Brouillon ») ou supprimer.
3. **Réglages du site** : accroche, À propos, parcours, contact, réseaux, SEO.
4. **Publier** → commit sur GitHub → Vercel redéploie en ~1 minute.

Un projet n'a besoin que d'un identifiant et d'un titre : tout le reste a des valeurs par défaut
(palette, visuels générés). Les images sans ratio prennent automatiquement leurs proportions.
Les animations « boucles » sont du code (`src/js/loops.js`) : le CMS permet de choisir parmi les existantes.

## Mise en ligne — étapes restantes

1. **Installer les outils développeur Apple** (nécessaires pour git) :
   ```bash
   xcode-select --install
   ```
2. **Créer le dépôt GitHub** (privé) : `TrkDsgn/Portfolio-CMS`, puis :
   ```bash
   cd ~/PORTFOLIO/portfolio
   git init -b main && git add . && git commit -m "Portfolio : Node + Decap CMS"
   git remote add origin https://github.com/TrkDsgn/Portfolio-CMS.git
   git push -u origin main
   ```
3. `public/admin/config.yml` pointe déjà sur `TrkDsgn/Portfolio-CMS`.
4. **Vercel** → ton projet existant → Settings → **Git** → *Connect Git Repository* → `Portfolio-CMS`.
   Le `vercel.json` règle déjà la commande de build (`npm run build`) et le dossier de sortie (`dist`).
   Settings → Build & Development → Framework Preset : **Other**.
5. **GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps → New) :
   - Homepage URL : `https://<ton-domaine>`
   - Authorization callback URL : `https://<ton-domaine>/api/callback`
6. **Vercel** → Settings → Environment Variables : `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`
   (Production), puis redéployer.
7. Tester `https://<ton-domaine>/admin/`.

> La connexion au CMS fonctionne sur le domaine de production (celui déclaré dans l'OAuth App),
> pas sur les URLs de preview Vercel.

## Régénérer depuis l'ancien site

`scripts/migrate-legacy.mjs` a servi une seule fois à découper l'ancien `index.html` (8 Mo, images en base64).
Ne pas le relancer : il écraserait le contenu modifié depuis.
