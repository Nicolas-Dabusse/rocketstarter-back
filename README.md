# RocketStarter Backend

A Node.js backend application with SQLite database, fully containerized with Docker. This is a Kanban-style project management API with web3 wallet integration and reward system.

## 🚀 Features

- **Node.js** backend with Express.js and TypeScript
- **SQLite** database for easy development and deployment
- **Docker** containerization for easy deployment
- **Docker Compose** for development environment
- **Sequelize ORM** with models and associations
- **Kanban workflow** (todo → inprogress → inreview → done)
- **Web3 wallet authentication** ready
- **Reward system** (tokens, NFTs, crypto)
- **RESTful API** with full CRUD operations

## 📋 Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

**Note**: This project uses SQLite for the database, so no additional database setup is required!

**🎯 For Frontend Developers**: See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for detailed integration guide with React/Vue/Angular.

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nicolas-Dabusse/rocketstarter-back.git
   cd rocketstarter-back
   ```

2. **The project is ready to use!** 
   The `.env` file is already configured for development with SQLite.

   **Optional**: Edit the `.env` file if needed:
   ```env
   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here_change_this_in_production

   # SQLite Configuration (automatically managed)
   SQLITE_PATH=./data/database.sqlite
   ```

## 🐳 Quick Start with Docker (Recommended)

### 1. Start the Development Server
```bash
# Start the API server in development mode
docker compose up -d --build

# View logs (optional)
docker compose logs -f
```

### 2. Seed the Database (Optional)
```bash
# Add sample data for testing
npm run seed:docker

# Or use the automatic version (starts container + seeds)
npm run seed:auto
```

### 3. Test the API
The API will be available at:
- **Base URL**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **API Info**: `http://localhost:3000/api/v1`

### 4. Stop the Services
```bash
docker compose down
```

## 🔧 Local Development (Alternative)

If you prefer to run the application locally without Docker:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   
   **Note:** The seeding process creates sample users, projects, tasks, categories, and rewards for testing.

3. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

**Note**: The SQLite database file will be automatically created in `./data/database.sqlite`

## 📊 Database & Seeding

### Database Schema
The database automatically creates the following entities:
- **Users** (with wallet addresses)
- **Projects** (with owner and progress tracking)
- **Tasks** (Kanban workflow: todo → inprogress → inreview → done)
- **Categories** (many-to-many with projects and tasks)
- **Rewards** (tokens, NFTs, crypto rewards for tasks)

### Seeding Options

```bash
# Seed with Docker (recommended)
npm run seed:docker

# Seed + auto-start container
npm run seed:auto

# Local seeding (if running locally)
npm run seed
```

### Sample Data Included
After seeding, you'll have:
- 3 sample users (John Doe, Jane Smith, Alice Johnson)
- 2 projects (DeFi Platform, NFT Marketplace)  
- Multiple tasks with different statuses (todo=0, inprogress=1, inreview=2, done=3)
- 3 categories (Frontend, Backend, Blockchain)
- Sample rewards (tokens, crypto, NFTs) linked to tasks

**Troubleshooting:** If seeded data doesn't appear in API responses:
```bash
# Restart the application container
docker-compose restart app

# Or check logs
docker-compose logs app
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📖 API Documentation

### 🎯 For Frontend Developers
1. **CORS is pre-configured** for common development ports (3000, 5173, 8080, etc.)
2. **Quick Test**: Open `cors-test.html` in your browser to test the API
3. **Detailed Guide**: See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

### Base Endpoints
- **Health Check**: `GET http://localhost:3000/health`
- **API Info**: `GET http://localhost:3000/api/v1`
- **CORS Test Page**: Open `cors-test.html` in browser

### Main API Routes

#### Users
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:address` - Get user by address
- `PUT /api/v1/users/:address` - Update user
- `DELETE /api/v1/users/:address` - Delete user

#### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project (owner only)

#### Tasks (Kanban Workflow)
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task (with workflow rules)
- `DELETE /api/v1/tasks/:id` - Delete task (owner only)

#### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/tasks/:id/categories` - Get task categories
- `POST /api/v1/tasks/:id/categories` - Add category to task
- `DELETE /api/v1/tasks/:id/categories/:categoryId` - Remove category from task

### Task Workflow Rules
- **Builder can**: Assign themselves (`todo` → `inprogress`), release task (`inprogress` → `todo`), request review (`inprogress` → `inreview`)
- **Owner can**: Mark task as done (`inreview` → `done`), modify any task, delete tasks

### Authentication Header
For secured operations, include:
```
x-user-address: 0xYourWalletAddress
```

## 🔍 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build TypeScript for production |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed the database (local) |
| `npm run seed:docker` | Seed the database (Docker) |
| `npm run seed:auto` | Start container + seed automatically |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:logs` | View Docker logs |

## 🐳 Docker Commands

### Useful Docker Compose Commands

```bash
# View running containers
docker compose ps

# Access the application container
docker compose exec app bash

# View logs for the app
docker compose logs -f app

# Rebuild the service
docker compose build app

# Remove all containers and volumes
docker compose down -v

# Start fresh (rebuild + restart)
docker compose down && docker compose up -d --build
```

### Database Management

```bash
# Check database content
docker compose exec app node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/database.sqlite',
  logging: false
});
sequelize.query('SELECT COUNT(*) as count FROM Project')
  .then(result => console.log('Projects:', result[0][0].count))
  .then(() => sequelize.close());
"

# Backup SQLite database
cp ./data/database.sqlite ./backup-$(date +%Y%m%d).sqlite

# Reset database (removes all data)
rm ./data/database.sqlite && npm run seed:auto
```

## 🌐 Environment Configuration

### Development
- Database: SQLite (no setup required)
- Hot reload enabled with nodemon
- TypeScript compilation on-the-fly
- Detailed error messages and logging

### Production Ready
- TypeScript compiled to JavaScript
- Optimized Docker images
- SQLite for easy deployment
- Environment variables for configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation when needed
- Use conventional commits
- Ensure all tests pass before submitting

## 📝 Project Structure

```
rocketstarter-back/
├── src/
│   ├── controllers/     # API route controllers
│   ├── middleware/      # Custom middleware functions
│   ├── models/          # Sequelize models (User, Project, Task, etc.)
│   ├── routes/          # Express routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── app.ts           # Express app setup
├── data/
│   ├── database.sqlite  # SQLite database file (auto-generated)
│   ├── schema.sql       # Database schema reference
│   └── seed.ts          # Database seeding script
├── docker-compose.yml   # Docker development environment
├── Dockerfile.dev       # Docker image for development
├── Dockerfile           # Docker image for production
├── package.json         # NPM dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🚨 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection issues**
```bash
# Reset SQLite database
rm ./data/database.sqlite
docker-compose restart app
npm run seed:auto
```

**Seeded data not visible in API**
```bash
# Check if data exists in database
docker compose exec app ls -la ./data/
# Restart application
docker-compose restart app
# Re-seed if needed
npm run seed:docker
```

**Permission issues with Docker**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Health Checks

- **Application**: `http://localhost:3000/health`
- **Database**: Check SQLite file exists `ls -la ./data/database.sqlite`
- **Container Logs**: `docker-compose logs app`

### Test API Endpoints

After seeding, test these endpoints to verify everything works:

```bash
# Test users endpoint
curl http://localhost:3000/api/v1/users

# Test projects endpoint  
curl http://localhost:3000/api/v1/projects

# Test tasks endpoint
curl http://localhost:3000/api/v1/tasks

# Test specific project
curl http://localhost:3000/api/v1/projects/1
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/Kudora-Labs/rocketstarter-back/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the development team

---
