# EP-002 Session Management & Auth Middleware

## Metadata

- Epic ID: `EP-002`
- Title: Session Management & Auth Middleware
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Related Requirement: `REQUIREMENTS.md` §6
- Related Architecture: `ARCHITECTURE.md` §3, §4

## Summary

Build the authentication middleware and three session management endpoints
(token refresh, logout, get current user). The auth middleware is foundational
infrastructure required by EP-003 and EP-005.

## Goal

Provide a complete session lifecycle: after login, clients can refresh their
token, retrieve their identity, and log out — all through this service without
touching Supabase directly.

## In Scope

- Auth middleware: extract Bearer token from request header, call Supabase `getUser` to verify, inject user into Hono context
- Token refresh endpoint: exchange refresh_token for a new access_token
- Logout endpoint: revoke current session (single session only)
- Get current user endpoint: return user identity from access token (uses auth middleware)

## Out Of Scope

- Login flows (EP-001, EP-004)
- Password set / reset (EP-003)
- Token verification for third parties (EP-005)
- Multi-device / all-session logout

## Story Breakdown

- `ST-002-01` Auth middleware
- `ST-002-02` Token refresh and logout
- `ST-002-03` Get current user

## Completion Rule

This epic can move to `done` only when the auth middleware is operational and
all three session endpoints pass acceptance tests.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
