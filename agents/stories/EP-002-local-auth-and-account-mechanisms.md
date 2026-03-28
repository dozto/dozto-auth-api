# Epic

## Metadata

- Epic ID: `EP-002`
- Title: Local Auth And Account Mechanisms
- Status: `planned`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Related Requirement: `agents/REQUIREMENTS.md`
- Related Architecture: `agents/ARCHITECTURE.md`
- Follow-up to:
- Supersedes:

## Summary

Implement the local authentication capabilities and core account mechanisms
required for a formal login system.

## Goal

Deliver the email/phone login flows and the account/session behavior needed for
the service to act as a usable authentication backend.

## In Scope

- Email OTP login and account bootstrap behavior.
- Phone OTP login and account bootstrap behavior.
- Session, refresh token, and account lifecycle mechanisms.

## Out Of Scope

- Google and WeChat social login.
- Identity merge between social identities and local identities.
- New planning work unrelated to local authentication.

## Story Breakdown

- `ST-002-01` Implement email OTP login and account bootstrap.
- `ST-002-02` Implement phone OTP login and account bootstrap.
- `ST-002-03` Implement session, refresh token, and account lifecycle flows.

## Completion Rule

This epic can move to `done` only when all required child stories are done.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
