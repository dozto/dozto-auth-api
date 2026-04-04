# 通用身份认证服务架构说明

> 模块边界、技术选型、目录与路由约定。**产品范围、验收标准与业务规则**以 `agents/REQUIREMENTS.md` 为准，本文不重复展开。

## 1. 元信息

- 状态：`draft`；数据库：`Supabase Postgres`（认证库 + 应用表）
- 技术栈：`bun` / `hono` / `zod` / `Supabase` / `drizzle-orm`（ORM 已依赖；**应用表与迁移**可在 `infra/db` 落地后接入）
- 关联：`agents/REQUIREMENTS.md`、`agents/ROADMAP.md`

## 2. 设计原则

- **函数风格**：可调用单元优先用 **`const fn = () => {}` / `const fn = async () => {}`**（箭头函数），避免 `function` 声明；路由内联回调、测试 `test(...)` 等无妨。**避免用 `this` 表达业务语义**；若需实例语义，用显式参数或闭包。例外：第三方 API（如 `Proxy` handler、`Error` 子类）或框架强制写法，在实现处保持最小范围。
- **简单高效**：优先最少重复与嵌套；能用一个控制流表达的不拆多层（例如 `boot.ts` 用**单一** `try/catch`，失败时 `logFatal` 集中记录并 `process.exit(1)`；若 logger 尚未就绪则回退 `console.error`）。出现同类重复时，优先抽成**小函数**或**数据驱动**，而不是复制粘贴。
- **Supabase Auth 优先**：认证主链路不 fork 托管实现；策略与错误映射落在 `service` / facade。
- **分层**：`controller` → `service` → `repository`（业务模块内**唯一**持久化 / 外部网关入口）；`infra` 无业务规则；`providers` 预留作**非 Supabase 主链路**的第三方边界（与 `infra` 区分见 §4.5）。`controller` 内不做 `try/catch`，由 `hono.ts` 的 `app.onError()` 全局兜底（AppError 返回业务状态码，其他返回 500 并写日志）。
- **服务边界**：只做身份认证与登录接入，不承担业务域逻辑；对外 HTTP，文档在仓库 `doc/api`、`doc/mcp`。
- **`src/lib/`**：仅可复用、**与具体服务身份/业务域无关**的工具（如 `env`、`health`、`errors`）。**不**在 lib 内写死对外展示名或读 `SERVICE_NAME`；`/health` 由 `buildHealthResponse(serviceName)` 组装，**`service` 由 `hono.ts`** 传入 `getEnv().SERVICE_NAME`。

## 3. 技术选型与分层

| 组件 | 选型 | 用途 |
| --- | --- | --- |
| 运行时 | `bun` | 运行、构建与测试 |
| HTTP | `hono` | 路由与请求处理 |
| 校验 | `zod` | 入参与运行时校验 |
| 认证与平台 | `Supabase` / `Supabase Auth` | 托管登录、会话、数据存储 |
| 应用层数据 | `drizzle-orm` | 应用表与迁移（对接同一 Postgres，待接入） |
| 测试 | `bun:test` | 单元 / 集成 / E2E |

缓存（如 Redis）本期不纳入；若引入，放在 `src/infra/` 下独立子目录。

| 层次 / 区域 | 职责 |
| --- | --- |
| `routes`（根与域内） | 注册路由，HTTP → `controller` |
| `controller` | 解析请求、调用 `service`、组装响应 |
| `service` | 用例与编排 |
| `repository` | 本模块内数据与外部网关**唯一**入口 |
| `helper`（**每个业务域**可有 `helper.ts`） | **纯辅助、无 I/O**：错误码映射、第三方 DTO → 对外响应形状、可复用的小转换；**不**承担持久化 / 外部网关调用（仍在 `repository`）；**不**承担用例编排（仍在 `service`）。同一域内辅助函数优先收拢到该文件，避免散落多个 `*-mapper.ts` / `*-util.ts` 除非体量过大再拆分。 |
| `src/infra/` | DB 连接、Supabase 客户端等，无业务规则 |
| `src/providers/` | **预留**：非主链路的第三方封装，按能力分子目录 |
| `src/lib/` | 与业务、**服务身份**无关的通用工具 |

## 4. 目录与路由

### 4.1 仓库根目录（节选）

```text
agents/                 # 需求、架构、路线图、故事/任务模板（见 agents/AGENTS.md）
doc/                    # API / MCP 对外文档占位（doc/api、doc/mcp）
test/
  intg/                 # 集成测试 *.intg.spec.ts
  e2e/                  # E2E *.e2e.spec.ts
  test-env.ts           # 测试环境加载（如 import 于 intg）
src/                    # 应用源码（见 4.2）
```

### 4.2 `src/` 当前结构

```text
src/
  boot.ts               # 进程入口：单一 try/catch；loadEnv → logger → Supabase 校验 → hono → Bun.serve；不要求单元测试
  hono.ts               # 根 Hono：app.onError() 全局兜底、挂载域路由、GET /health（组合 getEnv() 与 lib/health）
  auth/                 # 认证域：routes / controller / service / repository / helper.ts（域内辅助）/ schemas
  sse/                  # Server-Sent Events：routes.ts（挂载于 /sse）
  infra/
    supabase/           # client.ts（惰性 getSupabase()）、verify.ts（boot 在监听前执行连通性检查）
    db/                 # 占位（.gitkeep）：Drizzle / SQL 连接与迁移落地处
  lib/
    env/                # loadEnv → globalThis.__APP_ENV__；业务用 getEnv()
    health/             # buildHealthResponse(serviceName)，同步组装 /health JSON
    errors/             # 通用错误类型与映射辅助
    logger/             # `index.ts`：Pino 初始化；`getLogger()` / `logger`；开发环境 `pino-pretty`
  providers/            # 占位（.gitkeep）：非 Supabase 主链路的第三方适配
  user/                 # 占位（.gitkeep）：未来用户域扩展示例
```

**单元测试**：与实现同目录的 `*.spec.ts`（`bun test src`，见 §5）。**不写** `boot.ts`、`hono.ts` 的单测。

### 4.2.1 业务域内的 `helper.ts`（通用约定）

- **位置**：`src/<domain>/helper.ts`（如 `auth/helper.ts`）。**每个业务域**按需引入；无辅助逻辑时可不建该文件。
- **内容**：仅放**与本域相关**、**无副作用**的辅助逻辑（`AuthError` → `AppError`、Supabase `Session`/`User` → 对外 JSON 形状等）。可导出多个命名导出（`mapAuthError`、`mapSessionResponse` 等）。
- **边界**：**不**在此文件发起 `fetch`、数据库或 Supabase 客户端调用——那是 `repository` / `infra`；**不**在此写 HTTP 或编排多步用例——那是 `controller` / `service`。
- **与 `src/lib/` 的区别**：`lib` 与具体业务域**无关**；`helper` **可以**依赖本域 `schemas`、本域对外契约，但**不应**被其它业务域 import（跨域复用先抽到 `lib` 或共享子模块再讨论）。

### 4.3 路由与挂载点

| 路径 | 说明 |
| --- | --- |
| `GET /health` | 根应用直接注册；响应中的 `service` 为 `getEnv().SERVICE_NAME` |
| `/auth/*` | `auth/routes.ts`：`createAuthRouter()`，挂载前缀 `/auth` |
| `POST /auth/users` | 密码凭证**注册**；JSON 为 `{ email, password }` 或 `{ phone, password }`（互斥，见 `passwordCredentialBodySchema`） |
| `POST /auth/sessions` | 密码凭证**登录**（建立会话）；请求体形状同 `POST /auth/users` |
| `/sse/*` | `sse/routes.ts`：`createSseRouter()`，挂载前缀 `/sse`（如 `GET /sse/stream`） |
| `/webhooks/*` | `providers/sms/routes.ts` 等：第三方回调（如 Send SMS Hook） |

域内仍遵循：`routes` → `controller` → `service` → `repository`；**`helper`** 仅被同域模块引用（如 `repository` 调错误映射、`service` 调响应形状映射），**不**替代 `repository` 的网关入口职责。详见 §4.2.1。

### 4.4 `/health` 与可观测性（摘要）

`HealthResponseBody.system` 当前约定：

- **`processCpuUsagePercent`**（0–100，一位小数）：**本进程**在相邻两次 `/health` 请求之间的 CPU 占比，相对逻辑核数归一化（`process.cpuUsage()`）；首次请求区间为自本模块加载起。**非整机**占用。
- **`availableMemory`**（`mb` / `gb`）：**可用内存**估算——Linux 优先 `/proc/meminfo` 的 `MemAvailable`；macOS 用 `vm_stat` 启发式；其它平台 `os.freemem()`。

### 4.5 `infra` 与 `providers` 的分工（优化指引）

| 目录 | 何时放代码 |
| --- | --- |
| `infra/supabase` | 与 Supabase 项目绑定的客户端、启动探活 |
| `infra/db` | Drizzle schema、迁移、与 Postgres 的直接连接（与业务域解耦的「线」） |
| `providers/*` | OAuth 厂商 SDK、短信网关等**可替换**的第三方；避免与 `repository` 重复：由 `repository` 调用 `providers` 或 `infra` |

新增域时：复制 `auth/` 的拆分方式（`routes.ts` + 分层），或按业务拆子目录；**勿**在 `lib/` 中堆积业务逻辑。

## 5. 测试约定

与 `package.json` 脚本一致：

| 类型 | 命令 / 位置 | 命名 |
| --- | --- | --- |
| 单元 | `bun test src`（`test:unit`） | `src/**/**.spec.ts`，与源码同目录 |
| 集成 | `bun test test/intg`（`test:intg`） | `*.intg.spec.ts`（文件名须含 `.spec` 以便 Bun 发现） |
| E2E | `bun test test/e2e`（`test:e2e`） | `*.e2e.spec.ts` |

集成测试可 `import "../test-env.ts"` 等统一前置。`boot.ts`、`hono.ts` 不写单元测试。

## 6. 数据流（摘要）

请求 → 根 `hono` 应用 → 域 `routes.ts` → `controller`（`zod`）→ `service` → `repository` → `Supabase` / 存储。第三方校验 token、身份归并、多方式登录的细化流程见 `REQUIREMENTS.md` 与实现代码。

经本服务封装 Supabase，不向客户端暴露项目密钥；密码能力受 `AUTH_PASSWORD_ENABLED` 控制（仅字符串 `true` 开启）。环境变量见 `.env.example`；`SUPABASE_*` 仅服务端，**不得**下发给浏览器。

## 7. 代码规范（摘要）

- 优先函数式、短函数；对外类型与校验统一用 `zod`。
- **声明形式**：与 §2「函数风格」一致——导出/模块级逻辑用 `const` + 箭头函数；业务错误优先 **`createAppError` + `isAppError`** 等工厂与类型守卫，避免带 `this` 的 `class`，除非与外部库契约冲突。
- **控制流**：启动、批处理等长流程优先「单入口 + 单出口错误处理」，避免层层 `try/catch`；若步骤增多，可改为**步骤表**（数组 + 循环）或**小步函数**链，仍保持一处失败处理。
- 安全相关路径可审计；错误响应稳定，不向客户端泄漏栈或密钥。

## 8. 架构演进与维护建议

- **入口保持瘦**：`boot.ts` 只做环境、logger、关键 infra 校验与监听；路由装配集中在 `hono.ts`；启动失败在**一处**记录步骤与原因并退出。
- **占位目录**：`infra/db`、`providers`、`user` 等仅 `.gitkeep` 时表示「规划位置」；落地代码时删除空占位说明并补测试。
- **健康检查**：依赖周期性请求时 `processCpuUsagePercent` 才有短窗口意义；单机首次命中偏「自启动以来平均」。
- **构建产物**：`dist/` 由 `bun build` 生成，勿手改；发布以 `package.json` 的 `start` 为准。
- **文档同步**：目录或全局端点变更时，优先更新本文 §4，再视需要更新 `doc/`。

## 9. 变更记录

| 日期 | 内容 |
| --- | --- |
| 2026-04-04 | 密码凭证对外路径：`POST /auth/users`（注册）、`POST /auth/sessions`（登录）；§4.3 补充 `/webhooks`；请求体 `passwordCredentialBodySchema`（邮箱或手机号 + 密码，互斥） |
| 2026-04-04 | 架构优化：`boot.ts` logger-not-ready 回退 `console.error`；`hono.ts` 新增 `app.onError()` 全局错误兜底；`controller` 移除 try/catch 依赖全局处理；`infra/supabase/client.ts` 改为惰性 `getSupabase()`；`service` 提取 `assertPasswordEnabled` 到 `helper`；`AuthPasswordJSONContext` 移至 `controller` 私有类型；`health` macOS `vm_stat` 结果缓存 5s；补测试覆盖 `helper`、`service`、`errors` |
| 2026-04-04 | `session-mapper` 并入 `auth/helper.ts`；新增 §4.2.1：各业务域可有 `helper.ts` 的通用约定 |
| 2026-04-04 | `auth/helper.ts`：`AuthError` → `AppError` 映射；§3/§4.2/§4.3 说明域内 `helper` 与 `repository` 边界 |
| 2026-04-04 | §2/§7：箭头函数优先、避免业务 `this`；`AppError` 改为 `createAppError` / `isAppError` |
| 2026-04-04 | §2「简单高效」、§7 控制流；`boot.ts` 单一 `try/catch`；§4.2 更新 `lib/logger` 为已实现 |
| 2026-04-04 | 整理 §4 与仓库一致：根目录、`src` 全树、占位目录说明；补充 `/health` 字段语义、`infra`/`providers` 分工；测试约定对齐 `package.json`；新增 §8 维护建议 |
| 2026-04-04 | `/health`：进程 CPU（`processCpuUsagePercent`）与可用内存（`availableMemory`）；`buildHealthResponse` 同步 |
| 2026-04-04 | `lib/health` 单文件：`buildHealthResponse` 内聚 |
| 2026-04-04 | 根路由并入 `hono.ts`，删除独立 `router.ts` |
| 2026-04-04 | `boot.ts`：`loadEnv`、Supabase 校验、`Bun.serve`；env 写入 `globalThis.__APP_ENV__` |
| 2026-04-04 | `auth` 域路由文件命名为 `routes.ts` |
| 2026-03-29 | 认证核心由 Better Auth 调整为 Supabase Auth |
| 2026-03-28 | 文档初始化 |
