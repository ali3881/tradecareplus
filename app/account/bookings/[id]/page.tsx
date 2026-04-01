import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, CalendarRange, CreditCard, Package } from "lucide-react";
import { authOptions } from "@/lib/auth";
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

export default async function AccountBookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const booking = await prisma.hireBooking.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      item: true,
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
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white shadow-lg sm:p-8">
        <Link href="/account/activity" className="mb-3 inline-flex items-center text-sm text-gray-200 transition-colors hover:text-white">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Activity
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{booking.item.name}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(booking.status)} bg-white/15 text-white`}>
            {booking.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-200 sm:text-base">
          Review your booking dates, payment progress, and reference details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Booked On</label>
                <p className="mt-1 text-gray-700">{booking.createdAt.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
              Payment History
            </h2>

            {booking.transactions.length > 0 ? (
              <div className="space-y-3">
                {booking.transactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    href={`/account/transactions/${transaction.id}`}
                    className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-yellow-200 hover:bg-yellow-50/40"
                  >
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
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment transaction linked yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
              <div>
                <span>Booked For</span>
                <p className="mt-1">{booking.customerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
