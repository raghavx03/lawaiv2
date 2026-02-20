# LAW.AI - Local Testing & Fix Guide

**Date**: February 20, 2026  
**Issue**: Vercel build failing due to missing env vars and database connection  
**Solution**: Fix locally, test, then deploy  

---

## Step 1: Setup Local Environment

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Generate Prisma Client
```bash
npx prisma generate
```

### 1.3 Check .env.local
```bash
cat .env.local
```

**Required variables**:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NVIDIA_LLAMA_API_KEY=your_key
DATABASE_URL=your_url
```

---

## Step 2: Fix Build Issues

### Issue 1: Auth Pages Prerendering Error

**Problem**: Auth pages try to prerender but need env vars

**Fix**: Add `export const dynamic = 'force-dynamic'` to auth pages

**Files to fix**:
- `src/app/auth/sign-in/page.tsx`
- `src/app/auth/sign-up/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`

**Add at top of file**:
```typescript
export const dynamic = 'force-dynamic'
```

### Issue 2: Database Connection During Build

**Problem**: Build tries to connect to database

**Fix**: Wrap database calls in try-catch with fallback

**Files to check**:
- `src/app/api/documents/stats/route.ts`
- `src/app/api/documents/delete/route.ts`

**Pattern**:
```typescript
try {
  // Database call
} catch (error) {
  console.warn('Database unavailable during build, using fallback')
  // Return fallback response
}
```

---

## Step 3: Local Testing

### 3.1 Start Development Server
```bash
npm run dev
```

**Expected output**:
```
> law-ai@0.1.0 dev
> next dev

  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

### 3.2 Test Auth Pages
```bash
# Open in browser
http://localhost:3000/auth/sign-in
http://localhost:3000/auth/sign-up
```

**Expected**: Pages load without errors

### 3.3 Test API Endpoints
```bash
# Test AI Assistant
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'

# Test Document Stats
curl http://localhost:3000/api/documents/stats

# Test Case Law Search
curl -X POST http://localhost:3000/api/case-law/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Article 21", "type": "section"}'
```

### 3.4 Test Build Locally
```bash
npm run build
```

**Expected**: Build completes without errors

---

## Step 4: Fix Specific Issues

### Fix 1: Add Dynamic Rendering to Auth Pages

**File**: `src/app/auth/sign-in/page.tsx`

Add at the very top (before imports):
```typescript
export const dynamic = 'force-dynamic'
```

**File**: `src/app/auth/sign-up/page.tsx`

Add at the very top:
```typescript
export const dynamic = 'force-dynamic'
```

### Fix 2: Protect Database Calls

**File**: `src/app/api/documents/stats/route.ts`

Wrap in try-catch:
```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      const stats = await prisma.documentEmbedding.count()
      // ... rest of code
    } catch (dbError) {
      console.warn('Database unavailable, returning fallback stats')
      return NextResponse.json({
        totalChunks: 0,
        totalDocuments: 0,
        storageType: 'in-memory',
        message: 'Database unavailable'
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Fix 3: Disable Static Generation for Dynamic Pages

**File**: `next.config.js`

Add or update:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for auth pages
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Ensure dynamic pages aren't prerendered
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
```

---

## Step 5: Verification Checklist

### Local Development
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] Auth pages load at http://localhost:3000/auth/sign-in
- [ ] Dashboard loads at http://localhost:3000/dashboard
- [ ] AI Assistant responds to queries
- [ ] Document upload works
- [ ] Case law search works

### Build Testing
- [ ] `npm run build` completes without errors
- [ ] No prerender errors for auth pages
- [ ] No database connection errors
- [ ] Build output shows "✓ Compiled successfully"

### API Testing
- [ ] POST /api/ai-assistant returns response
- [ ] GET /api/documents/stats returns stats
- [ ] POST /api/case-law/search returns results
- [ ] POST /api/risk/score returns risk score
- [ ] POST /api/conflicts/check returns conflicts

---

## Step 6: Common Issues & Solutions

### Issue: "Can't reach database server at localhost:5432"

**Cause**: Build tries to connect to database

**Solution**: 
1. Wrap database calls in try-catch
2. Add `export const dynamic = 'force-dynamic'` to dynamic pages
3. Return fallback responses when database unavailable

### Issue: "Missing Supabase credentials"

**Cause**: Auth pages try to prerender without env vars

**Solution**:
1. Add `export const dynamic = 'force-dynamic'` to auth pages
2. Ensure .env.local has all required variables
3. Don't prerender pages that need env vars

### Issue: "Error occurred prerendering page"

**Cause**: Page tries to access env vars during build

**Solution**:
1. Add `export const dynamic = 'force-dynamic'` to page
2. Move env var access to client-side or API routes
3. Use dynamic imports for components needing env vars

---

## Step 7: Deploy to Vercel

### 7.1 Verify Locally First
```bash
npm run build
npm run start
```

### 7.2 Push to GitHub
```bash
git add .
git commit -m "Fix: Add dynamic rendering and database error handling"
git push origin main
```

### 7.3 Vercel Auto-Deploy
- Vercel automatically deploys on push to main
- Monitor build at https://vercel.com/dashboard

### 7.4 Verify Deployment
```bash
# Test deployed API
curl https://lawaiv2.vercel.app/api/documents/stats

# Test deployed auth
# Open https://lawaiv2.vercel.app/auth/sign-in
```

---

## Step 8: Testing Commands

### Run All Tests
```bash
# Development server
npm run dev

# Build test
npm run build

# Start production build
npm run start

# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

### Test Specific Features

**Test AI Assistant**:
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is Section 420 IPC?",
    "history": []
  }'
```

**Test Document Search**:
```bash
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "payment terms",
    "topK": 5,
    "threshold": 0.3
  }'
```

**Test Risk Scoring**:
```bash
curl -X POST http://localhost:3000/api/risk/score \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This agreement contains unlimited liability",
    "type": "contract"
  }'
```

**Test Case Law Search**:
```bash
curl -X POST http://localhost:3000/api/case-law/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Article 21",
    "type": "section"
  }'
```

---

## Step 9: Troubleshooting

### If Build Still Fails

1. **Check Node version**:
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

2. **Clear cache**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Check env vars**:
   ```bash
   cat .env.local
   # Verify all required variables are present
   ```

4. **Check for syntax errors**:
   ```bash
   npx tsc --noEmit
   ```

### If Tests Fail

1. **Check API responses**:
   ```bash
   curl -v http://localhost:3000/api/ai-assistant
   ```

2. **Check logs**:
   ```bash
   # Terminal where npm run dev is running
   # Look for error messages
   ```

3. **Check database connection**:
   ```bash
   # Verify DATABASE_URL in .env.local
   # Test connection with: npx prisma db execute --stdin
   ```

---

## Step 10: Final Checklist

Before deploying to production:

- [ ] Local development server runs without errors
- [ ] All auth pages load correctly
- [ ] All API endpoints respond correctly
- [ ] Build completes without errors
- [ ] No console errors or warnings
- [ ] All tests pass
- [ ] Environment variables are set correctly
- [ ] Database connection works
- [ ] AI responses are working
- [ ] Document upload works
- [ ] Search functionality works
- [ ] Risk scoring works
- [ ] Conflict detection works
- [ ] Case law search works

---

## Quick Reference

### Start Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Run Type Check
```bash
npx tsc --noEmit
```

### Run Linter
```bash
npm run lint
```

### Generate Prisma Client
```bash
npx prisma generate
```

### View Prisma Studio
```bash
npx prisma studio
```

---

**Status**: Ready for local testing  
**Next**: Follow steps 1-10 to fix and test locally  
**Then**: Deploy to Vercel  

