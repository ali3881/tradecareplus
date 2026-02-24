"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionList({ initialSubscriptions }: { initialSubscriptions: any[] }) {
  const router = useRouter();
  const [subscriptions] = useState(initialSubscriptions);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription? The user will lose access immediately.")) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to cancel subscription");
      }
    } catch (e) {
      alert("Error cancelling subscription");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transactions</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{sub.user.name || "N/A"}</span>
                      <span className="text-xs text-gray-500">{sub.user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">
                  {sub.plan}
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center w-fit px-2 py-1 text-xs font-bold rounded-full ${
                    sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    sub.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sub.status === 'ACTIVE' && <CheckCircle size={12} className="mr-1" />}
                    {sub.status === 'CANCELED' && <XCircle size={12} className="mr-1" />}
                    {sub.status !== 'ACTIVE' && sub.status !== 'CANCELED' && <Clock size={12} className="mr-1" />}
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {sub.transactions?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {sub.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleCancel(sub.id)}
                        disabled={cancellingId === sub.id}
                        className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center"
                      >
                         {cancellingId === sub.id ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                         Cancel
                      </button>
                  ) : (
                      <span className="text-gray-400 text-sm italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  );
}
