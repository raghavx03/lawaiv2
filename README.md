# ⚖️ LAW-AI: Enterprise Legal Intelligence Platform

> **Next-Gen Legal Assistant** powered by **NVIDIA AI**, **RAG (Retrieval-Augmented Generation)**, and **Supabase Realtime**. Built for advocates, law firms, and legal tech innovators.

[![Live Demo](https://img.shields.io/badge/Live_Demo-lawaiv2.ragspro.com-blue?style=for-the-badge&logo=vercel)](https://lawaiv2.ragspro.com)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js_14_%7C_Supabase_%7C_NVIDIA_NIM-000000?style=for-the-badge&logo=next.js)](https://stackshare.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/website?url=https%3A%2F%2Flawaiv2.ragspro.com&label=System%20Status&style=for-the-badge)](https://lawaiv2.ragspro.com)

---

## 🚀 Why This Project Leads the Industry?

**LAW-AI** is engineered as a **production-ready legal operating system**, solving the core challenges of legal tech: latency, accuracy, and data privacy. It leverages a modern, event-driven architecture to deliver sub-200ms responses and verifiable legal citations.

### 🌟 Core Capabilities
- **🧠 Expert Legal Reasoning**: Powered by **Llama 3.3 Nemotron (70B)** via NVIDIA NIM, specifically fine-tuned for complex reasoning.
- **⚡ Instant Streaming**: Custom streaming pipeline using Vercel AI SDK ensures zero-wait interactions.
- **📚 RAG (Document Intelligence)**: Upload PDFs/DOCX. The system vectorizes content using NVIDIA embeddings and stores in **Supabase pgvector** for semantic search.
- **🎙️ Voice Lawyer**: Real-time voice consultation with Indian accent support (TTS/STT).
- **📝 Smart Drafting**: Context-aware document generation (`[OFFER_DRAFT]` system). Ask for a notice, get a structured draft instantly.
- **🔒 Enterprise Security**: Role-Based Access Control (RBAC), IP Rate Limiting, and JWT authentication via Supabase.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | **Next.js 14** (App Router) | React Server Components, Streaming SSR |
| **Styling** | **Tailwind CSS** + **Shadcn UI** | Responsive, dark-mode ready design system |
| **Backend** | **Next.js API Routes** | Edge-compatible serverless functions |
| **Database** | **Supabase** (PostgreSQL) | Relational data + Realtime subscriptions |
| **Search** | **pgvector** | Vector similarity search for RAG |
| **AI Engine** | **NVIDIA NIM** | High-performance inference for Llama 3.3 & DeepSeek |
| **Auth** | **Supabase Auth** | secure email/password & OAuth (Google) |
| **Storage** | **Supabase Storage** | Secure document hosting with RLS policies |
| **Payments** | **Razorpay** | Subscription management (Pro/Enterprise plans) |

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User[User / Client] -->|HTTPS| CDN[Vercel Edge Network]
    CDN -->|Next.js App| App[Application Server]
    
    subgraph "AI Pipeline"
    App -->|Stream| NV[NVIDIA NIM API]
    NV -->|Llama 3.3| Model[LLM Engine]
    NV -->|Embeddings| Vector[Vector Model]
    end
    
    subgraph "Data Layer"
    App -->|Auth/Data| DB[(Supabase Postgres)]
    App -->|Uploads| Storage[Supabase Storage]
    DB -->|pgvector| VectorStore[Vector Index]
    end
    
    subgraph "Realtime"
    DB -->|CDC Changes| Realtime[Supabase Realtime]
    Realtime -->|WebSocket| User
    end
```

---

## ⚡ Quick Start Guide

### 1. clone the Repository
```bash
git clone https://github.com/raghavx03/lawaiv2.git
cd lawai-main
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (NVIDIA NIM)
NVIDIA_LLAMA_API_KEY=nvapi-...

# Payment Gateway (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Initialization
Push the schema to your Supabase instance:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see the application.

---

## 📂 Project Structure

```bash
/src
  /app              # Next.js App Router (Pages & API)
    /admin          # Secured Admin Dashboard
    /ai-assistant   # Main Chat Interface
    /api            # Serverless API Endpoints
    /auth           # Authentication Pages
    /dashboard      # User Dashboard
  /components       # React Components (Shadcn UI)
  /lib              # Core Utilities (AI, DB, Auth)
    ai-service.ts   # NVIDIA Integration Logic
    rag.ts          # RAG Pipeline Implementation
  /types            # TypeScript Definitions
/prisma             # Database Schema
/public             # Static Assets
```

---

## 🛡️ Security Features

- **Middleware Protection**: `middleware.ts` adds security headers (HSTS, X-Frame-Options) and route guards.
- **Row Level Security (RLS)**: Database policies ensure users only access their own data.
- **Input Sanitization**: All AI inputs are sanitized to prevent injection attacks.
- **Rate Limiting**: Custom implementation using Redis/Upstash (optional) or in-memory map.

---

## 🤝 Contributing

We welcome contributions! Please check `CONTRIBUTING.md` for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Raghav Shah** - [raghavshahhh@gmail.com](mailto:raghavshahhh@gmail.com)

Project Link: [https://github.com/raghavx03/lawaiv2](https://github.com/raghavx03/lawaiv2)