import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeSubscriptionId) {
      return new NextResponse("No active subscription found", { status: 400 });
    }

    const updatedStripeSub = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    const updatedStripeSubAny = updatedStripeSub as any;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
        ...(updatedStripeSubAny.current_period_end
          ? { currentPeriodEnd: new Date(updatedStripeSubAny.current_period_end * 1000) }
          : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
