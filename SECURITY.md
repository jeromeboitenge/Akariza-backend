# Security Features - Akariza Backend

## 🔒 Implemented Security Features

### 1. Authentication & Authorization
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ OTP verification via email (2FA)
- ✅ Account lockout after 5 failed attempts (30 min)
- ✅ Strong password policy enforcement
- ✅ Password history tracking (prevent reuse)
- ✅ Role-based access control (RBAC)
- ✅ Email-based OTP (no userId exposure)

### 2. Input Security
- ✅ Input sanitization middleware (XSS prevention)
- ✅ Request validation with whitelist
- ✅ SQL injection prevention (Prisma ORM)
- ✅ NoSQL injection prevention

### 3. Output Security
- ✅ Response sanitization (removes sensitive fields)
- ✅ Auto-remove: password, otpCode, passwordHistory
- ✅ Safe error messages (no stack traces in production)
- ✅ Global exception filter

### 4. HTTP Security Headers
- ✅ X-Frame-Options: DENY (clickjacking protection)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: enabled
- ✅ Strict-Transport-Security (HTTPS only)
- ✅ Content-Security-Policy
- ✅ Referrer-Policy
- ✅ X-Powered-By removed

### 5. Rate Limiting
- ✅ Global: 100 requests/minute
- ✅ Login: 5 attempts/minute
- ✅ OTP verification: 3 attempts/minute
- ✅ Per-IP tracking

### 6. Data Isolation
- ✅ Organization-level isolation
- ✅ Branch-level isolation
- ✅ User can only access own organization data
- ✅ Cashier/Manager restricted to own branch

### 7. CORS Protection
- ✅ Configurable allowed origins
- ✅ Credentials support
- ✅ Method restrictions
- ✅ Header restrictions
- ✅ Production mode blocks all by default

### 8. Environment Security
- ✅ Environment variable validation
- ✅ Required secrets check on startup
- ✅ JWT secret strength validation
- ✅ Production-specific checks

### 9. API Security
- ✅ Swagger disabled in production
- ✅ Validation error messages hidden in production
- ✅ Bearer token authentication
- ✅ Public endpoints explicitly marked

### 10. Session Security
- ✅ Access token: 15 minutes expiry
- ✅ Refresh token: 7 days expiry
- ✅ OTP: 5 minutes expiry
- ✅ Account lock: 30 minutes

---

## 🛡️ Security Best Practices

### For Deployment

1. **Environment Variables**
   ```bash
   # Generate strong secrets (32+ characters)
   JWT_SECRET=<strong-random-string>
   JWT_REFRESH_SECRET=<different-strong-random-string>
   
   # Set frontend URL
   FRONTEND_URL=https://your-frontend.com
   
   # Production mode
   NODE_ENV=production
   ```

2. **Database**
   - Use SSL connection
   - Restrict database access by IP
   - Regular backups
   - Encrypted at rest

3. **HTTPS**
   - Always use HTTPS in production
   - Enable HSTS header
   - Valid SSL certificate

4. **Monitoring**
   - Log all authentication attempts
   - Monitor failed login patterns
   - Alert on suspicious activity
   - Track API usage

### For Development

1. **Never commit secrets**
   - Use `.env` file (gitignored)
   - Use environment-specific configs
   - Rotate keys regularly

2. **Test security features**
   - Test rate limiting
   - Test authentication flows
   - Test authorization rules
   - Test input validation

---

## 🚨 Security Checklist

### Before Production Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (32+ chars)
- [ ] Set FRONTEND_URL for CORS
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Verify SendGrid sender email
- [ ] Test rate limiting
- [ ] Test OTP flow
- [ ] Test role permissions
- [ ] Review error messages
- [ ] Disable Swagger docs
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review logs

---

## 🔐 Password Policy

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)
- Cannot reuse last 5 passwords

---

## 🚫 What's Protected

### Sensitive Data Never Exposed
- Passwords (hashed with bcrypt)
- OTP codes
- Password history
- Failed login attempts
- Account lock status
- Internal user IDs (in login flow)

### Automatic Sanitization
All API responses automatically remove:
- `password`
- `otpCode`
- `otpExpiry`
- `passwordHistory`
- `failedLoginAttempts`
- `lockedUntil`

---

## 📊 Security Monitoring

### What to Monitor
1. Failed login attempts
2. Account lockouts
3. Invalid OTP attempts
4. Rate limit violations
5. Unauthorized access attempts
6. Unusual API patterns

### Logs to Review
- Authentication logs
- Error logs
- Access logs
- Security event logs

---

## 🆘 Incident Response

### If Security Breach Suspected

1. **Immediate Actions**
   - Rotate all JWT secrets
   - Force logout all users
   - Review access logs
   - Identify affected accounts

2. **Investigation**
   - Check authentication logs
   - Review API access patterns
   - Identify entry point
   - Assess data exposure

3. **Recovery**
   - Patch vulnerability
   - Reset affected passwords
   - Notify affected users
   - Update security measures

---

## 📝 Security Updates

**Last Updated**: 2026-02-27  
**Version**: 1.0  
**Next Review**: Monthly

---

## 🔗 Related Documentation

- `SECURITY_ENHANCEMENTS.md` - Initial security features
- `API_GUIDE.md` - API usage examples
- `CODE_REUSABILITY.md` - Code organization
