import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, Receipt, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency || "AUD",
  }).format(amount);
}

function statusBadge(status: string) {
  if (status === "PAID") return "bg-green-100 text-green-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
}

export default async function AdminTransactionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      subscription: true,
      hireBooking: {
        include: {
          item: true,
          user: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  const isBooking = transaction.sourceType === "HIRE_BOOKING";
  const customerName = transaction.user?.name || transaction.customerName || transaction.hireBooking?.customerName || "Guest / Not linked";
  const customerEmail = transaction.user?.email || transaction.customerEmail || transaction.hireBooking?.customerEmail || "-";
  const customerPhone = transaction.customerPhone || transaction.user?.phone || transaction.hireBooking?.customerPhone || "-";
  const paymentFor = transaction.sourceLabel || transaction.hireBooking?.item.name || transaction.description || "-";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/transactions" className="mb-2 flex items-center text-gray-500 transition-colors hover:text-gray-700">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Transactions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Transaction #{transaction.id.slice(-6).toUpperCase()}</h1>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <Receipt className="mr-2 h-5 w-5 text-gray-500" />
              Transaction Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Type</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{isBooking ? "Booking" : "Subscription"}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Payment For</label>
                <p className="mt-1 text-gray-700">{paymentFor}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Amount</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatMoney(transaction.amount / 100, transaction.currency)}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Currency</label>
                <p className="mt-1 text-gray-700 uppercase">{transaction.currency}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Created At</label>
                <p className="mt-1 text-gray-700">{transaction.createdAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Updated At</label>
                <p className="mt-1 text-gray-700">{transaction.updatedAt.toLocaleString()}</p>
              </div>
            </div>

            {transaction.description ? (
              <div className="mt-8">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-700 whitespace-pre-wrap">
                  {transaction.description}
                </div>
              </div>
            ) : null}
          </div>

          {transaction.hireBooking ? (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
                <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
                Booking Details
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Booking Ref</label>
                  <p className="mt-1 font-mono text-sm text-gray-700">BK-{transaction.hireBooking.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Item</label>
                  <p className="mt-1 text-gray-700">{transaction.hireBooking.item.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Dates</label>
                  <p className="mt-1 text-gray-700">
                    {transaction.hireBooking.startDate.toLocaleDateString("en-AU")} to {transaction.hireBooking.endDate.toLocaleDateString("en-AU")}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</label>
                  <p className="mt-1 text-gray-700">{transaction.hireBooking.quantity}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Booking Status</label>
                  <p className="mt-1 text-gray-700">{transaction.hireBooking.status}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">View Booking</label>
                  <Link href={`/admin/bookings/${transaction.hireBooking.id}`} className="mt-1 inline-flex text-sm font-medium text-yellow-700 hover:text-yellow-800">
                    Open booking detail
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {transaction.subscription ? (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
                <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
                Subscription Details
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan</label>
                  <p className="mt-1 text-gray-700">{transaction.subscription.plan}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subscription Status</label>
                  <p className="mt-1 text-gray-700">{transaction.subscription.status}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Period Start</label>
                  <p className="mt-1 text-gray-700">{transaction.subscription.currentPeriodStart.toLocaleDateString("en-AU")}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Period End</label>
                  <p className="mt-1 text-gray-700">{transaction.subscription.currentPeriodEnd.toLocaleDateString("en-AU")}</p>
                </div>
              </div>
            </div>
          ) : null}
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
                <p className="mt-1 font-medium text-gray-900">{customerName}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                <p className="mt-1 break-all text-gray-700">{customerEmail}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</label>
                <p className="mt-1 text-gray-700">{customerPhone}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Linked Account</label>
                <p className="mt-1 text-gray-700">
                  {transaction.user ? `${transaction.user.name || "N/A"} (${transaction.user.email})` : "Not linked"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">
              <Receipt className="mr-2 h-5 w-5 text-gray-500" />
              References
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span>Transaction Ref</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">TX-{transaction.id.slice(-6).toUpperCase()}</p>
              </div>
              <div>
                <span>Stripe Invoice</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">{transaction.stripeInvoiceId || "-"}</p>
              </div>
              <div>
                <span>Stripe Session</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {transaction.stripeCheckoutSessionId || transaction.hireBooking?.stripeSessionId || "-"}
                </p>
              </div>
              <div>
                <span>Stripe Payment</span>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">
                  {transaction.stripePaymentId || transaction.hireBooking?.stripePaymentId || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
