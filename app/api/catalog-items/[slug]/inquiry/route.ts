import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSaleInquiryAdminEmailTemplate, sendMail } from "@/lib/mailer";
import { validateStoredPhoneNumber } from "@/lib/phone";

export const runtime = "nodejs";

const inquirySchema = z.object({
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(40).optional().or(z.literal("")).default(""),
  message: z.string().max(1500).optional().or(z.literal("")).default(""),
});

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const body = inquirySchema.parse(await request.json());
    const item = await prisma.catalogItem.findUnique({ where: { slug: params.slug } });

    if (!item || !item.isActive || item.itemType !== "SALE") {
      return NextResponse.json({ error: "Sale item not found" }, { status: 404 });
    }

    if (body.customerPhone.trim()) {
      const phoneValidation = validateStoredPhoneNumber(body.customerPhone);
      if (!phoneValidation.valid) {
        return NextResponse.json({ error: phoneValidation.message }, { status: 400 });
      }
    }

    const inquiry = await prisma.saleInquiry.create({
      data: {
        itemId: item.id,
        userId: session?.user?.id || null,
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim().toLowerCase(),
        customerPhone: body.customerPhone.trim() || null,
        message: body.message.trim() || null,
      },
    });

    const supportEmail = process.env.SMTP_FROM || process.env.SMTP_USER || body.customerEmail;
    const adminEmail = buildSaleInquiryAdminEmailTemplate({
      itemName: item.name,
      customerName: inquiry.customerName,
      customerEmail: inquiry.customerEmail,
      customerPhone: inquiry.customerPhone,
      message: inquiry.message,
    });

    await sendMail({
      to: supportEmail,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    console.error("Error creating sale inquiry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
