import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "");
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 10MB or smaller" }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}-${sanitizeFilename(file.name || "service-image")}`;
    const relativeDir = path.join("services");
    const relativePath = path.join(relativeDir, filename);
    const absoluteDir = path.join(process.cwd(), "public", "uploads", relativeDir);
    const absolutePath = path.join(process.cwd(), "public", "uploads", relativePath);

    await mkdir(absoluteDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(absolutePath, Buffer.from(bytes));

    return NextResponse.json({
      url: `/uploads/${relativePath.replace(/\\/g, "/")}`,
    });
  } catch (error) {
    console.error("Admin service upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
