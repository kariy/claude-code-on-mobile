import { Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SessionCard } from "@/components/sessions/SessionCard";
import { EmptyState } from "@/components/sessions/EmptyState";
import type { SessionListItem } from "@/types/api";

interface SessionsViewProps {
  sessions: SessionListItem[];
  onRefresh: () => void;
  onOpenSession: (index: number) => void;
  onNewSession: () => void;
  onOpenTerminal?: (index: number) => void;
}

export function SessionsView({
  sessions,
  onRefresh,
  onOpenSession,
  onNewSession,
  onOpenTerminal,
}: SessionsViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center px-4 py-4 gap-2.5 shrink-0">
        <h2 className="flex-1 text-xl font-semibold">Sessions</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onRefresh}
          title="Refresh"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4 pb-24">
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          sessions.map((session, i) => (
            <SessionCard
              key={session.session_id + session.encoded_cwd}
              session={session}
              onClick={() => onOpenSession(i)}
              onOpenTerminal={onOpenTerminal ? () => onOpenTerminal(i) : undefined}
            />
          ))
        )}
      </ScrollArea>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10"
        onClick={onNewSession}
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
