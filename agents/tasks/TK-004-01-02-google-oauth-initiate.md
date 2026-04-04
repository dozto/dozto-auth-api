# TK-004-01-02 Google OAuth Initiate Endpoint

## Metadata

- Task ID: `TK-004-01-02`
- Story ID: `ST-004-01`
- Epic ID: `EP-004`
- Title: Google OAuth initiate endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-004-01-01`

## Summary

Implement the endpoint that initiates the Google OAuth flow by generating
an authorization URL via Supabase and returning it to the client.

## Scope Of Work

- Add `googleOAuthInitiate` to `auth/repository.ts` calling `db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- Add `googleOAuthInitiate` to `auth/service.ts` with `AUTH_GOOGLE_ENABLED` check
- Add controller handler
- Register route (e.g. `GET /auth/oauth/google`)
- Return the authorization URL in response body (or redirect, depending on client needs)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Initiate endpoint returns a valid Google authorization URL |
| `AC-05` | When Google OAuth is disabled, return appropriate error |

## Test Plan

- **Unit test** (`src/auth/service.spec.ts`): initiate calls repository and returns URL
- **Unit test** (`src/auth/repository.spec.ts`): initiate calls Supabase `signInWithOAuth` with correct provider
- **Integration test** (`test/intg/auth-oauth.intg.spec.ts`): GET endpoint → response contains authorization URL with Google domain

## Done When

- Initiate endpoint returns valid Google authorization URL.
- Toggle check works when disabled.
- Unit and integration tests pass.
