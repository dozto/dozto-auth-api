# 短信服务商运维手册 — 阿里云短信

本文说明如何为 Supabase **Send SMS Hook** 配置并运维**阿里云短信**（阿里云短信服务）集成。

## 概述

我们采用 **方案 A**：Supabase Send SMS Hook → 阿里云短信（阿里云短信服务）。

这样 Supabase Auth 可通过阿里云发送短信（OTP、验证码等），而不必依赖 Twilio 等国际厂商。

## 前置条件

1. 已开通短信服务的 **阿里云账号**
2. 在阿里云控制台已通过审核的 **短信签名**（签名）
3. 在阿里云控制台已通过审核的 **短信模板**（模板）
4. 具备**最小短信权限**的 **RAM 子账号**

## 配置

### 1. 阿里云侧配置

#### 1.1 创建 RAM 子账号（推荐）

1. 打开 [RAM 控制台](https://ram.console.aliyun.com/)
2. 创建子用户，例如：`sms-service-user`
3. 授权：授予 `AliyunDysmsFullAccess`，或自定义策略如下：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dysms:SendSms"],
      "Resource": "*"
    }
  ]
}
```

4. 为该子用户创建 AccessKey（保存 `AccessKey ID` 与 `AccessKey Secret`）

#### 1.2 申请短信签名

1. 打开 [短信服务控制台](https://dysms.console.aliyun.com/)
2. 进入 **国内消息** → **签名管理**
3. 点击 **添加签名**
4. 填写：
   - **签名类型**：验证码 或 通用
   - **签名名称**：例如 `DOZTO认证`（对应环境变量 `ALIYUN_SMS_SIGN_NAME`）
   - **签名用途**：自用
   - **场景说明**：用户身份认证与验证
5. 提交并等待审核（通常约 1～2 小时）

#### 1.3 申请短信模板

1. 打开 [短信服务控制台](https://dysms.console.aliyun.com/)
2. 进入 **国内消息** → **模板管理**
3. 点击 **添加模板**
4. 填写：
   - **模板类型**：验证码
   - **模板名称**：例如 `登录验证`
   - **模板内容**：`您的验证码是${code}，5分钟内有效。请勿泄露给他人。`
   - **场景说明**：用户登录验证
5. 提交并等待审核
6. 记录 **模板 CODE**（例如 `SMS_12345678`），填入 `ALIYUN_SMS_TEMPLATE_CODE`

### 2. 环境变量

在 `.env` 或部署环境中增加：

```bash
# 启用短信能力
SMS_ENABLED=true

# 阿里云配置
ALIYUN_REGION=cn-hangzhou              # 默认地域
ALIYUN_ACCESS_KEY_ID=your-access-key   # RAM 子账号 AccessKey ID
ALIYUN_ACCESS_KEY_SECRET=your-secret   # RAM 子账号 AccessKey Secret
ALIYUN_SMS_SIGN_NAME=your-sign-name    # 已通过审核的签名名称
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxx    # 已通过审核的模板 CODE

# Supabase Webhook 安全（与 Dashboard 中 Send SMS Hook 的 secret 完全一致，常为 `v1,whsec_...`）
SUPABASE_WEBHOOK_SECRET=v1,whsec_your-base64-secret
```

Supabase 使用 [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks)：`webhook-id`、`webhook-timestamp`、`webhook-signature` 请求头；**不是**旧的 `x-webhook-signature: t=...,v1=...` 格式。

**安全提示：**

- 切勿将密钥提交到 Git
- 建议每 90 天轮换 `ALIYUN_ACCESS_KEY_SECRET`
- 生产与预发环境使用不同的 AccessKey

### 3. Supabase 配置

#### 3.1 启用 Phone 提供商

1. 打开 Supabase Dashboard → Authentication → Providers
2. 启用 **Phone** 提供商
3. 「Twilio Account SID」留空（我们改用 Send SMS Hook）

#### 3.2 配置 Send SMS Hook

1. 在 Supabase Dashboard 中进入 Database → Functions/Triggers（或使用 CLI）
2. 进入 **Auth Hooks**，或通过 Supabase CLI 配置：

```bash
# 使用 Supabase CLI
supabase auth config update --hook-send-sms-url "https://your-api.com/webhooks/sms/send"

# 设置 webhook 密钥（须与 SUPABASE_WEBHOOK_SECRET 一致）
supabase auth config update --hook-send-sms-secret "your-webhook-secret"
```

3. 确认 Hook URL 可从公网访问（由 Supabase 发起 HTTP 调用）

## 测试

### 本地开发

```bash
# 启动服务
bun run dev

# 探测健康检查
curl http://localhost:3000/webhooks/sms/health

# 带合法 Standard Webhooks 签名的冒烟（需配置 SUPABASE_WEBHOOK_SECRET 与 SMS_ENABLED=true）
bun scripts/send-sms-smoke.ts "+8613800138000"
```

### 预发验证

1. 在预发环境启用短信相关配置
2. 在 Supabase 预发项目中配置预发 webhook URL
3. 触发手机号注册流程
4. 确认收到短信且内容符合模板

## 故障排查

### 现象：`phone_provider_disabled` 错误

**原因**：Supabase 中未启用 Phone 提供商。**处理**：在 Supabase Dashboard → Authentication → Providers 中启用 Phone。

### 现象：短信未发出（API 无报错）

**原因**：`SMS_ENABLED=false`，或 webhook 密钥不一致。**检查**：

- 查看服务日志中的 `SMS_ENABLED` 状态
- 确认环境变量中的 `SUPABASE_WEBHOOK_SECRET` 与 Supabase 配置一致

### 现象：`Invalid signature`（401）

**原因**：Standard Webhooks 验签失败。**检查**：

- Railway / `.env` 中的 `SUPABASE_WEBHOOK_SECRET` 与 Supabase Hooks 里复制的 **secret 完全一致**（含 `v1,whsec_` 前缀亦可）
- 请求头是否包含 `webhook-id`、`webhook-timestamp`、`webhook-signature`（由 Supabase 在调用 Hook 时自动携带）
- 服务端与 UTC 时间偏差在数分钟内（库默认约 ±5 分钟）

### 现象：阿里云返回 `isv.BUSINESS_LIMIT_CONTROL`

**原因**：触发流控或日配额上限。**处理**：在阿里云短信控制台查看配额并适当降低发送频率。

### 现象：阿里云返回 `SignatureDoesNotMatch`

**原因**：AccessKey Secret 错误。**处理**：核对 `ALIYUN_ACCESS_KEY_SECRET` 是否与该 AccessKey ID 匹配。

### 现象：模板校验失败

**原因**：模板参数与模板内容不匹配。**处理**：确认控制台中模板占位符与 `code` 等参数一致。

## 运维

### 轮换密钥

1. 在阿里云 RAM 控制台生成新 AccessKey
2. 在部署环境中更新 `ALIYUN_ACCESS_KEY_SECRET`
3. 重启服务
4. 验证短信发送正常
5. 禁用旧 AccessKey

### 监控

建议关注：

- Webhook 响应时间
- 短信发送成功率
- 阿里云 API 错误率
- 队列深度（若实现重试）

### 回滚

若短信服务异常：

1. 将 `SMS_ENABLED=false` 临时关闭 Hook
2. Supabase 将使用已配置的兜底（若有）或失败；行为以当前配置为准
3. 修复问题后重新启用

## 架构

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Supabase Auth │────▶│  Send SMS Hook   │────▶│  Alibaba Cloud   │
│                │     │  /webhooks/sms   │     │     SMS API      │
│                │     │      /send       │     │                  │
└────────────────┘     └──────────────────┘     └──────────────────┘
       │                                               │
       │ Webhook（HTTPS）                              │ 短信网关
       │ 使用密钥签名                                  │
       ▼                                               ▼
  下发手机号与 OTP                                   送达用户手机
```

## 参考链接

- [Supabase Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)
- [阿里云短信 API](https://help.aliyun.com/document_detail/101414.html)
- [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)
