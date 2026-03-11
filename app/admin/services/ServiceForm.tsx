"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { defaultServiceIconKey, getServiceIcon, normalizeServiceIconKey, serviceIconOptions } from "@/lib/services";

type ServiceInput = {
  id?: string;
  title: string;
  imageUrl: string;
  description: string;
  iconKey: string;
};

export default function ServiceForm({
  initial,
  mode,
}: {
  initial?: ServiceInput;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl || "");
  const [iconSearch, setIconSearch] = useState("");
  const [form, setForm] = useState<ServiceInput>(
    initial || {
      title: "",
      imageUrl: "",
      description: "<p></p>",
      iconKey: defaultServiceIconKey,
    }
  );

  useEffect(() => {
    setForm((current) => ({ ...current, iconKey: normalizeServiceIconKey(current.iconKey) }));
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

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/services/upload", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Failed to upload image");
    }

    return data.url as string;
  };

  const save = async () => {
    const descriptionText = form.description.replace(/<[^>]+>/g, "").trim();
    if (!form.title.trim() || !form.iconKey || !descriptionText) {
      alert("Please fill in title, description, and icon.");
      return;
    }

    if (!selectedFile && !form.imageUrl) {
      alert("Please select a service image.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = selectedFile ? await uploadImage(selectedFile) : form.imageUrl;
      const endpoint = mode === "create" ? "/api/admin/services" : `/api/admin/services/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save service");
      }

      router.push("/admin/services");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const ActiveIcon = getServiceIcon(form.iconKey);
  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    return query
      ? serviceIconOptions.filter(
          (option) =>
            option.label.toLowerCase().includes(query) ||
            option.key.toLowerCase().includes(query)
        )
      : serviceIconOptions;
  }, [iconSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{mode === "create" ? "New Service" : "Edit Service"}</h1>
        <Link href="/admin/services" className="text-sm text-gray-600 hover:text-gray-800">
          Back to list
        </Link>
      </div>

      <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
            className="rounded border px-3 py-2"
          />
          <div className="flex items-center gap-3 rounded border px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400">
              <ActiveIcon className="h-5 w-5 text-black" />
            </div>
            <span className="text-sm text-gray-600">Selected icon preview</span>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Choose icon</label>
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder={`Search ${serviceIconOptions.length} Lucide icons`}
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>
            <p className="mb-3 text-xs text-gray-500">
              {iconSearch.trim()
                ? `Showing ${filteredIcons.length} matching icons`
                : `Showing all ${serviceIconOptions.length} icons. Search to narrow the list.`}
            </p>
            <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-gray-200 p-3 md:grid-cols-4">
              {filteredIcons.map((option) => {
                const Icon = option.icon;
                const isActive = option.key === form.iconKey;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, iconKey: option.key }))}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                      isActive ? "border-yellow-500 bg-yellow-50 text-yellow-900" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
              {filteredIcons.length === 0 ? (
                <div className="col-span-full py-8 text-center text-sm text-gray-500">
                  No icons matched your search.
                </div>
              ) : null}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Service image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-yellow-500 file:px-3 file:py-2 file:font-medium file:text-black hover:file:bg-yellow-400"
            />
          </div>
          {previewUrl ? (
            <div className="md:col-span-2">
              <img src={previewUrl} alt="Service preview" className="h-64 w-full rounded-xl object-cover" />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <RichTextEditor
            value={form.description}
            onChange={(value) => setForm((current) => ({ ...current, description: value }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/admin/services" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Create Service" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
