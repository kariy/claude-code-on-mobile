import { useRef, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  }, [onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, []);

  return (
    <div className="flex items-end gap-2.5 p-3 border-t border-border bg-background shrink-0">
      <Textarea
        ref={textareaRef}
        rows={1}
        placeholder="Message..."
        className="flex-1 min-h-0 max-h-[120px] resize-none rounded-2xl border-input bg-secondary/60 py-2.5 px-3.5 text-sm"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
      />
      <Button
        size="icon"
        className="shrink-0 rounded-full h-9 w-9"
        onClick={handleSend}
        disabled={disabled}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
