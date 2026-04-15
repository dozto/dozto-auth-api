# TK-003-01-01 Set Password Endpoint

## Metadata

- Task ID: `TK-003-01-01`
- Story ID: `ST-003-01`
- Epic ID: `EP-003`
- Title: Set password protected endpoint
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: `TK-002-01-01` (auth middleware)

## Summary

Implement the endpoint that allows an authenticated user (who does not yet
have a password) to create one. Protected by the auth middleware from EP-002.

## Scope Of Work

- Add Zod schema for set-password request body (`{ password }`)
- Add `setPassword` to `auth/repository.ts` calling Supabase `auth.updateUser({ password })` with the user's access token
- Add `setPassword` to `auth/service.ts`
- Add controller handler that reads user from auth middleware context
- Register route (e.g. `POST /auth/password/set`) protected by auth middleware
- Return 200 success acknowledgement (not a new session)
- Validate password meets minimum requirements via Zod schema

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Authenticated user without password can set one |
| `AC-02` | After setting, user can log in with identifier + password |
| `AC-03` | Request without valid access token returns 401 |
| `AC-04` | Password failing validation returns 400 |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): set-password calls repository with correct params
- **Unit test** (`src/auth/repository.spec.ts`): set-password calls Supabase `updateUser({ password })`
- **Integration test** (`test/intg/auth-password-mgmt.intg.spec.ts`): OTP login (no password) → set password → 200; then password sign-in → 200 with session
- **Integration test**: set password without token → 401; short password → 400
- **E2E test** (`test/e2e/set-password.e2e.spec.ts`): full flow — email OTP login → set password → email + password login succeeds

## Done When

- Set password endpoint works for authenticated users.
- Password login works after setting.
- Unit, integration, and E2E tests pass.
