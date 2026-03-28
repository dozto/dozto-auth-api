# Story

## Metadata

- Story ID: `ST-003-03`
- Epic ID: `EP-003`
- Title: Implement Explicit Identity Merge And Conflict Handling
- Status: `planned`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Follow-up to:
- Supersedes:

## Summary

Implement the explicit identity merge flow, including the current-validity check
and conflict overwrite behavior defined by the requirements.

## Why

This story fulfills the core identity-management rule that social identities are
created independently first and merged only through explicit later flows.

## Scope

- User-triggered and system-triggered merge entry points.
- Current identity validity checks before overwrite behavior.
- Conflict handling and final identity association rules.

## Acceptance Criteria

- `AC-01` The system supports an explicit merge flow after independent identity
  creation.
- `AC-02` Merge execution validates the current identity before allowing
  overwrite behavior when conflicts exist.
- `AC-03` Successful merge results in the expected final user identity
  association state.

Every story must keep this section explicit and testable.

## Linked Tasks

- No tasks yet. Tasks will be created after epic/story confirmation.

## Notes

This story is intentionally separate from Google and WeChat login stories so
merge logic can evolve without redefining provider-specific login behavior.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
