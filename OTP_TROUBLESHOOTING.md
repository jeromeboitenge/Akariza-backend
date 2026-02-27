# OTP Email Delivery Troubleshooting

## Common Issues & Solutions

### 1. **Email Not Arriving**

**Possible Causes:**
- Email in spam/junk folder
- SendGrid processing delay (1-5 minutes)
- Email provider filtering
- SendGrid sender not verified

**Solutions:**
1. Check spam/junk folder
2. Wait 2-5 minutes
3. Check all mail folders
4. Verify sender in SendGrid dashboard

### 2. **SendGrid Delays**

**Why it happens:**
- SendGrid queues emails for processing
- High volume can cause delays
- Email provider anti-spam checks
- Network latency

**Expected Times:**
- SendGrid API response: 100-500ms
- Email delivery: 30 seconds - 5 minutes
- Total time: Usually under 2 minutes

### 3. **Testing Email Delivery**

**Test Endpoint:**
```bash
POST /auth/test-otp-email
{
  "email": "your@email.com"
}
```

**What to check:**
- `totalTime`: How long the API call took
- `success`: true/false
- `apiKeySet`: Should be true
- `fromEmail`: Should be configured

### 4. **Check Render Logs**

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - `📧 Sending email to:`
   - `✅ Email sent in XXXms`
   - `❌ Email failed`

### 5. **SendGrid Dashboard**

1. Go to https://app.sendgrid.com
2. Click "Activity"
3. Filter by recipient email
4. Check delivery status:
   - **Processed**: SendGrid accepted
   - **Delivered**: Email delivered
   - **Bounced**: Email rejected
   - **Deferred**: Temporary delay

### 6. **Gmail Specific Issues**

Gmail may delay emails from new senders:
- First email: 2-5 minutes
- Subsequent emails: 30 seconds - 2 minutes
- Check "All Mail" folder
- Check spam folder
- Add sender to contacts

### 7. **Environment Variables**

Verify on Render:
```
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=jeromeboitenge@gmail.com
SENDGRID_FROM_NAME=Akariza System
```

### 8. **Quick Fixes**

**If OTP not arriving:**
1. Wait 5 minutes
2. Check spam
3. Request new OTP
4. Try different email
5. Check Render logs

**If consistently failing:**
1. Verify SendGrid API key
2. Check sender verification
3. Review SendGrid activity
4. Check account status

### 9. **Development Mode**

In development, OTP is logged to console:
```
🔐 OTP for email@example.com : 123456
```

Check backend logs for the OTP code.

### 10. **Rate Limiting**

OTP requests are rate limited:
- Login OTP: 5 per minute
- Password reset: 3 per minute
- Verification: 3 per minute

Wait 1 minute if rate limited.

---

## Performance Benchmarks

**Normal Performance:**
- API Response: 200-500ms
- SendGrid Accept: 100-300ms
- Email Delivery: 30s - 2min
- Total User Wait: 1-3 minutes

**Slow Performance:**
- API Response: >1s (check server)
- SendGrid Accept: >1s (check API key)
- Email Delivery: >5min (check spam/provider)

---

## Contact Support

If issues persist:
1. Check SendGrid activity feed
2. Review Render logs
3. Verify environment variables
4. Test with different email provider
5. Contact SendGrid support

---

**Last Updated**: 2026-02-27
