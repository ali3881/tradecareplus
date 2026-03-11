import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sanitizeProjectHtml, slugifyProjectTitle } from "@/lib/projects";

export const runtime = "nodejs";

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().min(1),
  description: z.string().trim().min(1),
  serviceId: z.string().trim().min(1),
});

async function createUniqueSlug(title: string) {
  const baseSlug = slugifyProjectTitle(title) || "project";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.project.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) {
    revalidatePath(`/project/${slug}`);
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const items = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching admin projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = projectSchema.parse(await request.json());

    const service = await prisma.service.findUnique({
      where: { id: body.serviceId },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const created = await prisma.project.create({
      data: {
        title: body.title,
        slug: await createUniqueSlug(body.title),
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

    revalidateProjectPaths(created.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
