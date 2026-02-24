import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.serviceType.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching admin service types:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await request.json());

    const created = await prisma.serviceType.create({
      data: { title: body.title.trim() },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Service type title already exists" }, { status: 409 });
    }
    console.error("Error creating service type:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
