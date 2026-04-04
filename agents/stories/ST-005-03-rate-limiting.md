# ST-005-03 Rate Limiting Middleware

## Metadata

- Story ID: `ST-005-03`
- Epic ID: `EP-005`
- Title: Rate Limiting Middleware
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement a rate limiting middleware and apply it to all login and OTP-send
endpoints to prevent brute force attacks and SMS/email abuse.

## Why

Authentication endpoints are common targets for brute force and resource abuse.
Basic rate limiting protects both the service and upstream providers (SMS
gateway, email service) from excessive requests.

## Scope

- Rate limiting middleware (Hono middleware or similar)
- Dimensions: per-IP and/or per-account identifier (email/phone)
- Apply to: all credential login endpoints (password sign-in, OTP send, OTP verify), OAuth initiate endpoints
- Response: HTTP 429 with structured error and optional `Retry-After` header
- Thresholds: complement Supabase's built-in rate limits; exact values determined during implementation
- Consider in-memory store for MVP; document path to Redis-backed store for production scale
- Unit tests for middleware logic; integration tests for rate-limited endpoints

## Acceptance Criteria

- `AC-01` Requests exceeding the rate limit receive 429 response.
- `AC-02` Rate limiting applies to login and OTP-send endpoints.
- `AC-03` Normal-frequency requests are not affected.
- `AC-04` Rate limit dimensions (IP / account) are configurable or clearly documented.
- `AC-05` Rate limiting does not interfere with non-auth endpoints (e.g. `/health`).

## Linked Tasks

- `TK-005-03-01` Rate limiting middleware implementation
- `TK-005-03-02` Apply rate limiting to auth endpoints

## Notes

Supabase Auth has its own built-in rate limiting. The application-layer rate
limiting here is supplementary — focused on protecting against patterns that
Supabase may not cover (e.g. rapid OTP requests to different numbers from the
same IP). For the initial implementation, an in-memory sliding window or token
bucket is sufficient.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
