# TK-002-03-01 Get Current User Endpoint

## Metadata

- Task ID: `TK-002-03-01`
- Story ID: `ST-002-03`
- Epic ID: `EP-002`
- Title: Get current user endpoint and response mapping
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-002-01-01`

## Summary

Implement the endpoint that returns the authenticated user's identity
information. This is the first consumer of the auth middleware and validates
the full middleware → controller flow.

## Scope Of Work

- Add user response shape mapping to `auth/helper.ts` (e.g. `mapUserResponse`: id, email, phone, created_at)
- Add controller handler that reads user from auth middleware context
- Register route `GET /auth/me` protected by auth middleware
- Return 200 with user identity JSON
- Ensure no sensitive internal fields are leaked (raw Supabase metadata beyond defined set)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | GET /auth/me with valid token returns user identity (id, email, phone) |
| `AC-02` | GET /auth/me without token returns 401 (via auth middleware) |
| `AC-03` | GET /auth/me with expired token returns 401 (via auth middleware) |
| `AC-04` | Response does not leak sensitive internal fields |

## Test Plan

- **Unit test** (`src/auth/helper.spec.ts`): `mapUserResponse` returns expected fields, excludes sensitive data
- **Unit test** (`src/auth/controller.spec.ts` or inline): controller reads user from context
- **Integration test** (`test/intg/auth-session.intg.spec.ts`): login → GET /auth/me → 200 with user info; no token → 401; expired token → 401
- **E2E test** (`test/e2e/auth-me.e2e.spec.ts`): full flow against running server — login → GET /auth/me → verify user fields match

## Done When

- GET /auth/me returns user identity for authenticated requests.
- 401 for unauthenticated/expired requests.
- No sensitive data leakage.
- Unit, integration, and E2E tests pass.
