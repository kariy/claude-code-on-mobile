# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bun install

# Start manager backend (serves API + web UI on :8787)
bun run dev:manager

# Start web UI dev server (Vite, proxies API to :8787)
bun run dev:web-ui

# Build web UI (outputs to services/cc-manager/public/)
bun run build:web-ui

# Run all manager tests
bun run test:manager

# Run a single test file
bun test services/cc-manager/src/server.test.ts

# Lint web UI
cd services/cc-manager/web && bunx eslint .

# iOS build/install
bun run ios:build-install
```

## Architecture

This is a Claude session manager: a Bun backend that streams Claude prompts via `@anthropic-ai/claude-agent-sdk`, stores session metadata in SQLite, and serves a React web UI and iOS client.

### Backend (`services/cc-manager/src/`)

`main.ts` exports a `createServer(deps)` factory that accepts `ServerDeps` (config, repository, claudeService, optional indexer) and returns a `ServerHandle`. Production startup is behind an `import.meta.main` guard. This design allows tests to spin up isolated server instances with mocked dependencies.

Key layers:
- **claude-service.ts** — Wraps `@anthropic-ai/claude-agent-sdk` `query()` into a callback-based streaming interface (`onSessionId`, `onDelta`, `onDone`, `onError`). Implements `ClaudeServiceLike` interface for test mocking.
- **repository.ts** — SQLite via `bun:sqlite`. Auto-migrates schema. Tables: `session_metadata`, `session_events`, `session_file_index`.
- **jsonl-indexer.ts** — Scans `~/.claude/projects/` for `.jsonl` session files, indexes them into the DB, provides cursor-paginated history reads.
- **schemas.ts** — Zod discriminated union (`WsClientMessageSchema`) validates all inbound WebSocket messages.
- **config.ts** — All config from env vars prefixed `CC_MANAGER_*`, with sensible defaults.

### Web UI (`services/cc-manager/web/`)

Vite 7 + React 19 + Tailwind 4 + shadcn/ui. Builds to `services/cc-manager/public/` which the backend serves as static files. Uses `useReducer` for state, custom `useWebSocket` hook for real-time streaming. Path alias `@` maps to `./src`.

### API Surface

- **REST**: `GET /health`, `GET /v1/sessions`, `GET /v1/sessions/:id/history`
- **WebSocket** (`/v1/ws`): Client sends `session.create`, `session.resume`, `session.send`, `session.stop`, `ping`. Server responds with `hello`, `session.created`, `session.state`, `stream.delta`, `stream.done`, `error`, `pong`.

### Testing

Tests use `bun:test`. Server tests (`server.test.ts`, `server-ws.test.ts`) use `test-utils.ts` which provides `MockClaudeService`, `createTestServer()` (ephemeral SQLite in temp dir, port 0), and `WsTestClient` (promise-based WebSocket helper with `nextMessage`/`collectUntil`).

## Documentation

The API specification lives at `docs/cc-manager-api.md`. When making changes to HTTP endpoints, WebSocket messages, validation schemas, error codes, or configuration in the backend, update the spec to reflect those changes in the same commit.

## Key Conventions

- Runtime is **Bun** throughout — use `bun:sqlite`, `bun:test`, `Bun.serve`, `Bun.file`.
- Validation at system boundaries uses **Zod v4** (discriminated unions for WS messages).
- Backend TypeScript runs directly via Bun (no separate compile step).
- Session identity is `(session_id, encoded_cwd)` composite key. `encodeCwd` replaces `/` with `-`.
