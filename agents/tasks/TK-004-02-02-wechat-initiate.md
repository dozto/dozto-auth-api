# TK-004-02-02 WeChat OAuth Initiate Endpoint

## Metadata

- Task ID: `TK-004-02-02`
- Story ID: `ST-004-02`
- Epic ID: `EP-004`
- Title: WeChat OAuth initiate endpoint (QR URL generation)
- Status: `planned`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `TK-004-02-01`

## Summary

Implement the endpoint that generates a WeChat authorization URL for desktop
web QR code login. The client displays this URL as a QR code for the user
to scan with their WeChat mobile app.

## Scope Of Work

- Build WeChat authorization URL: `https://open.weixin.qq.com/connect/qrconnect` with `appid`, `redirect_uri`, `response_type=code`, `scope=snsapi_login`, `state`
- Generate and store CSRF `state` parameter for callback verification
- Add `wechatInitiate` to provider module and auth service
- Add controller handler
- Register route (e.g. `GET /auth/oauth/wechat`)
- Return authorization URL in response body
- Check `AUTH_WECHAT_ENABLED` toggle

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-01` | Initiate returns valid WeChat authorization URL for QR display |

## Test Plan

- **Unit test** (`src/providers/wechat/client.spec.ts`): URL generation produces correct domain, params, scope
- **Unit test** (`src/auth/service.spec.ts`): initiate calls provider and returns URL
- **Integration test** (`test/intg/auth-oauth.intg.spec.ts`): GET endpoint → response contains WeChat authorization URL with correct params

## Done When

- Initiate endpoint returns valid WeChat QR authorization URL.
- Toggle check works when disabled.
- Unit and integration tests pass.
