# 通用身份认证服务架构说明

> 这是一个小而完整的架构说明文档。
> 它回答这个服务为什么这样设计、技术上怎么实现、模块如何拆分、数据如何流动，以及哪些需求约束影响了当前方案。

## 1. 文档元信息

- 文档状态：`draft`
- 服务名称：通用身份认证服务
- 技术栈：`bun` / `hono` / `zod` / `drizzle` / `betterauth`
- 数据库：`PostgreSQL`
- 关联需求：`agents/REQUIREMENTS.md`
- 关联路线图：`agents/ROADMAP.md`

## 2. 为什么这样设计

### 2.1 技术目标

- 用尽可能少的自定义代码完成一个可复用的认证微服务。
- 优先复用 `betterauth` 的现成能力，而不是重新发明认证核心流程。
- 保持接口清晰、模块边界清晰，方便其他系统和 agent 接入。
- 支持多种登录方式接入，同时维持统一用户主体。
- 满足正式登录系统所需的完整账户机制与身份安全要求。

### 2.2 设计目标

- 服务本身只专注身份认证，不承担业务系统的其他业务逻辑。
- 控制层、业务层、数据访问层边界明确，避免逻辑混杂。
- 对外既有标准 API，也有适合 agent 使用的 MCP 文档。
- 邮箱 OTP、手机号 OTP、Google、微信扫码等登录方式尽量复用 Better Auth 官方能力。
- 邮箱和手机号作为本地主要识别信息，Google / 微信先作为独立外部身份接入，再通过显式流程合并。

### 2.3 实现层非目标

- 当前阶段不追求对 `betterauth` 做深度改造。
- 当前阶段不把服务扩展为完整的业务用户中心。
- 当前阶段不单独建设完整的统一 SSO Provider 能力。
- 当前阶段不在文档中展开过于正式的安全、运维、数据边界长文设计。

## 3. 技术上怎么设计

### 3.1 系统定位

该服务是整个后台系统中的一个独立微服务组件，负责统一提供身份认证能力。客户端直接调用它完成认证和 token 获取，其他第三方服务消费这些 token，或者通过该服务完成用户身份校验。

### 3.2 核心技术选型

| 组件 | 选型 | 用途 |
| --- | --- | --- |
| Runtime | `bun` | 运行时与构建基础 |
| HTTP 框架 | `hono` | 提供路由与请求处理能力 |
| 类型与校验 | `zod` | 定义输入输出类型与运行时校验 |
| ORM / SQL 访问 | `drizzle` | 对接 `PostgreSQL` |
| 认证能力 | `betterauth` | 提供尽可能多的现成认证能力 |

### 3.3 总体设计

- `hono` 负责承载 HTTP 接口。
- `controller` 负责请求入口、参数接收和响应输出。
- `service` 负责业务逻辑编排。
- `repository` 是数据库访问的唯一代理。
- `betterauth` 承担认证核心能力。
- `drizzle` 负责和 SQL 数据库交互。
- 数据库存储统一使用 `PostgreSQL`。
- 邮箱 OTP 使用 Better Auth `email-otp` 插件能力。
- 手机验证码登录使用 Better Auth `phone-number` 插件能力。
- Google 登录使用 Better Auth 官方 Google provider。
- 微信登录使用 Better Auth 官方 WeChat provider，当前一期按网页扫码登录方式实现。
- session、refresh token、邮箱验证、忘记密码、修改邮箱、修改手机号等机制优先复用 Better Auth 官方能力。
- 邮箱和手机号是本地主要识别信息。
- Google 和微信首次登录后，先创建独立身份，再通过显式合并流程接入统一用户主体。
- 身份合并既支持用户主动发起，也支持后台或系统流程触发。
- API 文档与 MCP 文档作为对外接口的一部分进行维护。

### 3.4 对外提供的能力

- 面向客户端的认证 API。
- 面向客户端的邮箱验证码、手机号验证码、Google、微信扫码登录能力。
- 面向第三方服务的 token 校验能力。
- 面向系统集成与 agent 的 API / MCP 文档。

### 3.5 Better Auth 与本项目职责边界

#### 3.5.1 Better Auth 直接承担的能力

- 认证基础流程与会话机制。
- 邮箱 OTP 能力。
- 手机号 OTP 能力。
- Google provider 接入。
- WeChat provider 接入。
- session、refresh token、邮箱验证、忘记密码、修改邮箱、修改手机号等官方支持能力。
- 官方要求的数据库 schema 与 migration。

#### 3.5.2 本项目 service 层承担的能力

- 认证相关接口的业务编排与统一出口。
- 邮件发送、短信发送等外部通道接入。
- 用户主体模型设计与维护。
- Google / 微信首次登录后的独立身份创建。
- 身份合并流程、冲突覆盖策略与“当前身份有效”校验。
- 第三方服务 token 校验接口的封装。
- API 文档与 MCP 文档的整理与输出。
- 与本项目业务边界相关的日志、错误定义与可观测性接入。

#### 3.5.3 实现原则

- 不修改 `Better Auth` 源码。
- 不修改官方插件源码。
- 认证能力优先直接使用官方插件或 provider。
- 允许使用 `Better Auth` 官方 migration 修改数据库结构。
- 所有项目自定义规则，优先放在本项目 `service` 层，而不是侵入认证底层。

## 4. 模块怎么拆

### 4.1 推荐目录结构

```text
src/
  index.ts
  boot.ts
  test/
    unit/
      *.spec.ts
    intg/
      *.intg.ts
  auth/
    router.ts
    controller.ts
    service.ts
    repository.ts
    helper.ts
    schemas.ts
  user/
    router.ts
    controller.ts
    service.ts
    repository.ts
    helper.ts
    schemas.ts
  docs/
    api.ts
    mcp.ts
  _infra/
    db/
    auth/
  _util/
    logger/
    errors/
```

### 4.2 模块职责

| 目录 / 文件 | 职责 |
| --- | --- |
| `src/index.ts` | 服务入口 |
| `src/boot.ts` | 启动装配、依赖初始化 |
| `src/test/` | 测试根目录，包含 `unit/` 与 `intg/` 两类测试 |
| `src/auth/` | 认证相关业务逻辑 |
| `src/user/` | 用户相关认证逻辑 |
| `src/docs/` | API 文档与 MCP 文档输出 |
| `src/_infra/` | 基础设施封装，不包含业务逻辑 |
| `src/_util/` | 通用能力封装，不包含业务逻辑 |

### 4.3 业务模块内部约定

- `router`：路由注册与路由组织。
- `controller`：处理请求路径、参数与响应。
- `service`：封装业务逻辑。
- `repository`：数据库操作的唯一代理封装。
- `helper`：业务通用辅助逻辑。
- `schemas`：使用 `zod` 定义输入输出结构与类型来源。

建议按“业务域在外、职责分层在内”的方式组织，目录可以参考：

```text
src/
  test/
    unit/
      auth.service.spec.ts
    intg/
      auth-login.intg.ts
  auth/
    router.ts
    controller.ts
    service.ts
    repository.ts
    helper.ts
    schemas.ts
    email-otp/
    phone-otp/
    google/
    wechat/
    session/
    token/
    identity-link/
  user/
    router.ts
    controller.ts
    service.ts
    repository.ts
    helper.ts
    schemas.ts
```

其中：

- `test/` 统一存放测试文件，不把测试分散到各业务目录中。
- `test/unit/` 存放单元测试，文件名以 `.spec.ts` 结尾。
- `test/intg/` 存放集成测试，文件名以 `.intg.ts` 结尾。
- `auth/` 负责认证方式、token、session、身份合并等认证核心逻辑。
- `user/` 负责用户主体、用户资料及与认证相关的用户侧逻辑。
- 若某一能力逐渐变复杂，再在对应域下拆分子目录，而不是一开始把所有能力平铺到 `src/` 根下。

### 4.4 目录边界规则

- 数据操作必须通过 `repository`，不能在 `service` 或 `controller` 里直接访问数据库。
- `service` 只编排业务逻辑，不直接承担路由职责。
- `controller` 不写业务核心逻辑，只做请求处理与调用协调。
- `_infra` 和 `_util` 不能包含业务逻辑，应保持可在其他项目复用。
- `auth` 与 `user` 是业务域目录，优先按业务域组织，而不是按纯技术层级平铺整个 `src`。
- 单元测试统一放在 `src/test/unit/`，文件名以 `.spec.ts` 结尾。
- 集成测试统一放在 `src/test/intg/`，文件名以 `.intg.ts` 结尾。
- 单元测试和集成测试统一使用 `bun test` 执行，通过 `package.json` 脚本入口调用。
- `test:unit` 直接执行 `src/test/unit/**/*.spec.ts`。
- `test:intg` 直接执行 `src/test/intg/**/*.intg.ts`。
- 如果对应目录下没有测试文件，命令直接报错，不做静默跳过。
- 统一提供 `test:unit`、`test:intg` 和 `test` 三个脚本命令。

### 4.5 代码实现规范

- 项目自有实现优先使用函数式写法。
- 优先使用简短、高效、直接表达意图的代码，避免为了形式统一引入不必要的层级和样板。
- 只有在确实需要多态或复用时才使用类。
- 所有类型定义优先通过 `zod` 统一声明。
- 第三方库使用遵循第三方库自身最佳实践，不强行套统一抽象。
- 日志和错误类型必须明确，但具体字段与错误码细节后续补充。
- 与身份安全相关的核心流程应优先使用明确、可审计的函数式编排，避免隐式副作用。
- 如果某段简短实现背后承载了复杂业务规则，应通过简洁注释说明这段代码解决了哪些业务功能或约束，而不是只解释表面代码动作。

### 4.6 建议数据模型

推荐先按“用户主体”和“身份凭据”分离建模：

| 表 / 实体 | 作用 |
| --- | --- |
| `users` | 统一用户主体主表，使用内部 `userId` 作为稳定主键 |
| `user_emails` | 维护邮箱信息、验证状态与唯一约束 |
| `user_phones` | 维护手机号信息、验证状态与唯一约束 |
| `user_identities` | 维护外部身份，如 `google`、`wechat`，记录 provider、providerUserId、关联的 `userId` |

补充说明：

- 邮箱和手机号是本地主要识别信息，但不直接代替内部主键。
- Google / 微信首次登录时，可以先创建独立的 `userId` 和对应 `user_identities` 记录。
- 后续发生显式合并时，再把多个身份记录收敛到同一个用户主体。

## 5. 数据怎么流动

### 5.1 客户端认证流程

1. 客户端调用 `auth` 相关接口。
2. `router` 将请求分发到对应 `controller`。
3. `controller` 使用 `zod` 做输入校验，并调用 `service`。
4. `service` 按登录方式调用对应的 Better Auth 能力，例如 Email OTP、Phone Number、Google 或 WeChat provider。
5. 若是邮箱或手机号登录，允许按规则自动创建用户主体。
6. 若是 Google 或微信首次登录，先创建独立身份记录与对应用户主体。
7. 后续在用户显式操作时，再执行身份合并流程。
8. 需要 session、refresh token 或其他账户机制时，按 Better Auth 能力完成状态建立与更新。
9. 需要持久化时，通过 `repository` 使用 `drizzle` 访问 `PostgreSQL`。
10. 返回认证结果、token 或错误信息给客户端。

### 5.2 第三方服务身份校验流程

1. 用户携带认证服务签发的 token 访问第三方服务。
2. 第三方服务可以自行完成 token 校验，或调用 auth 服务进行校验。
3. auth 服务返回身份校验结果，供第三方服务继续完成自己的业务处理。

### 5.3 用户主体归并流程

1. 用户通过邮箱、手机号、Google 或微信任一方式完成登录。
2. 系统内部始终以 `userId` 作为用户主体主键。
3. 邮箱和手机号作为本地主要识别信息，用于登录、验证与后续账户管理。
4. Google 或微信首次登录时，先创建独立身份与独立用户主体。
5. 当用户后续主动发起，或后台 / 系统流程触发合并时，系统先校验当前身份有效性。
6. 若发生身份冲突，默认允许覆盖，但前提是当前身份校验通过，例如具备当前登录方式返回的有效 token。
7. 合并成功后，将多个身份记录关联到同一个最终用户主体。

### 5.4 文档输出流程

1. 服务对外维护标准 API 文档。
2. 服务同时维护适合 agent 使用的 MCP 文档。
3. 其他系统与 agent 根据这些文档进行接入，而不是依赖源码细节。

## 6. 哪些需求约束影响了技术方案

### 6.1 关键约束

- 必须使用 `bun`、`hono`、`zod`、`drizzle`、`betterauth`。
- 身份认证能力应优先复用 `betterauth`，尽量少改或不改。
- 服务定位是通用认证微服务，不是业务系统本体。
- 必须为其他系统和 agent 提供 API / MCP 文档。
- repository 必须作为数据库访问唯一入口。
- 邮箱和手机号验证码首次登录允许自动创建账号。
- 邮箱和手机号是本地主要识别信息。
- Google 和微信首次登录先创建独立身份，后续再合并。
- 合并支持用户主动触发与后台 / 系统触发。
- 冲突默认允许覆盖，但必须先验证当前身份有效。
- 微信登录当前一期只按网页扫码登录范围设计。
- 不在本期单独实现完整的 SSO Provider 能力。
- 必须支持完整账户机制，包括 session、refresh token、邮箱验证、忘记密码、修改邮箱、修改手机号。

### 6.2 需求到设计的映射

| 需求 | 架构响应 |
| --- | --- |
| 通用身份认证服务 | 独立微服务、独立入口、独立模块边界 |
| 尽量复用 betterauth | 认证能力以 `betterauth` 为核心，不自研替代 |
| PostgreSQL 存储 | 使用 `drizzle` + `PostgreSQL` |
| 邮件 / 手机验证码登录 | 使用 Better Auth OTP 插件能力 |
| Google / 微信登录 | 使用 Better Auth social providers |
| 统一用户主体 | 以内部 `userId` 作为主体主键 |
| 邮箱 / 手机号本地识别 | 作为本地主要识别信息单独建模 |
| Google / 微信独立接入 | 首次登录先创建独立身份，后续通过显式流程合并 |
| 合并触发方式 | 同时支持用户主动触发与后台 / 系统触发 |
| 冲突处理 | 在确认当前身份有效后允许覆盖 |
| 完整账户机制 | 启用 session、refresh token、邮箱验证、忘记密码、改邮箱、改手机号 |
| 给客户端和第三方服务使用 | 设计标准 HTTP API 与校验流程 |
| 给其他系统 / agent 使用 | 独立维护 API / MCP 文档 |

### 6.3 测试与验收映射原则

- Task 对应的测试应能映射回 Story 的验收标准。
- 接口、认证流程、第三方校验流程应具备可验证路径。
- 文档输出本身也属于可验收结果的一部分。

## 7. 待确认问题

- 第三方服务“自行校验 token”的标准方式如何定义。
- 完整账户机制是否全部一期落地，还是按优先级拆分到多个 Epic。
- API 文档与 MCP 文档最终以什么形式输出。
- `user` 模块是否只承载认证相关用户逻辑，还是还会包含基础资料能力。

## 8. 变更记录

| 日期 | 变更内容 | 说明 |
| --- | --- | --- |
| 2026-03-28 | 重写初始化文档 | 根据当前项目定位补全有效架构说明 |
