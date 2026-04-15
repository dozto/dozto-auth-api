# TK-002-02-02 Logout Endpoint

## Metadata

- Task ID: `TK-002-02-02`
- Story ID: `ST-002-02`
- Epic ID: `EP-002`
- Title: Logout endpoint
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: `TK-002-01-01`

## Summary

Implement the logout endpoint that revokes the current session. Only the
current session is affected (no all-device logout).

## Scope Of Work

- Add `signOut` to `auth/repository.ts` calling `db.auth.signOut()` (or `admin.signOut(token)` depending on approach)
- Add `signOut` to `auth/service.ts`
- Add controller handler
- Register route (e.g. `POST /auth/logout`)
- Decide on auth approach: use access token from header (via auth middleware) or from body
- Return 200 success acknowledgement

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-03` | Logout revokes current session and returns success |
| `AC-04` | After logout, refresh token can no longer refresh session (access token JWT may remain valid until expiry) |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): signOut calls repository
- **Unit test** (`src/auth/repository.spec.ts`): signOut calls Supabase `signOut`
- **Integration test** (`test/intg/auth-session.intg.spec.ts`): login → logout → 200; then use old access_token on protected endpoint → 401

## Done When

- Logout endpoint revokes session.
- Old tokens are invalidated.
- Unit and integration tests pass.
