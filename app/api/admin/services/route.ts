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
    let items;

    try {
      items = await prisma.service.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      console.warn("Falling back to createdAt ordering for admin services:", error);

      items = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

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

    let nextSortOrder = 0;

    try {
      const maxSort = await prisma.service.aggregate({
        _max: { sortOrder: true },
      });
      nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;
    } catch (error) {
      console.warn("Falling back to default service sort order:", error);
    }

    let created;

    try {
      created = await prisma.service.create({
        data: {
          title: body.title,
          slug: await createUniqueSlug(body.title),
          imageUrl: body.imageUrl,
          description: sanitizeServiceHtml(body.description),
          iconKey: body.iconKey,
          sortOrder: nextSortOrder,
        },
      });
    } catch (error) {
      console.warn("Retrying service create without sortOrder:", error);

      created = await prisma.service.create({
        data: {
          title: body.title,
          slug: await createUniqueSlug(body.title),
          imageUrl: body.imageUrl,
          description: sanitizeServiceHtml(body.description),
          iconKey: body.iconKey,
        },
      });
    }

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
