# ⚖️ LAW-AI: The Future of Legal Tech

> **Enterprise-grade Legal AI Platform** integrating **RAG (Document Intelligence)**, **Streaming AI**, and **Real-time Case Tracking**. Built for speed, accuracy, and scalability.

[![Demo Status](https://img.shields.io/website?url=https%3A%2F%2Flawaiv2.vercel.app&label=Live%20Demo&style=for-the-badge)](https://lawaiv2.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20NVIDIA-blue?style=for-the-badge)](https://stackshare.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🚀 Why This Repo Ranks #1 in Legal AI?

Law-AI is not just another wrapper. It's a **full-stack engineering marvel** featuring:

1.  **🧠 RAG Pipeline (Retrieval-Augmented Generation)**:
    - Automatically extracts text from uploaded **PDFs/DOCX**.
    - Generates vector embeddings using **NVIDIA API**.
    - Stores in **Supabase pgvector** for semantic search.
    - *Result:* AI that reads and cites *your* specific case files.

2.  **⚡ Instant Streaming AI (<200ms)**:
    - Powered by **Vercel AI SDK**.
    - ZERO latency. Responses stream token-by-token.
    - Uses **Llama 3.3 Nemotron** for legal reasoning.

3.  **🔔 Real-Time Architecture**:
    - **Supabase Realtime** integration.
    - Database-driven notifications that push instantly to the UI.
    - No refreshing required.

4.  **🔒 Enterprise Security**:
    - Rate limiting (IP & User based).
    - CSRF & JWT protection.
    - Role-Based Access Control (RBAC).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js Server Actions & API Routes
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Vector DB**: pgvector extension
- **AI Engine**: NVIDIA NIM (Llama 3.3, DeepSeek R1), Vercel AI SDK
- **Auth**: Supabase Auth (OAuth + Email)
- **Payments**: Razorpay Integration

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Supabase Project (with `vector` extension enabled)
- NVIDIA NIM API Key

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/raghavx03/lawaiv2.git
    cd lawaiv2
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy `.env.example` to `.env.local` and add your keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    NVIDIA_LLAMA_API_KEY=...
    ```

4.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma db push
    # Enable vector extension
    npx ts-node scripts/enable-vector.ts
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🌟 Key Features

### 🤖 AI Legal Assistant
- **Context-Aware**: Remembers previous chat context.
- **Citation Enforcement**: Every claim is backed by Indian Law sections (IPC, CrPC).
- **Streaming**: Typewriter effect for natural interaction.

### 📄 Intelligent Document Analysis (RAG)
- Upload Case Files (PDF).
- Ask questions like *"What is the date of the incident in the FIR?"*.
- AI scans the *vector database* to find exact answers.

### 📅 Smart Case Tracker
- Track hearing dates.
- Auto-sync with court APIs (simulated).
- **WhatsApp Integration** for client updates.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📞 Contact

**Raghav Shah** - [raghavshahhh@gmail.com](mailto:raghavshahhh@gmail.com)

Project Link: [https://github.com/raghavx03/lawaiv2](https://github.com/raghavx03/lawaiv2)