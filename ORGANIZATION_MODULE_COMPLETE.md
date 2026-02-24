# 🏢 Organization Management Module - Complete

## Admin Operations for Organizations

### Base URL
```
http://localhost:5000/api/v1/organizations
```

---

## 📋 Available Operations

### 1. **Create Organization**
```http
POST /api/v1/organizations
```

**Request Body (Simple):**
```json
{
  "name": "SuperMart Retail",
  "businessType": "Retail",
  "address": "123 Main Street, Kigali",
  "phone": "+250788123456",
  "email": "info@supermart.rw"
}
```

**Request Body (With Boss):**
```json
{
  "name": "SuperMart Retail",
  "businessType": "Retail",
  "address": "123 Main Street, Kigali",
  "phone": "+250788123456",
  "email": "info@supermart.rw",
  "bossData": {
    "email": "boss@supermart.rw",
    "password": "boss123",
    "fullName": "John Mugisha"
  }
}
```

**Response:**
```json
{
  "organization": {
    "id": "org-xxx",
    "name": "SuperMart Retail",
    "businessType": "Retail",
    "address": "123 Main Street, Kigali",
    "phone": "+250788123456",
    "email": "info@supermart.rw",
    "isActive": true,
    "createdAt": "2026-02-24T14:00:00.000Z"
  },
  "boss": {
    "id": "user-xxx",
    "email": "boss@supermart.rw",
    "fullName": "John Mugisha",
    "role": "BOSS"
  }
}
```

---

### 2. **Get All Organizations**
```http
GET /api/v1/organizations
```

**Response:**
```json
[
  {
    "id": "org-1",
    "name": "Demo Retail Store",
    "businessType": "Retail",
    "address": "123 Main Street, Kigali",
    "phone": "+250788123456",
    "email": "demo@store.com",
    "isActive": true,
    "createdAt": "2026-02-24T12:47:38.508Z",
    "_count": {
      "users": 4,
      "products": 5,
      "sales": 2,
      "purchases": 1,
      "branches": 2
    }
  }
]
```

---

### 3. **Get Organization by ID**
```http
GET /api/v1/organizations/:id
```

**Example:**
```bash
GET /api/v1/organizations/org-1
```

**Response:**
```json
{
  "id": "org-1",
  "name": "Demo Retail Store",
  "businessType": "Retail",
  "address": "123 Main Street, Kigali",
  "phone": "+250788123456",
  "email": "demo@store.com",
  "isActive": true,
  "users": [
    {
      "id": "user-boss",
      "email": "boss@store.com",
      "fullName": "John Boss",
      "role": "BOSS",
      "isActive": true
    },
    {
      "id": "user-manager",
      "email": "manager@store.com",
      "fullName": "Jane Manager",
      "role": "MANAGER",
      "isActive": true
    }
  ],
  "branches": [
    {
      "id": "branch-main",
      "name": "Main Branch",
      "code": "MAIN",
      "isActive": true
    }
  ],
  "_count": {
    "products": 5,
    "sales": 2,
    "purchases": 1
  }
}
```

---

### 4. **Update Organization**
```http
PATCH /api/v1/organizations/:id
```

**Request Body:**
```json
{
  "name": "Updated Store Name",
  "businessType": "Retail & Wholesale",
  "address": "456 New Street, Kigali",
  "phone": "+250788999999",
  "email": "updated@store.com"
}
```

**Response:**
```json
{
  "id": "org-1",
  "name": "Updated Store Name",
  "businessType": "Retail & Wholesale",
  "address": "456 New Street, Kigali",
  "phone": "+250788999999",
  "email": "updated@store.com",
  "isActive": true,
  "updatedAt": "2026-02-24T14:30:00.000Z"
}
```

---

### 5. **Deactivate Organization**
```http
DELETE /api/v1/organizations/:id
```

**Example:**
```bash
DELETE /api/v1/organizations/org-1
```

**Response:**
```json
{
  "id": "org-1",
  "name": "Demo Retail Store",
  "isActive": false,
  "updatedAt": "2026-02-24T14:35:00.000Z"
}
```

---

### 6. **Activate Organization**
```http
PATCH /api/v1/organizations/:id/activate
```

**Example:**
```bash
PATCH /api/v1/organizations/org-1/activate
```

**Response:**
```json
{
  "id": "org-1",
  "name": "Demo Retail Store",
  "isActive": true,
  "updatedAt": "2026-02-24T14:40:00.000Z"
}
```

---

### 7. **Get Organization Statistics**
```http
GET /api/v1/organizations/:id/stats
```

**Example:**
```bash
GET /api/v1/organizations/org-1/stats
```

**Response:**
```json
{
  "organization": {
    "id": "org-1",
    "name": "Demo Retail Store",
    "businessType": "Retail",
    "isActive": true
  },
  "stats": {
    "users": 4,
    "products": 5,
    "sales": 2,
    "purchases": 1,
    "branches": 2,
    "totalRevenue": 48500
  }
}
```

---

## 🔐 Authentication

All endpoints require **SYSTEM_ADMIN** role.

### Get Admin Token:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@akariza.com","password":"admin123"}'
```

### Use Token:
```bash
curl -X GET http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📝 Complete Examples

### Example 1: Create Organization with Boss
```bash
# 1. Login as Admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@akariza.com","password":"admin123"}' | jq -r '.accessToken')

# 2. Create Organization
curl -X POST http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Foods Ltd",
    "businessType": "Wholesale",
    "address": "Industrial Area, Kigali",
    "phone": "+250788654321",
    "email": "info@freshfoods.rw",
    "bossData": {
      "email": "boss@freshfoods.rw",
      "password": "boss123",
      "fullName": "Sarah Uwase"
    }
  }'
```

### Example 2: View All Organizations
```bash
curl -X GET http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

### Example 3: Get Organization Details
```bash
curl -X GET http://localhost:5000/api/v1/organizations/org-1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

### Example 4: Update Organization
```bash
curl -X PATCH http://localhost:5000/api/v1/organizations/org-1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Store Name",
    "phone": "+250788999999"
  }'
```

### Example 5: Get Statistics
```bash
curl -X GET http://localhost:5000/api/v1/organizations/org-1/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

### Example 6: Deactivate Organization
```bash
curl -X DELETE http://localhost:5000/api/v1/organizations/org-1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Example 7: Activate Organization
```bash
curl -X PATCH http://localhost:5000/api/v1/organizations/org-1/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## ✅ Features

- ✅ Create organization (with or without boss)
- ✅ List all organizations with counts
- ✅ Get organization details with users and branches
- ✅ Update organization information
- ✅ Deactivate organization
- ✅ Activate organization
- ✅ Get organization statistics
- ✅ Full Swagger documentation
- ✅ Example data in Swagger UI
- ✅ Error handling (404, 400, 403)
- ✅ Admin-only access control

---

## 🚀 Test in Swagger

1. Open: http://localhost:5000/api/v1/docs
2. Login as admin: `admin@akariza.com` / `admin123`
3. Click "Authorize" and paste token
4. Navigate to "Organizations" section
5. Try all endpoints with pre-filled examples!

---

## 📊 Organization Lifecycle

```
Create → Active → [Update as needed] → Deactivate → Activate
```

**Note:** Deactivating an organization doesn't delete it, just sets `isActive: false`. You can reactivate it anytime.

---

## 🎯 Admin Can Now:

✅ Create new organizations  
✅ View all organizations  
✅ View organization details  
✅ Update organization info  
✅ Deactivate organizations  
✅ Reactivate organizations  
✅ View organization statistics  
✅ See user counts, sales, products, etc.  

**Organization module is complete!** 🎉
