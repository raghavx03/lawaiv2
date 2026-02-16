# LAW-AI Troubleshooting Guide

## 🚨 Common Issues & Fixes

### 1. **Build Failures**

**Error:** `Module not found` or `Type errors`
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npm run build
```

### 2. **Database Connection Issues**

**Error:** `PrismaClientInitializationError`
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Reset and push schema
npx prisma db push --force-reset
```

### 3. **Authentication Not Working**

**Error:** `Supabase auth errors`
```bash
# Verify environment variables
node -e "console.log({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
})"

# Check Supabase project status
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

### 4. **Payment Integration Issues**

**Error:** `Razorpay checkout fails`
```bash
# Verify Razorpay keys
node -e "console.log({
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  secret: process.env.RAZORPAY_KEY_SECRET?.substring(0, 10) + '...'
})"

# Test payment API
curl -X POST http://localhost:3000/api/payments/create-order \
     -H "Content-Type: application/json" \
     -d '{"plan":"BASIC"}'
```

### 5. **OpenAI API Issues**

**Error:** `AI features not working`
```bash
# Test OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}],"max_tokens":5}' \
     https://api.openai.com/v1/chat/completions
```

## 🔧 Quick Fixes

### Environment Setup
```bash
# Copy and update environment
cp .env.example .env.local
# Edit .env.local with real values
```

### Database Reset
```bash
npx prisma migrate reset --force
npx prisma db push
npx prisma generate
```

### Clean Build
```bash
rm -rf .next
npm run build
```

### Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

## 📊 Health Check Commands

```bash
# API Health
curl http://localhost:3000/api/health

# Database Connection
npx prisma db pull

# Build Test
npm run build

# Type Check
npm run type-check
```

## 🚀 Production Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

## 🔍 Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=true
```

Check logs:
```bash
tail -f dev.log
```