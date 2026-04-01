import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { MessageSquareMore } from "lucide-react";
import Link from "next/link";

function statusBadge(status: string) {
  if (status === "NEW") return "bg-yellow-100 text-yellow-800";
  if (status === "CLOSED") return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-700";
}

export default async function AdminEnquiriesPage() {
  await requireAdmin();

  const enquiries = await prisma.saleInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      item: {
        select: {
          name: true,
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-2xl font-bold text-gray-800">
          <MessageSquareMore className="mr-3 text-gray-600" />
          Enquiry Management
        </h1>
        <p className="mt-1 text-gray-500">Review sales enquiries, customer contact details, and submitted messages.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Enquiry</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Customer</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 align-top">
                  <div className="font-medium text-gray-900">{enquiry.item.name}</div>
                  <div className="text-xs text-gray-500">{enquiry.item.category}</div>
                  <div className="mt-1 text-xs font-mono text-gray-400">EN-{enquiry.id.slice(-6).toUpperCase()}</div>
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                  <div className="text-xs text-gray-500">{enquiry.customerEmail}</div>
                  <div className="text-xs text-gray-500">{enquiry.customerPhone || enquiry.user?.phone || "-"}</div>
                  {enquiry.user ? (
                    <div className="mt-1 text-xs text-blue-600">
                      Linked user: {enquiry.user.name || "N/A"} ({enquiry.user.email})
                    </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">Guest enquiry</div>
                    )}
                  </td>
                <td className="px-5 py-4 align-top">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(enquiry.status)}`}>
                    {enquiry.status}
                  </span>
                </td>
                <td className="px-5 py-4 align-top text-sm text-gray-600">
                  {enquiry.createdAt.toLocaleString()}
                </td>
                <td className="px-5 py-4 align-top">
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                  No sale enquiries found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
