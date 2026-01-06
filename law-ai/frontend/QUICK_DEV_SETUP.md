# 🚀 LAW-AI Quick Development Setup

## ✅ Repository Cloned Successfully!

```bash
cd /Users/raghavpratap/Desktop/lawai/law-ai/frontend
```

## 📦 Dependencies Installed
- ✅ npm install completed
- ✅ Security vulnerabilities fixed
- ✅ .env.local created with templates

## 🔧 Next Steps for Development

### 1. **Configure Environment Variables**
Edit `.env.local` file:
```bash
nano .env.local
```

**Required Services:**
- **Supabase**: Create project at https://supabase.com
- **OpenAI**: Get API key from https://platform.openai.com
- **Razorpay**: Create account at https://razorpay.com

### 2. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 3. **Start Development Server**
```bash
npm run dev
```

### 4. **Access Application**
- **Frontend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio

# Testing
npm run test
```

## 📋 Environment Setup Checklist

- [ ] Supabase project created
- [ ] OpenAI API key obtained
- [ ] Razorpay account setup
- [ ] Database configured
- [ ] Environment variables updated
- [ ] Development server running

## 🔗 Useful Links

- **Repository**: https://github.com/ragspro/lawai
- **Supabase Dashboard**: https://supabase.com/dashboard
- **OpenAI Platform**: https://platform.openai.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com

## 🆘 Need Help?

Check the comprehensive documentation in:
- `README.md` - Complete setup guide
- `docs/` - Detailed documentation
- `TROUBLESHOOTING.md` - Common issues

Ready to start developing! 🎯