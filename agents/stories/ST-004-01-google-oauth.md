# ST-004-01 Google OAuth Login

## Metadata

- Story ID: `ST-004-01`
- Epic ID: `EP-004`
- Title: Google OAuth Login
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement Google OAuth login using Supabase's native OAuth support. The flow
involves redirecting the user to Google for authorization, then handling the
callback to establish a session.

## Why

Google login is a widely expected authentication option. Supabase provides
native support, making this a low-friction integration.

## Scope

- Initiate endpoint: call Supabase `signInWithOAuth({ provider: 'google' })`, return or redirect to authorization URL
- Callback endpoint: handle the OAuth callback, exchange code for session, return access_token + refresh_token
- Configure redirect URLs via environment variables
- No forced email binding or additional business rules on Google accounts
- Unified session response shape
- Unit and integration tests (may require mocking OAuth flow)

## Acceptance Criteria

- `AC-01` Initiate endpoint returns a valid Google authorization URL.
- `AC-02` After Google authorization, callback returns access_token + refresh_token.
- `AC-03` First-time Google login creates a new user in Supabase Auth.
- `AC-04` Repeat Google login for the same Google account returns a session for the same user.
- `AC-05` OAuth error or user cancellation returns a structured error response.

## Linked Tasks

- `TK-004-01-01` Google OAuth environment configuration
- `TK-004-01-02` Google OAuth initiate endpoint
- `TK-004-01-03` Google OAuth callback endpoint

## Notes

Google OAuth requires a Google Cloud project with OAuth 2.0 credentials
configured. The Supabase project must have Google enabled as an auth provider.

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
