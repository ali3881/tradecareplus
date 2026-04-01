import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CalendarRange } from "lucide-react";
import Link from "next/link";

function statusBadge(status: string) {
  if (status === "PAID") return "bg-green-100 text-green-700";
  if (status === "PENDING_PAYMENT") return "bg-yellow-100 text-yellow-800";
  if (status === "EXPIRED") return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-700";
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency || "AUD",
  }).format(amount);
}

export default async function AdminBookingsPage() {
  await requireAdmin();

  const bookings = await prisma.hireBooking.findMany({
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
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          stripeCheckoutSessionId: true,
          stripePaymentId: true,
          amount: true,
          currency: true,
        },
      },
    },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-2xl font-bold text-gray-800">
          <CalendarRange className="mr-3 text-gray-600" />
          Booking Management
        </h1>
        <p className="mt-1 text-gray-500">Review hire bookings, customer details, payment status, and booking dates.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Booking</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Customer</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Dates</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Total</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const transaction = booking.transactions[0] || null;

              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-gray-900">{booking.item.name}</div>
                    <div className="text-xs text-gray-500">{booking.item.category}</div>
                    <div className="mt-1 text-xs font-mono text-gray-400">BK-{booking.id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone || booking.user?.phone || "-"}</div>
                    {booking.user ? (
                      <div className="mt-1 text-xs text-blue-600">
                        Linked user: {booking.user.name || "N/A"} ({booking.user.email})
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">Guest booking</div>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-gray-700">
                    <div>{booking.startDate.toLocaleDateString("en-AU")}</div>
                    <div className="text-xs text-gray-400">to {booking.endDate.toLocaleDateString("en-AU")}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm font-semibold text-gray-900">
                    {formatMoney(booking.totalPrice, booking.currency)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  No hire bookings found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
