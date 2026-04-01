import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizePhoneNumber, validatePhoneLocalNumber } from "@/lib/phone";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phoneCountryCode: z.string().min(1).optional(),
  phoneNumber: z.string().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const dialCode = parsed.data.phoneCountryCode?.trim() || "";
    const localNumber = parsed.data.phoneNumber?.trim() || "";

    if (localNumber) {
      const phoneValidation = validatePhoneLocalNumber(dialCode, localNumber);
      if (!phoneValidation.valid) {
        return NextResponse.json({ error: phoneValidation.message }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name.trim(),
        phone: localNumber ? normalizePhoneNumber(dialCode, localNumber) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
