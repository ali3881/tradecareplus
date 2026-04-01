# TradeCarePlus

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- npm or yarn

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` is set. 

**For Local Development Against Live/Staging PostgreSQL:**
```
DATABASE_URL="postgresql://user:password@host:5432/tradecareplus?schema=public"
```

**For Production (PostgreSQL):**
```
DATABASE_URL="postgresql://user:password@host:5432/tradecareplus?schema=public"
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

Run database migrations:
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

**PostgreSQL (Dev/Prod/Staging):**
*Caution: This destroys data*
```bash
npx prisma migrate reset
```

### Prisma Client After DB Changes

If you change `DATABASE_URL` or switch databases, regenerate the Prisma client:

```bash
npx prisma generate
```

## Health Check

You can check the system status at:
`GET /api/health`

Returns:
- `200 OK`: Database connected
- `503 Service Unavailable`: Database down (check logs/env)
