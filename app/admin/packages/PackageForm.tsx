"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type PackageInput = {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isMostPopular: boolean;
  isActive: boolean;
};

export default function PackageForm({ initial, mode }: { initial?: PackageInput; mode: "create" | "edit" }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PackageInput>(
    initial || {
      title: "",
      description: "",
      price: 0,
      currency: "USD",
      duration: "1 month",
      features: [],
      isMostPopular: false,
      isActive: true,
    }
  );

  const [featuresText, setFeaturesText] = useState((initial?.features || []).join("\n"));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: featuresText.split("\n").map((x) => x.trim()).filter(Boolean),
        price: Number(form.price),
      };

      const endpoint = mode === "create" ? "/api/admin/packages" : `/api/admin/packages/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save package");
      }

      router.push("/admin/packages");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{mode === "create" ? "New Package" : "Edit Package"}</h1>
        <Link href="/admin/packages" className="text-sm text-gray-600 hover:text-gray-800">Back to list</Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="px-3 py-2 border rounded" />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="px-3 py-2 border rounded" />
          <select
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="AED">AED</option>
            <option value="AUD">AUD</option>
          </select>
          <select
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="1 month">1 month</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="px-3 py-2 border rounded md:col-span-2" rows={3} />
          <textarea placeholder="Features (one per line)" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="px-3 py-2 border rounded md:col-span-2" rows={6} />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.isMostPopular} onChange={(e) => setForm((f) => ({ ...f, isMostPopular: e.target.checked }))} /> Most Popular
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/admin/packages" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 inline-flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "create" ? "Create Package" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
