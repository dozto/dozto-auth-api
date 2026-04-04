# TK-001-01-02 Align Email Password Sign-up with Unified Session Response

## Metadata

- Task ID: `TK-001-01-02`
- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Align email password sign-up with unified session response
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-01-01`

## Summary

Review and update the email password sign-up flow to ensure the response shape
matches the unified session format defined in `ARCHITECTURE.md`. Verify
`mapSessionResponse` in `auth/helper.ts` produces the agreed-upon fields.

## Scope Of Work

- Review `repository.passwordSignUp` → `service.passwordSignUp` → `controller.passwordSignUp` chain
- Confirm `mapSessionResponse` output includes: `session.accessToken`, `session.refreshToken`, `session.expiresIn`, `session.expiresAt`, `session.tokenType`, `user.id`, `user.email`
- Adjust response mapping if current shape diverges from target
- Ensure 201 status code for successful registration

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Sign-up creates user and returns access_token + refresh_token in unified shape |

## Test Plan

- **Unit test** (`src/auth/helper.spec.ts`): verify `mapSessionResponse` output shape
- **Unit test** (`src/auth/service.spec.ts`): verify sign-up flow returns mapped response
- **Integration test** (`test/intg/auth-email-password.intg.spec.ts`): POST sign-up with valid email + password → 201 with expected JSON shape

## Done When

- Sign-up response matches unified session format.
- Unit and integration tests pass.
