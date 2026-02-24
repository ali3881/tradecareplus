import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.serviceType.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching service types:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
