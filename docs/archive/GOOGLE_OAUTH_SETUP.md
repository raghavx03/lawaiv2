# Google OAuth Setup for Profile Pictures

## Problem
Gmail profile pictures are not showing because Google OAuth is not properly configured.

## Solution Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API or People API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application type: "Web application"
6. Add Authorized redirect URIs:
   - `https://hudflljbqezmpibippyb.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback` (for development)

### 2. Supabase Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hudflljbqezmpibippyb`
3. Go to Authentication → Providers
4. Enable Google provider
5. Add your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)

### 3. Required Scopes
Make sure these scopes are enabled in Supabase Google provider:
- `openid`
- `email` 
- `profile`

### 4. Test Setup
1. Visit: `http://localhost:3000/test-auth`
2. Login with Google
3. Check if `user_metadata.avatar_url` or `user_metadata.picture` contains Gmail profile picture URL

### 5. Current Status
- Supabase URL: `https://hudflljbqezmpibippyb.supabase.co`
- Google OAuth: ❌ Not configured (placeholder credentials in .env.local)
- Profile Pictures: ❌ Will work after Google OAuth setup

## Quick Fix (Temporary)
If you can't setup Google OAuth immediately, the system will show:
1. User initials as fallback avatar
2. Gravatar if available
3. Default avatar icon

## After Setup
Once Google OAuth is configured, users will get their Gmail profile pictures automatically on login.