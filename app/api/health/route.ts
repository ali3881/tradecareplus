import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const dbUrl = process.env.DATABASE_URL || "unknown";
    
    // Resolve DB path if it's sqlite
    let dbPath = "remote/unknown";
    if (dbUrl.startsWith("file:")) {
        const relativePath = dbUrl.replace("file:", "");
        dbPath = path.resolve(process.cwd(), relativePath);
    }

    return NextResponse.json({
      ok: true,
      database: {
        url: dbUrl,
        resolvedPath: dbPath,
      },
      stats: {
        userCount,
      },
      env: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
