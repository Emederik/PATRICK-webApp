# Configuration AWS Bedrock — Patrick (ca-central-1 + Aurora pgvector)

*Guide pas-à-pas. Tu fais les clics dans la console AWS ; ce document te donne l'ordre, la politique IAM et les points à vérifier. Dernière mise à jour : 2026-07-28.*

> ⚠️ **Nuance ca-central-1 :** dans la région Canada (Central), Claude sur Bedrock s'utilise via un
> **profil d'inférence inter-régions (Cross-Region Inference, « CRIS », profil CA)** — pas en accès
> direct on-demand. Ça a deux conséquences : (1) tu invoques un **inference profile**, pas un model-id
> brut ; (2) la **politique IAM** doit autoriser `InvokeModel` sur le profil **ET** sur le modèle de
> base dans les régions vers lesquelles le profil route (d'où le `:*:` région dans l'ARN plus bas).

## 0. Principes de sécurité (non négociables)
- **Moindre privilège** : la fonction n'a que les droits Bedrock/KB dont elle a besoin.
- **Clés jamais dans le code ni sur Git** : variables d'environnement uniquement (`.env.local` ignoré par git + variables d'env de l'hébergeur).
- **MFA** sur l'utilisateur, **budget plafonné** avant toute mise en prod.

## 1. Activer l'accès aux modèles (Bedrock → Model access)
1. Console AWS → **région ca-central-1** (coin haut-droit).
2. **Amazon Bedrock → Model access → Manage model access**.
3. Active : **Anthropic Claude** (celui proposé via le profil CA — ex. Sonnet/Haiku récents) **et** **Amazon Titan Text Embeddings** (pour la vectorisation).
4. ⚠️ **Note les identifiants exacts** qui apparaissent (model-id + inference-profile-id) — tu en auras besoin aux §5 et §9. *(À vérifier : la liste dépend de ce qui est activé dans ta région ; Titan Embeddings doit être présent.)*

## 2. Bucket S3 (le corpus)
1. **S3 → Create bucket**, région **ca-central-1**, nom unique (ex. `patrick-corpus-<tonid>`).
2. Bloquer tout accès public (par défaut). Uploader le contenu de `corpus/*.md`.

## 3. Base vectorielle — Aurora PostgreSQL Serverless v2 + pgvector
1. **RDS → Create database → Aurora (PostgreSQL-Compatible)**, mode **Serverless v2**, région ca-central-1.
2. Stocker les identifiants dans **AWS Secrets Manager** (la Knowledge Base s'en servira).
3. Se connecter à la base et préparer pgvector :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   -- (schéma + table + colonnes selon l'assistant Knowledge Base ; la console te donne le format attendu :
   --  colonnes id, embedding vector(...), chunk/text, metadata)
   ```
   *(Suis le format exact demandé par l'assistant KB au §4 — dimensions du vecteur = celles du modèle d'embeddings Titan choisi.)*

## 4. Créer la Knowledge Base (Bedrock → Knowledge Bases)
1. **Bedrock → Knowledge bases → Create**.
2. **Source** : le bucket S3 du §2.
3. **Embeddings** : Titan Text Embeddings (§1).
4. **Vector store** : **Aurora PostgreSQL** (renseigne cluster + secret Secrets Manager + table du §3).
5. Lance la **synchronisation (ingestion)** : Bedrock chunk + embed le corpus. **Note le `Knowledge Base ID`** (§5, §9).
6. La console crée un **rôle de service** que Bedrock assume pour lire S3 + écrire Aurora + invoquer les embeddings. (Laisse la console le générer — c'est le plus sûr.)

## 5. IAM — l'identité de ton application (`/api/chat`)
C'est **séparé** du rôle de service KB du §4. Crée une **politique de moindre privilège**, puis attache-la à un **utilisateur IAM** (clé programmatique) ou à un rôle.

**Politique JSON** (remplace `<ACCOUNT_ID>`, `<CLAUDE_CA_PROFILE_ID>`, `<CLAUDE_MODEL_ID>`, `<KB_ID>`) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeClaudeViaInferenceProfileCA",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ca-central-1:<ACCOUNT_ID>:inference-profile/<CLAUDE_CA_PROFILE_ID>",
        "arn:aws:bedrock:*::foundation-model/<CLAUDE_MODEL_ID>"
      ]
    },
    {
      "Sid": "RetrieveFromKnowledgeBase",
      "Effect": "Allow",
      "Action": ["bedrock:Retrieve"],
      "Resource": "arn:aws:bedrock:ca-central-1:<ACCOUNT_ID>:knowledge-base/<KB_ID>"
    }
  ]
}
```

> Le second ARN (`arn:aws:bedrock:*::foundation-model/...`, région en `*`) est **volontaire** : le profil
> CRIS route la requête vers d'autres régions, et `InvokeModel` doit y être autorisé. C'est le motif
> documenté par AWS pour l'inférence inter-régions.

## 6. Créer l'utilisateur & les clés (IAM)
1. **IAM → Users → Create user** (ex. `patrick-app`). **Pas** d'accès console nécessaire.
2. Attache la politique du §5.
3. **Create access key → Application running outside AWS** → récupère **Access key ID** + **Secret**.
4. Active **MFA** sur cet utilisateur.
5. ⚠️ Le **secret ne s'affiche qu'une fois** — copie-le immédiatement dans ton gestionnaire de secrets.

> Alternative « best practice » : **IAM Identity Center** (identités temporaires, pas de clés longue durée).
> Plus propre mais plus de setup ; pour un MVP solo, l'utilisateur IAM ci-dessus + MFA + budget suffit.

## 7. Stocker les identifiants (jamais dans le code)
Dans `patrick-app/`, un fichier **`.env.local`** (ajouté à `.gitignore`) :
```
AWS_REGION=ca-central-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_CLAUDE_PROFILE=<CLAUDE_CA_PROFILE_ID>
BEDROCK_KB_ID=<KB_ID>
```
En prod (Vercel/Netlify) : mets ces mêmes clés dans les **variables d'environnement de l'hébergeur**.

## 8. Garde-fou budget (fais-le tout de suite)
- **AWS Budgets → Create budget** : budget mensuel (ex. 20–50 $) + **alerte email** à 50 %/80 %/100 %.
- Ça ne coupe pas automatiquement, mais te prévient tôt. Combine avec le rate-limit déjà en place dans `chat.js`.

## 9. Brancher dans `patrick-app/api/chat.js`
Remplacer les deux mocks (repères commentés dans le fichier) :
- `mockRetrieve()` → **RetrieveCommand** (`@aws-sdk/client-bedrock-agent-runtime`) sur `BEDROCK_KB_ID`.
- `mockGenerate()` → **ConverseCommand** (`@aws-sdk/client-bedrock-runtime`), `modelId = BEDROCK_CLAUDE_PROFILE`, en passant `SYSTEM_PROMPT` + les chunks récupérés + le message.
- Garder rate-limit, plafond, prompt système, log question-sans-réponse **tels quels**.

*(C'est exactement ce que fera Claude Code via `/opsx:apply` sur les tâches AWS — ou moi ici si tu préfères, une fois les IDs du §1/§4 connus.)*

## 10. À vérifier avant prod (je ne l'affirme pas de mémoire)
- Les **IDs exacts** du modèle Claude et du **profil d'inférence CA** (console §1).
- La **dispo de Titan Embeddings** en ca-central-1 et la **dimension** du vecteur (→ table Aurora).
- Les **tarifs** Aurora Serverless v2 + Bedrock (tokens) — surveille via Budgets.
- Que le **rôle de service KB** (§4) a bien accès S3 + Aurora + Secrets.

---

*Ordre conseillé : §1 → §2 → §3 → §4 (récupère KB ID + IDs modèles) → §5/§6 (IAM) → §8 (budget) → §9 (code).*
