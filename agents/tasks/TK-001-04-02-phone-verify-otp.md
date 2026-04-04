# TK-001-04-02 Phone Verify-OTP Endpoint

## Metadata

- Task ID: `TK-001-04-02`
- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone verify-OTP endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-04-01`

## Summary

Implement the endpoint that verifies the SMS OTP code and returns a session
on success. This is the second step of the phone OTP login flow.

## Scope Of Work

- Add Zod schema for phone verify-OTP request body (`{ phone, token }`)
- Add `phoneVerifyOtp` to `auth/repository.ts` calling `db.auth.verifyOtp({ phone, token, type: 'sms' })`
- Add `phoneVerifyOtp` to `auth/service.ts` with `mapSessionResponse`
- Add controller handler
- Register route (e.g. `POST /auth/otp/phone/verify`)
- Return unified session response (200)
- First-time verify auto-creates user

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Verify-OTP with correct code returns access_token + refresh_token |
| `AC-03` | Wrong or expired code returns 401 |
| `AC-04` | First-time phone OTP login creates new user |
| `AC-05` | Invalid input returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): verify-OTP calls repository and returns mapped session
- **Unit test** (`src/auth/repository.spec.ts`): verify-OTP calls Supabase `verifyOtp` with correct params
- **Integration test** (`test/intg/auth-phone-otp.intg.spec.ts`): send OTP → verify with correct code → 200 with session; verify with wrong code → 401

## Done When

- Phone verify-OTP endpoint returns session on success, 401 on failure.
- First-time login creates user.
- Unit and integration tests pass.
