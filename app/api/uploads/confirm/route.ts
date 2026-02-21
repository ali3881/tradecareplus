import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, originalName, mime, size, url } = body;

    if (!key || !url) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify key ownership/format if possible, or just create
    // We can enforce that the key starts with context/userId
    // const expectedPrefix = `uploads/${session.user.id}/`;
    // if (!key.startsWith(expectedPrefix)) ...

    // Create FileAsset
    const fileAsset = await prisma.fileAsset.create({
      data: {
        userId: session.user.id,
        key,
        url,
        mime: mime || "application/octet-stream",
        size: size || 0,
        // originalName is not in schema yet, so we don't store it
      },
    });

    return NextResponse.json(fileAsset);

  } catch (error) {
    console.error("Upload confirm error:", error);
    // Handle unique constraint violation (if key already exists)
    // @ts-ignore
    if (error.code === 'P2002') {
       return NextResponse.json(
        { code: "DUPLICATE", message: "File already confirmed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
