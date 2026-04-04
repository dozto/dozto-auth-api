# TK-001-02-01 Phone Password Sign-up Endpoint

## Metadata

- Task ID: `TK-001-02-01`
- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Phone password sign-up endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-001-01-01`

## Summary

Implement the phone + password sign-up endpoint. Create the full stack:
repository (Supabase `signUp({ phone, password })`), service, controller,
route registration, using the phone-password schema from TK-001-01-01.

## Scope Of Work

- Add `phonePasswordSignUp` to `auth/repository.ts` calling `db.auth.signUp({ phone, password })`
- Add `phonePasswordSignUp` to `auth/service.ts` with `assertPasswordEnabled` check
- Add controller handler for phone sign-up
- Register route (e.g. `POST /auth/password/phone/sign-up`)
- Return unified session response (201)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Phone + password sign-up creates user and returns tokens |
| `AC-04` | Invalid input (malformed phone, short password) returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): phone sign-up calls repository and returns mapped response
- **Unit test** (`src/auth/repository.spec.ts`): phone sign-up calls Supabase with correct params
- **Integration test** (`test/intg/auth-phone-password.intg.spec.ts`): POST with valid phone + password → 201 with session; POST with invalid phone → 400

## Done When

- Phone password sign-up endpoint responds correctly.
- Unit and integration tests pass.
