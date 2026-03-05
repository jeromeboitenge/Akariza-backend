# OTP Authentication Changes

## Summary
Modified the authentication system so that OTP is only required for password changes, not for login.

## Changes Made

### 1. Login Flow (No OTP Required)
**File: `src/auth/auth.service.ts`**
- Modified `login()` method to directly return JWT tokens after successful email/password validation
- Removed OTP generation and email sending from login flow
- Users can now login immediately with just email and password

### 2. Password Change Flow (OTP Required)
**File: `src/users/users.service.ts`**
- Added `requestPasswordChangeOtp()` method to generate and send OTP when user wants to change password
- Modified `changePassword()` method to require OTP verification along with current and new password
- OTP expires in 5 minutes

**File: `src/users/users.controller.ts`**
- Added `POST /users/request-password-change-otp` endpoint to request OTP
- Updated `PATCH /users/change-password` endpoint to require `otpCode` parameter

### 3. Email Templates
**File: `src/email/email.service.ts`**
- Added `sendPasswordChangeOtpEmail()` method with dedicated email template for password change verification

### 4. Auth Controller Cleanup
**File: `src/auth/auth.controller.ts`**
- Removed `POST /auth/verify-otp` endpoint (no longer needed for login)
- Updated `POST /auth/login` documentation to reflect direct token return

## API Endpoints

### Login (No OTP)
```
POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }
```

### Password Change (Requires OTP)
```
1. Request OTP:
POST /users/request-password-change-otp
Headers: Authorization: Bearer <token>
Response: { message: "OTP sent to your email" }

2. Change Password:
PATCH /users/change-password
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword, otpCode }
Response: { message: "Password changed successfully" }
```

### Password Reset (Still Uses OTP)
```
1. Request Reset:
POST /auth/forgot-password
Body: { email }
Response: { message: "If email exists, OTP has been sent" }

2. Verify OTP:
POST /auth/verify-reset-otp
Body: { email, otpCode }
Response: { message: "OTP verified", verified: true }

3. Reset Password:
POST /auth/reset-password
Body: { email, otpCode, newPassword }
Response: { message: "Password reset successfully" }
```

## Security Features Maintained
- Account lockout after 5 failed login attempts (30 minutes)
- Password strength validation
- Password history check (prevents reuse of last 3 passwords)
- OTP expiration (5 minutes)
- Failed login attempt tracking
