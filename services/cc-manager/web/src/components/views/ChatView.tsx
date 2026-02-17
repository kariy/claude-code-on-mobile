import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatMessage } from "@/types/chat";

interface Turn {
  userMessage: ChatMessage | null;
  assistantMessages: ChatMessage[];
}

function groupIntoTurns(messages: ChatMessage[]): Turn[] {
  const turns: Turn[] = [];
  let current: Turn | null = null;

  for (const msg of messages) {
    if (msg.role === "user") {
      current = { userMessage: msg, assistantMessages: [] };
      turns.push(current);
    } else {
      if (!current) {
        current = { userMessage: null, assistantMessages: [] };
        turns.push(current);
      }
      current.assistantMessages.push(msg);
    }
  }

  return turns;
}

interface ChatViewProps {
  messages: ChatMessage[];
  activeRequestIds: Set<string>;
  onSend: (text: string) => void;
}

export function ChatView({
  messages,
  activeRequestIds,
  onSend,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  const isStreaming = activeRequestIds.size > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4 flex flex-col gap-2.5"
      >
        <div className="flex flex-col gap-2.5">
          {groupIntoTurns(messages).map((turn, i) => {
            const mergedBlocks = turn.assistantMessages.flatMap(
              (m) => m.contentBlocks
            );
            const isActive = turn.assistantMessages.some(
              (m) => m.requestId !== null && activeRequestIds.has(m.requestId)
            );
            const showTyping = mergedBlocks.length === 0 && isActive;

            return (
              <div key={i} className="flex flex-col gap-2.5">
                {turn.userMessage &&
                  turn.userMessage.contentBlocks.length > 0 && (
                    <MessageBubble
                      role="user"
                      contentBlocks={turn.userMessage.contentBlocks}
                      isStreaming={false}
                    />
                  )}
                {showTyping ? (
                  <TypingIndicator />
                ) : mergedBlocks.length > 0 ? (
                  <MessageBubble
                    role="assistant"
                    contentBlocks={mergedBlocks}
                    isStreaming={isActive}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  );
}
