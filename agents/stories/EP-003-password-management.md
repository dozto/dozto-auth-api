# EP-003 Password Management

## Metadata

- Epic ID: `EP-003`
- Title: Password Management
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Related Requirement: `REQUIREMENTS.md` §5
- Related Architecture: `ARCHITECTURE.md` §3, §4

## Summary

Implement the two password management capabilities: setting a password for
users who logged in without one (OTP / OAuth), and resetting a forgotten
password via email.

## Goal

Users who entered the system through OTP or OAuth can create a password to
unlock password-based login. Users who forget their password can recover access
through an email-based reset flow.

## In Scope

- Set password: authenticated endpoint for users without a password
- Password reset: email-initiated flow (request reset → email link/code → set new password)
- Both flows rely on Supabase Auth built-in capabilities

## Out Of Scope

- Change password (user knows current password and wants a new one — deferred)
- Login flows (EP-001, EP-004)
- Auth middleware (EP-002, consumed here)

## Story Breakdown

- `ST-003-01` Set password (authenticated)
- `ST-003-02` Password reset (email-based)

## Completion Rule

This epic can move to `done` only when both child stories are done.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
