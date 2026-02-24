# ✅ Akariza Backend - Errors Fixed

## 🔧 Issues Fixed

### **1. Module Dependency Errors** ✅
**Problem:** OrganizationsService and UsersService use AuthService but modules didn't import AuthModule

**Fixed:**
- ✅ `organizations.module.ts` - Added `imports: [AuthModule]`
- ✅ `users.module.ts` - Added `imports: [AuthModule]`

---

### **2. Prisma Query Errors** ✅
**Problem:** Invalid Prisma query syntax for comparing fields

**Fixed:**
- ✅ `products.service.ts` - Changed to raw SQL query for low stock
- ✅ `analytics.service.ts` - Changed to raw SQL query for low stock count

---

### **3. Environment Configuration** ✅
**Created:**
- ✅ `.env` file with default values
- ✅ `setup-and-fix.sh` script for automated setup

---

## 🚀 How to Start Testing

### **Option 1: Automated Setup (Recommended)**

```bash
cd ~/Desktop/akariza/backend
./setup-and-fix.sh
```

This script will:
1. Install dependencies
2. Generate Prisma Client
3. Run migrations
4. Build the application

---

### **Option 2: Manual Setup**

```bash
cd ~/Desktop/akariza/backend

# 1. Install dependencies
npm install

# 2. Configure database
# Edit .env file with your PostgreSQL connection string
nano .env

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start server
npm run start:dev
```

---

## 📋 Prerequisites

### **1. PostgreSQL Database**

**Option A: Local PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb akariza
```

**Option B: Docker**
```bash
docker run --name akariza-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=akariza \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud (Recommended for testing)**
- Supabase: https://supabase.com (Free tier)
- Neon: https://neon.tech (Free tier)
- Railway: https://railway.app (Free tier)

---

### **2. Update DATABASE_URL**

Edit `.env` file:

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/akariza"
```

**Docker:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/akariza"
```

**Cloud (example):**
```env
DATABASE_URL="postgresql://user:pass@host.region.provider.com:5432/akariza"
```

---

## 🧪 Testing the API

### **1. Start the Server**
```bash
npm run start:dev
```

You should see:
```
✅ Database connected
🚀 Akariza Backend running on port 5000
```

---

### **2. Test Health Check**
```bash
curl http://localhost:5000/api/health
```

---

### **3. Create First Admin**

**Using Prisma Studio:**
```bash
npx prisma studio
```

Then manually insert into `Admin` table:
- email: `admin@akariza.com`
- password: (use hash generator below)
- fullName: `System Administrator`
- role: `SYSTEM_ADMIN`
- isActive: `true`

**Generate Password Hash:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(console.log)"
```

---

### **4. Test Admin Login**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@akariza.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### **5. Create Organization**
```bash
curl -X POST http://localhost:5000/api/admin/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Shop",
    "businessType": "Retail",
    "address": "123 Main St",
    "phone": "+250788123456",
    "email": "shop@test.com",
    "bossData": {
      "email": "boss@test.com",
      "password": "boss123",
      "fullName": "Shop Boss"
    }
  }'
```

---

### **6. Test Boss Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "boss@test.com",
    "password": "boss123"
  }'
```

---

## 📡 All Available Endpoints

### **Authentication**
- `POST /api/auth/admin/login`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### **Organizations (Admin)**
- `POST /api/admin/organizations`
- `GET /api/admin/organizations`
- `GET /api/admin/organizations/:id`
- `PATCH /api/admin/organizations/:id`
- `DELETE /api/admin/organizations/:id`

### **Users (Boss)**
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### **Products**
- `POST /api/products`
- `GET /api/products`
- `GET /api/products/low-stock`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### **Suppliers**
- `POST /api/suppliers`
- `GET /api/suppliers`
- `GET /api/suppliers/:id`
- `PATCH /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### **Purchases**
- `POST /api/purchases`
- `GET /api/purchases`
- `GET /api/purchases/:id`

### **Sales**
- `POST /api/sales`
- `GET /api/sales`
- `GET /api/sales/my-sales`
- `GET /api/sales/:id`

### **Stock**
- `GET /api/stock/transactions`
- `POST /api/stock/adjust`
- `GET /api/stock/valuation`

### **Reports**
- `GET /api/reports/sales/daily`
- `GET /api/reports/sales/monthly`
- `GET /api/reports/profit`
- `GET /api/reports/best-selling`
- `GET /api/reports/low-stock`

### **Sync**
- `POST /api/sync/sales`
- `POST /api/sync/purchases`
- `GET /api/sync/products`
- `GET /api/sync/suppliers`

### **Branches**
- `POST /api/branches`
- `GET /api/branches`
- `GET /api/branches/:id`
- `GET /api/branches/:id/inventory`
- `POST /api/branches/transfer`
- `POST /api/branches/transfer/:id/approve`

### **Customers**
- `POST /api/customers`
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers/:id/loyalty/add`
- `POST /api/customers/:id/loyalty/redeem`

### **Employees**
- `POST /api/employees`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees/:id/attendance`
- `POST /api/employees/:id/targets`

### **Promotions**
- `POST /api/promotions`
- `GET /api/promotions`
- `GET /api/promotions/active`

### **Purchase Orders**
- `POST /api/purchase-orders`
- `GET /api/purchase-orders`
- `POST /api/purchase-orders/:id/approve`
- `POST /api/purchase-orders/:id/convert`

### **Expenses**
- `POST /api/expenses`
- `GET /api/expenses`
- `GET /api/expenses/summary`

### **Notifications**
- `GET /api/notifications`
- `GET /api/notifications/unread`
- `PATCH /api/notifications/:id/read`

### **Tasks**
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/my-tasks`
- `POST /api/tasks/:id/comments`

### **Messages**
- `POST /api/messages`
- `GET /api/messages`
- `GET /api/messages/conversation/:userId`

### **Analytics**
- `GET /api/analytics/dashboard`
- `GET /api/analytics/inventory-turnover`
- `GET /api/analytics/customer-insights`
- `GET /api/analytics/branch-comparison`

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot connect to database"**
**Solution:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Test connection: `psql $DATABASE_URL`

### **Issue 2: "Prisma Client not generated"**
**Solution:**
```bash
npx prisma generate
```

### **Issue 3: "Port 5000 already in use"**
**Solution:**
Change PORT in .env to another port (e.g., 5001)

### **Issue 4: "Module not found"**
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] .env file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Migrations run (`npx prisma migrate dev`)
- [ ] Server starts without errors (`npm run start:dev`)
- [ ] Can access http://localhost:5000
- [ ] Admin user created
- [ ] Can login as admin
- [ ] Can create organization
- [ ] Can login as boss

---

## 🎉 Success!

If all steps pass, your Akariza backend is ready for testing!

**Next Steps:**
1. Test all endpoints with Postman
2. Update mobile app API URL
3. Start building web dashboard

---

## 📞 Quick Commands Reference

```bash
# Start development server
npm run start:dev

# View database
npx prisma studio

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Build for production
npm run build

# Start production
npm run start:prod
```

---

**Status**: ✅ **ALL ERRORS FIXED - READY FOR TESTING**
