# Epic

## Metadata

- Epic ID: `EP-003`
- Title: Social Login And Identity Merge
- Status: `planned`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Related Requirement: `agents/REQUIREMENTS.md`
- Related Architecture: `agents/ARCHITECTURE.md`
- Follow-up to:
- Supersedes:

## Summary

Implement social login capabilities and the explicit identity merge behavior
required by the current product rules.

## Goal

Deliver Google and WeChat login while preserving the project's explicit
independent-identity-first and merge-later strategy.

## In Scope

- Google login.
- WeChat web QR login.
- Explicit identity merge and conflict handling.

## Out Of Scope

- A general-purpose SSO provider feature.
- Business profile management beyond the authentication boundary.
- Replacing Better Auth provider logic with custom auth foundations.

## Story Breakdown

- `ST-003-01` Implement Google login with independent identity creation.
- `ST-003-02` Implement WeChat web QR login with independent identity creation.
- `ST-003-03` Implement explicit identity merge and conflict handling.

## Completion Rule

This epic can move to `done` only when all required child stories are done.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
