# TK-001-04-02 Phone Verify-OTP Endpoint

## Metadata

- Task ID: `TK-001-04-02`
- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone verify-OTP endpoint
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-05
- Depends on: `—`

## Summary

实现手机号短信 OTP 校验端点。用于手机密码注册时的验证码确认场景。

**已完成**: 
- ✅ `POST /auth/verifications/phone-otp` - 用于密码注册时的手机号确认

**已取消**:
- ❌ 纯 OTP 登录（无密码）功能已放弃

## Scope Of Work

- [x] Zod schema：`phoneOtpVerificationSchema`（`phone`、`token` 4–12 位数字、可选 `type`：`sms` | `phone_change`）
- [x] `auth/repository.ts`：`verifyPhoneOtp` → `db.auth.verifyOtp({ phone, token, type })`
- [x] `auth/service.ts`：`verifyPhoneOtp` + `mapSessionResponse`
- [x] Controller：`verifyPhoneOtpHandler`
- [x] 路由：`POST /auth/verifications/phone-otp`
- [x] 单元测试：`schemas.spec.ts`、`repository.spec.ts`
- [x] 集成测试：校验类场景覆盖

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| ~~`AC-02`~~ | ~~纯 OTP 登录已取消~~ |
| `AC-03` (modified) | 错误/过期码 → `mapAuthError` → 401/400 等结构化错误（用于密码注册确认） |
| `AC-04` (modified) | 由 Supabase 在首次 `verifyOtp` 成功时确认手机号 |
| `AC-05` | Zod + validator → 非法 `phone`/`token` → 400 |

## Test Plan

- **Unit**（`src/auth/schemas.spec.ts`）：`phoneOtpVerificationSchema` 合法/非法输入
- **Unit**（`src/auth/repository.spec.ts`）：`verifyPhoneOtp` 委托 `verifyOtp`，含 `phone_change` 类型
- **Integration**（`test/intg/auth-phone-password.intg.spec.ts`）：短手机号、非法 token、缺 token → 400

## Done When

- [x] `POST /auth/verifications/phone-otp` 用于密码注册手机号确认功能正常，测试通过。
- [x] 纯 OTP 登录功能已明确取消。

## Change Log

- 2026-04-05: Story ST-001-04 放弃纯 OTP 登录，本 Task 仅保留密码注册确认功能。
