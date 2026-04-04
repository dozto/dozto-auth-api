# TK-001-02-04 Supabase Send SMS Hook with Alibaba Cloud SMS

## Metadata

- Task ID: `TK-001-02-04`
- Story ID: `ST-001-02`
- Epic ID: `EP-001`
- Title: Integrate Alibaba Cloud SMS via Supabase Send SMS Hook (scheme A)
- Status: `done`
- Owner:
- Created: 2026-04-05
- Updated: 2026-04-05
- Depends on: `TK-001-02-03`

## Summary

Implement **scheme A** for SMS delivery: configure Supabase **Send SMS Hook** so
Auth delegates outbound SMS to an HTTPS endpoint that calls **Alibaba Cloud
SMS** (短信服务 / OpenAPI). This removes reliance on Twilio-only built-in
providers and is the standard approach for mainland China and Aliyun ecosystem.

The hook is shared infrastructure for **phone + password** (Supabase must be
able to send verification SMS when required) and **phone + OTP** (`ST-001-04`);
this task owns the hook implementation and runbook; application routes remain in
`dozto-auth-api`.

## Scope Of Work

- **Supabase (Dashboard / CLI)**  
  - Enable Phone provider and Send SMS Hook per [Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook).  
  - Register hook URL, webhook signing secret, and test in staging project.

- **Webhook service** (choose one placement; document the choice in `ARCHITECTURE.md` or `doc/`):  
  - **Supabase Edge Function**, or  
  - **Dedicated HTTPS service** (existing cloud function / small service).  
  - Verify **Standard Webhooks** / Supabase signature on incoming requests.  
  - Map payload fields (E.164 `phone`, OTP / message body) to **Alibaba Cloud SMS** API (e.g. `SendSms` with approved template & signature in Aliyun console).  
  - Use **RAM** sub-account AccessKey with minimal SMS policy; never expose keys to clients.

- **Configuration & documentation**  
  - Env vars: Aliyun region, access key id/secret (or STS if applicable), template code, signature name.  
  - Runbook: how to rotate keys, how to test OTP delivery, troubleshooting (`phone_provider_disabled`, template audit failures).

- **Out of scope for this task** (unless explicitly pulled in):  
  - Changing `dozto-auth-api` HTTP routes for phone/password (already done in prior tasks).  
  - iOS/Android native SMS; only server-side hook + Supabase config.

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
| --- | --- |
| `AC-05` | Production-capable SMS path so phone auth is not blocked by missing global SMS provider; verifies end-to-end SMS via Aliyun |

## Test Plan

- **Manual / staging**: Trigger Supabase phone OTP or phone confirmation flow; confirm SMS received and content matches template.  
- **Unit tests** (if signature verification or Aliyun client is extracted to a testable module): valid signature accepted, invalid rejected.  
- **Integration**: Optional — mock Supabase hook payload POST to local webhook and assert Aliyun client called (with test doubles / sandbox).

## Done When

- Send SMS Hook is configured and documented; Alibaba Cloud SMS sends successfully in staging.  
- Signature verification and secrets handling are reviewed.  
- Runbook exists for operators (Supabase + Aliyun).  
- Story `AC-05` can be marked satisfied for the SMS integration slice.
