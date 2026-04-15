# 通用身份认证服务架构说明

> 模块边界、技术选型、目录与路由约定。业务规则与验收标准见 `agents/REQUIREMENTS.md`。

## 1. 概览

| 项 | 值 |
| --- | --- |
| 状态 | `draft` |
| 数据库 | Supabase Postgres（认证库 + 应用表） |
| 技术栈 | `bun` · `hono` · `zod` · `Supabase Auth` · `eta`（模板渲染） · `drizzle-orm`（应用表与迁移待接入） |
| 关联文档 | `agents/REQUIREMENTS.md`、`agents/ROADMAP.md` |

| 组件 | 选型 | 用途 |
| --- | --- | --- |
| 运行时 | `bun` | 运行、构建与测试 |
| HTTP | `hono` | 路由与请求处理 |
| 校验 | `zod` | 入参与运行时校验 |
| 认证与平台 | `Supabase` / `Supabase Auth` | 托管登录、会话、数据存储 |
| 模板渲染 | `eta` | 邮件 HTML / 纯文本模板（`src/resources/email/`） |
| 应用层数据 | `drizzle-orm` | 应用表与迁移（对接同一 Postgres，待接入） |
| 测试 | `bun:test` | 单元 / 集成 / E2E |

缓存（如 Redis）等自建基础设施本期不纳入；若引入放 `src/infra/` 下独立子目录。外部 SaaS 服务（Supabase、阿里云等）统一放 `src/providers/`。

## 2. 设计原则

- **Supabase Auth 优先**：认证主链路不 fork 托管实现；策略与错误映射落在 `service` 层。
- **简单高效**：最少重复与嵌套；同类逻辑优先抽成小函数或数据驱动。新增实现前先搜索仓库是否已有同类函数，有则提取到 `lib/` 共享。
- **函数风格**：导出与模块级逻辑用 `const` + 箭头函数，避免 `this` 表达业务语义（显式参数或闭包替代）。路由回调、测试 `test(...)` 等无妨。例外：第三方 API 或框架强制写法，保持最小范围。
- **服务边界**：只做身份认证与登录接入，不承担业务域逻辑；对外文档在 `doc/api`、`doc/mcp`。
- **Provider 内聚**：与第三方相关的所有能力（SDK 客户端、签名计算、webhook 验签等）收敛到 `src/providers/<vendor>/` 下，不散落在 `lib/` 或 `infra/`。

## 3. 分层与模块边界

### 3.1 层次职责

| 层 / 区域 | 职责 |
| --- | --- |
| `<domain>.routes.ts` | 注册路由 + 内联 handler（解析请求、调用 service、组装响应）；**不做** `try/catch`，由 `hono.ts` `app.onError()` 全局兜底 |
| `<domain>.service.ts` | 用例编排：验签、调用 provider、组装结果 |
| `<domain>.helper.ts` | 域内纯辅助（负载提取、URL 生成、错误码映射等）；无 I/O、无编排 |
| `<domain>.schemas.ts` | Zod schema 与导出类型 |
| `<domain>.types.ts` | Hono Context 类型别名等框架相关类型；让 routes 专注业务调用 |
| `<domain>.templates.ts` | 模板渲染逻辑（如邮件模板 action → Eta 文件映射与渲染） |
| `src/providers/` | **纯适配器**：第三方 SDK 客户端 + 发送/调用函数 + 签名/验签 helper + 类型。**按供应商**组织子目录 |
| `src/resources/` | 静态资源文件（邮件模板 `.eta` 等），不含业务逻辑 |
| `src/lib/` | 与业务域和供应商均无关的通用工具（`env`、`health`、`errors`、`logger`） |

> **已废弃层**：`controller.ts`（已合并入 `routes.ts`）、`repository.ts`（由 provider 直接替代）、`src/infra/`（已迁移至 `providers/`）。新代码**不得**再创建这些层。

### 3.2 依赖方向（单向不可逆）

```text
routes → service → providers
           ↘ helpers / templates（同域辅助，无 I/O）
```

**核心约束**：

1. **分层不可绕过**：每个 HTTP 端点必须走 routes handler → service → provider 链路。**不允许**在 route handler 或 provider 内部直接编排多步用例。
2. **跨域引用禁令**：域 A **不得** import 域 B 的内部模块。共用逻辑先提升到 `src/lib/<topic>/`，再由各域分别引入。
3. **`providers/` 不得** import 任何业务域模块；只可引用 `src/lib/`。

### 3.3 `providers/` 边界与组织

Provider **按供应商**分目录（`supabase/`、`ali-cloud/`），而非按能力（~~`sms/`~~、~~`email/`~~）。

`providers/<vendor>/` 内**允许**：

- SDK 客户端封装（`<vendor>.client.ts`、`<vendor>.auth.ts`）
- 发送 / 调用函数（`<vendor>.email.ts`、`<vendor>.sms.ts`）
- 与该供应商绑定的签名/验签 helper（`<vendor>.helper.ts`）
- 类型定义、常量
- `index.ts` 聚合导出（仅暴露业务层需要的函数和类型）

**不允许**：`routes.ts`、`service.ts`、业务编排逻辑、邮件模板内容。第三方 webhook 回调在 `src/<domain>/` 建立独立业务域（如 `webhook/`），由该域 service 调用 provider 发送函数。

### 3.4 `helper.ts` 约定

**业务域 helper**（`src/<domain>/<domain>.helper.ts`）：

- 仅放与本域相关、无副作用的辅助逻辑（负载解析、URL 拼接、错误码映射、DTO 转换等）。
- **不**发起 `fetch` / DB / 外部客户端调用（那是 provider / service）；**不**编排多步用例（那是 service）。
- **不应**被其他业务域 import；跨域复用先提升到 `lib/`。

**Provider helper**（`src/providers/<vendor>/<vendor>.helper.ts`）：

- 放与该供应商绑定的加密/签名/验签等基础能力。
- 例：`ali-cloud.helper.ts` → `calculateHmacSha1`；`supabase.helper.ts` → `verifyStandardWebhookPayload`、`normalizeWebhookSecret`。
- Provider helper 可被同 provider 目录内其他文件和业务域 service 引用。

### 3.5 `src/lib/` 提升标准

仅放与服务身份 / 业务域 / 特定供应商**均无关**的可复用工具（`env`、`health`、`errors`、`logger`）。**不**在 lib 内写死对外展示名或读 `SERVICE_NAME`；`/health` 由 `buildHealthResponse(serviceName)` 组装，`hono.ts` 传入 `env.SERVICE_NAME`。

触发提升条件：某段纯逻辑（无 I/O、无业务语义、不绑定特定供应商）被两个及以上域引用。

> **已迁出**：`lib/crypto/`（→ `providers/ali-cloud/ali-cloud.helper.ts`）、`lib/webhook/`（→ `providers/supabase/supabase.helper.ts`）。这类与特定供应商 API 绑定的工具应归属 provider，而非 lib。

### 3.6 `src/resources/` 静态资源

存放非代码的静态资源文件，按用途分子目录：

```text
src/resources/
  email/                # Eta 邮件模板（*.html.eta / *.text.eta）
```

模板文件仅包含展示内容与 Eta 变量插值（`<%= it.variable %>`），不含业务逻辑。渲染由对应域的 `templates.ts` 负责（如 `webhook.templates.ts`）。

## 4. 文件命名约定

### 4.1 域模块文件

业务域内文件统一采用 `<domain>.<role>.ts` 命名：

```text
src/<domain>/
  <domain>.routes.ts        # 路由注册 + handler
  <domain>.service.ts       # 用例编排
  <domain>.helper.ts        # 纯辅助函数
  <domain>.schemas.ts       # Zod schema + 导出类型
  <domain>.types.ts         # Hono Context 等框架类型
  <domain>.templates.ts     # 模板渲染（按需）
  <domain>.helper.spec.ts   # 对应单元测试
  <domain>.service.spec.ts
  <domain>.schemas.spec.ts
  <domain>.templates.spec.ts
```

### 4.2 Provider 文件

Provider 内文件采用 `<vendor>.<capability>.ts` 命名：

```text
src/providers/<vendor>/
  <vendor>.client.ts        # SDK 客户端初始化
  <vendor>.auth.ts          # 认证相关 API 封装
  <vendor>.email.ts         # 邮件发送
  <vendor>.sms.ts           # 短信发送
  <vendor>.helper.ts        # 签名/验签工具
  <vendor>.helper.spec.ts   # 对应测试
  index.ts                  # 聚合导出
```

### 4.3 禁止的文件名

以下文件名**已废弃**，新代码不得使用：

- `controller.ts`（handler 直接写在 `routes.ts`）
- `repository.ts`（由 provider 替代）
- `*-client.ts`（改用 `<vendor>.<capability>.ts` 格式）
- `hook-handler.ts`（webhook 处理在业务域 service 中）

## 5. 目录结构

```text
agents/                         # 需求、架构、路线图
doc/                            # API / MCP 对外文档
test/
  intg/                         # 集成测试 *.intg.spec.ts
  e2e/                          # E2E *.e2e.spec.ts
  test-env.ts                   # 测试环境预加载
src/
  boot.ts                       # 进程入口：loadEnv → logger → Supabase 校验 → hono → Bun.serve
  hono.ts                       # 根 Hono：app.onError() 全局兜底、挂载域路由、GET /health
  auth/                         # 认证域
    auth.routes.ts              #   路由 + handler
    auth.service.ts             #   密码注册/登录、OTP 校验、邮箱验证
    auth.helper.ts              #   AuthError → AppError 映射
    auth.schemas.ts             #   Zod schema
    auth.types.ts               #   Hono Context 类型
    auth.*.spec.ts              #   单元测试
  webhook/                      # Webhook 域（Supabase Auth Hooks）
    webhook.routes.ts           #   路由 + handler
    webhook.service.ts          #   验签 → 渲染/发送编排
    webhook.helper.ts           #   负载提取、URL 生成
    webhook.templates.ts        #   Eta 邮件模板渲染器
    webhook.types.ts            #   Hono Context 类型
    webhook.*.spec.ts           #   单元测试
  sse/                          # Server-Sent Events
    routes.ts                   #   /sse 路由
  resources/                    # 静态资源
    email/                      #   Eta 邮件模板（*.html.eta / *.text.eta）
  providers/                    # 第三方适配器（按供应商）
    supabase/                   #   Supabase 适配器
      supabase.client.ts        #     惰性 getSupabase() + 启动连通性检查
      supabase.auth.ts          #     Auth API 封装（signUp/signIn/verify）
      supabase.helper.ts        #     Standard Webhooks 签名验证
      supabase.auth.spec.ts
      supabase.helper.spec.ts
      index.ts                  #     聚合导出
    ali-cloud/                  #   阿里云适配器
      ali-cloud.email.ts        #     DirectMail 邮件发送
      ali-cloud.sms.ts          #     短信发送（sendSms / sendOtpSms）
      ali-cloud.helper.ts       #     HMAC-SHA1 签名
      ali-cloud.helper.spec.ts
      index.ts                  #     聚合导出
  lib/                          # 通用工具（与业务域/供应商无关）
    env/                        #   loadEnv → globalThis.__APP_ENV__
    health/                     #   buildHealthResponse(serviceName)
    errors/                     #   通用错误类型与映射
    logger/                     #   Pino 初始化；开发环境 pino-pretty
  user/                         # 占位：未来用户域
```

单元测试与实现同目录（`*.spec.ts`）。`boot.ts`、`hono.ts` 不写单元测试。新增域时复制 `auth/` 或 `webhook/` 的分层方式。

## 6. 路由

### 6.1 挂载规则

所有业务域统一使用 `app.route(boundary.mountPath, createXxxRouter())` 挂载，**不允许**在 `hono.ts` 中用 `app.get()` / `app.post()` 直接注册业务路由（`/health` 等根级端点除外）。每个域在 `<domain>.routes.ts` 中声明 `xxxRouterBoundary = { mountPath: "/xxx" }` 并导出。

### 6.2 Routes 文件结构

`<domain>.routes.ts` 需包含以下三部分，按顺序排列：

1. **`xxxRouterBoundary`** — 挂载路径与职责描述常量
2. **`createXxxRouter()`** — 工厂函数，注册路由并绑定 handler
3. **Handler 函数** — 内联在同文件中的请求处理函数（`const handleXxx = async (context) => { ... }`）

Handler 仅负责解析请求参数和调用 service，**不做**业务编排。错误由 `hono.ts` `app.onError()` 全局兜底（AppError → 业务状态码，其余 → 500）。

### 6.3 端点表

| 路径 | 说明 |
| --- | --- |
| `GET /health` | 根应用直接注册；`service` 字段为 `env.SERVICE_NAME` |
| `POST /auth/users` | 密码凭证注册 `{ email, password }` 或 `{ phone, password }`（互斥） |
| `POST /auth/sessions` | 密码凭证登录 |
| `POST /auth/verifications/phone-otp` | OTP 校验 `{ phone, token, type? }`，`type` 为 `sms`（默认）或 `phone_change` |
| `GET /auth/verifications/email-token` | 邮箱验证回调（`token_hash` + `type` + 可选 `redirect_to`） |
| `POST /webhooks/sms/send` | Supabase Auth Send SMS Hook |
| `POST /webhooks/email/send` | Supabase Auth Send Email Hook |
| `GET /sse/stream` | SSE 推送 |

### 6.4 `/health` 响应字段

- **`processCpuUsagePercent`**（0–100，一位小数）：本进程相邻两次请求间 CPU 占比，相对逻辑核数归一化；首次为自模块加载起。
- **`availableMemory`**（mb/gb）：Linux 优先 `MemAvailable`；macOS `vm_stat` 启发式；其他 `os.freemem()`。

## 7. 代码规范

- 优先函数式、短函数；对外类型与校验统一用 `zod`。
- 业务错误优先 `createAppError` + `isAppError` 工厂与守卫，避免带 `this` 的 `class`。
- 启动等长流程优先「单入口 + 单出口错误处理」（如 `boot.ts` 单一 `try/catch`，失败 `logFatal` + `process.exit(1)`；logger 未就绪回退 `console.error`）。步骤多时改为步骤表或小步函数链。
- 环境变量统一 `import { env } from "@/lib/env"`（Proxy 惰性读取 `globalThis.__APP_ENV__`）。**不使用** `getEnv()` 调用形式。`loadEnv()` 仅在 `boot.ts` 和 `test-env.ts` 中调用一次。
- 错误响应不泄漏栈或密钥；`SUPABASE_*` 仅服务端，**不得**下发浏览器。
- Hono Context 类型别名提取到 `<domain>.types.ts`，避免在 routes 中内联复杂泛型。
- 邮件模板与 provider 解耦：模板文件放 `src/resources/email/`，渲染逻辑放业务域 `templates.ts`，provider 只负责发送。

## 8. 测试

| 类型 | 命令 | 命名 |
| --- | --- | --- |
| 单元 | `bun test src`（`test:unit`） | `src/**/*.spec.ts`，与源码同目录 |
| 集成 | `bun test test/intg`（`test:intg`） | `*.intg.spec.ts` |
| E2E | `bun test test/e2e`（`test:e2e`） | `*.e2e.spec.ts` |

集成测试通过 `import "../test-env.ts"` 统一前置。

**隔离要求**：

- **网络零泄漏**：测试不得发起真实 HTTP 请求。`test-env.ts` mock `globalThis.fetch`，对 Supabase 等外部地址返回预设响应。新增 provider 时同步更新 mock。
- **日志静默**：`test-env.ts` 设置 `LOG_LEVEL ??= "silent"`（`initLogger` 之前）。调试时 `LOG_LEVEL=info bun test`。
- **运行时安全**：模块初始化访问 `globalThis.fetch` 可选属性（如 `preconnect`）需做存在性检查，避免 mock 环境下 `TypeError`。
- **环境变量还原**：测试中修改 `process.env` 的用例需在 `afterEach` 中还原原值，防止环境污染导致后续测试失败。
- **`@deprecated` 清理**：deprecated 的导出须同步移除对应测试。删除模块前确认无导入引用。

## 9. 维护建议

- `boot.ts` 保持瘦：环境 → logger → provider 校验 → 监听；路由装配集中在 `hono.ts`。
- 密码能力受 `AUTH_PASSWORD_ENABLED` 控制（仅 `true` 开启）。环境变量见 `.env.example`。
- `dist/` 由 `bun build` 生成，勿手改；发布以 `package.json` `start` 为准。
- 目录或端点变更时优先更新本文 §5–§6，再视需要更新 `doc/`。
- 新增外部供应商时在 `providers/` 下建 `<vendor>/` 目录，遵循现有命名约定；相关签名/验签工具直接放 `<vendor>.helper.ts`。
- 新增业务域时复制 `auth/` 或 `webhook/` 的分层方式和命名规范。

## 10. 变更记录

| 日期 | 内容 |
| --- | --- |
| 2026-04-15 | **架构重构**：① 废弃 `controller.ts` / `repository.ts` / `src/infra/` 三层，handler 合并入 routes，provider 直接替代 repository，infra 迁入 providers；② provider 按供应商重组（`supabase/`、`ali-cloud/`），取代按能力拆分（`sms/`、`email/`）；③ 供应商相关工具（HMAC 签名、webhook 验签）从 `lib/` 迁入对应 provider helper；④ 文件命名统一为 `<domain>.<role>.ts` / `<vendor>.<capability>.ts`；⑤ Hono Context 类型抽取到 `<domain>.types.ts`；⑥ 邮件模板解耦：Eta 模板文件放 `src/resources/email/`，渲染逻辑放 `webhook.templates.ts`，provider 只负责发送；⑦ 新增 §3.6 资源目录、§4 命名约定、§6.2 routes 结构规范；⑧ 测试新增环境变量还原规则 |
| 2026-04-15 | 文档重组精简；架构规则提炼：分层不可绕过、provider 纯适配器边界、跨域引用禁令、依赖方向、lib 提升标准、路由挂载一致性、测试隔离（网络零泄漏 / 日志静默 / 运行时安全 / deprecated 清理）、env 统一 import |
| 2026-04-04 | 密码凭证路由（`POST /auth/users`、`POST /auth/sessions`）；`/webhooks` 占位；全局错误兜底 `app.onError()`；controller 移除 try/catch；`getSupabase()` 惰性化；`helper.ts` 通用约定（§3.4）；箭头函数优先、`createAppError` / `isAppError`；`boot.ts` 单一 try/catch 与控制流规范；目录树对齐仓库；`/health` 字段语义（CPU / 内存）；`lib/health` 内聚；根路由并入 `hono.ts`；`auth` 路由文件命名 `routes.ts` |
| 2026-03-29 | 认证核心由 Better Auth 调整为 Supabase Auth |
| 2026-03-28 | 文档初始化 |
