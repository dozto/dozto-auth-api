# ST-001-03 Email + OTP Login

## Metadata

- Story ID: `ST-001-03`
- Epic ID: `EP-001`
- Title: Email + OTP Login
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement passwordless email login via one-time password (OTP). The flow is
two-step: send a verification code to the email address, then verify the code
to complete login.

## Why

Email OTP provides a passwordless entry point. Users who start with OTP can
later set a password (EP-003) to unlock password-based login.

## Scope

- Send OTP: call Supabase `signInWithOtp({ email })`, return success acknowledgement
- Verify OTP: call Supabase `verifyOtp({ email, token, type })`, return access_token + refresh_token
- New Zod schemas for send-OTP and verify-OTP request bodies
- New routes under `/auth/otp/email/...` (exact paths decided in implementation)
- First-time OTP login auto-creates the user account (Supabase default behaviour)
- Unified session response shape on successful verification
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Send-OTP endpoint accepts a valid email and returns 200 acknowledgement (no token leaked).
- `AC-02` Verify-OTP endpoint with correct code returns access_token + refresh_token.
- `AC-03` Verify-OTP with wrong or expired code returns 401 with structured error.
- `AC-04` First-time email OTP login creates a new user in Supabase Auth.
- `AC-05` Invalid input (missing email, malformed email) returns 400.

## Linked Tasks

- `TK-001-03-01` Email send-OTP endpoint
- `TK-001-03-02` Email verify-OTP endpoint

## Notes

OTP delivery (email provider) is configured on the Supabase side. This service
only calls the Supabase API and does not manage email sending directly.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
