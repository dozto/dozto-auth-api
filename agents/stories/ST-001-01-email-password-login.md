# ST-001-01 Email + Password Sign-up and Sign-in

## Metadata

- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Email + Password Sign-up and Sign-in
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Extend the existing email + password registration and login implementation to
align with the new unified response shape, and ensure the password registration
toggle (`AUTH_PASSWORD_ENABLED`) correctly gates sign-up while leaving sign-in
unaffected.

## Why

Email + password is already partially implemented. This story brings it up to
the final contract: consistent response format, proper toggle behaviour, and
test coverage aligned with the new architecture.

## Scope

- Review and align existing `POST /auth/password/sign-up` and `POST /auth/password/sign-in` with unified session response shape
- Ensure `AUTH_PASSWORD_ENABLED` toggle: when disabled, sign-up returns rejection; sign-in for existing users still works
- Update Zod schemas if needed
- Unit and integration tests

## Acceptance Criteria

- `AC-01` `POST /auth/password/sign-up` with valid email + password creates a user and returns access_token + refresh_token.
- `AC-02` `POST /auth/password/sign-in` with correct credentials returns access_token + refresh_token.
- `AC-03` When `AUTH_PASSWORD_ENABLED` is not `"true"`, sign-up returns 403; sign-in for an existing user still succeeds.
- `AC-04` Invalid input (missing email, short password) returns 400 with structured error.

## Linked Tasks

- `TK-001-01-01` Refactor password schema for multi-identifier support
- `TK-001-01-02` Align email password sign-up with unified session response
- `TK-001-01-03` Align email password sign-in with unified session response
- `TK-001-01-04` Password registration toggle for email sign-up

## Notes

The current code already covers much of this. Focus on response shape alignment
and toggle verification for the registration path.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
