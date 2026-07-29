# Tasks — Patrick Web App

> Checklist d'implémentation. Cochez au fur et à mesure. Ordre par dépendance.
> **NA** = faisable sans AWS · **AWS** = nécessite la réactivation du compte.
>
> Dernière mise à jour : 2026-07-28.

## 1. Cadrage (OpenSpec) — NA
- [x] 1.1 `design.md` (archi Bedrock + serverless)
- [x] 1.2 `proposal.md` (pourquoi/quoi/scope)
- [x] 1.3 `tasks.md` (ce fichier)
- [ ] 1.4 `openspec init` dans le repo + `/opsx:propose patrick-webapp` pour générer les delta-specs
- [ ] 1.5 Trancher D4 (Vercel vs Lambda) et D5 (GitHub Actions vs EventBridge)

## 2. Corpus (le carburant) — NA
- [ ] 2.1 Link-check des fiches restantes (09, 10, 11, 12, 14) — signaler morts/dérivés/périmés
- [ ] 2.2 OCR ou remplacer `pvt-canada.pdf` (scanné/illisible)
- [ ] 2.3 Nettoyer `Immigrant Qc.docx` (bandeau cookies / copier-coller web)
- [ ] 2.4 Ranger les 2 fichiers hors-scope restants dans `_hors-perimetre-Patrick/`
- [ ] 2.5 Geler le corpus v1 : périmètre MVP = 15 fiches (WWOOFing/van/anglais → v2)
- [x] 2.6 Enrichir 03 (agent immobilier + liens + assurance), 05 (bundling/Fongo/TextNow), 04 (EQ/Tangerine/Wise/rates.ca)
- [ ] 2.7 Procédure « ajouter une fiche » documentée (design §11) : drop `.md` → re-sync KB, aucun redéploiement

## 3. Frontend (chat) — NA
- [ ] 3.1 `patrick-app/index.html` : chat UI FR/EN, bascule langue, disclaimer visible
- [ ] 3.2 Rendu des réponses + liens sources cliquables
- [ ] 3.3 Retrieval/réponse **mockés** (données factices) pour développer sans backend
- [ ] 3.4 États : chargement, erreur, « Patrick se repose » (plafond atteint)
- [x] 3.5 Layout mobile correct (grille 4 blocs responsive)
- [x] 3.6 Bouton « Copier / Télécharger le récap » (fil + sources, sans PII) — design §12
- [x] 3.7 4 blocs thématiques × 3-5 questions cliquables (FR/EN)

## 4. Backend serverless — partiellement NA
- [x] 4.1 Fonction `/api/chat` : squelette + contrat d'API (mock, testé) — NA
- [x] 4.2 Rate-limit par IP + plafond quotidien global (testé) — NA
- [x] 4.3 Prompt système Patrick (repris du SKILL) — NA
- [ ] 4.4 Brancher la génération sur **Claude/Bedrock** (API Converse) — AWS
- [ ] 4.5 Brancher le retrieval sur la **Knowledge Base** — AWS
- [ ] 4.6 Hook « question sans réponse » : détecter + logger (sans PII) + notifier Em — AWS/backend
- [x] 4.7 Front câblé sur `/api/chat` (fetch + fallback mock si pas de serveur) — testé end-to-end — NA

## 5. RAG / Bedrock — AWS
- [x] 5.1 Bucket S3 (`patrick-corpus-barea-2026`) + upload du corpus `corpus/*.md`
- [~] 5.2 Créer la Knowledge Base (embeddings Titan V2, région ca-central-1) — en cours
- [x] 5.3 Store vectoriel = **Amazon S3 Vectors** (Quick create) — décision D3 ✅
- [ ] 5.4 Sync ingestion + test retrieval (top-k pertinent sur questions types) + noter le KB ID

## 6. Cron & fraîcheur — NA (GitHub Actions) ou AWS (EventBridge)
- [x] 6.1 Montreal Hub weekly refresh — chemin cible corrigé (pointe `Artifacts/`, plus un scratch de session)
- [ ] 6.2 Veille sujets sensibles au temps (tirages PVT, deals) via web search

## 7. Déploiement & garde-fous — mixte
- [x] 7.1 Déployé sur **Vercel** (repo GitHub `PATRICK-webApp`, root `patrick-app`, preset Other) — **EN LIGNE** ✅
- [x] 7.2 Identifiants AWS en variables d'env Vercel (jamais côté client) ✅
- [ ] 7.3 **AWS Budgets + hard spend limit** + alerte
- [ ] 7.4 Disclaimer + note de confidentialité visibles à l'écran
- [ ] 7.5 AWS Budgets (alerte email 50/80/100 %) + Cost Anomaly Detection — garde-fou coût

## 9. Feedback & quota bonus — Phase 2 (voir design §13)
- [ ] 9.1 Feedback anonyme 👍/👎 + texte optionnel (zéro PII), loggé
- [ ] 9.2 Débloquer +4 questions contre feedback, 1×/jour/IP, borné par plafond global
- [ ] 9.3 Nécessite le stockage partagé du rate-limit (Redis/Supabase)

## 8. Vérification (Definition of Done)
- [ ] 8.1 Tester : mono-nationalité, bi-nationalité, hors-sujet, sans-réponse
- [ ] 8.2 Zéro hallucination sur 5-6 questions (sources réelles affichées)
- [ ] 8.3 Rate-limit + plafond quotidien se déclenchent quand poussés
- [ ] 8.4 FR et EN OK ; aucune fuite de clé ; budget plafonné
- [ ] 8.5 `/opsx:verify` puis `/opsx:archive`
