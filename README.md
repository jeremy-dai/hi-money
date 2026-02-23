# Hi Money Web - 智能财富管理系统

一个基于 **"I Will Teach You To Be Rich"** 理念（25-15-50-10法则）的交互式财富管理平台，结合 **Supabase** 云端存储与 **三重调度** 保险逻辑，助你科学掌控财务自由。

![Hi Money Banner](./public/og-image.png)

## 💡 核心理念：25-15-50-10 法则

这是一套经过验证的**收入分配框架**，指导你如何分配每一分钱：

- **25% 增长投资 (Growth)** - 让钱为你工作（股票、基金、房地产）
- **15% 稳定基金 (Stability)** - 建立应急储备金 + 保障型保险
- **50% 基本开支 (Essentials)** - 生活必需品（房租、食品、水电）
- **10% 奖励消费 (Rewards)** - 无罪恶感享受生活

---

## ✨ 全新特性 (v2.0)

### 1. 🛡️ 三重工作区架构 (Workspace Modes)
系统采用严格的数据隔离设计，满足不同场景需求：

- **个人模式 (Personal)**: 
  - 您的真实财务数据，通过 Supabase 安全存储于云端。
  - 支持多设备同步，数据持久化。
- **案例模式 (Example)**: 
  - 内置 "职场新人"、"中产家庭"、"高净值企业家" 等典型画像。
  - 只读模式，用于学习不同人生阶段的资产配置策略。
- **沙盒模式 (Sandbox)**: 
  - 基于当前数据或案例创建的临时克隆。
  - **完全隔离**：在沙盒中的任何修改（买入资产、调整预算）都不会影响真实数据。
  - 适合进行 "What-if" 模拟演练（例如：如果我失业了？如果我买了一份大额保险？）。

### 2. ⚡️ 保险三重调度机制 (Triple-Dispatch)
我们重新定义了保险在财务报表中的位置，一份保单同时影响三个维度：

1.  **支出预算 (Expenditure)**: 年交保费计入年度支出预算。
2.  **净资产 (Net Worth)**: 保单的**现金价值**计入 "稳健储蓄" 资产类别。
3.  **抗风险杠杆 (Risk Leverage)**: 保单的**核心保额**计入家庭抗风险能力评估。

### 3. 📊 四大核心模块
- **看板 (Dashboard)**: 全局视图，展示净资产、MA-3支出趋势、抗风险杠杆率。
- **支出 (Spending)**: 追踪月度开支，计算 3个月移动平均 (MA-3) 以平滑波动。
- **资产 (Assets)**: 统一管理投资账户与保险保单，自动计算分类占比。
- **设置 (Settings)**: 切换工作区模式，自定义 25-15-50-10 目标配比。

---

## 🚀 技术栈

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS v4, Framer Motion, Lucide React
- **State Management**: Zustand (with Immer & Persist)
- **Backend / Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Charts**: Recharts
- **Components**: Custom Bento Grid, Floating Nav, Spotlight Effects

## 🔧 快速开始

### 前置要求
你需要一个 [Supabase](https://supabase.com/) 项目，并获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/your-username/hi-money.git

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 Supabase 凭证

# 4. 初始化数据库
# 在 Supabase SQL Editor 中运行 supabase/schema.sql

# 5. 启动开发服务器
npm run dev
```

## 📁 项目结构

```
src/
├── algorithms/       # 核心金融算法 (推荐配比, MA-3计算, 保险调度)
├── components/       # UI 组件库
├── data/             # 预置演示案例数据
├── lib/              # 第三方库初始化 (Supabase)
├── pages/            # 路由页面 (Dashboard, Assets, etc.)
├── services/         # 数据服务层 (API 调用)
├── store/            # Zustand 状态管理 (支持多模式切换)
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request 来改进 Hi Money！

---

**Hi Money** - Master your money, master your life.
