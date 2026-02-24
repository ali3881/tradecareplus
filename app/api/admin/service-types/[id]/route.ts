import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const updateSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = updateSchema.parse(await request.json());

    const updated = await prisma.serviceType.update({
      where: { id: params.id },
      data: { title: body.title.trim() },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Service type title already exists" }, { status: 409 });
    }
    console.error("Error updating service type:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.serviceType.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Service type not found" }, { status: 404 });
    }
    console.error("Error deleting service type:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
