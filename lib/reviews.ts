import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const REVIEW_TOKEN_TTL_DAYS = 30;

export function createReviewToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashReviewToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getReviewBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getReviewUrl(token: string) {
  return `${getReviewBaseUrl()}/review/${token}`;
}

export function getReviewExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REVIEW_TOKEN_TTL_DAYS);
  return expiresAt;
}

export async function getReviewRequestByToken(token: string) {
  const reviewRequest = await prisma.jobReviewRequest.findUnique({
    where: { tokenHash: hashReviewToken(token) },
    include: {
      serviceRequest: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!reviewRequest) return null;

  const review = await prisma.jobReview.findUnique({
    where: { serviceRequestId: reviewRequest.serviceRequestId },
  });

  return {
    ...reviewRequest,
    serviceRequest: {
      ...reviewRequest.serviceRequest,
      review,
    },
  };
}

export function getReviewRequestState(reviewRequest: Awaited<ReturnType<typeof getReviewRequestByToken>>) {
  if (!reviewRequest) return "missing" as const;
  if (reviewRequest.usedAt || reviewRequest.serviceRequest.review) return "used" as const;
  if (reviewRequest.expiresAt < new Date()) return "expired" as const;
  if (reviewRequest.serviceRequest.status !== "COMPLETED") return "invalid_job_state" as const;
  return "active" as const;
}

export function getRatingLabel(rating: number) {
  if (rating >= 5) return "Excellent";
  if (rating >= 4) return "Good";
  if (rating >= 3) return "Okay";
  if (rating >= 2) return "Poor";
  return "Very Poor";
}
