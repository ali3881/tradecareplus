"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getTextFromMessage(message: { parts?: Array<{ type?: string; text?: string }> }) {
  return (message.parts || [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function FloatingChatAssistant() {
  const { data: session, status: sessionStatus } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>(undefined);
  const listRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(
    () => `tradecareplus-ai-chat:${session?.user?.id || "guest"}`,
    [session?.user?.id]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        setInitialMessages(JSON.parse(raw));
      } else {
        setInitialMessages([]);
      }
    } catch {
      setInitialMessages([]);
    }
  }, [storageKey]);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/assistant",
    }),
    messages: initialMessages ?? [],
  });

  useEffect(() => {
    if (initialMessages !== undefined) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    if (typeof window === "undefined" || initialMessages === undefined) return;
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey, initialMessages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value || status !== "ready") return;
    sendMessage({ text: value });
    setInput("");
  };

  const handleClear = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();

    const value = input.trim();
    if (!value || status !== "ready") return;

    sendMessage({ text: value });
    setInput("");
  };

  const assistantIsThinking = status !== "ready";

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 top-20 z-[1200] flex w-[calc(100vw-2rem)] max-w-[28rem] flex-col overflow-hidden rounded-3xl border border-yellow-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.18)] md:max-w-[32rem]">
          <div className="flex items-center justify-between bg-yellow-400 px-5 py-4 text-stone-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Chat Assistance</p>
                
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:bg-black/10"
              >
                Clear Chat
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-stone-700 transition hover:bg-black/10"
                aria-label="Close chat assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fffdf5] px-4 py-4">
            

            {messages.map((message) => {
              const text = getTextFromMessage(message);
              if (!text) return null;

              return (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "ml-auto bg-stone-900 text-white"
                      : "mr-auto bg-yellow-100 text-stone-800"
                  }`}
                >
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] opacity-70">
                    {message.role === "user" ? "You" : "Assistant"}
                  </p>
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="prose prose-sm prose-stone max-w-none [&_li]:my-0 [&_ol]:my-2 [&_p]:my-0 [&_ul]:my-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node: _node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-stone-900 underline underline-offset-2"
                            />
                          ),
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}

            {assistantIsThinking && (
              <div className="mr-auto flex max-w-[88%] items-center gap-3 rounded-2xl bg-yellow-100 px-4 py-3 text-sm text-stone-700 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error.message || "The assistant could not respond right now."}
              </div>
            )}
          </div>

          <div className="border-t border-yellow-100 bg-white px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-end gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-3 transition focus-within:border-yellow-400">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask me anything about TradeCarePlus..."
                  className="min-h-[56px] flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm text-stone-700 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || status !== "ready"}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-stone-900 transition hover:bg-[#eab308] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-stone-900 shadow-[0_12px_32px_rgba(255,197,38,0.45)] transition hover:scale-105 hover:bg-[#eab308]"
        title="Open chat assistant"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-8 w-8" />
      </button>
    </>
  );
}
