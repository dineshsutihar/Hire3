# Hire3 Backend

Express + TypeScript + Prisma (PostgreSQL / Neon) backend for Hire3.

## Stack

- Express
- TypeScript
- Prisma ORM (PostgreSQL / Neon)
- JWT Auth (jsonwebtoken + bcryptjs)
- CORS, dotenv

## Env (.env)

See `.env.example`.

Required:

- DATABASE_URL
- JWT_SECRET
- (optional) PORT, CORS_ORIGIN

## Install & Run

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## API (Base: /api)

POST /register { name,email,password }
POST /login { email,password }
GET /profile (auth)
PUT /profile (auth) { name,bio,linkedinUrl,skills[],walletAddress }

Auth header: Authorization: Bearer <token>

## Deployment (Render)

Build: npm install && npx prisma generate && npm run build
Start: npm run start
