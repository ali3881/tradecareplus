import { requireAdmin } from "@/lib/admin";
import PackagesList from "./PackagesList";

export default async function AdminPackagesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Packages</h1>
        <p className="text-gray-500 mt-1">Manage package list. Open a package to edit full details.</p>
      </div>
      <PackagesList />
    </div>
  );
}
