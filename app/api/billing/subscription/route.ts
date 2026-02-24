import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json({ subscription: subscription || null });
    }

    // Always sync latest state from Stripe to avoid stale status/cancel flags in UI.
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      const stripeSubAny = stripeSub as any;
      const startUnix = stripeSubAny.current_period_start ?? stripeSubAny.items?.data?.[0]?.current_period_start ?? null;
      const endUnix = stripeSubAny.current_period_end ?? stripeSubAny.items?.data?.[0]?.current_period_end ?? null;

      const synced = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSub.status.toUpperCase(),
          cancelAtPeriodEnd: stripeSubAny.cancel_at_period_end === true,
          ...(startUnix ? { currentPeriodStart: new Date(startUnix * 1000) } : {}),
          ...(endUnix ? { currentPeriodEnd: new Date(endUnix * 1000) } : {}),
        },
      });

      return NextResponse.json({ subscription: synced });
    } catch (stripeError) {
      console.error("Stripe sync failed in billing/subscription route:", stripeError);
      return NextResponse.json({ subscription });
    }
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
