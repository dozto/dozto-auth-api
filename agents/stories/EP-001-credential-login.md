# EP-001 Credential Login (Password & OTP)

## Metadata

- Epic ID: `EP-001`
- Title: Credential Login (Password & OTP)
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Related Requirement: `REQUIREMENTS.md` §4.1
- Related Architecture: `ARCHITECTURE.md` §3, §4, §6

## Summary

Implement the four credential-based login flows formed by the orthogonal
combination of identifiers (email / phone) and verification methods
(password / OTP). This is the foundational Epic — all other Epics depend on
at least one working login flow from here.

## Goal

Users can register and log in via any of the four credential combinations.
Each successful authentication returns an access token and a refresh token
consistent with Supabase Auth session semantics. Password-based registration
is gated by an environment variable toggle.

## In Scope

- Email + password: sign-up and sign-in (extend existing implementation)
- Phone + password: sign-up and sign-in (new)
- Email + OTP: send code and verify (new)
- Phone + OTP: send code and verify (new)
- Password registration toggle via `AUTH_PASSWORD_ENABLED` (extend existing to cover phone)
- Unified session response shape for all four flows

## Out Of Scope

- OAuth / social login (EP-004)
- Session refresh, logout, get-current-user (EP-002)
- Password set / reset (EP-003)
- Rate limiting (EP-005)

## Story Breakdown

- `ST-001-01` Email + password sign-up and sign-in
- `ST-001-02` Phone + password sign-up and sign-in
- `ST-001-03` Email + OTP login
- `ST-001-04` Phone + OTP login

## Completion Rule

This epic can move to `done` only when all four child stories are done and
the password registration toggle is verified to work for both email and phone.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
