# TradeCarePlus

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- npm or yarn

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env
```

Ensure `DATABASE_URL` is set. 

**For Local Development (SQLite):**
```
DATABASE_URL="file:./dev.db"
```

**For Production (PostgreSQL):**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 3. Setup & Run

Install dependencies:
```bash
npm install
```

Generate Prisma client:
```bash
npx prisma generate
```

Run database migrations (creates `dev.db` for SQLite):
```bash
npx prisma migrate dev
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Management

### Reset Database

**SQLite (Local):**
Delete the `dev.db` file and re-run migrations:
```bash
rm dev.db
npx prisma migrate dev
```

**PostgreSQL (Prod/Staging):**
*Caution: This destroys data*
```bash
npx prisma migrate reset
```

### Switching to PostgreSQL

1. Update `DATABASE_URL` in `.env` to your Postgres connection string.
2. Update `prisma/schema.prisma`:
   Change `provider = "sqlite"` to `provider = "postgresql"`.
3. Run `npx prisma generate` and `npx prisma migrate dev`.

## Health Check

You can check the system status at:
`GET /api/health`

Returns:
- `200 OK`: Database connected
- `503 Service Unavailable`: Database down (check logs/env)
