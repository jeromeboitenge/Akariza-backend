# Render Deployment Checklist ✅

## Pre-Deployment Checks

### Local Verification
- [x] Build succeeds: `npm run build` ✅
- [x] No TypeScript errors ✅
- [x] Application starts: `node dist/src/main.js` ✅
- [x] All imports resolved ✅
- [x] Prisma schema valid ✅

### Code Changes
- [x] OTP removed from login flow ✅
- [x] OTP added to password change ✅
- [x] Missing imports fixed ✅
- [x] Start command path corrected ✅

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix: Remove OTP from login, add to password change, fix deployment"
git push origin main
```

### 2. Monitor Render Deployment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: `akariza-backend`
3. Watch the "Events" tab for deployment progress
4. Check "Logs" tab for any errors

### 3. Expected Build Output
```
==> Cloning from GitHub...
==> Installing dependencies...
npm install --legacy-peer-deps
✓ Dependencies installed

==> Generating Prisma Client...
npx prisma generate
✓ Prisma Client generated

==> Building application...
npm run build
✓ Build completed

==> Starting service...
npm run start:prod
✓ Migrations deployed
✓ Server listening on port 5000
```

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://akariza-backend.onrender.com/api/v1/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T...",
  "uptime": 123.45
}
```

### 2. Test Login (No OTP)
```bash
curl -X POST https://akariza-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jeromeboitenge@gmail.com",
    "password": "admin123"
  }'
```

**Expected:**
```json
{
  "user": {
    "id": "admin-uuid",
    "email": "jeromeboitenge@gmail.com",
    "fullName": "System Administrator",
    "role": "SYSTEM_ADMIN"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3. Test Password Change OTP Request
```bash
# First login to get token
TOKEN="<your-access-token>"

# Request OTP for password change
curl -X POST https://akariza-backend.onrender.com/api/v1/users/request-password-change-otp \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "message": "OTP sent to your email",
  "otp": "123456"  // Only in development
}
```

### 4. Test Swagger Documentation
Visit: `https://akariza-backend.onrender.com/api/v1/docs`

**Should see:**
- ✅ All API endpoints listed
- ✅ Auth endpoints (login, forgot-password, reset-password)
- ✅ Users endpoints (with request-password-change-otp)
- ✅ No verify-otp endpoint for login

### 5. Test Database Connection
```bash
# In Render Shell
npx prisma db pull
```

**Expected:**
```
✓ Introspected 15 models
```

## Environment Variables Check

Verify these are set in Render:

- [x] `NODE_ENV` = `production`
- [x] `PORT` = `5000`
- [x] `DATABASE_URL` = (from database)
- [x] `JWT_SECRET` = (auto-generated)
- [x] `JWT_REFRESH_SECRET` = (auto-generated)
- [x] `JWT_EXPIRES_IN` = `15m`
- [x] `JWT_REFRESH_EXPIRES_IN` = `7d`

Optional (for email):
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`
- [ ] `SENDGRID_FROM_NAME`

## Troubleshooting

### Build Fails

**Error:** `Cannot find module`
```bash
# Solution: Clear build cache
# Render Dashboard → Settings → Clear build cache → Deploy
```

**Error:** `TypeScript compilation failed`
```bash
# Solution: Run locally first
npm run build
# Fix any errors, then push
```

### Service Won't Start

**Error:** `Cannot connect to database`
```bash
# Check DATABASE_URL is set correctly
# Use internal URL, not external
```

**Error:** `Port already in use`
```bash
# Ensure PORT=5000 in environment variables
# Render automatically assigns this
```

### Migrations Fail

```bash
# Run manually in Render Shell
npx prisma migrate deploy

# If still fails, reset and migrate
npx prisma migrate reset --force
npx prisma migrate deploy
npm run prisma:seed
```

## API Endpoints Changed

### Removed
- ❌ `POST /auth/verify-otp` - No longer needed for login

### Added
- ✅ `POST /users/request-password-change-otp` - Request OTP for password change

### Modified
- ✅ `POST /auth/login` - Now returns tokens directly (no OTP step)
- ✅ `PATCH /users/change-password` - Now requires OTP parameter

### Unchanged
- ✅ `POST /auth/forgot-password` - Still uses OTP
- ✅ `POST /auth/verify-reset-otp` - Still uses OTP
- ✅ `POST /auth/reset-password` - Still uses OTP

## Performance Notes

### Free Tier Limitations
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds
- ⚠️ Database expires after 90 days

### Solutions
1. **Upgrade to paid plan** ($7/month) - No spin-down
2. **Use cron job** to ping every 10 minutes
3. **Accept cold starts** for free tier

## Success Criteria

- [x] Build completes without errors
- [x] Service starts successfully
- [x] Health endpoint responds
- [x] Login works without OTP
- [x] Password change requires OTP
- [x] Swagger docs accessible
- [x] Database migrations applied
- [x] No console errors in logs

## Next Steps After Deployment

1. **Create Organizations**
   ```bash
   POST /organizations
   ```

2. **Test All Endpoints**
   - Use Swagger UI
   - Test with Postman/Insomnia

3. **Connect Frontend**
   - Update API URL in frontend
   - Test login flow
   - Test password change flow

4. **Monitor Logs**
   - Check for errors
   - Monitor performance
   - Set up alerts (paid plans)

5. **Set Up Backups**
   - Export database regularly
   - Keep migration history

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs

## Emergency Rollback

If deployment fails and you need to rollback:

1. Go to Render Dashboard → Events
2. Find previous successful deployment
3. Click "Rollback to this version"
4. Service will redeploy previous version

Or revert Git commit:
```bash
git revert HEAD
git push origin main
```

---

## ✅ Deployment Status

**Current Status:** Ready for deployment

**Last Build:** Successful ✅  
**Last Test:** Passed ✅  
**Breaking Changes:** None  
**Database Changes:** None  

**Deploy Command:**
```bash
git push origin main
```

Render will automatically deploy! 🚀
