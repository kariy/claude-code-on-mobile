import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TerminalStatus } from "@/hooks/use-terminal";
import "@xterm/xterm/css/xterm.css";

interface TerminalViewProps {
  status: TerminalStatus;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function TerminalView({ status, containerRef, onClose }: TerminalViewProps) {
  const statusLabel =
    status === "connecting"
      ? "Connecting..."
      : status === "connected"
        ? "Connected"
        : "Closed";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center px-4 py-2 gap-2.5 shrink-0 border-b border-border">
        <div
          className={`h-2 w-2 rounded-full shrink-0 ${
            status === "connected"
              ? "bg-green-500"
              : status === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-muted-foreground/50"
          }`}
        />
        <span className="text-xs text-muted-foreground flex-1">
          {statusLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={onClose}
          title="Close terminal"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 bg-[#09090b] p-1" />
    </div>
  );
}
