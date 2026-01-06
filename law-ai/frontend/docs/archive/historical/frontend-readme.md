# LAW.AI - AI-Powered Legal SaaS Platform

A comprehensive legal SaaS application built with Next.js 13+, Supabase, and OpenAI, designed for lawyers, clients, and law students.

## 🚀 Features

### ✅ **Authentication & User Management**
- Email/password signup & login
- Google OAuth integration
- Role-based access (admin, lawyer, client, student)
- Session management with Supabase Auth
- User profiles and settings

### ✅ **AI-Powered Tools**
- **Legal AI Chatbot** - GPT-4 powered legal assistant
- **Document Analyzer** - AI document analysis and summarization
- **Contract Review** - Automated contract risk assessment
- **Legal Research** - Case law and precedent search
- **Document Generator** - AI-powered legal document creation
- **OCR Tool** - Extract text from images and scanned documents

### ✅ **Core Legal Features**
- **Case Management** - Create, track, and manage legal cases
- **Appointment Booking** - Calendar integration with reminders
- **Document Storage** - Secure document upload and management
- **Secure Messaging** - Lawyer-client communication
- **Team Collaboration** - Multi-user workspace management

### ✅ **Business Features**
- **Stripe Billing** - Subscription management and invoicing
- **Dashboard Analytics** - Usage stats and insights
- **Notification System** - Real-time alerts and updates
- **Activity Logging** - Comprehensive audit trails

### ✅ **UI/UX**
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching capability
- **Modern UI** - Clean, professional interface
- **Accessibility** - WCAG compliant components

## 🛠 Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI GPT-4, Tesseract.js (OCR)
- **Payments**: Stripe
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for billing)
- Google OAuth credentials (optional)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
cd frontend
npm install
\`\`\`

### 2. Environment Setup

Copy \`.env.example\` to \`.env.local\` and fill in your credentials:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
\`\`\`

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from \`supabase-schema.sql\`
3. Enable Row Level Security (RLS) policies
4. Configure Google OAuth in Supabase Auth settings

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📊 Database Schema

The application uses the following main tables:

- **users** - User profiles and roles
- **cases** - Legal case management
- **appointments** - Calendar and scheduling
- **documents** - File storage and metadata
- **messages** - Secure messaging system
- **ai_chat_sessions** - AI conversation history
- **invoices** - Billing and payment tracking
- **notifications** - System notifications
- **activity_logs** - Audit trail

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email/password or Google OAuth
2. **Role Assignment**: Users are assigned roles (client, lawyer, admin, student)
3. **Profile Creation**: User profiles are created in the database
4. **Session Management**: Supabase handles JWT tokens and sessions
5. **Role-Based Access**: Different dashboards based on user roles

## 🤖 AI Integration

### OpenAI GPT-4 Integration
- Legal-specific system prompts
- Context-aware conversations
- Token usage tracking
- Error handling and fallbacks

### Document Processing
- PDF text extraction
- OCR for scanned documents
- AI-powered summarization
- Risk assessment algorithms

## 💳 Stripe Integration

### Subscription Plans
- **Free**: Limited features for students
- **Professional**: Full features for solo practitioners
- **Enterprise**: Advanced features for law firms

### Payment Flow
1. User selects a plan
2. Stripe Checkout session created
3. Payment processed securely
4. Webhook updates user subscription
5. Access granted to premium features

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ai/               # AI tool components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── landing/          # Landing page components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
\`\`\`

## 🔧 Configuration

### Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Run the provided SQL schema
3. Configure authentication providers
4. Set up storage buckets for documents

### OpenAI Setup
1. Get API key from [OpenAI](https://openai.com)
2. Set up billing and usage limits
3. Configure model preferences

### Stripe Setup
1. Create account at [Stripe](https://stripe.com)
2. Set up products and pricing
3. Configure webhooks for subscription events

## 🧪 Testing

\`\`\`bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
\`\`\`

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for speed
- **Bundle Size**: Optimized with tree shaking
- **Caching**: Aggressive caching strategies

## 🔒 Security

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row Level Security (RLS)
- **Data Encryption**: End-to-end encryption
- **HTTPS**: SSL/TLS encryption
- **Input Validation**: Server-side validation
- **Rate Limiting**: API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.lawai.com](https://docs.lawai.com)
- **Email**: support@lawai.com
- **Discord**: [Join our community](https://discord.gg/lawai)
- **GitHub Issues**: [Report bugs](https://github.com/lawai/issues)

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice-to-text integration
- [ ] Blockchain document verification
- [ ] Advanced AI legal research
- [ ] Integration with court systems
- [ ] White-label solutions

---

**Built with ❤️ for the legal community**
\`\`\`