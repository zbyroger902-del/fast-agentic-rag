import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="m-4 h-12 w-12 rounded-full"
        aria-label="Open agent sidebar"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30">
            <MessageCircle className="h-3 w-3" />
          </span>
          <span>Agent</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={() => setIsOpen(false)}
          aria-label="Collapse agent sidebar"
        >
          <X className="h-3 w-3" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-xs">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center pt-4 leading-relaxed">
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
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border",
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input: shadcn Button + Textarea */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <span className="max-w-[100px] truncate">{file.name}</span>
              <X className="h-3 w-3 shrink-0" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 rounded-lg border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, Search or Chat..."
            className="min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            size="icon"
            variant="default"
            className="self-end shrink-0 rounded-lg m-1"
            onClick={handleSend}
            disabled={!input.trim() && !file}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
