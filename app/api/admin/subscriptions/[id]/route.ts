import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { status } = body;

    const current = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!current) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (status === "CANCELED" && current.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(current.stripeSubscriptionId);
    }

    const sub = await prisma.subscription.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(sub);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
