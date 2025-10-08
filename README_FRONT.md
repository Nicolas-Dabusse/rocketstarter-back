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

---
Pour toute question, ping le backend 🚀
