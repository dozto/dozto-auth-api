# ST-001-02 Phone + Password Sign-up and Sign-in

## Metadata

- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Phone + Password Sign-up and Sign-in
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Add phone number + password registration and login, mirroring the email +
password flow. Share the same `AUTH_PASSWORD_ENABLED` toggle for registration
gating.

## Why

The requirements define an orthogonal login matrix. Phone + password is a new
credential combination that gives users a familiar login option using their
phone number.

## Scope

- New Zod schema for phone + password credentials
- New routes: `POST /auth/password/phone/sign-up` and `POST /auth/password/phone/sign-in` (or unified path with identifier detection — to be decided in implementation)
- Repository calls to Supabase `signUp({ phone, password })` and `signInWithPassword({ phone, password })`
- `AUTH_PASSWORD_ENABLED` toggle applies to phone sign-up the same way as email
- Unified session response shape
- Unit and integration tests

## Acceptance Criteria

- `AC-01` `POST` with valid phone + password creates a user and returns access_token + refresh_token.
- `AC-02` `POST` sign-in with correct phone + password returns access_token + refresh_token.
- `AC-03` When `AUTH_PASSWORD_ENABLED` is not `"true"`, phone password sign-up returns 403; sign-in for existing user still succeeds.
- `AC-04` Invalid input (malformed phone, short password) returns 400 with structured error.

## Linked Tasks

- `TK-001-02-01` Phone password sign-up endpoint
- `TK-001-02-02` Phone password sign-in endpoint
- `TK-001-02-03` Password registration toggle for phone sign-up

## Notes

Exact route path design (separate endpoints vs. unified identifier endpoint)
should be decided during implementation and documented in `ARCHITECTURE.md`.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
