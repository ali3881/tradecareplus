import { requireAdmin } from "@/lib/admin";
import ProjectsList from "./ProjectsList";

export default async function AdminProjectsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <p className="mt-1 text-gray-500">Manage project posts. Open a project to edit full details.</p>
      </div>
      <ProjectsList />
    </div>
  );
}
