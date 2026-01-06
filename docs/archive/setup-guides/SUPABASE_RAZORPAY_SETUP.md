# LAW-AI: Supabase + Google OAuth + Razorpay Setup Guide

## 🚀 Complete Authentication & Payment System

This guide will help you set up the complete Supabase + Google OAuth + Razorpay subscription system for your LAW-AI platform.

## 📋 Prerequisites

- Supabase account
- Google Cloud Console account
- Razorpay account
- Node.js 18+

## 🔧 Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 1.2 Set up Database Schema
Run the SQL from `supabase-auth-schema.sql`:

```sql
-- Copy and paste the entire content from supabase-auth-schema.sql
-- This creates user_profiles, payment_records, usage_logs tables
-- Plus RLS policies and triggers
```

### 1.3 Configure Google OAuth
1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials (from Step 2)

## 🔧 Step 2: Google OAuth Setup

### 2.1 Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 2.2 Get Credentials
- Copy Client ID and Client Secret
- Add them to Supabase Google provider settings

## 🔧 Step 3: Razorpay Setup

### 3.1 Create Razorpay Account
1. Go to [Razorpay](https://razorpay.com)
2. Create account and complete KYC
3. Go to Settings → API Keys
4. Generate Key ID and Key Secret

### 3.2 Set up Webhooks
1. Go to Settings → Webhooks
2. Create webhook with URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret

## 🔧 Step 4: Environment Variables

Update your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔧 Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs razorpay
```

## 🔧 Step 6: Test the System

### 6.1 Test Authentication
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Login with Google"
4. Verify user profile is created in Supabase

### 6.2 Test Payments
1. Go to dashboard after login
2. Click "Upgrade Plan"
3. Select a plan and proceed with test payment
4. Use Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`

### 6.3 Test Feature Access
1. Try accessing different features
2. Verify free plan limitations work
3. Test upgrade flow and feature unlocking

## 🔧 Step 7: Production Deployment

### 7.1 Update Environment Variables
```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key

# Production Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# Production Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 7.2 Update OAuth Redirect URLs
- Add production domain to Google OAuth settings
- Add production domain to Supabase auth settings

### 7.3 Update Webhook URL
- Update Razorpay webhook URL to production domain

## 🎯 Features Implemented

### ✅ Authentication System
- Google OAuth login/logout
- Automatic user profile creation
- Session management with Supabase
- Protected routes middleware

### ✅ Plan & Usage System
- **Free Plan**: 3 features, 10 queries, 7 days trial
- **Basic Plan**: ₹499, 3 features unlimited
- **Plus Plan**: ₹999, 6 features unlimited  
- **Pro Plan**: ₹1499, all 9 features unlimited

### ✅ Payment Integration
- Razorpay checkout integration
- Real-time payment verification
- Webhook handling for plan updates
- Payment history tracking

### ✅ UI Components
- **ProfileDropdown**: ChatGPT-style dropdown with plan info
- **UpgradeModal**: Plan comparison with feature matrix
- **UsageTracker**: Progress bars and upgrade prompts
- **FeatureGuard**: Access control for features

### ✅ Dashboard Integration
- Usage tracking display
- Feature access indicators
- Upgrade prompts for locked features
- Real-time plan updates

## 🔒 Security Features

- Row Level Security (RLS) policies
- Webhook signature verification
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure payment processing

## 📊 Analytics & Monitoring

- Usage tracking per feature
- Payment success/failure tracking
- User plan distribution
- Feature adoption metrics

## 🚨 Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Check redirect URLs match exactly
   - Verify Google+ API is enabled
   - Check client ID/secret in Supabase

2. **Payment verification failing**
   - Verify webhook secret matches
   - Check Razorpay key ID/secret
   - Ensure webhook URL is accessible

3. **Database errors**
   - Run the schema SQL again
   - Check RLS policies are enabled
   - Verify service role key permissions

4. **Feature access not working**
   - Check user profile plan field
   - Verify FEATURE_ACCESS mapping
   - Test with different plan levels

## 📞 Support

For issues:
1. Check browser console for errors
2. Check Supabase logs
3. Check Razorpay dashboard for payment status
4. Verify environment variables are set correctly

## 🎉 Success!

Your LAW-AI platform now has:
- ✅ Complete Google OAuth authentication
- ✅ Razorpay subscription payments
- ✅ Plan-based feature access control
- ✅ Usage tracking and limits
- ✅ Real-time UI updates
- ✅ Professional upgrade flow

The system is production-ready and follows SaaS best practices!