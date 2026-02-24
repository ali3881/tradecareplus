import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Receipt } from "lucide-react";

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Receipt className="mr-3 text-gray-600" />
          Transactions
        </h1>
        <p className="text-gray-500 mt-1">All Stripe payment records synced by webhook.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{tx.user.name || "N/A"}</span>
                    <span className="text-xs text-gray-500">{tx.user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">${(tx.amount / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-600 uppercase">{tx.currency}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{tx.stripeInvoiceId || "-"}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
