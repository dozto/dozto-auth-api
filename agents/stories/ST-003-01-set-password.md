# ST-003-01 Set Password (Authenticated)

## Metadata

- Story ID: `ST-003-01`
- Epic ID: `EP-003`
- Title: Set Password (Authenticated)
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15

## Summary

Allow an authenticated user who does not yet have a password to create one.
After setting, the user can log in via their identifier (email / phone) +
password.

## Why

Users who first logged in via OTP or OAuth have no password. This endpoint
enables a smooth transition to password-based login without requiring a
"reset" flow.

## Scope

- Protected endpoint (requires auth middleware from ST-002-01)
- Accept new password in request body; call Supabase `auth.updateUser({ password })`
- Validate password meets minimum requirements (Zod schema)
- Return success confirmation (not a new session — user is already logged in)
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Authenticated user without a password can set one and receive success response.
- `AC-02` After setting, user can log in with identifier + new password.
- `AC-03` Request without valid access token returns 401.
- `AC-04` Password that fails validation (too short, etc.) returns 400.

## Linked Tasks

- `TK-003-01-01` Set password protected endpoint

## Notes

Supabase `updateUser` also works for users who already have a password (it
changes it). In this story, the target scenario is users without a password.
The "change password" use case (know old password, set new) is deferred.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
