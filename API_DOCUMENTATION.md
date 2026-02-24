# 📚 Akariza API Documentation

## Swagger UI Access

**URL:** http://localhost:5000/api/docs

The Swagger documentation provides:
- ✅ Interactive API testing
- ✅ All 110+ endpoints documented
- ✅ Request/Response schemas
- ✅ Authentication support
- ✅ Try it out functionality

## Quick Start

### 1. Access Swagger UI
Open your browser and navigate to:
```
http://localhost:5000/api/docs
```

### 2. Authenticate
1. Click on any endpoint that requires authentication
2. Click the **"Authorize"** button (lock icon) at the top right
3. Login first using `/api/auth/login` endpoint:
   ```json
   {
     "email": "boss@store.com",
     "password": "boss123"
   }
   ```
4. Copy the `accessToken` from the response
5. Click **"Authorize"** button and paste the token
6. Click **"Authorize"** then **"Close"**

### 3. Test Endpoints
Now you can test any endpoint by:
1. Click on the endpoint
2. Click **"Try it out"**
3. Fill in the parameters
4. Click **"Execute"**

## Available Tags

- **Auth** - Login, logout, refresh token
- **Organizations** - Organization CRUD
- **Users** - User management
- **Products** - Product catalog
- **Suppliers** - Supplier management
- **Purchases** - Purchase transactions
- **Sales** - Sales transactions
- **Stock** - Stock tracking & adjustments
- **Reports** - Business reports
- **Sync** - Mobile app sync
- **Branches** - Multi-branch operations
- **Customers** - Customer management
- **Employees** - Employee records
- **Promotions** - Discount campaigns
- **Purchase Orders** - PO workflow
- **Expenses** - Expense tracking
- **Notifications** - Notification system
- **Tasks** - Task management
- **Messages** - Internal messaging
- **Analytics** - Advanced analytics

## Test Credentials

### System Admin
- Email: `admin@akariza.com`
- Password: `admin123`

### Boss (Full Access)
- Email: `boss@store.com`
- Password: `boss123`

### Manager
- Email: `manager@store.com`
- Password: `manager123`

### Cashier
- Email: `cashier@store.com`
- Password: `cashier123`

## Common Workflows

### Create a Sale
1. Login as Cashier
2. GET `/api/products` - Get available products
3. POST `/api/sales` - Create sale with items

### Create a Purchase
1. Login as Manager
2. GET `/api/suppliers` - Get suppliers
3. GET `/api/products` - Get products
4. POST `/api/purchases` - Create purchase

### View Reports
1. Login as Boss/Manager
2. GET `/api/reports/daily-sales?date=2026-02-24`
3. GET `/api/reports/monthly-sales?month=2026-02`
4. GET `/api/reports/profit-report?startDate=2026-02-01&endDate=2026-02-28`

### Check Stock
1. GET `/api/products` - View all products with stock levels
2. GET `/api/products/low-stock` - Products below minimum
3. GET `/api/stock/transactions` - Stock movement history
4. POST `/api/stock/adjust` - Adjust stock levels

## API Base URL
```
http://localhost:5000/api
```

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "data": {},
  "message": "Success"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Notes

- All authenticated endpoints require Bearer token
- Dates should be in ISO 8601 format: `2026-02-24`
- All amounts are in RWF (Rwandan Francs)
- Organization context is automatically applied based on logged-in user

## Support

For issues or questions:
- Check the Swagger UI for detailed endpoint documentation
- Review the response schemas
- Test with the provided seed data
