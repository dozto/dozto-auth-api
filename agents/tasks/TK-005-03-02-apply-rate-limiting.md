# TK-005-03-02 Apply Rate Limiting to Auth Endpoints

## Metadata

- Task ID: `TK-005-03-02`
- Story ID: `ST-005-03`
- Epic ID: `EP-005`
- Title: Apply rate limiting to auth endpoints
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-005-03-01`

## Summary

Apply the rate limiting middleware to all login and OTP-send endpoints.
Configure appropriate thresholds for each endpoint category. Ensure
non-auth endpoints (e.g. `/health`) are not affected.

## Scope Of Work

- Apply rate limiting to password sign-in endpoints (email + phone)
- Apply rate limiting to OTP send endpoints (email + phone) — tighter limits to prevent SMS/email abuse
- Apply rate limiting to OAuth initiate endpoints
- Apply rate limiting to password sign-up endpoints
- Do NOT apply to `/health`, `/auth/me`, `/auth/token/refresh`, `/auth/logout`
- Configure per-endpoint thresholds (OTP send should be stricter than login)
- Verify non-auth endpoints remain unaffected

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | Rate limiting applies to login and OTP-send endpoints |
| `AC-05` | Rate limiting does not interfere with non-auth endpoints |

## Test Plan

- **Integration test** (`test/intg/rate-limit.intg.spec.ts`): rapid login attempts → 429 after threshold; rapid OTP sends → 429 (at lower threshold); GET /health → never 429
- **E2E test** (`test/e2e/rate-limit.e2e.spec.ts`): against running server — rapid login attempts → 429; normal pace → all pass; /health unaffected

## Done When

- Rate limiting active on all login and OTP endpoints.
- Non-auth endpoints unaffected.
- Thresholds configured and documented.
- Integration and E2E tests pass.
