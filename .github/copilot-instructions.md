# RocketStarter Backend - AI Agent Instructions

## Developer Profile

You are a senior fullstack developer. You follow modern web development best practices (clean architecture, SOLID, DRY, accessibility, security, performance).

## Project Overview

RocketStarter is a Kanban-style project management backend with web3 wallet integration and a reward system. The application uses Node.js, Express, TypeScript, Sequelize ORM, and SQLite.

## Architecture & Key Components

### Data Model

- **User**: Identified by wallet address, has role (Owner/Builder)
- **Project**: Has name, description, progress percentage, and an owner
- **Task**: Belongs to Project, has status (todo→inprogress→inreview→done)
- **Step**: Contains multiple Tasks within a Project
- **Category**: Can be assigned to Tasks (many-to-many)
- **Reward**: Connected to Tasks (tokens, NFTs, crypto rewards)

### Status & Workflow Rules

Task status follows a Kanban workflow:

- 0: todo
- 1: inprogress
- 2: inreview
- 3: done

Special workflow rules:

- Builder can: Assign themselves (todo→inprogress), release task (inprogress→todo), request review (inprogress→inreview)
- Owner can: Mark task as done (inreview→done), modify any task, delete tasks

## Development Environment

### Setting Up

```bash
# Start with Docker (recommended)
docker compose up -d
npm run seed:auto  # Seeds the database with sample data

# Alternative: Local development
npm install
npm run dev
npm run seed
```

### Database

- SQLite database file auto-created at `./data/database.sqlite`
- Models defined in `src/models/` using Sequelize ORM
- All associations defined in `src/models/associations.ts` to avoid circular dependencies
- Model relationships are defined with correct foreign keys and cascade options

### Authentication

- Uses wallet address in `x-user-address` header for identification
- No JWT/session authentication implemented yet (see headers in `src/app.ts`)

## Key Development Patterns

### API Structure

- Controllers in `src/controllers/` handle route logic
- Routes defined in `src/routes/router.ts`
- TypeScript interfaces in `src/types/index.ts`
- Response format follows `ApiResponse<T>` interface with consistent structure

### Error Handling

- Global error handler in `src/middleware/errorHandler.ts`
- Controllers use try/catch and pass errors to the middleware

### Database Connections

- Created via `src/utils/database.ts` utility
- Config defined in `src/config/db.ts`
- Models initialized and synchronized in `src/models/index.ts`

### CORS

- Pre-configured for common development ports (see `src/app.ts`)
- Can add custom origins via `ALLOWED_ORIGINS` env variable

## Development Workflows

### Common Commands

```bash
npm run dev           # Start development server
npm run seed          # Seed local database
npm run seed:docker   # Seed database in Docker
npm run seed:auto     # Start container + seed
npm test              # Run tests
```

### Docker Commands

```bash
docker compose up -d          # Start containers
docker compose down           # Stop containers
docker compose logs -f app    # View application logs
```

### Debugging

- Request logging middleware enabled in development mode
- Database logging configured in `src/utils/database.ts`
- Status codes follow RESTful API conventions
- Error responses include descriptive messages

## Tips for New Features

- Add new model? Update associations in `src/models/associations.ts`
- Add new route? Follow the pattern in `src/routes/router.ts`
- Add new controller? Follow existing controller patterns with try/catch
- Add new relation? Check junction tables in `src/models/JunctionTables.ts`
