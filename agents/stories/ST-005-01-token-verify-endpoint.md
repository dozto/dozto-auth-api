# ST-005-01 Token Verification Endpoint

## Metadata

- Story ID: `ST-005-01`
- Epic ID: `EP-005`
- Title: Token Verification Endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement an HTTP endpoint that allows third-party services to verify an access
token and receive the associated user identity information.

## Why

Downstream microservices that do not want to maintain their own JWT verification
logic can call this endpoint to validate tokens and retrieve user context.

## Scope

- Endpoint (e.g. `POST /auth/token/verify`): accept access token in request body
- Call Supabase `auth.getUser(token)` to validate
- On success: return user identity (id, email, phone, etc.) and token validity status
- On failure: return structured error indicating invalid/expired token
- Zod schema for request body
- Unit and integration tests

## Acceptance Criteria

- `AC-01` Valid access token returns 200 with user identity and validity confirmation.
- `AC-02` Invalid or expired token returns 401 with structured error.
- `AC-03` Missing token in request returns 400.
- `AC-04` Response does not leak sensitive Supabase internals.

## Linked Tasks

- `TK-005-01-01` Token verification endpoint

## Notes

This endpoint is conceptually similar to the auth middleware + get-current-user
flow, but exposed as an explicit verification API for external consumers. It
does not require the caller to have an active session in this service.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
