# Hi Money Web - 个人财富管理系统

追踪支出、管理资产配置、分析保险保障的个人财务工具。

## 核心功能

### 1. 支出追踪 (Spending)
按月记录生活支出，通过 **MA-3（3个月移动平均）** 平滑月度波动，识别支出异常趋势。

### 2. 资产配置 (Assets)
将投资账户分为四类桶管理：
- **增长 (Growth)** — 股票、基金、房地产等高风险高收益资产
- **稳健 (Stability)** — 债券等低风险资产（保险现金价值也计入此处）
- **应急 (Emergency)** — 现金、货币基金、活期存款等高流动性资产
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

## 知识库速查 (Knowledge Base)

### 算法 (Algorithms)

#### MA-3 支出平滑 (`spendingAnalytics.ts`)
- 对最近3个月支出取移动平均，用于平滑月度波动
- 告警：若最新月支出 > MA-3 × 1.15，触发"支出偏高"提示
- 前2个月数据不足时 MA-3 显示 `null`

#### 资产配置推荐 (`recommendAllocation.ts`)

**输出**：两层配置比例（均归一化至 100%）
- **收入分配**：每月收入如何切分 → 投资池 / 必需支出 / 奖励享乐
- **投资池内分配**：投资池内部如何切分 → 增长 / 稳健 / 特殊

**算法逻辑**：从基准值出发，依次叠加5个因子的调整量，最后归一化。

基准值：

| 层级 | 增长/投资池 | 稳健/必需 | 特殊/奖励 |
|------|------------|----------|----------|
| 收入分配 | 投资池 45% | 必需 45% | 奖励 10% |
| 投资池内 | 增长 60% | 稳健 25% | 特殊 15% |

各因子对基准值的调整（按重要性排序）：

| 因子 | 重要性 | 触发条件 | 主要调整 |
|------|--------|---------|---------|
| 年龄 | 40% | <30岁 | 增长 +15%，稳健 -10%，特殊 -5%，投资池 +5% |
| 年龄 | 40% | >50岁 | 增长 -20%，稳健 +15%，特殊 +5%，投资池 -5% |
| 子女数 | 30% | 每个孩子 | 必需 +5%，特殊 +2%，增长 -1%，稳健 -1% |
| 城市等级 | 15% | 一线城市 | 必需 +10%，投资池 -8%，奖励 -2% |
| 城市等级 | 15% | 四线城市 | 必需 -5%，投资池 +5% |
| 房贷 | 10% | 月供/收入 >30% | 增长 -5%，稳健 +3%，特殊 +2%，必需 +5% |
| 风险偏好 | 5% | 进取型 | 增长 +10%，稳健 -7%，特殊 -3% |
| 风险偏好 | 5% | 保守型 | 增长 -10%，稳健 +10% |

#### 保险缺口计算 (`insuranceCalculator.ts`)
基于中国市场标准推荐保额：

| 险种 | 推荐标准 |
|------|---------|
| 寿险 | 房贷余额 + 10年收入 + 50万/孩教育金 + 20万养老备用 |
| 重疾险 | <35岁 × 5年收入；≥35岁 × 3年收入 |
| 医疗险 | 一线城市 300万；其他 200万 |
| 意外险 | 7倍年收入 |

- **预算上限**：年收入 × 7.5%
- **家庭分配 6:3:1 原则**：主要收入者 60% / 配偶 30% / 子女 10%

#### 保险三重调度 (`insuranceDispatch.ts`)
每张保单同时作用于三个维度：

```
annualPremium  → 年度支出（预算视图）
cashValue      → 净资产（稳健/增长资产桶）
coverageAmount → 抗风险杠杆（风险覆盖率）
```

- **风险杠杆率** = 总保额 ÷ 年度支出，目标 ≥ 10×
- 现金价值归类：储蓄型 → 稳健；投资型(万能/分红) → 稳健；投联险 → 增长；保障型 → 不计入资产

---

### 险种分类 (Insurance Taxonomy)

```
InsuranceCategory
├── protection（保障型）
│   ├── criticalIllness  重疾险
│   ├── medical          医疗险（百万医疗）
│   ├── accident         意外险
│   ├── termLife         定期寿险
│   └── cancer           癌症险
├── savings（储蓄型）
│   ├── increasingWholeLife  增额终身寿
│   ├── pensionAnnuity       养老年金
│   ├── educationAnnuity     教育金年金
│   ├── endowment            两全险
│   └── wholeLife            终身寿险
└── investment（投资型）
    ├── participating        分红险
    ├── universalLife        万能险
    └── unitLinked           投资连结险（投联险）
```

`isTaxAdvantaged` 标记税优险种（如税优养老险）。

---

### 关键数据类型 (Key Types)

**`UserProfile`** — 用户画像（驱动所有算法）
- 人口学：`age`, `cityTier`(1-4), `maritalStatus`, `hasChildren`, `childrenCount`
- 财务：`monthlyIncome`, `hasMortgage`, `mortgageMonthly`, `existingDebts`
- 目标：`riskTolerance`(conservative/moderate/aggressive), `primaryGoal`, `retirementAge`

**`InsurancePolicy`** — 单张保单
- 三重值：`annualPremium`, `cashValue`, `coverageAmount`
- 分类：`category`, `subCategory`, `isTaxAdvantaged`
- 时间表：`cashValueSchedule`, `premiumSchedule`, `coverageSchedule`（年份→金额数组）

**资产四桶** (`InvestmentCategoryType`)
- `growth` 增长 / `stability` 稳健 / `emergency` 应急 / `special` 特殊

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

## Edge Functions (AI 解析)

### `extract-policies` — 保险单证 AI 解析

调用阿里云 DashScope 从用户粘贴的保险文档文本中提取保单结构化数据，返回符合 `InsurancePolicy` 类型的 JSON 数组。

- 认证：需要有效的 Supabase JWT（用户必须已登录）
- 限流：每用户每天最多 10 次（记录在 `llm_rate_limits` 表）
- 文本上限：100,000 字符

### 部署


```bash
# 1. 登录（首次，浏览器授权）
npx supabase login

# 2. 部署 Edge Function
npx supabase functions deploy extract-policies
```

### Secrets 管理

`DASHSCOPE_API_KEY` 存储为 Supabase Edge Function Secret，运行时通过 `Deno.env.get("DASHSCOPE_API_KEY")` 读取：

```bash
# 查看已配置的 secrets
npx supabase secrets list

# 新增 / 更新
npx supabase secrets set DASHSCOPE_API_KEY=your-key-here
```

也可在 Supabase 控制台操作：**Project Settings → Edge Functions → Secrets**。

---

## Roadmap

- [ ] 更新保险缺口分析与投保建议
- [ ] 更新AI 助手：资产配置建议 + 保险文档解读
- [ ] 定投推荐指标
- [ ] 汇率转换
- [ ] 资产快照时间轴
- [ ] 多语言支持
- [ ] 用户注册
