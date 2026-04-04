# TK-001-02-03 Password Registration Toggle for Phone Sign-up

## Metadata

- Task ID: `TK-001-02-03`
- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Password registration toggle for phone sign-up
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-02-01`

## Summary

Ensure the `AUTH_PASSWORD_ENABLED` toggle gates phone password sign-up the
same way it gates email sign-up. When disabled, phone sign-up returns 403;
phone sign-in for existing users remains unaffected.

## Scope Of Work

- Verify `assertPasswordEnabled` is called in `phonePasswordSignUp` service
- Verify `phonePasswordSignIn` does NOT call `assertPasswordEnabled`
- Confirm error code `AUTH_PASSWORD_DISABLED` and 403 status

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-03` | When toggle off: phone sign-up → 403; existing user phone sign-in → success |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): phone sign-up with toggle off throws 403
- **Integration test** (`test/intg/auth-phone-password.intg.spec.ts`): toggle off → phone sign-up 403; phone sign-in for existing user → 200

## Done When

- Toggle correctly gates phone sign-up only.
- Phone sign-in unaffected by toggle state.
- Unit and integration tests pass.
