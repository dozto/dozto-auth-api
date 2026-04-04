# Railway 部署说明与 Supabase 集成

本文说明如何将 **dozto-auth-api**（Bun + Hono）部署到 [Railway](https://railway.app/)，并在**真实公网 URL**上与 **Supabase**（含 Auth、Send SMS Hook 等）联调。

---

## 1. 前置条件

- Railway 账号（可用 GitHub 登录）。
- 本仓库已包含根目录 **`Dockerfile`**（基于 `oven/bun`），Railway 会按 Docker 构建。
- 本地已能 `bun install` 且 `bun run build` 通过。

---

## 2. 在 Railway 创建项目

1. 打开 [Railway Dashboard](https://railway.app/dashboard) → **New Project**。
2. 选择 **Deploy from GitHub repo**（推荐）或 **Empty Project** 后连接仓库。
3. Railway 检测到 **`Dockerfile`** 后会自动使用 Docker 构建；无需额外 `railway.toml` 即可部署。
4. 部署完成后，在服务的 **Settings → Networking** 中 **Generate Domain**，得到形如 `https://xxx.up.railway.app` 的公网 HTTPS 地址。

> **端口**：应用读取环境变量 **`PORT`**。Railway 会注入 `PORT`，请勿在代码里写死；本项目的 `boot.ts` 使用 `getEnv().PORT`，与 Railway 兼容。

---

## 3. 必配环境变量（Variables）

在 Railway 服务 → **Variables** 中配置（名称与本地 `.env` 一致）。以下为与 Supabase / 业务强相关的项。

### 3.1 运行与 Supabase 客户端（必填）

| 变量 | 说明 |
| --- | --- |
| `NODE_ENV` | 设为 `production`。 |
| `SUPABASE_URL` | Supabase 项目 **Project URL**（`https://xxxx.supabase.co`）。 |
| `SUPABASE_ANON_KEY` | Supabase **anon / public** key（给服务端调用 Auth 等公开端点）。 |
| `PORT` | 通常 **无需手动设置**，Railway 会自动注入；若手动设，需与平台分配端口一致。 |

### 3.2 注册校验与后台能力（强烈建议）

| 变量 | 说明 |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | **Service Role** 密钥（仅服务端、勿暴露给浏览器）。用于注册后校验用户是否真实落库、区分 GoTrue 防枚举假 UUID；见 `auth/verify-signup-user.ts`。 |

### 3.3 密码注册开关

| 变量 | 说明 |
| --- | --- |
| `AUTH_PASSWORD_ENABLED` | 需为字符串 `true` 才开放密码注册；登录不受此开关影响。 |

### 3.4 Send SMS Hook（Supabase → 本服务 → 阿里云）

在 Railway 上启用短信 Hook 时需配置：

| 变量 | 说明 |
| --- | --- |
| `SMS_ENABLED` | `true` 时才会在 Hook 中实际发短信。 |
| `SUPABASE_WEBHOOK_SECRET` | 与 Supabase Auth Hook 里配置的 **Webhook Secret** 一致，用于验签（见 `webhook-verify.ts`）。 |
| `ALIYUN_REGION` | 如 `cn-hangzhou`。 |
| `ALIYUN_ACCESS_KEY_ID` / `ALIYUN_ACCESS_KEY_SECRET` | 阿里云 RAM 密钥。 |
| `ALIYUN_SMS_SIGN_NAME` / `ALIYUN_SMS_TEMPLATE_CODE` | 短信签名与模板代码。 |

### 3.5 其他（可选）

| 变量 | 说明 |
| --- | --- |
| `LOG_LEVEL` | 如 `info`、`warn`。 |
| `SERVICE_NAME` | 健康检查展示名，默认 `dozto-auth-api`。 |

> 启动时会执行 **`verifySupabaseConnection()`**（请求 Supabase `/auth/v1/settings`）。若 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 错误，容器会启动失败，便于及早发现配置问题。

---

## 4. Railway 与 Supabase 的集成关系

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   客户端     │ ─────────────► │  Railway 上的     │
│  (App/Web)   │               │  dozto-auth-api   │
└─────────────┘               └────────┬─────────┘
                                        │
                         anon / service │  server-side only
                                        ▼
                               ┌─────────────────┐
                               │    Supabase      │
                               │  Auth / Database │
                               └────────┬────────┘
                                        │
                         Webhook POST    │  Send SMS Hook
                                        ▼
                               ┌─────────────────┐
                               │ 同上 Railway URL  │
                               │ /webhooks/sms/... │
                               └─────────────────┘
```

### 4.1 本服务调用 Supabase（出站）

- 部署后，Railway 容器使用你配置的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`（及可选 `SUPABASE_SERVICE_ROLE_KEY`）访问 Supabase。
- **无需**在 Supabase 里「登记 Railway IP」——出站访问默认可用。
- 若使用 **Edge Functions** 或 **Database** 直连，按你项目实际再配连接串（本仓库当前以 Auth 客户端为主）。

### 4.2 Supabase 回调本服务（入站）：Send SMS Hook

1. 在 Railway 为服务生成 **HTTPS 域名**（见上文第 2 节）。
2. 打开 Supabase Dashboard → **Authentication** → **Hooks**（或 **Auth Hooks**）→ **Send SMS Hook**。
3. **Hook URL** 填：

   ```text
   https://<你的-railway-域名>/webhooks/sms/send
   ```

4. **Webhook Secret** 与 Railway 环境变量 **`SUPABASE_WEBHOOK_SECRET`** 设为同一字符串。
5. 保存后，用手机 OTP / 手机密码等需要短信的流程触发 Supabase，Supabase 会向上述 URL 发送 POST；本服务在 `providers/sms` 中验签并调用阿里云发短信。

详细操作与排错可参考仓库内 **`doc/sms-runbook.md`**。

### 4.3 客户端应连谁？

- **浏览器 / App** 应只调用 **Railway 暴露的 API 根地址**（例如 `https://xxx.up.railway.app`），由本服务再访问 Supabase；**不要把 Service Role 或数据库直连字符串放进客户端**。
- 若前端直接连 Supabase Realtime/Storage，仍使用 Supabase 控制台里的 **anon key** 与 **URL**，与 Railway 上后端使用的变量一致即可（注意 RLS 策略）。

### 4.4 重定向与 Site URL（按需）

若使用 Magic Link、OAuth 等需要重定向的流，在 Supabase → **Authentication** → **URL Configuration** 中把 **Site URL**、**Redirect URLs** 配成你的前端域名；**后端 API 的 Railway 域名**一般不作为 Supabase「Site URL」，除非文档明确要求。

---

## 5. 部署后自检

1. **健康检查**  
   `GET https://<railway-domain>/health`  
   应返回 JSON，且 `service` 等与配置一致。

2. **认证路由**（若已开启密码能力）  
   `POST https://<railway-domain>/auth/users`、`POST .../auth/sessions` 等按 `agents/ARCHITECTURE.md` 说明测试。

3. **SMS Hook**（若已配置）  
   `GET https://<railway-domain>/webhooks/sms/health`  
   再在 Supabase 侧触发一次需短信的操作，查看 Railway 日志与阿里云发送记录。

---

## 6. 常见问题

| 现象 | 可能原因 |
| --- | --- |
| 构建失败 | 本地执行 `bun run build`；确认 `bun.lock` 已提交。 |
| 启动失败、日志提示 Supabase unreachable | `SUPABASE_URL` / `SUPABASE_ANON_KEY` 错误或网络受限。 |
| Hook 返回 401 | `SUPABASE_WEBHOOK_SECRET` 与 Supabase 不一致，或请求未带签名头。 |
| 注册仍出现假 UUID | 未配置 **`SUPABASE_SERVICE_ROLE_KEY`**，服务端无法做 Admin 校验。 |

---

## 7. 与本地/ngrok 联调的差异

- 本地用 **ngrok** 时，Hook URL 每次可能变化；**Railway 固定域名**更适合长期挂在 Supabase 控制台。
- 同一套环境变量逻辑：**把本地 `.env` 逐项搬到 Railway Variables** 即可，注意不要把 `.env` 提交到 Git。

---

## 8. 参考

- [Railway Docs — Deployments](https://docs.railway.app/guides/deployments)
- [Supabase — Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)
- 本仓库：`doc/sms-runbook.md`、`agents/ARCHITECTURE.md`
