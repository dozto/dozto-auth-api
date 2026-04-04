# ST-002-01 Auth Middleware

## Metadata

- Story ID: `ST-002-01`
- Epic ID: `EP-002`
- Title: Auth Middleware
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Create a reusable Hono middleware that extracts the Bearer token from the
`Authorization` header, verifies it via Supabase `getUser`, and injects the
authenticated user into the request context. This middleware is the
prerequisite for all protected endpoints in the system.

## Why

Multiple endpoints need to know the identity of the caller (get current user,
set password, token verification). A shared middleware avoids duplicating token
extraction and verification logic.

## Scope

- Extract `Authorization: Bearer <token>` from request headers
- Call Supabase `auth.getUser(token)` to validate and retrieve user
- On success: attach user object to Hono context (typed)
- On failure: return 401 with structured error (missing token, invalid token, expired token)
- Export as composable Hono middleware for use in any route
- Unit tests with mocked Supabase client

## Acceptance Criteria

- `AC-01` Request with valid access token passes through middleware; user is available on context.
- `AC-02` Request without `Authorization` header returns 401.
- `AC-03` Request with invalid or expired token returns 401 with appropriate error code.
- `AC-04` Middleware is reusable — can be applied to any route group.

## Linked Tasks

- `TK-002-01-01` Auth middleware implementation and typed context
- `TK-002-01-02` Auth middleware error handling

## Notes

Consider placing the middleware in `src/auth/middleware.ts` or a shared
location. The exact placement should align with `ARCHITECTURE.md` conventions.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
