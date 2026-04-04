# TK-004-02-03 WeChat OAuth Callback Endpoint

## Metadata

- Task ID: `TK-004-02-03`
- Story ID: `ST-004-02`
- Epic ID: `EP-004`
- Title: WeChat OAuth callback endpoint
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-004-02-02`

## Summary

Implement the callback endpoint that handles the return from WeChat
authorization: exchange the authorization code for a WeChat access token,
fetch WeChat user info, create or match a Supabase user, and return a session.

## Scope Of Work

- Verify CSRF `state` parameter matches the one generated during initiate
- Exchange authorization code for WeChat access token via `https://api.weixin.qq.com/sns/oauth2/access_token`
- Fetch WeChat user info via `https://api.weixin.qq.com/sns/userinfo`
- Create or match Supabase user: look up by WeChat `unionid` / `openid`; if not found, create via Supabase Admin API (`admin.createUser` or similar)
- Generate Supabase session for the matched/created user
- Return unified session response with access_token + refresh_token
- Handle error cases: user cancellation, invalid code, WeChat API error
- Register route (e.g. `GET /auth/oauth/wechat/callback`)

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | After WeChat scan, callback returns access_token + refresh_token |
| `AC-03` | First-time WeChat login creates new user |
| `AC-04` | Repeat WeChat login returns session for same user |
| `AC-05` | WeChat error or cancellation returns structured error |

## Test Plan

- **Unit test** (`src/providers/wechat/client.spec.ts`): code exchange produces access token; user info fetched correctly
- **Unit test** (`src/auth/service.spec.ts`): callback processes WeChat data and returns session
- **Integration test** (`test/intg/auth-oauth.intg.spec.ts`): callback with mocked WeChat API → 200 with session; callback with invalid code → error; state mismatch → 403
- **E2E test** (`test/e2e/wechat-login.e2e.spec.ts`): full flow with mock WeChat server (may require external mock setup)

## Done When

- Callback exchanges WeChat code for session.
- New and returning WeChat users handled correctly.
- CSRF state verified.
- Error cases return structured responses.
- Unit, integration, and E2E tests pass.
