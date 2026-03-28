# Story

## Metadata

- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Define Client Authentication API Path Map
- Status: `done`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Follow-up to:
- Supersedes:

## Summary

Define the client-facing authentication endpoint paths and the capability each
path is responsible for, without locking detailed parameters yet.

## Why

This story fulfills the first-phase requirement that API paths and capability
ownership must be clear before detailed business implementation starts.

## Scope

- Define route groups for client-facing authentication APIs.
- Define endpoint paths for login, token, session, and account-related flows.
- Map each endpoint path to an intended user-facing capability.

## Acceptance Criteria

- `AC-01` There is a documented client API path map that covers the
  authentication capabilities planned in the current requirements.
- `AC-02` Each path is paired with a clear capability description rather than
  only a route name.
- `AC-03` The path map is implementation-neutral and does not depend on final
  request/response parameter design.

## Linked Tasks

- `TK-001-02-01` Define the client auth route groups and capability areas.
- `TK-001-02-02` Write the client API path-to-capability contract.

## Notes

Detailed request fields, response fields, and validation schemas belong to the
later implementation phase, not this story.

For `EP-001`, acceptance is based on path and capability definition review.
Unit tests and integration tests are not required for this story.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
