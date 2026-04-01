import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarRange, CreditCard, Package, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

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

export default async function AdminBookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const booking = await prisma.hireBooking.findUnique({
    where: { id: params.id },
    include: {
      item: true,
      user: true,
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const latestTransaction = booking.transactions[0] || null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/bookings" className="mb-2 flex items-center text-gray-500 transition-colors hover:text-gray-700">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Booking #{booking.id.slice(-6).toUpperCase()}</h1>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <Package className="mr-2 h-5 w-5 text-gray-500" />
              Booking Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Item</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{booking.item.name}</p>
                <p className="text-sm text-gray-500">{booking.item.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Booking Status</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{booking.status}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Start Date</label>
                <p className="mt-1 text-gray-700">{booking.startDate.toLocaleDateString("en-AU")}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">End Date</label>
                <p className="mt-1 text-gray-700">{booking.endDate.toLocaleDateString("en-AU")}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</label>
                <p className="mt-1 text-gray-700">{booking.quantity}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Billable Units</label>
                <p className="mt-1 text-gray-700">{booking.billableUnits}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Total</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatMoney(booking.totalPrice, booking.currency)}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Created At</label>
                <p className="mt-1 text-gray-700">{booking.createdAt.toLocaleString()}</p>
              </div>
            </div>

            {booking.notes ? (
              <div className="mt-8">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Internal Notes</label>
                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-700 whitespace-pre-wrap">
                  {booking.notes}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
              Payment History
            </h2>

            {booking.transactions.length > 0 ? (
              <div className="space-y-3">
                {booking.transactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.sourceLabel || booking.item.name}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.stripePaymentId || transaction.stripeCheckoutSessionId || transaction.stripeInvoiceId || "-"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-700">
                        {formatMoney(transaction.amount / 100, transaction.currency)} · {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment transaction linked yet.</p>
            )}
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
                <p className="mt-1 font-medium text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                <p className="mt-1 text-gray-700 break-all">{booking.customerEmail}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</label>
                <p className="mt-1 text-gray-700">{booking.customerPhone || booking.user?.phone || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Linked Account</label>
                <p className="mt-1 text-gray-700">
                  {booking.user ? `${booking.user.name || "N/A"} (${booking.user.email})` : "Guest booking"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <CalendarRange className="mr-2 h-5 w-5 text-gray-500" />
              Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span>Booking Ref</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">BK-{booking.id.slice(-6).toUpperCase()}</p>
              </div>
              <div>
                <span>Stripe Session</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {booking.stripeSessionId || latestTransaction?.stripeCheckoutSessionId || "-"}
                </p>
              </div>
              <div>
                <span>Stripe Payment</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {booking.stripePaymentId || latestTransaction?.stripePaymentId || "-"}
                </p>
              </div>
              <div>
                <span>Payment Status</span>
                <p className="mt-1">{latestTransaction?.status || booking.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
