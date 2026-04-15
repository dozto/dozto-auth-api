# ST-002-03 Get Current User

## Metadata

- Story ID: `ST-002-03`
- Epic ID: `EP-002`
- Title: Get Current User
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-15

## Summary

Implement an endpoint that returns the authenticated user's identity
information, using the auth middleware (ST-002-01) to verify the access token.

## Why

Clients and downstream services need a way to retrieve the current user's
profile from a valid access token without decoding the JWT themselves. This is
also the first consumer of the auth middleware, validating its design.

## Scope

- `GET /auth/me` (or similar) protected by auth middleware
- Return user identity: user ID, email, phone, and other basic fields from Supabase user object
- Response shape defined and consistent with `ARCHITECTURE.md` conventions
- Unit and integration tests

## Acceptance Criteria

- `AC-01` `GET /auth/me` with valid access token returns user identity (id, email, phone at minimum).
- `AC-02` `GET /auth/me` without token returns 401.
- `AC-03` `GET /auth/me` with expired token returns 401.
- `AC-04` Response does not leak sensitive internal fields (e.g. Supabase raw user metadata beyond what is defined).

## Linked Tasks

- `TK-002-03-01` Get current user endpoint and response mapping

## Notes

This endpoint serves as the integration proof for the auth middleware. Ensure
the response shape is documented for downstream consumers.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
