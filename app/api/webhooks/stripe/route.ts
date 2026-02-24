import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

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

  const inferPlanFromPriceId = async (priceId?: string | null) => {
    if (!priceId) return null;
    const pkg = await prisma.subscriptionPackage.findFirst({
      where: { stripePriceId: priceId },
      select: { title: true },
    });
    return pkg?.title || null;
  };

  const getPeriodDates = (sub: Stripe.Subscription | any) => {
    const startUnix =
      sub?.current_period_start ??
      sub?.items?.data?.[0]?.current_period_start ??
      null;
    const endUnix =
      sub?.current_period_end ??
      sub?.items?.data?.[0]?.current_period_end ??
      null;

    return {
      periodStart: startUnix ? new Date(startUnix * 1000) : null,
      periodEnd: endUnix ? new Date(endUnix * 1000) : null,
    };
  };

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const stripeSubscriptionId = checkoutSession.subscription as string;
    const userId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id || undefined;

    if (!stripeSubscriptionId || !userId) {
      return new NextResponse("Missing subscription or user metadata", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const priceId = subscription.items.data[0]?.price?.id || null;
    const plan = checkoutSession.metadata?.plan || (await inferPlanFromPriceId(priceId)) || "BASIC";
    const { periodStart, periodEnd } = getPeriodDates(subscription as any);
    
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
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end === true,
        currentPeriodStart: periodStart || new Date(),
        currentPeriodEnd: periodEnd || new Date(),
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        plan: plan as any,
        status: subscription.status.toUpperCase() as any,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end === true,
        ...(periodStart ? { currentPeriodStart: periodStart } : {}),
        ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
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
    const priceId = subscription.items.data[0]?.price?.id || null;
    const plan = await inferPlanFromPriceId(priceId);
    const { periodStart, periodEnd } = getPeriodDates(subscription as any);

    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status.toUpperCase() as any,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end === true,
        ...(plan ? { plan } : {}),
        ...(periodStart ? { currentPeriodStart: periodStart } : {}),
        ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "CANCELED", // Or delete? Usually keep as canceled.
        cancelAtPeriodEnd: false,
      },
    });
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const invoiceAny = invoice as any;
    const subscriptionId = typeof invoiceAny.subscription === "string" ? invoiceAny.subscription : null;
    const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : null;

    let subscription = subscriptionId
      ? await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
      : await prisma.subscription.findFirst({
          where: { stripeCustomerId: stripeCustomerId || "" },
        });

    // If invoice arrives before checkout.session.completed persisted subscription,
    // recover user via checkout session and create subscription row on-demand.
    if (!subscription && subscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const sessions = await stripe.checkout.sessions.list({
        subscription: subscriptionId,
        limit: 1,
      });
      const checkoutSession = sessions.data[0];
      const userId = checkoutSession?.metadata?.userId || checkoutSession?.client_reference_id;
      const priceId = stripeSub.items.data[0]?.price?.id || null;
      const plan = checkoutSession?.metadata?.plan || (await inferPlanFromPriceId(priceId)) || "BASIC";
      const { periodStart, periodEnd } = getPeriodDates(stripeSub as any);

      if (userId) {
        subscription = await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer as string,
            plan,
            status: stripeSub.status.toUpperCase(),
            cancelAtPeriodEnd: (stripeSub as any).cancel_at_period_end === true,
            currentPeriodStart: periodStart || new Date(),
            currentPeriodEnd: periodEnd || new Date(),
          },
          update: {
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer as string,
            plan,
            status: stripeSub.status.toUpperCase(),
            cancelAtPeriodEnd: (stripeSub as any).cancel_at_period_end === true,
            ...(periodStart ? { currentPeriodStart: periodStart } : {}),
            ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
          },
        });
      }
    }

    if (subscription) {
      await prisma.transaction.upsert({
        where: { stripeInvoiceId: invoice.id },
        update: {
          stripePaymentId: typeof invoiceAny.payment_intent === "string" ? invoiceAny.payment_intent : null,
          amount: invoice.amount_paid || invoice.amount_due || 0,
          currency: (invoice.currency || "usd").toUpperCase(),
          status: event.type === "invoice.paid" ? "PAID" : "FAILED",
          description: invoice.description || null,
          subscriptionId: subscription.id,
        },
        create: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          stripeInvoiceId: invoice.id,
          stripePaymentId: typeof invoiceAny.payment_intent === "string" ? invoiceAny.payment_intent : null,
          amount: invoice.amount_paid || invoice.amount_due || 0,
          currency: (invoice.currency || "usd").toUpperCase(),
          status: event.type === "invoice.paid" ? "PAID" : "FAILED",
          description: invoice.description || null,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
