# Patrick — Brief de reprise (2026-08-05)

*À déposer dans un nouveau chat pour repartir sans gaspiller de tokens. Autoportant.*

---

## 0. Actions manuelles en attente (à faire d'abord)

1. **`git push origin main`** — plusieurs commits locaux non poussés, dont :
   - le **renommage** du dossier `Isabelle Ducharme` → **`infos-additionnelles`** (retire un nom de personne du repo public) ;
   - le **journal anonyme** des questions + le **store DynamoDB** (code inactif tant que non configuré).
   ```
   cd "/Users/Manu/CLAUDE 2026/PATRICK webApp" && git push origin main
   ```
2. **Activer le store persistant** — voir §2 (guide pas-à-pas). C'est LA tâche en cours.

---

## 1. Où en est Patrick (état stable)

- **En ligne** : https://patrick-web-app.vercel.app/ (Vercel, redeploy auto au push).
- **Corpus** : **17 fiches** (00→16) + `17-etudiant-international` = 18 docs dans la **Bedrock Knowledge Base** (bucket S3 `patrick-corpus-barea-2026`, région **ca-central-1**). KB **synchronisée**.
- **Fonctionne en prod** : 4 icônes × 10 questions vedettes · mémoire conversationnelle · **synthèse IA** (bouton « 🧾 Ma synthèse ») · réponses sourcées · garde-fous · impôts + immigration + volet étudiant.
- **Journal anonyme** : le backend logue chaque question (sans IP/PII) dans les **logs Vercel** ; le **store persistant DynamoDB** est codé mais **inactif** tant que `LOG_TABLE` n'est pas défini (voir §2).
- **Auth AWS de l'app** : utilisateur IAM **`Patrick-app`** (clé `AKIA5FQ…`, dans les variables Vercel). `em-admin` = ta console, PAS utilisé par l'app.

## 2. 🎯 GUIDE — Activer le store persistant (DynamoDB)

> But : garder les questions de façon **persistante et analysable** (pour classer les plus fréquentes et mettre à jour les 10 questions/icône). Code déjà déployé, il ne reste que la **config AWS + Vercel**.

### ⚠️ Règle d'or : tout doit être en région **ca-central-1** (Canada Central)
En haut à droite de la console AWS, **sélectionne « Canada (Central) ca-central-1 »** AVANT de créer quoi que ce soit. Si la table est dans une autre région que l'app, l'écriture échoue silencieusement.

### Étape A — Créer la table
1. Console AWS → cherche **DynamoDB** → ouvre.
2. Vérifie la région (haut droite) = **Canada (Central)**.
3. Bouton **Create table**.
4. **Table name** : `patrick-question-log`
5. **Partition key** : tape `id` — à droite, choisis le type **String**.
6. Laisse **Sort key** vide.
7. Section **Table settings** : coche **Customize settings**.
8. **Read/write capacity settings** → choisis **On-demand**.
9. Descends, clique **Create table**. Attends que le statut passe à **Active** (~30 s).

### Étape B — Donner à `Patrick-app` le droit d'écrire
1. Console AWS → **IAM** → menu gauche **Users** → clique **Patrick-app**.
2. Onglet **Permissions** → bouton **Add permissions** → **Create inline policy**.
3. Clique l'onglet **JSON** (au lieu de Visual) et **remplace tout** par :
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "dynamodb:PutItem",
    "Resource": "arn:aws:dynamodb:ca-central-1:*:table/patrick-question-log"
  }]
}
```
4. **Next** → **Policy name** : `patrick-log-write` → **Create policy**.

### Étape C — Dire à l'app d'utiliser la table (Vercel)
1. https://vercel.com → ton projet **patrick-web-app** → **Settings** → **Environment Variables**.
2. **Add New** :
   - Key : `LOG_TABLE`  ·  Value : `patrick-question-log`  ·  Environnements : coche **Production** (et Preview si tu veux).
   - **Save**.
3. Vérifie qu'il existe déjà `AWS_REGION` = `ca-central-1` (sinon ajoute-la de la même façon).
4. Vérifie que `AWS_ACCESS_KEY_ID` commence par `AKIA5FQ…` (= Patrick-app). ✅

### Étape D — Redéployer
Les variables Vercel ne s'appliquent qu'à un **nouveau** déploiement :
- soit `git push origin main` (si pas déjà fait) ;
- soit Vercel → onglet **Deployments** → dernier déploiement → menu **⋯** → **Redeploy**.

### Étape E — Vérifier que ça marche
1. Sur le site, **pose une question** (n'importe laquelle).
2. Console AWS → **DynamoDB** → **Tables** → `patrick-question-log` → bouton **Explore table items**.
3. Tu dois voir **une ligne** apparaître (id, ts, question tronquée, lang, answered, sourced).
4. Si rien n'apparaît après 1-2 min : c'est presque toujours **(a)** mauvaise région, **(b)** `LOG_TABLE` pas sauvegardé / pas redéployé, ou **(c)** policy IAM pas sur le bon user. Regarde aussi **Vercel → Deployments → (dernier) → Functions → Logs** : une erreur `DynamoDB put error` t'y dira quoi corriger.

## 3. Backlog (plus tard)

- **Questions les plus fréquentes** : quand la table a quelques semaines de données → exporter, agréger, et mettre à jour les 10 questions/icône (codées en dur dans `patrick-app/index.html`, objet `FEATURED`).
- **Post LinkedIn de lancement** : géré dans un autre chat (voir `BRIEF-post-linkedin-lancement.md`).
- **Nettoyage** : le prénom « Isabelle » apparaît encore dans le **contenu** de `infos-additionnelles/files/HANDOFF-…md` (doc de travail, prénom seul) — à scrubber si tu veux être 100 % anonyme.
- **P1** : seuil de pertinence RAG, limite de longueur des questions, tests automatisés, enrichir fiches `06-emploi-cv` et `08-culture` (lexique).

## 4. Plomberie (rappels)
- Modif **fiche corpus** → re-upload S3 (`patrick-corpus-barea-2026`) + **Sync** Bedrock.
- Modif **app** (`patrick-app/…`) → **git push** → Vercel redéploie → recharger avec `?v=N`.
- Comportement de Patrick = `patrick-app/api/patrick-system-prompt.md` (≠ skill Cowork).
