import { requireAdminOrStaff } from "@/lib/admin";
import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminSidebarNav from "@/components/AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminOrStaff();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed z-10 hidden h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-100 p-6">
          <h2 className="flex items-center text-xl font-bold text-gray-800">
            <span className="mr-3 h-8 w-2 rounded-sm bg-yellow-500"></span>
            Admin Portal
          </h2>
        </div>
        <AdminSidebarNav isAdmin={isAdmin} />
        <div className="space-y-2 border-t border-gray-100 p-4">
          <AdminLogoutButton />
          <Link href="/" className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800">
            ← Back to App
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 md:ml-64">
        {children}
      </main>
    </div>
  );
}
