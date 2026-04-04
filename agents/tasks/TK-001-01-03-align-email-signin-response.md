# TK-001-01-03 Align Email Password Sign-in with Unified Session Response

## Metadata

- Task ID: `TK-001-01-03`
- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Align email password sign-in with unified session response
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-01-01`

## Summary

Review and update the email password sign-in flow to ensure the response shape
matches the unified session format. Verify error mapping for incorrect
credentials returns structured 401 responses.

## Scope Of Work

- Review `repository.passwordSignIn` → `service.passwordSignIn` → `controller.passwordSignIn` chain
- Confirm response uses the same unified session shape as sign-up
- Verify `mapAuthError` correctly maps Supabase auth errors to AppError (401 for bad credentials)
- Ensure 200 status code for successful login

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Sign-in with correct credentials returns access_token + refresh_token |
| `AC-04` | Invalid input returns 400; wrong credentials return 401 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): verify sign-in flow returns mapped response
- **Unit test** (`src/auth/helper.spec.ts`): verify `mapAuthError` produces correct error codes
- **Integration test** (`test/intg/auth-email-password.intg.spec.ts`): POST sign-in with valid credentials → 200; POST with wrong password → 401

## Done When

- Sign-in response matches unified session format.
- Error responses are structured and correct.
- Unit and integration tests pass.
