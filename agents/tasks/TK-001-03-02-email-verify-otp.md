# TK-001-03-02 Email Verify-OTP Endpoint

## Metadata

- Task ID: `TK-001-03-02`
- Story ID: `ST-001-03`
- Epic ID: `EP-001`
- Title: Email verify-OTP endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-03-01`

## Summary

Implement the endpoint that verifies the OTP code sent to the user's email
and returns a session on success. This is the second step of the email OTP
login flow.

## Scope Of Work

- Add Zod schema for verify-OTP request body (`{ email, token }`)
- Add `emailVerifyOtp` to `auth/repository.ts` calling `db.auth.verifyOtp({ email, token, type: 'email' })`
- Add `emailVerifyOtp` to `auth/service.ts` with `mapSessionResponse`
- Add controller handler
- Register route (e.g. `POST /auth/otp/email/verify`)
- Return unified session response (200) with access_token + refresh_token
- First-time verify auto-creates user (Supabase default behaviour)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Verify-OTP with correct code returns access_token + refresh_token |
| `AC-03` | Wrong or expired code returns 401 |
| `AC-04` | First-time OTP login creates new user |
| `AC-05` | Invalid input returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): verify-OTP calls repository and returns mapped session
- **Unit test** (`src/auth/repository.spec.ts`): verify-OTP calls Supabase `verifyOtp` with correct params
- **Unit test** (`src/auth/helper.spec.ts`): Supabase auth error mapped to 401 for invalid OTP
- **Integration test** (`test/intg/auth-email-otp.intg.spec.ts`): send OTP → verify with correct code → 200 with session; verify with wrong code → 401

## Done When

- Verify-OTP endpoint returns session on success, 401 on failure.
- First-time login creates user.
- Unit and integration tests pass.
