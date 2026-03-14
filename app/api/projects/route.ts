import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let items;

    try {
      items = await prisma.project.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          service: {
            select: { id: true, title: true },
          },
        },
      });
    } catch (error) {
      console.warn("Falling back to createdAt ordering for projects:", error);

      items = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          service: {
            select: { id: true, title: true },
          },
        },
      });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
