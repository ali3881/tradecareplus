import { requireAdminOrStaff } from "@/lib/admin";
import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  HardHat, 
  CreditCard, 
  BarChart2, 
  Settings, 
  FileText,
  List,
  Receipt,
  Package
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminOrStaff();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="bg-yellow-500 w-2 h-8 mr-3 rounded-sm"></span>
            Admin Portal
          </h2>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <Users className="w-5 h-5 mr-3" />
                Users
              </Link>
              <Link
                href="/admin/staff"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <HardHat className="w-5 h-5 mr-3" />
                Staff
              </Link>
              <Link
                href="/admin/service-types"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <List className="w-5 h-5 mr-3" />
                Service Types
              </Link>
              
            </>
          )}
          <Link
            href="/admin/jobs"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
          >
            <Briefcase className="w-5 h-5 mr-3" />
            Jobs
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/subscriptions"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Subscriptions
              </Link>
              <Link
                href="/admin/transactions"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <Receipt className="w-5 h-5 mr-3" />
                Transactions
              </Link>
              <Link
                href="/admin/packages"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <Package className="w-5 h-5 mr-3" />
                Packages
              </Link>

              <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">System</div>
              <Link
                href="/admin/reports"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <BarChart2 className="w-5 h-5 mr-3" />
                Reports
              </Link>
              {/* <Link
                href="/admin/audit"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <FileText className="w-5 h-5 mr-3" />
                Audit Logs
              </Link> */}
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
            <AdminLogoutButton />
            <Link href="/" className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
                ← Back to App
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
