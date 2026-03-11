import { requireAdmin } from "@/lib/admin";
import ServiceForm from "../ServiceForm";

export default async function NewServicePage() {
  await requireAdmin();
  return <ServiceForm mode="create" />;
}
