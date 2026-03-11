"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

type ServiceItem = {
  id: string;
  title: string;
};

type ProjectInput = {
  id?: string;
  title: string;
  imageUrl: string;
  description: string;
  serviceId: string;
};

export default function ProjectForm({
  initial,
  services,
  mode,
}: {
  initial?: ProjectInput;
  services: ServiceItem[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl || "");
  const [form, setForm] = useState<ProjectInput>(
    initial || {
      title: "",
      imageUrl: "",
      description: "<p></p>",
      serviceId: "",
    }
  );

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

    const res = await fetch("/api/admin/projects/upload", {
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
    if (!form.title.trim() || !form.serviceId || !descriptionText) {
      alert("Please fill in title, description, and service.");
      return;
    }

    if (!selectedFile && !form.imageUrl) {
      alert("Please select a project image.");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = selectedFile ? await uploadImage(selectedFile) : form.imageUrl;
      const endpoint = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initial?.id}`;
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
        throw new Error(data?.error || "Failed to save project");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{mode === "create" ? "New Project" : "Edit Project"}</h1>
        <Link href="/admin/projects" className="text-sm text-gray-600 hover:text-gray-800">
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
          <select
            value={form.serviceId}
            onChange={(e) => setForm((current) => ({ ...current, serviceId: e.target.value }))}
            className="rounded border bg-white px-3 py-2"
          >
            <option value="">Select service</option>
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Project image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-yellow-500 file:px-3 file:py-2 file:font-medium file:text-black hover:file:bg-yellow-400"
            />
          </div>
          {previewUrl ? (
            <div className="md:col-span-2">
              <img src={previewUrl} alt="Project preview" className="h-64 w-full rounded-xl object-cover" />
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
          <Link href="/admin/projects" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Create Project" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
