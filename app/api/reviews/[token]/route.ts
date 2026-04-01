import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRatingLabel, getReviewRequestByToken, getReviewRequestState } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const reviewRequest = await getReviewRequestByToken(params.token);
    const state = getReviewRequestState(reviewRequest);

    if (!reviewRequest || state === "missing") {
      return NextResponse.json({ error: "Review link not found." }, { status: 404 });
    }

    return NextResponse.json({
      state,
      job: {
        id: reviewRequest.serviceRequest.id,
        type: reviewRequest.serviceRequest.type,
        description: reviewRequest.serviceRequest.description,
        completedAt: reviewRequest.serviceRequest.completedAt,
        customerName: reviewRequest.serviceRequest.user.name,
        technicianName: reviewRequest.serviceRequest.assignedTo?.name || null,
      },
      review: reviewRequest.serviceRequest.review
        ? {
            rating: reviewRequest.serviceRequest.review.rating,
            comment: reviewRequest.serviceRequest.review.comment,
            label: getRatingLabel(reviewRequest.serviceRequest.review.rating),
            createdAt: reviewRequest.serviceRequest.review.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error loading review request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const reviewRequest = await getReviewRequestByToken(params.token);
    const state = getReviewRequestState(reviewRequest);

    if (!reviewRequest) {
      return NextResponse.json({ error: "Review link not found." }, { status: 404 });
    }

    if (state === "used") {
      return NextResponse.json({ error: "This review link has already been used." }, { status: 409 });
    }

    if (state === "expired") {
      return NextResponse.json({ error: "This review link has expired." }, { status: 410 });
    }

    if (state !== "active") {
      return NextResponse.json({ error: "This review link is not active." }, { status: 400 });
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.jobReview.create({
        data: {
          serviceRequestId: reviewRequest.serviceRequestId,
          userId: reviewRequest.serviceRequest.userId,
          rating,
          comment: comment || null,
        },
      });

      await tx.jobReviewRequest.update({
        where: { id: reviewRequest.id },
        data: {
          usedAt: new Date(),
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      review: {
        rating: review.rating,
        comment: review.comment,
        label: getRatingLabel(review.rating),
      },
    });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A review for this job already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
