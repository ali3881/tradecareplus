import { requireAdmin } from "@/lib/admin";
import ServiceTypesManager from "./ServiceTypesManager";

export default async function AdminServiceTypesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Service Types</h1>
        <p className="text-gray-500 mt-1">Add, edit, and delete service type titles used in Log a Job.</p>
      </div>
      <ServiceTypesManager />
    </div>
  );
}
