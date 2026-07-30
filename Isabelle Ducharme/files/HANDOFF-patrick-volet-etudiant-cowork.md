# 📦 HANDOFF — Patrick GPT · Volet « Étudiant·e international·e »
### Document de passation pour reprise dans Cowork · 30 juillet 2026

> **Comment utiliser ce document** : c'est un brief auto-suffisant. Il résume tout
> le travail de la session d'origine pour qu'on puisse reprendre sans relire le chat.
> Deux fichiers l'accompagnent (voir §10). Reshape, don't restart.

---

## 1. 🎯 Objet & contexte

**Qui** : Em (Emmanuelle Barea) — conceptrice de Patrick GPT, guide bilingue FR/EN
pour nouveaux arrivants à Montréal (PVT + newcomers).

**Patrick aujourd'hui** : Custom GPT sur ChatGPT, **100 % conversationnel** (pas de
blocs à l'accueil). Repose sur discipline de sourcing + garde-fous. Une version
**web** est en projet (priorité).

**Déclencheur de ce travail** : transcript d'une conversation avec **Isabelle**
(experte en mobilité internationale → immigration ; ex-fondatrice d'une entreprise
de destination services à Montréal, vendue). Elle a recommandé d'ajouter des **blocs
thématiques** avec questions préformulées, et pointé un **marché prometteur : les
étudiants internationaux** (universités, réseau UQ). Elle offre de **réviser le bloc
immigration** et de faciliter des présentations universitaires.

---

## 2. 💡 Insights tirés du transcript Isabelle

**Pour Patrick :**
- Double porte d'entrée : question libre **+** blocs thématiques cliquables.
- Blocs prioritaires : formalités · logement · langue · **immigration/permis** ·
  **étudiants** · coût de la vie/salaire net.
- Garde-fous : distinguer **information ≠ conseil** ; sources officielles ;
  ne jamais évaluer l'admissibilité ; orienter vers pro autorisé (CCIC/Barreau).
- Questions préformulées corrigent le vocabulaire (« visa » → « permis de travail »).
- **Version web = priorité** (le compte ChatGPT obligatoire freine l'adoption).

**Pour la recherche d'emploi (fil parallèle) :** voir §9.

---

## 3. ✅ Décisions produit prises

1. **Les blocs visuels riches ne sont PAS réalisables dans le GPT natif** (limite
   ~4 conversation starters). → ils deviennent un **argument pour la version web**,
   pas une amélioration du GPT.
2. **Taxonomie unique en 4 domaines** (voir §6) qui sert à la fois :
   - les **4 portes** du GPT (contrainte des starters),
   - les **4 blocs visuels** de la version web.
3. Dimension **🟢 commun / 🟡 propre / 🔴 conseil** = **orthogonale** aux domaines
   (elle vit *à l'intérieur* de chaque domaine).

---

## 4. 📦 Livrables déjà produits

| Livrable | Forme | Statut |
|----------|-------|--------|
| **Bloc de routage GPT** (4 méta-portes + menu conversationnel) | Snippet system prompt (EN) — voir §7 | ✅ prêt à coller |
| **Spec du volet étudiant** | Fichier `.md` (voir §10) | ✅ à réviser avec Isabelle |
| **Grille de tri FAQ universités** | Fichier `.md` (voir §10) | ✅ outil de sourcing |
| **Recherche FAQ (7 établissements)** | Synthèse — voir §5 | ✅ saturation atteinte |
| **Taxonomie 4 domaines** | Voir §6 | ✅ ossature validée |

---

## 5. 🔍 Recherche FAQ universités — état & constats

**Couverture réelle** (7 établissements sondés, pas les 18 mot à mot — saturation
nette, les non-sondés partagent la même architecture) :

| Vague | Sondés |
|-------|--------|
| 1 — gros volumes | UQAM · UdeM · McGill · Concordia · Laval |
| 2 — réseau UQ | UQTR · UQAC · UQAR |
| 3 — compléter | Polytechnique (aperçu) ; **non sondés** : Sherbrooke, HEC, Bishop's + 7 autres constituantes UQ |

**Constats confirmés (sources officielles) :**
- CAQ obligatoire pour tout programme ≥ 6 mois (MIFI) ; permis d'études fédéral (IRCC).
- **Nouveau CAQ requis** dès qu'on change d'établissement, de programme ou de niveau.
- Au Québec, **le CAQ tient lieu de LAP** s'il porte la mention requise (pas de
  demande séparée).
- **Assurance santé privée obligatoire**, SAUF pays avec entente de sécurité sociale
  (dont la **France**) → bascule possible sur la **RAMQ**, avec démarches **avant le
  départ**.
- Frais de scolarité différentiels ; exemptions possibles (ex. citoyens français).

**⚠️ 4 flags réglementaires — NE JAMAIS figer un chiffre (à revérifier à la source) :**
| Flag | Note (incertaine, à confirmer) |
|------|-------------------------------|
| 🔴 VDE fermé | *Volet direct pour les études* fermé depuis ~novembre 2024 |
| 🔴 LAP | Lettre d'attestation provinciale récente (plafonds 2024-2025) |
| 🟠 Heures de travail hors campus | A changé récemment — renvoyer à IRCC, jamais de chiffre figé |
| 🟠 Quotas d'admissions internationales | Cibles resserrées au Québec, évolutif |

> Ces 4 flags = terrain qu'Isabelle a dit de traiter avec prudence → **révision Isabelle**.

---

## 6. 🎯 Taxonomie finale — les 4 domaines

| # | Domaine | Périmètre | Dominante |
|---|---------|-----------|-----------|
| 1 | 🛂 **Statut & immigration** | CAQ · permis d'études · LAP · AVE/VRT · renouvellement · maintien de statut · changement d'établissement | 🟢 Commun + 🔴 Conseil |
| 2 | 🎓 **Admission & parcours** | Dates limites · pièces requises · équivalences · année préparatoire · test de français · report d'admission | 🟡 Propre |
| 3 | 💰 **Argent & assurance** | Frais différentiels · exemptions (entente 🇫🇷) · preuve de capacité financière · assurance santé · budget | 🟡 Propre + 🟢 Commun |
| 4 | 🏠 **Installation & vie** | Logement (résidence/hors campus, TAL) · NAS · banque · travail (on/off campus, PGWP, co-op) · santé · intégration | 🟢 Commun |

**Note stratégique** : Domaine 1 = cœur de valeur **et** zone de risque max (frontière
info/conseil). Domaine 2 = surtout redirection (peu de rédaction, beaucoup de liens).
→ Concentrer l'effort de rédaction sur les **Domaines 1, 3, 4**.

---

## 7. 🧩 Snippet système GPT (bloc de routage — prêt à coller)

Conversation starters (Builder GPT → Configure) :
```
📋 Je prépare mon arrivée — par où commencer ?
🏠 Je cherche un logement à Montréal
💰 Combien ça coûte de vivre ici + mon salaire net ?
🎓 Je suis étudiant·e international·e
```

Bloc de routage (à insérer après « What Patrick helps with ») :
```markdown
## Entry doors & guided menu (routing)

Patrick offers TWO entry modes: (1) a free-text question, or (2) four guided
"doors". When a user picks a door, DON'T dump everything — unfold that door's
sub-topics as a short clickable-style menu in THEIR language, then wait.

DOOR 1 — 🛂 Statut & immigration  [APPLY IMMIGRATION GUARDRAIL]
DOOR 2 — 🎓 Admission & parcours   [mostly redirect to the institution]
DOOR 3 — 💰 Argent & assurance     [net-salary = ESTIMATE, not tax advice]
DOOR 4 — 🏠 Installation & vie      [work-hours rules change often → IRCC]

IMMIGRATION GUARDRAIL: general info from official sources only. NEVER assess a
person's eligibility (PEQ/PSTQ/PR/which permit). State the general rule, cite the
official page, point to a licensed pro — CCIC registry or the Barreau. Explain how
to verify a pro is authorized.
```
> ⚠️ Version antérieure à 4 portes basée sur « arrivée/logement/coût/étudiant ».
> Les **4 domaines de §6** sont l'ossature finale — aligner le snippet dessus.

---

## 8. 🚦 Prochaines étapes (TODO priorisé)

1. **Rédiger les questions préformulées finales du Domaine 1** (Statut & immigration)
   — le cœur de valeur, avec garde-fous intégrés.
2. **Envoyer la spec (§10) à Isabelle** pour révision des zones 🔴/🟠.
3. **Collecter les liens de redirection** (Domaine 2) — vague par vague, ou via
   fonction Research pour ratisser les 18 établissements sans le faire à la main.
4. **Aligner le snippet GPT** sur les 4 domaines finaux.
5. **Spécifier les blocs visuels de la version web** à partir de la même taxonomie.

---

## 9. 💼 Fil parallèle — recherche d'emploi (contexte, ne pas coupler)

- **2 CV envoyés** à Isabelle (mobilité internationale + général) ✅ — *fait*.
- Isabelle transmet le profil à **Pascale** (dév. affaires, réseau, lié à L'effet A).
- ⚠️ **Ne pas coupler** le calendrier job au calendrier Patrick — deux horloges.
- 💡 Chaque université démarchée pour Patrick = **contact institutionnel** qui nourrit
  aussi le réseau professionnel.

---

## 10. 📎 Fichiers à emmener dans Cowork

1. **`HANDOFF-patrick-volet-etudiant-cowork.md`** ← ce document (à ouvrir en premier)
2. **`patrick-volet-etudiant-spec.md`** — spec détaillée (arbre 7 sous-blocs +
   questions préformulées + règles de redirection + zones à réviser)
3. **`grille-faq-universites-quebec.md`** — outil de tri (3 paniers + flags +
   18 établissements + sources gouvernementales)

---

## 11. 🛡️ Garde-fous transversaux (rappel permanent)

- ✅ Information générale, **sources officielles** uniquement (MIFI · IRCC · RAMQ · TAL · Service Canada).
- ⛔ **Aucune** évaluation d'admissibilité personnalisée → CCIC / Barreau.
- ⚠️ Politiques récentes/instables → renvoi à la source datée + « peut avoir changé ».
- 🔒 **Aucune donnée personnelle** demandée ni conservée.

---

*Fin du handoff. Session d'origine : 30 juillet 2026 · Patrick GPT.*
