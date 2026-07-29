# 🍁 Patrick — One-Pager

**Assistant conversationnel IA bilingue (FR/EN) qui aide les jeunes en PVT / Working Holiday à préparer et réussir leur installation à Montréal.**
🟢 En ligne : **https://patrick-web-app.vercel.app/** · Gratuit, sans compte.

---

### Le problème
Des milliers de jeunes (36 nationalités éligibles) arrivent chaque année à Montréal en PVT et se noient dans une info dispersée, souvent périmée ou biaisée « France par défaut ». Les démarches ratées coûtent cher (RAMQ, bail, arnaques).

### La solution
Patrick répond **à partir d'un corpus curé et vérifié**, **cite ses sources officielles**, **demande la nationalité** avant tout conseil qui en dépend, et **n'invente jamais**. Chaleureux, bilingue, sans collecte de données personnelles.

---

### Ce qu'il couvre
NAS · RAMQ / santé · logement & bail (TAL) · banque · téléphone/internet · emploi & CV · transport · hiver · sorties & réseau · arnaques · bien-être · PVT par nationalité.

### La stack (RAG sur AWS)
| Brique | Outil |
|---|---|
| Génération | **Claude Haiku 4.5** (Amazon Bedrock) |
| Recherche / RAG | **Bedrock Knowledge Base** |
| Vecteurs | **Amazon S3 Vectors** · embeddings **Titan V2** |
| Backend | **Node serverless** (`/api/chat`) |
| Front | HTML/CSS/JS — chat bilingue, rendu Markdown |
| Hébergement / code | **Vercel** + **GitHub** (déploiement auto) |
| Région | **ca-central-1** (Canada) |

### Fiabilité, sécurité & coût
Réponses ancrées + sources citées · zéro donnée personnelle · IAM moindre privilège · **coûts plafonnés** (AWS Budgets + Cost Anomaly + rate-limit).

---

### Statut
✅ **En production**, testé (multi-nationalités, sources, formatage). Corpus extensible (ajouter une fiche = déposer un `.md` + re-sync).

### Feuille de route
Domaine custom · feedback + « questions bonus » · version « étudiants » (corpus déjà tagué).

---

*Conçu et construit de zéro par **Emmanuelle (Em) Barea** — spécialiste mobilité internationale & prompt engineering. 15+ ans d'expérience terrain.*
🔗 manubarea.com · linkedin.com/in/emmanuellebarea
