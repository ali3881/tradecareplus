import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, CreditCard, Receipt } from "lucide-react";
import { authOptions } from "@/lib/auth";
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

export default async function AccountTransactionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      subscription: true,
      hireBooking: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  const isBooking = transaction.sourceType === "HIRE_BOOKING";
  const paymentFor = transaction.sourceLabel || transaction.hireBooking?.item.name || transaction.description || "-";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white shadow-lg sm:p-8">
        <Link href="/account/transactions" className="mb-3 inline-flex items-center text-sm text-gray-200 transition-colors hover:text-white">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Transactions
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{paymentFor}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadge(transaction.status)} bg-white/15 text-white`}>
            {transaction.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-200 sm:text-base">
          Review payment details, related booking information, and transaction references.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Amount</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(transaction.amount / 100, transaction.currency)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Type</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{isBooking ? "Booking" : "Subscription"}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Date</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{transaction.createdAt.toLocaleDateString("en-AU")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                <p className="mt-1 uppercase text-gray-700">{transaction.currency}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Paid On</label>
                <p className="mt-1 text-gray-700">{transaction.createdAt.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Updated</label>
                <p className="mt-1 text-gray-700">{transaction.updatedAt.toLocaleString()}</p>
              </div>
            </div>

            {transaction.description ? (
              <div className="mt-8">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <div className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-700">
                  {transaction.description}
                </div>
              </div>
            ) : null}
          </div>

          {transaction.hireBooking ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                  <Link href={`/account/bookings/${transaction.hireBooking.id}`} className="mt-1 inline-flex text-sm font-medium text-yellow-700 hover:text-yellow-800">
                    Open booking detail
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {transaction.subscription ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
