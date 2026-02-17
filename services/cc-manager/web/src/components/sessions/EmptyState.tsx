export function EmptyState() {
  return (
    <div className="text-center py-16 px-5">
      <h3 className="text-base font-medium text-foreground/70 mb-1">
        No sessions yet
      </h3>
      <p className="text-xs text-muted-foreground">
        Tap + to create a new Claude Code session.
      </p>
    </div>
  );
}
