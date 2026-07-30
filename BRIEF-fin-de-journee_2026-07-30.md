# Patrick — Brief de fin de journée (2026-07-30)

*À déposer dans une nouvelle session Cowork demain pour repartir propre. Résume l'état, ce qui reste, et le plan.*

---

## 0. À FAIRE EN PREMIER demain matin : POUSSER

Plusieurs commits sont **faits localement mais pas encore en ligne**. Une commande les envoie tous (Vercel redéploie tout seul) :

```
cd "/Users/Manu/CLAUDE 2026/PATRICK webApp" && git push origin main
```

Commits en attente : `932ed78` (10 questions/icône) · `94e6421` (icônes qui reviennent + one-pager à l'écran + MAX_TOKENS 1100) · `718f67e` (anti-injection + confidentialité + alerte hors-ligne).
Après le push : recharge le site avec `?v=5` et vérifie.

---

## 1. État de l'app (ce qui marche)

- **En ligne** : https://patrick-web-app.vercel.app/ (Vercel, redeploy auto au push).
- **Front** : `patrick-app/index.html` · **API** : `patrick-app/api/chat.js` · **Prompt système** : `patrick-app/api/patrick-system-prompt.md`.
- **Cerveau (RAG)** : Amazon Bedrock **Knowledge Base** « Patrick-kb », source **S3 `patrick-corpus-barea-2026`**, embeddings Titan v2. **Synchronisée** avec les 16 fiches (impôts + immigration inclus, testés OK).
- **Corpus** (racine repo `corpus/`) : 00→16 + README + `featured_questions.json`. ⚠️ Le corpus vit à la racine ; l'app le lit **via la KB (S3)**, pas via le repo → toute nouvelle fiche doit être **re-uploadée sur S3 + Sync**.

## 2. Fait aujourd'hui

- 4 icônes × **10 questions vedettes** (drill-down FR/EN).
- Icônes **réaffichées** après une question.
- Récap → **one-pager structuré affiché à l'écran** (bouton « 🧾 Ma synthèse »).
- **MAX_TOKENS 500 → 1100** (réponses n'étaient plus coupées).
- **P0 sécurité/mentions** : anti-injection Markdown (URLs assainies), message de confidentialité honnête, **alerte « mode hors-ligne »** quand le backend tombe.

---

## 3. ⭐ LA VRAIE SYNTHÈSE IA + MÉMOIRE — guide API (chantier n°1 de demain)

**Constat** : aujourd'hui le front n'envoie que `{message, lang}` à `/api/chat`. L'historique reste **dans le navigateur** → (a) Patrick **redemande** la nationalité (aucune mémoire), et (b) la « synthèse » n'est qu'une **réorganisation locale**, pas une vraie synthèse rédigée.

**Une seule idée règle les deux** : **envoyer l'historique au backend.**

### Étape A — Backend `api/chat.js`
1. Lire `history` (tableau `{who,text}`) et un champ `mode` dans le body de la requête.
2. **Tour normal** : construire les `messages` de `ConverseCommand` à partir de `history` (`who:"you"→role:"user"`, `"patrick"→"assistant"`), et n'injecter le **contexte RAG que dans le dernier message user**. → Patrick se souvient (nationalité, âge, statut) et ne redemande plus.
   ```js
   const msgs = history.slice(-8).map(m => ({
     role: m.who === "you" ? "user" : "assistant",
     content: [{ text: m.text }]
   }));
   // injecter le contexte RAG dans le dernier user :
   msgs[msgs.length-1].content[0].text = userTextAvecContexte;
   // ConverseCommand({ ..., messages: msgs, system:[{text:SYSTEM_PROMPT}] })
   ```
3. **Mode synthèse** (`mode:"synthesis"`) : **pas** de retrieval KB. Envoyer la conversation + une instruction :
   > « À partir de cet échange, rédige une **synthèse one-pager** en [langue], structurée : **1. Profil & situation · 2. Questions posées · 3. Réponses & recommandations clés · 4. Démarches prioritaires (avec délais) · 5. Ressources & liens utiles · 6. À clarifier / prochaines étapes.** Concise, puces courtes, pas de copier-coller du chat. Rappelle en pied que c'est de l'info générale à vérifier. »
   Retourner le texte généré.

### Étape B — Front `index.html`
1. Dans `callBackend`, ajouter `history` au `body` du `fetch`.
2. Bouton **« 🧾 Ma synthèse »** → appeler `/api/chat` avec `{mode:"synthesis", history, lang}`, puis afficher le **markdown rendu** (utiliser `mdToHtml` déjà présent) dans la modale `showRecapModal` (remplacer le `<pre>` par du HTML rendu), + Copier / Télécharger.

### Coût
- Mémoire = prompts un peu plus longs (mineur, on tronque à ~8 derniers tours).
- Synthèse = **1 appel Bedrock** quand on clique (Haiku, négligeable).

> ⚠️ À tester **en live après push** (on ne peut pas simuler la réponse Bedrock ici). C'est pour ça qu'on le fait demain à tête reposée, pas ce soir.

---

## 4. Points P0 restants (après la synthèse)

| Point | Action |
|---|---|
| **Sources souvent invisibles** | ~11 fiches sur 17 n'ont pas d'URL officielle exploitable → l'app n'affiche pas de source. **Auditer chaque fiche et ajouter l'URL officielle exacte** (IRCC, RAMQ, SAAQ, Revenu Québec, MIFI…). Puis re-upload S3 + Sync. |
| **Mémoire conversationnelle** | = Étape A ci-dessus (réglé en même temps que la synthèse). |
| **Fallback silencieux** | ✅ fait ce soir (alerte hors-ligne). À vérifier en live. |
| **Confidentialité** | ✅ fait ce soir (mention honnête). |
| **Injection Markdown** | ✅ fait ce soir (URLs assainies). Idéalement, valider aussi avec un test. |

## 5. Points P1 (ensuite)

- **Plafond de coûts global** (aujourd'hui local à chaque instance serverless) → passer à un compteur partagé (ex. table).
- **Seuil de pertinence RAG** : ne pas utiliser un extrait trop faible (score minimal).
- **Limite de longueur** des questions entrantes.
- **Accessibilité clavier** des 4 cartes (rôle `button`, `tabindex`, Enter).
- **Tests** : ajouter un test RAG réel + un parcours navigateur automatisé (aujourd'hui ~6 tests du mode simulé seulement).
- **Docs obsolètes** à nettoyer : « dépôt privé », « 15 fiches » (on est à 16), ancien repo GitHub (`Patrick-GPT-assistant` vs `PATRICK-webApp`).
- **Fichier LICENSE** absent → en ajouter un.
- **Ton tu/vous** : le figer (recommandé : **tutoiement partout**) dans `patrick-system-prompt.md`.

## 6. Backlog contenu (fiches)

- Enrichir **`06-emploi-cv`** : quoi mettre / ne pas mettre dans un CV québécois, CV étranger vs québécois, sites & pistes de recherche d'emploi, tips.
- Enrichir **`08-culture-vie-quotidienne`** : lexique EN/FR vs canadien/québécois, faux-amis, codes sociaux.
- Ajouter URLs officielles manquantes (cf. P0 « sources »).

## 7. Rappels de plomberie (pour ne plus se faire piéger)

1. **Modifier une fiche** → il faut **re-upload sur S3** (`patrick-corpus-barea-2026`) **+ Sync** dans Bedrock, sinon Patrick ne voit pas le changement.
2. **Modifier le front / l'API** (`patrick-app/…`) → **git push** → Vercel redéploie. Recharge avec `?v=N`.
3. **Modifier le comportement** → c'est `patrick-app/api/patrick-system-prompt.md` (≠ le skill Cowork `patrick-montreal-guide`, qui est séparé).

---

*Bravo pour aujourd'hui — Patrick répond désormais sur 16 sujets, avec icônes, questions vedettes et corrections P0. Demain : synthèse IA + mémoire, puis les sources. Bonne nuit 🌙*
