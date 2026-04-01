import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calculateHireTotal, endOfDay, getAvailabilityForRange, startOfDay } from "@/lib/catalog";
import { validateStoredPhoneNumber } from "@/lib/phone";

export const runtime = "nodejs";

const bookingSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(40).optional().or(z.literal("")).default(""),
});

function formatPriceForLineItem(item: { pricingModel: string; name: string }) {
  if (item.pricingModel === "PER_METER_PER_WEEK") return `${item.name} hire`;
  if (item.pricingModel === "PER_WEEK") return `${item.name} weekly hire`;
  if (item.pricingModel === "FIXED") return `${item.name} booking`;
  return `${item.name} daily hire`;
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const body = bookingSchema.parse(await request.json());
    const item = await prisma.catalogItem.findUnique({ where: { slug: params.slug } });

    if (!item || !item.isActive || item.itemType !== "HIRE") {
      return NextResponse.json({ error: "Hire item not found" }, { status: 404 });
    }

    const startDate = startOfDay(new Date(body.startDate));
    const endDate = endOfDay(new Date(body.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return NextResponse.json({ error: "Invalid booking dates" }, { status: 400 });
    }

    const minEndDate = new Date(startDate);
    minEndDate.setDate(minEndDate.getDate() + Math.max(0, item.minHireDays - 1));
    if (endDate < endOfDay(minEndDate)) {
      return NextResponse.json({ error: `Minimum hire period is ${item.minHireDays} day(s)` }, { status: 400 });
    }

    const availability = await getAvailabilityForRange({
      itemId: item.id,
      quantityAvailable: item.quantityAvailable,
      startDate,
      endDate,
    });

    if (availability.remaining < body.quantity) {
      return NextResponse.json({ error: "Selected quantity is not available for those dates" }, { status: 409 });
    }

    const phoneValidation = validateStoredPhoneNumber(body.customerPhone);
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: phoneValidation.message }, { status: 400 });
    }

    const pricing = calculateHireTotal({
      pricingModel: item.pricingModel,
      price: item.price,
      startDate,
      endDate,
      quantity: body.quantity,
    });

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const booking = await prisma.hireBooking.create({
      data: {
        itemId: item.id,
        userId: session?.user?.id || null,
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim().toLowerCase(),
        customerPhone: phoneValidation.normalized,
        startDate,
        endDate,
        quantity: body.quantity,
        billableUnits: pricing.billableUnits,
        totalPrice: pricing.totalPrice,
        currency: "AUD",
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: expiresAt,
      },
    });

    const successBase = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${successBase}/sales-hire/${item.slug}?booking=success`,
      cancel_url: `${successBase}/sales-hire/${item.slug}?booking=cancelled`,
      customer_email: booking.customerEmail,
      metadata: {
        type: "hire_booking",
        bookingId: booking.id,
        itemId: item.id,
        userId: session?.user?.id || "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: Math.round(pricing.totalPrice * 100),
            product_data: {
              name: formatPriceForLineItem(item),
              description: `${body.quantity} unit(s), ${startDate.toDateString()} to ${endDate.toDateString()}`,
            },
          },
        },
      ],
    });

    await prisma.hireBooking.update({
      where: { id: booking.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url, bookingId: booking.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error creating booking checkout:", error);
      return NextResponse.json({ error: error.message || "Payment setup failed" }, { status: 400 });
    }
    console.error("Error creating hire booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
