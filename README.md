# Hi Money Web - 个人财富管理系统

追踪支出、管理资产配置、分析保险保障的个人财务工具。

## 核心功能

### 1. 支出追踪 (Spending)
按月记录生活支出，通过 **MA-3（3个月移动平均）** 平滑月度波动，识别支出异常趋势。

### 2. 资产配置 (Assets)
将投资账户分为三类桶管理：
- **增长 (Growth)** — 股票、基金、房地产等高风险高收益资产
- **稳健 (Stability)** — 储蓄、债券等低风险资产（保险现金价值也计入此处）
- **特殊 (Special)** — 教育金、特定目标储蓄

根据用户画像（年龄、家庭结构、城市、房贷、风险偏好）生成个性化配置建议。

> 注：基于用户画像的再平衡建议功能已实现，AI 分析功能待开发。

### 3. 保险管理 (Insurance)
保险保单同时影响三个维度（三重调度）：
1. **支出** — 年交保费计入年度支出预算
2. **净资产** — 保单现金价值计入稳健资产
3. **抗风险杠杆** — 保额用于计算家庭风险覆盖率（目标 10x 年度支出）

> 注：保险缺口分析与投保建议功能待开发。

### 4. 多工作区模式
- **个人模式 (Personal)** — 真实数据，Supabase 云端存储，多端同步
- **案例模式 (Example)** — 内置只读画像（职场新人 / 中产家庭 / 高净值企业家），用于学习参考
- **沙盒模式 (Sandbox)** — 基于任意数据克隆，本地隔离存储，支持 What-if 演练，可导入/导出 JSON

---

## 技术栈

- **Frontend**: React 19, TypeScript, Vite
- **UI**: Tailwind CSS v4, Framer Motion, Lucide React, Recharts
- **State**: Zustand (Immer + Persist)
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

# 3. 初始化数据库
# 在 Supabase SQL Editor 中依次运行:
# - supabase/schema.sql
# - supabase/seed_examples.sql

# 4. 启动
npm run dev
```

## Roadmap

- [ ] 保险缺口分析与投保建议
- [ ] AI 助手：资产配置建议 + 保险文档解读
- [ ] 资产快照时间轴
- [ ] 多语言支持
- [ ] 用户注册
