# How to Get Your Cloudinary Credentials

## Step 1: Create Cloudinary Account

1. **Go to**: https://cloudinary.com/
2. **Click**: "Sign Up Free" button (top right)
3. **Fill in the form**:
   - Email: your-email@example.com
   - Password: (create a strong password)
   - Company/Product Name: Akariza
4. **Click**: "Create Account"
5. **Verify your email** (check inbox for verification link)

## Step 2: Get Your Credentials

After logging in, you'll see your **Dashboard** with:

```
Account Details
├── Cloud name: dxyz123abc
├── API Key: 123456789012345
└── API Secret: ••••••••••••••• (click "Reveal" to see)
```

### Example Credentials (yours will be different):
- **Cloud Name**: `dxyz123abc`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz123`

## Step 3: Update Your .env File

Open `backend/.env` and replace the placeholder values:

```env
# Before (placeholder values)
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"

# After (your actual values)
CLOUDINARY_CLOUD_NAME="dxyz123abc"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123"
```

## Step 4: Install Dependencies

```bash
cd backend
npm install cloudinary multer @nestjs/platform-express streamifier
npm install --save-dev @types/multer @types/streamifier
```

## Step 5: Run Migration

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 6: Test Locally

```bash
npm run start:dev
```

The backend should start without errors. Check the console for:
```
✓ Cloudinary configured successfully
✓ Upload module loaded
```

## Step 7: Deploy to Production

### Add to Render.com Environment Variables:

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Click "Environment" tab
4. Add these variables:
   ```
   CLOUDINARY_CLOUD_NAME = dxyz123abc
   CLOUDINARY_API_KEY = 123456789012345
   CLOUDINARY_API_SECRET = abcdefghijklmnopqrstuvwxyz123
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

## Troubleshooting

### Can't find credentials?
- Go to: https://cloudinary.com/console
- Login with your account
- Credentials are on the main dashboard

### API Secret hidden?
- Click the "Reveal" button next to API Secret
- Copy the full secret (usually 27 characters)

### Still having issues?
- Make sure there are no extra spaces in .env
- Restart your backend server after updating .env
- Check that all three variables are set

## Free Tier Limits

Your free account includes:
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited API calls

Perfect for getting started!

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to Git
- Never share your API Secret publicly
- Use different credentials for dev/production
- Rotate secrets if compromised

## Next Steps

After setup:
1. Test image upload in Products page
2. Verify images display on Catalog page
3. Check Cloudinary dashboard for uploaded images
4. Monitor usage in Cloudinary console

---

**Need Help?** Check `CLOUDINARY_DEPLOYMENT_CHECKLIST.md` for complete guide.
