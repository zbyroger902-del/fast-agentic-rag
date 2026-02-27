import React, { useMemo, useState } from "react";
import { MessageCircle, Paperclip, Send, X } from "lucide-react";

type Role = "user" | "agent";

interface ChatMessage {
  id: number;
  role: Role;
  text: string;
}

export const FloatingAgentSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fileLabel = useMemo(() => file?.name ?? "Attach file", [file]);

  const handleSend = () => {
    if (!input.trim() && !file) {
      return;
    }

    setMessages((prev) => {
      const next: ChatMessage[] = [...prev];

      if (input.trim()) {
        next.push({
          id: Date.now(),
          role: "user",
          text: input.trim(),
        });
      }

      if (!input.trim() && file) {
        next.push({
          id: Date.now() + 1,
          role: "agent",
          text: `I see you uploaded “${file.name}”. Do you want me to add this to the Knowledge Base, or just answer questions about it?`,
        });
      } else if (input.trim()) {
        next.push({
          id: Date.now() + 2,
          role: "agent",
          text: "Got it — this is a placeholder response. The real agent backend will stream replies here.",
        });
      }

      return next;
    });

    setInput("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFile(selected ?? null);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="m-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-100 shadow-lg ring-1 ring-slate-700 hover:bg-slate-800"
        aria-label="Open agent sidebar"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-950/90">
      <header className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-200">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
            <MessageCircle className="h-3 w-3" />
          </span>
          <span>Agent</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 hover:bg-slate-800 hover:text-slate-100"
          aria-label="Collapse agent sidebar"
        >
          <X className="h-3 w-3" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-xs">
        {messages.length === 0 ? (
          <p className="text-slate-500">
            Start a conversation or drop a file. When you upload a document
            without typing anything, the agent will ask whether to add it to the
            Knowledge Base or just use it for this chat.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  message.role === "user"
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-900 text-slate-100 border border-slate-800"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="border-t border-slate-800 px-3 py-2 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-900 cursor-pointer">
            <Paperclip className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{fileLabel}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything..."
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            disabled={!input.trim() && !file}
            aria-label="Send message"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
}

