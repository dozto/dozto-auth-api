# Epic

## Metadata

- Epic ID: `EP-004`
- Title: Token Validation And External Docs
- Status: `planned`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Related Requirement: `agents/REQUIREMENTS.md`
- Related Architecture: `agents/ARCHITECTURE.md`
- Follow-up to:
- Supersedes:

## Summary

Implement the external verification and documentation outcomes needed by
third-party services and agent consumers.

## Goal

Make the authentication service usable as a platform integration point by
delivering token validation capabilities and externally consumable documents.

## In Scope

- Third-party token validation capability.
- External document outputs for API consumers.
- External document outputs for MCP / agent consumers.

## Out Of Scope

- New login methods outside the current requirements.
- Business authorization models outside identity verification.
- Replacing earlier path definitions with a different API shape.

## Story Breakdown

- `ST-004-01` Implement token verification for third-party services.
- `ST-004-02` Publish API documentation from implemented capabilities.
- `ST-004-03` Publish MCP documentation for agent consumers.

## Completion Rule

This epic can move to `done` only when all required child stories are done.

## Change Policy

Do not repurpose a completed epic for new scope. If new work is needed after
completion, create a new epic and link it with `Follow-up to` or `Supersedes`.
