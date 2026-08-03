# Patrick — Reprise du samedi (2026-08-03)

Session Cowork autonome. Tout le travail fichier est **fait et validé** ; il reste **tes deux
actions manuelles** (git push + S3/Sync) car le sandbox n'a pas pu committer (voir §4).

> ⚠️ Note : la conversation « Insights from Isabelle » n'a pas été collée (tu n'étais pas là). J'ai
> travaillé à partir du **HANDOFF déjà présent** (`Isabelle Ducharme/files/HANDOFF-…md`), qui est un
> résumé auto-suffisant de cette conversation. Si tu veux, colle le transcript brut et je complète.

---

## 1. Volet étudiant + emploi (contenu corpus)

- **`corpus/06-emploi-cv.md`** enrichi : CV québécois vs étranger, où chercher (**Guichet-Emplois**),
  culture pro, **réseautage** (marché caché, coffee chats), **orientation/mentorat via Academos**,
  « à quoi s'attendre » (expérience canadienne, délais, équivalences).
- **`corpus/17-etudiant-international.md`** — **NOUVELLE fiche** (le pendant *corpus* des specs
  d'Isabelle) : CAQ + permis d'études, travail pendant les études (flag heures = renvoi IRCC, jamais
  de chiffre figé), santé/assurance (RAMQ/entente/régime établissement), démarches communes,
  **info ≠ conseil** (redirection établissement / CCIC-Barreau), réseau & intégration (réseau UQ,
  Academos). Respecte tes garde-fous.
- **`academos.qc.ca`** vérifié (mentorat virtuel gratuit 14-30 ans, soutenu par le Secrétariat à la
  jeunesse du Québec — source officielle OK) → ajouté dans **06** et **17**.
- `corpus/README.md` : arborescence mise à jour (ajout 17, notes « à créer » cochées).

## 2. Sources officielles ajoutées (vérifiées avant insertion)

| Fiche | Lien officiel ajouté |
|---|---|
| 00-avant-le-depart | IRCC — EIC (canada.ca /iec/about) |
| 01-nas | Service Canada — NAS (canada.ca) |
| 05-telephone | CRTC (crtc.gc.ca) |
| 11-pvt-par-nationalite | IRCC — EIC eligibility |
| 15-impots | Revenu Québec — Déclaration de revenus |
| 16-immigration | IRCC — EIC |
| 17-etudiant *(new)* | MIFI/Québec (CAQ), IRCC (permis d'études, travail), RAMQ, Service Canada, TAL |

*Fiches « souples » (07 hiver, 08 culture, 09 découvrir) : pas d'URL d'organisme officiel par nature
→ laissées telles quelles. RAMQ/TAL/SAAQ avaient déjà leurs URLs.*

## 3. Synthèse IA + mémoire conversationnelle (app) — §3 du brief précédent

- **`patrick-app/api/chat.js`** : accepte `history` et `mode:"synthesis"`.
  - **Mémoire** : les tours passés deviennent des `messages` multi-tours Converse (contexte RAG
    injecté **uniquement dans le dernier message user**) → Patrick ne redemande plus la nationalité.
    `buildMessages()` garantit start-user / alternance / end-user (contraintes Bedrock).
  - **Synthèse** : `mode:"synthesis"` = **pas de retrieval**, one-pager structuré (Profil · Questions
    · Réponses clés · Démarches+délais · Ressources · Prochaines étapes). Fallback local si Bedrock
    indisponible.
- **`patrick-app/index.html`** : `callBackend` envoie `history` ; le bouton **« 🧾 Ma synthèse »**
  appelle le mode synthèse et **rend le markdown** (`mdToHtml`) dans la modale (fini le `<pre>`),
  avec Copier / Télécharger. Repli local si hors-ligne.
- **Validé** : `node --check` OK ; self-tests chat.js **12/12 ✓** (incl. buildMessages + synthèse) ;
  tous les blocs `<script>` d'index.html parsent OK.
- ⚠️ **À tester EN LIVE après push** (impossible de simuler Bedrock ici).

## 4. TES ACTIONS (le sandbox n'a pas pu committer)

Un `.git/index.lock` bloquant traînait (autre process git ?) + pas d'identité git dans le sandbox.
Rien n'est committé. Depuis ton terminal :

```bash
cd "/Users/Manu/CLAUDE 2026/PATRICK webApp"
rm -f .git/index.lock        # enlève le verrou bloquant

# Lot 1 — contenu corpus (volet étudiant + emploi)
git add corpus/06-emploi-cv.md corpus/17-etudiant-international.md corpus/README.md
git commit -m "corpus: enrichir emploi/CV + nouvelle fiche étudiant international (Academos, réseau UQ)"

# Lot 2 — sources officielles vérifiées
git add corpus/00-avant-le-depart.md corpus/01-nas.md corpus/05-telephone-internet.md \
        corpus/11-pvt-par-nationalite.md corpus/15-impots.md corpus/16-immigration.md
git commit -m "corpus: ajouter URLs officielles vérifiées (IRCC, Service Canada, CRTC, Revenu Québec)"

# Lot 3 — app : synthèse IA + mémoire conversationnelle
git add patrick-app/api/chat.js patrick-app/index.html BRIEF-reprise_2026-08-03.md
git commit -m "app: mémoire conversationnelle (history) + mode synthèse one-pager"

git push origin main         # Vercel redéploie
```

Puis :
1. **S3 + Sync** (le git push NE met PAS à jour la Knowledge Base) : re-upload sur le bucket
   `patrick-corpus-barea-2026` des fiches modifiées **+ la nouvelle 17**, puis **Sync** dans Bedrock :
   `06`, `17`, `00`, `01`, `05`, `11`, `15`, `16` (+ `README` si tu veux).
2. **Recharge** https://patrick-web-app.vercel.app/ avec `?v=6` et teste **en live** :
   - pose 2-3 questions (dont ta nationalité) → vérifie que **Patrick ne la redemande pas** ;
   - clique **🧾 Ma synthèse** → tu dois voir un **vrai one-pager rédigé** (pas la simple relecture).

---

*Choix faits en autonomie : (a) volet étudiant matérialisé en fiche corpus `17` plutôt que laissé en
spec, pour que Patrick puisse réellement répondre ; (b) travaillé depuis le HANDOFF Isabelle faute de
transcript brut ; (c) heures de travail étudiant laissées en renvoi IRCC sans chiffre figé.*
