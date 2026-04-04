# ST-004-02 WeChat Web QR Code Login

## Metadata

- Story ID: `ST-004-02`
- Epic ID: `EP-004`
- Title: WeChat Web QR Code Login
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement WeChat web QR code login for desktop browsers. Since Supabase does
not have a native WeChat provider, this requires a custom OAuth integration
placed in `src/providers/`.

## Why

WeChat login is essential for the Chinese market. The web QR code flow is the
primary desktop scenario. The provider architecture should be extensible for
future APP login and in-WeChat browser authorization.

## Scope

- Custom WeChat OAuth provider in `src/providers/wechat/` (or similar)
- Initiate endpoint: generate WeChat authorization URL (with QR code parameters), return URL to client
- Callback endpoint: receive authorization code from WeChat, exchange for WeChat access token + user info, create or match Supabase user, return session
- WeChat Open Platform "Website Application" (`snsapi_login` scope)
- Environment variables for WeChat App ID, App Secret, redirect URI
- Provider architecture designed for extensibility (APP login, in-browser auth)
- Unified session response shape
- Unit and integration tests (WeChat flow may require mocking)

## Acceptance Criteria

- `AC-01` Initiate endpoint returns a valid WeChat authorization URL suitable for QR code display.
- `AC-02` After WeChat scan and authorization, callback creates/matches a user and returns access_token + refresh_token.
- `AC-03` First-time WeChat login creates a new user.
- `AC-04` Repeat WeChat login for the same WeChat account returns a session for the same user.
- `AC-05` WeChat error or user cancellation returns a structured error response.
- `AC-06` Provider code is structured to allow future addition of APP login and in-browser auth without rewriting the core logic.

## Linked Tasks

- `TK-004-02-01` WeChat provider module scaffold and configuration
- `TK-004-02-02` WeChat OAuth initiate endpoint (QR URL generation)
- `TK-004-02-03` WeChat OAuth callback endpoint

## Notes

WeChat Open Platform requires a verified developer account and an approved
website application. The callback flow involves exchanging an authorization
code for an access token, then fetching user info — different from standard
OAuth providers that Supabase handles natively. Consider how to map the
WeChat identity to a Supabase user (e.g. via `admin.createUser` or a custom
identity linking approach).

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
