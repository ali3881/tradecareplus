import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/admin";
import { buildJobRatingEmailTemplate, sendMail } from "@/lib/mailer";
import { createReviewToken, getReviewExpiryDate, getReviewUrl, hashReviewToken } from "@/lib/reviews";
import { getReviewByServiceRequestId, hasReviewDelegates, upsertReviewRequest } from "@/lib/review-analytics";
import { buildJobCompletedSms, sendSms } from "@/lib/sms";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    const isAdmin = session.user.role === "ADMIN";

    const job = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        attachments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!isAdmin && job.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.serviceRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    const isAdmin = session.user.role === "ADMIN";
    const body = await request.json();
    const { status, assignedToId } = body;

    const existingJob = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!isAdmin && existingJob.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (isAdmin && assignedToId !== undefined) data.assignedToId = assignedToId;

    const existingReview = await getReviewByServiceRequestId(params.id);

    const job = await prisma.serviceRequest.update({
      where: { id: params.id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const transitionedToCompleted =
      status === "COMPLETED" && existingJob.status !== "COMPLETED" && !existingReview;

    if (transitionedToCompleted && hasReviewDelegates()) {
      const rawToken = createReviewToken();
      const tokenHash = hashReviewToken(rawToken);
      const expiresAt = getReviewExpiryDate();

      await upsertReviewRequest({
        serviceRequestId: params.id,
        tokenHash,
        sentToEmail: existingJob.user.email,
        expiresAt,
      });

      const settings = await prisma.systemSetting.findMany({
        where: {
          key: {
            in: ["businessName", "supportEmail"],
          },
        },
      });

      const settingsMap = settings.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      const reviewUrl = getReviewUrl(rawToken);
      const emailTemplate = buildJobRatingEmailTemplate({
        customerName: existingJob.user.name || "",
        businessName: settingsMap.businessName || "TradeCarePlus",
        jobLabel: job.type.replaceAll("_", " ").toLowerCase(),
        reviewUrl,
        supportEmail: settingsMap.supportEmail || "support@tradecareplus.com",
      });

      try {
        await sendMail({
          to: existingJob.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
      } catch (mailError) {
        console.error("Failed to send job review email:", mailError);
      }
    } else if (transitionedToCompleted) {
      console.warn("Review delegates unavailable in current runtime. Job was completed without creating a review request.");
    }

    if (status === "COMPLETED" && existingJob.status !== "COMPLETED" && existingJob.user.phone) {
      try {
        await sendSms({
          to: existingJob.user.phone,
          body: buildJobCompletedSms({
            customerName: existingJob.user.name,
            jobType: existingJob.type,
          }),
        });
      } catch (smsError) {
        console.error("Failed to send job completed SMS:", smsError);
      }
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
