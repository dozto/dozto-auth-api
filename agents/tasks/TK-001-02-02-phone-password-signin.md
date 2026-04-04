# TK-001-02-02 Phone Password Sign-in Endpoint

## Metadata

- Task ID: `TK-001-02-02`
- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Phone password sign-in endpoint
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-02-01`

## Summary

Implement the phone + password sign-in endpoint. Full stack: repository
(Supabase `signInWithPassword({ phone, password })`), service, controller,
route registration.

## Scope Of Work

- Add `phonePasswordSignIn` to `auth/repository.ts` calling `db.auth.signInWithPassword({ phone, password })`
- Add `phonePasswordSignIn` to `auth/service.ts` (no password toggle — sign-in is always allowed)
- Add controller handler for phone sign-in
- Register route (e.g. `POST /auth/password/phone/sign-in`)
- Return unified session response (200)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Phone + password sign-in returns tokens |
| `AC-04` | Wrong password returns 401; invalid input returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): phone sign-in calls repository and returns mapped response
- **Unit test** (`src/auth/repository.spec.ts`): phone sign-in calls Supabase with correct params
- **Integration test** (`test/intg/auth-phone-password.intg.spec.ts`): POST with correct credentials → 200; POST with wrong password → 401

## Done When

- Phone password sign-in endpoint responds correctly.
- Unit and integration tests pass.
