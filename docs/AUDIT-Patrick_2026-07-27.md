# Audit du dossier « PATRICK webApp » — 2026-07-27

> Fait suite à tes deux critiques : (1) demander **la ou les** nationalité(s), (2) sortir du
> biais « PVT français » et couvrir aussi le WHM australien et les autres pays EIC.
> Ce rapport liste : ✅ ce que j'ai **déjà corrigé**, puis les **ajouts / corrections** recommandés,
> priorisés. Rien n'a été supprimé sans te le dire.

---

## ✅ 1. Corrections déjà appliquées

| Fichier | Changement |
|---|---|
| `corpus/00-avant-le-depart.md` | `depart-00` réécrit → **« la ou les nationalité(s) »**, jamais le singulier par défaut. Nouvelle fiche **`depart-00b`** (bi-nationalité = atout, comparer les volets, source IRCC). `depart-01` (France) repositionné comme **un exemple**. Nouvelles fiches **`depart-01b` Australie (WHM)** et **`depart-01c` panorama 36 pays EIC**. |
| `corpus/README.md` | Règle de nationalité mise **au pluriel** + cas bi-national ; index mis à jour. |
| `patrick-montreal-guide/SKILL.md` (webApp) **et** skill installé | Mission dé-francisée (« any eligible nationality »), section « get to know » : **demander toutes les nationalités**, note bi-national ; volet paperasse : « conditions differ by nationality » ; openers neutres ; **référence morte `references/trusted-sources.md` supprimée**, remplacée par la liste des sources officielles. |

⚠️ **Confiance des nouveaux chiffres** : les données Australie (durée 24 mois, 2 participations, âge 18-35)
sont en `confiance: moyenne` avec renvoi « à confirmer sur canada.ca ». Sources communautaires concordantes
mais **page IRCC officielle exacte non retrouvée** → à valider avant mise en prod.

---

## 🔴 2. À corriger — priorité haute

### 2.1 Doublons de fichiers
- **`FAQ PVT Canada .docx`** et **`Document 1.docx`** = quasi identiques (même FAQ « S'installer à Montréal »,
  seule la dernière section diffère). → **Garder un seul** fichier, renommer clairement, supprimer l'autre.
- **`Inventaire des pages FAQ EIC, PVT, WHM.docx`** et **`Inventaire des pages FAQ.docx`** = **identiques**
  (hors espaces). → **Supprimer un des deux.**

### 2.2 Le corpus reste France-only sur 2 sujets sensibles (alors que tu as la matière)
Ces fiches `commun`/`france` ne mentionnent que la France/Belgique alors que d'autres nationalités sont concernées :
- **`02-sante-ramq.md`** : l'exemption du délai de carence repose sur l'**entente France-Québec** (+ Belgique).
  → Ajouter une note : « le Québec a des ententes de sécurité sociale avec **~40 pays** ; si tu n'es pas
  français·e, vérifie si **ton** pays en a une ». Sinon un Australien croit qu'il est exempté (il ne l'est pas).
- **`10-permis-conduire.md`** : l'échange de permis liste France/Belgique/Suisse/Allemagne. → Ajouter :
  « d'autres pays/États ont une entente avec la SAAQ — vérifie la tienne ». (Un Australien n'échange pas
  dans les mêmes conditions.)

### 2.3 `pvt-canada.pdf` = **illisible** (PDF scanné/image, 0 texte extractible)
→ Pour être exploitable par le RAG, il faut l'**OCR** ou le remplacer par une source texte. Sinon inutile.

---

## 🟠 3. À ajouter — priorité moyenne (ta matière existe déjà !)

**Constat clé** : tu as **déjà** un excellent contenu multi-nationalités qui n'est **pas encore passé dans le corpus**.
- `Cartographie … à destination du Québec.docx`, `répertoire d'ingénierie réglementaire…docx` et
  `Inventaire des pages FAQ EIC, PVT, WHM.docx` couvrent **EIC + Australie + WHM + NZ + Japon/HK/Taïwan**.
- `FAQ country specific .docx` traite explicitement les différences **Belgique / Australie**.

→ **Recommandation** : créer un fichier corpus **`11-pvt-par-nationalite.md`** (ou étoffer `00`) avec une
**fiche courte par grand pays EIC** (âge, durée, participations, quota, source) — Australie, Royaume-Uni,
Belgique, Suisse, Allemagne, Irlande, etc. La règle « une fiche = une idée » du README s'y prête bien.
Je peux le générer à partir de tes docs + vérification IRCC.

**Attention à un axe à ne pas mélanger** : `Évaluation comparative…docx` traite des Français/Belges qui partent
**vers** l'Australie/NZ/Corée — c'est la **direction inverse** de la mission de Patrick (venir **au** Québec).
Utile comme culture générale, mais **hors périmètre** du corpus Patrick. À ranger à part.

---

## 🟡 4. Qualité / hygiène — priorité basse

- **`Immigrant Qc.docx`** : c'est un **copier-coller de page web** avec bandeau cookies et menus. → Nettoyer
  (garder le contenu EIC utile) ou re-sourcer proprement.
- **`ilide.info-guide-des-pvtistes-au-canada….pdf`** (73 000 mots) : guide **tiers** (communauté PVT),
  très FR/Belgique. → Vérifier les **droits d'usage** avant de l'ingérer dans un produit ; le citer plutôt
  que le copier.
- **Espaces dans les noms de fichiers** (`FAQ country specific .docx`, doubles espaces) : à normaliser pour
  éviter les erreurs de scripts/imports.
- **`Desjardins.docx`** est déjà taggé « 🟡 À intégrer » par toi → candidat pour une fiche budget dans `00`/`04`.

---

## 5. Ce dont j'ai besoin de toi (décisions)

1. Je génère la fiche **`11-pvt-par-nationalite.md`** (Australie + principaux pays EIC) à partir de tes docs + IRCC ? (oui/non)
2. J'applique les **notes multi-nationalités** dans `02-sante-ramq` et `10-permis-conduire` ? (oui/non)
3. Je **supprime les doublons** confirmés (Document 1 / un des deux Inventaire) ou tu préfères les archiver ?

*Aucune suppression ni gros ajout n'a été fait sans validation — dis-moi et j'enchaîne.*
