# ST-001-02 Phone + Password Sign-up and Sign-in

## Metadata

- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Phone + Password Sign-up and Sign-in
- Status: `done`
- Owner:
- Created: 2026-04-04
- Updated: 2026-04-05

## Summary

Add phone number + password registration and login, mirroring the email +
password flow. Share the same `AUTH_PASSWORD_ENABLED` toggle for registration
gating.

**中文摘要**：在 HTTP API 侧实现手机号 + 密码注册/登录，并与统一会话响应对齐。  
**生产环境前提**：Supabase 侧必须能完成手机号相关短信能力；若不使用 Twilio 等内置厂商，应采用 **方案 A**：**Supabase Send SMS Hook** + **阿里云短信**，详见 `TK-001-02-04`。

## Why

The requirements define an orthogonal login matrix. Phone + password is a new
credential combination that gives users a familiar login option using their
phone number.

## Scope

- New Zod schema for phone + password credentials
- Routes: `POST /auth/password/phone/sign-up` and `POST /auth/password/phone/sign-in`
- Repository calls to Supabase `signUp({ phone, password })` and `signInWithPassword({ phone, password })`
- `AUTH_PASSWORD_ENABLED` toggle applies to phone sign-up the same way as email
- Unified session response shape
- Unit and integration tests for the **auth service** routes and validation
- **Supplementary (operational)**: Alibaba Cloud SMS integration via **Send SMS Hook** (`TK-001-02-04`) so hosted Supabase can send SMS without relying on default international providers only

## Acceptance Criteria

- `AC-01` `POST` with valid phone + password creates a user and returns access_token + refresh_token.
- `AC-02` `POST` sign-in with correct phone + password returns access_token + refresh_token.
- `AC-03` When `AUTH_PASSWORD_ENABLED` is not `"true"`, phone password sign-up returns 403; sign-in for existing user still succeeds.
- `AC-04` Invalid input (malformed phone, short password) returns 400 with structured error.
- `AC-05` **Production SMS path**: In the target Supabase project, phone-related SMS (verification / OTP as required by Supabase) can be delivered using **scheme A** — **Send SMS Hook** invoking **Alibaba Cloud SMS**; configuration and runbook are documented, and staging verification has been performed.

## Linked Tasks

- `TK-001-02-01` Phone password sign-up endpoint
- `TK-001-02-02` Phone password sign-in endpoint
- `TK-001-02-03` Password registration toggle for phone sign-up
- `TK-001-02-04` Supabase Send SMS Hook + Alibaba Cloud SMS (scheme A)

## Notes

- Route design uses **separate** `/auth/password/phone/*` endpoints (see `routes.ts`); no unified identifier detection in this story.
- Errors such as `phone_provider_disabled` / “Phone signups are disabled” originate from **Supabase Auth** when Phone auth or SMS is not configured; fixing that is part of **`TK-001-02-04`** (and overlaps with `ST-001-04` phone OTP, which uses the same SMS infrastructure).
- **方案 A** 要点：在 Supabase 控制台配置 **Send SMS Hook**，由 Hook 服务端调用阿里云短信 API（模板、签名在阿里云控制台审核）；手机号使用 **E.164**。

## Change Policy

Do not change the meaning of a completed story. If behavior changes after the
story is complete, create a new story under a new or follow-up epic and link it
back using `Follow-up to` or `Supersedes`.

**Extension (2026-04-05):** `AC-05` and `TK-001-02-04` were added to cover
operational SMS integration; they supplement the already-implemented API tasks
without altering the HTTP contract of `TK-001-02-01`–`03`.
