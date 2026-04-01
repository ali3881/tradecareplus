import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateHireTotal, endOfDay, getAvailabilityForRange, startOfDay } from "@/lib/catalog";

export const runtime = "nodejs";

const availabilitySchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = availabilitySchema.parse(await request.json());
    const item = await prisma.catalogItem.findUnique({
      where: { slug: params.slug },
    });

    if (!item || !item.isActive || item.itemType !== "HIRE") {
      return NextResponse.json({ error: "Hire item not found" }, { status: 404 });
    }

    const startDate = startOfDay(new Date(body.startDate));
    const endDate = endOfDay(new Date(body.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return NextResponse.json({ error: "Invalid booking dates" }, { status: 400 });
    }

    const availability = await getAvailabilityForRange({
      itemId: item.id,
      quantityAvailable: item.quantityAvailable,
      startDate,
      endDate,
    });

    const requestedQuantity = body.quantity;
    const pricing = calculateHireTotal({
      pricingModel: item.pricingModel,
      price: item.price,
      startDate,
      endDate,
      quantity: requestedQuantity,
    });

    return NextResponse.json({
      available: availability.remaining >= requestedQuantity,
      remaining: availability.remaining,
      requestedQuantity,
      billableUnits: pricing.billableUnits,
      totalPrice: pricing.totalPrice,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    console.error("Error checking availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
