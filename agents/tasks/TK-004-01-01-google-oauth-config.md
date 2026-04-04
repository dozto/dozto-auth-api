# TK-004-01-01 Google OAuth Environment Configuration

## Metadata

- Task ID: `TK-004-01-01`
- Story ID: `ST-004-01`
- Epic ID: `EP-004`
- Title: Google OAuth environment configuration
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Add the necessary environment variables and configuration for Google OAuth
integration. Update env schema validation and `.env.example`.

## Scope Of Work

- Add `AUTH_GOOGLE_ENABLED` toggle to env schema (optional, default disabled)
- Add `AUTH_OAUTH_REDIRECT_URL` for the post-OAuth redirect destination
- Update `src/lib/env/schema.ts` with new optional fields
- Update `.env.example` with documentation comments
- Verify Supabase project has Google provider enabled (document prerequisite)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Configuration in place for Google OAuth flow |

## Test Plan

- **Unit test** (`src/lib/env/schema.spec.ts`): env schema accepts new optional fields; validates correctly when present
- **Integration test**: not needed for config-only change

## Done When

- Env schema updated with Google OAuth fields.
- `.env.example` documents new variables.
- Unit tests pass.
