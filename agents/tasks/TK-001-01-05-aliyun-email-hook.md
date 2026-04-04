# TK-001-01-05 Supabase Send Email Hook + 阿里云邮件推送

## Metadata

- Task ID: `TK-001-01-05`
- Story ID: `ST-001-01`
- Epic ID: `EP-001`
- Title: Supabase Send Email Hook with Alibaba Cloud DirectMail
- Status: `in_progress`
- Owner:
- Created: 2026-04-05
- Updated: 2026-04-05
- Depends on: `TK-001-01-02` (邮箱密码注册端点)

## Summary

Implement Supabase **Send Email Hook** to proxy authentication emails through **Alibaba Cloud DirectMail** service. This enables custom email delivery for email+password registration verification, replacing Supabase's built-in email provider.

The hook receives email sending requests from Supabase Auth, renders Chinese email templates, and sends emails via Alibaba Cloud DirectMail API.

## Scope Of Work

### 1. Alibaba Cloud DirectMail Client

- Implement `aliyun-dm-client.ts` using DirectMail `SingleSendMail` API
- API endpoint: `https://dm.aliyuncs.com`
- API version: `2015-11-23`
- Authentication: HMAC-SHA1 signature (same as SMS client)
- Support both HTML and plain text emails

### 2. Email Templates

- Create Chinese email templates in `templates.ts`
- Support `signup` type (email verification for registration)
- Template variables: `{{confirmation_url}}`, `{{token}}`, `{{app_name}}`
- Responsive HTML design with fallback plain text

### 3. Send Email Hook Handler

- Endpoint: `POST /webhooks/email/send`
- Verify Standard Webhooks signature using `SUPABASE_WEBHOOK_SECRET`
- Parse Supabase payload: `{ user, email_data }`
- Generate confirmation URL using `AUTH_SERVICE_DOMAIN`
- Render appropriate template based on `email_action_type`
- Send email via Alibaba Cloud DirectMail
- Return 200 on success (empty response)

### 4. Email Verification Endpoint

- Endpoint: `GET /verify`
- Handle user clicking confirmation link from email
- Parse query params: `token`, `type`, `redirect_to`
- Call Supabase Auth API to verify token
- Redirect to `redirect_to` on success

### 5. Configuration

Add to `src/lib/env/schema.ts`:
- `AUTH_SERVICE_DOMAIN`: Auth service domain for confirmation links
- `ALIYUN_DM_ACCOUNT_NAME`: Verified sender email address
- `ALIYUN_DM_FROM_ALIAS`: Sender display name (optional)

### 6. Testing

- Unit tests: DM client, template rendering
- Integration tests: Webhook endpoint, signature verification
- Manual test: Complete email+password registration flow

## Acceptance Criteria Coverage

| Story AC | How this task supports it |
|----------|--------------------------|
| `AC-01` | Email+password registration sends verification email via Alibaba Cloud |
| `AC-02` | Confirmation email contains valid link to verify email address |
| `AC-05` | Email template is in Chinese, professional design |

## Environment Variables

```bash
# Required
AUTH_SERVICE_DOMAIN=https://auth.yourdomain.com
ALIYUN_DM_ACCOUNT_NAME=noreply@yourdomain.com

# Optional
ALIYUN_DM_FROM_ALIAS=YourApp

# Reuses existing
ALIYUN_ACCESS_KEY_ID=xxx
ALIYUN_ACCESS_KEY_SECRET=xxx
ALIYUN_REGION=cn-hangzhou
SUPABASE_WEBHOOK_SECRET=xxx
```

## Test Plan

- **Unit test** (`src/providers/email/aliyun-dm-client.spec.ts`): DM client signs requests correctly
- **Unit test** (`src/providers/email/templates.spec.ts`): Template renders variables correctly
- **Integration test** (`test/intg/email-webhook.intg.spec.ts`): 
  - POST with valid signature sends email → 200
  - POST with invalid signature → 401
  - GET /verify with valid token → redirects

## Done When

- [ ] User receives Chinese verification email after email+password registration
- [ ] Email contains correct confirmation link and OTP code
- [ ] Clicking confirmation link verifies email successfully
- [ ] Webhook signature verification works
- [ ] All tests pass

## Notes

### Supabase Hook Payload Format
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "email_data": {
    "token": "123456",
    "token_hash": "hash...",
    "email_action_type": "signup",
    "redirect_to": "https://app.com/callback",
    "site_url": "https://app.com"
  }
}
```

### Confirmation URL Format
```
https://{AUTH_SERVICE_DOMAIN}/verify?token={token_hash}&type=signup&redirect_to={redirect_to}
```

### Out of Scope (Current Version)
- ❌ Secure Email Change (dual OTP)
- ❌ Multi-language support (Chinese only)
- ❌ Other email types: recovery, magiclink, invite
- ❌ Alibaba Cloud console templates

## Change Log

- 2026-04-05: Created task for Send Email Hook implementation
