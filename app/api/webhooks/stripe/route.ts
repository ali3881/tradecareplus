import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string
    )) as Stripe.Subscription;

    if (!session?.metadata?.userId || !session?.metadata?.plan) {
      return new NextResponse("User ID or Plan is missing from metadata", { status: 400 });
    }

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    
    // Create or update subscription
    await prisma.subscription.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        plan: plan as any, // "BASIC", "STANDARD", "PREMIUM"
        status: subscription.status.toUpperCase() as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        stripeSubscriptionId: subscription.id,
        plan: plan as any,
        status: subscription.status.toUpperCase() as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Create entitlements
    let includedVisits = 0;
    if (plan === "STANDARD" || plan === "PREMIUM") includedVisits = 10;
    
    // Handle CCTV/Jet Blast due dates if Premium
    const now = new Date();
    const threeMonths = new Date(now.setMonth(now.getMonth() + 3));

    await prisma.entitlement.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        year: new Date().getFullYear(),
        includedVisitsRemaining: includedVisits,
        cctvDueAt: plan === "PREMIUM" ? threeMonths : null,
        jetBlastDueAt: plan === "PREMIUM" ? threeMonths : null,
      },
      update: {
        includedVisitsRemaining: includedVisits, // Reset on new sub? Or logic needed?
        cctvDueAt: plan === "PREMIUM" ? threeMonths : null,
      },
    });
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status.toUpperCase() as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "CANCELED", // Or delete? Usually keep as canceled.
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
