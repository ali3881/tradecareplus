import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const packages = await prisma.subscriptionPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(
      packages.map((p) => ({
        ...p,
        features: (() => {
          try {
            return JSON.parse(p.featuresJson || "[]");
          } catch {
            return [];
          }
        })(),
      }))
    );
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
