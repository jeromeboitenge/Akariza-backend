# Render Environment Variables Checklist

## Required Variables for OTP to Work:

1. **SENDGRID_API_KEY**
   ```
   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
   ```

2. **SENDGRID_FROM_EMAIL**
   ```
   jeromeboitenge@gmail.com
   ```

3. **SENDGRID_FROM_NAME**
   ```
   Akariza System
   ```

4. **NODE_ENV** (optional, but recommended)
   ```
   production
   ```

## How to Check on Render:

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Verify all 3 SendGrid variables are set
5. If missing, add them and redeploy

## Testing:

- Try login on deployed system
- Check Render logs for any errors
- OTP should arrive in 1-2 minutes
- Check spam folder if not in inbox

---

**Note**: In production (NODE_ENV=production), OTP won't show in logs for security.
Only in development mode will you see: `🔐 OTP for email : 123456`
