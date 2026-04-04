# TK-004-01-03 Google OAuth Callback Endpoint

## Metadata

- Task ID: `TK-004-01-03`
- Story ID: `ST-004-01`
- Epic ID: `EP-004`
- Title: Google OAuth callback endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-004-01-02`

## Summary

Implement the callback endpoint that handles the return from Google OAuth
authorization, exchanges the code for a session, and returns tokens to the
client.

## Scope Of Work

- Add callback handler: Supabase handles code exchange automatically when the redirect URL points back to the Supabase auth endpoint; determine if this service needs to handle the callback directly or proxy
- If direct: parse authorization code from query params, exchange via Supabase `auth.exchangeCodeForSession(code)`
- Return unified session response with access_token + refresh_token
- Handle error cases: user cancellation, OAuth error
- Register route (e.g. `GET /auth/oauth/google/callback`)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | After Google auth, callback returns access_token + refresh_token |
| `AC-03` | First-time login creates new user |
| `AC-04` | Repeat login returns session for same user |
| `AC-05` | OAuth error or cancellation returns structured error |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): callback processes code and returns session
- **Unit test** (`src/auth/repository.spec.ts`): callback calls Supabase code exchange
- **Integration test** (`test/intg/auth-oauth.intg.spec.ts`): callback with valid code → 200 with session; callback with invalid code → error response
- **E2E test** (`test/e2e/google-oauth.e2e.spec.ts`): full OAuth flow (may require mock OAuth server or manual verification)

## Done When

- Callback exchanges code for session.
- New and returning users handled correctly.
- Error cases return structured responses.
- Unit, integration, and E2E tests pass.
