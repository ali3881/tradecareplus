import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  await requireAdmin();

  const services = await prisma.service.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return <ProjectForm mode="create" services={services} />;
}
