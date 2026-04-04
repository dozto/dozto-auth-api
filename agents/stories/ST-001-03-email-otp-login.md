# ST-001-03 Email + OTP Login

## Metadata

- Story ID: `ST-001-03`
- Epic ID: `EP-001`
- Title: Email + OTP Login
- Status: `cancelled`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-05

## Summary

~~Implement passwordless email login via one-time password (OTP). The flow is
two-step: send a verification code to the email address, then verify the code
to complete login.~~

**状态**: 已放弃实现。邮箱 OTP 登录功能不再开发。

## Why

~~Email OTP provides a passwordless entry point. Users who start with OTP can
later set a password (EP-003) to unlock password-based login.~~

## Scope

~~- Send OTP: call Supabase `signInWithOtp({ email })`, return success acknowledgement
- Verify OTP: call Supabase `verifyOtp({ email, token, type })`, return access_token + refresh_token
- New Zod schemas for send-OTP and verify-OTP request bodies
- New routes under `/auth/otp/email/...`~~

**放弃原因**: 业务需求变更，邮箱 OTP 登录功能不再需要。

## Acceptance Criteria

~~- `AC-01` Send-OTP endpoint accepts a valid email and returns 200 acknowledgement~~
- ~~`AC-02` Verify-OTP endpoint with correct code returns access_token + refresh_token~~
- ~~`AC-03` Verify-OTP with wrong or expired code returns 401 with structured error~~
- ~~`AC-04` First-time email OTP login creates a new user in Supabase Auth~~
- ~~`AC-05` Invalid input (missing email, malformed email) returns 400~~

## Linked Tasks

- ~~`TK-001-03-01` Email send-OTP endpoint~~ (已取消)
- ~~`TK-001-03-02` Email verify-OTP endpoint~~ (已取消)

## Change Policy

This story has been cancelled and will not be implemented.
