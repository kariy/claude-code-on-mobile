import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSshDestination } from "@/lib/settings";

interface SshDestinationDialogProps {
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function SshDestinationDialog({ onSave, onCancel }: SshDestinationDialogProps) {
  const [value, setValue] = useState(getSshDestination() ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-sm mx-4">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>SSH Destination</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the SSH destination for terminal connections.
            </p>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="user@host"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!value.trim()}>
              Save
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
