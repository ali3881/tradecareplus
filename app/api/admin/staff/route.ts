import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  tempPassword: z.string().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const json = await request.json();
    const body = createStaffSchema.parse(json);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      // If user exists but is not STAFF, we could promote them, but for now let's return conflict
      // or if they are already staff, maybe just update?
      // Requirement says "create user", implying new. 
      // Better to return conflict if email taken.
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    let passwordHash = undefined;
    if (body.tempPassword) {
      passwordHash = await bcrypt.hash(body.tempPassword, 10);
    }

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: "STAFF",
        isActive: body.isActive ?? true,
        passwordHash,
      },
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      isActive: newUser.isActive,
      role: newUser.role,
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const staff = await prisma.user.findMany({
      where: { role: "STAFF" },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { assignedJobs: true }
        }
      }
    });
    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
