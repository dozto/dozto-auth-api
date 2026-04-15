# TK-003-02-01 Request Password Reset Endpoint

## Metadata

- Task ID: `TK-003-02-01`
- Story ID: `ST-003-02`
- Epic ID: `EP-003`
- Title: Request password reset endpoint
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: —

## Summary

Implement the endpoint that initiates a password reset by sending a reset
email to the user. This is the first step of the password reset flow.

## Scope Of Work

- Add Zod schema for request-reset body (`{ email }`)
- Add `requestPasswordReset` to `auth/repository.ts` calling `db.auth.resetPasswordForEmail(email, { redirectTo })`
- Add `requestPasswordReset` to `auth/service.ts`
- Add controller handler
- Register route (e.g. `POST /auth/password/reset/request`)
- Return 200 acknowledgement regardless of whether email exists (prevent enumeration)
- Add `AUTH_PASSWORD_RESET_REDIRECT_URL` environment variable for the redirect URL

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Request-reset with valid email returns 200 (no information leak) |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): request-reset calls repository
- **Unit test** (`src/auth/repository.spec.ts`): request-reset calls Supabase `resetPasswordForEmail`
- **Integration test** (`test/intg/auth-password-mgmt.intg.spec.ts`): POST with valid email → 200; POST with non-existent email → still 200 (no enumeration)

## Done When

- Request-reset endpoint sends email via Supabase.
- No account existence leakage.
- Unit and integration tests pass.
