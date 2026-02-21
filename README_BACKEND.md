# TradeCarePlus Backend

This is the backend implementation for TradeCarePlus, built with Next.js App Router, Prisma, NextAuth, Stripe, Pusher, and AWS S3.

## Features

- **Authentication**: Email/Password via NextAuth (Credentials Provider).
- **Subscriptions**: Stripe Checkout & Webhooks (Basic, Standard, Premium).
- **Entitlements**: Automated tracking of included visits and service eligibility based on plans.
- **Chat**: Real-time chat with file uploads (S3 Presigned URLs) using Pusher.
- **Video Calls**: Daily.co integration for video rooms.
- **Admin**: Endpoints for managing subscriptions and service requests.

## Prerequisites

- Node.js 18+
- PostgreSQL Database
- Stripe Account
- Pusher Account
- AWS S3 Bucket
- Daily.co Account

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/tradecareplus"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_STANDARD_PRICE_ID="price_..."
STRIPE_PREMIUM_PRICE_ID="price_..."

PUSHER_APP_ID="app_id"
PUSHER_KEY="key"
PUSHER_SECRET="secret"
PUSHER_CLUSTER="us2"

AWS_ACCESS_KEY_ID="aws_key"
AWS_SECRET_ACCESS_KEY="aws_secret"
AWS_REGION="us-east-1"
S3_BUCKET="bucket-name"

DAILY_API_KEY="daily_key"

EMERGENCY_FALLBACK_NUMBER="+15550199"
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Seed the database (optional):
   You can create a seed script in `prisma/seed.ts` to add an initial admin user.

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Auth**: `/api/auth/*`
- **Billing**:
  - POST `/api/billing/create-checkout-session`
  - POST `/api/billing/create-portal-session`
  - POST `/api/webhooks/stripe`
- **Chat**:
  - GET `/api/chat/threads`
  - POST `/api/chat/threads`
  - GET `/api/chat/threads/:id/messages`
  - POST `/api/chat/threads/:id/messages`
  - POST `/api/chat/uploads/presign`
- **Video**:
  - POST `/api/video/rooms`
- **Service**:
  - POST `/api/service/check-eligibility`
  - GET `/api/emergency/fallback`
- **Admin**:
  - GET `/api/admin/subscriptions`
  - GET `/api/admin/service-requests`

## Testing

1. **Stripe Webhooks**: Use Stripe CLI to forward webhooks to localhost.
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. **Chat**: Use two different browsers/incognito windows to test real-time chat (requires Pusher setup).

## Notes

- Ensure `NEXTAUTH_URL` matches your deployment URL in production.
- Configure S3 CORS to allow uploads from your domain.
- Verify Stripe price IDs match your Stripe Dashboard.
