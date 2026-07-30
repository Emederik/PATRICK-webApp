# Patrick — Améliorations : questions vedettes, one-pager, analyse & suites

*Synthèse du 2026-07-30. Accompagne `Patrick_Banque_de_questions.xlsx` (banque complète) et `corpus/featured_questions.json` (données app-ready).*

---

## 1. Questions vedettes par icône (10 par catégorie)

Affichées quand l'utilisateur clique une icône, pour ceux qui ne savent pas par où commencer.
**Version machine (à brancher au front) : `corpus/featured_questions.json`.** Version lisible ci-dessous.
*Note : pas de logs d'usage encore → sélection basée sur les questions les plus « d'entrée de jeu » de la banque. À réajuster avec les vraies statistiques une fois l'analyse anonyme en place (§7).*

**Icône 1 — Demander mon PVT/WHM & préparer le départ**
1. Qu'est-ce que le PVT / Working Holiday au Canada ? 2. Mon pays participe-t-il à l'EIC ? 3. Quel âge limite ? 4. Quelle durée de séjour ? 5. Ai-je besoin d'une offre d'emploi ? 6. Comment marchent les rondes d'invitations ? 7. Quels documents fournir ? 8. Quelle assurance (et durée) ? 9. Quel montant de fonds prouver ? 10. J'ai deux nationalités : laquelle utiliser ?

**Icône 2 — M'installer & vivre à Montréal/Québec**
1. Quels quartiers pour un nouvel arrivant ? 2. Louer sans emploi canadien ? 3. Le bail au Québec (mes droits) ? 4. Vivre sans voiture ? 5. Transport en commun (OPUS, Chrono) ? 6. Où chercher un emploi ? 7. Le français est-il obligatoire au travail ? 8. Adapter mon CV au marché québécois ? 9. Quel budget mensuel ? 10. Reconnaître une arnaque au logement ?

**Icône 3 — Faire mes démarches administratives**
1. Qu'est-ce que le NAS, quand le demander ? 2. Où faire ma demande de NAS ? 3. Admissible à la RAMQ en PVT ? 4. Délai de carence RAMQ ? 5. Garder mon assurance privée ? 6. Quelle banque choisir ? 7. Ouvrir un compte sans emploi ? 8. Conduire avec mon permis étranger (durée) ? 9. Échanger mon permis ? 10. Déclaration de revenus au Canada ?

**Icône 4 — M'intégrer, réussir, repartir ou rester**
1. Rencontrer des gens / me créer un réseau ? 2. Améliorer mon français ? 3. Gérer le mal du pays ? 4. Bien vivre mon premier hiver ? 5. Activités à petit budget, même l'hiver ? 6. Voyager aux USA pendant mon PVT ? 7. Montréal accueillante (2SLGBTQ+, diversité) ? 8. Deuxième participation à l'EIC ? 9. Rester au Canada après mon PVT ? 10. Options pour la résidence permanente ?

---

## 2. Doublons & questions à fusionner

La banque (293 Q) est déjà largement dédoublonnée. Quelques **regroupements** recommandés pour éviter la redondance côté chatbot :

- « Comment rencontrer des gens à Montréal ? » + « Comment se créer un réseau social ? » + « activités pour rencontrer du monde » → **une seule** entrée « Rencontrer du monde & se créer un réseau » (fiche 13).
- « Comment gérer le mal du pays ? » + « Comment éviter l'isolement ? » → **fusionner** (fiche 13).
- « Comment reconnaître une fraude au logement ? » + « Que faire si je me suis fait arnaquer ? » → garder 2 entrées mais **même fiche** (12).
- « Dois-je produire une déclaration fédérale ET québécoise ? » + « Suis-je résident fiscal ? » → regrouper sous un futur bloc **Impôts**.
- Les variantes d'âge/nationalité (« âge limite », « durée pour ma nationalité ») → **une** réponse dynamique adaptée à la nationalité (fiche 11), pas 3 entrées.

---

## 3. Questions manquantes recommandées (les vrais trous)

**43 questions de la banque n'ont aucune fiche** — concentrées sur 2 sujets. À créer en priorité, **sources officielles obligatoires** :

1. 🔴 **Immigration / rester au Canada** (≈29 Q, catégorie 4) : 2e participation, PVT→Jeunes Pro, permis lié à l'employeur/EIMT, CAQ, statut conservé/restauration, **résidence permanente, Arrima, CSQ**, parrainage conjoint. → Fiche « rester/immigration » (sources **IRCC, MIFI/Québec.ca, Arrima**). ⚠️ Patrick **oriente**, n'évalue pas l'admissibilité (renvoi CCIC/avocat).
2. 🔴 **Impôts & fiscalité** (≈11 Q, catégorie 3) : déclaration fédérale + québécoise, résidence fiscale, T4/Relevé 1, comptes ARC/Revenu Québec, crédits, remboursement depuis l'étranger. → Fiche « impôts » (sources **ARC, Revenu Québec**).
3. 🟠 Ponctuels : **WWOOFing/HelpX/Workaway** (travail contre logement — statut légal à vérifier), **voyager aux USA** (AVE/visa), **améliorer son anglais** à Montréal.

---

## 4. Problèmes de formulation / parcours utilisateur

- **Re-demander l'âge/la nationalité** déjà donnés → **corrigé** dans le skill (mémoire de session : ne jamais redemander, sauf info absente ou inexploitable).
- **Catégorie 4 surchargée** (94 Q) : elle mélange *intégration sociale*, *carrière*, *voyage*, *fin de PVT*, *immisration juridique*, *départ*. Envisager de **scinder l'icône 4** (ex. « Vivre & s'intégrer » vs « Et après ? / rester ou repartir ») pour un parcours plus lisible.
- **Culs-de-sac** : impôts & immigration sont très demandés mais sans fiche → Patrick tombera souvent sur le fallback « je note pour l'équipe ». Créer ces fiches réduit la frustration.
- **Sujets sensibles** (immigration RP, impôts, santé) : Patrick doit **informer + orienter vers un pro**, jamais donner un avis personnalisé. À garder explicite dans ces futures fiches.
- **Formulations à neutraliser** : préférer « ta/tes nationalité(s) » à « ta nationalité » ; éviter le « tu » présumé si registre à définir (à trancher : tutoiement partout ? — recommandé, ton chaleureux québécois).

---

## 5. Proposition de structure — one-pager de synthèse (remplace la copie de conversation)

À la fin de la page, **remplacer le transcript intégral** par ce one-pager (exportable PDF/Word) :

```
PATRICK — Ta feuille de route personnalisée              [date]

1. TON PROFIL                → nationalité(s), âge, statut (PVT/WHM/étudiant),
                               seul/couple/famille, étape (prépare/arrivé), langue, budget
2. TES QUESTIONS PRINCIPALES → 3 à 6 sujets abordés, en une ligne chacun
3. RÉPONSES & RECOMMANDATIONS→ l'essentiel retenu, par sujet (2-3 lignes max)
4. TES DÉMARCHES PRIORITAIRES→ checklist ordonnée avec délais (ex. NAS dès l'arrivée,
                               assurance avant le départ, bail : jamais de dépôt…)
5. RESSOURCES & LIENS UTILES → liens officiels cités (IRCC, RAMQ, SAAQ, STM, 811/988…)
6. À CLARIFIER / PROCHAINES  → points restés ouverts + « vérifie auprès de [source] »
ÉTAPES

Pied de page : « Info générale, non contractuelle. Vérifie auprès des sources
officielles / d'un pro. Patrick ne conserve aucune donnée personnelle. »
```

Principes : **1 page**, puces courtes, liens cliquables, dans la langue de l'utilisateur, **aucune donnée identifiante stockée** (généré à la volée, pas archivé). *(Le comportement est déjà inscrit dans le skill, section « Wrap-up ».)*

---

## 6. Pays & territoires admissibles à l'EIC (PVT/WHM) — liste officielle

Vérifié sur **canada.ca « Eligibility by country »** le 2026-07-27 — **36 pays/territoires** (détail âge/durée/participations dans la fiche corpus `11-pvt-par-nationalite.md`) :

Andorre, Australie, Autriche, Belgique, Chili, Costa Rica, Croatie, Tchéquie, Danemark, Estonie, Finlande, France, Allemagne, Grèce, Hong Kong, Islande, Irlande, Italie, Japon, Corée du Sud, Lettonie, Lituanie, Luxembourg, Pays-Bas, Nouvelle-Zélande, Norvège, Pologne, Portugal, Saint-Marin, Slovaquie, Slovénie, Espagne, Suède, Suisse, Taïwan, Royaume-Uni.

> ⚠️ La **Suisse** n'a **pas** de volet Vacances-Travail (Jeunes Pro + Stage coop seulement). Liste et conditions **à revérifier chaque saison** sur canada.ca. Patrick doit demander la/les nationalité(s) puis renvoyer à la page pays.

---

## 7. Recommandations — analyse anonyme des questions

Cadre détaillé dans l'onglet **« Analyse anonyme »** de l'Excel. En bref :

- **Journaliser 8 champs anonymes** seulement (horodatage, catégorie, sous-thème, question reformulée **sans PII**, langue, nationalité générique, réponse trouvée oui/non, fiche servie). **Aucune** donnée identifiante.
- **Suivre** : top questions (→ alimente les icônes vedettes du §1), **taux de sans-réponse** (→ priorise les fiches à créer du §3), répartition par catégorie/nationalité, saisonnalité (rondes d'invitation, hiver, impôts).
- **Boucle d'amélioration** : les questions du fallback « je note pour l'équipe » (skill) alimentent directement cette file d'enrichissement.
- **Mise en œuvre** : un simple tableau (ou table Supabase) avec ces 8 colonnes ; revue mensuelle.

---

## 8. Reste d'hier (hors choix des glyphes)

Déjà fait depuis le brief : fichiers hors-scope rangés (`_prive-local/`), Chrono corrigé, voiture/transport couverts, banque de questions créée.

**Encore ouvert :**
- ⚙️ **Câbler la notification** « question sans réponse → prévenir Em » (hook backend).
- 🔴 **Créer les fiches Impôts et Immigration** (cf. §3 — les plus gros trous).
- 📄 **OCR `pvt-canada.pdf`** (dans `_prive-local/.../inutilisable-a-ocr/`) ou le remplacer.
- 🧹 Nettoyer **`Immigrant Qc.docx`** (copier-coller web avec bandeau cookies).
- ⚖️ Vérifier les **droits d'usage** du guide tiers pvtistes.net (citer, pas copier).
- 🔗 Vérifier que les **~10 sites de sorties** (fiche 13) sont actifs.
- ♿ Renforcer la **fiche handicap** avec un vrai témoignage.
- ➕ Angles restants du guide : **WWOOFing**, **améliorer son anglais**.

---

*Livrables associés : `Patrick_Banque_de_questions.xlsx` · `corpus/featured_questions.json` · skill `patrick-montreal-guide` (mis à jour).*
