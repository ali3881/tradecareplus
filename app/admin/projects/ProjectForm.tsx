"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { parseResponse } from "@/lib/http";

type ServiceItem = {
  id: string;
  title: string;
};

type ProjectInput = {
  id?: string;
  title: string;
  imageUrl: string;
  images: string[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState<ProjectInput>(
    initial || {
      title: "",
      imageUrl: "",
      images: [],
      description: "<p></p>",
      serviceId: "",
    }
  );
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setLocalPreviews([]);
      return;
    }

    const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setLocalPreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const uploadImage = async (file: File) => {
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mime: file.type,
        size: file.size,
        filename: file.name,
        context: "projects",
      }),
    });
    const presignParsed = await parseResponse<{
      uploadUrl: string;
      key: string;
      publicUrl: string;
      message?: string;
    }>(presignRes);

    if (!presignParsed.ok || !presignParsed.json?.uploadUrl || !presignParsed.json?.publicUrl) {
      throw new Error(presignParsed.json?.message || presignParsed.text || "Failed to create upload");
    }

    const uploadUrl = presignParsed.json.uploadUrl.startsWith("/")
      ? `${window.location.origin}${presignParsed.json.uploadUrl}`
      : presignParsed.json.uploadUrl;

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image");
    }

    const confirmRes = await fetch("/api/uploads/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: presignParsed.json.key,
        url: presignParsed.json.publicUrl,
        mime: file.type,
        size: file.size,
        originalName: file.name,
      }),
    });
    const confirmParsed = await parseResponse<{ message?: string }>(confirmRes);

    if (!confirmParsed.ok && confirmRes.status !== 409) {
      throw new Error(confirmParsed.json?.message || confirmParsed.text || "Failed to confirm upload");
    }

    return presignParsed.json.publicUrl;
  };

  const save = async () => {
    const descriptionText = form.description.replace(/<[^>]+>/g, "").trim();
    if (!form.title.trim() || !form.serviceId || !descriptionText) {
      alert("Please fill in title, description, and service.");
      return;
    }

    if (form.images.length === 0 && selectedFiles.length === 0) {
      alert("Please select at least one project image.");
      return;
    }

    setSaving(true);
    try {
      const uploadedImages = selectedFiles.length
        ? await Promise.all(selectedFiles.map((file) => uploadImage(file)))
        : [];
      const images = [...form.images, ...uploadedImages];
      const imageUrl = images[0];
      const endpoint = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          imageUrl,
          images,
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

  const combinedPreviews = [
    ...form.images.map((url) => ({ type: "saved" as const, url })),
    ...localPreviews.map((url, index) => ({ type: "new" as const, url, index })),
  ];

  const removeSavedImage = (index: number) => {
    setForm((current) => {
      const images = current.images.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...current,
        images,
        imageUrl: images[0] || "",
      };
    });
  };

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const moveSavedImage = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.images.length) {
        return current;
      }

      const images = [...current.images];
      const [moved] = images.splice(index, 1);
      images.splice(nextIndex, 0, moved);

      return {
        ...current,
        images,
        imageUrl: images[0] || "",
      };
    });
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Project images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              className="block w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-yellow-500 file:px-3 file:py-2 file:font-medium file:text-black hover:file:bg-yellow-400"
            />
            <p className="mt-2 text-xs text-gray-500">
              The first image becomes the main project image. You can reorder saved images below.
            </p>
          </div>
          {combinedPreviews.length > 0 ? (
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {combinedPreviews.map((item, index) => (
                  <div key={`${item.type}-${item.url}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={item.url} alt={`Project preview ${index + 1}`} className="h-48 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <GripVertical className="h-4 w-4" />
                        <span>{index === 0 ? "Primary image" : `Image ${index + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.type === "saved" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => moveSavedImage(index, -1)}
                              disabled={index === 0}
                              className="rounded border px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSavedImage(index, 1)}
                              disabled={index >= form.images.length - 1}
                              className="rounded border px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSavedImage(index)}
                              className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(item.index)}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
