# Contract Risk Analyzer - API Documentation

**Version**: 1.0.0  
**Last Updated**: February 20, 2026  
**Status**: Production Ready  

## Base URL

```
https://your-domain.com/api
```

## Authentication

All endpoints require authentication via Clerk. Include the user ID in the request header:

```
x-user-id: <user-id>
```

## Endpoints

### 1. Contract Analyzer

#### Analyze Contract
Analyzes a contract and returns risk assessment.

**Endpoint**: `POST /contract-analyzer`

**Request**:
```json
{
  "contractText": "string (required, min 50 chars)",
  "contractType": "string (optional)",
  "userId": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "overallRisk": 68,
  "riskLevel": "Moderate Risk",
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

**Error Responses**:
- `400 Bad Request`: Invalid contract text
  ```json
  {
    "error": "Contract text too short. Please provide at least 50 characters."
  }
  ```

- `429 Too Many Requests`: Query limit exceeded
  ```json
  {
    "error": "Daily query limit reached",
    "remaining": 0,
    "message": "Upgrade to Pro for unlimited access"
  }
  ```

- `500 Internal Server Error`: Server error
  ```json
  {
    "error": "Failed to analyze contract"
  }
  ```

**Rate Limits**:
- Free tier: 5 queries/day
- Pro tier: Unlimited
- Enterprise: Unlimited

**Example**:
```bash
curl -X POST https://your-domain.com/api/contract-analyzer \
  -H "Content-Type: application/json" \
  -d '{
    "contractText": "This is a sample contract...",
    "contractType": "employment",
    "userId": "user-123"
  }'
```

---

### 2. Admin Analytics

#### Get Analytics Metrics
Retrieves dashboard metrics for admin users.

**Endpoint**: `GET /admin/analytics`

**Authentication**: Admin only

**Response** (200 OK):
```json
{
  "totalQueries": 1247,
  "dailyQueries": 89,
  "activeUsers": 234,
  "conversionRate": 12.3,
  "mrr": 4560,
  "growthRate": 23,
  "domainDistribution": [
    {
      "domain": "Employment",
      "count": 423,
      "percentage": 34
    },
    {
      "domain": "NDAs",
      "count": 348,
      "percentage": 28
    },
    {
      "domain": "Service Agreements",
      "count": 274,
      "percentage": 22
    },
    {
      "domain": "Licensing",
      "count": 149,
      "percentage": 12
    },
    {
      "domain": "Other",
      "count": 53,
      "percentage": 4
    }
  ],
  "errorRate": 0.2,
  "avgAnalysisTime": 2.1,
  "userRetention": 78
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not admin user
- `500 Internal Server Error`: Server error

**Caching**: 5 minutes

**Example**:
```bash
curl -X GET https://your-domain.com/api/admin/analytics \
  -H "x-user-id: admin-user-123"
```

---

### 3. Subscription Management

#### Get Subscription
Retrieves current subscription details.

**Endpoint**: `GET /api/subscription`

**Response** (200 OK):
```json
{
  "id": "sub-123",
  "userId": "user-123",
  "tier": "free",
  "status": "active",
  "queriesUsed": 3,
  "queriesLimit": 5,
  "stripeCustomerId": null,
  "stripeSubscriptionId": null,
  "createdAt": "2026-02-20T10:00:00Z",
  "expiresAt": null,
  "lastResetAt": "2026-02-20T00:00:00Z"
}
```

#### Create/Update Subscription
Creates or updates a subscription.

**Endpoint**: `POST /api/subscription`

**Request**:
```json
{
  "userId": "string (required)",
  "tier": "free|pro|enterprise (required)",
  "stripeCustomerId": "string (optional)",
  "stripeSubscriptionId": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "id": "sub-456",
  "userId": "user-123",
  "tier": "pro",
  "status": "active",
  "queriesUsed": 0,
  "queriesLimit": 999999,
  "stripeCustomerId": "cus_123",
  "stripeSubscriptionId": "sub_123",
  "createdAt": "2026-02-20T10:00:00Z",
  "expiresAt": "2026-03-20T10:00:00Z",
  "lastResetAt": "2026-02-20T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid tier
  ```json
  {
    "error": "Invalid tier"
  }
  ```

- `401 Unauthorized`: User ID required
  ```json
  {
    "error": "User ID required"
  }
  ```

**Example**:
```bash
curl -X POST https://your-domain.com/api/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "tier": "pro",
    "stripeCustomerId": "cus_123",
    "stripeSubscriptionId": "sub_123"
  }'
```

---

## Data Models

### RiskAnalysis
```typescript
interface RiskAnalysis {
  overallRisk: number          // 0-100
  riskLevel: string            // "Low Risk", "Moderate Risk", "High Risk"
  confidence: number           // 0-100
  analysisTime: number         // seconds
  redFlags: RedFlag[]
  warnings: Warning[]
  suggestedRevisions: string[]
}

interface RedFlag {
  clause: string
  section: string
  issue: string
  suggestion: string
}

interface Warning {
  clause: string
  section: string
  issue: string
  suggestion: string
}
```

### Subscription
```typescript
interface Subscription {
  id: string
  userId: string
  tier: "free" | "pro" | "enterprise"
  status: "active" | "cancelled" | "expired"
  queriesUsed: number
  queriesLimit: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  expiresAt?: Date
  lastResetAt?: Date
}
```

### AnalyticsMetrics
```typescript
interface AnalyticsMetrics {
  totalQueries: number
  dailyQueries: number
  activeUsers: number
  conversionRate: number
  mrr: number
  growthRate: number
  domainDistribution: DomainCount[]
  errorRate: number
  avgAnalysisTime: number
  userRetention: number
}

interface DomainCount {
  domain: string
  count: number
  percentage: number
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-02-20T10:00:00Z"
}
```

### Common Error Codes
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

### Free Tier
- 5 queries per day
- Resets at midnight UTC
- Returns 429 when exceeded

### Pro Tier
- Unlimited queries
- No rate limiting

### Enterprise Tier
- Unlimited queries
- Custom rate limits available

---

## Pagination

Not yet implemented. All responses return complete data.

---

## Webhooks

### Stripe Webhooks (Coming Soon)
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## Best Practices

### Request Headers
```
Content-Type: application/json
x-user-id: <user-id>
Authorization: Bearer <token> (if applicable)
```

### Response Handling
```javascript
const response = await fetch('/api/contract-analyzer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({
    contractText: text,
    contractType: 'employment'
  })
})

if (!response.ok) {
  const error = await response.json()
  console.error('Error:', error.error)
  return
}

const data = await response.json()
console.log('Analysis:', data)
```

### Error Handling
```javascript
try {
  const response = await fetch('/api/contract-analyzer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractText })
  })

  if (response.status === 429) {
    // Show upgrade prompt
    showUpgradeModal()
  } else if (!response.ok) {
    // Handle other errors
    const error = await response.json()
    showError(error.error)
  } else {
    const data = await response.json()
    displayAnalysis(data)
  }
} catch (error) {
  console.error('Network error:', error)
  showError('Network error. Please try again.')
}
```

---

## SDK/Client Libraries

### JavaScript/TypeScript
```typescript
import { ContractAnalyzer } from '@law-ai/sdk'

const analyzer = new ContractAnalyzer({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
})

const result = await analyzer.analyze({
  contractText: 'Your contract text...',
  contractType: 'employment'
})

console.log(result.overallRisk) // 68
```

### Python
```python
from law_ai import ContractAnalyzer

analyzer = ContractAnalyzer(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

result = analyzer.analyze(
    contract_text='Your contract text...',
    contract_type='employment'
)

print(result['overall_risk'])  # 68
```

---

## Changelog

### v1.0.0 (2026-02-20)
- Initial release
- Contract analyzer endpoint
- Admin analytics endpoint
- Subscription management
- Query limit enforcement

---

## Support

For API support, contact:
- Email: api-support@law-ai.com
- Slack: #api-support
- GitHub: github.com/law-ai/issues

---

## License

API is available under the MIT License.
