# 🚨 CRITICAL FIXES FOR PRODUCTION

## 1. **Fix Razorpay Configuration**
```env
# Replace in .env.local:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_actual_webhook_secret
```

## 2. **Configure Email SMTP**
```env
# Replace in .env.local:
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_gmail_app_password
GMAIL_APP_PASSWORD=your_gmail_app_password
```

## 3. **Setup Redis Rate Limiting**
```env
# Add to .env.local:
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 4. **Test These URLs:**
- https://lawai.ragspro.com/auth/signup
- https://lawai.ragspro.com/auth/login  
- https://lawai.ragspro.com/dashboard
- https://lawai.ragspro.com/ai-assistant
- https://lawai.ragspro.com/case-tracker

## 5. **Expected Working Features:**
✅ User signup/login
✅ AI Assistant (10 queries for free users)
✅ Case Tracker (add/view cases)
✅ Document generation
✅ Mobile responsive design

## 6. **Expected Broken Features:**
❌ Payment processing
❌ Password reset emails
❌ Plan upgrades
❌ Email notifications