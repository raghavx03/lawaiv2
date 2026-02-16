# 🔧 Supabase Redirect URL Fix

## 🚨 **Problem**: 
Login redirecting to `localhost:3000` instead of `lawai.ragspro.com`

## ✅ **Solution**:

### 1. **Update Supabase Auth Settings**
Go to Supabase Dashboard → Authentication → URL Configuration:

**Site URL**: `https://lawai.ragspro.com`

**Redirect URLs**: Add these URLs:
```
https://lawai.ragspro.com/auth/callback
https://lawai.ragspro.com/api/auth/callback
https://lawai.ragspro.com/dashboard
https://lawai.ragspro.com/
```

### 2. **Update Vercel Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://lawai.ragspro.com
NODE_ENV=production
```

### 3. **Supabase Dashboard Steps**:
1. Go to https://supabase.com/dashboard
2. Select your project: `hudflljbqezmpibippyb`
3. Go to Authentication → Settings → URL Configuration
4. Update:
   - **Site URL**: `https://lawai.ragspro.com`
   - **Redirect URLs**: Add production URLs above
5. Save changes

### 4. **Test Login Flow**:
1. Go to https://lawai.ragspro.com
2. Click Login
3. Should redirect to https://lawai.ragspro.com/dashboard (not localhost)

## 🔗 **Quick Links**:
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hudflljbqezmpibippyb
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Production Site**: https://lawai.ragspro.com

Fix these settings and login will work properly! 🎯