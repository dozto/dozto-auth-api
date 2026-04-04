# ST-001-04 Phone + OTP Login

## Metadata

- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone + OTP Login
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-05

## Summary

~~Implement phone number + SMS OTP login. The flow mirrors email OTP: send a
verification code via SMS, then verify the code to complete login.~~

**状态**: 已放弃实现。手机号纯 OTP 登录功能不再开发，仅保留密码登录及密码注册时的短信验证。

## Why

~~Phone OTP is a widely used login method, especially in mobile-first markets.
Combined with phone + password (ST-001-02), it completes the phone-based
authentication column in the login matrix.~~

## Scope

~~- Send OTP: call Supabase `signInWithOtp({ phone })`, return success acknowledgement~~
~~- Verify OTP: call Supabase `verifyOtp({ phone, token, type })`, return unified session~~

**已实现部分**:
- ✅ 手机号密码注册时的短信验证码校验 (`POST /auth/verifications/phone-otp`)

**放弃部分**:
- ❌ 纯手机号 OTP 登录（无密码）
- ❌ 手机号发送 OTP 端点（用于纯 OTP 登录）

## Acceptance Criteria

~~- `AC-01` Send-OTP endpoint accepts a valid phone number and returns 200 acknowledgement~~
- ~~`AC-02` Verify-OTP endpoint with correct code returns access_token + refresh_token~~
- ~~`AC-03` Verify-OTP with wrong or expired code returns 401 with structured error~~
- ~~`AC-04` First-time phone OTP login creates a new user in Supabase Auth~~
- ~~`AC-05` Invalid input (missing phone, malformed number) returns 400~~

## Linked Tasks

- ~~`TK-001-04-01` Phone send-OTP endpoint~~ (已取消)
- ~~`TK-001-04-02` Phone verify-OTP endpoint~~ (已实现用于密码注册确认，纯 OTP 登录已取消)

## Notes

SMS delivery: 阿里云 SMS Hook 已实施 (TK-001-02-04)，用于密码注册时的短信验证码发送。

纯 OTP 登录功能已放弃，仅支持密码登录方式。

## Change Policy

This story has been cancelled. Only phone + password login is supported.
