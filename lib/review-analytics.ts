import { prisma } from "@/lib/prisma";

function getReviewDelegate() {
  return (prisma as any).jobReview;
}

function getReviewRequestDelegate() {
  return (prisma as any).jobReviewRequest;
}

export function hasReviewDelegates() {
  return Boolean(getReviewDelegate() && getReviewRequestDelegate());
}

export async function getReviewAggregate() {
  const reviewDelegate = getReviewDelegate();

  if (!reviewDelegate) {
    return {
      _avg: { rating: null as number | null },
      _count: { id: 0 },
    };
  }

  return reviewDelegate.aggregate({
    _avg: { rating: true },
    _count: { id: true },
  });
}

export async function getReviewRatingCounts() {
  const reviewDelegate = getReviewDelegate();

  if (!reviewDelegate) {
    return [] as Array<{ rating: number; _count: { id: number } }>;
  }

  return reviewDelegate.groupBy({
    by: ["rating"],
    _count: { id: true },
    orderBy: { rating: "desc" },
  });
}

export async function getReviewsByServiceRequestIds(serviceRequestIds: string[]) {
  const reviewDelegate = getReviewDelegate();

  if (!reviewDelegate || serviceRequestIds.length === 0) {
    return [] as Array<{ serviceRequestId: string; rating: number; comment: string | null; createdAt: Date }>;
  }

  return reviewDelegate.findMany({
    where: {
      serviceRequestId: {
        in: serviceRequestIds,
      },
    },
  });
}

export async function getReviewByServiceRequestId(serviceRequestId: string) {
  const reviewDelegate = getReviewDelegate();

  if (!reviewDelegate) {
    return null as { serviceRequestId: string; rating: number; comment: string | null; createdAt: Date } | null;
  }

  return reviewDelegate.findUnique({
    where: { serviceRequestId },
  });
}

export async function getReviewRequestByServiceRequestId(serviceRequestId: string) {
  const reviewRequestDelegate = getReviewRequestDelegate();

  if (!reviewRequestDelegate) {
    return null as { createdAt: Date; expiresAt: Date } | null;
  }

  return reviewRequestDelegate.findUnique({
    where: { serviceRequestId },
  });
}

export async function upsertReviewRequest(input: {
  serviceRequestId: string;
  tokenHash: string;
  sentToEmail: string;
  expiresAt: Date;
}) {
  const reviewRequestDelegate = getReviewRequestDelegate();

  if (!reviewRequestDelegate) {
    return null;
  }

  return reviewRequestDelegate.upsert({
    where: { serviceRequestId: input.serviceRequestId },
    update: {
      tokenHash: input.tokenHash,
      sentToEmail: input.sentToEmail,
      expiresAt: input.expiresAt,
      usedAt: null,
    },
    create: {
      serviceRequestId: input.serviceRequestId,
      tokenHash: input.tokenHash,
      sentToEmail: input.sentToEmail,
      expiresAt: input.expiresAt,
    },
  });
}
