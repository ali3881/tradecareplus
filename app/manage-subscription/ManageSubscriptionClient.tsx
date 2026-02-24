"use client";

import { useCallback, useEffect, useState } from "react";

type Subscription = {
  plan: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
} | null;

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId?: string | null;
  createdAt: string;
};

export default function ManageSubscriptionClient() {
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, txRes] = await Promise.all([
        fetch("/api/billing/subscription", { cache: "no-store" }),
        fetch("/api/billing/transactions", { cache: "no-store" }),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription || null);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startPlanCheckout = async (plan: "BASIC" | "STANDARD" | "PREMIUM") => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Failed to open checkout");
      }
      window.location.href = data.url;
    } catch (error: any) {
      alert(error.message || "Failed to open checkout");
      setBillingLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Cancel subscription immediately? You will lose access right away.")) return;
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/cancel-subscription", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to cancel subscription");
      }
      alert("Subscription has been cancelled immediately. Access has been removed.");
      await loadData();
    } catch (error: any) {
      alert(error.message || "Failed to cancel subscription");
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="rounded-2xl bg-gray-200 h-32" />
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="h-16 bg-gray-100 border-b border-gray-100" />
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 bg-gray-200 rounded-lg" />
              <div className="h-10 w-40 bg-gray-200 rounded-lg" />
              <div className="h-10 w-36 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-4 w-72 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="h-16 bg-gray-100 border-b border-gray-100" />
          <div className="p-6 space-y-3">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 sm:p-8 shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Manage Subscription</h1>
        <p className="text-sm sm:text-base text-gray-200 mt-2">
          Update your plan, manage billing, and review payment history.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Plan & Billing</h3>
          {subscription && (
            <span className="text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
              Current: <span className="font-bold">{subscription.plan}</span> ({subscription.status})
            </span>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => startPlanCheckout("BASIC")} disabled={billingLoading} className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
              Switch to BASIC
            </button>
            <button onClick={() => startPlanCheckout("STANDARD")} disabled={billingLoading} className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
              Switch to STANDARD
            </button>
            <button onClick={() => startPlanCheckout("PREMIUM")} disabled={billingLoading} className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
              Switch to PREMIUM
            </button>
            {subscription &&
              (subscription.status === "ACTIVE" || subscription.status === "TRIALING") &&
              !subscription.cancelAtPeriodEnd && (
              <button
                onClick={cancelSubscription}
                disabled={billingLoading}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                Cancel Plan
              </button>
            )}
          </div>
          {subscription?.cancelAtPeriodEnd &&
            (subscription.status === "ACTIVE" || subscription.status === "TRIALING") && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Your plan is set to cancel at the end of the current billing period.
            </p>
          )}
          {subscription?.currentPeriodEnd && subscription.status !== "CANCELED" && (
            <p className="text-sm text-gray-500">
              Current period ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Transactions</h3>
          <button onClick={loadData} className="text-sm font-medium text-yellow-700 hover:text-yellow-800">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No transactions yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${(tx.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 uppercase">{tx.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        tx.status === "PAID" ? "bg-green-100 text-green-700" :
                        tx.status === "FAILED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.stripeInvoiceId || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
