import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: params.id },
  });

  if (!thread || thread.userId !== session.user.id) {
    return new NextResponse("Not found or unauthorized", { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { text, attachments } = body;

  const thread = await prisma.chatThread.findUnique({
    where: { id: params.id },
  });

  if (!thread || thread.userId !== session.user.id) {
    return new NextResponse("Not found or unauthorized", { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId: params.id,
      sender: "USER",
      senderId: session.user.id,
      text: text,
      attachmentsJson: attachments ? JSON.stringify(attachments) : null,
    },
  });

  // Broadcast
  await pusherServer.trigger(`private-thread-${params.id}`, "new-message", message);

  return NextResponse.json(message);
}
