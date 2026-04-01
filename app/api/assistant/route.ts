import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildAssistantContext,
  buildAssistantSystemPrompt,
} from "@/lib/assistant-context";
import { convertToModelMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing. Configure it before using the AI assistant." },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    const { messages } = await req.json();
    const latestUserMessage = [...(messages || [])]
      .reverse()
      .find((message) => message.role === "user");

    const latestText =
      latestUserMessage?.parts
        ?.filter((part: { type?: string; text?: string }) => part.type === "text" && typeof part.text === "string")
        .map((part: { text?: string }) => part.text || "")
        .join("")
        .trim() || "";

    const retrievedContext = await buildAssistantContext({
      userId: session?.user?.id,
      lastMessage: latestText,
    });

    const result = streamText({
      model: openai("gpt-5-mini"),
      system: `${buildAssistantSystemPrompt()}\n\nRetrieved context:\n${retrievedContext}`,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error("Assistant chat failed:", error);
    return NextResponse.json({ error: "Failed to process assistant request." }, { status: 500 });
  }
}
