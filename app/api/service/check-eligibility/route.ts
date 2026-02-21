import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getPlanFromPriceId } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const hasAccess = session.user.role === "ADMIN" || (sub && sub.status === "ACTIVE");

  if (!hasAccess) {
    return new NextResponse("Active subscription required", { status: 403 });
  }

  const body = await req.json();
  const { type, description, urgency } = body;
  
  // Admins get premium benefits
  const planKey = session.user.role === "ADMIN" ? "PREMIUM" : (sub?.plan || "BASIC");
  const plan = PLANS[planKey as keyof typeof PLANS] || PLANS["BASIC"];
  
  let eligibility = "QUOTED";
  let explanation = "";
  let discount = plan.discounts.allJobs;

  if (type === "LEAKING_TAP" || type === "LEAKING_TOILET") {
    if (planKey === "STANDARD" || planKey === "PREMIUM") {
      eligibility = "INCLUDED";
      explanation = "Covered under Standard/Premium plan.";
    }
  } else if (type === "MINOR_BLOCKAGE") {
    if (planKey === "STANDARD" || planKey === "PREMIUM") {
      eligibility = "INCLUDED";
      explanation = "Minor blockages are covered.";
    }
  }

  if (urgency === "EMERGENCY") {
    if (planKey === "PREMIUM") {
      eligibility = "INCLUDED"; // Or priority response
      explanation = "Priority emergency response included.";
    } else {
      explanation = "Emergency response available but quoted separately.";
    }
  }

  return NextResponse.json({
    eligibility,
    explanation,
    discountPercent: discount * 100,
  });
}
