# Story

## Metadata

- Story ID: `ST-002-02`
- Epic ID: `EP-002`
- Title: Implement Phone OTP Login And Account Bootstrap
- Status: `planned`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Follow-up to:
- Supersedes:

## Summary

Implement the phone OTP login flow, including the first-login account bootstrap
behavior expected by the requirements.

## Why

This story covers the phone-based local login capability required by the
service's first business implementation phase.

## Scope

- Phone OTP request and verification flow.
- First-login account bootstrap for phone-based access.
- Stable integration boundary with Better Auth phone OTP capability.

## Acceptance Criteria

- `AC-01` A user can complete login through a phone-and-code flow.
- `AC-02` First-time phone login can create the expected local user account
  state.
- `AC-03` The implemented flow preserves the repository/service/controller
  boundaries defined in the architecture.

Every story must keep this section explicit and testable.

## Linked Tasks

- No tasks yet. Tasks will be created after epic/story confirmation.

## Notes

SMS provider details can remain implementation notes unless they change the user
observable behavior defined by this story.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
