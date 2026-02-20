# Contract Risk Analyzer - Design Document

**Feature**: contract-analyzer-monetization  
**Date**: February 20, 2026  
**Status**: Design Phase  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /contract-analyzer (Landing Page)                         │
│  ├── Hero section                                          │
│  ├── File upload component                                 │
│  ├── Risk analysis results                                 │
│  ├── CTA to sign up                                        │
│  └── Pricing table                                         │
│                                                             │
│  /admin/dashboard (Analytics)                              │
│  ├── Key metrics cards                                     │
│  ├── Charts (Recharts)                                     │
│  ├── Heatmap                                               │
│  └── Real-time updates                                     │
│                                                             │
│  /pricing (Pricing Page)                                   │
│  ├── Three pricing cards                                   │
│  ├── Feature comparison                                    │
│  ├── CTA buttons                                           │
│  └── FAQ section                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (API Routes)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/contract-analyzer                               │
│  ├── Input: Contract text/file                             │
│  ├── Process: Risk scoring                                 │
│  ├── Output: Risk score, flags, suggestions                │
│  └── Rate limit: 5/day (free), unlimited (pro)             │
│                                                             │
│  GET /api/admin/analytics                                  │
│  ├── Query: Dashboard metrics                              │
│  ├── Auth: Admin only                                      │
│  └── Output: Metrics JSON                                  │
│                                                             │
│  POST /api/subscription                                    │
│  ├── Input: User ID, tier                                  │
│  ├── Process: Stripe integration                           │
│  └── Output: Subscription created                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AnalyticsEvent                                            │
│  ├── id, userId, eventType, metadata, createdAt           │
│  └── Indexes: userId, eventType, createdAt                │
│                                                             │
│  QueryLog                                                  │
│  ├── id, userId, contractType, riskScore, analysisTime    │
│  └── Indexes: userId, contractType, createdAt             │
│                                                             │
│  Subscription                                              │
│  ├── id, userId, tier, status, queriesUsed, queriesLimit  │
│  └── Indexes: userId, tier                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. Contract Analyzer Page (`/contract-analyzer`)

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Hero Section                             │
│  "Contract Risk Analyzer"                                   │
│  "Analyze your contract in 3 seconds"                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Upload PDF or Paste Text]                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Risk Score: 68%                                     │   │
│  │ ████████░░ Moderate-High                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔴 Red Flags: 3                                            │
│  🟡 Warnings: 2                                             │
│  🟢 Good: 5                                                 │
│                                                             │
│  Red Flag Clauses:                                          │
│  1. Broad indemnity clause (Section 5.2)                   │
│     → You're liable for everything                         │
│     → Suggest: Cap at 1x contract value                    │
│                                                             │
│  [Download PDF] [Share] [Sign Up]                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pricing Table                                       │   │
│  │ Free | Pro ($29/mo) | Enterprise                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- `FileUpload.tsx` - Upload PDF or paste text
- `RiskMeter.tsx` - Visual risk score display
- `RiskReport.tsx` - Red flags and suggestions
- `PricingTable.tsx` - Pricing options

### 2. Admin Dashboard (`/admin/dashboard`)

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Total Queries: 1,247    Queries Today: 89 ↑ 12%           │
│  Active Users: 234       Conversion: 12.3%                 │
│  Revenue (MRR): $4,560   Growth: 23% MoM                   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Queries per Day      │  │ Revenue Trend        │        │
│  │ [Line Chart]         │  │ [Line Chart]         │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Legal Domain Heatmap │  │ Error Rate: 0.2%     │        │
│  │ Employment: 34%      │  │ Avg Analysis: 2.1s   │        │
│  │ NDAs: 28%            │  │ User Retention: 78%  │        │
│  │ Service Agr: 22%     │  │                      │        │
│  │ Licensing: 16%       │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- `MetricsCard.tsx` - Key metric display
- `AnalyticsChart.tsx` - Line charts
- `HeatmapChart.tsx` - Domain distribution

### 3. Pricing Page (`/pricing`)

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Pricing Plans                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ FREE         │  │ PRO ⭐       │  │ ENTERPRISE   │     │
│  │              │  │              │  │              │     │
│  │ $0/month     │  │ $29/month    │  │ Custom       │     │
│  │              │  │              │  │              │     │
│  │ 5 queries/d  │  │ Unlimited    │  │ Unlimited    │     │
│  │ Basic score  │  │ Advanced     │  │ Advanced     │     │
│  │ No PDF       │  │ PDF download │  │ PDF download │     │
│  │ Community    │  │ Email support│  │ Dedicated    │     │
│  │              │  │ API access   │  │ SLA          │     │
│  │              │  │              │  │              │     │
│  │ [Get Started]│  │ [Start Free] │  │ [Contact]    │     │
│  │              │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  FAQ Section                                               │
│  Q: Can I upgrade anytime?                                 │
│  A: Yes, upgrade anytime and only pay for remaining days   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- `PricingCard.tsx` - Individual pricing card
- `FeatureComparison.tsx` - Feature matrix
- `FAQ.tsx` - FAQ section

---

## Risk Scoring Algorithm

### Input
- Contract text (PDF or pasted)
- Contract type (employment, NDA, service agreement, etc.)

### Processing

**Step 1: Rule-Based Detection**
```
Rules:
- Unlimited liability → Red flag (weight: 0.3)
- Broad indemnity → Red flag (weight: 0.25)
- One-sided termination → Red flag (weight: 0.2)
- No liability cap → Red flag (weight: 0.15)
- Restrictive non-compete → Warning (weight: 0.1)
```

**Step 2: AI Structured Output**
```
Use NVIDIA Llama to:
1. Extract key clauses
2. Identify risks
3. Suggest revisions
4. Calculate confidence score
```

**Step 3: Risk Score Calculation**
```
Risk Score = (Red Flags × 0.3 + Warnings × 0.15 + Good Clauses × -0.05) × 100
Range: 0-100%
- 0-30%: Green (Low Risk)
- 30-70%: Yellow (Moderate Risk)
- 70-100%: Red (High Risk)
```

### Output Format
```json
{
  "overallRisk": 68,
  "riskLevel": "Moderate-High",
  "confidence": 94,
  "analysisTime": 2.3,
  "redFlags": [
    {
      "clause": "Broad indemnity clause",
      "section": "5.2",
      "issue": "You're liable for everything",
      "suggestion": "Cap at 1x contract value"
    }
  ],
  "warnings": [
    {
      "clause": "One-sided termination",
      "section": "8.1",
      "issue": "They can exit anytime, you can't",
      "suggestion": "Add 30-day notice requirement"
    }
  ],
  "suggestedRevisions": [
    "Add liability cap: 'Liability limited to contract value'",
    "Add mutual termination: 'Either party may terminate with 30 days notice'",
    "Add indemnity cap: 'Indemnity capped at 1x annual fees'"
  ]
}
```

---

## Data Flow

### Contract Analysis Flow
```
User uploads contract
    ↓
Check subscription tier
    ↓
Check daily query limit (if free)
    ↓
Extract text from PDF (if needed)
    ↓
Run risk scoring algorithm
    ↓
Log query to database
    ↓
Return risk analysis
    ↓
Display results to user
    ↓
Show upgrade CTA (if free tier)
```

### Analytics Flow
```
User performs action (analyze, signup, convert)
    ↓
Log event to AnalyticsEvent table
    ↓
Log query details to QueryLog table
    ↓
Admin dashboard queries tables
    ↓
Calculate metrics (total, daily, conversion rate)
    ↓
Display on dashboard
```

---

## Database Queries

### Get Daily Query Count
```sql
SELECT COUNT(*) as count
FROM QueryLog
WHERE DATE(createdAt) = CURRENT_DATE
```

### Get Conversion Rate
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN tier = 'pro' THEN userId END) as pro_users,
  COUNT(DISTINCT userId) as total_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN tier = 'pro' THEN userId END) / 
    COUNT(DISTINCT userId), 2) as conversion_rate
FROM Subscription
```

### Get Legal Domain Distribution
```sql
SELECT contractType, COUNT(*) as count
FROM QueryLog
WHERE DATE(createdAt) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY contractType
ORDER BY count DESC
```

---

## Correctness Properties

### Property 1: Risk Score Bounds
**Validates**: Requirements 1.1  
**Property**: Risk score is always between 0 and 100
```
For all contracts: 0 ≤ riskScore ≤ 100
```

### Property 2: Query Limit Enforcement
**Validates**: Requirements 2.1  
**Property**: Free tier users cannot exceed 5 queries per day
```
For all free tier users: queriesUsed ≤ 5 per day
```

### Property 3: Subscription Tier Consistency
**Validates**: Requirements 2.2  
**Property**: Subscription tier matches query limit
```
If tier = 'free' then queriesLimit = 5
If tier = 'pro' then queriesLimit = unlimited
```

### Property 4: Analytics Data Accuracy
**Validates**: Requirements 3.1  
**Property**: Analytics metrics match database records
```
dashboard.totalQueries = COUNT(QueryLog)
dashboard.dailyQueries = COUNT(QueryLog WHERE DATE = today)
```

### Property 5: PDF Download Authorization
**Validates**: Requirements 2.3  
**Property**: Only pro tier users can download PDFs
```
If tier = 'free' then canDownloadPDF = false
If tier = 'pro' then canDownloadPDF = true
```

---

## File Structure

```
src/
├── app/
│   ├── contract-analyzer/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   └── api/
│       ├── contract-analyzer/
│       │   └── route.ts
│       ├── admin/
│       │   └── analytics/
│       │       └── route.ts
│       └── subscription/
│           └── route.ts
├── lib/
│   ├── contract-risk-analyzer.ts
│   ├── analytics-service.ts
│   └── subscription-service.ts
└── components/
    ├── contract-analyzer/
    │   ├── RiskMeter.tsx
    │   ├── RiskReport.tsx
    │   └── FileUpload.tsx
    ├── admin/
    │   ├── AnalyticsChart.tsx
    │   ├── HeatmapChart.tsx
    │   └── MetricsCard.tsx
    └── pricing/
        ├── PricingCard.tsx
        ├── FeatureComparison.tsx
        └── FAQ.tsx
```

---

## Implementation Notes

1. **Risk Scoring**: Keep it simple - rule-based + AI structured output
2. **UI/UX**: Focus on perception = premium (sexy UI with risk meter, colors)
3. **Performance**: Analysis should complete in <3 seconds
4. **Scalability**: Use database indexes for fast queries
5. **Security**: Protect admin dashboard with authentication
6. **Monitoring**: Track error rates and analysis times

