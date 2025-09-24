# RocketStarter Backend

A Node.js backend application with PostgreSQL database, fully containerized with Docker.

## 🚀 Features

- **Node.js** backend with Express.js framework
- **PostgreSQL** relational database
- **Docker** containerization for easy deployment
- **Docker Compose** for multi-service orchestration
- Database migrations and seeding
- Environment-based configuration
- API documentation with Swagger/OpenAPI

## 📋 Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kudora-Labs/rocketstarter-back.git
   cd rocketstarter-back
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   
   Edit the `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=rocketstarter
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # Application
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here

   # Docker
   POSTGRES_DB=rocketstarter
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password_here
   ```

## 🐳 Quick Start with Docker

### Development Mode

1. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

2. **Run in background (detached mode)**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop all services**
   ```bash
   docker-compose down
   ```

### Production Mode

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔧 Local Development

If you prefer to run the application locally without Docker:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL database**
   ```bash
   docker-compose up postgres -d
   ```

3. **Run database migrations**
   ```bash
   npm run migrate
   ```

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📊 Database Management

### Migrations

- **Create a new migration**
  ```bash
  npm run migration:create -- --name your_migration_name
  ```

- **Run migrations**
  ```bash
  npm run migrate
  ```

- **Rollback last migration**
  ```bash
  npm run migrate:rollback
  ```

### Seeds

- **Run seeders**
  ```bash
  npm run seed
  ```

- **Create a new seeder**
  ```bash
  npm run seed:create -- --name your_seeder_name
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

Once the server is running, you can access the API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Routes**: `http://localhost:3000/api/v1`

## 🔍 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed the database with sample data |

## 🐳 Docker Commands

### Useful Docker Compose Commands

```bash
# View running containers
docker-compose ps

# Access the application container
docker-compose exec app bash

# Access the database container
docker-compose exec postgres psql -U postgres -d rocketstarter

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Rebuild a specific service
docker-compose build app

# Remove all containers and volumes
docker-compose down -v
```

### Database Backup and Restore

```bash
# Create a backup
docker-compose exec postgres pg_dump -U postgres rocketstarter > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres rocketstarter < backup.sql
```

## 🌐 Environment Configuration

### Development
- Database: PostgreSQL container
- Hot reload enabled
- Debug mode active
- Detailed error messages

### Production
- Optimized Docker images
- Environment variables from secrets
- Error handling for production
- Performance monitoring enabled

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
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── migrations/          # Database migrations
├── seeders/            # Database seeders
├── tests/              # Test files
├── docker-compose.yml  # Docker services configuration
├── Dockerfile          # Docker image configuration
├── package.json        # NPM dependencies and scripts
└── README.md          # This file
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
# Reset database containers
docker-compose down -v
docker-compose up postgres -d
```

**Permission issues with Docker**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Health Checks

- **Application**: `http://localhost:3000/health`
- **Database**: Check with `docker-compose logs postgres`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/Kudora-Labs/rocketstarter-back/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the development team

---
