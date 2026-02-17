export function nowMs(): number {
	return Date.now();
}

export function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1)}…`;
}

export function encodeCwd(cwd: string): string {
	return cwd.replace(/\//g, "-");
}

// Claude encodes cwd by replacing `/` with `-`.
// This is not perfectly reversible when the path contains `-`, but it is
// still useful for deriving a likely path for externally-created sessions.
export function decodeEncodedCwd(encodedCwd: string): string {
	if (!encodedCwd.startsWith("-")) return encodedCwd;
	return encodedCwd.replace(/-/g, "/");
}

export function shellEscape(s: string): string {
	return "'" + s.replace(/'/g, "'\\''") + "'";
}

export function extractTextBlocks(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";

	return content
		.filter((entry) => typeof entry === "object" && entry !== null)
		.map((entry) => {
			const block = entry as { type?: string; text?: string };
			if (block.type === "text" && typeof block.text === "string") {
				return block.text;
			}
			return "";
		})
		.join("");
}
