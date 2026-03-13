import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { buildStorageKey, createStorageClient, getStoragePublicUrl } from "@/lib/storage";

const s3 = createStorageClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let session;
  try {
    session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Please sign in to upload files" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mime, size, context, contextId, filename } = body;

    // Validation
    if (!mime || !size) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Missing mime type or size" },
        { status: 400 }
      );
    }

    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid file type. Only images and videos are allowed." },
        { status: 400 }
      );
    }

    const limit = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image

    if (size > limit) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: `File too large. Max ${isVideo ? '100MB' : '10MB'}` },
        { status: 400 }
      );
    }

  const key = buildStorageKey(
    `${context || "files"}/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}${
      filename ? `-${filename.replace(/[^a-zA-Z0-9.-]/g, "")}` : ""
    }`
  );
  
  let uploadUrl: string;
  let publicUrl: string;

    if (s3) {
      // S3 Upload
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ContentType: mime,
        ContentLength: size,
      });

      uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      publicUrl = getStoragePublicUrl(key);
    } else {
      // Local Filesystem Upload
      // Client will PUT to this URL. 
      // IMPORTANT: Client must include the key as query param, matching what we generated.
      // NOTE: We return a relative URL here so the client uses the current origin
      uploadUrl = `/api/uploads/local?key=${encodeURIComponent(key)}`;
      
      // Public URL is where it can be viewed. 
      // Since we save to public/uploads, the URL path is /uploads/KEY
      publicUrl = `/uploads/${key}`;
    }

    // NOTE: We do NOT create the FileAsset here anymore to avoid SQLite locks during presign.
    // The client must call /api/uploads/confirm after successful upload.

    return NextResponse.json({ uploadUrl, key, publicUrl });

  } catch (error) {
    console.error("Presign error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
      // @ts-ignore
      code: (error as any).code,
      sessionUser: session?.user?.id
    });
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to generate upload URL: " + (error as Error).message },
      { status: 500 }
    );
  }
}
