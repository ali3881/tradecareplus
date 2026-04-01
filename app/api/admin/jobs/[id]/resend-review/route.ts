import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/admin";
import { buildJobRatingEmailTemplate, sendMail } from "@/lib/mailer";
import { createReviewToken, getReviewExpiryDate, getReviewUrl, hashReviewToken } from "@/lib/reviews";
import { hasReviewDelegates, upsertReviewRequest } from "@/lib/review-analytics";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    const isAdmin = session.user.role === "ADMIN";

    const job = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!isAdmin && job.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (job.status !== "COMPLETED") {
      return NextResponse.json({ error: "Only completed jobs can send review requests." }, { status: 400 });
    }

    if (!hasReviewDelegates()) {
      return NextResponse.json({ error: "Review system is not ready in the current runtime. Restart the server and try again." }, { status: 503 });
    }

    const rawToken = createReviewToken();
    const tokenHash = hashReviewToken(rawToken);
    const expiresAt = getReviewExpiryDate();

    await upsertReviewRequest({
      serviceRequestId: params.id,
      tokenHash,
      sentToEmail: job.user.email,
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
      customerName: job.user.name || "",
      businessName: settingsMap.businessName || "TradeCarePlus",
      jobLabel: job.type.replaceAll("_", " ").toLowerCase(),
      reviewUrl,
      supportEmail: settingsMap.supportEmail || "support@tradecareplus.com",
    });

    await sendMail({
      to: job.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resending review request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
