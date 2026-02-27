export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  BOSS: 'BOSS',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  MOBILE: 'MOBILE',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
} as const;

export const EXPENSE_CATEGORIES = {
  RENT: 'RENT',
  UTILITIES: 'UTILITIES',
  SALARIES: 'SALARIES',
  TRANSPORT: 'TRANSPORT',
  SUPPLIES: 'SUPPLIES',
  MAINTENANCE: 'MAINTENANCE',
  MARKETING: 'MARKETING',
  INSURANCE: 'INSURANCE',
  TAXES: 'TAXES',
  OTHER: 'OTHER',
} as const;

export const STOCK_TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
  DAMAGE: 'DAMAGE',
  RETURN: 'RETURN',
} as const;

export const SECURITY = {
  OTP_EXPIRY_MINUTES: 5,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    OPERATION_SUCCESS: 'Operation completed successfully',
  },
  ERROR: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    INVALID_INPUT: 'Invalid input data',
    INTERNAL_ERROR: 'Internal server error',
  },
} as const;
