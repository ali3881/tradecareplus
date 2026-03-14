"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { stripProjectHtml } from "@/lib/projects";

type ProjectItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  service: {
    title: string;
  };
};

export default function ProjectsList() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
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
    if (!confirm("Delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      await load();
    } catch (error: any) {
      alert(error.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const persistOrder = async (nextItems: ProjectItem[]) => {
    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: nextItems.map((item) => item.id) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save project order");
      }
    } catch (error: any) {
      alert(error.message || "Failed to save project order");
      await load();
    }
  };

  const handleDropOn = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    const next = [...items];
    const fromIndex = next.findIndex((item) => item.id === draggingId);
    const toIndex = next.findIndex((item) => item.id === targetId);

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
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Title</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Service Type</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">URL</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Actions</th>
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
                  onDragEnd={() => setDraggingId(null)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="pt-0.5 text-gray-300 cursor-grab select-none">⋮⋮</span>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="max-w-[480px] truncate text-xs text-gray-500">
                          {stripProjectHtml(item.description)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{item.service.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">/project/{item.slug}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/projects/${item.id}`} className="text-blue-600 hover:text-blue-700">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => remove(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
