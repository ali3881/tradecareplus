import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  plan: z.string().min(1, "Plan is required"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = signupSchema.safeParse(json);

    if (!body.success) {
      const errorMsg = body.error.issues.map(i => i.message).join(", ");
      return new NextResponse(errorMsg, { status: 400 });
    }

    const { name, email, password, phone } = body.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user only; subscription is created after Stripe checkout webhook confirms payment.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: "USER",
      },
    });

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error("Signup error:", error);
    
    // Handle Database Connection Errors (Prisma P1001 etc)
    if (error.code === 'P1001' || error.message?.includes('Can\'t reach database server')) {
        return new NextResponse("Database unavailable. Check DATABASE_URL and DB server.", { status: 503 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
