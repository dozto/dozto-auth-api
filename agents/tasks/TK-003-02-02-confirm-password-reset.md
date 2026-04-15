# TK-003-02-02 Confirm Password Reset Endpoint

## Metadata

- Task ID: `TK-003-02-02`
- Story ID: `ST-003-02`
- Epic ID: `EP-003`
- Title: Confirm password reset endpoint
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: `TK-003-02-01`

## Summary

Implement the endpoint that confirms a password reset by accepting the reset
token/code and a new password. This is the second step of the password reset
flow.

## Scope Of Work

- Add Zod schema for confirm-reset body (`{ token, password }` or similar, depending on Supabase reset flow)
- Determine flow: Supabase reset emails typically redirect with a token that creates a session; the endpoint then uses `auth.updateUser({ password })` with that session
- Add `confirmPasswordReset` to `auth/repository.ts`
- Add `confirmPasswordReset` to `auth/service.ts`
- Add controller handler
- Register route (e.g. `POST /auth/password/reset/confirm`)
- Return 200 success acknowledgement

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Valid token + new password resets password and returns success |
| `AC-03` | Invalid or expired token returns 401 |
| `AC-04` | Password failing validation returns 400 |
| `AC-05` | After reset, user can log in with new password |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): confirm-reset calls repository with correct params
- **Unit test** (`src/auth/repository.spec.ts`): confirm-reset calls Supabase appropriately
- **Integration test** (`test/intg/auth-password-mgmt.intg.spec.ts`): request reset → confirm with token → 200; confirm with expired token → 401; confirm with short password → 400
- **E2E test** (`test/e2e/password-reset.e2e.spec.ts`): full flow — register with password → request reset → confirm → login with new password

## Done When

- Confirm-reset endpoint changes password.
- Invalid tokens return 401.
- User can log in with new password after reset.
- Unit, integration, and E2E tests pass.
