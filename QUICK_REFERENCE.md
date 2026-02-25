# Akariza Backend - Quick Reference

## 🚀 Start Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🔑 Default Credentials

### BOSS User (Organization Manager)
- **Email:** boss@store.com
- **Password:** boss123
- **Organization:** Demo Retail Store (org-1)
- **Can:** Create users, manage all modules

### System Admin
- **Email:** jeromeboitenge@gmail.com
- **Password:** admin123
- **Can:** Create organizations, view all data

## 📡 API Endpoints

**Base URL:** http://localhost:5000/api/v1  
**Docs:** http://localhost:5000/api/v1/docs

### Authentication
```bash
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Organizations (SYSTEM_ADMIN only)
```bash
GET    /organizations
POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id
DELETE /organizations/:id
```

### Users (BOSS only)
```bash
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

### Products (BOSS, MANAGER)
```bash
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
GET    /products/low-stock
```

### Sales (All roles)
```bash
GET    /sales
POST   /sales
GET    /sales/:id
GET    /sales/my-sales
```

### Purchases (BOSS, MANAGER)
```bash
GET    /purchases
POST   /purchases
GET    /purchases/:id
```

### Stock (BOSS, MANAGER)
```bash
GET    /stock/transactions
POST   /stock/adjust
GET    /stock/valuation
```

### Reports (BOSS, MANAGER)
```bash
GET    /reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET    /reports/purchases?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET    /reports/stock
```

### Analytics (BOSS, MANAGER)
```bash
GET    /analytics/dashboard
GET    /analytics/sales-trends
GET    /analytics/top-products
```

## 🗄️ Database Commands

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npm run seed

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

## 🧪 Testing

```bash
# Run endpoint tests
./test-endpoints.sh

# Check TypeScript errors
npx tsc --noEmit

# Test specific endpoint
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}'
```

## 📊 Common Operations

### 1. Create a New Organization (as SYSTEM_ADMIN)

```bash
curl -X POST http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Store",
    "businessType": "Retail",
    "address": "123 Main St, Kigali",
    "phone": "+250788123456",
    "email": "store@example.com",
    "bossData": {
      "email": "boss@newstore.com",
      "password": "boss123",
      "fullName": "Store Owner"
    }
  }'
```

### 2. Create a User (as BOSS)

```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer <boss-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier@store.com",
    "password": "cashier123",
    "fullName": "Jane Doe",
    "role": "CASHIER"
  }'
```

### 3. Create a Product (as BOSS/MANAGER)

```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rice 25kg",
    "sku": "RICE-25",
    "category": "Grains",
    "unit": "bag",
    "costPrice": 18000,
    "sellingPrice": 22000,
    "currentStock": 100,
    "minStockLevel": 10
  }'
```

### 4. Record a Sale (any role)

```bash
curl -X POST http://localhost:5000/api/v1/sales \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "<product-id>",
        "quantity": 2,
        "sellingPrice": 22000
      }
    ],
    "paymentMethod": "CASH",
    "customerName": "John Doe"
  }'
```

### 5. Record a Purchase (BOSS/MANAGER)

```bash
curl -X POST http://localhost:5000/api/v1/purchases \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "<supplier-id>",
    "items": [
      {
        "productId": "<product-id>",
        "quantity": 50,
        "costPrice": 18000
      }
    ],
    "paymentStatus": "PAID",
    "amountPaid": 900000
  }'
```

## 🔧 Troubleshooting

### App won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Check database connection
PGPASSWORD=akariza_password_2026 psql -h localhost -U akariza_user -d akariza -c "SELECT 1"

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Reset and reseed
npx prisma migrate reset --force
npm run seed
```

### TypeScript errors
```bash
# Regenerate Prisma client
npx prisma generate

# Check for errors
npx tsc --noEmit
```

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://akariza_user:akariza_password_2026@localhost:5432/akariza?schema=public"
JWT_SECRET="akariza-jwt-secret-key-change-in-production-2026"
JWT_REFRESH_SECRET="akariza-refresh-secret-key-change-in-production-2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

## 🎯 Role Permissions Summary

| Feature | SYSTEM_ADMIN | BOSS | MANAGER | CASHIER |
|---------|--------------|------|---------|---------|
| Create Organizations | ✅ | ❌ | ❌ | ❌ |
| Create Users | ❌ | ✅ | ❌ | ❌ |
| Create Products | ❌ | ✅ | ✅ | ❌ |
| Record Sales | ❌ | ✅ | ✅ | ✅ |
| Record Purchases | ❌ | ✅ | ✅ | ❌ |
| View Reports | ❌ | ✅ | ✅ | ❌ |
| Manage Stock | ❌ | ✅ | ✅ | ❌ |
| View Analytics | ❌ | ✅ | ✅ | ❌ |

## 📞 Support

For issues or questions, check:
1. Swagger documentation: http://localhost:5000/api/v1/docs
2. System review: `SYSTEM_REVIEW_COMPLETE.md`
3. Error logs in console output
