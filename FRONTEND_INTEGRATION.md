# Frontend Integration Guide

## 🎯 Quick Setup for Frontend Developers

This guide helps frontend developers (React, Vue, Angular, etc.) integrate with the RocketStarter Backend API.

## 🚀 Backend Setup

1. **Clone and start the backend**
   ```bash
   git clone <backend-repo>
   cd rocketstarter-back
   docker-compose up -d
   npm run seed:auto
   ```

2. **Verify backend is running**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"OK","message":"RocketStarter Backend is running"}
   ```

## 🌐 CORS Configuration

The backend is configured to accept requests from common development ports:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (React alternative)
- `http://localhost:5173` (Vite default)
- `http://localhost:4173` (Vite preview)
- `http://localhost:8080` (Webpack dev server)

### Custom Port Configuration
If your frontend runs on a different port, add it to `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:YOUR_PORT
```

## 🔧 Frontend Configuration

### React + Axios Example
```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add user address to requests (for authentication)
export const setUserAddress = (address) => {
  if (address) {
    api.defaults.headers['x-user-address'] = address;
  } else {
    delete api.defaults.headers['x-user-address'];
  }
};

export default api;
```

### React + Fetch Example
```javascript
// api.js
const API_BASE = 'http://localhost:3000/api/v1';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// Usage example
export const getProjects = () => apiRequest('/projects');
export const createProject = (data) => apiRequest('/projects', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## 📡 API Endpoints Reference

### Base URLs
- **Health**: `GET http://localhost:3000/health`
- **API Base**: `http://localhost:3000/api/v1`

### Authentication
For secured operations, include the user's wallet address:
```javascript
headers: {
  'x-user-address': '0xYourWalletAddress'
}
```

### Main Endpoints

#### Projects
```javascript
// Get all projects
GET /api/v1/projects

// Create project (requires x-user-address)
POST /api/v1/projects
{
  "name": "My Project",
  "description": "Project description",
  "ownerAddress": "0xUserAddress"
}

// Get project details
GET /api/v1/projects/1

// Update project (owner only)
PUT /api/v1/projects/1

// Delete project (owner only)
DELETE /api/v1/projects/1
```

#### Tasks (Kanban Workflow)
```javascript
// Get all tasks
GET /api/v1/tasks

// Create task
POST /api/v1/tasks
{
  "title": "Task title",
  "description": "Task description",
  "projectId": 1,
  "priority": 1,     // 0=low, 1=medium, 2=high, 3=urgent
  "status": 0        // 0=todo, 1=inprogress, 2=inreview, 3=done
}

// Update task (with workflow rules)
PUT /api/v1/tasks/1
{
  "status": 1,       // Move to "in progress"
  "builderAddress": "0xBuilderAddress"
}
```

#### Users
```javascript
// Get all users
GET /api/v1/users

// Create user
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "walletAddress": "0xUserAddress"
}
```

## 🎮 Task Workflow Rules

### Builder Actions (any user)
- Assign task to themselves: `status: 0 → 1` (todo → inprogress)
- Release task: `status: 1 → 0` (inprogress → todo)  
- Request review: `status: 1 → 2` (inprogress → inreview)

### Owner Actions (project owner)
- Approve task: `status: 2 → 3` (inreview → done)
- Modify any task
- Delete tasks

## 🧪 Testing the Integration

### 0. Interactive Test Page
**Open the test page in your browser:**
```bash
# Option 1: Direct file URL (copy-paste in browser)
file:///path/to/your/project/cors-test.html

# Option 2: Local HTTP server (recommended)
python3 -m http.server 8081
# Then open: http://localhost:8081/cors-test.html

# Option 3: VS Code
# Right-click cors-test.html → "Open with Live Server"
```

### 1. Test Basic Connection
```javascript
// In your React app
useEffect(() => {
  fetch('http://localhost:3000/health')
    .then(res => res.json())
    .then(data => console.log('Backend connected:', data))
    .catch(err => console.error('Backend connection failed:', err));
}, []);
```

### 2. Test API Endpoints
```javascript
// Test getting projects
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/projects');
    const projects = await response.json();
    console.log('Projects:', projects);
  } catch (error) {
    console.error('API test failed:', error);
  }
};
```

### 3. Test with User Authentication
```javascript
// Test with user address
const testWithUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/tasks', {
      headers: {
        'x-user-address': '0x742d35Cc6634C0532925a3b8D429499295E09e8D'
      }
    });
    const tasks = await response.json();
    console.log('Tasks:', tasks);
  } catch (error) {
    console.error('Auth test failed:', error);
  }
};
```

## 🐛 Common Issues & Solutions

### CORS Errors
```bash
# Add your frontend port to backend .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:YOUR_PORT
# Then restart backend
docker-compose restart app
```

### Network Errors
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check backend logs
docker-compose logs app
```

### Empty Data Responses
```bash
# Re-seed the database
npm run seed:docker
```

## 📱 React Hook Example

```javascript
// useAPI.js
import { useState, useEffect } from 'react';
import api from './api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error };
};
```

## 🔗 Useful Links

- **API Health**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api/v1
- **Sample Users**: Check seeded data with `GET /api/v1/users`
- **Sample Projects**: Check seeded data with `GET /api/v1/projects`

---

**Need help?** Check the backend logs with `docker-compose logs app` or create an issue in the repository.