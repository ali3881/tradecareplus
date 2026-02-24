import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
