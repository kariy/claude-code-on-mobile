import { log } from "./logger";

export interface TerminalHandle {
	write(data: Buffer | string): void;
	resize(cols: number, rows: number): void;
	close(): void;
}

export interface TerminalOpenParams {
	sshDestination: string;
	remoteCommand: string;
	cols: number;
	rows: number;
	onData: (data: Buffer) => void;
	onExit: (code: number | null) => void;
}

export interface TerminalServiceLike {
	open(params: TerminalOpenParams): TerminalHandle;
}

export class TerminalService implements TerminalServiceLike {
	open(params: TerminalOpenParams): TerminalHandle {
		const { sshDestination, remoteCommand, cols, rows, onData, onExit } = params;

		log.terminal(`spawning ssh -t ${sshDestination} command_len=${remoteCommand.length} cols=${cols} rows=${rows}`);

		const proc = Bun.spawn(["ssh", "-t", sshDestination, remoteCommand], {
			stdin: "pipe",
			stdout: "pipe",
			stderr: "pipe",
		});

		let closed = false;

		// Read stdout
		const readStream = async (stream: ReadableStream<Uint8Array> | null) => {
			if (!stream) return;
			const reader = stream.getReader();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					if (!closed) {
						onData(Buffer.from(value));
					}
				}
			} catch {
				// stream closed
			}
		};

		readStream(proc.stdout as ReadableStream<Uint8Array>);
		readStream(proc.stderr as ReadableStream<Uint8Array>);

		proc.exited.then((code) => {
			log.terminal(`ssh process exited code=${code}`);
			if (!closed) {
				closed = true;
				onExit(code);
			}
		});

		return {
			write(data: Buffer | string) {
				if (closed) return;
				try {
					proc.stdin?.write(data);
				} catch {
					// process already dead
				}
			},
			resize(_cols: number, _rows: number) {
				// Resize requires a real PTY; with stdin: "pipe" we can't resize.
				// This is a best-effort no-op. For real PTY support, Bun.spawn
				// with `terminal` option would be needed (Bun 1.3.5+, POSIX only).
			},
			close() {
				if (closed) return;
				closed = true;
				try {
					proc.kill();
				} catch {
					// already dead
				}
			},
		};
	}
}
