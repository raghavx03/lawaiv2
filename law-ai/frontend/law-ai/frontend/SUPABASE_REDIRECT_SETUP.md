# Supabase Redirect URLs Setup

## Problem
The password reset functionality is not working properly because the redirect URLs might not be configured correctly in Supabase.

## Solution

### 1. Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: `hudflljbqezmpibippyb`

### 2. Configure Authentication Settings
1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:

```
http://localhost:3000/auth/reset-password
https://your-production-domain.com/auth/reset-password
```

### 3. Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Ensure the action link uses: `{{ .SiteURL }}/auth/reset-password?token={{ .TokenHash }}&type=recovery`

### 4. Test the Flow
1. Go to `/auth/forgot-password`
2. Enter your email
3. Check email for reset link
4. Click the link - should redirect to `/auth/reset-password`
5. Enter new password
6. Should redirect to login with success message

## Current Configuration Check

Run this to verify your current Supabase settings:

```bash
cd /Users/raghavpratap/Desktop/LAW-AI\ v1\ 11\ aug/law-ai/frontend
node test-password-reset.js
```

## Troubleshooting

### If reset link doesn't work:
1. Check browser console for errors
2. Verify the URL contains `access_token`, `refresh_token`, and `type=recovery`
3. Make sure redirect URLs are added in Supabase dashboard

### If password update fails:
1. Check if user session is valid
2. Verify password meets requirements (min 6 characters)
3. Check Supabase logs in dashboard

## Files Updated
- `/src/app/auth/reset-password/page.tsx` - Complete rewrite with better error handling
- `/src/app/auth/forgot-password/page.tsx` - Minor improvements
- `test-password-reset.js` - Test script for verification