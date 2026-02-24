import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const packageSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  currency: z.string().min(1).max(10),
  duration: z.string().min(1).max(50),
  features: z.array(z.string().min(1)).min(1),
  isMostPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const packages = await prisma.subscriptionPackage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(
      packages.map((p) => ({
        ...p,
        features: (() => {
          try {
            return JSON.parse(p.featuresJson || "[]");
          } catch {
            return [];
          }
        })(),
      }))
    );
  } catch (error) {
    console.error("Error fetching admin packages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = packageSchema.parse(await request.json());

    if (body.isMostPopular) {
      await prisma.subscriptionPackage.updateMany({ data: { isMostPopular: false } });
    }

    const maxSort = await prisma.subscriptionPackage.aggregate({
      _max: { sortOrder: true },
    });

    const created = await prisma.subscriptionPackage.create({
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        price: body.price,
        currency: body.currency.trim().toUpperCase(),
        duration: body.duration.trim(),
        featuresJson: JSON.stringify(body.features),
        isMostPopular: body.isMostPopular,
        isActive: body.isActive,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating package:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
