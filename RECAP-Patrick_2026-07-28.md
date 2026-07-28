# Patrick — Récap de reprise (2026-07-28)

*À rouvrir pour reprendre le projet là où on s'est arrêtées. « Reshape, don't restart. »*

---

## 🎯 Où on en est

**Le cœur de Patrick fonctionne de bout en bout, en local :** un vrai chatbot RAG bilingue
(question → recherche dans le corpus → Claude Haiku répond en « Patrick »), branché sur AWS Bedrock.
Le biais « France par défaut » est corrigé (Patrick demande la/les nationalité(s)).

## ✅ Ce qui est fait

- **Corpus** : 15 fiches vérifiées + enrichies (logement/agent immobilier, télécom, banque, sorties…), liens re-testés vivants, README avec procédure de maintenance.
- **AWS (compte `barea`, région `ca-central-1`)** :
  - Utilisateur admin perso **`em-admin`** (console + MFA) — le root est rangé.
  - Utilisateur applicatif **`patrick-app`** (clé programmatique) + politique **`PatrickBedrockAccess`**.
  - **S3** : bucket `patrick-corpus-barea-2026` (corpus uploadé).
  - **Knowledge Base** `Patrick-kb` — **KB ID = `DAEUMVVECP`** — vector store **Amazon S3 Vectors**, embeddings **Titan V2**, synchronisée.
  - Génération : **Claude Haiku 4.5** via profil d'inférence **`global.anthropic.claude-haiku-4-5-...`**.
- **App** (`patrick-app/`) :
  - Front bilingue FR/EN : 4 blocs de questions cliquables, bouton récap (copier/télécharger), disclaimer.
  - Backend `api/chat.js` → **vrai Bedrock** (Retrieve + Converse + prompt système), fallback mock, rate-limit + plafond quotidien.
  - `server.js` (serveur local de test), `package.json`, `.env.local` (clés + IDs).
- **OpenSpec** : change `patrick-webapp` cadré et validé (proposal, design, specs, tasks).

## ▶️ Relancer Patrick en local (2 min)

Terminal :
```bash
cd "/Users/Manu/CLAUDE 2026/PATRICK webApp/patrick-app"
npm run dev
```
→ ouvre **http://localhost:3000**. Arrêter le serveur : **Ctrl+C**.
*(Le serveur doit afficher `Bedrock mode: ON`. Ne rien taper d'autre dans cette fenêtre pendant qu'il tourne.)*

## ⏭️ Ce qui reste (rien d'urgent)

1. **AWS Budgets** — cap de coût + alertes email (Billing → Budgets, ~20-50 $/mois, seuils 50/80/100 %). *Recommandé de le faire tôt.*
2. **Déploiement** — passer de `localhost` à une **URL publique** (Vercel/Netlify) : héberger le front + `/api/chat`, remettre les variables d'env (AWS + BEDROCK_*) côté hébergeur. → grande étape suivante.
3. **Phase 2** — feedback anonyme 👍/👎 + « +4 questions contre feedback » (déjà noté : `design.md §13`, tasks `9.x`).
4. Optionnel : renforcer `ramq-02` (mener avec la règle universelle avant le cas France) ; corriger le bouton récap après câblage ; tests multi-nationalités.

## ⚠️ À garder en tête

- **Ne jamais committer `.env.local`** (clés AWS) — déjà protégé par `.gitignore`. Vérifier : `git status` ne doit pas le lister.
- **Profil Haiku « Global »** : route la requête hors Canada possible. OK pour Patrick (zéro PII). Passer à un profil `ca.`/`us.` seulement si tu veux un routage restreint.
- **Rate-limit en mémoire** : efficace en local ; en prod serverless, il faudra un **stockage partagé** (Redis/Supabase) pour que le compteur tienne entre instances.
- Reprise possible **ici (Cowork)** pour tout le non-AWS, ou **Claude Code** pour `/opsx:apply`.

## 🗂️ Fichiers clés

| Chemin | Rôle |
|---|---|
| `patrick-app/index.html` | Front (visuel + questions `BLOCKS` modifiables) |
| `patrick-app/api/chat.js` | Backend Bedrock (Retrieve + Converse) |
| `patrick-app/api/patrick-system-prompt.md` | Prompt système de Patrick |
| `patrick-app/server.js` · `package.json` · `.env.local` | Lancer / dépendances / secrets |
| `corpus/` | 15 fiches + README (schéma + maintenance) |
| `openspec/changes/patrick-webapp/` | proposal · design · specs · tasks |
| `AWS-Bedrock-setup_ca-central-1.md` · `AWS-IAM-pas-a-pas.md` | Guides AWS |

---

*Prochain geste conseillé à la reprise : **AWS Budgets** (5 min), puis **déploiement**. — fin du récap.*
