import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sanitizeCatalogHtml, slugifyCatalogName } from "@/lib/catalog";

export const runtime = "nodejs";

const catalogItemSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  itemType: z.enum(["HIRE", "SALE"]),
  pricingModel: z.enum(["PER_DAY", "PER_WEEK", "PER_METER_PER_WEEK", "FIXED"]),
  price: z.number().min(0),
  quantityAvailable: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")).default(""),
  shortDescription: z.string().max(240).optional().or(z.literal("")).default(""),
  description: z.string().min(1).max(5000),
  unitLabel: z.string().max(40).optional().or(z.literal("")).default(""),
  minHireDays: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

async function ensureUniqueSlug(name: string, id: string) {
  const base = slugifyCatalogName(name);
  let slug = base || `item-${Date.now()}`;
  let suffix = 1;

  for (;;) {
    const existing = await prisma.catalogItem.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const item = await prisma.catalogItem.findUnique({ where: { id: params.id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching catalog item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = catalogItemSchema.parse(await request.json());
    const slug = await ensureUniqueSlug(body.name, params.id);

    const item = await prisma.catalogItem.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        slug,
        category: body.category.trim(),
        itemType: body.itemType,
        pricingModel: body.pricingModel,
        price: body.price,
        quantityAvailable: body.quantityAvailable,
        imageUrl: body.imageUrl.trim() || null,
        shortDescription: body.shortDescription.trim() || null,
        description: sanitizeCatalogHtml(body.description),
        unitLabel: body.unitLabel.trim() || null,
        minHireDays: body.itemType === "HIRE" ? body.minHireDays : 1,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    console.error("Error updating catalog item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.catalogItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    console.error("Error deleting catalog item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
