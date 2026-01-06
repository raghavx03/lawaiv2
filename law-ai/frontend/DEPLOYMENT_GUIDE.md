# 🚀 LAW-AI Vercel Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Environment Variables Setup**
Create these in Vercel Dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Security
CSRF_SECRET=your-production-csrf-secret-32-chars
JWT_SECRET=your-production-jwt-secret-32-chars
NEXTAUTH_SECRET=your-production-nextauth-secret

# Site
NEXT_PUBLIC_SITE_URL=https://lawai.ragspro.com
NODE_ENV=production
```

## 🌐 **Deployment Steps**

### 1. **Deploy to Vercel**
```bash
cd /Users/raghavpratap/Desktop/lawai/law-ai/frontend
vercel --prod
```

### 2. **Domain Configuration**

#### **In Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add domain: `lawai.ragspro.com`
3. Copy the CNAME record provided

#### **In Domain Provider (ragspro.com):**
Add CNAME record:
```
Type: CNAME
Name: lawai
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. **SSL Certificate**
- Vercel automatically provisions SSL
- Certificate will be ready in 5-10 minutes

## 🔧 **Quick Deploy Commands**

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 📊 **Post-Deployment Setup**

### 1. **Database Migration**
```bash
# Run in Vercel Functions or locally
npx prisma migrate deploy
```

### 2. **Webhook URLs Update**
Update webhook URLs in:
- **Razorpay**: `https://lawai.ragspro.com/api/payments/webhook`
- **Supabase**: `https://lawai.ragspro.com/api/auth/callback`

### 3. **Test Deployment**
- ✅ Homepage loads: https://lawai.ragspro.com
- ✅ Authentication works
- ✅ API endpoints respond
- ✅ Database connections work

## 🛠️ **Environment Variables Template**

Copy to Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
DATABASE_URL=
DIRECT_URL=
CSRF_SECRET=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXT_PUBLIC_SITE_URL=https://lawai.ragspro.com
NODE_ENV=production
```

## 🔍 **Troubleshooting**

### Common Issues:
1. **Build Fails**: Check environment variables
2. **Domain Not Working**: Verify CNAME record
3. **API Errors**: Check database connection
4. **Auth Issues**: Verify Supabase callback URL

### Useful Commands:
```bash
# Check build locally
npm run build

# Test production build
npm start

# View deployment logs
vercel logs --follow
```

## 📱 **Final URLs**
- **Production**: https://lawai.ragspro.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/ragspro/lawai

Ready for production! 🎯