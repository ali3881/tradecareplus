import { requireAdmin } from "@/lib/admin";
import ServicesList from "./ServicesList";

export default async function AdminServicesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Services</h1>
        <p className="mt-1 text-gray-500">Manage service posts and public service pages.</p>
      </div>
      <ServicesList />
    </div>
  );
}
