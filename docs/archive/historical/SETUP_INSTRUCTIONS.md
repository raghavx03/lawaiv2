# LAW-AI Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd law-ai/frontend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - Add your OpenAI API key
   - Configure Supabase URLs and keys
   - Set up Razorpay credentials
   - Add database connection strings

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Features Working

✅ **Authentication**
- Email/password login and signup
- Google OAuth integration
- Automatic redirect to dashboard after login
- Profile dropdown with user info

✅ **Payments (Razorpay)**
- Plan upgrade flow
- Payment verification
- Webhook handling
- Database plan updates

✅ **Database**
- Clean Prisma schema
- All migrations working
- Proper user profiles

✅ **AI Features**
- AI Assistant with chat history
- Document summarizer
- Legal drafts generator
- Usage tracking for free plan

✅ **Security**
- Input validation and sanitization
- Rate limiting
- CSRF protection
- No hardcoded credentials in production

✅ **Build System**
- Clean TypeScript compilation
- No build errors
- Production ready

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
DATABASE_URL=your_supabase_postgres_connection_string
DIRECT_URL=your_supabase_direct_postgres_connection_string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

## Project is Production Ready! 🚀