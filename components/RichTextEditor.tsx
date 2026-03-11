"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerHTML === value) {
      return;
    }

    editor.innerHTML = value;
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 p-3">
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "h2")}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "h3")}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "p")}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => runCommand("bold")}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("italic")}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("insertUnorderedList")}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100"
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("insertOrderedList")}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "blockquote")}
          className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-100"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-[280px] bg-white p-4 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-yellow-500 [&_blockquote]:pl-4 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
}
