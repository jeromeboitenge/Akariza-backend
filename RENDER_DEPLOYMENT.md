# Akariza Backend - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub account
- Render account (free tier available)
- Code pushed to GitHub repository

---

## Method 1: Deploy via Render Dashboard (Recommended)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `akariza-db`
   - **Database**: `akariza`
   - **User**: `akariza_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait for database to be ready (2-3 minutes)
6. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

   **Basic Settings:**
   - **Name**: `akariza-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your branch)
   - **Root Directory**: `backend` (if in monorepo) or leave blank
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm run start:prod
     ```
   - **Plan**: Free

4. Click **"Advanced"** and add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `DATABASE_URL` | Paste the Internal Database URL from Step 1 |
   | `JWT_SECRET` | Generate random string (32+ chars) |
   | `JWT_REFRESH_SECRET` | Generate random string (32+ chars) |
   | `JWT_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |

   **Generate Secrets:**
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # Or use online generator
   # https://randomkeygen.com/
   ```

5. Click **"Create Web Service"**

### Step 3: Run Database Migrations

1. Once service is deployed, go to **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

3. (Optional) Seed initial data:
   ```bash
   npm run prisma:seed
   ```

### Step 4: Verify Deployment

1. Your API will be available at: `https://akariza-backend.onrender.com`
2. Test endpoints:
   - Health: `https://akariza-backend.onrender.com/api/v1/auth/login`
   - Docs: `https://akariza-backend.onrender.com/api/v1/docs`

---

## Method 2: Deploy via render.yaml (Infrastructure as Code)

### Step 1: Update render.yaml

The `render.yaml` file is already configured. Just update:

```yaml
services:
  - type: web
    name: akariza-backend
    env: node
    region: oregon  # Change to your preferred region
    plan: free
    buildCommand: sh render-build.sh
    startCommand: npm run start:prod
```

### Step 2: Deploy

1. Push code to GitHub
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect repository
4. Render will automatically:
   - Create PostgreSQL database
   - Create web service
   - Set up environment variables
   - Deploy application

---

## 🔧 Post-Deployment Setup

### 1. Create System Admin

Access the shell and run:
```bash
node create-admin.js
```

Or manually via Prisma Studio:
1. Go to database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use connection string with Prisma Studio locally:
   ```bash
   DATABASE_URL="<external-url>" npx prisma studio
   ```

### 2. Test API

```bash
# Login
curl -X POST https://akariza-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@akariza.com","password":"admin123"}'

# Get token and test
TOKEN="<your-token>"
curl -X GET https://akariza-backend.onrender.com/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render
2. Click **"Logs"** tab
3. Monitor real-time logs

### Metrics
- **Events**: Deployment history
- **Metrics**: CPU, Memory usage
- **Shell**: Direct access to container

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render automatically builds and deploys

### Manual Deploy
Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🌍 Custom Domain (Optional)

### Add Custom Domain

1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain: `api.yourdomain.com`
4. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Value: akariza-backend.onrender.com
   ```

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic SSL
- ✅ Continuous deployment
- ✅ PostgreSQL database (90 days, then expires)

### Limitations:
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after spin-down takes ~30s
- ⚠️ Database expires after 90 days (upgrade to paid)

### Upgrade to Paid ($7/month):
- ✅ No spin-down
- ✅ Persistent database
- ✅ More resources

---

## 🔒 Security Checklist

✅ **Environment Variables**: Never commit `.env` to Git  
✅ **JWT Secrets**: Use strong random strings  
✅ **Database**: Use internal URL for service-to-db connection  
✅ **CORS**: Set `FRONTEND_URL` to your frontend domain  
✅ **HTTPS**: Automatic with Render  
✅ **Rate Limiting**: Consider adding (not included)  

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Cannot find module '@prisma/client'`
```bash
# Solution: Add postinstall script
"postinstall": "prisma generate"
```

**Error**: `Migration failed`
```bash
# Solution: Run migrations manually in Shell
npx prisma migrate deploy
```

### Service Won't Start

**Check Logs**:
1. Go to Logs tab
2. Look for errors
3. Common issues:
   - Missing environment variables
   - Database connection failed
   - Port binding issues

**Database Connection**:
```bash
# Test connection in Shell
npx prisma db pull
```

### Slow First Request

This is normal on free tier (cold start). Solutions:
- Upgrade to paid plan
- Use a cron job to ping every 10 minutes
- Accept the delay

---

## 📱 Connect Frontend

Update your frontend API URL:

```javascript
// React/Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://akariza-backend.onrender.com/api/v1';

// Flutter
const String apiUrl = 'https://akariza-backend.onrender.com/api/v1';
```

---

## 🔄 Database Backups

### Manual Backup
```bash
# From Render Shell
pg_dump $DATABASE_URL > backup.sql
```

### Automated Backups
Upgrade to paid plan for automatic daily backups.

---

## 📈 Scaling

### Horizontal Scaling
Add more instances (paid plans):
1. Go to service settings
2. Increase instance count

### Vertical Scaling
Upgrade plan for more resources:
- Starter: $7/month
- Standard: $25/month
- Pro: $85/month

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Code pushed to GitHub
- [ ] `.env` not committed
- [ ] `render.yaml` configured
- [ ] Database migrations ready
- [ ] Build script tested locally
- [ ] Environment variables prepared
- [ ] Admin credentials ready

After deploying:

- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] API endpoints tested
- [ ] Swagger docs accessible
- [ ] Frontend connected
- [ ] Monitoring set up

---

## 🎉 You're Live!

Your API is now deployed and accessible at:
- **API**: `https://akariza-backend.onrender.com/api/v1`
- **Docs**: `https://akariza-backend.onrender.com/api/v1/docs`

**Next Steps:**
1. Create organizations
2. Add users
3. Start using the system
4. Monitor logs and metrics

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🚀 Alternative Hosting Options

If Render doesn't work for you:

1. **Railway** - Similar to Render, easy deployment
2. **Heroku** - Classic PaaS (paid only now)
3. **DigitalOcean App Platform** - $5/month
4. **AWS Elastic Beanstalk** - More complex, scalable
5. **Vercel** - Good for Next.js backends
6. **Fly.io** - Global edge deployment

All require similar setup with environment variables and database.
