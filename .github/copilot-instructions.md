# Hire3 AI Agent Instructions

## Project Overview
Hire3 is a full-stack Web3 talent platform: **React + Vite + Tailwind** frontend, **Express + TypeScript + Prisma/PostgreSQL** backend, with **Solana payments** for job posting fees.

## Architecture

### Data Flow: Job Creation with Web3 Payment
1. Frontend calls `GET /api/payments/required` → gets `requiredLamports` and admin wallet
2. Frontend uses `web3/solana.ts` → Phantom wallet signs & sends SOL transfer
3. Frontend calls `POST /api/payments/verify` with signature → backend verifies via Solana RPC
4. Frontend calls `POST /api/jobs` → backend checks for recent verified payment before creating job

### Key Patterns
- **API Client**: All frontend network calls go through `frontend/src/api/client.ts` with typed helpers and consistent error mapping
- **JSON Arrays in DB**: `skills` and `tags` are stored as JSON strings (not native arrays) in Prisma schema—use `parseArray()`/`toJson()` helpers in routes (see `backend/src/routes/jobRoutes.ts`)
- **Auth State**: Recoil atom at `frontend/src/store/auth.ts` with localStorage persistence; JWT token passed via `Authorization: Bearer <token>`
- **Route Structure**: Backend routes registered in `backend/src/app.ts` under `/api` prefix; AI routes under `/api/ai`

## Developer Workflows

### Running Locally
```bash
# Terminal 1 - Backend (runs on :4000)
cd backend && npm install && npx prisma generate && npm run dev

# Terminal 2 - Frontend (runs on :5173)
cd frontend && npm install && npm run dev
```

### Database Changes
```bash
cd backend
npx prisma migrate dev --name <migration_name>  # Local dev
npx prisma migrate deploy                        # Production
```

### Environment Setup
- Backend: `backend/.env` requires `DATABASE_URL`, `JWT_SECRET`, `SOLANA_ADMIN`, `SOLANA_PLATFORM_FEE_SOL`
- Frontend: `frontend/.env` requires `VITE_API_BASE`, `VITE_SOLANA_RPC`, `VITE_SOLANA_ADMIN`
- `SOLANA_ADMIN` must match between frontend and backend

## Code Conventions

### Backend Routes
- Thin route handlers: validate input → call Prisma → return DTOs
- Use `authMiddleware` from `middleware/auth.ts` for protected routes
- Access user via `req.user.sub` (userId from JWT)
- Error responses: `{ message: string }` with appropriate HTTP status

### Frontend Components
- UI primitives in `components/`: `Button.tsx`, `Card.tsx`, `InputField.tsx`
- Feature components organized by domain: `components/managejobs/`, `components/posts/`
- Pages in `pages/` use React Router; protected routes check `isAuthedSelector`

### Type Definitions
- Frontend types: `frontend/src/types.ts`
- Express request extension: `backend/src/types/express.d.ts`
- Map backend responses to frontend types (see `mapUser()` in `api/client.ts`)

## Key Files Reference
| Purpose | File |
|---------|------|
| API client with all endpoints | `frontend/src/api/client.ts` |
| Solana payment helper | `frontend/src/web3/solana.ts` |
| Payment verification | `backend/src/routes/paymentRoutes.ts` |
| Job CRUD with payment check | `backend/src/routes/jobRoutes.ts` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Auth middleware | `backend/src/middleware/auth.ts` |
| AI resume/job matching | `backend/src/services/ai.ts` |
