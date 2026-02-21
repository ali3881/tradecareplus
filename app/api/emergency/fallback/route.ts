import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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

  let showFallback = false;
  let reason = "";

  if (session.user.role === "ADMIN") {
    showFallback = true;
    reason = "Admin access.";
  } else if (sub?.plan === "PREMIUM") {
    showFallback = true;
    reason = "Premium members have 24/7 emergency access.";
  } else if (sub.plan === "STANDARD") {
    // Check if minor blocked drain or just allow standard fallback for certain things
    showFallback = true;
    reason = "Standard members have 24/7 minor blockage access.";
  } else {
    // Check if chat/video system is down (mock check)
    const isSystemDown = false; // Implement real check if needed
    if (isSystemDown) {
      showFallback = true;
      reason = "System is currently unavailable.";
    }
  }

  return NextResponse.json({
    showFallback,
    number: process.env.EMERGENCY_FALLBACK_NUMBER,
    reason,
  });
}
