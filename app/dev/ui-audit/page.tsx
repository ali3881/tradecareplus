import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { CheckCircle, XCircle, ExternalLink, Loader2 } from "lucide-react";

export default async function DevUiAuditPage() {
  await requireAdmin();

  const auditItems = [
    { name: "User Dashboard: Log a Job", route: "/dashboard", type: "Modal + API", status: "Active" },
    { name: "User Dashboard: Refresh", route: "/dashboard", type: "Client Action", status: "Active" },
    { name: "User Dashboard: Chat on WhatsApp", route: "/dashboard", type: "External Link", status: "Active" },
    { name: "User Dashboard: View Details", route: "/dashboard", type: "Modal", status: "Active" },
    { name: "Admin: Staff Add", route: "/admin/staff", type: "Link -> /admin/users", status: "Active" },
    { name: "Admin: Settings Save", route: "/admin/settings", type: "Form + API", status: "Active" },
    { name: "Admin: Subscription Cancel", route: "/admin/subscriptions", type: "API Action", status: "Active" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">UI Audit Checklist</h1>
        <p className="text-gray-500 mt-2">Verification of all interactive elements.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Feature / Button</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Verify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.route}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <Link href={item.route} target="_blank" className="text-blue-600 hover:underline flex items-center text-sm">
                      Open <ExternalLink size={14} className="ml-1" />
                   </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
