# Handoff → Claude Code — Patrick web app

*À ouvrir dans Claude Code pour continuer le build via OpenSpec. Dernière mise à jour : 2026-07-28.*

---

## 0. Démarrage (3 étapes)

1. Ouvre le dossier **`PATRICK webApp`** dans Claude Code.
2. **Redémarre l'IDE** (charge les commandes `/opsx:` installées dans `.claude/`).
3. Colle le prompt du **§1** ci-dessous.

## 1. Prompt à coller dans Claude Code

```
Continue le projet Patrick (web app RAG bilingue pour PVTistes à Montréal) via OpenSpec.
Le change est déjà cadré et validé : openspec/changes/patrick-webapp/ (proposal, design, specs, tasks).

D'abord : lis openspec/changes/patrick-webapp/design.md et tasks.md, puis lance /opsx:apply patrick-webapp.

Règles :
- Avance UNIQUEMENT les tâches marquées "NA" (non-AWS) dans tasks.md. Les tâches "AWS" restent en attente : mon compte AWS est suspendu (réactivation demandée).
- Prochaine priorité NA : câbler le front (patrick-app/index.html) sur la vraie fonction patrick-app/api/chat.js via fetch('/api/chat'), en gardant le mock en fallback si l'API ne répond pas.
- Ne touche pas au corpus/ ni aux liens sans me demander (chaque lien a été vérifié vivant à la main).
- Respecte le prompt système : patrick-app/api/patrick-system-prompt.md.
- Ne fabrique jamais d'URL ni de fait. Teste ce que tu écris.
```

## 2. État d'avancement (≈13/39 tâches)

**Fait (non-AWS) :**
- Corpus 15 fiches vérifiées ; enrichissements logement/télécom/banque ; liens re-testés (Greyhound→FlixBus, toutMontréal→Logego, Eater retiré).
- `corpus/README.md §7` : procédure de maintenance (ajouter/éditer/retirer fiche & lien → re-sync KB).
- Front `patrick-app/index.html` : chat FR/EN, disclaimer, **4 blocs de questions cliquables**, **bouton récap copier/télécharger**, mock 18 sujets.
- Back `patrick-app/api/chat.js` : contrat d'API, **rate-limit + plafond quotidien**, prompt système chargé, **auto-test 7/7** (`node api/chat.js`).
- OpenSpec initialisé + `validate` OK ; commandes `/opsx:` dans `.claude/`.
- Tâche planifiée « Montreal Hub weekly refresh » : chemin corrigé vers `Artifacts/`.

**Reste NA (à faire dans Claude Code) :**
- Câbler front ↔ `/api/chat` (fetch + fallback mock).
- Bouton récap : rien à faire (déjà là) — juste vérifier après câblage.
- 2.7 : procédure « ajouter une fiche » (déjà documentée, à garder en tête).

**Reste AWS-gated (après réactivation du compte) :**
- S3 + Bedrock Knowledge Base (embeddings Titan) — ⚠️ **store vectoriel : Aurora pgvector / Pinecone, PAS OpenSearch Serverless** (coût plancher élevé).
- Génération via Bedrock Claude (API Converse) — remplacer `mockGenerate()`.
- Retrieval KB — remplacer `mockRetrieve()`.
- Hook « question sans réponse » : remplacer `logUnanswered()` par insert + notif Em.
- AWS Budgets + hard spend limit.

## 3. Fichiers clés

| Chemin | Rôle |
|---|---|
| `openspec/changes/patrick-webapp/design.md` | Archi Bedrock + décisions (dont §11 extensibilité, §12 récap) |
| `openspec/changes/patrick-webapp/tasks.md` | Checklist NA / AWS |
| `openspec/changes/patrick-webapp/specs/patrick-chat/spec.md` | Requirements + scénarios |
| `patrick-app/index.html` | Front (mock) — visuel & questions modifiables (`BLOCKS`) |
| `patrick-app/api/chat.js` | Backend serverless (mock) — points Bedrock commentés |
| `patrick-app/api/patrick-system-prompt.md` | Prompt système de Patrick |
| `corpus/` | 15 fiches + README (schéma + maintenance) |

## 4. Décisions ouvertes (à trancher pendant l'apply)

- **D4** : hébergement front+API → Vercel/Netlify **vs** Lambda+API Gateway.
- **D5** : cron → GitHub Actions **vs** EventBridge.
- Vérifier tarifs : store vectoriel, modèles Claude/Bedrock, région.

## 5. Garde-fous (à ne pas oublier)

- Rien inventer (faits, URLs, chiffres) ; tester chaque lien avant insertion.
- Aucune donnée personnelle stockée ; disclaimer visible à l'écran.
- Demander la/les nationalité(s) — jamais « France » par défaut.
- Budget AWS plafonné avant toute mise en production.

---

*Reshape, don't restart. — fin du handoff.*
