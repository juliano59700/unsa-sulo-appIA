# UNSA SULO — Application web

Application web de soutien aux adhérents UNSA SULO. Fiches juridiques, modèles de courriers, calculateurs, assistant IA, annuaire des élus.

## Déploiement Netlify — pas à pas

### 1. Push sur GitHub

```bash
cd unsa-sulo-app
git init
git add .
git commit -m "Initial"
git branch -M main
git remote add origin https://github.com/<ton-user>/unsa-sulo-web.git
git push -u origin main
```

### 2. Créer le site Netlify

1. Va sur https://app.netlify.com/ → **Add new site** → **Import from Git**
2. Choisis ton repo `unsa-sulo-web`
3. Laisse les paramètres par défaut (Netlify détecte la config dans `netlify.toml`)
4. Clique **Deploy**

### 3. Configurer les variables d'environnement

Dans Netlify : **Site settings → Environment variables → Add a variable**

| Clé | Valeur | Pour quoi |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (ta clé) | Permet à l'assistant IA de fonctionner |
| `ADMIN_PASSWORD` | un mot de passe fort | Protège le mode admin (par défaut : `unsa-sulo-2026`) |

**Obtenir une clé Anthropic :** https://console.anthropic.com/ → API Keys → Create Key. Crédit gratuit au début, puis ~3 €/mois pour usage syndical typique.

Puis : **Deploys → Trigger deploy → Clear cache and deploy site** pour appliquer les variables.

### 4. Tester

L'app est en ligne à `https://<ton-site>.netlify.app`.

- Va dans **Profil → Mode administrateur** → entre `ADMIN_PASSWORD`
- Ajoute des élus avec leurs photos (depuis ton téléphone)
- Ajoute une annonce sur l'accueil
- Teste l'IA

Tu peux aussi ajouter un domaine perso (Site settings → Domain management).

## Architecture

```
unsa-sulo-app/
├── src/
│   ├── App.jsx          ← App complète
│   ├── main.jsx
│   └── index.css
├── netlify/functions/
│   ├── chat.mjs         ← Proxy IA Anthropic (protège la clé)
│   └── data.mjs         ← CRUD via Netlify Blobs (vraie BDD)
├── public/
│   └── manifest.webmanifest  ← Pour installer comme app
├── netlify.toml
├── package.json
└── README.md
```

**Base de données :** Netlify Blobs (gratuit, inclus). Stocke les élus, les annonces, etc. Lecture publique, écriture protégée par token admin.

**IA :** Claude Sonnet 4 via proxy serveur. La clé n'est jamais exposée au navigateur.

**Persistence locale :** localStorage pour le prénom, le thème, et cache hors-ligne des données.

## Sécurité

- Mot de passe admin **dans Netlify env var**, jamais dans le code public
- Clé Anthropic côté serveur uniquement
- Toute écriture sur `/api/data` nécessite le bearer token
- Lecture des données publique (élus, annonces) — pas de données personnelles côté serveur

## Modifications futures

- **Changer le mot de passe admin** : modifie `ADMIN_PASSWORD` dans Netlify + dans `src/App.jsx` ligne ~15 (constante `ADMIN_PASSWORD`)
- **Ajouter une fiche** : édite la constante `FICHES` dans `src/App.jsx` (~ligne 100)
- **Ajouter un modèle de courrier** : édite `COURRIERS` dans `src/App.jsx`
- **Changer le logo** : remplace le base64 dans `LOGO_B64` (`src/App.jsx`)

## Coûts

- Netlify : gratuit jusqu'à 100 Go/mois de bande passante (largement suffisant)
- Netlify Blobs : gratuit jusqu'à 1 Go de stockage
- Anthropic API : pay-as-you-go. ~0,003 € par question. Pour 500 questions/mois : ~1,50 €/mois.

**Total ≈ 0 à 3 €/mois pour un usage syndical normal.**

## Support

Application développée comme prototype. Pour usage public officiel UNSA :
- Faire valider le contenu juridique par un avocat
- Configurer un domaine pro et des emails dédiés
- Mettre en place un suivi RGPD (mentions légales, politique de confidentialité)

---

**Version :** 1.0.0
**Stack :** React + Vite + Tailwind + Netlify (Functions + Blobs) + Anthropic Claude
