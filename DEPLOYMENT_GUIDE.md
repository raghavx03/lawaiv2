# 🚀 LAW-AI Production Deployment Guide

> **Enterprise Deployment Checklist** for Vercel + Supabase stack. Follow these steps to deploy a secure, scalable legal AI platform.

---

## ✅ Pre-Flight Checklist

Before deploying, ensure you have:

1.  **Vercel Account** (Pro plan recommended for >10s timeout, but Hobby works).
2.  **Supabase Project** with `pgvector` enabled.
3.  **NVIDIA NIM API Key** (Llama 3.3 Access).
4.  **Google Cloud Console Project** (for OAuth).
5.  **Razorpay Account** (for payments).

---

## 1. Environment Configuration

Configure these variables in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### Core Infrastructure
| Variable | Value Source | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API | Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API | Secret Admin Key |
| `DATABASE_URL` | Supabase > Settings > DB | Transaction Pooler |
| `DIRECT_URL` | Supabase > Settings > DB | Session Pooler |

### AI Integration
| Variable | Value Source | Description |
|---|---|---|
| `NVIDIA_LLAMA_API_KEY` | NVIDIA NIM Portal | Llama 3.3 API Key |
| `OPENAI_API_KEY` | OpenAI Platform | Whisper (Audio) Key |

### Authentication & Security
| Variable | Value Source | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production Domain | e.g. `https://lawai.ragspro.com` |
| `CSRF_SECRET` | Generate (`openssl rand -hex 32`) | 32-char hex string |
| `JWT_SECRET` | Generate (`openssl rand -hex 32`) | 32-char hex string |

### Payments (Optional)
| Variable | Value Source | Description |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard | Public Key |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard | Secret Key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard | Webhook Secret |

---

## 2. Database Migration (Production)

Running migrations on Vercel requires enabling the build command override or running remotely.

**Recommended Method (Remote):**
Run this from your local machine, pointing to the *production* database URL.

```bash
# 1. Update .env to point to production DB
# 2. Run migration
npx prisma migrate deploy
```

**Alternative (Vercel Build Command):**
Update "Build Command" in Vercel settings to:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

---

## 3. Post-Deployment Configuration

### A. Google OAuth Redirects
1. Go to **Google Cloud Console** > Credentials.
2. Add Authorized Redirect URI:
   ```
   https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback
   ```
   *(Note: It points to Supabase, NOT your Vercel domain)*

### B. Supabase Auth Settings
1. Go to **Supabase Dashboard** > Authentication > URL Configuration.
2. Set **Site URL** to: `https://lawai.ragspro.com`
3. Add to **Redirect URLs**:
   ```
   https://lawai.ragspro.com/**
   https://lawai.ragspro.com/api/auth/callback
   ```

### C. Webhooks
1. **Razorpay**: Add webhook for `order.paid` events pointing to:
   `https://lawai.ragspro.com/api/payments/webhook`

---

## 4. Verification & Testing

After deployment, verify key flows:

1.  **Health Check**: Visit `/` (Homepage).
2.  **Auth**: Sign up with a new email + Google Login.
3.  **AI Test**: Visit `/ai-assistant` and ask "What is Section 302 IPC?".
4.  **RAG Pipeline**: Upload a PDF to `/document-analysis` and query it.
5.  **Admin Access**: Visit `/admin` (should redirect to login/access denied).

---

## 5. Troubleshooting Common Issues

| Issue | Solution |
|---|---|
| **504 Gateway Timeout** | Vercel Hobby plan has 10s timeout. Upgrade to Pro or optimize API. |
| **Auth Redirect Loop** | Check Supabase "Site URL" setting. Ensure no trailing slash inconsistencies. |
| **Vector Search Fails** | Ensure `pgvector` extension is enabled in Supabase (`create extension vector;`). |
| **Hydration Error** | Clear browser cache/cookies. Check for browser extensions interfering. |
| **"Invalid API Key"** | Redeploy Vercel project after updating Environment Variables. |

---

## 📞 Support

For enterprise support or deployment assistance, contact:
**Raghav Shah** - [raghavshahhh@gmail.com](mailto:raghavshahhh@gmail.com)