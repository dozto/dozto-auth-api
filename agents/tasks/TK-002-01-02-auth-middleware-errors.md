# TK-002-01-02 Auth Middleware Error Handling

## Metadata

- Task ID: `TK-002-01-02`
- Story ID: `ST-002-01`
- Epic ID: `EP-002`
- Title: Auth middleware error handling
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15
- Depends on: `TK-002-01-01`

## Summary

Ensure the auth middleware returns structured 401 errors for all failure
scenarios: missing header, malformed header, invalid token, expired token.

## Scope Of Work

- Missing `Authorization` header → 401 with error code (e.g. `AUTH_TOKEN_MISSING`)
- Malformed header (not `Bearer <token>` format) → 401 with error code (e.g. `AUTH_TOKEN_MALFORMED`)
- Invalid token (Supabase returns error) → 401 with error code (e.g. `AUTH_TOKEN_INVALID`)
- Expired token → 401 with error code (e.g. `AUTH_TOKEN_EXPIRED`)
- Use `createAppError` / `mapAuthError` for consistent error shapes

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Missing Authorization header returns 401 |
| `AC-03` | Invalid or expired token returns 401 with appropriate error code |

## Test Plan

- **Unit test** (`src/auth/middleware.spec.ts`): no header → 401 `AUTH_TOKEN_MISSING`; `Bearer invalid` → 401 after Supabase rejects; expired token mock → 401
- **Integration test** (`test/intg/auth-middleware.intg.spec.ts`): request without header → 401; request with garbage token → 401; request with expired token → 401

## Done When

- All error paths return structured 401 responses.
- Error codes are consistent and documented.
- Unit and integration tests pass.
