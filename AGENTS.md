# AGENTS

Primary guidance for agents working in this repository.

## Scope

- Standardize build/lint/test usage.
- Define import, formatting, typing, naming, error-handling, and test conventions.

## Project source of truth

- Always follow the rules in `agents/RULES.md`.
- Project requirements, architecture, roadmap, epic/story/task planning, and agent workflow definitions must follow the files under `agents/`.
- Use `agents/AGENTS.md` as the entry point for project-specific agent behavior.
- Use `agents/REQUIREMENTS.md`, `agents/ARCHITECTURE.md`, and `agents/ROADMAP.md` as the source of truth for project definition and execution state.
- Do not duplicate or redefine project scope, module boundaries, or planning status here unless a repository-level convention depends on them directly.

## Required stack

- Bun runtime and CLI.
- TypeScript with current strict config.
- Biome for formatting/linting.
- `bun:test` for unit, integration, and E2E tests.

## Core commands

```bash
bun install
bun run dev
bun run build
bun run start
bun run lint
bun run format
bun run test:unit
bun run test:intg
bun run test:e2e
bun run test
```

From `package.json`, `test:unit` runs `bun test src` (discovers `*.spec.ts` next to source), `test:intg` runs `bun test test/intg`, `test:e2e` runs `bun test test/e2e`.

## Running a single test

```bash
bun test src/sanity.spec.ts
bun test -t "skeleton"
bun test src
bun test --coverage src/sanity.spec.ts
bun test --timeout 12000 test/intg/app.intg.spec.ts
bun test test/e2e/smoke.e2e.spec.ts
```

## Repo layout

- For project structure, domain boundaries, and test directory conventions, refer to `agents/ARCHITECTURE.md`.
- Keep this file focused on repository-wide coding and execution conventions.

## Imports and formatting

- Use ESM syntax only.
- Order imports by: external, internal, then type-only.
- Prefer named imports and explicit `import type` where applicable.
- Avoid wildcard namespace imports unless readability requires it.
- Keep one logical item per import statement.
- Use Biome style for spacing, quotes, and semicolons.
- Keep files cleanly formatted with newline at EOF.

Example:

```ts
import { z } from "zod"
import { validateInput } from "../lib/validate"
import type { CreateUserInput } from "./types"
```

## Types and naming

- Do not relax strict settings; treat `any` as exceptional.
- Prefer explicit return types for exported functions.
- Prefer domain interfaces/types over inline object literals.
- Use immutable patterns (`readonly`, non-mutating helpers) by default.

Naming:

- Types/classes/interfaces: `PascalCase` (`AuthService`, `SessionConfig`).
- Variables/functions: `camelCase` (`createUser`, `validateSession`).
- Constants: `UPPER_SNAKE_CASE` for environment/config constants.
- File names: noun for entities (`user.ts`, `token.ts`), verb for operations (`validate-session.ts`, `create-token.ts`).

## Error handling

- Validate inputs before side effects.
- Use `try/catch` for async boundaries with external I/O.
- Do not suppress exceptions with empty catches.
- Re-throw with context where useful.

```ts
try {
  // business logic
} catch (error) {
  throw new Error("Failed to persist session", { cause: error as Error })
}
```

- Keep error responses stable and user-safe.
- Fail fast at startup for missing required config.

## API and persistence boundaries

- Validate request payloads with `zod` at the edge.
- Separate transport DTOs from persistence/entities if fields differ.
- Keep client/adapter initialization in dedicated bootstrap modules.
- Prefer existing dependencies (`hono`, `zod`, `drizzle-orm`, Supabase client libraries as needed) over adding new packages.

## Tests

- Use `import { describe, expect, it } from "bun:test"`.
- Keep tests deterministic and independent.
- Include at least one success and one failure path.
- Keep fixtures local to the test file/module.

## Security and reliability

- Do not use dotenv manually; use Bun environment loading.
- Never log secrets, auth tokens, or passwords.
- Avoid returning internal stack traces or raw exceptions to clients.
- Add explicit timeouts/retry limits for outbound calls.

## Practical agent workflow

- Start with `agents/AGENTS.md`, then read the relevant requirement / architecture / roadmap / story / task documents before making project-specific decisions.
- Apply repository conventions here after the project context in `agents/` is clear.
- Keep PRs/review comments to behavior, conventions, and test coverage.
- If a change has no tests, add the smallest useful unit/integration test.
- Prefer explicit imports and stable error shapes over broad refactors.
- Keep PR scope narrow and document any contract changes in story/task notes.

## Cursor / Copilot rules in this repo

- `.cursor/rules/`: not present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.

If any of these appear later, add them and let them take precedence.

## Agent validation checklist

1. `bun run lint`
2. `bun run test:unit` or one `bun test ...`
3. `bun run test:intg` for flow/IO changes; `bun run test:e2e` when E2E coverage matters
4. `bun run build`
5. Update impacted files under `agents/` when workflow state changes, following the source-of-truth rules defined there.
