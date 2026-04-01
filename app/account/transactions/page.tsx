import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
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

export default async function AccountTransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
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
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white shadow-lg sm:p-8">
      
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Transactions</h1>
        <p className="mt-2 text-sm text-gray-200 sm:text-base">
          All subscription and booking payments linked to your account.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-500">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {transaction.sourceLabel || transaction.hireBooking?.item.name || transaction.description || "Payment"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatMoney(transaction.amount / 100, transaction.currency)} · {transaction.createdAt.toLocaleDateString("en-AU")}
                  </p>
                  <p className="text-sm text-gray-500">Transaction Ref: TX-{transaction.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(transaction.status)}`}>
                    {transaction.status}
                  </span>
                  <Link href={`/account/transactions/${transaction.id}`} className="text-sm font-semibold text-yellow-700 hover:text-yellow-800">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
