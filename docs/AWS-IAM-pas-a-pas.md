# AWS — Pas-à-pas : région Canada + utilisateur IAM + permissions

*À suivre en gardant la console AWS ouverte à côté. Les libellés peuvent varier légèrement (AWS met
souvent l'interface à jour) — l'esprit reste le même. Dernière mise à jour : 2026-07-28.*

> 🔐 **Règle d'or** : on ne se sert JAMAIS de la clé du **compte racine (root)** pour l'application.
> On crée un **utilisateur dédié** avec juste les droits nécessaires. Le root sert uniquement à
> administrer et devrait avoir la **MFA** activée.

---

## Partie 1 — Se connecter et choisir la région Canada

1. Va sur **https://console.aws.amazon.com** et connecte-toi.
2. En **haut à droite**, à côté de ton nom de compte, il y a un **menu déroulant de région**
   (ex. « N. Virginia »). Clique dessus → choisis **Canada (Central) — ca-central-1**.
   → Toutes les ressources que tu créeras (S3, Aurora, Knowledge Base) le seront dans la région
   **affichée en haut à droite**. Vérifie qu'il est bien sur **ca-central-1** à chaque étape.
3. Récupère ton **Account ID** (12 chiffres) : clique ton **nom de compte** (haut droite) →
   l'**ID de compte** s'affiche. **Copie-le** (tu en as besoin en Partie 2).

> ℹ️ Note : **IAM est un service global** — quand tu l'ouvriras, il n'affiche pas de région, c'est
> normal. La région ca-central-1 concerne Bedrock/S3/Aurora, pas IAM lui-même.

---

## Partie 2 — Créer la politique de permissions (least privilege)

1. Barre de recherche AWS (en haut) → tape **IAM** → ouvre le service **IAM**.
2. Menu de gauche → **Policies** → bouton **Create policy**.
3. Clique l'onglet **JSON**, efface le contenu, et colle ceci
   (**remplace `<ACCOUNT_ID>`** par ton numéro de compte de la Partie 1) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeClaude",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ca-central-1:<ACCOUNT_ID>:inference-profile/*",
        "arn:aws:bedrock:*::foundation-model/*"
      ]
    },
    {
      "Sid": "BedrockRetrieveKB",
      "Effect": "Allow",
      "Action": ["bedrock:Retrieve"],
      "Resource": "arn:aws:bedrock:ca-central-1:<ACCOUNT_ID>:knowledge-base/*"
    }
  ]
}
```

4. **Next** → **Policy name** : `PatrickBedrockAccess` → **Create policy**.

> 🎯 Cette version « starter » limite déjà à **Bedrock**, **ta région** et **ton compte**, mais garde
> un `*` sur l'ID précis du profil/de la KB (que tu ne connais pas encore). **Plus tard**, quand la
> Knowledge Base existera, remplace les `*` par les ARNs exacts (voir `AWS-Bedrock-setup_ca-central-1.md` §5)
> pour resserrer encore.

---

## Partie 3 — Créer l'utilisateur IAM

1. IAM → menu de gauche → **Users** → **Create user**.
2. **User name** : `patrick-app`.
3. **NE COCHE PAS** « Provide user access to the AWS Management Console » (l'app n'a pas besoin de se
   connecter à la console — juste d'une clé programmatique). → **Next**.
4. Écran **Set permissions** → choisis **Attach policies directly**.
5. Dans la recherche, tape `PatrickBedrockAccess` → **coche** la politique créée en Partie 2. → **Next**.
6. **Create user**.

---

## Partie 4 — Créer la clé d'accès (Access key)

1. Dans **Users**, clique sur **patrick-app**.
2. Onglet **Security credentials** → section **Access keys** → **Create access key**.
3. **Use case** : choisis **Application running outside AWS** → **Next** → **Create access key**.
4. Tu vois maintenant **Access key ID** et **Secret access key**.
   ⚠️ **Le secret ne s'affiche qu'UNE seule fois.** Copie les deux **immédiatement**
   (bouton « Download .csv » possible). Range-les dans `.env.local` (Partie 6).

---

## Partie 5 — Activer la MFA (fortement recommandé)

- Sur le **compte racine** en priorité : menu ton nom → **Security credentials** → **Assign MFA device**
  → suis l'assistant (appli d'authentification type Google Authenticator / Authy).
- Optionnel aussi sur `patrick-app` (utile s'il a un accès console un jour ; pour une clé programmatique
  seule, la priorité MFA reste le root).

---

## Partie 6 — Ranger les clés (jamais dans le code / Git)

1. Dans le dossier `patrick-app/`, crée un fichier **`.env.local`** :
   ```
   AWS_REGION=ca-central-1
   AWS_ACCESS_KEY_ID=... (Access key ID de la Partie 4)
   AWS_SECRET_ACCESS_KEY=... (Secret access key de la Partie 4)
   # à compléter après création de la Knowledge Base :
   BEDROCK_CLAUDE_PROFILE=
   BEDROCK_KB_ID=
   ```
2. Le **`.gitignore`** à la racine du projet (déjà ajouté) empêche `.env.local` de partir sur GitHub.
   ✅ Pour vérifier : `git status` ne doit **jamais** lister `.env.local`.
3. En production (Vercel/Netlify plus tard) : recopie ces variables dans les **variables d'environnement
   de l'hébergeur** (pas de fichier `.env.local` en prod).

---

## Ce qu'il te reste ensuite (dans l'ordre)

Après l'IAM, reviens au guide **`AWS-Bedrock-setup_ca-central-1.md`** pour :
1. **§1 Model access** (activer Claude via profil CA + Titan Embeddings) → récupère les **IDs**.
2. **§2 S3** (bucket + upload corpus) → **§3 Aurora pgvector** → **§4 Knowledge Base** (récupère le **KB_ID**).
3. **§8 Budget** (alerte email).
4. Colle-moi le **KB_ID + profil Claude + model-id** et **je câble `chat.js` sur Bedrock**.

> ⚠️ À vérifier dans la console (je ne l'affirme pas de mémoire) : les **IDs exacts** du modèle Claude
> et du **profil d'inférence CA**, la **dispo de Titan Embeddings** en ca-central-1, et les **tarifs**.
