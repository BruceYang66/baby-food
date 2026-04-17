# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

婴儿辅食生成器（baby-food-generator），npm workspaces monorepo，包含三个应用和两个共享包：

- `apps/miniapp` — 微信小程序（UniApp + Vue 3 + TypeScript）
- `apps/admin-web` — 后台管理网页（Vue 3 + Vite，无 UI 组件库）
- `apps/api` — Express API 服务（TypeScript，Prisma + PostgreSQL）
- `packages/shared-types` — 前后端共用的 TypeScript 类型定义
- `packages/ui-tokens` — 设计 token 包

## 开发命令

```bash
# 启动各应用（在项目根目录执行）
npm run dev:miniapp   # 微信小程序，编译到 dist/mp-weixin，用微信开发者工具打开
npm run dev:h5        # H5 网页版，http://localhost:5174（浏览器预览）
npm run dev:admin     # 管理后台，http://localhost:5173
npm run dev:api       # API 服务，http://localhost:3000

# 构建
npm run build:miniapp
npm run build:h5
npm run build:admin
npm run build:api

# API 数据库操作（在 apps/api 目录下执行）
npm run db:init       # 初始化表结构（运行 db/init.sql）
npm run db:seed       # 写入种子数据（运行 db/seed.sql）
npm run db:reset      # 重置并重建（DROP 所有表后 init + seed）
npm run prisma:generate  # 从 schema.prisma 生成 Prisma 客户端
```

## API 配置

API 的环境变量读取自 `apps/api/.env`（注意不是根目录），参考 `apps/api/.env.example`：

```
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/baby_food
JWT_SECRET=<长随机字符串>
WECHAT_APP_ID=<小程序 AppID>
WECHAT_SECRET=<小程序 AppSecret>
```

API 会在启动时检测 JWT_SECRET 和 WECHAT_SECRET 是否为占位符值（含 `replace-` 等字样），若是则拒绝执行相关功能。可访问 `GET /api/health` 和 `GET /api/debug/runtime-config` 检查运行时配置。

## 架构要点

### API 路由分区

`apps/api/src/app.ts` 是路由总入口，路由分两个前缀：
- `/api/app/*` — 小程序端接口，多数需要 `requireAppAuth` 中间件（Bearer JWT）
- `/api/admin/*` — 管理后台接口，目前 admin 认证为 mock（`mock-admin-token`），write 操作大多返回 mock 响应

### 数据层结构

`apps/api/src/data/` 分两个文件：
- `app.ts` — 小程序所有业务查询逻辑，直接使用 Prisma Client
- `admin.ts` — 后台所有查询逻辑

业务逻辑全部在 `data/` 层，`app.ts` 只做请求解析和响应拼装。

### 数据库

使用 Prisma + PostgreSQL。主要模型：`User`、`Baby`（一对一，每个用户目前最多一个宝宝档案）、`Recipe`（有 ContentStatus 和 ReviewStatus 两个枚举状态）、`MealPlan` + `MealPlanItem`、`GuideStage`、`SymptomGuide`。

schema 文件：`apps/api/prisma/schema.prisma`。数据库 SQL 文件在 `apps/api/db/`（init.sql 和 seed.sql）。

### 小程序（UniApp）

使用 UniApp 编译为微信小程序（`-p mp-weixin`），所有页面在 `src/pages.json` 中注册，全部使用 `navigationStyle: custom`（自定义导航栏）。

设计 token 定义在 `apps/miniapp/src/styles/tokens.scss`，以 CSS 变量形式暴露（`--mini-*` 前缀），供所有页面使用，不要在组件内硬编码颜色值。

### 管理后台设计规范

设计规范详见 `.claude/DESIGN-辅食样式设计规范.md`（The Nurtured Grid 系统）。核心原则：
- **禁止用线条分隔区块**，改用背景色层次（`surface` → `surface_container_low` → `surface_container_lowest`）
- 主色 `#005daa`（primary），字体 Manrope（标题）+ Inter（正文）
- 卡片圆角 8px，按钮/输入框圆角 4px

### 共享类型

`packages/shared-types/src/app/index.ts` 定义了前后端共用的所有 TypeScript 接口，包括 `BabyProfile`、`AuthState`、`DailyMealPlan`、`RecipeDetail`、`GuideStage`、`TabooGuide` 等。添加新接口时优先在此处定义。

### CORS

API 允许以下源跨域访问（`apps/api/src/app.ts` 顶部 `allowedOrigins`）：
- `http://localhost:5173` / `http://127.0.0.1:5173` — 管理后台
- `http://localhost:5174` / `http://127.0.0.1:5174` — H5 网页版
