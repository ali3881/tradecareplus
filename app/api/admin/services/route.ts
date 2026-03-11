import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sanitizeServiceHtml, serviceIconOptions, slugifyServiceTitle } from "@/lib/services";

export const runtime = "nodejs";

const validIconKeys = new Set<string>(serviceIconOptions.map((item) => item.key));

const serviceSchema = z.object({
  title: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().min(1),
  description: z.string().trim().min(1),
  iconKey: z.string().trim().min(1),
});

async function createUniqueSlug(title: string) {
  const baseSlug = slugifyServiceTitle(title) || "service";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.service.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

function revalidateServicePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/services");
  if (slug) {
    revalidatePath(`/service/${slug}`);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching admin services:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = serviceSchema.parse(await request.json());

    if (!validIconKeys.has(body.iconKey)) {
      return NextResponse.json({ error: "Invalid icon selection" }, { status: 400 });
    }

    const created = await prisma.service.create({
      data: {
        title: body.title,
        slug: await createUniqueSlug(body.title),
        imageUrl: body.imageUrl,
        description: sanitizeServiceHtml(body.description),
        iconKey: body.iconKey,
      },
    });

    revalidateServicePaths(created.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
