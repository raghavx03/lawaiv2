# 🔍 LAW-AI Troubleshooting Guide

> **Diagnostic Manual** for common deployment and runtime issues.

---

## 1. Authentication Issues

### A. Redirect Loop / "Site URL Mismatch"
**Symptom:** After login, you are redirected back to login or get an error.
**Fix:**
1. Check **Supabase Dashboard** -> Authentication -> URL Configuration.
2. Ensure `Site URL` is exactly `https://lawai.ragspro.com` (no trailing slash).
3. Ensure `Redirect URLs` includes `https://lawai.ragspro.com/**`.

### B. "NextAuth.js Error" (Google Login)
**Symptom:** Google OAuth fails with a generic error.
**Fix:**
1. Check **Google Cloud Console** -> Credentials -> OAuth 2.0 Client.
2. Ensure "Authorized redirect URIs" matches `https://<PROJECT_REF>.supabase.co/auth/v1/callback`.
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars is correct.

---

## 2. Database & RAG Issues

### A. "Relation 'vector' does not exist"
**Symptom:** RAG pipeline fails or migration error.
**Fix:**
Run SQL in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
```

### B. "Prisma Client not initialized"
**Symptom:** API routes fail with 500 error.
**Fix:**
This usually happens in serverless environments. Ensure you are not importing `prisma` client inside a component. It must be a singleton in `src/lib/prisma.ts`.

---

## 3. Deployment Issues

### A. 504 Gateway Timeout (Vercel)
**Symptom:** AI takes too long to respond.
**Fix:**
- Use **Streaming API** (already implemented).
- If using non-streaming, upgrade Vercel to Pro (60s timeout vs 10s on Hobby).
- Optimize database queries.

### B. Build Failures "Type Error"
**Symptom:** `npm run build` fails on Vercel.
**Fix:**
- We enforce strict type checking. Run `npx tsc --noEmit` locally to find errors.
- Ensure all env vars are present in Vercel (missing vars can cause build failures if code relies on them at build time).

---

## 4. AI Service Issues

### A. "NVIDIA API Key Invalid"
**Symptom:** AI returns error or empty response.
**Fix:**
- Check `NVIDIA_LLAMA_API_KEY` in Vercel.
- The key must start with `nvapi-`.

### B. "Rate Limit Exceeded"
**Symptom:** 429 Error.
**Fix:**
- NVIDIA NIM has rate limits. Implement backoff or upgrade plan.
- Check user IP rate limiting in `middleware.ts`.

---

## 📞 Critical Support
If issues persist, contact the maintenance team:
**Raghav Shah** - [raghavshahhh@gmail.com](mailto:raghavshahhh@gmail.com)
