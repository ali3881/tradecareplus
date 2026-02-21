import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  // Allow if in development OR if requester is an admin
  const isDev = process.env.NODE_ENV !== "production";
  
  if (!isDev) {
      try {
          await requireAdmin();
      } catch (e) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  }

  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, user: user.email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
