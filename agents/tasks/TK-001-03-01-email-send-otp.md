# TK-001-03-01 Email Send-OTP Endpoint

## Metadata

- Task ID: `TK-001-03-01`
- Story ID: `ST-001-03`
- Epic ID: `EP-001`
- Title: Email send-OTP endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Implement the endpoint that sends a one-time password to the user's email
address. This is the first step of the email OTP login flow.

## Scope Of Work

- Add Zod schema for send-OTP request body (`{ email }`)
- Add `emailSendOtp` to `auth/repository.ts` calling `db.auth.signInWithOtp({ email })`
- Add `emailSendOtp` to `auth/service.ts`
- Add controller handler
- Register route (e.g. `POST /auth/otp/email/send`)
- Return 200 acknowledgement (no token or sensitive data in response)
- Map Supabase errors via `mapAuthError`

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Send-OTP accepts valid email and returns 200 acknowledgement |
| `AC-05` | Invalid input (missing/malformed email) returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): send-OTP calls repository with correct email
- **Unit test** (`src/auth/repository.spec.ts`): send-OTP calls Supabase `signInWithOtp({ email })`
- **Integration test** (`test/intg/auth-email-otp.intg.spec.ts`): POST with valid email → 200; POST with invalid email → 400

## Done When

- Send-OTP endpoint returns acknowledgement without leaking tokens.
- Unit and integration tests pass.
