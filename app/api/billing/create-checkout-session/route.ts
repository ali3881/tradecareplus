import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function parseRecurringFromDuration(duration: string): { interval: Stripe.PriceCreateParams.Recurring.Interval; interval_count: number } {
  const normalized = duration.trim().toLowerCase();
  const match = normalized.match(/^(\d+)\s*(month|months|year|years)$/);

  if (!match) {
    return { interval: "month", interval_count: 1 };
  }

  const count = Math.max(1, Number(match[1]) || 1);
  const unit = match[2];
  const interval: Stripe.PriceCreateParams.Recurring.Interval = unit.startsWith("year") ? "year" : "month";

  return { interval, interval_count: count };
}

async function getOrCreateStripePriceIdForPackage(pkg: {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  stripePriceId: string | null;
}) {
  const unitAmount = Math.round(pkg.price * 100);
  const currency = pkg.currency.trim().toLowerCase();
  const recurring = parseRecurringFromDuration(pkg.duration);

  if (pkg.stripePriceId) {
    try {
      const existing = await stripe.prices.retrieve(pkg.stripePriceId);
      const isMatching =
        existing.active &&
        existing.unit_amount === unitAmount &&
        existing.currency === currency &&
        existing.type === "recurring" &&
        existing.recurring?.interval === recurring.interval &&
        existing.recurring?.interval_count === recurring.interval_count;

      if (isMatching) return existing.id;
    } catch {
      // Price deleted/invalid in Stripe; create a new one.
    }
  }

  const created = await stripe.prices.create({
    currency,
    unit_amount: unitAmount,
    recurring,
    product_data: {
      name: pkg.title,
      metadata: {
        packageId: pkg.id,
      },
    },
    metadata: {
      packageId: pkg.id,
    },
  });

  await prisma.subscriptionPackage.update({
    where: { id: pkg.id },
    data: { stripePriceId: created.id },
  });

  return created.id;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { plan, packageId } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { subscription: true },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  let pkg = packageId
    ? await prisma.subscriptionPackage.findUnique({ where: { id: packageId } })
    : null;

  if (!pkg && plan) {
    pkg = await prisma.subscriptionPackage.findFirst({
      where: { isActive: true, title: String(plan).trim() },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  if (!pkg) {
    pkg = await prisma.subscriptionPackage.findFirst({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  if (!pkg || !pkg.isActive) {
    return new NextResponse("No active package found", { status: 404 });
  }

  const resolvedPlan = pkg.title;
  const resolvedPackageId = pkg.id;
  const priceId = await getOrCreateStripePriceIdForPackage(pkg);

  // If user already has a Stripe Customer ID, reuse it.
  let stripeCustomerId = user.subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
    });
    stripeCustomerId = customer.id;
  }

  const createCheckoutSession = async (customerId: string) =>
    stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/packages?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: resolvedPlan || "",
        packageId: resolvedPackageId,
      },
    });

  let checkoutSession;
  try {
    checkoutSession = await createCheckoutSession(stripeCustomerId);
  } catch (error: any) {
    const rawMessage = String(error?.raw?.message || error?.message || "").toLowerCase();
    const isCurrencyConflict =
      error?.type === "StripeInvalidRequestError" &&
      rawMessage.includes("cannot combine currencies on a single customer");

    if (!isCurrencyConflict) {
      throw error;
    }

    // Stripe restricts mixed-currency subscriptions for one customer.
    // Create a fresh customer and retry checkout once.
    const replacementCustomer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    checkoutSession = await createCheckoutSession(replacementCustomer.id);
  }

  return NextResponse.json({ url: checkoutSession.url });
}
