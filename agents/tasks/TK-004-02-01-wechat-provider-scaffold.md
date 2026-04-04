# TK-004-02-01 WeChat Provider Module Scaffold

## Metadata

- Task ID: `TK-004-02-01`
- Story ID: `ST-004-02`
- Epic ID: `EP-004`
- Title: WeChat provider module scaffold and configuration
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: —

## Summary

Create the WeChat OAuth provider module structure under `src/providers/wechat/`
and add the necessary environment variables. Design the module for
extensibility (web QR, APP, in-browser).

## Scope Of Work

- Create `src/providers/wechat/` directory structure (e.g. `client.ts`, `types.ts`)
- Define WeChat OAuth configuration type (appId, appSecret, redirectUri, scope)
- Add environment variables: `WECHAT_APP_ID`, `WECHAT_APP_SECRET`, `WECHAT_REDIRECT_URI`, `AUTH_WECHAT_ENABLED`
- Update `src/lib/env/schema.ts` with new optional fields
- Update `.env.example`
- Design provider interface to support multiple login forms (web QR as first, APP and in-browser as future extensions)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-06` | Provider structured for future addition of APP and in-browser auth |

## Test Plan

- **Unit test** (`src/providers/wechat/client.spec.ts`): config loading and validation
- **Unit test** (`src/lib/env/schema.spec.ts`): env schema accepts WeChat fields
- **Integration test**: not needed for scaffold-only change

## Done When

- Provider directory and types are in place.
- Environment variables documented.
- Module structure supports future extensibility.
- Unit tests pass.
