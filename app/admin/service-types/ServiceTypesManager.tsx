"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

type ServiceType = {
  id: string;
  title: string;
};

export default function ServiceTypesManager() {
  const [items, setItems] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-types", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createItem = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/service-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to add service type");
      setNewTitle("");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to add service type");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editingTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/service-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (!res.ok) throw new Error("Failed to update service type");
      setEditingId(null);
      setEditingTitle("");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to update service type");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this service type?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/service-types/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service type");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete service type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add service type title"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={createItem}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No service types found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex items-center justify-between gap-3">
                {editingId === item.id ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <span className="font-medium text-gray-800">{item.title}</span>
                )}

                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingTitle(item.title);
                      }}
                      className="p-2 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={saving}
                    className="p-2 rounded hover:bg-red-50 text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
