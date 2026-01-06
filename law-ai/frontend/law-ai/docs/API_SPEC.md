# LAW.AI API Spec

## Auth
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/magic-link
- POST /api/auth/logout

## User
- GET /api/user/me
- PATCH /api/user/profile

## Contracts
- CRUD endpoints for contracts, file upload, versioning

## AI
- POST /api/ai/contract-draft
- POST /api/ai/clause-check
- POST /api/ai/summarize
- POST /api/ai/voice-to-contract

## Payments
- POST /api/payment/checkout
- GET /api/payment/invoices

## Admin
- GET /api/admin/users
- PATCH /api/admin/user/:id/role

...and more. See code for details.
