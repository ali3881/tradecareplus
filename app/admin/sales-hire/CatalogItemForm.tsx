"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { parseResponse } from "@/lib/http";
import { stripCatalogHtml } from "@/lib/catalog";

type CatalogItemInput = {
  id?: string;
  name: string;
  category: string;
  itemType: "HIRE" | "SALE";
  pricingModel: "PER_DAY" | "PER_WEEK" | "PER_METER_PER_WEEK" | "FIXED";
  price: number;
  quantityAvailable: number;
  imageUrl: string;
  shortDescription: string;
  description: string;
  unitLabel: string;
  minHireDays: number;
  isActive: boolean;
};

type FieldErrors = Partial<Record<keyof CatalogItemInput, string>>;

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export default function CatalogItemForm({
  initial,
  mode,
}: {
  initial?: CatalogItemInput;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl || "");
  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<CatalogItemInput>(
    initial || {
      name: "",
      category: "",
      itemType: "HIRE",
      pricingModel: "PER_DAY",
      price: 0,
      quantityAvailable: 1,
      imageUrl: "",
      shortDescription: "",
      description: "<p></p>",
      unitLabel: "",
      minHireDays: 1,
      isActive: true,
    }
  );

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(form.imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.imageUrl, selectedFile]);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/catalog-categories", { cache: "no-store" });
      const data = await res.json().catch(() => []);
      const nextCategories = Array.isArray(data) ? data : [];
      setCategories(nextCategories);
      if (!form.category && nextCategories[0]) {
        setForm((current) => ({ ...current, category: nextCategories[0] }));
      }
    } catch {
      setCategories([]);
    }
  };

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    body.append("context", "sales-hire");

    const uploadRes = await fetch("/api/uploads/file", {
      method: "POST",
      body,
    });
    const uploadParsed = await parseResponse<{
      publicUrl: string;
      message?: string;
    }>(uploadRes);

    if (!uploadParsed.ok || !uploadParsed.json?.publicUrl) {
      throw new Error(uploadParsed.json?.message || uploadParsed.text || "Failed to upload image");
    }

    return uploadParsed.json.publicUrl;
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    const descriptionText = stripCatalogHtml(form.description);

    if (!form.name.trim()) nextErrors.name = "Item name is required.";
    if (!form.category.trim()) nextErrors.category = "Choose or create a category.";
    if (!descriptionText) nextErrors.description = "Full details are required.";
    if (!form.shortDescription.trim()) nextErrors.shortDescription = "Short description is required.";
    if (!selectedFile && !form.imageUrl) nextErrors.imageUrl = "Please upload an item image.";
    if (form.price < 0) nextErrors.price = "Price cannot be negative.";
    if (form.quantityAvailable < 0) nextErrors.quantityAvailable = "Quantity cannot be negative.";
    if (form.itemType === "HIRE" && form.minHireDays < 1) nextErrors.minHireDays = "Minimum hire days must be at least 1.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      if (selectedFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(selectedFile);
      }

      const endpoint = mode === "create" ? "/api/admin/catalog-items" : `/api/admin/catalog-items/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          category: form.category.trim(),
          imageUrl,
          shortDescription: form.shortDescription.trim(),
          unitLabel: form.unitLabel.trim(),
          price: Number(form.price),
          quantityAvailable: Number(form.quantityAvailable),
          minHireDays: Number(form.minHireDays),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save item");
      }

      router.push("/admin/sales-hire");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save item");
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const pricingOptions = useMemo(
    () => [
      { value: "PER_DAY", label: "Per Day" },
      { value: "PER_WEEK", label: "Per Week" },
      { value: "PER_METER_PER_WEEK", label: "Per Meter / Week" },
      { value: "FIXED", label: "Fixed Price" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{mode === "create" ? "New Sales / Hire Item" : "Edit Sales / Hire Item"}</h1>
        <Link href="/admin/sales-hire" className="text-sm text-gray-600 hover:text-gray-800">
          Back to list
        </Link>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Item Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </Field>

          <Field label="Item Type" required>
            <select
              value={form.itemType}
              onChange={(e) => setForm((current) => ({ ...current, itemType: e.target.value as CatalogItemInput["itemType"] }))}
              className="w-full rounded border bg-white px-3 py-2"
            >
              <option value="HIRE">Hire</option>
              <option value="SALE">Sale</option>
            </select>
          </Field>

          <Field label="Category" required error={errors.category} hint="Manage the category list from the main Sales and Hire admin page.">
            <select
              value={form.category}
              onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
              className="w-full rounded border bg-white px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Pricing Model" required>
            <select
              value={form.pricingModel}
              onChange={(e) => setForm((current) => ({ ...current, pricingModel: e.target.value as CatalogItemInput["pricingModel"] }))}
              className="w-full rounded border bg-white px-3 py-2"
            >
              {pricingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Price (AUD)" required error={errors.price}>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((current) => ({ ...current, price: Number(e.target.value) }))}
              className="w-full rounded border px-3 py-2"
            />
          </Field>

          <Field label="Quantity Available" required error={errors.quantityAvailable}>
            <input
              type="number"
              min={0}
              value={form.quantityAvailable}
              onChange={(e) => setForm((current) => ({ ...current, quantityAvailable: Number(e.target.value) }))}
              className="w-full rounded border px-3 py-2"
            />
          </Field>

          <Field label="Unit Label" hint="Optional. Example: unit, machine, meter.">
            <input
              value={form.unitLabel}
              onChange={(e) => setForm((current) => ({ ...current, unitLabel: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </Field>

          <Field label="Minimum Hire Days" error={errors.minHireDays} hint="Used only for hire items.">
            <input
              type="number"
              min={1}
              value={form.minHireDays}
              onChange={(e) => setForm((current) => ({ ...current, minHireDays: Number(e.target.value) }))}
              className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
              disabled={form.itemType !== "HIRE"}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Item Image" required error={errors.imageUrl} hint="Uploads to your existing S3 storage in a separate sales-hire folder.">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-yellow-500 file:px-3 file:py-2 file:font-medium file:text-black hover:file:bg-yellow-400"
              />
            </Field>
            {previewUrl ? <img src={previewUrl} alt="Item preview" className="mt-3 h-64 w-full rounded-xl object-cover" /> : null}
          </div>

          <div className="md:col-span-2">
            <Field label="Short Description" required error={errors.shortDescription} hint="Used in list cards and previews.">
              <textarea
                value={form.shortDescription}
                onChange={(e) => setForm((current) => ({ ...current, shortDescription: e.target.value }))}
                className="w-full rounded border px-3 py-2"
                rows={3}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Full Details" required error={errors.description} hint="Rich text editor, same style as services and projects.">
              <RichTextEditor
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              />
            </Field>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))}
          />
          Active on website
        </label>

        <div className="flex justify-end gap-2">
          <Link href="/admin/sales-hire" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving || uploadingImage}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving || uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Create Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
