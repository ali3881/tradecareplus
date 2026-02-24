import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PackageForm from "../PackageForm";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const pkg = await prisma.subscriptionPackage.findUnique({
    where: { id: params.id },
  });

  if (!pkg) return notFound();

  let features: string[] = [];
  try {
    features = JSON.parse(pkg.featuresJson || "[]");
  } catch {
    features = [];
  }

  return (
    <PackageForm
      mode="edit"
      initial={{
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency,
        duration: pkg.duration,
        features,
        isMostPopular: pkg.isMostPopular,
        stripePriceId: pkg.stripePriceId,
        isActive: pkg.isActive,
      }}
    />
  );
}
