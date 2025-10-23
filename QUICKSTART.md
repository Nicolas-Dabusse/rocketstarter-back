# 🚀 Quick Start Guide

## Development Mode

```bash
# Start all services (PostgreSQL + API + Adminer)
docker compose --profile dev up -d

# Seed database
npm run seed:docker

# Access services
# - API: http://localhost:3000
# - Adminer: http://localhost:8080 (Server: postgres, User: rocket, Password: secret_change_in_production)
```

## Production Mode

```bash
# Start without Adminer (secure)
docker compose up -d

# Seed database
npm run seed:docker
```

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Stop services
docker compose down

# Reset database
docker compose down -v && docker compose --profile dev up -d
npm run seed:docker
```

## Troubleshooting

```bash
# Port already in use
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# Database connection error
docker compose restart postgres
docker compose logs postgres

# Reset everything
docker compose down -v
docker compose --profile dev up -d
npm run seed:docker
```

---

See [README.md](./README.md) for full documentation.
