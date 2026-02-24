import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    const isAdmin = session.user.role === "ADMIN";

    const job = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        attachments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!isAdmin && job.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.serviceRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminOrStaff();
    const isAdmin = session.user.role === "ADMIN";
    const body = await request.json();
    const { status, assignedToId } = body;

    const existingJob = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      select: { id: true, assignedToId: true },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!isAdmin && existingJob.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (isAdmin && assignedToId !== undefined) data.assignedToId = assignedToId;

    const job = await prisma.serviceRequest.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
