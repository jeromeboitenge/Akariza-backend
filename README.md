# Akariza Backend - NestJS + Prisma

Production-ready backend API for Akariza Stock Management System.

## 🏗️ Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + Passport
- **Language**: TypeScript

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL URL

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

Server runs on: `http://localhost:5000`

## 📡 API Endpoints

All endpoints prefixed with `/api`

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Organizations (System Admin)
- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations` - List all
- `GET /api/admin/organizations/:id` - Get one
- `PATCH /api/admin/organizations/:id` - Update
- `DELETE /api/admin/organizations/:id` - Deactivate

### Branches (System Admin)
- `POST /api/admin/branches` - Create branch for any organization
- `GET /api/admin/branches` - List all branches across all organizations
- `GET /api/admin/branches/organization/:orgId` - Get branches for specific organization
- `GET /api/admin/branches/:id` - Get branch details
- `PATCH /api/admin/branches/:id` - Update branch
- `DELETE /api/admin/branches/:id` - Deactivate branch
- `PATCH /api/admin/branches/:id/activate` - Activate branch

### Dashboard (System Admin - Read Only)
- `GET /api/admin/dashboard/overview` - System-wide overview
- `GET /api/admin/dashboard/organizations/stats` - All organizations statistics
- `GET /api/admin/dashboard/organizations/:id/stats` - Specific organization details
- `GET /api/admin/dashboard/sales?startDate&endDate` - System-wide sales stats
- `GET /api/admin/dashboard/products/top-selling?limit=20` - Top products
- `GET /api/admin/dashboard/users/activity` - User activity
- `GET /api/admin/dashboard/branches/stats` - All branches statistics

### Users (Boss)
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PATCH /api/users/:id` - Update
- `DELETE /api/users/:id` - Deactivate

### Products
- `POST /api/products` - Create
- `GET /api/products` - List all
- `GET /api/products/low-stock` - Low stock alert
- `GET /api/products/:id` - Get one
- `PATCH /api/products/:id` - Update
- `DELETE /api/products/:id` - Deactivate

### Suppliers
- `POST /api/suppliers` - Create
- `GET /api/suppliers` - List all
- `GET /api/suppliers/:id` - Get one
- `PATCH /api/suppliers/:id` - Update
- `DELETE /api/suppliers/:id` - Deactivate

### Purchases
- `POST /api/purchases` - Create
- `GET /api/purchases` - List all
- `GET /api/purchases/:id` - Get one

### Sales
- `POST /api/sales` - Create
- `GET /api/sales` - List all
- `GET /api/sales/my-sales` - Cashier's sales
- `GET /api/sales/:id` - Get one

### Stock
- `GET /api/stock/transactions` - List transactions
- `POST /api/stock/adjust` - Adjust stock
- `GET /api/stock/valuation` - Stock valuation

### Reports
- `GET /api/reports/sales/daily?date=YYYY-MM-DD`
- `GET /api/reports/sales/monthly?month=YYYY-MM`
- `GET /api/reports/profit?startDate&endDate`
- `GET /api/reports/best-selling?limit=10`
- `GET /api/reports/low-stock`

### Sync (Mobile)
- `POST /api/sync/sales` - Sync sales from mobile
- `POST /api/sync/purchases` - Sync purchases
- `GET /api/sync/products?lastSyncedAt=timestamp`
- `GET /api/sync/suppliers?lastSyncedAt=timestamp`

## 🗄️ Database Schema

See `prisma/schema.prisma` for complete schema.

**Models:**
- Admin
- Organization
- User
- Product
- Supplier
- Purchase / PurchaseItem
- Sale / SaleItem
- StockTransaction
- AuditLog

## 🔐 Security

- JWT access tokens (15 min)
- Refresh tokens (7 days)
- bcrypt password hashing
- Role-based access control
- Organization-level isolation

## 🛠️ Development

```bash
# Watch mode
npm run start:dev

# View database
npm run prisma:studio

# Create migration
npx prisma migrate dev --name migration_name

# Build for production
npm run build

# Start production
npm run start:prod
```

## 📦 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/akariza"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
```

## 🎯 Role Permissions

| Role | Permissions |
|------|-------------|
| SYSTEM_ADMIN | Manage organizations |
| BOSS | Full organization access |
| MANAGER | Products, suppliers, purchases, stock |
| CASHIER | Sales only |

## 📚 Related Repositories

- **Mobile App**: [akariza-mobile](https://github.com/YOUR_USERNAME/akariza-mobile)
- **Web App**: [akariza-web](https://github.com/YOUR_USERNAME/akariza-web)

## 📄 License

Proprietary - All rights reserved
