# Task

## Metadata

- Task ID: `TK-001-02-02`
- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Write The Client API Path To Capability Contract
- Status: `done`
- Owner:
- Created: `2026-03-28`
- Updated: `2026-03-28`
- Depends on: `TK-001-02-01`

Each task must belong to exactly one story.

## Summary

Write the client-facing API path map and pair each path with its intended
capability.

## Scope Of Work

- Define concrete client API paths for the first planned capability surface.
- Pair each path with a clear capability description.
- Keep the contract at the path/capability level only.

## Acceptance Criteria Coverage

Map this task to the story acceptance criteria it helps satisfy.

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Produces the documented client API path map. |
| `AC-02` | Ensures each path is paired with a capability description. |
| `AC-03` | Avoids final request/response parameter design. |

## Test Plan

List the tests, checks, or manual verification steps that prove the linked
acceptance criteria.

- Manually review that each client path has a matching capability description.
- Manually review that the path map covers the planned first-phase auth
  capabilities.
- Manually confirm the document does not lock detailed request or response
  fields.

## Done When

- The scoped work is complete.
- The relevant manual verification steps pass.
- The task status and summary are updated.
