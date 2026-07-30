<p align="center">
  <img src="assets/Patrick_Featured_Card.jpg" alt="Patrick — Your Personal Pro Guide for PVT Holders" width="680">
</p>

# Patrick — Architecture, organisation & outils

*Assistant conversationnel bilingue (FR/EN) qui aide les jeunes en PVT / Working Holiday à préparer
et réussir leur installation à Montréal. Ce document décrit comment le projet est construit.*

Dernière mise à jour : 2026-07-28 · En ligne : https://patrick-web-app.vercel.app/

---

## 1. En une phrase

Patrick est un **chatbot RAG** : il répond **uniquement à partir d'un corpus curé de fiches
vérifiées** (pas de l'imagination du modèle), en **citant ses sources**, avec des **garde-fous** de
comportement (demande la nationalité, périmètre strict, zéro donnée personnelle) et de **coût**.

## 2. Architecture (vue d'ensemble)

```
   Visiteur (navigateur)          Backend serverless (Vercel)              AWS Bedrock (ca-central-1)
 ┌───────────────────────┐  POST  ┌────────────────────────────┐  API   ┌──────────────────────────┐
 │  index.html            │ ─────► │  /api/chat (Node)          │ ─────► │  Knowledge Base (RAG)     │
 │  chat FR/EN, 4 blocs,  │        │  • prompt système Patrick  │ ◄───── │  → S3 Vectors (retrieval) │
 │  rendu Markdown,       │ ◄───── │  • rate-limit + plafond    │        │  Claude Haiku 4.5 (génère)│
 │  récap téléchargeable  │  JSON  │  • clés AWS (cachées)      │ ─────► │  Titan V2 (embeddings)    │
 └───────────────────────┘        └────────────────────────────┘        └───────────┬──────────────┘
                                                                                      │ ingère
                                                                                      ▼
                                                                          Amazon S3 : corpus/*.md
```

## 3. Le pipeline RAG (le cœur)

**Ingestion (une fois, puis à chaque mise à jour du corpus) :**
`corpus/*.md` → **S3** → la **Knowledge Base** chunk le texte (~300 tokens) → **Titan V2** en fait des
vecteurs (dim. 1024) → stockés dans **S3 Vectors**.

**Requête (temps réel) :**
question du visiteur → `/api/chat` → **Retrieve** (top-5 chunks les plus proches dans la KB) → on
assemble un prompt (**prompt système de Patrick** + chunks + question) → **Claude Haiku** génère via
l'API **Converse** → réponse + **sources citées** → affichée avec rendu Markdown.

> Résultat : Patrick est ancré sur **tes fiches**. S'il ne trouve rien de pertinent, il ne devine pas
> — il dit « je note pour l'équipe » (log), fidèle à sa règle « sources d'abord, jamais inventer ».

## 4. Stack technique & outils

| Couche | Outil | Rôle |
|---|---|---|
| **Génération (LLM)** | Claude **Haiku 4.5** sur Amazon Bedrock (profil d'inférence *global* CRIS) | Rédige les réponses en « Patrick » |
| **Embeddings** | Amazon **Titan Text Embeddings V2** (1024) | Transforme le corpus en vecteurs |
| **RAG / recherche** | Amazon **Bedrock Knowledge Base** | Ingestion + retrieval managés |
| **Magasin vectoriel** | Amazon **S3 Vectors** | Stocke/recherche les vecteurs (peu cher, zéro admin) |
| **Stockage source** | Amazon **S3** | Héberge le corpus `.md` |
| **Backend** | **Node** serverless (`/api/chat`) | Retrieve + Converse + garde-fous |
| **Frontend** | **HTML / CSS / JS** vanilla (1 fichier) | Chat bilingue, 4 blocs, rendu Markdown, récap |
| **Hébergement** | **Vercel** (plan gratuit) | Déploiement + fonctions serverless + HTTPS |
| **Code & versioning** | **GitHub** (repo privé) | Source de vérité + redéploiement auto |
| **Région cloud** | **ca-central-1** (Canada) | Résidence des données AWS |
| **Sécurité (identité)** | **IAM** : utilisateur dédié + politique *moindre privilège* | Clés cloisonnées |
| **Garde-fous coût** | **AWS Budgets** + **Cost Anomaly Detection** + rate-limit code | 3 niveaux de protection |
| **Méthode** | **OpenSpec** (spec-driven) | Cadrer avant de coder (proposal/design/specs/tasks) |
| **Co-construction** | **Cowork (Claude)** | Assistant tout au long du projet |

## 5. Organisation du dépôt

```
PATRICK webApp/
├── corpus/                       # 🧠 LE CARBURANT — 17 fiches .md vérifiées + README (schéma + maintenance)
├── patrick-app/                  # 🌐 LA WEB APP
│   ├── index.html                #    Front : chat FR/EN, 4 blocs, récap, rendu Markdown
│   ├── api/
│   │   ├── chat.js               #    Backend serverless : Retrieve (KB) + Converse (Haiku) + garde-fous
│   │   └── patrick-system-prompt.md  #  Personnalité + règles de Patrick
│   ├── server.js                 #    Serveur local de test (npm run dev)
│   ├── package.json · vercel.json #   Dépendances + config déploiement
│   └── .env.local                #    🔒 Secrets AWS (ignoré par git)
├── patrick-montreal-guide/       # Le skill Cowork (même personnalité, format skill)
├── openspec/changes/patrick-webapp/  # proposal · design · specs · tasks
├── _hors-perimetre-Patrick/      # Doublons / hors-scope mis de côté
├── docs/                         # 📚 Suivi & guides : AWS setup, RECAP, HANDOFF, BRIEF, AUDIT, build-plan, post LinkedIn
├── README.md                     # Ce document (page d'accueil du repo)
└── .gitignore                    # Protège .env.local, node_modules, etc.
```

## 6. Sécurité & garde-fous

- **Aucune donnée personnelle** demandée ni conservée ; disclaimer visible à l'écran.
- **Clés AWS jamais dans le code** : variables d'environnement (local `.env.local` ignoré par git ;
  prod = variables d'env Vercel). Utilisateur IAM dédié à droits minimaux (invoke Haiku + retrieve KB).
- **Coût borné** : rate-limit + plafond quotidien dans le code, **AWS Budgets** (20 $/mois, alertes) et
  **Cost Anomaly Detection** (résumé quotidien).
- **Fidélité** : réponses ancrées sur le corpus, sources citées, jamais d'URL/fait inventé.

## 7. Flux de travail (dev → prod)

1. Éditer un fichier (fiche, front, prompt…) en local.
2. **GitHub Desktop** : Commit → **Push**.
3. **Vercel** redéploie automatiquement (~1 min).
4. Vérifier sur https://patrick-web-app.vercel.app/ (astuce cache : `Cmd+Shift+R` ou `?v=X`).

Pour ajouter/éditer une **fiche** : déposer/modifier le `.md` dans `corpus/`, puis **re-synchroniser
la Knowledge Base** (ré-ingestion) — opération de **données**, pas de code.

## 8. Décisions clés (et pourquoi)

| Décision | Choix | Pourquoi |
|---|---|---|
| Magasin vectoriel | **S3 Vectors** (pas Aurora ni OpenSearch) | Le moins cher + zéro base de données à administrer |
| Modèle | **Haiku 4.5** (pas Sonnet/Opus) | Réponses ancrées sur corpus → pas besoin du plus lourd ; le moins cher |
| Région | **ca-central-1** | Résidence Canada (Claude via profil d'inférence inter-régions) |
| Retrieval + génération séparés | **Retrieve** puis **Converse** | Contrôle total du prompt système = comportement « Patrick » |
| Hébergement | **Vercel + GitHub** | Gratuit, serverless, redéploiement auto, code versionné |

## 9. Roadmap (optionnel)

- 🌐 Domaine custom · 💬 feedback anonyme + « +4 questions contre feedback » (Phase 2)
- 🔒 Durcir le rate-limit (stockage partagé Redis/Supabase) pour un vrai plafond en prod serverless
- 🎓 Version « étudiants » (le corpus est déjà tagué `audience: pvt | etudiant | commun`)

---

*Construit de zéro par Em (Emmanuelle Barea) — spécialiste mobilité internationale & prompt engineering.*
