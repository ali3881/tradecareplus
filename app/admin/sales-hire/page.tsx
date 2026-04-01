import { requireAdmin } from "@/lib/admin";
import CatalogItemsList from "./CatalogItemsList";
import Link from "next/link";

export default async function AdminSalesHirePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sales and Hire</h1>
        <p className="mt-1 text-gray-500">Manage hire inventory, sale items, bookings, and customer enquiries.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/bookings" className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-yellow-200 hover:bg-yellow-50">
          <div className="text-sm font-bold uppercase tracking-[2px] text-yellow-700">Hire Bookings</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">Open Booking Management</div>
          <p className="mt-1 text-sm text-gray-500">See booking dates, customer details, payment status, and booking references.</p>
        </Link>
        <Link href="/admin/enquiries" className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-yellow-200 hover:bg-yellow-50">
          <div className="text-sm font-bold uppercase tracking-[2px] text-yellow-700">Sales Enquiries</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">Open Enquiry Management</div>
          <p className="mt-1 text-sm text-gray-500">Review customer messages, contact details, and linked sale items.</p>
        </Link>
      </div>
      <CatalogItemsList />
    </div>
  );
}
