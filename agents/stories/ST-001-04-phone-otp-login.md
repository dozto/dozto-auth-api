# ST-001-04 Phone + OTP Login

## Metadata

- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone + OTP Login
- Status: `in_progress`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Implement phone number + SMS OTP login. The flow mirrors email OTP: send a
verification code via SMS, then verify the code to complete login.

**进度（2026-04-04）**：校验端点已由 `TK-001-04-02` 完成（`POST /auth/verifications/phone-otp`）。发送 OTP 端点（`TK-001-04-01`）仍待实现；该校验端点亦用于密码注册后 `phone_not_confirmed` 等需 `verifyOtp` 的场景。

## Why

Phone OTP is a widely used login method, especially in mobile-first markets.
Combined with phone + password (ST-001-02), it completes the phone-based
authentication column in the login matrix.

## Scope

- Send OTP: call Supabase `signInWithOtp({ phone })`, return success acknowledgement — **待 `TK-001-04-01`**
- Verify OTP: call Supabase `verifyOtp({ phone, token, type })`, return unified session — **`done`（`TK-001-04-02`）**
- Zod schema for verify: `phoneOtpVerificationSchema` — **done**
- Zod schema + route for send — **planned**（`TK-001-04-01`）
- Route: `POST /auth/verifications/phone-otp`（verify；与 ST-001-05 REST 风格一致）
- First-time phone OTP login auto-creates the user account（Supabase 行为）
- Unified session response shape（`mapSessionResponse`）
- Unit and integration tests（verify 部分已覆盖；send 待补）

## Acceptance Criteria

- `AC-01` Send-OTP endpoint accepts a valid phone number and returns 200 acknowledgement.
- `AC-02` Verify-OTP endpoint with correct code returns access_token + refresh_token.
- `AC-03` Verify-OTP with wrong or expired code returns 401 with structured error.
- `AC-04` First-time phone OTP login creates a new user in Supabase Auth.
- `AC-05` Invalid input (missing phone, malformed number) returns 400.

## Linked Tasks

- `TK-001-04-01` Phone send-OTP endpoint
- `TK-001-04-02` Phone verify-OTP endpoint

## Notes

SMS delivery：项目已采用 **Send SMS Hook + 阿里云**（见 `TK-001-02-04`）。纯 OTP 登录的发送步骤仍可通过 `signInWithOtp({ phone })` 由 Supabase 触发短信（与 `TK-001-04-01` 对齐）。集成测试对真实发码链路可 mock 或依赖 Supabase 测试号。

校验路径最终约定：**`POST /auth/verifications/phone-otp`**（方案 A），非原草案中的 `/auth/otp/phone/verify`。

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.
