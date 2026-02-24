import { requireAdmin } from "@/lib/admin";
import PackageForm from "../PackageForm";

export default async function NewPackagePage() {
  await requireAdmin();
  return <PackageForm mode="create" />;
}
