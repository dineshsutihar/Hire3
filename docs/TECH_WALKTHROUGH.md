## Demo Script: Hire3 — Tech Walkthrough, AI/UX Demo, and Web3

This presenter-ready script explains the system end-to-end and guides a short demo. Tailor timing and emphasis based on your audience.

## Introduction — About me and my thought process

I build practical products with a bias for simplicity, reliability, and iteration. For Hire3, I prioritized:

- Clear separation of concerns: typed API client on the frontend, thin route handlers on the backend, Prisma for data access, and a tiny Web3 bridge.
- Safety by design: JWT-protected routes, server-verified Solana payments (no blind trust in the client), and minimal scopes per endpoint.
- DX and maintainability: TypeScript end-to-end, small composable UI components, and centralized utilities (API, Web3, parsing helpers).
- Realistic constraints: JSON-encoded arrays (skills/tags) to keep schema simple, easy migrations, and straightforward deploys (Render + Neon).
- UX first: friction where needed (pay-to-post to deter spam) and fast happy paths elsewhere (skill chips, clean forms).

Trade‑offs I intentionally made:

- No custom Solana program yet; a native transfer keeps verification trivial and reliable. A program can be added later for escrow or receipts.
- AI kept lightweight and explainable (text extraction + mapping). Easy to swap for a stronger model or a service.
- Minimal dependencies; prefer built-ins and the platform where possible.

How I approach features:

1. Define the tiny contract (inputs/outputs, error modes). 2) Add a minimal test or manual smoke path. 3) Implement the smallest working slice. 4) Iterate with telemetry and UX polish.

---

## 1) Tech Walkthrough

### Goal (15–20 min)

Explain how the app works across frontend, backend, AI, database, and Web3. Highlight the simple but robust architecture and where to extend it.

### Architecture at a glance

- Frontend: React + Vite + Tailwind + Recoil + Router
- Backend: Express + TypeScript + Prisma (Postgres)
- Web3: Solana Devnet + Phantom; backend verifies transfers
- AI: Lightweight endpoints (resume parse, job match)

### Frontend (src overview)

- Pages
  - `src/pages/CreateJobs.tsx`: Creates jobs; now fetches required lamports, pays with Phantom, verifies on backend, then posts.
  - `src/pages/FindJobs.tsx`: Search + filters with skill chips.
  - `src/pages/Dashboard.tsx`: Owner view, manage jobs/applicants.
  - `src/pages/Payments.tsx`: Lists on-chain platform fee payments.
  - `src/pages/Posts.tsx`: Simple feed; uses `components/posts` for PostComposer + PostCard.
- Components
  - `components/SkillInput.tsx`: tokenized multi-skill entry.
  - `components/Card.tsx`, `components/Button.tsx`, etc.: composable UI primitives.
- State + API
  - Recoil `store/auth.ts` with token persistence + selectors.
  - `api/client.ts`: typed helpers for auth, jobs, posts, payments, AI.
- Web3 helper
  - `web3/solana.ts`: connects Phantom, builds and sends transfer tx, returns signature (lamports supplied from backend).

Talking points

- Every network call goes through `api/client.ts` with consistent error mapping.
- Web3 payment uses a small helper and a backend verification step for defense-in-depth.
- Minimal local state—server is source of truth post-verify.

### Backend (src overview)

- `src/app.ts`: Express app assembly, CORS, JSON, routes, error handling.
- `src/server.ts`: ESM entry; reads PORT; starts server.
- Routes
  - `routes/authRoutes.ts`: register/login; JWT issuance.
  - `routes/profileRoutes.ts`: read/update profile (name, bio, LinkedIn, skills, wallet).
  - `routes/jobRoutes.ts`: list/get/create/delete jobs; creation requires recent verified payment.
  - `routes/postRoutes.ts`: CRUD for posts (with tags as JSON string).
  - `routes/paymentRoutes.ts`: verify Solana transaction; list “my payments”; expose `/payments/required`.
  - `routes/aiRoutes.ts`: AI helpers (resume parsing, job matching).
- Middleware
  - `middleware/auth.ts`: Bearer JWT to `req.user`.
  - `middleware/errorHandler.ts`: uniform JSON errors.
- Prisma client
  - `src/prisma.ts`: Prisma client instance + graceful shutdown hooks.

Talking points

- Most routes are thin: validate input, call Prisma, return DTOs.
- JSON fields stored as strings for `skills`/`tags` to keep schema simple.
- Payment verification uses Solana RPC to confirm and compute lamport deltas.

### Database (Prisma)

Models (key fields only):

- `User`: id, name, email, password, bio, linkedinUrl, skills[], walletAddress.
- `Job`: id, title, description, skills (JSON string), budget, workMode, location, tags (JSON string), status.
- `JobApplication`: userId, jobId, status.
- `Post`: id, title, content, type, tags.
- `Payment`: id, userId, signature (unique), amountLamports, fromAddress, toAddress, status.

Talking points

- Migrations in `prisma/migrations/` and applied via `migrate deploy` in prod.
- `Payment` entries are append-only records from verified on-chain transfers.

### APIs (selected)

- Auth: `POST /api/register`, `POST /api/login`.
- Profile: `GET/PUT /api/profile`.
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs` (requires payment), `DELETE /api/jobs/:id`, `GET /api/my-jobs`.
- Posts: `GET /api/posts`, `GET /api/posts/:id`, `POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`, `GET /api/my-posts`.
- Payments: `GET /api/payments/required`, `POST /api/payments/verify`, `GET /api/my-payments`.
- AI: `POST /api/ai/resume/parse`, `GET /api/ai/jobs/match?limit=10` (names indicative of functionality).

### Web3 (wallet + verification)

- Frontend uses Phantom provider (Devnet in local/testing) to send the platform fee to admin wallet.
- Backend verifies via Solana RPC:
  - Fetch transaction and meta.
  - Compute admin account lamport delta.
  - Check `delta >= requiredLamports` (from env fee × LAMPORTS_PER_SOL).
  - Log `Payment` row; respond success.
- Job creation checks for a recent confirmed payment (last 24h) before creating a job.

---

## 2) DB, APIs, Wallet Integration, Smart Contracts

### Database

- Postgres via Prisma. JSON-like columns (skills/tags) are stored as stringified arrays for simplicity.
- Relations: `User` ↔ `Job` ↔ `JobApplication`, and `User` ↔ `Post`, `User` ↔ `Payment`.

### APIs

- Consistent `/api/*` routes; auth via `Authorization: Bearer <JWT>`.
- Error responses use `{ message }` with relevant status codes (401, 403, 404, 422/400, 500, 402 for payment required).

### Wallet integration

- Frontend: Phantom provider detection (`window.solana`), connect flow, and `signAndSendTransaction`.
- Backend: `/payments/verify` computes and enforces lamports; `/payments/required` provides the current fee and destination.
- Payments listing available per user at `/my-payments` and UI page `/payments`.

### Smart contracts

- Not required in this MVP; we use native SystemProgram transfer for the platform fee.
- Future: a dedicated program could escrow fees, issue receipts/NFTs, or manage pay-to-post tiers.

---

## 3) AI & Unique Feature Demo

### What to demo (5–8 min)

- Resume parsing (extract skills) and job match suggestions.
- Web3 pay-to-post: frictionless fee payment + server-side verification.

### Flow: Resume → Skills → Match

1. In the UI, open the resume parsing flow (via AI feature).
2. Upload a sample PDF; backend extracts text and suggests structured fields (skills, tools, etc.).
3. Add suggested skills to profile; navigate to Find Jobs to see skill-filtered results.

Talking points

- AI reduces manual profile setup and accelerates job discovery.
- Parsed skills power the filter chips and match candidates to roles.

### Flow: Post a Job with Web3 Fee

1. Navigate to Create Job.
2. Fill required fields; click Publish.
3. Phantom prompts for payment (Devnet). Approve.
4. Backend verifies, logs `Payment`, and allows job creation.
5. Visit `/payments` to show the on-chain receipt (Solscan link).

Talking points

- Clear value: spam reduction and cost recovery; verifiable, non-custodial payments.
- Works with any Solana wallet; admin wallet is configurable via env.

---

## 4) UI/UX Explanation — Priorities & Rationale

### Priorities

- Clarity over complexity: minimal screens, clear CTAs.
- Fast paths for both sides: talent (discover/apply) and recruiters (post/manage).
- Trust and safety: verified, logged payments; clear ownership checks.
- Accessibility and responsiveness: Tailwind utilities + semantic HTML.

### Design choices

- Iconography via Lucide for consistency and clarity.
- Token inputs (SkillInput) and filter chips to make state visible and editable.
- Cards and simple list tables: familiar patterns for scanning content.
- Optimistic, then authoritative server responses to avoid stale UI state.

### Extensibility

- Components are composable and themeable.
- API client is typed and centralized; adding endpoints is straightforward.
- Payment guard is isolated; future tiers or coupons can slot in.

---

## Appendix: Live Demo Checklist

1. Environment

- Backend .env: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, SOLANA_RPC, SOLANA_ADMIN, SOLANA_PLATFORM_FEE_SOL
- Frontend .env: VITE_API_BASE, VITE_SOLANA_RPC, VITE_SOLANA_ADMIN
- Phantom on Devnet; airdrop SOL for the posting wallet; ensure admin wallet is different.

2. Warm-up

- Open `/api/health` to confirm backend is live.
- Login or register a fresh user.

3. AI demo

- Upload a resume, confirm parsed skills, save profile.
- Show Find Jobs with skill chips influencing results.

4. Web3 demo

- Create Job → pay fee in Phantom → verify success → show `/payments` with Solscan link.

5. Wrap-up

- Summarize architecture and where to contribute/extend.

## Go-To-Market (GTM) Strategy — Hire3

### Product positioning

Hire3 — The Future of Work, Powered by Web3 & AI. A job and networking portal for Indian Web3, AI, and tech talent, where payments and postings happen through blockchain.

### 1) Target user base & personas

- Primary
  - Web3 Developers & AI Engineers (Age: 20–35)
    - Freelancers, blockchain devs, ML engineers, startup tech talent
    - Hang out on GitHub, LinkedIn, Telegram, and Discord
  - Startup Founders & Hiring Managers (Age: 25–40)
    - Small Indian startups hiring for tech roles
    - Budget-conscious, early tech adopters
- Secondary
  - Students & Freshers from Tier 1–3 engineering colleges (internships, freelance)
  - Freelancers in Design, Marketing, and Content targeting Web3/AI projects

### 2) 3‑month roadmap to 10,000 users

- Month 1 — Awareness & early adopters
  - Launch beta to selected groups; target Telegram/Discord Web3 communities (Polygon India, Solana India, ETHIndia)
  - Manually onboard first 200 job seekers and 20 employers
  - Use LinkedIn posts + warm connections
- Month 2 — Growth via referrals
  - Launch “Refer & Earn”: invite 3 friends = free job posting credit (backend-tracked referral links)
  - Target college blockchain clubs & hackathons; offer free postings for campus recruiters; collaborate with Web3 student DAOs
- Month 3 — Mass outreach & retention
  - Start Twitter/X and LinkedIn ads (₹3,000 split)
  - Publish success stories/testimonials from early hires
  - Organize a virtual hiring day for Web3 startups (free for employers, PR‑friendly)

### 3) Marketing plan — ₹5,000 budget split

| Channel           | Budget | Tactic                                                       |
| ----------------- | -----: | ------------------------------------------------------------ |
| LinkedIn Ads      | ₹2,000 | Target “Blockchain Developers” & “Startup Founders” in India |
| Twitter/X Ads     | ₹1,000 | Promote posts in Web3 communities                            |
| WhatsApp/Telegram |     ₹0 | Share in relevant groups                                     |
| Referral Rewards  |   ₹500 | Job post credits for qualified referrals                     |
| Content Creation  | ₹1,500 | Posters, infographics, short reels                           |

Note: Start with small A/B creatives; double down on best CTR and lowest CAC. Use UTM tags on all links.

### 4) Revenue streams

- Pay‑per‑job post: 0.01 SOL per posting (ETH optional later)
- Subscription: ₹150/month for unlimited applications + featured profile
- Featured Job Boost: ₹300 per boost for higher visibility

### 5) Example marketing content

- Post idea: “Tired of fake job listings? On Hire3, every post is blockchain‑verified. No spam, just real opportunities.”
  - Hashtags: #Hire3 #Web3Jobs #BlockchainIndia
- Visual: Bold typography + crypto payment badge + AI “match score” screenshot

### 6) Scaling beyond MVP

- Partner with Polygon India or ETHIndia hackathons to onboard devs
- Add role‑based access and (future) smart contracts for trust
- Expand to Southeast Asia after Indian traction

### Targets, KPIs, and instrumentation (relevant data)

- Top‑line targets (first 3 months)
  - 10,000 total signups; 30% MAU; 200+ employers; 500+ verified job posts
  - Activation: >40% of new users complete profile + add ≥3 skills
  - Employer conversion: >25% of registered employers post at least one job
- Funnel metrics to track
  - Visit → Signup → Profile Complete → Apply/Post → Retain (D7/D30)
  - CAC by channel; CTR/CVR for each ad/creative; referral K‑factor
- In‑product telemetry
  - Add basic event logging: auth, profile_complete, post_job_opened, payment_initiated, payment_verified, job_posted, application_submitted
  - Attribute referral codes and UTM params to user records
  - Weekly cohort and retention snapshots

### Unit economics (initial assumptions)

- Average revenue per posting ≈ 0.01 SOL; with boosts/subscriptions target ARPU ₹60–₹120/mo
- Target CAC: < ₹30 for job seekers; < ₹150 for employers
- Break‑even goal: ≥1 paid post per 3 employers onboarded or ≥1 subscription per 10 active seekers

### Risks & mitigations

- Low employer adoption → Proactive outreach, hiring day events, “first post free” with referral
- Payment friction → Keep devnet demo path, clear Phantom prompts, backup QR/code flow
- Trust deficit → Verified profiles, testimonials, transparent on‑chain receipts

### Launch checklist (GTM)

- Ship referral links + tracking; seed 10+ partner communities
- Publish 3 case studies; 5 short reels; 3 blog posts
- Run ₹5k ad experiment; report CAC/CTR; iterate creatives weekly
- Host virtual hiring day; collect NPS and testimonials
