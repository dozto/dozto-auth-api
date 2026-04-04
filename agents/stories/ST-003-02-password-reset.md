# ST-003-02 Password Reset (Email-based)

## Metadata

- Story ID: `ST-003-02`
- Epic ID: `EP-003`
- Title: Password Reset (Email-based)
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement the password reset flow: user requests a reset via email, receives a
link or code, then sets a new password through this service.

## Why

Users who forget their password need a self-service recovery path. This is a
standard complement to password-based login.

## Scope

- Request reset endpoint: accept email, call Supabase `auth.resetPasswordForEmail`, return acknowledgement
- Confirm reset endpoint: accept reset token/code + new password, call Supabase `auth.updateUser({ password })`, return success
- Password reset only supports email channel (consistent with Supabase Auth behaviour)
- Zod schemas for both request bodies
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Request-reset endpoint with valid email returns 200 acknowledgement (no information leak about account existence).
- `AC-02` Confirm-reset endpoint with valid token + new password resets the password and returns success.
- `AC-03` Confirm-reset with invalid or expired token returns 401.
- `AC-04` New password that fails validation returns 400.
- `AC-05` After reset, user can log in with email + new password.

## Linked Tasks

- `TK-003-02-01` Request password reset endpoint
- `TK-003-02-02` Confirm password reset endpoint

## Notes

The reset email is sent by Supabase. This service handles the API endpoints
that trigger and confirm the flow. The redirect URL for the reset link may need
configuration via environment variable.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
