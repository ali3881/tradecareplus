import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Receipt } from "lucide-react";
import Link from "next/link";

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      hireBooking: {
        include: {
          item: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 500,
  });

  const rows = transactions.map((tx) => {
    const isBooking = tx.sourceType === "HIRE_BOOKING";
    const paymentLabel = tx.sourceLabel || tx.hireBooking?.item?.name || tx.description || "-";
    const bookingMeta = tx.hireBooking
      ? `Booking ${tx.hireBooking.id.slice(-6).toUpperCase()} · ${new Date(tx.hireBooking.startDate).toLocaleDateString("en-AU")} to ${new Date(tx.hireBooking.endDate).toLocaleDateString("en-AU")}`
      : null;

    return {
      id: tx.id,
      typeLabel: isBooking ? "Booking" : "Subscription",
      typeClass: isBooking ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800",
      paymentLabel,
      paymentMeta: bookingMeta || tx.description || null,
      userName: tx.user?.name || tx.customerName || "Guest / Not linked",
      userEmail: tx.user?.email || tx.customerEmail || "-",
      userPhone: tx.customerPhone || null,
      amountLabel: `$${(tx.amount / 100).toFixed(2)}`,
      currency: tx.currency,
      status: tx.status || "UNKNOWN",
      createdAtLabel: new Date(tx.createdAt).toLocaleString(),
      reference: tx.stripeInvoiceId || tx.stripeCheckoutSessionId || "-",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Receipt className="mr-3 text-gray-600" />
          Transactions
        </h1>
        <p className="text-gray-500 mt-1">All Stripe payment records, including subscriptions and hire bookings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment For</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${tx.typeClass}`}>
                    {tx.typeLabel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{tx.paymentLabel}</span>
                    {tx.paymentMeta ? <span className="text-xs text-gray-500">{tx.paymentMeta}</span> : null}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{tx.userName}</span>
                    <span className="text-xs text-gray-500">{tx.userEmail}</span>
                    {tx.userPhone ? <span className="text-xs text-gray-500">{tx.userPhone}</span> : null}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">{tx.amountLabel}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{tx.createdAtLabel}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
