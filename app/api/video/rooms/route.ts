import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check if Standard or Premium
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const hasAccess = session.user.role === "ADMIN" || (sub && sub.status === "ACTIVE");

  if (!hasAccess) {
    return new NextResponse("Active subscription required", { status: 403 });
  }

  if (sub?.plan === "BASIC") {
    // Maybe limit minutes? Or allow but with restrictions.
    // For now, allow basic.
  }

  // Create Daily room
  const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    }),
  });

  if (!dailyRes.ok) {
    return new NextResponse("Failed to create room", { status: 500 });
  }

  const roomData = await dailyRes.json();
  const { url, name } = roomData;

  const room = await prisma.videoRoom.create({
    data: {
      userId: session.user.id,
      roomId: name,
      roomUrl: url,
      provider: "DAILY",
      status: "ACTIVE",
    },
  });

  return NextResponse.json(room);
}
