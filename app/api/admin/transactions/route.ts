import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 500,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
