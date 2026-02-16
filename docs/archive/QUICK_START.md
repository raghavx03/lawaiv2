# 🚀 LAW-AI Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Valid Supabase project
- [ ] OpenAI API key
- [ ] Razorpay account (optional)

## 1-Minute Setup

### Step 1: Environment Setup
```bash
# Copy and update environment file
cp .env.example .env.local

# Update these critical variables in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
OPENAI_API_KEY=your_openai_key
```

### Step 2: Database Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
```

### Step 3: Launch
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## ✅ Verification

### Test Core Features:
1. **Homepage**: http://localhost:3000 ✅
2. **Login**: http://localhost:3000/auth/login ✅  
3. **Dashboard**: http://localhost:3000/dashboard ✅
4. **AI Assistant**: http://localhost:3000/ai-assistant ✅

### Run Full Test Suite:
```bash
node test-all-features.js
```

Expected result: **94%+ success rate**

## 🔧 Troubleshooting

### Database Connection Issues:
```bash
# Test connection
npx prisma db pull

# If fails, verify:
# 1. Supabase project is active
# 2. Database URL format is correct
# 3. Password is URL-encoded (%40 for @)
```

### Port Issues:
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Build Issues:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 🎯 Production Deployment

### Vercel (Recommended):
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

### Docker:
```bash
docker build -t law-ai .
docker run -p 3000:3000 --env-file .env.local law-ai
```

---

**Need Help?** Check `FIXES_APPLIED.md` for detailed troubleshooting.