# ST-001-04 Phone + OTP Login

## Metadata

- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone + OTP Login
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement phone number + SMS OTP login. The flow mirrors email OTP: send a
verification code via SMS, then verify the code to complete login.

## Why

Phone OTP is a widely used login method, especially in mobile-first markets.
Combined with phone + password (ST-001-02), it completes the phone-based
authentication column in the login matrix.

## Scope

- Send OTP: call Supabase `signInWithOtp({ phone })`, return success acknowledgement
- Verify OTP: call Supabase `verifyOtp({ phone, token, type })`, return access_token + refresh_token
- New Zod schemas for phone send-OTP and verify-OTP request bodies
- New routes under `/auth/otp/phone/...` (exact paths decided in implementation)
- First-time phone OTP login auto-creates the user account
- Unified session response shape
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Send-OTP endpoint accepts a valid phone number and returns 200 acknowledgement.
- `AC-02` Verify-OTP endpoint with correct code returns access_token + refresh_token.
- `AC-03` Verify-OTP with wrong or expired code returns 401 with structured error.
- `AC-04` First-time phone OTP login creates a new user in Supabase Auth.
- `AC-05` Invalid input (missing phone, malformed number) returns 400.

## Linked Tasks

- `TK-001-04-01` Phone send-OTP endpoint
- `TK-001-04-02` Phone verify-OTP endpoint

## Notes

SMS delivery requires a phone provider to be configured in Supabase project
settings (e.g. Twilio, Vonage). Integration tests may need to mock or use
Supabase test phone numbers.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
