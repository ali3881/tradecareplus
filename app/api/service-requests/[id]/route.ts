import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    const where: any = { id };

    // Authorization Check
    if (user.role === "ADMIN") {
      // Admin can view any job
    } else if (user.role === "STAFF") {
      // Staff can view assigned jobs
      where.assignedToId = session.user.id;
    } else {
      // User can only view their own jobs
      where.userId = session.user.id;
    }

    const job = await prisma.serviceRequest.findFirst({
      where,
      include: {
        attachments: true,
        user: { select: { name: true, email: true, phone: true } },
        assignedTo: { select: { name: true, email: true } }
      },
    });

    if (!job) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Failed to fetch service request:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    // Verify existence and permissions first
    const existingJob = await prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Job not found" },
        { status: 404 }
      );
    }

    // Authorization Logic
    let canEdit = false;
    if (user.role === "ADMIN") {
      canEdit = true;
    } else if (user.role === "STAFF") {
      // Staff can only update jobs assigned to them
      if (existingJob.assignedToId === user.id) {
        canEdit = true;
      }
    } else {
      // Users can typically NOT update jobs once created, or maybe cancel if NEW
      // For now, let's say users cannot update via this route (Admin/Staff only)
      // Or if we want users to cancel:
      if (existingJob.userId === user.id && body.status === "CANCELLED") {
          canEdit = true;
      }
    }

    if (!canEdit) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "You do not have permission to update this job" },
        { status: 403 }
      );
    }

    // Construct update data based on role
    const updateData: any = {};
    
    // Status updates
    if (body.status) {
       updateData.status = body.status;
    }

    // Assignment (Admin only)
    if (body.assignedToId !== undefined && user.role === "ADMIN") {
       updateData.assignedToId = body.assignedToId;
    }

    // Other fields if needed...

    const updatedJob = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        attachments: true,
        user: true,
        assignedTo: true
      }
    });

    return NextResponse.json(updatedJob);

  } catch (error: any) {
    console.error("Failed to update service request:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    const where: any = { id };
    
    // Authorization Check
    if (user.role === "ADMIN") {
      // Admin can delete any job
    } else if (user.role === "STAFF") {
      // Staff cannot delete jobs
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Staff cannot delete jobs" },
        { status: 403 }
      );
    } else {
      // User can only delete their own jobs
      where.userId = session.user.id;
    }

    // 1. Verify ownership and existence
    const job = await prisma.serviceRequest.findFirst({
      where,
      include: {
        attachments: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Job not found" },
        { status: 404 }
      );
    }

    // 2. Delete Logic
    if (job.attachments && job.attachments.length > 0) {
        const assetIds = job.attachments.map(a => a.id);
        await prisma.fileAsset.deleteMany({
            where: {
                id: { in: assetIds }
            }
        });
    }

    // Now delete the service request
    await prisma.serviceRequest.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Failed to delete service request:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
