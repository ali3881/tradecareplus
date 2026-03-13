import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeProjectImages, parseProjectImages } from "@/lib/projects";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const [project, services] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
    }),
    prisma.service.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!project) {
    return notFound();
  }

  return (
    <ProjectForm
      mode="edit"
      services={services}
      initial={{
        id: project.id,
        title: project.title,
        imageUrl: project.imageUrl,
        images: normalizeProjectImages(parseProjectImages(project.imagesJson), project.imageUrl),
        description: project.description,
        serviceId: project.serviceId || "",
      }}
    />
  );
}
