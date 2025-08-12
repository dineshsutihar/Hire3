<div align="center">
	<h1>Hire3</h1>
	<p><strong>Full‑stack Web3 Talent Platform</strong></p>
	<p>Frontend: React + Vite + Tailwind · Backend: Express + TypeScript + Prisma/PostgreSQL · Web3: Solana payments</p>
</div>

## Overview

Hire3 is a modern starter for a jobs/talent platform. It includes auth, profiles, job posting, applications, a simple posts feed, and a Web3 payment gate (Solana) to post jobs. The stack is production‑ready with TypeScript end‑to‑end.

## Repository structure

```
Hire3/
	frontend/
	backend/
	README.md
```

## Features

- Auth: register/login with JWT, protected routes
- Profiles: bio, skills, LinkedIn, wallet address
- Jobs: list, view, create (requires platform fee), manage your jobs
- Applications: apply and manage applicants (owner)
- Posts: simple LinkedIn‑style posts
- Web3: Solana platform fee to post a job; backend verifies and logs payments

## Prerequisites

- Node.js
- PostgreSQL (local or hosted). Neon is recommended for an easy, serverless Postgres
- A Solana wallet (Phantom) on Devnet for local testing

## Quick start (local dev)

1. Clone and install

```bash
git clone https://github.com/dineshsutihar/Hire3.git
cd hire3

# Backend deps
cd backend && npm install

# Frontend deps
cd frontend && npm install
```

2. Configure backend environment

Create `backend/.env` with: - Example can be found in `backend/.env.example`

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
JWT_SECRET=replace_with_strong_secret
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Web3 / Solana (Devnet suggested for local)
SOLANA_RPC=https://api.devnet.solana.com
SOLANA_ADMIN=<ADMIN_PUBLIC_KEY>
SOLANA_PLATFORM_FEE_SOL=0.01
```

Important: set `SOLANA_ADMIN` to a wallet address that will receive fees. For dev, use a second wallet different from the poster’s wallet (self‑transfer results in zero net change and will be rejected).

3. Configure frontend environment

Create `frontend/.env` with: - Example can be found in `frontend/.env.example`

```dotenv
VITE_API_BASE=http://localhost:4000/api
VITE_SOLANA_RPC=https://api.devnet.solana.com
VITE_SOLANA_ADMIN=<ADMIN_PUBLIC_KEY>  # must match backend SOLANA_ADMIN
```

4. Initialize database (Prisma)

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. Run in development

Open two terminals:

Terminal A (backend):

```bash
cd backend
npm run dev
# API at http://localhost:4000/api
```

Terminal B (frontend):

```bash
cd frontend
npm run dev
# App at http://localhost:5173
```

6. Test the Web3 flow (Devnet)

- Install Phantom wallet and switch to Solana Devnet
- Airdrop Devnet SOL to the poster wallet: https://faucet.solana.com/
- Ensure `SOLANA_ADMIN`/`VITE_SOLANA_ADMIN` is a different wallet that can receive the platform fee
- Post a job from the UI: you’ll be asked by Phantom to pay the platform fee; the backend verifies the tx and logs it

## How payments work

- Frontend fetches the required lamports from `/api/payments/required`
- Phantom sends exactly that amount to the admin wallet
- Backend verifies the transaction via Solana RPC and stores a `Payment`
- Posting a job requires a confirmed payment in the last 24h with amount ≥ required lamports

Useful pages:

- Payments history: `/payments` (lists your payments and links to Solscan)

## Environment variables

Backend (`backend/.env`):
example can be found in `backend/.env.example`

Frontend (`frontend/.env`):
example can be found in `frontend/.env.example`

Notes:

- `SOLANA_ADMIN` and `VITE_SOLANA_ADMIN` must match
- For production, switch RPC to a mainnet or a provider you trust
- For multiple frontends, set `CORS_ORIGIN` to a comma‑separated list

## Scripts

Backend:

```
npm run dev           # start dev server (nodemon)
npm run build         # type‑check and compile TS -> dist
npm start             # run compiled server
npm run prisma:generate
npm run prisma:migrate
```

Frontend:

```
npm run dev
npm run build
npm run preview
npm run typecheck
```

## API overview (Base: `/api`)

Auth & Profile

- POST `/register` — name, email, password → token + user
- POST `/login` — email, password → token + user
- GET `/profile` (auth)
- PUT `/profile` (auth) — name, bio, linkedinUrl, skills[], walletAddress

Jobs

- GET `/jobs` — list with basic filters
- GET `/jobs/:id` — single job
- POST `/jobs` (auth) — requires recent verified payment
- DELETE `/jobs/:id` (auth, owner)
- GET `/my-jobs` (auth)

Posts

- GET `/posts`
- GET `/posts/:id`
- POST `/posts` (auth)
- PUT `/posts/:id` (auth, owner)
- DELETE `/posts/:id` (auth, owner)
- GET `/my-posts` (auth)

Payments

- GET `/payments/required` — returns { requiredLamports, admin, rpc }
- POST `/payments/verify` (auth) — body { signature }
- GET `/my-payments` (auth)

Auth header for protected routes:

```
Authorization: Bearer <JWT>
```

## Deployment

Backend:

- Build: `npm install && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && node dist/server.js`
- Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `SOLANA_RPC`, `SOLANA_ADMIN`, `SOLANA_PLATFORM_FEE_SOL`

Frontend:

- Project root: `frontend/`
- Build: `npm run build`
- Output dir: `dist`
- Env: `VITE_API_BASE`, `VITE_SOLANA_RPC`, `VITE_SOLANA_ADMIN`

Database (Neon or Postgres):

- Apply migrations on deploy: `npx prisma migrate deploy`

## Troubleshooting

| Symptom                        | Likely cause                             | Fix                                                                                                 |
| ------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| CORS error                     | Frontend origin not allowed              | Set `CORS_ORIGIN` to include your frontend URL(s)                                                   |
| 401 Unauthorized               | Missing/expired token                    | Login again; send `Authorization: Bearer <JWT>`                                                     |
| Prisma migrate errors          | Wrong `DATABASE_URL` or cold start       | Re‑run, verify URL and SSL params                                                                   |
| Insufficient lamports received | Paid less than required or self‑transfer | Ensure `SOLANA_ADMIN` ≠ poster wallet and frontend fetches `/payments/required` to pay exact amount |
| Phantom not detected           | Wallet extension missing                 | Install Phantom and reload; ensure Devnet when testing                                              |

## Security notes

- Use a long, random `JWT_SECRET`
- Restrict CORS origins in production
- Serve over HTTPS only
- Do not log secrets or raw JWTs

## Roadmap (ideas)

- Role‑based access control (admin/recruiter/talent)
- On‑chain credentials / wallet verification
- Notifications and activity feed
- GraphQL option

## License

Currently unlicensed (all rights reserved by default). Will be added later.

---

Made with a modern TypeScript stack. Contributions welcome.
