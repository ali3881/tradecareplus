import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const parsed = passwordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "User password not available" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const samePassword = await bcrypt.compare(parsed.data.newPassword, user.passwordHash);
    if (samePassword) {
      return NextResponse.json({ error: "New password must be different" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
