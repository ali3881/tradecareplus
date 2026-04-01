"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { parseResponse } from "@/lib/http";

type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  itemType: string;
  price: number;
  pricingModel: string;
  quantityAvailable: number;
  isActive: boolean;
};

export default function CatalogItemsList() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog-items", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/catalog-categories", { cache: "no-store" });
      const data = await res.json().catch(() => []);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const persistCategories = async (nextCategories: string[]) => {
    setCategorySaving(true);
    try {
      const res = await fetch("/api/admin/catalog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: nextCategories }),
      });
      const parsed = await parseResponse<string[]>(res);
      if (!parsed.ok || !parsed.json) {
        throw new Error(parsed.text || "Failed to save categories");
      }
      setCategories(parsed.json);
    } catch (error: any) {
      alert(error.message || "Failed to save categories");
    } finally {
      setCategorySaving(false);
    }
  };

  const addCategory = async () => {
    const value = categoryDraft.trim();
    if (!value) return;
    if (categories.includes(value)) {
      setCategoryDraft("");
      return;
    }
    await persistCategories([...categories, value]);
    setCategoryDraft("");
  };

  const removeCategory = async (category: string) => {
    if (!confirm(`Delete category "${category}"?`)) return;
    await persistCategories(categories.filter((item) => item !== category));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/catalog-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      await load();
    } catch (error: any) {
      alert(error.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowCategoryManager(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Settings2 className="h-4 w-4" />
          Manage Categories
        </button>
        <Link href="/admin/sales-hire/new" className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400">
          <Plus className="h-4 w-4" />
          New Item
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Item</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Type</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Category</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Price</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Qty</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">/sales-hire/{item.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{item.itemType}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{item.category}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    AUD {item.price.toFixed(2)} <span className="text-gray-400">({item.pricingModel})</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{item.quantityAvailable}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/sales-hire/${item.id}`} className="text-blue-600 hover:text-blue-700">
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
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                    No sales or hire items found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>

      {showCategoryManager ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sales and Hire Categories</h2>
                <p className="mt-1 text-sm text-gray-500">Add, review, and delete categories used in the item form dropdown.</p>
              </div>
              <button type="button" onClick={() => setShowCategoryManager(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] items-center">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">New Category</label>
                  <input
                    value={categoryDraft}
                    onChange={(e) => setCategoryDraft(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Example: Temporary Toilets"
                  />
                  <p className="text-xs text-gray-500">This list controls the category dropdown on new and edit item pages.</p>
                </div>
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={categorySaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 font-semibold text-black hover:bg-yellow-400 disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              </div>

              <div className="rounded-xl border border-gray-100">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Current Categories
                </div>
                <div className="max-h-[320px] overflow-y-auto p-4">
                  {categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span key={category} className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm text-stone-700">
                          {category}
                          <button type="button" onClick={() => removeCategory(category)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No categories added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
