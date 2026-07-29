# Patrick — Brief de reprise (handoff Cowork)

*Document autoportant. À déposer au début d'une nouvelle session Cowork pour reprendre le projet Patrick là où on l'a laissé. Dernière mise à jour : 2026-07-28.*

---

## 1. C'est quoi Patrick

**Patrick** est un assistant conversationnel bilingue (FR/EN), chaleureux et discipliné sur ses sources, qui aide les jeunes en **PVT / WHV / WHM (Working Holiday, toutes nationalités EIC)** — et les nouveaux arrivants — à **préparer et réussir leur installation à Montréal / au Québec**.

Il existe sous deux formes reliées :

- un **corpus** de fiches (le « carburant » du chatbot RAG de la webApp) ;
- un **skill Cowork** (`patrick-montreal-guide`) qui définit sa personnalité et ses règles.

Repo public : https://github.com/Emederik/Patrick-GPT-assistant

## 2. Où vivent les choses (dossier `PATRICK webApp`)

- `corpus/` → **15 fiches** `.md` + `README.md` (schéma + règles RAG). **C'est le cœur.**
- `patrick-montreal-guide/SKILL.md` → le skill (identique à la version installée dans Cowork).
- Sources brutes utiles (venir au Québec) : `Cartographie … à destination du Québec.docx`, `répertoire d'ingénierie réglementaire…docx`, `Inventaire des pages FAQ EIC, PVT, WHM.docx`, `FAQ PVT Canada .docx`, `FAQ country specific .docx`, `Complement info…docx`, `Immigrant Qc.docx`, `Desjardins.docx`, `Répertoire des 18 universités…xlsx`, `Cost of Living…html`, `LPR1-Vivre_a_Montreal.pdf`, `patrick-volet-etudiant-spec_1.md`, `grille-faq-universites-quebec.md`.
- `_hors-perimetre-Patrick/` → doublons, hors-scope, sources tierces, fichiers inutilisables (voir son `INDEX.md`).
- `AUDIT-Patrick_2026-07-27.md` → rapport d'audit complet du dossier.

## 3. État du corpus (15 fiches)

`00` avant le départ (PVT/EIC, nationalité·s, bi-nationalité, assurance, budget) · `01` NAS · `02` santé/RAMQ · `03` logement/bail · `04` banque · `05` téléphone/internet · `06` emploi/CV · `07` hiver · `08` culture · `09` découvrir Montréal · **`10` transport** (STM/Chrono, intercité, permis SAAQ, voiture/autopartage) · **`11` PVT par nationalité** (panorama officiel des 36 pays EIC) · **`12` arnaques & sécurité** · **`13` bien-être / coup de dur** (+ se créer un réseau) · **`14` diversité & inclusion**.

Les fiches `10→14` ont été créées/refondues cette session ; toutes sont sourcées et datées.

## 4. Règles de comportement de Patrick (dans le SKILL, déjà en place)

- **Demande toujours la ou les nationalité(s)** — jamais « la nationalité » par défaut, jamais France par défaut. Gère la **bi-nationalité** (comparer les volets, choisir le plus avantageux).
- **Périmètre strict PVT/WHM + installation à Montréal.** Hors sujet → refus **courtois** (« ceci n'est pas dans mes attributions »). **Aucune grossièreté ni insulte**, jamais, même face à un utilisateur agressif.
- **Question sans réponse** (mais dans le périmètre) → ne devine pas : « C'est une excellente question, je la note pour notre équipe », **log + notification**. ⚙️ *La notification réelle reste à câbler côté backend.*
- **Sources d'abord, jamais inventer.** Cite l'organisme officiel, date, signale l'incertitude.
- **Aucune donnée personnelle** demandée ni conservée.
- **Inclusion** : accueille tout le monde à égalité (minorités, autochtones, handicap visible/invisible, 2SLGBTQ+).

## 5. Ce qui a été fait cette session

- Corrigé le biais « France-only » partout (corpus + les 2 SKILL.md) ; ouverture aux **36 pays EIC**.
- **Panorama officiel des 36 pays** vérifié un par un sur canada.ca (âge, durée, participations). Découvertes : Corée du Sud **24 mois / 2×** (réforme en vigueur), Portugal **24 mois** ; UK 24 puis 12 ; NZ 23 mois.
- Notes multi-nationalités ajoutées (RAMQ = entente France-Québec ≠ tous ; permis SAAQ = liste précise + « pas l'Australie »).
- 3 nouvelles fiches : arnaques/sécurité, bien-être, diversité/inclusion ; fiche SAAQ élargie en **transport**.
- Rangement du dossier (doublons + hors-scope mis de côté) ; audit écrit.
- Corrections factuelles : **Greyhound Canada fermé (2021)** → Orléans Express/FlixBus ; app transport = **Chrono (ARTM)**, pas « Chronos ».

## 6. À faire / décisions ouvertes (pour la prochaine session)

1. **Câbler la notification** « question sans réponse → prévenir Em » (hook backend : capter question + horodatage, stocker, notifier).
2. **Déplacer 2 fichiers encore ouverts** dans LibreOffice vers `_hors-perimetre-Patrick/` : `Inventaire des pages FAQ.docx` (doublon) et `Évaluation comparative…docx` (hors-scope).
3. **`pvt-canada.pdf`** = scanné/illisible → OCR ou remplacer, sinon inutilisable par le RAG.
4. **`Immigrant Qc.docx`** = copier-coller web (bandeau cookies) → nettoyer.
5. **Droits d'usage** du guide tiers pvtistes.net (366 p.) → citer, pas copier.
6. Angles repérés dans le guide mais **pas encore transformés en fiches** : WWOOFing/HelpX/Workaway, achat voiture/van, améliorer son anglais.
7. **Fiche handicap** : peu de témoignages récents → un vrai retour d'expérience la renforcerait.
8. **Vérifier que les ~10 sites de sorties** (fiche 13) sont actifs (pas de lien mort).
9. Confirmer le remplacement des liens « Chronos » par **Chrono** (fait, à valider).

## 7. Garde-fous & style de travail (Em)

- **Rien inventer** : pas de faux chiffres, URLs, citations. Vérifier avant d'affirmer, signaler l'incertitude.
- Réponses **concises, structurées** (tableaux, gras sur les mots-clés), un peu d'humour, **coach critique** (pas de « yes-man »).
- Em est **bilingue FR/EN + espagnol**, Montréalaise, franco-canadienne. Répondre en français par défaut ici.
- Poser des questions de clarification (AskUserQuestion) avant les gros chantiers.

---

*Reshape, don't restart. — fin du brief.*
