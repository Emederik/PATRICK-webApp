# Proposal — Patrick Web App

> Le « pourquoi » et le « quoi » de ce changement. À lire avec `design.md` (le comment) et `tasks.md` (la checklist).
>
> Statut : brouillon · Dernière mise à jour : 2026-07-28.

## Intent

Rendre **Patrick** — l'assistant bilingue FR/EN pour PVTistes / Working Holiday Makers (toutes nationalités EIC) s'installant à Montréal — accessible à tous via une **web app publique sans login**, plutôt que seulement comme Custom GPT (payant, ChatGPT Plus) ou skill Cowork. Objectif : un **service public gratuit** que n'importe quel nouvel arrivant peut ouvrir et interroger, ancré sur le corpus curé de 15 fiches, avec sources citées et garde-fous.

## Problème

- Le Custom GPT exige un abonnement ChatGPT Plus → barrière pour le public cible (jeunes, budget serré, en préparation de départ).
- Le savoir de Patrick vit dans un corpus `.md` non exposé au public.
- Aucune surface partageable (une URL) pour diffuser Patrick dans les communautés PVTistes.

## Scope

**Inclus (MVP) :**
- Page chat unique, bilingue FR/EN, sans login.
- Réponses ancrées sur les **15 fiches** via RAG (Bedrock Knowledge Base).
- Citations de sources réelles + disclaimer visible.
- Garde-fous : nationalité(s) demandée(s), périmètre strict, refus courtois, aucune PII.
- Hook « question sans réponse » → log + notification à Em.
- Garde-fous de coût : rate-limit, plafond quotidien, budget AWS plafonné.

**Exclus (phases ultérieures) :**
- Export PDF du récap, widget embarquable, analytics avancées, comptes utilisateurs, monétisation.

## Approche (résumé — détail dans design.md)

**RAG ancré sur le corpus, servi par AWS Bedrock** : Knowledge Base pour le retrieval, Claude sur Bedrock pour la génération, Titan pour les embeddings. Front + API serverless (Vercel ou Lambda). Web search réservé aux sujets sensibles au temps. Choix de Bedrock motivé aussi par sa valeur portfolio (AWS / GenAI appliqué).

## Contraintes connues

- **Compte AWS suspendu** (réactivation demandée) → le travail non-AWS (spec, corpus, front mocké) avance en parallèle ; le RAG Bedrock attend la réactivation.
- **⚠️ Coût du store vectoriel** : éviter OpenSearch Serverless (plancher élevé), privilégier Aurora pgvector / Pinecone — à vérifier.
- Tarifs, modèles et tiers gratuits à confirmer sur les pages officielles avant tout provisioning.

## Critères de succès

Une question mono-nationalité, une bi-nationalité, une hors-sujet et une sans-réponse produisent les comportements attendus ; zéro hallucination sur un échantillon de 5-6 questions (sources réelles affichées) ; rate-limit + plafond quotidien se déclenchent ; aucune fuite de clé, budget AWS plafonné.

## Hors périmètre / non-buts

Patrick ne donne **aucun conseil officiel** (immigration, santé, juridique, financier) — il informe et renvoie aux sources officielles (IRCC, RAMQ, TAL, SAAQ). Aucune donnée personnelle collectée ni conservée.
