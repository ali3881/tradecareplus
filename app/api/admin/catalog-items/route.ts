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

async function createUniqueSlug(name: string) {
  const base = slugifyCatalogName(name);
  let slug = base || `item-${Date.now()}`;
  let suffix = 1;

  while (await prisma.catalogItem.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.catalogItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching catalog items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = catalogItemSchema.parse(await request.json());
    const maxSort = await prisma.catalogItem.aggregate({ _max: { sortOrder: true } });
    const slug = await createUniqueSlug(body.name);

    const item = await prisma.catalogItem.create({
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
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating catalog item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
