"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type PackageItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  isMostPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

export default function PackagesList() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete package");
    } finally {
      setDeletingId(null);
    }
  };

  const persistOrder = async (nextItems: PackageItem[]) => {
    try {
      const res = await fetch("/api/admin/packages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: nextItems.map((x) => x.id) }),
      });
      if (!res.ok) throw new Error("Failed to save package order");
    } catch (e: any) {
      alert(e.message || "Failed to save package order");
      await load();
    }
  };

  const handleDropOn = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const next = [...items];
    const fromIndex = next.findIndex((x) => x.id === draggingId);
    const toIndex = next.findIndex((x) => x.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
    setDraggingId(null);
    await persistOrder(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" /> New Package
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Title</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Popular</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50"
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOn(item.id)}
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <span className="text-gray-300 cursor-grab">⋮⋮</span>
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[420px]">{item.description}</div>
                  </td>
                  <td className="px-5 py-3 font-semibold">{item.currency} {item.price}</td>
                  <td className="px-5 py-3 text-gray-700">{item.duration}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-5 py-3">{item.isMostPopular ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/packages/${item.id}`} className="text-blue-600 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => remove(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">No packages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
