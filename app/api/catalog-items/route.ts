import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("type");
    const category = searchParams.get("category");

    const items = await prisma.catalogItem.findMany({
      where: {
        isActive: true,
        ...(itemType ? { itemType } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching public catalog items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
