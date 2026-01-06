# LAW-AI Setup Instructions

## 🚀 Quick Setup Guide

### 1. Environment Configuration

Create `.env.local` file in the frontend directory:

```bash
# Copy the template
cp law-ai/frontend/.env.example law-ai/frontend/.env.local
```

Update the following variables:

```env
# OpenAI API Key (Required for AI features)
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/lawai"

# Authentication
NEXTAUTH_SECRET="law-ai-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Supabase (for advanced features)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Install Dependencies

```bash
# Frontend
cd law-ai/frontend
yarn install

# Backend
cd ../backend
yarn install
```

### 3. Database Setup (Optional)

If you want full database functionality:

```bash
cd law-ai/backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development Server

```bash
cd law-ai/frontend
yarn dev
```

Visit: http://localhost:3000

## 🔧 Current Features Status

### ✅ Working Features (No Database Required)
- **Landing Page** - Fully functional with clickable features
- **Authentication** - Demo login/register (localStorage based)
- **AI Chat** - Works with OpenAI API key
- **All Module Pages** - UI complete and functional
- **Navigation** - All links working
- **Responsive Design** - Mobile and desktop ready

### 🔄 Features Requiring Database
- **Data Persistence** - User data, chat history, documents
- **Case Tracking** - Real case data storage
- **Document Storage** - File uploads and management
- **User Profiles** - Complete user management

## 🎯 Demo Usage

### Login Credentials
- **Email**: Any email (demo@law.ai)
- **Password**: Any password (demo123)

### Available Pages
- `/` - Landing page with clickable features
- `/ai-assistant` - AI chat interface
- `/research` - Legal research portal
- `/summarizer` - Document summarizer
- `/case-tracker` - Court case tracking
- `/acts` - Legal acts explorer
- `/drafts` - Document generator
- `/notices` - Legal notice generator
- `/crm` - CRM system
- `/news` - Legal news feed
- `/dashboard` - Main dashboard

## 🔑 OpenAI API Key Setup

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env.local` file:
   ```
   OPENAI_API_KEY="sk-your-actual-key-here"
   ```

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to get AI response: OpenAI API error: 401"**
   - Check your OpenAI API key in `.env.local`
   - Ensure you have credits in your OpenAI account

2. **"Completing sign in... Please wait"**
   - This is the demo auth system working
   - Use any email/password to login

3. **Features not clickable**
   - All features are now clickable and redirect to their respective pages

4. **Pricing section too large**
   - Now horizontal and compact design

5. **Footer links not working**
   - All footer links now point to working pages

## 📱 Mobile Responsiveness

The entire platform is mobile-responsive:
- Touch-friendly navigation
- Responsive grid layouts
- Mobile-optimized forms
- Swipe-friendly pricing cards

## 🚀 Production Deployment

For production deployment:

1. Set up PostgreSQL database
2. Configure all environment variables
3. Run database migrations
4. Deploy to Vercel/Netlify/AWS

## 💡 Next Steps

1. **Add OpenAI API Key** for AI features
2. **Set up Database** for data persistence
3. **Configure Supabase** for advanced features
4. **Customize Branding** as needed
5. **Add Real Authentication** (replace demo system)

## 🆘 Support

If you need help:
1. Check the console for error messages
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check network connectivity for API calls

---

**LAW-AI is now ready to use! 🎉**