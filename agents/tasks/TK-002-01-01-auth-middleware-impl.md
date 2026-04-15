# TK-002-01-01 Auth Middleware Implementation

## Metadata

- Task ID: `TK-002-01-01`
- Story ID: `ST-002-01`
- Epic ID: `EP-002`
- Title: Auth middleware implementation and typed context
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: —

## Summary

Create the reusable Hono authentication middleware that extracts the Bearer
token from the `Authorization` header, verifies it via Supabase `getUser`,
and injects the authenticated user into a typed Hono context.

## Scope Of Work

- Create `src/auth/middleware.ts` (or appropriate location)
- Extract `Authorization: Bearer <token>` from request headers
- Call `getSupabase().auth.getUser(token)` to validate
- Define typed Hono context variable for authenticated user
- On success: set user on context, call `next()`
- Export as composable middleware function

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Valid token passes through; user available on context |
| `AC-04` | Middleware is reusable across any route group |

## Test Plan

- **Unit test** (`src/auth/middleware.spec.ts`): with valid token mock → next() called, user on context; middleware is a function exportable to any router
- **Integration test** (`test/intg/auth-middleware.intg.spec.ts`): create a test route protected by middleware → request with valid token → 200; apply to different route group → works

## Done When

- Middleware extracts token, verifies, and injects user.
- Typed context is exported for downstream use.
- Unit and integration tests pass.
