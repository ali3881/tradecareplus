"use client";

import { Receipt } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Subscription = {
  plan: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
} | null;

export default function ManageSubscriptionClient() {
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const subRes = await fetch("/api/billing/subscription", { cache: "no-store" });

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription || null);
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="md:max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Manage Subscription</h1>
            <p className="mt-2 text-sm text-gray-200 sm:text-base">
              Update your plan, manage billing, and review payment history.
            </p>
          </div>
          <div className="md:flex md:justify-end">
            <Link href="/account/transactions" className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-white/10 hover:text-white">
              <Receipt className="mr-1 h-4 w-4" /> Transactions
            </Link>
          </div>
        </div>
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
    </div>
  );
}
