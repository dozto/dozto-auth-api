# TK-005-03-01 Rate Limiting Middleware Implementation

## Metadata

- Task ID: `TK-005-03-01`
- Story ID: `ST-005-03`
- Epic ID: `EP-005`
- Title: Rate limiting middleware implementation
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Implement a rate limiting middleware using an in-memory store (sliding window
or token bucket). The middleware should be configurable by dimension
(IP, account identifier) and threshold.

## Scope Of Work

- Create rate limiting middleware in `src/lib/rate-limit/` (or `src/infra/rate-limit/`)
- Implement in-memory sliding window or token bucket algorithm
- Support dimensions: per-IP (from request headers / connection info) and optionally per-account identifier (from request body)
- Configurable thresholds (requests per window)
- Return 429 with structured error body and optional `Retry-After` header when limit exceeded
- Export as composable Hono middleware
- Add environment variables for rate limit configuration (e.g. `RATE_LIMIT_LOGIN_MAX`, `RATE_LIMIT_OTP_MAX`, `RATE_LIMIT_WINDOW_MS`)
- Document path to Redis-backed store for production scale

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Requests exceeding rate limit receive 429 |
| `AC-03` | Normal-frequency requests are not affected |
| `AC-04` | Dimensions are configurable |

## Test Plan

- **Unit test** (`src/lib/rate-limit/rate-limit.spec.ts`): rapid requests exceed limit → 429; normal requests pass; window reset works; different IPs tracked independently
- **Integration test** (`test/intg/rate-limit.intg.spec.ts`): apply middleware to test route → rapid requests → 429 after threshold; wait for window → requests pass again

## Done When

- Rate limiting middleware is implemented and configurable.
- In-memory store works correctly.
- Unit and integration tests pass.
