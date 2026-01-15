<div align="center"><div align="center">

	<h1>🚀 Hire3</h1>	<h1>🚀 Hire3</h1>

	<p><strong>The Future of Work, Powered by Web3 & AI</strong></p>	<p><strong>The Future of Work, Powered by Web3 & AI</strong></p>

	<p><em>Connect. Match. Work.</em></p>	<p><em>Connect. Match. Work.</em></p>

	<br/>	<br/>

	<p>	<p>

		<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />		<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />

		<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />		<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />

		<img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind" />		<img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind" />

		<img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express" alt="Express" />		<img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express" alt="Express" />

		<img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma" />		<img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma" />

		<img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana" alt="Solana" />		<img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana" alt="Solana" />

	</p>	</p>

</div></div>



------



## 📋 Overview## 📋 Overview



Hire3 is a full-stack Web3 talent platform connecting exceptional talent with innovative teams. It features a modern React frontend, Express/TypeScript backend with Prisma ORM, and Solana blockchain integration for transparent, verifiable job posting payments.Hire3 is a full-stack Web3 talent platform connecting exceptional talent with innovative teams. It features a modern React frontend, Express/TypeScript backend with Prisma ORM, and Solana blockchain integration for transparent, verifiable job posting payments.



### ✨ Key Features### ✨ Key Features



| Feature | Description |- **🔐 Authentication** — JWT-based auth with secure registration/login

|---------|-------------|- **👤 Rich Profiles** — Bio, skills, LinkedIn, wallet address, avatar upload

| 🔐 **Authentication** | JWT-based auth with secure registration/login |- **💼 Job Management** — Post, browse, filter, and manage job listings

| 👤 **Rich Profiles** | Bio, skills, LinkedIn, wallet address, avatar upload |- **📝 Applications** — Apply to jobs, track status, manage applicants

| 💼 **Job Management** | Post, browse, filter, update, and manage job listings |- **💬 Social Feed** — LinkedIn-style posts with likes and comments

| 📝 **Applications** | Apply to jobs, track status, manage applicants with match scores |- **💰 Web3 Payments** — Solana platform fee with on-chain verification

| 💬 **Social Feed** | LinkedIn-style posts with likes and comments |- **🎨 Dark Mode** — Full dark/light theme support

| 💰 **Web3 Payments** | Solana platform fee with on-chain verification (optional) |- **📱 Responsive** — Mobile-first design with Tailwind CSS

| 🤖 **AI Features** | Resume parsing, job-skill matching |

| 🎨 **Dark Mode** | Full dark/light theme support |---

| 📱 **Responsive** | Mobile-first design with Tailwind CSS |

## 🏗️ Architecture

---

```

## 🏗️ ArchitectureHire3/

├── frontend/          # React + Vite + Tailwind

```│   ├── src/

Hire3/│   │   ├── api/       # API client with typed helpers

├── frontend/              # React + Vite + Tailwind│   │   ├── components/# Reusable UI components

│   ├── src/│   │   ├── pages/     # Route pages

│   │   ├── api/           # API client with typed helpers│   │   ├── store/     # Recoil state management

│   │   ├── components/    # Reusable UI components│   │   └── web3/      # Solana integration

│   │   │   ├── managejobs/# Job management components│   └── ...

│   │   │   └── posts/     # Social feed components├── backend/           # Express + TypeScript + Prisma

│   │   ├── pages/         # Route pages│   ├── src/

│   │   ├── store/         # Recoil state management│   │   ├── routes/    # API route handlers

│   │   └── web3/          # Solana integration│   │   ├── middleware/# Auth, error handling

│   └── ...│   │   ├── services/  # Business logic (AI, etc.)

├── backend/               # Express + TypeScript + Prisma│   │   └── types/     # TypeScript definitions

│   ├── src/│   └── prisma/        # Database schema & migrations

│   │   ├── routes/        # API route handlers└── docs/              # Documentation

│   │   ├── middleware/    # Auth, error handling```

│   │   ├── services/      # Business logic (AI, etc.)

│   │   └── types/         # TypeScript definitions## ✨ Features

│   └── prisma/            # Database schema & migrations

└── docs/                  # Documentation- **Auth**: Register/login with JWT, protected routes

```- **Profiles**: Bio, skills, LinkedIn, wallet address, avatar

- **Jobs**: List, view, create (with optional platform fee), update, manage

---- **Applications**: Apply to jobs, track status, manage applicants with match scores

- **Posts**: LinkedIn-style social feed with likes and comments

## 📦 Prerequisites- **Web3**: Solana platform fee (configurable, can be set to 0 for testing)

- **AI**: Resume parsing, job-skill matching

- **Node.js** 18+

- **PostgreSQL** (local or hosted — [Neon](https://neon.tech) recommended)## 📦 Prerequisites

- **Solana Wallet** (Phantom) on Devnet for Web3 features (optional)

- **Node.js** 18+ 

---- **PostgreSQL** (local or hosted — [Neon](https://neon.tech) recommended)

- **Solana Wallet** (Phantom) on Devnet for Web3 features

## 🚀 Quick Start

## 🚀 Quick Start

### 1. Clone and Install

### 1. Clone and Install

```bash

git clone https://github.com/dineshsutihar/Hire3.git```bash

cd Hire3git clone https://github.com/dineshsutihar/Hire3.git

cd Hire3

# Install backend dependencies

cd backend && npm install# Install all dependencies

cd backend && npm install

# Install frontend dependenciescd ../frontend && npm install

cd ../frontend && npm install```

```

### 2. Configure Backend (.env)

### 2. Configure Backend Environment

Create `backend/.env` (see `backend/.env.example`):

Create `backend/.env` (see `backend/.env.example`):

```dotenv

```dotenvDATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=requireJWT_SECRET=your_super_secret_key

JWT_SECRET=your_super_secret_key_herePORT=4000

PORT=4000CORS_ORIGIN=http://localhost:5173

CORS_ORIGIN=http://localhost:5173

# Solana (set fee to 0 for testing without payments)

# Solana ConfigurationSOLANA_RPC=https://api.devnet.solana.com

SOLANA_RPC=https://api.devnet.solana.comSOLANA_ADMIN=<ADMIN_WALLET_PUBLIC_KEY>

SOLANA_ADMIN=<YOUR_ADMIN_WALLET_PUBLIC_KEY>SOLANA_PLATFORM_FEE_SOL=0.01

SOLANA_PLATFORM_FEE_SOL=0  # Set to 0 for free posting during dev```

```

Important: set `SOLANA_ADMIN` to a wallet address that will receive fees. For dev, use a second wallet different from the poster’s wallet (self‑transfer results in zero net change and will be rejected).

> 💡 **Tip**: Set `SOLANA_PLATFORM_FEE_SOL=0` to disable payment requirements during development.

3. Configure frontend environment

### 3. Configure Frontend Environment

Create `frontend/.env` with: - Example can be found in `frontend/.env.example`

Create `frontend/.env` (see `frontend/.env.example`):

```dotenv

```dotenvVITE_API_BASE=http://localhost:4000/api

VITE_API_BASE=http://localhost:4000/apiVITE_SOLANA_RPC=https://api.devnet.solana.com

VITE_SOLANA_RPC=https://api.devnet.solana.comVITE_SOLANA_ADMIN=<ADMIN_PUBLIC_KEY>  # must match backend SOLANA_ADMIN

VITE_SOLANA_ADMIN=<YOUR_ADMIN_WALLET_PUBLIC_KEY>  # Must match backend```

```

4. Initialize database (Prisma)

### 4. Initialize Database

```bash

```bashcd backend

cd backendnpx prisma generate

npx prisma generatenpx prisma migrate dev --name init

npx prisma migrate dev --name init```

```

5. Run in development

### 5. Run Development Servers

Open two terminals:

**Terminal 1 — Backend:**

```bashTerminal A (backend):

cd backend && npm run dev

# API running at http://localhost:4000/api```bash

```cd backend

npm run dev

**Terminal 2 — Frontend:**# API at http://localhost:4000/api

```bash```

cd frontend && npm run dev

# App running at http://localhost:5173Terminal B (frontend):

```

```bash

### 6. Test Web3 Flow (Optional)cd frontend

npm run dev

1. Install [Phantom wallet](https://phantom.app/) and switch to **Solana Devnet**# App at http://localhost:5173

2. Get test SOL from [faucet.solana.com](https://faucet.solana.com/)```

3. Set `SOLANA_PLATFORM_FEE_SOL=0.01` to enable payments

4. Post a job — Phantom will prompt for the platform fee6. Test the Web3 flow (Devnet)



---- Install Phantom wallet and switch to Solana Devnet

- Airdrop Devnet SOL to the poster wallet: https://faucet.solana.com/

## 💰 How Payments Work- Ensure `SOLANA_ADMIN`/`VITE_SOLANA_ADMIN` is a different wallet that can receive the platform fee

- Post a job from the UI: you’ll be asked by Phantom to pay the platform fee; the backend verifies the tx and logs it

```

┌─────────────┐     GET /payments/required     ┌─────────────┐## How payments work

│   Frontend  │ ─────────────────────────────► │   Backend   │

│             │ ◄───────────────────────────── │             │- Frontend fetches the required lamports from `/api/payments/required`

│             │     { requiredLamports, admin } │             │- Phantom sends exactly that amount to the admin wallet

│             │                                │             │- Backend verifies the transaction via Solana RPC and stores a `Payment`

│   Phantom   │ ══════ SOL Transfer ═════════► │   Solana    │- Posting a job requires a confirmed payment in the last 24h with amount ≥ required lamports

│   Wallet    │                                │   Network   │

│             │                                │             │Useful pages:

│   Frontend  │     POST /payments/verify      │   Backend   │

│             │ ─────────────────────────────► │   (verify)  │- Payments history: `/payments` (lists your payments and links to Solscan)

│             │     { signature }              │             │

│             │                                │             │## Environment variables

│   Frontend  │     POST /jobs                 │   Backend   │

│             │ ─────────────────────────────► │   (create)  │Backend (`backend/.env`):

└─────────────┘                                └─────────────┘example can be found in `backend/.env.example`

```

Frontend (`frontend/.env`):

1. Frontend fetches required lamports from `/api/payments/required`example can be found in `frontend/.env.example`

2. Phantom sends the exact amount to the admin wallet

3. Backend verifies the transaction via Solana RPC and logs itNotes:

4. Job creation checks for a recent verified payment (last 24h)

- `SOLANA_ADMIN` and `VITE_SOLANA_ADMIN` must match

> **Note**: When `SOLANA_PLATFORM_FEE_SOL=0`, payment is skipped entirely.- For production, switch RPC to a mainnet or a provider you trust

- For multiple frontends, set `CORS_ORIGIN` to a comma‑separated list

**View payment history:** `/payments` (with Solscan links)

## Scripts

---

Backend:

## 📜 Scripts

```

### Backendnpm run dev           # start dev server (nodemon)

npm run build         # type‑check and compile TS -> dist

| Script | Description |npm start             # run compiled server

|--------|-------------|npm run prisma:generate

| `npm run dev` | Start dev server (nodemon + ts-node) |npm run prisma:migrate

| `npm run build` | Type-check and compile TS → dist |```

| `npm start` | Run compiled server |

| `npm run prisma:generate` | Generate Prisma client |Frontend:

| `npm run prisma:migrate` | Run database migrations |

```

### Frontendnpm run dev

npm run build

| Script | Description |npm run preview

|--------|-------------|npm run typecheck

| `npm run dev` | Start Vite dev server |```

| `npm run build` | Build for production |

| `npm run preview` | Preview production build |## API overview (Base: `/api`)

| `npm run typecheck` | Run TypeScript type checking |

Auth & Profile

---

- POST `/register` — name, email, password → token + user

## 🔌 API Reference- POST `/login` — email, password → token + user

- GET `/profile` (auth)

Base URL: `/api`- PUT `/profile` (auth) — name, bio, linkedinUrl, skills[], walletAddress



### Auth & ProfileJobs



| Method | Endpoint | Description | Auth |- GET `/jobs` — list with basic filters

|--------|----------|-------------|------|- GET `/jobs/:id` — single job

| POST | `/register` | Create account | ❌ |- POST `/jobs` (auth) — requires recent verified payment

| POST | `/login` | Login → JWT token | ❌ |- DELETE `/jobs/:id` (auth, owner)

| GET | `/profile` | Get current user profile | ✅ |- GET `/my-jobs` (auth)

| PUT | `/profile` | Update profile | ✅ |

Posts

### Jobs

- GET `/posts`

| Method | Endpoint | Description | Auth |- GET `/posts/:id`

|--------|----------|-------------|------|- POST `/posts` (auth)

| GET | `/jobs` | List jobs (with filters) | ❌ |- PUT `/posts/:id` (auth, owner)

| GET | `/jobs/:id` | Get single job | ❌ |- DELETE `/posts/:id` (auth, owner)

| POST | `/jobs` | Create job (requires payment if fee > 0) | ✅ |- GET `/my-posts` (auth)

| PUT | `/jobs/:id` | Update job (owner only) | ✅ |

| DELETE | `/jobs/:id` | Delete job (owner only) | ✅ |Payments

| GET | `/my-jobs` | Get user's posted jobs | ✅ |

- GET `/payments/required` — returns { requiredLamports, admin, rpc }

### Applications- POST `/payments/verify` (auth) — body { signature }

- GET `/my-payments` (auth)

| Method | Endpoint | Description | Auth |

|--------|----------|-------------|------|Auth header for protected routes:

| POST | `/jobs/:id/apply` | Apply to a job | ✅ |

| GET | `/jobs/:id/applicants` | Get job applicants (owner) | ✅ |```

| PUT | `/jobs/:jobId/applicants/:id` | Update applicant status | ✅ |Authorization: Bearer <JWT>

```

### Posts

## Deployment

| Method | Endpoint | Description | Auth |

|--------|----------|-------------|------|Backend:

| GET | `/posts` | List posts | ❌ |

| GET | `/posts/:id` | Get single post | ❌ |- Build: `npm install && npx prisma generate && npm run build`

| POST | `/posts` | Create post | ✅ |- Start: `npx prisma migrate deploy && node dist/server.js`

| PUT | `/posts/:id` | Update post (owner) | ✅ |- Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `SOLANA_RPC`, `SOLANA_ADMIN`, `SOLANA_PLATFORM_FEE_SOL`

| DELETE | `/posts/:id` | Delete post (owner) | ✅ |

Frontend:

### Payments

- Project root: `frontend/`

| Method | Endpoint | Description | Auth |- Build: `npm run build`

|--------|----------|-------------|------|- Output dir: `dist`

| GET | `/payments/required` | Get fee info | ❌ |- Env: `VITE_API_BASE`, `VITE_SOLANA_RPC`, `VITE_SOLANA_ADMIN`

| POST | `/payments/verify` | Verify Solana tx | ✅ |

| GET | `/my-payments` | List user's payments | ✅ |Database (Neon or Postgres):



**Auth Header:** `Authorization: Bearer <JWT>`- Apply migrations on deploy: `npx prisma migrate deploy`



---## Troubleshooting



## 🚀 Deployment| Symptom                        | Likely cause                             | Fix                                                                                                 |

| ------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |

### Backend (Render, Railway, etc.)| CORS error                     | Frontend origin not allowed              | Set `CORS_ORIGIN` to include your frontend URL(s)                                                   |

| 401 Unauthorized               | Missing/expired token                    | Login again; send `Authorization: Bearer <JWT>`                                                     |

```bash| Prisma migrate errors          | Wrong `DATABASE_URL` or cold start       | Re‑run, verify URL and SSL params                                                                   |

# Build| Insufficient lamports received | Paid less than required or self‑transfer | Ensure `SOLANA_ADMIN` ≠ poster wallet and frontend fetches `/payments/required` to pay exact amount |

npm install && npx prisma generate && npm run build| Phantom not detected           | Wallet extension missing                 | Install Phantom and reload; ensure Devnet when testing                                              |



# Start## Security notes

npx prisma migrate deploy && node dist/server.js

```- Use a long, random `JWT_SECRET`

- Restrict CORS origins in production

**Required env vars:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `SOLANA_RPC`, `SOLANA_ADMIN`, `SOLANA_PLATFORM_FEE_SOL`- Serve over HTTPS only

- Do not log secrets or raw JWTs

### Frontend (Vercel, Netlify, etc.)

## Roadmap (ideas)

- **Root:** `frontend/`

- **Build:** `npm run build`- Role‑based access control (admin/recruiter/talent)

- **Output:** `dist/`- On‑chain credentials / wallet verification

- **Env vars:** `VITE_API_BASE`, `VITE_SOLANA_RPC`, `VITE_SOLANA_ADMIN`- Notifications and activity feed

- GraphQL option

### Database (Neon, Supabase, etc.)

## License

```bash

npx prisma migrate deployCurrently unlicensed (all rights reserved by default). Will be added later.

```

---

---

Made with a modern TypeScript stack. Contributions welcome.

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS error | Frontend origin not allowed | Set `CORS_ORIGIN` to your frontend URL |
| 401 Unauthorized | Missing/expired token | Login again; include `Authorization: Bearer <JWT>` |
| Prisma migrate errors | Wrong `DATABASE_URL` | Verify connection string and SSL params |
| Payment verification fails | Self-transfer or wrong amount | Ensure admin wallet ≠ poster wallet |
| Phantom not detected | Wallet not installed | Install Phantom and reload |

---

## 🔒 Security Notes

- Use a long, random `JWT_SECRET` (32+ characters)
- Restrict `CORS_ORIGIN` in production (no wildcards)
- Always serve over HTTPS
- Never log secrets or raw JWTs

---

## 🗺️ Roadmap

- [ ] Role-based access control (admin/recruiter/talent)
- [ ] On-chain credentials / wallet verification
- [ ] Email notifications
- [ ] Advanced AI matching with embeddings
- [ ] Mobile app (React Native)

---

## 📄 License

This project is currently unlicensed (all rights reserved). License will be added later.

---

<div align="center">
	<p>Built with ❤️ by <a href="https://github.com/dineshsutihar">Dinesh Sutihar</a></p>
	<p>
		<a href="https://github.com/dineshsutihar/Hire3/issues">Report Bug</a>
		·
		<a href="https://github.com/dineshsutihar/Hire3/issues">Request Feature</a>
	</p>
</div>
