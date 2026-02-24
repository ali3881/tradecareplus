"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

type PackageItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isMostPopular: boolean;
  stripePriceId?: string | null;
  isActive: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  price: 0,
  currency: "USD",
  duration: "1 month",
  featuresText: "",
  isMostPopular: false,
  stripePriceId: "",
  isActive: true,
};

export default function PackagesManager() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  const createPackage = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      currency: form.currency,
      duration: form.duration,
      features: form.featuresText.split("\n").map((x) => x.trim()).filter(Boolean),
      isMostPopular: form.isMostPopular,
      stripePriceId: form.stripePriceId || null,
      isActive: form.isActive,
    };

    setCreating(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create package");
      setForm(emptyForm);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to create package");
    } finally {
      setCreating(false);
    }
  };

  const updatePackage = async (item: PackageItem) => {
    setSaving(item.id);
    try {
      const res = await fetch(`/api/admin/packages/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to update package");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to update package");
    } finally {
      setSaving(null);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete package");
    } finally {
      setSaving(null);
    }
  };

  const updateItem = (id: string, patch: Partial<PackageItem>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Add Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="px-3 py-2 border rounded" />
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="px-3 py-2 border rounded" />
          <input placeholder="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="px-3 py-2 border rounded" />
          <input placeholder="Duration (e.g. 1 month)" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="px-3 py-2 border rounded" />
          <input placeholder="Stripe Price ID (optional)" value={form.stripePriceId} onChange={(e) => setForm((f) => ({ ...f, stripePriceId: e.target.value }))} className="px-3 py-2 border rounded md:col-span-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="px-3 py-2 border rounded md:col-span-2" rows={2} />
          <textarea placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} className="px-3 py-2 border rounded md:col-span-2" rows={4} />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.isMostPopular} onChange={(e) => setForm((f) => ({ ...f, isMostPopular: e.target.checked }))} /> Most Popular
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
          </label>
          <button onClick={createPackage} disabled={creating} className="ml-auto px-4 py-2 bg-yellow-500 text-black rounded font-semibold hover:bg-yellow-400 disabled:opacity-50 flex items-center gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} className="px-3 py-2 border rounded" />
              <input type="number" value={item.price} onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })} className="px-3 py-2 border rounded" />
              <input value={item.currency} onChange={(e) => updateItem(item.id, { currency: e.target.value })} className="px-3 py-2 border rounded" />
              <input value={item.duration} onChange={(e) => updateItem(item.id, { duration: e.target.value })} className="px-3 py-2 border rounded" />
              <input value={item.stripePriceId || ""} onChange={(e) => updateItem(item.id, { stripePriceId: e.target.value })} className="px-3 py-2 border rounded md:col-span-2" placeholder="Stripe Price ID" />
              <textarea value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} className="px-3 py-2 border rounded md:col-span-2" rows={2} />
              <textarea
                value={(item.features || []).join("\n")}
                onChange={(e) => updateItem(item.id, { features: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })}
                className="px-3 py-2 border rounded md:col-span-2"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={item.isMostPopular} onChange={(e) => updateItem(item.id, { isMostPopular: e.target.checked })} /> Most Popular
              </label>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={item.isActive} onChange={(e) => updateItem(item.id, { isActive: e.target.checked })} /> Active
              </label>
              <div className="ml-auto flex gap-2">
                <button onClick={() => updatePackage(item)} disabled={saving === item.id} className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
                <button onClick={() => deletePackage(item.id)} disabled={saving === item.id} className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded text-sm font-medium hover:bg-red-100 disabled:opacity-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
