import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { plan } = body;

  if (!plan) {
    return new NextResponse("Plan is required", { status: 400 });
  }

  let priceId = "";
  switch (plan) {
    case "BASIC":
      priceId = process.env.STRIPE_BASIC_PRICE_ID!;
      break;
    case "STANDARD":
      priceId = process.env.STRIPE_STANDARD_PRICE_ID!;
      break;
    case "PREMIUM":
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID!;
      break;
    default:
      return new NextResponse("Invalid plan", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { subscription: true },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  // If user already has a Stripe Customer ID, reuse it
  let stripeCustomerId = user.subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
    });
    stripeCustomerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
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
    metadata: {
      userId: user.id,
      plan: plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
