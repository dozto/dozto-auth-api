# ST-005-02 JWT Self-Verification Documentation

## Metadata

- Story ID: `ST-005-02`
- Epic ID: `EP-005`
- Title: JWT Self-Verification Documentation
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Write documentation explaining how third-party services can verify Supabase
JWT tokens independently without calling this service.

## Why

Some downstream services prefer to verify tokens locally for lower latency or
to avoid a dependency on this service. They need clear documentation on the
JWT structure, signing algorithm, and where to obtain the verification secret.

## Scope

- Document in `doc/api/` (or similar location per `ARCHITECTURE.md`)
- Content covers: JWT signing algorithm (HS256), where to find the JWT secret (Supabase project settings), token claims structure (sub, email, phone, role, exp, etc.), example verification code snippets
- Keep documentation implementation-neutral (not tied to a specific language)

## Acceptance Criteria

- `AC-01` Documentation exists in the repository and covers signing algorithm, secret location, and claims structure.
- `AC-02` A developer can follow the documentation to verify a token in their own service without further guidance.
- `AC-03` Documentation does not include actual secrets — only references to where they are configured.

## Linked Tasks

- `TK-005-02-01` JWT self-verification documentation

## Notes

This is a documentation-only story. No code changes are needed beyond placing
the document in the correct directory.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
