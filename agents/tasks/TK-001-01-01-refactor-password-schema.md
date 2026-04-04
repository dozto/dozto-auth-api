# TK-001-01-01 Refactor Password Schema for Multi-Identifier Support

## Metadata

- Task ID: `TK-001-01-01`
- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Refactor password schema for multi-identifier support
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Refactor the existing `passwordCredentialsSchema` in `src/auth/schemas.ts` to
support both email and phone as identifiers, preparing for phone + password
login (ST-001-02). Extract a shared password validation rule and create
separate schemas for email-password and phone-password credentials.

## Scope Of Work

- Keep existing `passwordCredentialsSchema` (email + password) or rename for clarity
- Add a phone-password schema variant (phone + password)
- Extract shared password validation (min 8, max 72) into a reusable Zod fragment
- Export all schemas and inferred types
- Update existing imports if schema names change

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-04` | Provides validated schemas that reject invalid input with 400 |

## Test Plan

- **Unit test** (`src/auth/schemas.spec.ts`): validate email-password schema accepts valid input, rejects missing/invalid email, rejects short/long password
- **Unit test**: validate phone-password schema accepts valid phone, rejects malformed phone
- **Integration test**: not needed for schema-only change; covered by subsequent endpoint tasks

## Done When

- Schemas are exported and typed.
- Existing email password routes still work (no regression).
- Unit tests for schema validation pass.
