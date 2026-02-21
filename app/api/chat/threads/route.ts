import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const threads = await prisma.chatThread.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(threads);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check subscription (Basic+ allowed)
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const hasAccess = session.user.role === "ADMIN" || (sub && sub.status === "ACTIVE");

  if (!hasAccess) {
    return new NextResponse("Active subscription required", { status: 403 });
  }

  const thread = await prisma.chatThread.create({
    data: {
      userId: session.user.id,
      status: "OPEN",
    },
  });

  return NextResponse.json(thread);
}
