# TK-001-04-01 Phone Send-OTP Endpoint

## Metadata

- Task ID: `TK-001-04-01`
- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone send-OTP endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Implement the endpoint that sends a one-time password via SMS to the user's
phone number. This is the first step of the phone OTP login flow.

## Scope Of Work

- Add Zod schema for phone send-OTP request body (`{ phone }`)
- Add `phoneSendOtp` to `auth/repository.ts` calling `db.auth.signInWithOtp({ phone })`
- Add `phoneSendOtp` to `auth/service.ts`
- Add controller handler
- Register route (e.g. `POST /auth/otp/phone/send`)
- Return 200 acknowledgement
- Map Supabase errors via `mapAuthError`

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Send-OTP accepts valid phone and returns 200 acknowledgement |
| `AC-05` | Invalid input (missing/malformed phone) returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): send-OTP calls repository with correct phone
- **Unit test** (`src/auth/repository.spec.ts`): send-OTP calls Supabase `signInWithOtp({ phone })`
- **Integration test** (`test/intg/auth-phone-otp.intg.spec.ts`): POST with valid phone → 200; POST with invalid phone → 400

## Done When

- Phone send-OTP endpoint returns acknowledgement.
- Unit and integration tests pass.
