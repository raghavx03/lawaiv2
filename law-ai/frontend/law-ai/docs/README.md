# LAW.AI

LAW.AI is a modern SaaS platform for lawyers and clients, featuring AI-powered legal tools, secure document workflows, and a beautiful 3D UI/UX.

## Features
- 3D Animated Landing Page (R3F + GSAP)
- OAuth + Magic Link Auth
- Stripe Billing + Invoicing
- Client & Lawyer Dashboards
- AI Contract Generator + Clause Checker
- Voice-to-Contract Assistant
- AI Summarizer for uploaded cases
- Secure Client Document Vault
- Document Version Control
- E-Signature
- Case Timeline Tracker
- Appointments with Calendar API
- Trello-style Legal Task Pipelines
- In-app Chat System
- Admin Panel (RBAC)
- Legal Knowledgebase Blog (Markdown CMS)
- Multilingual Support (English, Hindi)
- Sticky Audio Notes for lawyers
- Analytics Dashboard
- Referral System (Stripe Connect)

## Tech Stack
- Next.js, TailwindCSS, R3F, Framer Motion, GSAP
- NextAuth.js, Stripe, Formik, Yup, Zustand
- PostgreSQL, Prisma
- Docker, GitHub Actions
- AWS S3/Cloudinary, SendGrid, Twilio, OpenAI

## Quick Start
1. Clone the repo
2. Copy `.env.example` to `.env` and fill in secrets
3. Run `docker-compose up --build`
4. Access at `http://localhost:3000`

## Folder Structure
See `architecture.drawio` for a full diagram.
