import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import CatalogItemForm from "../CatalogItemForm";

export default async function EditCatalogItemPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const item = await prisma.catalogItem.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    notFound();
  }

  return (
    <CatalogItemForm
      mode="edit"
      initial={{
        id: item.id,
        name: item.name,
        category: item.category,
        itemType: item.itemType as "HIRE" | "SALE",
        pricingModel: item.pricingModel as "PER_DAY" | "PER_WEEK" | "PER_METER_PER_WEEK" | "FIXED",
        price: item.price,
        quantityAvailable: item.quantityAvailable,
        imageUrl: item.imageUrl || "",
        shortDescription: item.shortDescription || "",
        description: item.description,
        unitLabel: item.unitLabel || "",
        minHireDays: item.minHireDays,
        isActive: item.isActive,
      }}
    />
  );
}
