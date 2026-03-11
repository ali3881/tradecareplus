import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import ServiceForm from "../ServiceForm";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const service = await prisma.service.findUnique({
    where: { id: params.id },
  });

  if (!service) {
    return notFound();
  }

  return (
    <ServiceForm
      mode="edit"
      initial={{
        id: service.id,
        title: service.title,
        imageUrl: service.imageUrl,
        description: service.description,
        iconKey: service.iconKey,
      }}
    />
  );
}
