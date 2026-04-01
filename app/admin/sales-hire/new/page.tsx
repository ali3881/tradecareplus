import { requireAdmin } from "@/lib/admin";
import CatalogItemForm from "../CatalogItemForm";

export default async function NewCatalogItemPage() {
  await requireAdmin();
  return <CatalogItemForm mode="create" />;
}
