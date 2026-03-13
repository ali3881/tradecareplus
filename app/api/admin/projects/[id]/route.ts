import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeProjectImages, sanitizeProjectHtml, slugifyProjectTitle } from "@/lib/projects";

export const runtime = "nodejs";

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().min(1),
  images: z.array(z.string().trim().min(1)).min(1),
  description: z.string().trim().min(1),
  serviceId: z.string().trim().min(1),
});

async function createUniqueSlug(title: string, currentId: string) {
  const baseSlug = slugifyProjectTitle(title) || "project";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
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

function revalidateProjectPaths(currentSlug?: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (currentSlug) {
    revalidatePath(`/project/${currentSlug}`);
  }
  if (previousSlug && previousSlug !== currentSlug) {
    revalidatePath(`/project/${previousSlug}`);
  }
}

function isMissingImagesJsonColumnError(error: unknown) {
  return error instanceof Error && /imagesJson/i.test(error.message) && /column|field/i.test(error.message);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = projectSchema.parse(await request.json());

    const existing = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: body.serviceId },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const slug = await createUniqueSlug(body.title, params.id);
    let updated;

    try {
      updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          title: body.title,
          slug,
          imageUrl: body.imageUrl,
          imagesJson: JSON.stringify(normalizeProjectImages(body.images, body.imageUrl)),
          description: sanitizeProjectHtml(body.description),
          serviceId: body.serviceId,
        },
        include: {
          service: {
            select: { id: true, title: true },
          },
        },
      });
    } catch (error) {
      if (!isMissingImagesJsonColumnError(error)) {
        throw error;
      }

      updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          title: body.title,
          slug,
          imageUrl: body.imageUrl,
          description: sanitizeProjectHtml(body.description),
          serviceId: body.serviceId,
        },
        include: {
          service: {
            select: { id: true, title: true },
          },
        },
      });
    }

    revalidateProjectPaths(updated.slug, existing.slug);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const existing = await prisma.project.findUnique({
      where: { id: params.id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    revalidateProjectPaths(undefined, existing.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
