import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let items;

    try {
      items = await prisma.service.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      console.warn("Falling back to createdAt ordering for services:", error);

      items = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
