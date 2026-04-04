# TK-005-01-01 Token Verification Endpoint

## Metadata

- Task ID: `TK-005-01-01`
- Story ID: `ST-005-01`
- Epic ID: `EP-005`
- Title: Token verification endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-002-01-01` (auth middleware pattern)

## Summary

Implement the HTTP endpoint that allows third-party services to verify an
access token and receive the associated user identity information.

## Scope Of Work

- Add Zod schema for verify request body (`{ accessToken }`)
- Add `verifyToken` to `auth/repository.ts` calling `db.auth.getUser(accessToken)`
- Add `verifyToken` to `auth/service.ts` with user response mapping
- Add controller handler
- Register route (e.g. `POST /auth/token/verify`)
- Return 200 with `{ valid: true, user: { id, email, phone, ... } }` on success
- Return 401 with `{ valid: false, error: ... }` on failure
- No auth middleware needed (the token to verify is in the body, not the caller's identity)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Valid token returns 200 with user identity |
| `AC-02` | Invalid/expired token returns 401 |
| `AC-03` | Missing token returns 400 |
| `AC-04` | No sensitive Supabase internals leaked |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): verify calls repository and returns mapped result
- **Unit test** (`src/auth/repository.spec.ts`): verify calls Supabase `getUser(token)`
- **Integration test** (`test/intg/auth-token-verify.intg.spec.ts`): login → verify token → 200 with user; verify with invalid token → 401; verify without token → 400
- **E2E test** (`test/e2e/token-verify.e2e.spec.ts`): full flow — login → third-party calls verify endpoint → correct user returned

## Done When

- Token verification endpoint works for valid and invalid tokens.
- Response shape is clean and documented.
- Unit, integration, and E2E tests pass.
