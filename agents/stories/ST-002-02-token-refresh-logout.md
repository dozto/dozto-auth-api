# ST-002-02 Token Refresh and Logout

## Metadata

- Story ID: `ST-002-02`
- Epic ID: `EP-002`
- Title: Token Refresh and Logout
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15

## Summary

Implement token refresh and logout endpoints. Token refresh allows clients to
obtain a new access token using their refresh token. Logout revokes the current
session.

## Why

These two operations complete the session lifecycle after login. Without them,
clients cannot extend sessions or cleanly terminate them.

## Scope

- Token refresh endpoint: accept refresh_token in request body, call Supabase `auth.refreshSession({ refresh_token })`, return new access_token + refresh_token
- Logout endpoint: accept access token (via header or body), call Supabase `auth.signOut`, return success acknowledgement
- Logout scope: current session only (not all devices)
- Zod schemas for request bodies
- Routes under `/auth/...` (exact paths decided in implementation)
- Unified session response shape for refresh
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Refresh endpoint with valid refresh_token returns new access_token + refresh_token.
- `AC-02` Refresh endpoint with invalid or expired refresh_token returns 401.
- `AC-03` Logout endpoint revokes the current session and returns success.
- `AC-04` After logout, the **refresh token** can no longer be used to refresh the session (401). Note: access token JWT may remain valid until expiry.

## Linked Tasks

- `TK-002-02-01` Token refresh endpoint
- `TK-002-02-02` Logout endpoint

## Notes

Token refresh does not require the auth middleware (it uses the refresh token
directly, not the access token). Logout may use either approach — decide during
implementation.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
