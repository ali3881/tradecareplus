import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, MessageSquareMore, Package } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function statusBadge(status: string) {
  if (status === "NEW") return "bg-yellow-100 text-yellow-800";
  if (status === "CLOSED") return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-700";
}

export default async function AccountEnquiryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const enquiry = await prisma.saleInquiry.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      item: true,
    },
  });

  if (!enquiry) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white shadow-lg sm:p-8">
        <Link href="/account/activity" className="mb-3 inline-flex items-center text-sm text-gray-200 transition-colors hover:text-white">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Activity
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{enquiry.item.name}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(enquiry.status)} bg-white/15 text-white`}>
            {enquiry.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-200 sm:text-base">
          Review the enquiry you sent and the details attached to it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Sent At</label>
                <p className="mt-1 text-gray-700">{enquiry.createdAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Updated</label>
                <p className="mt-1 text-gray-700">{enquiry.updatedAt.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Message</label>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-700">
                {enquiry.message || "No message provided."}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <MessageSquareMore className="mr-2 h-5 w-5 text-gray-500" />
              Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span>Enquiry Ref</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">EN-{enquiry.id.slice(-6).toUpperCase()}</p>
              </div>
              <div>
                <span>Item Type</span>
                <p className="mt-1">{enquiry.item.itemType}</p>
              </div>
              <div>
                <span>Category</span>
                <p className="mt-1">{enquiry.item.category}</p>
              </div>
              <div>
                <span>Status</span>
                <p className="mt-1">{enquiry.status}</p>
              </div>
              <div>
                <span>Sent By</span>
                <p className="mt-1">{enquiry.customerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
