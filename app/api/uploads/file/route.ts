import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStorageKey, createStorageClient, getStoragePublicUrl } from "@/lib/storage";

const s3 = createStorageClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Please sign in to upload files" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const context = String(formData.get("context") || "files");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Missing upload file" },
        { status: 400 }
      );
    }

    const mime = file.type || "application/octet-stream";
    const size = file.size;
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid file type. Only images and videos are allowed." },
        { status: 400 }
      );
    }

    const limit = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (size > limit) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: `File too large. Max ${isVideo ? "100MB" : "10MB"}` },
        { status: 400 }
      );
    }

    const key = buildStorageKey(
      `${context}/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFilename(file.name)}`
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    let publicUrl: string;

    if (s3) {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: key,
          Body: buffer,
          ContentType: mime,
          ContentLength: size,
        })
      );
      publicUrl = getStoragePublicUrl(key);
    } else {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, key);

      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${key}`;
    }

    const fileAsset = await prisma.fileAsset.create({
      data: {
        userId: session.user.id,
        key,
        url: publicUrl,
        mime,
        size,
      },
    });

    return NextResponse.json({
      key,
      publicUrl,
      fileAssetId: fileAsset.id,
    });
  } catch (error) {
    console.error("Direct upload error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
