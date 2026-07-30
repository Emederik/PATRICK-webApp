# Corpus Patrick — README & schéma

> **C'est le carburant de Patrick.** Ces fichiers alimentent les 3 briques de l'app :
> l'annuaire, les checklists, et surtout le **chatbot RAG** (qui répond uniquement depuis ici).
>
> Rappel de la règle d'or : **Patrick ne répond que depuis ce corpus + les sources officielles
> citées. Il n'invente jamais.** Si l'info n'est pas ici, il le dit et renvoie vers la source.

---

## 1. Comment le chatbot utilise ce corpus (RAG en 1 paragraphe)

Chaque **fiche** ci-dessous devient un « morceau » (chunk) transformé en vecteur (embedding) et
stocké dans Supabase/pgvector. Quand un utilisateur pose une question, l'app cherche les fiches
les plus proches, les donne à Claude, et Claude rédige une réponse **en citant la source de la
fiche**. C'est pourquoi chaque fiche est **auto-suffisante** (elle se comprend seule) et **datée**.

## 2. Organisation des fichiers

```
corpus/
├── README.md                     ← ce fichier (schéma + règles)
├── 00-avant-le-depart.md         ← PVT/EIC (36 pays), nationalité(s) & bi-nationalité, assurance, budget
├── 01-nas.md                     ← Numéro d'assurance sociale
├── 02-sante-ramq.md              ← RAMQ, délai de carence, assurance privée
├── 03-logement-bail.md           ← Trouver un logement, bail, TAL, droits
├── 04-banque.md                  ← Ouvrir un compte, crédit, transferts
├── 05-telephone-internet.md      ← Forfaits mobile/internet (CRTC)
├── 06-emploi-cv.md               ← Recherche d'emploi, CV québécois vs français
├── 07-hiver.md                   ← Survivre ET profiter de l'hiver
├── 08-culture-vie-quotidienne.md ← Français québécois, us et coutumes
├── 09-decouvrir-montreal.md      ← Incontournables et pépites
├── 10-transport.md               ← Transport en commun (STM/Chrono), intercité (bus/train/covoit.), permis SAAQ, voiture & autopartage
├── 11-pvt-par-nationalite.md     ← Panorama EIC 36 pays : âge/durée/participations par pays
├── 12-arnaques-securite.md       ← Fraudes immigration/logement/emploi, qui contacter
├── 13-bien-etre-coup-de-dur.md   ← Mal du pays, détresse (811, 988), coup dur financier, se créer un réseau & sortir l'hiver
├── 14-diversite-inclusion.md     ← Égalité/Charte (CDPDJ), handicap (OPHQ, Kéroul), 2SLGBTQ+ (Interligne), autochtones (Native Montreal)
├── 15-impots.md                  ← 2 déclarations (ARC + Revenu Québec), résidence fiscale, T4/Relevé 1, remboursement
└── 16-immigration.md             ← Rester après le PVT : prolongation, RP au Québec (CSQ/Arrima/PSTQ/PEQ) — orientation + pro
```

> ## À créer (notes)
> - **Fiche emploi / recherche d'emploi** (enrichir `06-emploi-cv`) : quoi mettre / ne pas mettre dans un CV québécois (pas de photo, âge, statut marital…), CV étranger vs québécois, **sites & pistes de recherche d'emploi**, tips, à quoi s'attendre, différences.
> - **Fiche différences culturelles & lexique** (enrichir `08-culture-vie-quotidienne`) : expressions **EN & FR** vs **canadien / québécois**, faux-amis, codes sociaux, ce qui surprend.

## 3. Schéma d'une fiche (à respecter partout)

Chaque fiche commence par un bloc de métadonnées, puis un contenu court et auto-suffisant :

```markdown
### [ID] Titre clair et cherchable

- **audience** : pvt | etudiant | commun   (à qui ça s'applique)
- **nationalite** : commun | france | belgique | ...   (à quel(s) pays ça s'applique)
- **tags** : mots-clés séparés par des virgules
- **source** : Nom officiel — URL
- **dernière_vérif** : AAAA-MM-JJ
- **confiance** : haute | moyenne | à_vérifier

Contenu : 1 à 4 paragraphes courts. Concret, chiffré quand c'est sourcé.
Toujours terminer les sujets sensibles par un renvoi vers la source officielle.
```

### Champs expliqués
| Champ | Rôle |
|---|---|
| `audience` | Permet de filtrer PVTiste vs étudiant (clé pour la version B2B « étudiants ») |
| `nationalite` | `commun` = valable pour tous les nouveaux arrivants. Sinon, pays concerné (ex. `france`). **Empêche Patrick de dire à un Belge une règle propre aux Français** |
| `tags` | Améliore la recherche |
| `source` | **Obligatoire** — Patrick cite toujours. Utiliser les organismes officiels |
| `dernière_vérif` | Date de contrôle. Au-delà de ~6 mois → re-vérifier |
| `confiance` | `à_vérifier` = à confirmer avant de s'y fier. Le chatbot doit le signaler |

> **Règle de nationalité(s)** : la plupart des fiches (NAS, bail, banque, hiver, culture…) sont
> `commun` — elles valent pour **tout nouvel arrivant**, peu importe le pays. Seules les fiches
> **PVT/immigration** dépendent de la nationalité (âge limite, durée, quotas, ententes sécu).
> Patrick doit **demander la ou les nationalité(s)** — jamais « la nationalité » au singulier par
> défaut — avant de donner un fait PVT spécifique. Si la personne est **bi-nationale**, il compare
> les volets de ses deux pays et l'aide à choisir le plus avantageux (voir `depart-00b`). L'EIC
> couvre **36 pays** : la France n'est **qu'un exemple** (voir `depart-01b` Australie, `depart-01c`
> panorama).

## 4. Règles de rédaction (pour garder Patrick fiable)

1. **Une fiche = une idée.** Courte et autonome (meilleur pour le RAG).
2. **Chiffres et délais → source obligatoire + date.** Sinon, écrire « ordre de grandeur, à vérifier ».
3. **Sujets sensibles** (immigration, santé, bail, argent) : finir par « Confirme sur [source
   officielle] — les règles changent. »
4. **Ne jamais inventer d'URL.** Si l'URL exacte n'est pas confirmée, mettre le nom de l'organisme
   et `confiance: à_vérifier`.
5. **Neutralité et biais** : ne pas supposer le genre, l'âge, la situation. Le contenu parle à tout le monde.

## 4bis. Stratégie bilingue FR/EN — traduction à la volée

Patrick est **bilingue**, mais le corpus est **écrit une seule fois, en français** (source de
vérité). On ne duplique pas les fiches en anglais. Voici comment ça marche et reste fiable :

1. **Recherche multilingue.** On utilise un modèle d'embeddings **multilingue** : même si
   l'utilisateur pose sa question en anglais, la recherche retrouve la bonne fiche française.
2. **Réponse dans la langue de l'utilisateur.** Au moment de répondre, Patrick **traduit** le
   contenu de la fiche vers la langue de la question (FR ou EN). L'utilisateur ne voit jamais le
   « mélange ».
3. **Garde-fous de traduction (pour que ça reste fiable et agréable)** :
   - ❌ **Ne jamais traduire** les **noms propres officiels** ni les **noms de formulaires** :
     RAMQ, TAL, SAAQ, MIFI, IRCC, formulaire **SE-401-Q**, **carte OPUS**, etc. Ils restent tels quels.
   - 🔤 Donner l'**équivalent bilingue** des termes clés une fois : « NAS (SIN) », « bail (lease) ».
   - 🔗 **Ne jamais traduire ni modifier les URLs** — elles restent identiques.
   - 📅 Les chiffres, délais et dates restent identiques (seul le texte autour est traduit).

> Pourquoi ce choix : **1× à écrire, 1× à maintenir**. Quand tu corriges une fiche, la version
> anglaise est automatiquement à jour (puisqu'elle est générée à la volée). C'est le meilleur
> rapport fiabilité / effort d'entretien — ce que tu voulais.

## 5. Sources officielles de référence (prioritaires)

| Organisme | Domaine | Confiance URL |
|---|---|---|
| IRCC / Canada.ca (EIC) | PVT, permis de travail/études | à confirmer l'URL exacte |
| Service Canada | NAS | à confirmer l'URL exacte |
| RAMQ (ramq.gouv.qc.ca) | Assurance maladie | vérifiée |
| CLEISS (cleiss.fr) | Entente sécu France-Québec | vérifiée |
| TAL (tal.gouv.qc.ca) | Bail, droits locataires | vérifiée |
| Éducaloi (educaloi.qc.ca) | Vulgarisation juridique | vérifiée |
| SAAQ | Permis de conduire | à confirmer l'URL exacte |
| CRTC | Téléphonie/internet | à confirmer l'URL exacte |
| MIFI / Québec.ca | Immigration provinciale | à confirmer l'URL exacte |

> ⚠️ Les URLs marquées « à confirmer » doivent être vérifiées à la main avant mise en production.
> Je (Claude) préfère te le dire plutôt que de te fabriquer un lien qui n'existe pas.

## 6. État actuel du corpus

Ceci est une **base de départ solide et sourcée**, pas une encyclopédie complète. Les thèmes
administratifs à haut risque (PVT, NAS, RAMQ, bail, banque) ont été **vérifiés par recherche web
le 2026-07-25**. Les thèmes plus « souples » (hiver, culture, découvertes) sont fiables mais à
enrichir avec ton expérience de Montréalaise. Complète, corrige, ajoute des fiches — c'est vivant.

## 7. Maintenance : mettre à jour, ajouter ou retirer (fiches & liens)

Le corpus est **fait pour être modifié en continu**. Toute modification est une opération **de
données** : après changement, on **re-synchronise la Knowledge Base** (ré-ingestion) — aucun
redéploiement de l'app, aucune interruption. Règle d'or maintenue : **on ne met jamais un lien
sans l'avoir testé vivant**, et **on n'invente jamais d'URL**.

**A. Modifier une fiche existante**
1. Éditer le `.md`, garder le schéma (§3).
2. Mettre à jour `dernière_vérif` (date du jour) et, si besoin, `confiance`.
3. Re-sync KB.

**B. Ajouter une fiche**
1. Créer `NN-nom.md` (numéro suivant), respecter le schéma (§3) — au moins un bloc `### [id]` sourcé et daté.
2. L'ajouter à l'arborescence (§2 de ce README).
3. Re-sync KB.

**C. Retirer une fiche**
1. Déplacer le fichier vers `_hors-perimetre-Patrick/` (préférable à la suppression sèche : on garde la trace).
2. Retirer sa ligne de l'arborescence (§2).
3. Re-sync KB (le contenu retiré disparaît des réponses).

**D. Ajouter / retirer / remplacer un LIEN dans une fiche**
1. **Tester le lien** (qu'il soit vivant *et* toujours sur son sujet) avant de l'insérer.
2. Ajouter/retirer l'URL dans le bloc concerné ; si le lien est incertain, mettre `confiance: à_vérifier`.
3. Bumper `dernière_vérif` du bloc. Re-sync KB.

> 💡 Astuce : garde une cadence de **revérification ~tous les 6 mois** des fiches à liens (surtout
> 03 logement, 05 télécom, 09 découvrir, 10 transport, 13 sorties) — les sites commerciaux bougent
> (fusions, redirections, fermetures). Cf. les corrections déjà faites : Greyhound→FlixBus,
> toutMontréal→Logego, Eater retiré.
