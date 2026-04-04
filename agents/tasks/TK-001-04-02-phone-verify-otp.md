# TK-001-04-02 Phone Verify-OTP Endpoint

## Metadata

- Task ID: `TK-001-04-02`
- Story ID: `ST-001-04`
- Epic ID: `EP-001`
- Title: Phone verify-OTP endpoint
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-04
- Depends on: `—`（可与 `TK-001-04-01` 并行交付；密码注册场景下短信由 Supabase Send SMS Hook 触发，确认手机号同样走 `verifyOtp`。完整「仅 OTP 登录」链路仍待发送端点。）

## Summary

实现手机短信 OTP 校验端点：调用 Supabase `verifyOtp`，成功时返回与密码登录一致的统一 session 形状。不经过 `AUTH_PASSWORD_ENABLED` 开关。

## Scope Of Work

- [x] Zod schema：`phoneOtpVerificationSchema`（`phone`、`token` 4–12 位数字、可选 `type`：`sms` | `phone_change`，默认 `sms`）
- [x] `auth/repository.ts`：`verifyPhoneOtp` → `db.auth.verifyOtp({ phone, token, type })`
- [x] `auth/service.ts`：`verifyPhoneOtp` + `mapSessionResponse`
- [x] Controller：`verifyPhoneOtpHandler`
- [x] 路由：`POST /auth/verifications/phone-otp`（与 ST-001-05 REST 风格一致）
- [x] 成功 HTTP 200；错误经 `mapAuthError`
- [x] 单元测试：`schemas.spec.ts`、`repository.spec.ts`
- [x] 集成测试：`test/intg/auth-phone-password.intg.spec.ts`（校验类与关闭密码注册时不返回 403）

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-02` | 正确验证码 → 200 + 统一 session（需有效 Supabase 会话；集成环境以错误码路径为主验证） |
| `AC-03` | 错误/过期码 → `mapAuthError` → 401/400 等结构化错误 |
| `AC-04` | 由 Supabase 在首次 `verifyOtp` 成功时创建/确认用户；本任务不重复实现 |
| `AC-05` | Zod + validator → 非法 `phone`/`token` → 400 |

## Test Plan

- **Unit**（`src/auth/schemas.spec.ts`）：`phoneOtpVerificationSchema` 合法/非法输入
- **Unit**（`src/auth/repository.spec.ts`）：`verifyPhoneOtp` 委托 `verifyOtp`，含 `phone_change` 类型
- **Integration**（`test/intg/auth-phone-password.intg.spec.ts`）：短手机号、非法 token、缺 token → 400；`AUTH_PASSWORD_ENABLED=false` 时仍非 403

## Done When

- [x] `POST /auth/verifications/phone-otp` 行为与实现一致，测试通过。
- [x] `agents/ARCHITECTURE.md` §4.3 已登记该路径。
