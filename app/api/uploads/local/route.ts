import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Missing upload key" },
        { status: 400 }
      );
    }

    // Security: Prevent path traversal
    if (key.includes("..")) {
      return NextResponse.json(
        { code: "SECURITY_ERROR", message: "Invalid file path" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await req.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, key);
    const fileDir = path.dirname(filePath);

    await mkdir(fileDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({ message: "Uploaded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to write file" },
      { status: 500 }
    );
  }
}
