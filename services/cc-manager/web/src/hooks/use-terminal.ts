import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";

export type TerminalStatus = "idle" | "connecting" | "connected" | "closed";

export function useTerminal() {
  const [status, setStatus] = useState<TerminalStatus>("idle");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const cleanup = useCallback(() => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    termRef.current?.dispose();
    termRef.current = null;
    fitRef.current = null;
  }, []);

  const open = useCallback(
    (sessionId: string, encodedCwd: string, sshDestination: string) => {
      cleanup();
      setStatus("connecting");

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
        theme: {
          background: "#09090b",
          foreground: "#fafafa",
          cursor: "#fafafa",
          selectionBackground: "#27272a",
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      termRef.current = term;
      fitRef.current = fitAddon;

      if (containerRef.current) {
        term.open(containerRef.current);
        fitAddon.fit();
      }

      const cols = term.cols;
      const rows = term.rows;

      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const params = new URLSearchParams({
        session_id: sessionId,
        encoded_cwd: encodedCwd,
        ssh_destination: sshDestination,
        cols: String(cols),
        rows: String(rows),
      });
      const ws = new WebSocket(`${proto}//${location.host}/v1/terminal?${params}`);
      wsRef.current = ws;

      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setStatus("connected");
      };

      ws.onmessage = (evt) => {
        if (typeof evt.data === "string") {
          term.write(evt.data);
        } else if (evt.data instanceof ArrayBuffer) {
          term.write(new Uint8Array(evt.data));
        }
      };

      ws.onclose = () => {
        setStatus("closed");
        term.write("\r\n\x1b[90m[Terminal closed]\x1b[0m\r\n");
      };

      ws.onerror = () => {
        // onclose fires after this
      };

      // Forward keystrokes to the server
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      // Handle binary data from terminal
      term.onBinary((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          const buf = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) {
            buf[i] = data.charCodeAt(i) & 0xff;
          }
          ws.send(buf);
        }
      });

      // Resize handling
      const sendResize = () => {
        if (!fitRef.current || !termRef.current) return;
        fitRef.current.fit();
        const newCols = termRef.current.cols;
        const newRows = termRef.current.rows;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "resize", cols: newCols, rows: newRows }));
        }
      };

      if (containerRef.current) {
        const observer = new ResizeObserver(() => {
          sendResize();
        });
        observer.observe(containerRef.current);
        resizeObserverRef.current = observer;
      }
    },
    [cleanup],
  );

  const close = useCallback(() => {
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { status, open, close, containerRef };
}
