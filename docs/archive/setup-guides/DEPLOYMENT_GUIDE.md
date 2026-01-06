# 🚀 LAW-AI Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Razorpay account
- Domain name (for production)

## 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### Run Database Migrations
```bash
cd law-ai/frontend
npx prisma migrate deploy
npx prisma generate
```

### Enable Row Level Security
```sql
-- Run in Supabase SQL Editor
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

## 2. Environment Configuration

### Development (.env.local)
```bash
cp .env.example .env.local
# Fill in your actual values
```

### Production (.env.production)
```bash
# Update with production values
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
DATABASE_URL=your_production_database_url
OPENAI_API_KEY=your_production_openai_key
NEXTAUTH_SECRET=your_32_char_secret
```

## 3. Deployment Options

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Docker
```bash
docker build -t law-ai .
docker run -p 3000:3000 law-ai
```

### Option C: Traditional Server
```bash
npm run build
npm start
```

## 4. Post-Deployment Checklist

- [ ] Test health endpoint: `/api/health`
- [ ] Verify authentication flow
- [ ] Test payment integration
- [ ] Check all API endpoints
- [ ] Monitor error logs
- [ ] Set up domain SSL
- [ ] Configure CDN (optional)

## 5. Security Checklist

- [ ] All API keys secured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] SQL injection protection
- [ ] XSS protection enabled

## 6. Monitoring

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### Error Monitoring
- Set up Sentry (optional)
- Monitor Vercel/server logs
- Set up uptime monitoring

## 7. Backup Strategy

### Database Backups
- Supabase provides automatic backups
- Set up additional backup schedule if needed

### Code Backups
- Ensure Git repository is backed up
- Tag releases for rollback capability

## Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Check API key validity