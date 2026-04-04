# TK-005-02-01 JWT Self-Verification Documentation

## Metadata

- Task ID: `TK-005-02-01`
- Story ID: `ST-005-02`
- Epic ID: `EP-005`
- Title: JWT self-verification documentation
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Write documentation explaining how third-party services can verify Supabase
JWT tokens independently without calling this service's verification endpoint.

## Scope Of Work

- Create document at `doc/api/jwt-verification.md` (or similar per `ARCHITECTURE.md`)
- Content:
  - JWT signing algorithm (HS256)
  - Where to find the JWT secret (Supabase project settings → API → JWT Secret)
  - Token claims structure: `sub` (user ID), `email`, `phone`, `role`, `aud`, `exp`, `iat`
  - Example verification pseudocode (language-neutral)
  - Security notes (always verify `exp`, validate `aud`)
- Do not include actual secrets in the document

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Documentation exists covering algorithm, secret location, claims |
| `AC-02` | Developer can follow docs to verify a token independently |
| `AC-03` | No actual secrets in the document |

## Test Plan

- **Manual review**: documentation is complete, accurate, and does not contain secrets
- No automated tests needed (documentation-only task)

## Done When

- Documentation file exists in `doc/api/`.
- Content covers all required topics.
- No secrets in the document.
