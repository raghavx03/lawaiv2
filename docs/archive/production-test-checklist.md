# 🧪 LAW-AI Production Testing Checklist

## 🔐 **1. Authentication Flow Testing**

### Signup Flow:
```
✅ Visit: https://lawai.ragspro.com/auth/signup
✅ Test: Email signup with valid email
✅ Check: Email verification (if enabled)
✅ Verify: User gets FREE plan by default
✅ Test: Google OAuth signup
```

### Login Flow:
```
✅ Visit: https://lawai.ragspro.com/auth/login
✅ Test: Email/password login
✅ Test: Google OAuth login
✅ Check: Redirect to dashboard after login
✅ Verify: Profile shows correct plan
```

### Password Reset:
```
⚠️  LIKELY BROKEN - Email config incomplete
✅ Visit: https://lawai.ragspro.com/auth/forgot-password
❌ Test: Password reset email (will fail)
```

## 📊 **2. Database & User Plans**

### Free User Test:
```javascript
// Test with new account
✅ Check: Profile shows "FREE" plan
✅ Test: 3 core features accessible (AI, Drafts, Summarizer)
✅ Test: 10 query limit enforcement
✅ Test: 7-day trial limit
✅ Check: Locked features show upgrade prompt
```

### Admin Test:
```javascript
// Login with: shivangibabbar0211@gmail.com
✅ Check: Profile shows "PRO" plan
✅ Test: All 9 features accessible
✅ Test: No usage limits
```

## 🤖 **3. AI Assistant Testing**

### Free User AI:
```
✅ Visit: https://lawai.ragspro.com/ai-assistant
✅ Test: Ask legal question
✅ Check: Uses GPT-3.5-turbo (free model)
✅ Test: Query count increments
✅ Test: Stops at 10 queries
```

### Pro User AI:
```
✅ Test: Same questions with admin account
✅ Check: Unlimited queries
✅ Verify: Better responses (same model currently)
```

## 📄 **4. Document Generation**

### PDF Generation Test:
```
✅ Visit: https://lawai.ragspro.com/drafts
✅ Test: Generate legal document
✅ Check: PDF download works
✅ Verify: Document quality
✅ Test: Different document types
```

## 💳 **5. Payment System - WILL FAIL**

### Razorpay Test:
```
❌ Visit: Dashboard → Upgrade Plan
❌ Test: Select BASIC plan (₹499)
❌ Expected: Payment gateway opens
❌ Reality: Will show error (keys not configured)
```

**Fix Required:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_51H...  # Real test key
RAZORPAY_KEY_SECRET=your_actual_secret       # Real secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret  # Real webhook
```

## 📰 **6. Content Pages**

### Legal News:
```
✅ Visit: https://lawai.ragspro.com/news
✅ Check: News articles load
✅ Test: Search functionality
```

### Case Tracker:
```
✅ Visit: https://lawai.ragspro.com/case-tracker
✅ Test: Add new case
✅ Check: Case list displays
✅ Test: Search cases
```

### Acts Database:
```
✅ Visit: https://lawai.ragspro.com/acts
✅ Test: Search legal acts
✅ Check: Results display
```

## 📱 **7. Mobile Responsiveness**

### iPhone Test:
```
✅ Open: https://lawai.ragspro.com on iPhone
✅ Check: Navigation menu works
✅ Test: All buttons are touch-friendly (44px min)
✅ Verify: No horizontal scrolling
✅ Test: Forms work properly
```

### Android Test:
```
✅ Same tests as iPhone
✅ Check: Different screen sizes
✅ Test: Landscape orientation
```

## 🔌 **8. API Endpoints Test**

### Health Check:
```bash
curl https://lawai.ragspro.com/api/health
# Expected: {"status": "ok"}
```

### Authentication:
```bash
curl -X POST https://lawai.ragspro.com/api/user/profile \
  -H "Content-Type: application/json" \
  -b "cookies_from_browser"
# Expected: User profile data
```

### AI Assistant:
```bash
curl -X POST https://lawai.ragspro.com/api/chat-enhanced \
  -H "Content-Type: application/json" \
  -b "cookies_from_browser" \
  -d '{"message": "What is Section 420 IPC?"}'
# Expected: AI response
```

## 🚨 **9. Known Issues to Fix**

### Critical (Must Fix):
```
❌ Razorpay keys not configured
❌ Email SMTP not configured  
❌ Redis rate limiting not setup
❌ Some placeholder values in env
```

### Medium Priority:
```
⚠️  CSRF tokens might cause issues
⚠️  Error handling could be improved
⚠️  Loading states need optimization
```

### Low Priority:
```
ℹ️  UI polish needed in some areas
ℹ️  Better error messages
ℹ️  Performance optimizations
```

## 📋 **10. Production Readiness Score**

### Current Status: **60% Ready**

**Working (60%):**
- ✅ Authentication (Google OAuth)
- ✅ Database integration
- ✅ AI Assistant
- ✅ Document generation
- ✅ Case tracker
- ✅ Mobile responsive design
- ✅ Basic security

**Broken (40%):**
- ❌ Payment system
- ❌ Email notifications
- ❌ Rate limiting
- ❌ Password reset

## 🔧 **Immediate Fixes Needed:**

1. **Configure Razorpay:**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_actual_key
RAZORPAY_KEY_SECRET=actual_secret
```

2. **Setup Email:**
```env
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_app_password
```

3. **Add Redis:**
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## 🎯 **Testing Commands:**

```bash
# Test signup
curl -X POST https://lawai.ragspro.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test AI
curl -X POST https://lawai.ragspro.com/api/chat-enhanced \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Test case tracker
curl https://lawai.ragspro.com/api/case-tracker
```

**After fixing the critical issues, the platform should be 90%+ production ready!**