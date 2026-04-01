import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { catalogCategoriesSettingKey } from "@/lib/catalog";

export const runtime = "nodejs";

const categoriesSchema = z.object({
  categories: z.array(z.string().trim().min(1).max(80)).max(100),
});

function normalizeCategories(input: string[]) {
  return Array.from(new Set(input.map((item) => item.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  try {
    await requireAdmin();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: catalogCategoriesSettingKey },
    });

    const categories = setting ? JSON.parse(setting.value || "[]") : [];
    return NextResponse.json(Array.isArray(categories) ? categories : []);
  } catch (error) {
    console.error("Error fetching catalog categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = categoriesSchema.parse(await request.json());
    const categories = normalizeCategories(body.categories);

    await prisma.systemSetting.upsert({
      where: { key: catalogCategoriesSettingKey },
      create: {
        key: catalogCategoriesSettingKey,
        value: JSON.stringify(categories),
        type: "JSON",
      },
      update: {
        value: JSON.stringify(categories),
        type: "JSON",
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error saving catalog categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
