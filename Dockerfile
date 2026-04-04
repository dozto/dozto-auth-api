# Railway / 容器部署：Bun 运行时 + 构建产物
# 见 doc/railway-deploy.md

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run build

# 与构建阶段相同镜像，避免 `1-slim` 等标签在各 registry 上不一致
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["bun", "run", "dist/boot.js"]
