# 🐳 Docker Setup for Akariza Backend

## Quick Start

### 1. Start Everything with Docker Compose
```bash
cd backend
docker-compose up -d
```

This will:
- ✅ Start PostgreSQL database
- ✅ Build and start the backend
- ✅ Run migrations automatically
- ✅ Seed the database with test data
- ✅ Expose API on http://localhost:5000

### 2. Check Status
```bash
docker-compose ps
```

### 3. View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

### 4. Stop Services
```bash
docker-compose down
```

### 5. Stop and Remove Data
```bash
docker-compose down -v
```

---

## Manual Docker Commands

### Build Image
```bash
docker build -t akariza-backend .
```

### Run Container
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  akariza-backend
```

---

## Development with Docker

### Start in Development Mode
```bash
docker-compose -f docker-compose.dev.yml up
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Seed Database
```bash
docker-compose exec backend npx prisma db seed
```

### Access Database
```bash
docker-compose exec postgres psql -U akariza_user -d akariza
```

---

## Environment Variables

Create `.env` file (already configured in docker-compose.yml):
```env
DATABASE_URL="postgresql://akariza_user:akariza_password_2026@postgres:5432/akariza?schema=public"
JWT_SECRET="akariza-jwt-secret-key-change-in-production-2026"
JWT_REFRESH_SECRET="akariza-refresh-secret-key-change-in-production-2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
```

---

## Production Deployment

### 1. Build for Production
```bash
docker build -t akariza-backend:latest .
```

### 2. Tag for Registry
```bash
docker tag akariza-backend:latest your-registry/akariza-backend:latest
```

### 3. Push to Registry
```bash
docker push your-registry/akariza-backend:latest
```

### 4. Deploy
```bash
docker pull your-registry/akariza-backend:latest
docker run -d -p 5000:5000 \
  --name akariza-backend \
  -e DATABASE_URL="your-production-db-url" \
  your-registry/akariza-backend:latest
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
```

### Database connection issues
```bash
docker-compose exec backend npx prisma db push
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d --build
```

### Access container shell
```bash
docker-compose exec backend sh
```

---

## Health Checks

### Check API
```bash
curl http://localhost:5000/api/auth/login
```

### Check Database
```bash
docker-compose exec postgres pg_isready -U akariza_user
```

---

## Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| backend | 5000 | NestJS API server |

---

## Volumes

- `postgres_data` - Persistent database storage

---

## Next Steps

1. Start services: `docker-compose up -d`
2. Wait 30 seconds for initialization
3. Access API: http://localhost:5000/api/docs
4. Login with test credentials:
   - Boss: boss@store.com / boss123
   - Manager: manager@store.com / manager123
   - Cashier: cashier@store.com / cashier123

🚀 Your Akariza backend is now running in Docker!
