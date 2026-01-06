# ⚖️ LAW-AI: AI-Powered Legal SaaS Platform

> Complete AI-powered legal toolkit for lawyers and legal professionals - from document generation to case tracking, all in one platform.

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://your-demo-link.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## 🚀 Key Features

- **🤖 AI Assistant** - Legal query resolution with OpenAI GPT
- **📄 Document Generator** - Automated legal document creation
- **⚖️ Judgment Summarizer** - AI-powered court judgment analysis
- **👥 CRM System** - Client relationship management
- **📚 Acts Database** - Comprehensive legal acts search
- **📰 Legal News** - Real-time legal updates
- **📋 Case Tracker** - Court case monitoring
- **📝 Legal Notices** - Notice generation & management
- **🔍 Research Tool** - Advanced legal research

## 📊 Pricing Plans

| Plan | Price | Features | Queries |
|------|-------|----------|---------|
| **Free** | ₹0 | 3 Core Features | 10 queries |
| **Basic** | ₹499/month | 3 Core Features | Unlimited |
| **Plus** | ₹999/month | 6 Features | Unlimited |
| **Pro** | ₹1,499/month | All 9 Features | Unlimited |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Supabase Authentication
- **Payments**: Razorpay Integration
- **AI**: OpenAI GPT-3.5-turbo (Paid Plans), Google Gemini (Free Plan)

## 📸 Screenshots

> 🔗 [Live Demo](https://your-demo-link.com) | [Video Walkthrough](https://your-video-link.com)

---

# 🔧 Developer Setup

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenAI API key (for paid plans)
- Google Gemini API key (for free plan)
- Razorpay account
- Google OAuth credentials (optional)

## Installation

```bash
# Clone repository
git clone https://github.com/your-username/law-ai.git
cd law-ai/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

## Environment Configuration

Create `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for paid plans)
OPENAI_API_KEY=your_openai_api_key

# Google Gemini Configuration (for free plan)
GEMINI_API_KEY=your_gemini_api_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Development) Push schema changes
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build image
docker build -t law-ai .

# Run container
docker run -p 3000:3000 --env-file .env.local law-ai
```

## 📡 API Endpoints

### Authentication
- `GET /api/auth/callback` - Supabase auth callback
- `GET /api/user/profile` - Get user profile

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Payment webhook

### AI Features
- `POST /api/chat-enhanced` - AI chat with memory
- `POST /api/summarizer` - Judgment summarization
- `POST /api/drafts` - Generate legal documents
- `GET /api/research` - Legal research queries

### Management
- `POST /api/case-tracker` - Track court cases
- `POST /api/notices` - Generate legal notices
- `POST /api/crm` - CRM operations

## 🔐 Security Features

- **Input Sanitization** - DOMPurify integration
- **Rate Limiting** - IP and user-based limits
- **CSRF Protection** - Secure token validation
- **SQL Injection Prevention** - Prisma ORM protection
- **XSS Protection** - Content Security Policy
- **Authentication** - JWT token management

## 🧪 Testing

```bash
# Test API health
curl http://localhost:3000/api/health

# Test authenticated endpoint
curl -X POST http://localhost:3000/api/chat-enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message":"What is Section 420 IPC?"}'
```

## 🔧 Webhook Setup

### Razorpay Webhooks

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Set webhook secret in environment variables

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL for webhook testing
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   ├── dashboard/      # Protected dashboard
│   └── auth/           # Authentication pages
├── components/         # React components
│   ├── dashboard/      # Dashboard widgets
│   ├── auth/          # Auth components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities & configurations
│   ├── auth/          # Authentication helpers
│   ├── security/      # Security utilities
│   └── supabase.ts    # Supabase client
└── middleware.ts      # Route protection
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Verify DATABASE_URL format
# Check Supabase project status
npx prisma db pull
```

**Authentication Issues**
```bash
# Verify Supabase credentials
# Check middleware configuration
# Ensure cookies are enabled
```

**Payment Webhook Failing**
```bash
# Verify webhook URL accessibility
# Check Razorpay webhook secret
# Test with ngrok for local development
```

## 📞 Support

- 📧 Email: support@law-ai.com
- 📖 Documentation: [docs.law-ai.com](https://docs.law-ai.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/law-ai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the legal community**