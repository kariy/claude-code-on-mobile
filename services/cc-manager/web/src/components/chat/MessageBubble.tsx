import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  text: string;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-user-bubble rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm",
        )}
      >
        {text}
      </div>
    </div>
  );
}
