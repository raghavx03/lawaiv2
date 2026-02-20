# Contract Risk Analyzer - Monetization Feature Spec

**Feature Name**: contract-analyzer-monetization  
**Date**: February 20, 2026  
**Status**: In Progress  
**Priority**: P0 - Investor-Critical  

---

## Overview

Build a standalone contract risk analyzer landing page with monetization tiers to attract investors and generate revenue. This is a focused, viral-ready feature that demonstrates clear market traction.

---

## User Stories

### 1. Free User - Analyze Contract (5 queries/day limit)

**As a** founder or lawyer  
**I want to** upload a contract and get instant risk analysis  
**So that** I can understand contract risks before signing

**Acceptance Criteria**:
- User can upload PDF or paste contract text
- Analysis completes in <3 seconds
- Risk score displayed as percentage (0-100%)
- Red flags highlighted with specific clauses
- Suggested revisions provided
- Free tier limited to 5 queries/day
- After 5 queries, user sees upgrade CTA

**Details**:
- Risk scoring: Rule-based + AI structured output
- Output format: Overall Risk %, Red Flag Clauses, Suggested Revisions, Confidence Score
- Visual: Risk meter bar with color coding (Green <30%, Yellow 30-70%, Red >70%)
- No PDF download for free tier

### 2. Pro User - Unlimited Analysis + PDF Download

**As a** lawyer or law firm  
**I want to** analyze unlimited contracts and download reports as PDF  
**So that** I can share analysis with clients and build my practice

**Acceptance Criteria**:
- Pro tier: $29/month
- Unlimited queries (no daily limit)
- PDF download with full analysis
- Email support
- API access for integrations
- Conversion from free to pro shows clear value

**Details**:
- PDF includes: Risk score, red flags, suggested revisions, confidence score
- Email support: Response within 24 hours
- API: Rate limited to 100 requests/minute

### 3. Admin - View Analytics Dashboard

**As an** admin/founder  
**I want to** see analytics about contract analyses  
**So that** I can demonstrate traction to investors

**Acceptance Criteria**:
- Dashboard shows: Total queries, daily queries, active users, conversion rate
- Revenue metrics: MRR, growth rate
- Legal domain heatmap (Employment, NDAs, Service Agreements, Licensing)
- Charts: Queries per day, revenue trend, error rate, analysis time
- Real-time updates
- Protected by admin authentication

**Details**:
- Metrics tracked: Query count, user ID, contract type, risk score, analysis time
- Heatmap shows distribution of contract types analyzed
- Charts use Recharts library
- Data stored in PostgreSQL via Prisma

### 4. Pricing Page - Show Monetization Tiers

**As a** visitor  
**I want to** see pricing options clearly  
**So that** I can choose the right plan

**Acceptance Criteria**:
- Three tiers displayed: Free, Pro, Enterprise
- Free: 5 queries/day, basic scoring, no PDF
- Pro: $29/month, unlimited, PDF, email support, API
- Enterprise: Custom pricing, dedicated support, SLA
- Clear CTA buttons for each tier
- FAQ section addressing common questions

**Details**:
- Pricing page at `/pricing`
- Stripe integration for Pro tier payments
- Enterprise: Contact sales form

---

## Technical Requirements

### Database Schema

```prisma
model AnalyticsEvent {
  id String @id @default(cuid())
  userId String
  eventType String // "contract_analyzed", "user_signup", "conversion", etc.
  metadata Json
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}

model QueryLog {
  id String @id @default(cuid())
  userId String
  contractType String // "employment", "nda", "service_agreement", etc.
  riskScore Int // 0-100
  analysisTime Int // milliseconds
  redFlagCount Int
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([contractType])
  @@index([createdAt])
}

model Subscription {
  id String @id @default(cuid())
  userId String @unique
  tier String // "free", "pro", "enterprise"
  status String // "active", "cancelled", "expired"
  queriesUsed Int @default(0)
  queriesLimit Int // 5 for free, unlimited for pro
  stripeCustomerId String?
  stripeSubscriptionId String?
  createdAt DateTime @default(now())
  expiresAt DateTime?
  
  @@index([userId])
  @@index([tier])
}
```

### API Endpoints

1. **POST /api/contract-analyzer**
   - Input: Contract text or file
   - Output: Risk score, red flags, suggestions, confidence
   - Rate limit: 5/day for free, unlimited for pro

2. **GET /api/admin/analytics**
   - Output: Dashboard metrics
   - Protected: Admin only

3. **POST /api/subscription**
   - Input: User ID, tier
   - Output: Subscription created
   - Integrates with Stripe

### Frontend Components

1. **Contract Analyzer Page** (`/contract-analyzer`)
   - File upload component
   - Text input area
   - Risk meter visualization
   - Red flags display
   - Suggested revisions
   - Download PDF button (pro only)
   - Sign up CTA

2. **Admin Dashboard** (`/admin/dashboard`)
   - Key metrics cards
   - Charts (Recharts)
   - Heatmap
   - Real-time updates

3. **Pricing Page** (`/pricing`)
   - Three pricing cards
   - Feature comparison
   - CTA buttons
   - FAQ section

---

## Success Metrics

### Week 1
- 100+ contracts analyzed
- 50+ signups
- 5+ Pro conversions
- $145 MRR

### Month 1
- 5,000+ contracts analyzed
- 500+ signups
- 50+ Pro subscribers
- $1,450 MRR

### Quarter 1
- 50,000+ contracts analyzed
- 5,000+ signups
- 500+ Pro subscribers
- $14,500 MRR

---

## Implementation Timeline

**Day 1**: Contract Analyzer Landing Page
- Create `/contract-analyzer` page
- File upload component
- Risk scoring logic
- Risk meter visualization
- API endpoint

**Day 2**: Admin Dashboard
- Create `/admin/dashboard` page
- Analytics tracking
- Charts and heatmap
- Database schema

**Day 3**: Monetization
- Create `/pricing` page
- Subscription logic
- Stripe integration
- Query limit enforcement

---

## Investor Pitch Points

1. **Clear Problem**: Founders sign contracts without understanding them. Lawyers cost $300-500/hour.

2. **Clear Solution**: AI-powered risk scoring in 3 seconds.

3. **Clear Market**: 50M+ startups globally, 10M+ contracts signed yearly, $300B legal tech market.

4. **Clear Monetization**: 
   - Free: 5 queries/day (user acquisition)
   - Pro: $29/month unlimited (revenue)
   - Enterprise: Custom pricing (high-value deals)

5. **Clear Traction** (from dashboard):
   - Query volume
   - Active users
   - Conversion rate
   - MRR
   - Growth rate

---

## Notes

- Keep UI sharp and focused (not diluted)
- Risk scoring should be simple rule-based + AI structured output
- Perception = premium (sexy UI with risk meter, colors, confidence scores)
- Separate landing page (not integrated into main app) for viral potential
- All features must be production-ready for investor demo

