# AI PM 灵感空间

你的 AI 产品搭档，让每一个想法精准落地。

融合 Agent 对话、竞品追踪、文档协作、灵感速记与 Prompt 模板，为产品经理打造完整的思考与交付闭环。

## 功能模块

| 模块 | 说明 |
|------|------|
| **AI Agent** | 基于 DeepSeek 的智能对话助手，支持 PRD 生成、需求分析、竞品研究等 PM 核心工作场景 |
| **文档中心** | PRD、会议纪要、技术方案、复盘报告统一管理，Markdown 编辑 + AI 辅助写作 |
| **灵感速记** | 快速捕获产品灵感碎片，支持分类、标签、搜索，一键发送到 Agent 深度加工 |
| **竞品雷达** | 按项目追踪竞品动态，AI 自动分析功能矩阵，行业笔记统一管理 |
| **Prompt 库** | 内置 PM 专业模板 + 自定义 Prompt，覆盖需求、竞品、数据等场景，一键复用提效 |

## 技术栈

- **框架**: Next.js 16 (App Router, Turbopack)
- **语言**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **AI**: DeepSeek API (兼容 OpenAI SDK)
- **数据库**: Supabase (PostgreSQL)
- **状态管理**: Zustand
- **PWA**: @ducanh2912/next-pwa

## 本地开发配置

### 前置要求

- Node.js >= 18
- npm

### 1. 克隆项目

```bash
git clone https://github.com/EllsieGao/AI-PM-Workspace.git
cd AI-PM-Workspace
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → Settings → API |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | [platform.deepseek.com](https://platform.deepseek.com) |

### 4. 初始化数据库

在 Supabase SQL Editor 中运行 `supabase/migrations/006_complete_setup.sql` 和 `supabase/migrations/007_radar.sql`。

### 5. 启动

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/        # 主应用布局
│   │   ├── agent/          # AI Agent
│   │   ├── design/         # 竞品雷达（路由）
│   │   ├── docs/           # 文档中心
│   │   ├── memos/          # 灵感速记
│   │   └── prompts/        # Prompt 库
│   ├── api/                # AI 对话等 API 路由
│   └── navigation/         # 封面导航页
├── components/
│   ├── agent/              # Agent 对话组件
│   ├── docs/               # 文档编辑器组件
│   ├── memos/              # 灵感速记组件
│   ├── prompts/            # Prompt 库组件
│   ├── radar/              # 竞品雷达组件
│   ├── layout/             # 布局组件（导航栏）
│   ├── shared/             # Markdown 渲染等共用组件
│   └── ui/                 # 按钮、输入框、弹窗等基础组件
├── store/                  # Zustand 状态管理
└── lib/                    # 工具函数 & 类型定义
```

## 安全说明

- 所有 API Key 通过 `.env.local` 管理，已加入 `.gitignore`
- 如泄露 API Key，请立即在对应平台撤销并重新生成

## License

MIT
