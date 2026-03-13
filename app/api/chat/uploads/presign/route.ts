import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { buildStorageKey, createStorageClient, getStoragePublicUrl } from "@/lib/storage";

const s3 = createStorageClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { mime, size, threadId } = body;

  if (!s3) {
    return new NextResponse("Storage is not configured", { status: 500 });
  }

  if (size > 10 * 1024 * 1024) { // 10MB limit
    return new NextResponse("File too large", { status: 400 });
  }

  const key = buildStorageKey(`chat/${threadId}/${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: mime,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = getStoragePublicUrl(key);

  // Optimistically create FileAsset or do it after confirmation
  // Here we just return the URL
  
  return NextResponse.json({ uploadUrl, key, publicUrl });
}
