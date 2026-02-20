# LAW.AI - Next Phase Instructions

**Current Status**: Phase 1 Complete ✅  
**Next**: Phase 2 - Admin Analytics Dashboard  
**Timeline**: Day 2 of 5  

---

## Quick Start for Phase 2

### Step 1: Start Dev Server
```bash
npm run dev
# Server runs on http://localhost:3001
```

### Step 2: Create Admin Dashboard Page
Create `src/app/admin/dashboard/page.tsx` with:
- Authentication check (admin only)
- Key metrics cards (Total queries, daily queries, active users, conversion rate, MRR, growth)
- Charts for queries per day and revenue trend
- Heatmap for legal domain distribution
- Real-time updates every 30 seconds

### Step 3: Create Components

**MetricsCard.tsx**
- Display metric name, value, trend (up/down), percentage change
- Color coding (green for up, red for down)
- Responsive layout

**AnalyticsChart.tsx**
- Use Recharts library
- Line charts for time series data
- Legend and tooltips
- Date range selector (7/30/90 days)

**HeatmapChart.tsx**
- Display legal domain distribution
- Show percentages for each domain
- Color intensity based on percentage
- Domains: Employment, NDAs, Service Agreements, Licensing, Other

### Step 4: Create Analytics Service
Create `src/lib/analytics-service.ts` with functions:
- `getTotalQueries()` - Count from QueryLog
- `getDailyQueries()` - Count for today
- `getActiveUsers()` - Count distinct users
- `getConversionRate()` - Pro users / Total users
- `getMRR()` - Monthly recurring revenue
- `getGrowthRate()` - Compare to previous month
- `getLegalDomainDistribution()` - Group by contractType

### Step 5: Create Admin API Endpoint
Create `src/app/api/admin/analytics/route.ts` with:
- GET request handler
- Admin authentication check
- Call analytics service
- Return metrics JSON
- Add 5-minute caching
- Error handling

### Step 6: Update Database Schema
Update `prisma/schema.prisma` to add:
```prisma
model AnalyticsEvent {
  id String @id @default(cuid())
  userId String
  eventType String
  metadata Json
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}

model QueryLog {
  id String @id @default(cuid())
  userId String
  contractType String
  riskScore Int
  analysisTime Int
  redFlagCount Int
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([contractType])
  @@index([createdAt])
}

model Subscription {
  id String @id @default(cuid())
  userId String @unique
  tier String
  status String
  queriesUsed Int @default(0)
  queriesLimit Int
  stripeCustomerId String?
  stripeSubscriptionId String?
  createdAt DateTime @default(now())
  expiresAt DateTime?
  @@index([userId])
  @@index([tier])
}
```

Then run:
```bash
npx prisma migrate dev --name add_analytics_schema
```

### Step 7: Add Event Tracking
Update `src/app/api/contract-analyzer/route.ts` to log events:
```typescript
// After successful analysis
await prisma.queryLog.create({
  data: {
    userId: user.id,
    contractType: contractType,
    riskScore: analysis.overallRisk,
    analysisTime: analysisTime,
    redFlagCount: analysis.redFlags.length,
  }
})

await prisma.analyticsEvent.create({
  data: {
    userId: user.id,
    eventType: 'contract_analyzed',
    metadata: {
      contractType,
      riskScore: analysis.overallRisk,
      analysisTime,
    }
  }
})
```

### Step 8: Test Locally
```bash
# Visit admin dashboard
http://localhost:3001/admin/dashboard

# Should show:
- Key metrics cards
- Charts with sample data
- Heatmap with domain distribution
- Real-time updates
```

---

## Phase 3 - Monetization Tiers (Day 3)

### Tasks
1. Create subscription service (`src/lib/subscription-service.ts`)
2. Create subscription API endpoint (`src/app/api/subscription/route.ts`)
3. Integrate Stripe API
4. Add query limit enforcement
5. Add paywall logic
6. Create webhook handler for Stripe events

### Key Files
- `src/lib/subscription-service.ts` - Subscription logic
- `src/app/api/subscription/route.ts` - Subscription API
- Update `src/app/api/contract-analyzer/route.ts` - Add rate limiting

---

## Phase 4 - Polish & Testing (Day 4)

### Tasks
1. Review all pages for design consistency
2. Ensure responsive design on all devices
3. Add animations and transitions
4. Optimize images and assets
5. Test accessibility (WCAG)
6. Test performance (Lighthouse)

---

## Phase 5 - Deployment & Monitoring (Day 5)

### Tasks
1. Commit all changes to GitHub
2. Push to main branch
3. Verify Vercel deployment
4. Test deployed pages
5. Setup error tracking (Sentry)
6. Setup performance monitoring
7. Setup analytics tracking
8. Create documentation

---

## UI/UX Improvements for Existing Features

### Features to Enhance
1. Voice Lawyer - Add back button, animations
2. Drafts - Add back button, animations, loading states
3. Summarizer - Add back button, animations
4. Case Tracker - Add back button, animations
5. CRM - Add back button, animations
6. News - Add back button, animations
7. Acts - Add back button, animations
8. Notices - Add back button, animations
9. Research - Add back button, animations

### For Each Feature
- [ ] Add back button (ArrowLeft icon)
- [ ] Add fade-in animation on page load
- [ ] Add slide-up animation for cards
- [ ] Add loading states with spinners
- [ ] Add error handling with toast
- [ ] Ensure mobile responsive
- [ ] Add visual feedback on interactions
- [ ] Consistent styling with design system

---

## Testing Checklist

### Phase 2 Testing
- [ ] Admin dashboard loads
- [ ] Metrics display correctly
- [ ] Charts render with data
- [ ] Heatmap displays domains
- [ ] Real-time updates work
- [ ] Admin authentication works
- [ ] Non-admin users redirected
- [ ] Mobile responsive

### Phase 3 Testing
- [ ] Free tier: 5 queries/day limit
- [ ] Pro tier: unlimited queries
- [ ] Upgrade flow works
- [ ] Stripe integration works
- [ ] Query limit enforcement works
- [ ] Paywall displays correctly
- [ ] Mobile responsive

### Phase 4 Testing
- [ ] All pages load quickly
- [ ] Animations smooth
- [ ] No console errors
- [ ] Accessibility score good
- [ ] Lighthouse score >90
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### Phase 5 Testing
- [ ] Deployment successful
- [ ] All pages accessible
- [ ] No errors in production
- [ ] Performance good
- [ ] Monitoring working
- [ ] Analytics tracking

---

## Deployment Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Commit and push
git add .
git commit -m "feat: Add Phase 2 - Admin Analytics Dashboard"
git push origin main

# Vercel auto-deploys on push to main
```

---

## Important Notes

1. **Database**: Make sure to run migrations before testing
2. **Authentication**: Admin dashboard requires user to be authenticated as admin
3. **Stripe**: Get test keys from Stripe dashboard
4. **Environment Variables**: Add Stripe keys to `.env.local`
5. **Testing**: Use test data for development

---

## Support

If you get stuck:
1. Check the spec at `.kiro/specs/contract-analyzer-monetization/tasks.md`
2. Review the design document at `.kiro/specs/contract-analyzer-monetization/design.md`
3. Check Phase 1 implementation for reference
4. Test API endpoints with curl

---

## Success Criteria

### Phase 2 Complete When
- ✅ Admin dashboard page created
- ✅ All metrics cards display
- ✅ Charts render correctly
- ✅ Heatmap shows domain distribution
- ✅ Real-time updates work
- ✅ Admin authentication works
- ✅ Mobile responsive
- ✅ Local testing passed

### Phase 3 Complete When
- ✅ Subscription system works
- ✅ Stripe integration works
- ✅ Query limits enforced
- ✅ Paywall displays
- ✅ Upgrade flow works
- ✅ Local testing passed

### Phase 4 Complete When
- ✅ All pages polished
- ✅ Animations smooth
- ✅ Performance good
- ✅ Accessibility good
- ✅ Mobile responsive

### Phase 5 Complete When
- ✅ Deployed to Vercel
- ✅ All tests passing
- ✅ Monitoring setup
- ✅ Documentation complete
- ✅ Ready for investor demo

---

**Ready to start Phase 2?** Run `npm run dev` and begin implementing the admin dashboard!

