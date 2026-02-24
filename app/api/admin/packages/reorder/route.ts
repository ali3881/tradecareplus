import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = reorderSchema.parse(await request.json());

    await prisma.$transaction(
      body.ids.map((id, index) =>
        prisma.subscriptionPackage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    console.error("Error reordering packages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
