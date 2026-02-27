# Code Reusability Guide - Akariza Backend

## 📦 Reusable Components

### 1. Base Service Class
**Location**: `src/common/base.service.ts`

**Purpose**: Provides common CRUD operations for all services

**Usage**:
```typescript
import { BaseService } from '../common/base.service';

export class ProductsService extends BaseService<Product> {
  constructor(prisma: PrismaService) {
    super(prisma, 'product');
  }

  // Add custom methods here
  async findByCategory(category: string, organizationId: string) {
    return this.findAll(organizationId, { where: { category } });
  }
}
```

**Benefits**:
- ✅ Reduces code duplication
- ✅ Consistent API across services
- ✅ Easy to maintain and update

---

### 2. Validation Utilities
**Location**: `src/common/validation.util.ts`

**Available Methods**:
- `isEmail(email)` - Validate email format
- `isPhone(phone)` - Validate phone number
- `isStrongPassword(password)` - Validate password strength
- `sanitizeString(str)` - Clean and trim strings
- `isPositiveNumber(num)` - Check positive numbers
- `isValidDate(date)` - Validate dates

**Usage**:
```typescript
import { ValidationUtil } from '../common';

// Validate email
if (!ValidationUtil.isEmail(email)) {
  throw new Error('Invalid email format');
}

// Validate password
const validation = ValidationUtil.isStrongPassword(password);
if (!validation.valid) {
  throw new Error(validation.message);
}
```

---

### 3. Date Utilities
**Location**: `src/common/date.util.ts`

**Available Methods**:
- `addMinutes(date, minutes)` - Add minutes to date
- `addDays(date, days)` - Add days to date
- `startOfDay(date)` - Get start of day
- `endOfDay(date)` - Get end of day
- `formatDate(date, format)` - Format date string
- `isExpired(date)` - Check if date is past
- `minutesUntil(date)` - Calculate minutes until date

**Usage**:
```typescript
import { DateUtil } from '../common';

// Set OTP expiry
const otpExpiry = DateUtil.addMinutes(new Date(), 5);

// Check if expired
if (DateUtil.isExpired(otpExpiry)) {
  throw new Error('OTP expired');
}

// Format date
const formatted = DateUtil.formatDate(new Date(), 'DD/MM/YYYY');
```

---

### 4. Number Utilities
**Location**: `src/common/number.util.ts`

**Available Methods**:
- `formatCurrency(amount, currency)` - Format currency
- `calculatePercentage(value, total)` - Calculate percentage
- `calculateDiscount(price, percent)` - Calculate discount
- `calculateTax(amount, percent)` - Calculate tax
- `roundToTwo(num)` - Round to 2 decimals
- `generateCode(prefix, number, length)` - Generate codes
- `generateOTP(length)` - Generate OTP

**Usage**:
```typescript
import { NumberUtil } from '../common';

// Format currency
const formatted = NumberUtil.formatCurrency(50000); // "50,000 RWF"

// Calculate discount
const discount = NumberUtil.calculateDiscount(100000, 10); // 10000

// Generate OTP
const otp = NumberUtil.generateOTP(6); // "123456"
```

---

### 5. Query Utilities
**Location**: `src/common/query.util.ts`

**Available Methods**:
- `buildPagination(page, limit)` - Build pagination
- `buildDateRange(startDate, endDate)` - Build date filters
- `buildSearch(fields, searchTerm)` - Build search query
- `buildSort(sortBy, sortOrder)` - Build sort query

**Usage**:
```typescript
import { QueryUtil } from '../common';

// Pagination
const pagination = QueryUtil.buildPagination(1, 10);
// { skip: 0, take: 10 }

// Date range
const dateRange = QueryUtil.buildDateRange(startDate, endDate);
// { gte: startDate, lte: endDate }

// Search
const search = QueryUtil.buildSearch(['name', 'email'], 'john');
// { OR: [{ name: { contains: 'john', mode: 'insensitive' } }, ...] }
```

---

### 6. Response Utilities
**Location**: `src/common/response.util.ts`

**Available Methods**:
- `success(data, message)` - Success response
- `error(message, errors)` - Error response
- `paginated(data, total, page, limit)` - Paginated response

**Usage**:
```typescript
import { ResponseUtil } from '../common';

// Success response
return ResponseUtil.success(user, 'User created successfully');

// Error response
return ResponseUtil.error('Invalid input', validationErrors);

// Paginated response
return ResponseUtil.paginated(users, 100, 1, 10);
```

---

### 7. Constants
**Location**: `src/common/constants.ts`

**Available Constants**:
- `ROLES` - User roles
- `PAYMENT_METHODS` - Payment methods
- `PAYMENT_STATUS` - Payment statuses
- `EXPENSE_CATEGORIES` - Expense categories
- `STOCK_TRANSACTION_TYPES` - Stock transaction types
- `SECURITY` - Security settings
- `PAGINATION` - Pagination defaults
- `MESSAGES` - Standard messages

**Usage**:
```typescript
import { ROLES, SECURITY, MESSAGES } from '../common';

// Use constants
if (user.role === ROLES.SYSTEM_ADMIN) {
  // Admin logic
}

// Security settings
const otpExpiry = DateUtil.addMinutes(new Date(), SECURITY.OTP_EXPIRY_MINUTES);

// Standard messages
return ResponseUtil.success(data, MESSAGES.SUCCESS.CREATED);
```

---

## 🎯 Best Practices

### 1. DRY (Don't Repeat Yourself)
```typescript
// ❌ Bad - Repeated code
async findProduct(id: string) {
  return this.prisma.product.findFirst({ where: { id } });
}

async findSupplier(id: string) {
  return this.prisma.supplier.findFirst({ where: { id } });
}

// ✅ Good - Use base service
class ProductsService extends BaseService<Product> {
  // findOne() already available from base
}
```

### 2. Use Utilities
```typescript
// ❌ Bad - Manual validation
if (password.length < 8 || !/[A-Z]/.test(password)) {
  throw new Error('Weak password');
}

// ✅ Good - Use utility
const validation = ValidationUtil.isStrongPassword(password);
if (!validation.valid) {
  throw new Error(validation.message);
}
```

### 3. Use Constants
```typescript
// ❌ Bad - Magic strings
if (user.role === 'SYSTEM_ADMIN') { }

// ✅ Good - Use constants
if (user.role === ROLES.SYSTEM_ADMIN) { }
```

### 4. Consistent Responses
```typescript
// ❌ Bad - Inconsistent
return { data: user, status: 'ok' };

// ✅ Good - Use ResponseUtil
return ResponseUtil.success(user, 'User created');
```

---

## 📊 Benefits of Reusability

1. **Reduced Code Duplication** - Write once, use everywhere
2. **Easier Maintenance** - Update in one place
3. **Consistency** - Same behavior across the app
4. **Faster Development** - Reuse existing code
5. **Better Testing** - Test utilities once
6. **Cleaner Code** - More readable and organized

---

## 🔄 Migration Guide

To migrate existing code to use utilities:

1. **Identify repeated code** in your services
2. **Replace with utility functions** from common folder
3. **Update imports** to use common utilities
4. **Test thoroughly** to ensure same behavior
5. **Remove old code** once verified

---

**Last Updated**: February 27, 2026  
**Version**: 1.0
