# EP-004 OAuth Third-party Login

## Metadata

- Epic ID: `EP-004`
- Title: OAuth Third-party Login
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Related Requirement: `REQUIREMENTS.md` §4.2, §4.3
- Related Architecture: `ARCHITECTURE.md` §3, §4.5

## Summary

Implement Google OAuth login and WeChat web QR code login. Google uses
Supabase's native OAuth support. WeChat requires a custom OAuth provider
since Supabase does not have a built-in WeChat integration.

## Goal

Users can log in via Google or WeChat (web QR scan) through this service.
The WeChat provider architecture is extensible for future APP login and
in-WeChat browser authorization.

## In Scope

- Google OAuth: initiate authorization + handle callback via Supabase `signInWithOAuth`
- WeChat web QR code login: custom OAuth provider in `src/providers/`, initiate authorization (generate QR URL) + handle callback
- WeChat provider designed for extensibility (APP login, in-browser auth reserved)
- Unified session response shape after successful OAuth

## Out Of Scope

- WeChat APP login (reserved, not this phase)
- WeChat in-browser authorization (reserved, not this phase)
- Credential-based login (EP-001)
- Identity merging across OAuth and credential accounts

## Story Breakdown

- `ST-004-01` Google OAuth login
- `ST-004-02` WeChat web QR code login

## Completion Rule

This epic can move to `done` only when both child stories are done and
both OAuth flows return valid sessions in the agreed environment.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
