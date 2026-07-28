# Design — Patrick Web App (RAG + AWS Bedrock)

> **Le « comment ».** Ce document fige l'architecture technique et les décisions structurantes *avant* d'écrire du code. À lire avec `proposal.md` (le pourquoi/quoi) et `tasks.md` (la checklist), générés via `/opsx:propose patrick-webapp`.
>
> ⚠️ **Vérifier-avant-de-provisionner :** noms de modèles, tarifs et limites de tiers gratuits changent souvent. Chaque détail vendeur ci-dessous est à confirmer sur la page officielle du fournisseur. Rien ici n'est un conseil d'immigration, légal ou financier.
>
> Dernière mise à jour : 2026-07-28.

---

## 1. Contexte & objectif

Transformer **Patrick** (assistant bilingue FR/EN pour PVTistes/WHM s'installant à Montréal) en **web app publique sans login**, où l'on discute avec Patrick, qui répond en s'appuyant sur un **corpus curé de 15 fiches** (RAG), cite ses sources, et garde ses garde-fous (nationalité demandée, périmètre strict, aucune donnée personnelle, « vérifier avec un pro »).

**Nouveauté vs le plan du 16 juillet :** on passe d'un « LLM + web search sans RAG » à un **RAG ancré sur le corpus, servi par AWS Bedrock** — ce qui améliore la fidélité aux sources *et* apporte une ligne « AWS / GenAI » concrète au portfolio d'Em.

**Principe directeur :** livrer la plus petite chose qui aide réellement un nouvel arrivant, puis grossir.

---

## 2. Architecture (vue d'ensemble)

```
  Navigateur visiteur          Backend serverless (caché)              AWS Bedrock
 ┌──────────────────┐  msg   ┌────────────────────────────┐  API  ┌────────────────────┐
 │  index.html      │ ─────► │  /api/chat (fonction)      │ ────► │  Knowledge Base     │
 │  chat UI FR/EN   │ ◄───── │  • prompt système Patrick  │ ◄──── │  (retrieval RAG)    │
 │  disclaimer      │  reply │  • rate-limit + daily cap  │       │  Claude (génération)│
 └──────────────────┘        │  • pas de clé côté client  │       │  Titan (embeddings) │
                             └────────────┬───────────────┘       └─────────┬──────────┘
                                          │ log question sans réponse         │ ingère
                                          ▼                                   ▼
                                   Table (Supabase/Aurora)              S3 : corpus/*.md
```

Quatre briques :

1. **Frontend** — une page HTML : zone de chat, bascule FR/EN, disclaimer visible, rendu des réponses + liens sources.
2. **Backend serverless** — une fonction qui détient le prompt système, appelle Bedrock (retrieval + génération), applique rate-limit et plafond quotidien, et garde les identifiants AWS (jamais dans le navigateur).
3. **AWS Bedrock** — **Knowledge Base** pour le RAG (ingestion du corpus depuis S3, chunking, embeddings Titan, retrieval), **Claude sur Bedrock** pour la génération, **Titan Embeddings** pour la vectorisation.
4. **Persistance légère** — une table pour logger les « questions sans réponse » (horodatage + question, **sans PII**) → notification à Em.

---

## 3. Flux de données

**Ingestion (batch, à chaque mise à jour du corpus) :**
`corpus/*.md` → push S3 → sync Knowledge Base → chunk + embeddings Titan → magasin vectoriel.

**Requête (temps réel) :**
message visiteur → `/api/chat` → retrieval KB (top-k chunks pertinents) → prompt (système Patrick + chunks + question) → Claude/Bedrock → réponse + sources citées → navigateur.
Si aucun chunk pertinent **et** question dans le périmètre → réponse « je note pour l'équipe » + **log** (hook question-sans-réponse).

---

## 4. Choix techniques

| Brique | Choix | Rationale | Alternative |
|---|---|---|---|
| LLM génération | **Claude sur Bedrock** (API Converse) | Showcase AWS + qualité bilingue | Anthropic API directe (plan v1) |
| Embeddings | **Titan Embeddings** (Bedrock) | Natif, simple | Cohere/OpenAI |
| RAG | **Bedrock Knowledge Base** (managed) | Ingestion+retrieval gérés, moins de code | Retrieval DIY (LangChain + pgvector) |
| Magasin vectoriel | **Aurora Serverless pgvector** *ou* **Pinecone** | ⚠️ coût maîtrisé (voir §6) | OpenSearch Serverless (à éviter, cf. §6) |
| Stockage corpus | **S3** | Source d'ingestion de la KB | — |
| Front + API | **Vercel/Netlify** *ou* **Lambda + API Gateway** | Vercel = plus simple ; Lambda = plus « AWS » | à trancher (D4) |
| Cron (hub + veille) | **GitHub Actions** *ou* **EventBridge Scheduler** | GHA gratuit, repo déjà sur GitHub | à trancher (D5) |
| Log questions | **Supabase** *ou* **Aurora** | Table simple, tier gratuit | DynamoDB |

---

## 5. Décisions (ADR)

**D1 — RAG sur corpus vs web-search seul → hybride.**
Le v1 (16 juillet) misait sur le web search. On garde le **corpus curé comme ancrage principal** (fidélité aux sources vérifiées d'Em) et on réserve le **web search aux sujets sensibles au temps** (tirages PVT, deals, événements — comme le hub weekly refresh). Décidé : RAG-first, web-search en complément.

**D2 — Bedrock Knowledge Base (managed) vs retrieval DIY.**
KB managed retenue : moins de plomberie, ingestion+embeddings+retrieval intégrés, bon pour un MVP solo. On accepte un léger vendor-lock AWS (assumé, c'est le but portfolio).

**D3 — Magasin vectoriel : ~~Aurora pgvector~~ → TRANCHÉ = Amazon S3 Vectors. ✅ (2026-07-28)**
La console Bedrock propose **« Quick create » avec Amazon S3 Vectors** : Bedrock crée et gère le store lui-même, **sans base de données ni SQL**, optimisé **coût + durabilité**. On abandonne donc Aurora pgvector (trop technique) **et** OpenSearch Serverless (⚠️ coût plancher élevé). C'est le meilleur rapport simplicité/coût pour ce projet. Dimension d'embedding : **1024** (Titan V2 par défaut).

**D4 — Hébergement front+API : Vercel vs Lambda.** *(ouvert)*
Vercel/Netlify = déploiement le plus simple, appelle Bedrock via SDK AWS (clés IAM en variables d'env). Lambda+API Gateway = 100 % AWS, meilleur récit portfolio, un peu plus de setup. À trancher.

**D5 — Cron : GitHub Actions vs EventBridge.** *(ouvert)*
GHA = gratuit, repo déjà là, idéal pour le hub weekly refresh + la veille. EventBridge = AWS-natif si on veut tout côté AWS. Penchant : GHA pour le MVP.

---

## 6. Garde-fous de coût (à lire deux fois)

Un chatbot public sans login = porte ouverte sur la facture. Protections non négociables v1 :

- **Rate-limit par visiteur** (ex. N messages/IP/heure).
- **Plafond quotidien global** → au-delà, « Patrick se repose, reviens demain ».
- **Plafonner `max_tokens`** (réponses plus courtes = moins cher).
- **Modèle plus léger** pour un bot public à trafic (un plus gros seulement si la qualité l'exige). *(Vérifier le line-up + tarifs Bedrock.)*
- **⚠️ Store vectoriel** : le plus gros risque de coût caché (cf. D3), pas les tokens.
- **Hard spend limit / budget AWS** en dernier rempart (AWS Budgets + alerte).
- Captcha léger optionnel contre les bots.

---

## 7. Comportement & garde-fous produit (déjà dans le SKILL)

- **Demander la/les nationalité(s)** — jamais France par défaut ; gérer la bi-nationalité.
- **Périmètre strict** PVT/WHM + installation Montréal → hors-sujet = refus courtois, **aucune grossièreté**.
- **Question sans réponse** (mais dans le périmètre) → ne pas deviner : « je la note pour notre équipe » + **log + notification** (⚙️ hook backend à câbler).
- **Sources d'abord**, jamais inventer ; citer l'organisme officiel + date + signaler l'incertitude.
- **Aucune donnée personnelle** demandée ni conservée ; disclaimer « info générale, pas un conseil officiel » **visible à l'écran**, pas seulement dans les réponses.

---

## 8. Séquencement autour du blocage AWS

Le compte AWS d'Em est suspendu (réactivation demandée). **Ça ne bloque pas le démarrage** : les étapes non-AWS avancent en parallèle.

| Faisable maintenant (sans AWS) | En attente de réactivation AWS |
|---|---|
| `openspec init` + `/opsx:propose` | Créer la Knowledge Base |
| Finaliser ce `design.md` | Bucket S3 + ingestion du corpus |
| Corpus : link-check fiches restantes, OCR `pvt-canada.pdf`, nettoyer `Immigrant Qc.docx` | Brancher `/api/chat` sur Bedrock |
| Scaffold front chat + structure repo | Câbler le hook question-sans-réponse |
| Mock du retrieval (données factices) pour développer le front | Budgets AWS + hard spend limit |

---

## 9. À vérifier (open questions)

1. **Tarif du store vectoriel** (OpenSearch Serverless vs Aurora pgvector vs Pinecone) — chiffres à confirmer avant de choisir (D3).
2. **Line-up + prix des modèles Claude sur Bedrock** dans la région choisie.
3. **Région Bedrock** (dispo des modèles + latence + résidence des données).
4. D4 (Vercel vs Lambda) et D5 (GHA vs EventBridge) à trancher.
5. Délai de réactivation du compte AWS.

---

## 10. Definition of Done (MVP)

**Dans le scope :** page chat FR/EN publique, RAG sur les 15 fiches via Bedrock KB, réponses avec sources citées, rate-limit + plafond quotidien actifs et **testés**, disclaimer visible, hook question-sans-réponse qui logue, aucune PII stockée.

**Hors scope v1 :** export PDF, widget embarquable, analytics avancées, comptes utilisateurs (→ phases 2-3 du build plan).

**Critères de succès (vérifiables) :**
- Une question mono-nationalité, une bi-nationalité, une hors-sujet, une sans-réponse → comportements attendus.
- Zéro hallucination sur un échantillon de 5-6 questions (sources affichées et réelles).
- Le rate-limit et le plafond quotidien se déclenchent quand on les pousse.
- Budget AWS plafonné, aucune fuite de clé côté client.

---

## 11. Extensibilité du corpus (ajouter une fiche plus tard)

Le corpus est **conçu pour grandir** — ajouter une fiche n'oblige jamais à reconstruire l'app.

Procédure pour une nouvelle fiche :

1. Créer `corpus/NN-nom.md` en suivant le **schéma du README** (front-matter + blocs `### [id]` avec `audience` / `nationalite` / `tags` / `source` / `dernière_vérif` / `confiance`).
2. Push vers S3 (ou commit repo → sync).
3. **Re-synchroniser la Knowledge Base** (ré-ingestion) : elle re-chunk + re-embed uniquement le nouveau contenu. Aucune interruption de service, aucun redéploiement du front/back requis.

C'est une opération de **données**, pas de **code** — d'où l'intérêt du RAG managé (Bedrock KB). Idem pour éditer une fiche existante (ex. enrichissements logement/télécom/banque de cette session) : re-sync et c'est pris en compte.

## 12. Compte rendu copiable / téléchargeable (déjà prévu)

Fonctionnalité **planifiée** (Phase 2 du build plan + déjà dans le SKILL de Patrick « recap téléchargeable en fin d'échange »). Côté web app : bouton **« Copier le récap »** / **« Télécharger (.md/.pdf) »** qui reprend le fil de l'échange + les sources citées, **sans PII**. Peut être ajouté au front mocké dès maintenant (indépendant d'AWS).

## 13. Feedback & quota bonus (Phase 2)

Idée : collecter du **feedback anonyme** et récompenser l'utilisateur par **+4 questions** quand il atteint sa limite.

- **Feedback léger** : 👍/👎 + champ texte **optionnel**, **anonyme** (zéro PII), loggé comme signal d'amélioration (même canal que « question sans réponse » → utile à Em).
- **Mécanique** : à l'atteinte de la limite → Patrick propose « donne ton avis et je débloque **+4 questions** » → à la soumission, quota +4 pour cette IP **ce jour-là**.
- **Anti-abus** : bonus **1 fois / jour / IP** ; le feedback ne doit pas devenir un contournement infini du plafond.
- **Dépendances** : nécessite le **stockage partagé du rate-limit** (Redis/Supabase) pour que le compteur « quota + bonus » tienne entre instances serverless. → **Phase 2**, après le RAG.
- **Garde-fou coût** : le bonus reste borné par le **plafond global quotidien** et le **budget AWS**.
