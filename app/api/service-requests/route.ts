import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createServiceRequestSchema = z.object({
  type: z.string().min(1).max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  urgency: z.enum(["NORMAL", "URGENT", "EMERGENCY"]),
  afterHours: z.boolean(),
  locationText: z.string().optional(),
  attachmentKeys: z.array(z.string()).optional(),
  attachmentIds: z.array(z.string()).optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Singleton prisma instance is already imported from @/lib/prisma
    // We don't need to re-instantiate it.

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    const hasAccess = user.role === "ADMIN" || (user.subscription && user.subscription.status === "ACTIVE");

    if (!hasAccess) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Active subscription required" },
        { status: 403 }
      );
    }

    let json;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const body = createServiceRequestSchema.parse(json);

    const serviceType = await prisma.serviceType.findUnique({
      where: { title: body.type.trim() },
      select: { id: true },
    });

    if (!serviceType) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid service type" },
        { status: 422 }
      );
    }

    // Calculate Eligibility (Mock Logic)
    // In real app, check entitlement.includedVisitsRemaining > 0
    const isEligible = true; // Simplified for now
    const eligibilityStatus = isEligible ? "INCLUDED" : "PAY_AS_YOU_GO";
    const discountPercent = isEligible ? 100 : 15; // 15% off for members

    // Prepare attachments connection if any
    let attachmentsConnect = undefined;
    
    // Prefer connecting by IDs if available (more reliable as they are confirmed)
    if (body.attachmentIds && body.attachmentIds.length > 0) {
       attachmentsConnect = {
        connect: body.attachmentIds.map((id) => ({ id })),
      };
    }
    // Fallback to keys for backward compatibility or if IDs missing
    else if (body.attachmentKeys && body.attachmentKeys.length > 0) {
      // Lookup IDs from keys first to avoid "connect by key" if key isn't unique enough or for safety
      const assets = await prisma.fileAsset.findMany({
        where: {
          key: { in: body.attachmentKeys },
          userId: user.id,
        },
        select: { id: true }
      });

      if (assets.length !== body.attachmentKeys.length) {
         // Some keys missing or not owned
         return NextResponse.json(
          { code: "VALIDATION_ERROR", message: "Invalid or unauthorized attachment keys" },
          { status: 400 }
        );
      }
      
      attachmentsConnect = {
        connect: assets.map((a) => ({ id: a.id })),
      };
    }

    // Retry logic for SQLITE_BUSY
    let retries = 3;
    let serviceRequest;
    
    while (retries > 0) {
      try {
        serviceRequest = await prisma.serviceRequest.create({
          data: {
            userId: user.id,
            type: body.type,
            description: body.description,
            urgency: body.urgency,
            afterHours: body.afterHours,
            locationText: body.locationText,
            eligibilityStatus,
            discountPercent,
            attachments: attachmentsConnect,
          },
          include: {
            attachments: true,
          }
        });
        break; // Success
      } catch (e: any) {
         const msg = String(e?.message ?? "");
         if (msg.includes("SQLITE_BUSY") || msg.includes("database is locked")) {
           retries--;
           if (retries === 0) throw e;
           await new Promise(r => setTimeout(r, 200 * (4 - retries))); // 200, 400, 600ms
         } else {
           throw e;
         }
      }
    }

    return NextResponse.json(serviceRequest, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid input data", issues: error.issues },
        { status: 422 }
      );
    }

    console.error("SERVICE_REQUEST_CREATE_FAILED", error);
    return NextResponse.json(
      { 
        code: "SERVER_ERROR", 
        message: error?.message ?? "Internal Server Error",
        prisma: error?.code ?? null 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    let where: any = { userId: session.user.id };
    let include: any = { attachments: true };

    // ADMIN: View ALL jobs
    if (user.role === "ADMIN") {
      where = {}; // No filter, return all
      include = { 
        attachments: true, 
        user: { select: { name: true, email: true, phone: true } },
        assignedTo: { select: { name: true, email: true } }
      };
    } 
    // STAFF: View assigned jobs only
    else if (user.role === "STAFF") {
      where = { assignedToId: session.user.id };
      include = { 
        attachments: true,
        user: { select: { name: true, email: true, phone: true } }
      };
    }
    // USER: View only their own (default)

    const serviceRequests = await prisma.serviceRequest.findMany({
      where,
      include,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(serviceRequests);
  } catch (error) {
    console.error("Failed to fetch service requests:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Failed to fetch service requests" },
      { status: 500 }
    );
  }
}
