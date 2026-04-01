import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReviewsByServiceRequestIds } from "@/lib/review-analytics";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const [users, jobs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.serviceRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const reviews = await getReviewsByServiceRequestIds(jobs.map((job) => job.id));
    const reviewMap = new Map(
      reviews.map((review: { serviceRequestId: string; rating: number; comment: string | null; createdAt: Date }) => [review.serviceRequestId, review])
    );
    const jobsWithReviews = jobs.map((job) => ({
      ...job,
      review: reviewMap.get(job.id) || null,
    }));

    return NextResponse.json({ users, jobs: jobsWithReviews });
  } catch (error) {
    console.error("Error fetching admin summary:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
