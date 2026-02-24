import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAdminOrStaff();
    const isStaff = session.user.role === "STAFF";

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const urgency = searchParams.get("urgency");
    
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (isStaff) where.assignedToId = session.user.id;

    const jobs = await prisma.serviceRequest.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        attachments: true,
      },
    });

    const total = await prisma.serviceRequest.count({ where });

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
