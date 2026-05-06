<div align="center">

# 🚀 Hire3

**The Future of Work, Powered by Web3 & AI**

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana" alt="Solana" />
</p>

</div>

---

## 📋 Overview

Hire3 is a full-stack Web3 talent platform connecting exceptional talent with innovative teams. It features a modern React frontend, an Express/TypeScript backend powered by Prisma and PostgreSQL, and Solana integration for verifiable job posting payments. AI assists with resume parsing and job–skill matching.

## 🧭 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference-summary)
- [Payment Flow](#-payment-flow-solana)
- [AI Notes](#-ai-notes)
- [Troubleshooting](#-troubleshooting)
- [Useful Commands](#-useful-commands)

---

## 📸 Screenshots

- Landing: `dist-image/landing-page.png`
- Dashboard: `dist-image/dashboard-overview.png`
- Browse Jobs: `dist-image/browse-jobs-page.png`
- Manage Jobs: `dist-image/my-job-pages.png`
- Posts: `dist-image/Posts-page.png`
- Profile: `dist-image/profile-page.png`

<p>
  <img src="dist-image/landing-page.png" alt="Landing Page" width="720" />
</p>

---

## ✨ Key Features

- 🔐 Authentication: JWT-based auth with secure registration/login
- 👤 Rich Profiles: Bio, skills, LinkedIn, wallet address, avatar upload
- 💼 Job Management: Post, browse, filter, update, and manage jobs
- 📝 Applications: Apply, track status, manage applicants with match scores
- 💬 Social Feed: LinkedIn-style posts with likes and comments
- 💰 Web3 Payments: Optional Solana fee with on-chain verification
- 🤖 AI: Resume parsing and job–skill matching
- 🎨 Dark Mode + 📱 Responsive: Tailwind-based, mobile-first UI

---

## 🏗️ Architecture

```
Hire3/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/           # API client with typed helpers
│   │   ├── components/    # UI primitives + features (managejobs/, posts/)
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Recoil auth state
│   │   └── web3/          # Solana helpers
│   └── ...
├── backend/               # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/        # API route handlers (incl. /api/ai)
│   │   ├── middleware/    # Auth, error handling
│   │   ├── services/      # Business logic (AI, etc.)
│   │   └── types/         # Express request extensions
│   └── prisma/            # Schema & migrations, seed script
└── docs/                  # Documentation
```

Data flow for paid job creation (Web3):
1) Frontend: GET `/api/payments/required` → amount + admin wallet
2) Frontend: Phantom signs & sends SOL to admin
3) Frontend: POST `/api/payments/verify` with signature
4) Backend: verifies via Solana RPC and marks payment
5) Frontend: POST `/api/jobs` → backend checks verified payment window

---

## 📦 Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted — Neon recommended)
- Solana Phantom wallet on Devnet (optional for Web3)

---

## 🚀 Quick Start

> The commands below are examples for local development.

1) Clone and install

```powershell
git clone https://github.com/dineshsutihar/Hire3.git
cd Hire3

# Backend deps
cd backend && npm install

# Frontend deps
cd ../frontend && npm install
```

2) Configure backend environment (`backend/.env`)

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
JWT_SECRET=your_super_secret_key_here
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Solana (Devnet)
SOLANA_RPC=https://api.devnet.solana.com
SOLANA_ADMIN=<YOUR_ADMIN_WALLET_PUBLIC_KEY>
SOLANA_PLATFORM_FEE_SOL=0  # Set 0 to disable payment during dev

# AI (optional)
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
```

3) Configure frontend environment (`frontend/.env`)

```dotenv
VITE_API_BASE=http://localhost:4000/api
VITE_SOLANA_RPC=https://api.devnet.solana.com
VITE_SOLANA_ADMIN=<YOUR_ADMIN_WALLET_PUBLIC_KEY>  # Must match backend
```

4) Initialize the database (from project root or backend folder)

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed   # optional: populate demo data
```

5) Run development servers

```powershell
# Terminal 1 — Backend
cd backend
npm run dev    # http://localhost:4000

# Terminal 2 — Frontend
cd frontend
npm run dev    # http://localhost:5173
```

> Tip: If 5173 is busy, Vite will select another port (shown in the terminal).

---

## 🔌 API Reference (summary)

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`
- Applications: `POST /api/jobs/:id/apply`, `GET /api/jobs/user/applications`, `GET /api/jobs/:id/applicants`, `PUT /api/jobs/:jobId/applicants/:applicationId`
- Profile: `GET /api/profile/:id`, `PUT /api/profile`, `POST /api/profile/avatar`
- Posts: `GET /api/posts`, `POST /api/posts`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comments`
- AI: `POST /api/ai/resume/parse`, `GET /api/ai/jobs/match`
- Payments: `GET /api/payments/required`, `POST /api/payments/verify`

Responses follow `{ message: string }` for errors and typed DTOs for success. Protected routes expect `Authorization: Bearer <token>`.

---

## 💳 Payment Flow (Solana)

1) Frontend requests required fee and admin wallet (`/api/payments/required`)
2) User approves SOL transfer in Phantom to admin wallet
3) Frontend submits transaction signature to `/api/payments/verify`
4) Backend verifies on-chain and marks recent verified payment
5) Job creation proceeds (`POST /api/jobs`) only if a recent verified payment exists

> For development, set `SOLANA_PLATFORM_FEE_SOL=0` to bypass payment.

---

## 🧠 AI Notes

- Resume PDF parsing is handled server-side; errors are surfaced with helpful messages
- Gemini model: `gemini-2.0-flash`; if quota is exceeded, responses fail gracefully
- JSON parsing is defensive (handles fenced code blocks); extracted skills merge into user profile

---

## 🛠️ Troubleshooting

- PDF parse errors: Ensure the file is a valid, non-password-protected PDF and under 10MB
- Gemini 429 (quota): Skill extraction gracefully skips; retry later or add a fallback strategy
- Port conflicts: Frontend picks a new port; backend port can be changed via `PORT`
- Prisma: If migrations fail, check `DATABASE_URL`, run `npx prisma generate`, then retry migrate

---

## 📚 Useful Commands

Backend

```powershell
npm run dev        # Start dev server (nodemon/tsx)
npm run build      # Build for production
npm start          # Run compiled server
npm run seed       # Populate database with demo data
npx prisma studio  # Browse database
```

Frontend

```powershell
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview production
```

# 🔄 API Workflow

```text
Frontend (React)
        ↓
REST API Requests
        ↓
Backend (Express + TypeScript)
        ↓
MongoDB Database
        ↓
Response Returned to Frontend
```

---

# ☁️ CI/CD Workflow (Vercel)

This project uses Vercel for deployment and Continuous Integration / Continuous Deployment (CI/CD).

## CI/CD Pipeline Flow

```text
Developer Pushes Code to GitHub
                ↓
GitHub Repository Updated
                ↓
Vercel Detects Changes Automatically
                ↓
Build Process Starts
                ↓
Frontend & Backend Validated
                ↓
Production Deployment Created
                ↓
Live Application Updated
```

## CI/CD Features

* Automatic deployments on every push
* Preview deployments for pull requests
* Fast rollback support
* Production-ready hosting
* GitHub integration
* Automatic build and deployment pipeline

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed by <a href="https://github.com/dineshsutihar">Dinesh Kumar Sutihar</a>

* GitHub: [https://github.com/dineshsutihar](https://github.com/dineshsutihar)
* Portfolio: [https://dineshsutihar.me/](https://dineshsutihar.me/)

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

```

Based on the current README, I added:
- Proper project overview
- Full tech stack section
- Installation/setup guide
- Environment variables
- Steps to run frontend/backend
- API workflow
- Complete Vercel CI/CD workflow
- Future improvements
- Better structure and formatting
```


---

