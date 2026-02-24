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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id: params.id },
    });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...pkg,
      features: (() => {
        try {
          return JSON.parse(pkg.featuresJson || "[]");
        } catch {
          return [];
        }
      })(),
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = packageSchema.parse(await request.json());

    if (body.isMostPopular) {
      await prisma.subscriptionPackage.updateMany({ data: { isMostPopular: false } });
    }

    const updated = await prisma.subscriptionPackage.update({
      where: { id: params.id },
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        price: body.price,
        currency: body.currency.trim().toUpperCase(),
        duration: body.duration.trim(),
        featuresJson: JSON.stringify(body.features),
        isMostPopular: body.isMostPopular,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.subscriptionPackage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
