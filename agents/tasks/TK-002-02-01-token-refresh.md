# TK-002-02-01 Token Refresh Endpoint

## Metadata

- Task ID: `TK-002-02-01`
- Story ID: `ST-002-02`
- Epic ID: `EP-002`
- Title: Token refresh endpoint
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: —

## Summary

Implement the token refresh endpoint that accepts a refresh token and returns
a new access token + refresh token pair.

## Scope Of Work

- Add Zod schema for refresh request body (`{ refreshToken }`)
- Add `refreshSession` to `auth/repository.ts` calling `db.auth.refreshSession({ refresh_token })`
- Add `refreshSession` to `auth/service.ts` with `mapSessionResponse`
- Add controller handler
- Register route (e.g. `POST /auth/token/refresh`)
- Return unified session response (200) with new tokens

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Valid refresh_token returns new access_token + refresh_token |
| `AC-02` | Invalid or expired refresh_token returns 401 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): refresh calls repository and returns mapped session
- **Unit test** (`src/auth/repository.spec.ts`): refresh calls Supabase `refreshSession` with correct param
- **Integration test** (`test/intg/auth-session.intg.spec.ts`): login → use refresh_token → get new tokens (200); use invalid refresh_token → 401

## Done When

- Refresh endpoint returns new token pair.
- Invalid/expired refresh token returns 401.
- Unit and integration tests pass.
