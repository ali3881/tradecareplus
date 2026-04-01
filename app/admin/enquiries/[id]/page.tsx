import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquareMore, Package, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function statusBadge(status: string) {
  if (status === "NEW") return "bg-yellow-100 text-yellow-800";
  if (status === "CLOSED") return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-700";
}

export default async function AdminEnquiryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const enquiry = await prisma.saleInquiry.findUnique({
    where: { id: params.id },
    include: {
      item: true,
      user: true,
    },
  });

  if (!enquiry) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/enquiries" className="mb-2 flex items-center text-gray-500 transition-colors hover:text-gray-700">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Enquiries
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Enquiry #{enquiry.id.slice(-6).toUpperCase()}</h1>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(enquiry.status)}`}>
              {enquiry.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <Package className="mr-2 h-5 w-5 text-gray-500" />
              Enquiry Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Item</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{enquiry.item.name}</p>
                <p className="text-sm text-gray-500">{enquiry.item.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</label>
                <p className="mt-1 text-gray-700">{enquiry.status}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Created At</label>
                <p className="mt-1 text-gray-700">{enquiry.createdAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Updated At</label>
                <p className="mt-1 text-gray-700">{enquiry.updatedAt.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Message</label>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-700">
                {enquiry.message || "No message provided."}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <User className="mr-2 h-5 w-5 text-gray-500" />
              Customer
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Name</label>
                <p className="mt-1 font-medium text-gray-900">{enquiry.customerName}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                <p className="mt-1 break-all text-gray-700">{enquiry.customerEmail}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</label>
                <p className="mt-1 text-gray-700">{enquiry.customerPhone || enquiry.user?.phone || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Linked Account</label>
                <p className="mt-1 text-gray-700">
                  {enquiry.user ? `${enquiry.user.name || "N/A"} (${enquiry.user.email})` : "Guest enquiry"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <MessageSquareMore className="mr-2 h-5 w-5 text-gray-500" />
              Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <span>Enquiry Ref</span>
                <span className="font-mono text-xs text-gray-500">EN-{enquiry.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Item Type</span>
                <span>{enquiry.item.itemType}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Category</span>
                <span>{enquiry.item.category}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Status</span>
                <span>{enquiry.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
