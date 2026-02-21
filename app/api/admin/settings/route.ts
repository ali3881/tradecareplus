import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) => {
      let type = "STRING";
      let stringValue = String(value);

      if (typeof value === "number") {
        type = "NUMBER";
        stringValue = String(value);
      } else if (typeof value === "boolean") {
        type = "BOOLEAN";
      }

      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringValue, type },
        create: { key, value: stringValue, type },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
