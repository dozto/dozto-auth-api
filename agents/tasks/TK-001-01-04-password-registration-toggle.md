# TK-001-01-04 Password Registration Toggle for Email Sign-up

## Metadata

- Task ID: `TK-001-01-04`
- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Password registration toggle for email sign-up
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-01-02`

## Summary

Verify and harden the `AUTH_PASSWORD_ENABLED` environment variable toggle.
When disabled, email password sign-up must return 403. Email password sign-in
for existing users must remain unaffected.

## Scope Of Work

- Review `assertPasswordEnabled` in `auth/helper.ts`
- Ensure toggle check is applied only to sign-up path, not sign-in
- Verify the toggle is read from `getEnv().AUTH_PASSWORD_ENABLED`
- Return 403 with error code `AUTH_PASSWORD_DISABLED` when toggle is off
- Confirm sign-in still works when toggle is off (for users created before toggle was disabled)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-03` | When toggle off: sign-up → 403; existing user sign-in → success |

## Test Plan

- **Unit test** (`src/auth/helper.spec.ts`): `assertPasswordEnabled` throws when env is not `"true"`
- **Unit test** (`src/auth/service.spec.ts`): sign-up calls `assertPasswordEnabled`; sign-in does not
- **Integration test** (`test/intg/auth-email-password.intg.spec.ts`): with toggle off → sign-up 403, sign-in 200 for existing user

## Done When

- Toggle correctly gates sign-up only.
- Sign-in unaffected by toggle state.
- Unit and integration tests pass.
