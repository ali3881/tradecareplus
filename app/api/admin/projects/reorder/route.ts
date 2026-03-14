import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

function isMissingSortOrderColumnError(error: unknown) {
  return error instanceof Error && /sortOrder/i.test(error.message) && /column|field/i.test(error.message);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = reorderSchema.parse(await request.json());

    await prisma.$transaction(
      body.ids.map((id, index) =>
        prisma.project.update({
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
    if (isMissingSortOrderColumnError(error)) {
      return NextResponse.json(
        { error: "Project ordering is not available yet on this database. Run the latest Prisma schema update first." },
        { status: 409 }
      );
    }
    console.error("Error reordering projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
