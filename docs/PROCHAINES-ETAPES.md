# Patrick — Compte-rendu & prochaines étapes

*Point d'étape pour reprendre efficacement (design + ce qui reste). Dernière mise à jour : 2026-07-28.*

---

## ✅ État actuel — ce qui est FAIT

- **Patrick est en ligne, public et fonctionnel** : https://patrick-web-app.vercel.app/
- **RAG réel** : AWS Bedrock (Knowledge Base + S3 Vectors + Titan V2 + Claude Haiku 4.5).
- **Front** : chat FR/EN, 4 blocs de questions, récap téléchargeable, **rendu Markdown** (titres, gras, listes, tableaux).
- **Comportement Patrick** validé : demande la nationalité, cite les sources, zéro biais France, zéro PII.
- **Code sur GitHub** (repo **public**, propre : sources tierces isolées dans `_prive-local/`, bannière dans le README).
- **Coûts plafonnés** : AWS Budgets (20 $) + Cost Anomaly + rate-limit.
- **Déploiement auto** : chaque `git push` → Vercel redéploie.

---

## 🎯 Ce qui reste (priorisé)

| # | Chantier | Pourquoi | Effort | Outil |
|---|---|---|---|---|
| 1 | **🎨 Design / UI** | Rendre Patrick plus beau & mémorable avant de le diffuser | Moyen | Cowork (moi) + `index.html` (+ Tailwind CDN en option) |
| 2 | **📊 Analytics** (voir l'usage) | Savoir combien de gens l'utilisent, top questions | Court | Vercel Analytics ou Plausible |
| 3 | **🌐 Domaine custom** | URL propre à partager (ex. patrick-mtl.com) | Court | Registrar + Vercel Domains |
| 4 | **💬 Feedback + « +4 questions »** (Phase 2) | Engagement + amélioration continue | Moyen | Supabase (log + quota partagé) |
| 5 | **🔒 Durcir le rate-limit** | Vrai plafond en prod serverless | Moyen | Upstash Redis ou Supabase |
| 6 | **📝 Corpus** : renforcer `ramq-02`, nouvelles fiches (WWOOFing, van, anglais) | Enrichir le contenu | Court/moyen | Cowork + re-sync KB |
| 7 | **🎓 Version « étudiants »** | Nouveau public (le corpus est déjà tagué `audience`) | Grand | Plus tard |

---

## 🎨 Focus DESIGN — la meilleure façon de procéder

**Principe : cadrer la direction visuelle AVANT de coder** (sinon on itère à l'aveugle).

### Processus recommandé
1. **Direction d'abord** : je te propose **2-3 pistes visuelles** (ambiance, palette, typo, layout) → tu choisis celle qui te parle.
2. **Références** : rassemble **2-3 sites/apps** dont tu aimes le look → ça m'aide à viser juste du premier coup.
3. **Implémentation** : je restyle `index.html` (on garde le **single-file**, simple à déployer ; option **Tailwind CSS via CDN** si on veut plus de liberté de mise en page).
4. **Itération** : tu revois sur l'URL Vercel (ou localhost), on affine ensemble.

### Décisions à trancher (je te les poserai en questions au démarrage)
- **Ambiance** : chaleureux/illustré (avec le personnage Patrick en mascotte) **vs** épuré/pro ?
- **Palette** : on garde le bleu/vert actuel, ou on change ?
- **Mode** : sombre (actuel), clair, ou bascule clair/sombre ?
- **Personnage Patrick** : l'utiliser comme avatar/mascotte dans le chat (tu as déjà les illustrations dans `assets/`) ?
- **Mobile** : priorité au mobile (beaucoup de PVTistes navigueront sur téléphone) ?

### Outils
- **Exploration / mockups** : moi (Cowork) — je génère des aperçus visuels pour choisir.
- **Implémentation** : édition directe de `index.html` (+ Tailwind CDN en option).
- **Inspiration** : Mobbin, Land-book, Dribbble, ou des apps que tu aimes.
- **Icônes** : Lucide (léger) ; **illustrations** : tes assets Patrick.

---

## 🧭 Comment on travaille (résumé)

- **Cowork (ici)** = design, front, corpus, contenu, déploiements simples. **C'est notre base.**
- **GitHub Desktop** = Commit + Push (déclenche Vercel).
- **Claude Code** = seulement si un jour on veut de gros refactors pilotés par OpenSpec (`/opsx:apply`).
- **AWS** = déjà en place ; on n'y retourne que pour re-sync la KB (nouvelles fiches) ou ajuster le budget.

---

## ▶️ Proposition pour la prochaine session

1. **Design (chantier #1)** : on démarre par **mes 2-3 pistes visuelles** → tu choisis → j'implémente.
2. En parallèle (rapide) : **Analytics** (#2) pour commencer à mesurer l'usage dès le lancement.
3. Puis **domaine custom** (#3) avant le post LinkedIn.

> Pour préparer : repère **2-3 designs que tu aimes** (screenshots ou liens) et pense à l'**ambiance** que tu veux pour Patrick. Le reste, on le déroule ensemble.

---

## 🎨 Design — décisions verrouillées (28/07)

Direction retenue = **« mix »** : chatbot mint moderne + chaleur + photo de Montréal. Mode clair, mobile d'abord.

- **Bannière d'accueil** : photo skyline de Montréal (**la photo d'Em**, réchauffée par un filtre, © intégré). Crédit **« © Em Barea »** petit, vertical, bas-droite, **pivoté 180°**.
- **Avatar** : le personnage **Patrick** (recadré).
- **Toggle FR | EN** visible (les deux, cliquables) en haut de la bannière.
- **Textes d'accueil** :
  - « Bienvenue en PVT au Québec ! »
  - « Je suis ton guide montréalais qui t'aide dans tes démarches. »
  - (plus bas) « Pose-moi tes questions ou choisis un thème pour commencer. »
- **Barre de question** remontée, juste sous ce titre. (Plus de « dis-moi ta nationalité » à l'accueil.)
- **4 blocs** (icônes **Fluent 3D colorées**, Iconify `fluent-emoji:*`) :
  1. **Avant d'arriver / Destination Montréal** → ✈️ `airplane-departure`
  2. **T'installer** → 🏠 `house-with-garden`
  3. **Démarches & documents** → 📝 `memo`
  4. **Vivre à Montréal** → 🎭 `performing-arts` (masques)
- **Navigation** : cliquer un bloc → **ouvre une page dédiée** avec une **photo du thème en haut** + des **questions cliquables**. (Il faudra 4 photos de thème, libres de droits.)
- **Accent** : mint/teal. **Icônes** : famille Fluent 3D (cohérente).

### À faire demain
- Répartition des **questions par bloc** (quelles questions dans chaque page).
- Choisir les **4 photos de thème** (ex. parasols colorés pour « Vivre à Montréal »).
- Puis **implémentation complète** dans `index.html` (garde chat, sources, Markdown, FR/EN, récap).

### Assets déjà prêts
- `patrick-app/assets/montreal-hero.jpg` (photo réchauffée + © EXIF)
- `patrick-app/assets/patrick-avatar.jpg` (avatar Patrick)
