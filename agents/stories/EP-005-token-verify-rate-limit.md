# EP-005 Token Verification & Rate Limiting

## Metadata

- Epic ID: `EP-005`
- Title: Token Verification & Rate Limiting
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Related Requirement: `REQUIREMENTS.md` §8, §9
- Related Architecture: `ARCHITECTURE.md` §3, §4

## Summary

Provide token verification for third-party services and apply basic rate
limiting to all authentication endpoints. These are cross-cutting concerns
that are best added after the main login and session endpoints are in place.

## Goal

Third-party services can verify user tokens through this service or
independently via JWT. Authentication endpoints are protected against brute
force attacks and SMS/email abuse through rate limiting.

## In Scope

- Token verification HTTP endpoint: third party sends access token, receives validity + user info
- JWT self-verification documentation: explain Supabase JWT secret, claims structure, signing algorithm in repo docs
- Rate limiting middleware: applied to login and OTP-send endpoints (IP and/or account based)
- Rate limit response format (429 with retry-after or similar)

## Out Of Scope

- Full WAF, IP blacklisting, or advanced fraud detection
- Login flows (EP-001, EP-004)
- Auth middleware (EP-002, consumed here for token verification)

## Story Breakdown

- `ST-005-01` Token verification endpoint
- `ST-005-02` JWT self-verification documentation
- `ST-005-03` Rate limiting middleware

## Completion Rule

This epic can move to `done` only when the token verification endpoint works,
documentation is published, and rate limiting is active on all login/OTP
endpoints.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
