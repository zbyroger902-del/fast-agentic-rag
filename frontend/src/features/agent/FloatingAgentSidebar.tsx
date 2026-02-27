import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Paperclip, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && !file) return;

    setMessages((prev) => {
      const next: ChatMessage[] = [...prev];

      if (input.trim()) {
        next.push({ id: Date.now(), role: "user", text: input.trim() });
      }

      if (!input.trim() && file) {
        next.push({
          id: Date.now() + 1,
          role: "agent",
          text: `I see you uploaded "${file.name}". Do you want me to add this to the Knowledge Base, or just answer questions about it?`,
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
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
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
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-xs">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-center pt-4 leading-relaxed">
            Start a conversation or drop a file. When you upload a document
            without typing anything, the agent will ask whether to add it to the
            Knowledge Base or just use it for this chat.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-3 py-2 leading-relaxed",
                  message.role === "user"
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-900 text-slate-100 border border-slate-800",
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style Prompt Form */}
      <div className="border-t border-slate-800 px-3 py-3">
        <InputGroup>
          {/* Top addon: file attach + agent mode label */}
          <InputGroupAddon align="block-start" className="divide-slate-800">
            <InputGroupButton
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attach</span>
            </InputGroupButton>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <span className="ml-1 text-slate-700 select-none">/</span>

            <InputGroupButton className="text-slate-500">
              Agent Mode
            </InputGroupButton>
          </InputGroupAddon>

          {/* Auto-growing textarea */}
          <InputGroupTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, Search or Chat..."
          />

          {/* Bottom addon: optional file chip + send button */}
          <InputGroupAddon align="block-end">
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300 hover:border-slate-600 transition-colors"
                title="Remove file"
              >
                <span className="max-w-[100px] truncate">{file.name}</span>
                <X className="h-2.5 w-2.5 shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() && !file}
              aria-label="Send message"
              className={cn(
                "ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                input.trim() || file
                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed",
              )}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </InputGroupAddon>
        </InputGroup>

        <p className="mt-1.5 text-center text-[10px] text-slate-600">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
