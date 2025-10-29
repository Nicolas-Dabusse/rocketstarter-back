# 🚀 RocketStarter Backend - Frontend Quick Guide

## 1. Lancer le projet backend

```bash
git clone <repo-url>
cd rocketstarter-back
docker-compose up -d
npm run seed:auto
```

- Accès API : http://localhost:3000/api/v1
- Health check : http://localhost:3000/health

## 2. Endpoints principaux

### 🗂️ Projets
- `GET    /api/v1/projects`           → Liste tous les projets
- `POST   /api/v1/projects`           → Créer un projet
- `GET    /api/v1/projects/:id`       → Détail d'un projet
- `PUT    /api/v1/projects/:id`       → Modifier un projet (owner)
- `DELETE /api/v1/projects/:id`       → Supprimer un projet (owner)

### 📝 Tâches (Kanban)
- `GET    /api/v1/tasks`              → Liste toutes les tâches
- `POST   /api/v1/tasks`              → Créer une tâche
- `PUT    /api/v1/tasks/:id`          → Modifier une tâche (workflow Kanban)

### 👤 Utilisateurs
- `GET    /api/v1/users`              → Liste tous les utilisateurs
- `POST   /api/v1/users`              → Créer un utilisateur

## 3. Authentification

Ajouter le header :
```http
x-user-address: 0xYourWalletAddress
```

## 4. Exemple Axios
```js
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: { 'x-user-address': '0xYourWalletAddress' }
});
```

## 5. Endpoints complets

### Health
- `GET    /health`                  → Health check
- `GET    /db-test`                 → Test connexion DB
- `GET    /api/v1`                  → Infos API

### Utilisateurs
- `POST   /api/v1/users`            → Créer un utilisateur
- `GET    /api/v1/users`            → Liste tous les utilisateurs
- `GET    /api/v1/users/:address`   → Détail utilisateur par adresse
- `PUT    /api/v1/users/:address`   → Modifier utilisateur
- `DELETE /api/v1/users/:address`   → Supprimer utilisateur

### Projets
- `POST   /api/v1/projects`         → Créer un projet
- `GET    /api/v1/projects`         → Liste tous les projets
- `GET    /api/v1/projects/:id`     → Détail projet
- `PUT    /api/v1/projects/:id`     → Modifier projet
- `DELETE /api/v1/projects/:id`     → Supprimer projet

### Tâches
- `POST   /api/v1/tasks`            → Créer une tâche
- `GET    /api/v1/tasks`            → Liste toutes les tâches
- `GET    /api/v1/tasks/:id`        → Détail tâche
- `PUT    /api/v1/tasks/:id`        → Modifier tâche
- `DELETE /api/v1/tasks/:id`        → Supprimer tâche

### Steps
- `POST   /api/v1/steps`                    → Créer un step
- `GET    /api/v1/steps`                    → Liste tous les steps
- `GET    /api/v1/steps/my`                 → Steps assignés à moi
- `GET    /api/v1/steps/project/:projectId` → Steps d'un projet
- `GET    /api/v1/steps/:id`                → Détail step
- `PUT    /api/v1/steps/:id`                → Modifier step
- `DELETE /api/v1/steps/:id`                → Supprimer step

### Catégories
- `GET    /api/v1/categories`                       → Liste toutes les catégories
- `GET    /api/v1/tasks/:id/categories`             → Catégories d'une tâche
- `POST   /api/v1/tasks/:id/categories`             → Ajouter catégorie à une tâche
- `DELETE /api/v1/tasks/:id/categories/:categoryId` → Retirer catégorie d'une tâche

---
Pour toute question, ping le backend 🚀
