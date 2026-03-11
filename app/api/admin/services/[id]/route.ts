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

async function createUniqueSlug(title: string, currentId: string) {
  const baseSlug = slugifyServiceTitle(title) || "service";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function revalidateServicePaths(currentSlug?: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/services");
  if (currentSlug) {
    revalidatePath(`/service/${currentSlug}`);
  }
  if (previousSlug && previousSlug !== currentSlug) {
    revalidatePath(`/service/${previousSlug}`);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = serviceSchema.parse(await request.json());

    if (!validIconKeys.has(body.iconKey)) {
      return NextResponse.json({ error: "Invalid icon selection" }, { status: 400 });
    }

    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: await createUniqueSlug(body.title, params.id),
        imageUrl: body.imageUrl,
        description: sanitizeServiceHtml(body.description),
        iconKey: body.iconKey,
      },
    });

    revalidateServicePaths(updated.slug, existing.slug);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    revalidateServicePaths(undefined, existing.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
