# Contract Risk Analyzer - Implementation Tasks

**Feature**: contract-analyzer-monetization  
**Date**: February 20, 2026  
**Timeline**: 3 days  

---

## Day 1: Contract Analyzer Landing Page

### 1.1 Create Contract Analyzer Landing Page
- [ ] Create `src/app/contract-analyzer/page.tsx`
- [ ] Create `src/app/contract-analyzer/layout.tsx`
- [ ] Add hero section with title and description
- [ ] Add file upload component
- [ ] Add text input area for pasting contracts
- [ ] Add risk analysis results display area
- [ ] Add pricing table at bottom
- [ ] Style with TailwindCSS for premium look

**Details**:
- Hero: "Contract Risk Analyzer" + "Analyze your contract in 3 seconds"
- Upload: Accept PDF files and text input
- Results: Show risk meter, red flags, suggestions
- Pricing: Show Free/Pro/Enterprise options
- CTA: "Sign Up" button for free tier users

### 1.2 Create File Upload Component
- [ ] Create `src/components/contract-analyzer/FileUpload.tsx`
- [ ] Support PDF file upload
- [ ] Support text paste
- [ ] Show file preview
- [ ] Add drag-and-drop support
- [ ] Validate file size (max 10MB)
- [ ] Show loading state during upload

**Details**:
- Accept: PDF files and plain text
- Max size: 10MB
- Drag-and-drop: Yes
- Preview: Show file name and size

### 1.3 Create Risk Meter Component
- [ ] Create `src/components/contract-analyzer/RiskMeter.tsx`
- [ ] Display risk score as percentage (0-100%)
- [ ] Show color-coded bar (Green/Yellow/Red)
- [ ] Display risk level text (Low/Moderate/High)
- [ ] Show confidence score
- [ ] Show analysis time

**Details**:
- Green: 0-30% (Low Risk)
- Yellow: 30-70% (Moderate Risk)
- Red: 70-100% (High Risk)
- Confidence: 0-100%
- Animation: Smooth bar fill

### 1.4 Create Risk Report Component
- [ ] Create `src/components/contract-analyzer/RiskReport.tsx`
- [ ] Display red flags with clause references
- [ ] Display warnings
- [ ] Display good clauses
- [ ] Show suggested revisions
- [ ] Add "Download PDF" button (pro only)
- [ ] Add "Share" button
- [ ] Add "Sign Up" CTA

**Details**:
- Red flags: Show clause, section, issue, suggestion
- Warnings: Show clause, section, issue, suggestion
- Good clauses: Show positive findings
- Revisions: List suggested changes
- PDF: Only for pro tier
- Share: Copy link to clipboard

### 1.5 Enhance Risk Scoring Logic
- [ ] Update `src/lib/contract-risk-analyzer.ts`
- [ ] Implement rule-based detection
- [ ] Integrate NVIDIA Llama for AI analysis
- [ ] Calculate risk score (0-100%)
- [ ] Extract red flags and suggestions
- [ ] Calculate confidence score
- [ ] Return structured output

**Details**:
- Rules: Unlimited liability, broad indemnity, one-sided termination, etc.
- AI: Use Llama to extract clauses and suggest revisions
- Score: Weighted calculation based on flags
- Confidence: Based on AI model confidence
- Output: JSON with all analysis details

### 1.6 Create Contract Analyzer API Endpoint
- [ ] Create `src/app/api/contract-analyzer/route.ts`
- [ ] Accept POST requests with contract text
- [ ] Check subscription tier
- [ ] Check daily query limit (5 for free)
- [ ] Call risk scoring function
- [ ] Log query to database
- [ ] Return risk analysis
- [ ] Handle errors gracefully

**Details**:
- Input: Contract text, user ID, contract type
- Auth: Check user subscription
- Rate limit: 5/day for free, unlimited for pro
- Logging: Store query in QueryLog table
- Output: Risk analysis JSON
- Errors: Return 400/401/429 as appropriate

### 1.7 Test Contract Analyzer Locally
- [ ] Test file upload with PDF
- [ ] Test text paste
- [ ] Test risk scoring
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Test UI responsiveness
- [ ] Test on mobile

**Details**:
- Upload: Test with sample contracts
- Scoring: Verify risk scores are accurate
- Rate limit: Verify 5 query limit for free tier
- Errors: Test with invalid inputs
- Mobile: Test on iPhone/Android

---

## Day 2: Admin Analytics Dashboard

### 2.1 Create Admin Dashboard Page
- [ ] Create `src/app/admin/dashboard/page.tsx`
- [ ] Add authentication check (admin only)
- [ ] Display key metrics cards
- [ ] Add charts for queries and revenue
- [ ] Add heatmap for legal domains
- [ ] Add real-time updates
- [ ] Style with TailwindCSS

**Details**:
- Metrics: Total queries, daily queries, active users, conversion rate, MRR, growth
- Charts: Queries per day, revenue trend
- Heatmap: Legal domain distribution
- Real-time: Update every 30 seconds
- Auth: Redirect non-admin users

### 2.2 Create Metrics Card Component
- [ ] Create `src/components/admin/MetricsCard.tsx`
- [ ] Display metric name and value
- [ ] Show trend (up/down arrow)
- [ ] Show percentage change
- [ ] Add color coding (green for up, red for down)
- [ ] Make responsive

**Details**:
- Layout: Icon + Name + Value + Trend
- Trend: Show % change from previous period
- Color: Green for positive, red for negative
- Responsive: Stack on mobile

### 2.3 Create Analytics Chart Component
- [ ] Create `src/components/admin/AnalyticsChart.tsx`
- [ ] Use Recharts library
- [ ] Display line chart for queries per day
- [ ] Display line chart for revenue trend
- [ ] Add legend and tooltips
- [ ] Make responsive
- [ ] Add date range selector

**Details**:
- Library: Recharts
- Charts: Line charts for time series
- Legend: Show series names
- Tooltips: Show values on hover
- Date range: Last 7/30/90 days
- Responsive: Adjust width on mobile

### 2.4 Create Heatmap Component
- [ ] Create `src/components/admin/HeatmapChart.tsx`
- [ ] Display legal domain distribution
- [ ] Show percentages for each domain
- [ ] Use color coding (intensity based on percentage)
- [ ] Add labels
- [ ] Make responsive

**Details**:
- Domains: Employment, NDAs, Service Agreements, Licensing, Other
- Colors: Intensity based on percentage
- Labels: Show domain name and percentage
- Responsive: Adjust layout on mobile

### 2.5 Create Analytics Service
- [ ] Create `src/lib/analytics-service.ts`
- [ ] Query total queries count
- [ ] Query daily queries count
- [ ] Query active users count
- [ ] Calculate conversion rate
- [ ] Calculate MRR
- [ ] Calculate growth rate
- [ ] Query legal domain distribution

**Details**:
- Queries: Count from QueryLog table
- Users: Count distinct userId from Subscription
- Conversion: Pro users / Total users
- MRR: Sum of monthly subscriptions
- Growth: Compare to previous month
- Domains: Group by contractType

### 2.6 Create Admin Analytics API Endpoint
- [ ] Create `src/app/api/admin/analytics/route.ts`
- [ ] Accept GET requests
- [ ] Check admin authentication
- [ ] Call analytics service
- [ ] Return metrics JSON
- [ ] Add caching (5 minute TTL)
- [ ] Handle errors

**Details**:
- Auth: Check if user is admin
- Metrics: Total, daily, users, conversion, MRR, growth, domains
- Caching: Cache for 5 minutes
- Errors: Return 401 if not admin, 500 if error

### 2.7 Add Database Schema
- [ ] Update `prisma/schema.prisma`
- [ ] Add AnalyticsEvent model
- [ ] Add QueryLog model
- [ ] Add Subscription model
- [ ] Add indexes for performance
- [ ] Run migration

**Details**:
- AnalyticsEvent: id, userId, eventType, metadata, createdAt
- QueryLog: id, userId, contractType, riskScore, analysisTime, createdAt
- Subscription: id, userId, tier, status, queriesUsed, queriesLimit, createdAt
- Indexes: userId, eventType, contractType, createdAt

### 2.8 Add Event Tracking
- [ ] Update contract analyzer API to log events
- [ ] Log "contract_analyzed" event
- [ ] Log "user_signup" event
- [ ] Log "conversion" event
- [ ] Store metadata (contract type, risk score, etc.)
- [ ] Test event logging

**Details**:
- Events: contract_analyzed, user_signup, conversion
- Metadata: Contract type, risk score, analysis time, user tier
- Logging: Store in AnalyticsEvent and QueryLog tables

### 2.9 Test Admin Dashboard Locally
- [ ] Test dashboard loads
- [ ] Test metrics display correctly
- [ ] Test charts render
- [ ] Test heatmap displays
- [ ] Test real-time updates
- [ ] Test admin authentication
- [ ] Test on mobile

**Details**:
- Load: Dashboard should load in <2 seconds
- Metrics: Verify calculations are correct
- Charts: Verify data is displayed correctly
- Heatmap: Verify domain distribution is correct
- Auth: Verify non-admin users are redirected
- Mobile: Test on iPhone/Android

---

## Day 3: Monetization Tiers

### 3.1 Create Pricing Page
- [ ] Create `src/app/pricing/page.tsx`
- [ ] Display three pricing cards (Free, Pro, Enterprise)
- [ ] Show features for each tier
- [ ] Add CTA buttons
- [ ] Add FAQ section
- [ ] Style with TailwindCSS
- [ ] Make responsive

**Details**:
- Cards: Free ($0), Pro ($29/month), Enterprise (custom)
- Features: Show feature matrix
- CTA: "Get Started", "Start Free Trial", "Contact Sales"
- FAQ: 5-10 common questions
- Responsive: Stack on mobile

### 3.2 Create Pricing Card Component
- [ ] Create `src/components/pricing/PricingCard.tsx`
- [ ] Display tier name and price
- [ ] List features with checkmarks
- [ ] Add CTA button
- [ ] Highlight recommended tier (Pro)
- [ ] Make responsive

**Details**:
- Layout: Name + Price + Features + CTA
- Features: Show with checkmarks
- Highlight: Pro tier has special styling
- CTA: Different text for each tier
- Responsive: Adjust width on mobile

### 3.3 Create Feature Comparison Component
- [ ] Create `src/components/pricing/FeatureComparison.tsx`
- [ ] Display feature matrix (Free vs Pro vs Enterprise)
- [ ] Show checkmarks for included features
- [ ] Show X for excluded features
- [ ] Make responsive
- [ ] Add feature descriptions

**Details**:
- Features: Queries/day, PDF download, email support, API, etc.
- Matrix: Show all tiers side by side
- Icons: Checkmark for yes, X for no
- Descriptions: Tooltip on hover
- Responsive: Scroll horizontally on mobile

### 3.4 Create FAQ Component
- [ ] Create `src/components/pricing/FAQ.tsx`
- [ ] Display 5-10 FAQ items
- [ ] Add accordion expand/collapse
- [ ] Show question and answer
- [ ] Make responsive
- [ ] Add search functionality

**Details**:
- Questions: Billing, features, support, etc.
- Accordion: Click to expand/collapse
- Search: Filter by keyword
- Responsive: Full width on mobile

### 3.5 Create Subscription Service
- [ ] Create `src/lib/subscription-service.ts`
- [ ] Create subscription for user
- [ ] Update subscription tier
- [ ] Check query limit
- [ ] Increment query count
- [ ] Reset daily query count
- [ ] Handle subscription expiration

**Details**:
- Create: Insert new subscription record
- Update: Change tier or status
- Check limit: Verify user hasn't exceeded daily limit
- Increment: Add 1 to queriesUsed
- Reset: Reset queriesUsed at midnight
- Expiration: Check if subscription is expired

### 3.6 Create Subscription API Endpoint
- [ ] Create `src/app/api/subscription/route.ts`
- [ ] Accept POST requests
- [ ] Create subscription for user
- [ ] Integrate with Stripe
- [ ] Return subscription details
- [ ] Handle errors
- [ ] Add webhook for Stripe events

**Details**:
- Input: User ID, tier
- Stripe: Create customer and subscription
- Output: Subscription ID, status, expiration
- Errors: Handle invalid tier, Stripe errors
- Webhook: Handle subscription.updated, subscription.deleted

### 3.7 Add Query Limit Enforcement
- [ ] Update contract analyzer API
- [ ] Check subscription tier
- [ ] Check daily query limit
- [ ] Return 429 if limit exceeded
- [ ] Show upgrade CTA in response
- [ ] Log limit exceeded event

**Details**:
- Check: Query subscription tier and queriesUsed
- Limit: 5 for free, unlimited for pro
- Response: Return 429 with upgrade message
- Logging: Track limit exceeded events

### 3.8 Add Paywall Logic
- [ ] Update contract analyzer page
- [ ] Show upgrade CTA after 5 free queries
- [ ] Show pricing modal
- [ ] Add "Upgrade to Pro" button
- [ ] Redirect to Stripe checkout
- [ ] Handle successful payment

**Details**:
- CTA: Show after 5 queries
- Modal: Display pricing options
- Stripe: Redirect to checkout
- Success: Redirect to dashboard after payment
- Error: Handle payment failures

### 3.9 Test Monetization Locally
- [ ] Test free tier (5 queries/day limit)
- [ ] Test pro tier (unlimited queries)
- [ ] Test upgrade flow
- [ ] Test Stripe integration
- [ ] Test query limit enforcement
- [ ] Test paywall display
- [ ] Test on mobile

**Details**:
- Free: Verify 5 query limit
- Pro: Verify unlimited queries
- Upgrade: Test upgrade flow
- Stripe: Test with test card
- Paywall: Verify displays after 5 queries
- Mobile: Test on iPhone/Android

---

## Day 4: Polish & Testing

### 4.1 Polish UI/UX
- [ ] Review all pages for design consistency
- [ ] Ensure responsive design on all devices
- [ ] Add animations and transitions
- [ ] Optimize images and assets
- [ ] Test accessibility (WCAG)
- [ ] Test performance (Lighthouse)

### 4.2 End-to-End Testing
- [ ] Test complete user flow (signup → analyze → upgrade)
- [ ] Test admin dashboard
- [ ] Test analytics tracking
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Test on different browsers

### 4.3 Performance Optimization
- [ ] Optimize API response times
- [ ] Add caching where appropriate
- [ ] Optimize database queries
- [ ] Minimize bundle size
- [ ] Test with production build

### 4.4 Security Review
- [ ] Check authentication on admin pages
- [ ] Verify rate limiting
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify Stripe integration security
- [ ] Test with security tools

---

## Day 5: Deployment & Monitoring

### 5.1 Deploy to Vercel
- [ ] Commit all changes to GitHub
- [ ] Push to main branch
- [ ] Verify Vercel deployment
- [ ] Test deployed pages
- [ ] Monitor for errors

### 5.2 Setup Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Setup performance monitoring
- [ ] Setup analytics tracking
- [ ] Setup alerts for errors
- [ ] Monitor Stripe webhooks

### 5.3 Create Documentation
- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Document deployment process
- [ ] Create user guide
- [ ] Create admin guide

---

## Success Criteria

### Functional
- ✅ Contract analyzer works end-to-end
- ✅ Risk scoring is accurate
- ✅ Admin dashboard displays correct metrics
- ✅ Pricing page shows all tiers
- ✅ Subscription system works
- ✅ Query limits are enforced
- ✅ PDF download works for pro tier

### Performance
- ✅ Contract analysis completes in <3 seconds
- ✅ Dashboard loads in <2 seconds
- ✅ API responses in <500ms
- ✅ Lighthouse score >90

### User Experience
- ✅ UI is clean and professional
- ✅ Mobile responsive
- ✅ Clear CTAs
- ✅ Error messages are helpful
- ✅ Upgrade flow is smooth

### Business
- ✅ Free tier limited to 5 queries/day
- ✅ Pro tier at $29/month
- ✅ Analytics dashboard shows traction
- ✅ Investor-ready demo

