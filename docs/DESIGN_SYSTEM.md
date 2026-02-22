# Hi Money 设计系统
## 黑金风格 (Luxurious Minimalist Black & Gold) + Aceternity UI

---

## 🎨 设计哲学

Hi Money 采用**"财富与智慧"**的设计理念 - 奢华而不奢侈，简约而不简单。我们结合了现代化的 **Aceternity UI** 组件库，通过微交互和精致的动效，传达专业、成功、值得信赖的品牌形象。

### 核心原则

1.  **奢华简约主义**：干净的布局 + 克制的金色点缀
2.  **动态交互**：使用 Spotlight、Moving Borders 等微动效增强品质感
3.  **数据清晰**：复杂的财务数据用简单优雅的方式呈现
4.  **情感化设计**：让用户为自己的财富增长感到自豪

---

## 🎨 色彩系统

### 主色调：黑色系 (Dark Mode Only)

```css
/* 背景层次 */
--black-primary: #030712;    /* gray-950: 页面主背景 */
--black-elevated: #111827;   /* gray-900: 卡片、浮层 */
--black-soft: #1F2937;       /* gray-800: 二级浮层、悬停状态 */
--black-border: #374151;     /* gray-700: 边框、分割线 */
```

### 强调色：金色系

```css
/* 金色梯度 */
--gold-primary: #F59E0B;     /* amber-500: 主金色 - 数字、强调文字 */
--gold-light: #FEF3C7;       /* amber-100: 浅金色 - 背景高亮 */
--gold-rich: #D97706;        /* amber-600: 深金色 - 悬停状态 */
--gold-deep: #B45309;        /* amber-700: 按下状态 */
```

**金色渐变**：
```css
.bg-gold-gradient {
  background-image: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
}
```

### 投资分类色 (Investment Colors)

- **成长投资 (Growth)**: `#10B981` (emerald-500) - 象征生机与增长
- **稳健储蓄 (Stability)**: `#3B82F6` (blue-500) - 象征信任与稳定
- **特殊用途 (Special)**: `#8B5CF6` (violet-500) - 象征独特与梦想

---

## 📐 字体系统

### 字体家族

```css
/* 无衬线字体 - UI主要字体 */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang SC", "Microsoft YaHei", sans-serif;

/* 等宽字体 - 数字展示 */
--font-mono: "SF Mono", "Menlo", "Monaco", "Consolas",
             "Liberation Mono", monospace;
```

**排版规则**：
- 所有金额 (`¥1,234.56`) 和百分比 (`12.5%`) 必须使用 `font-mono`
- 关键数字使用 `tabular-nums` 以确保对齐

---

## 🔲 组件库 (Aceternity UI 集成)

Hi Money 深度集成了 [Aceternity UI](https://ui.aceternity.com/)，以提供高品质的视觉体验。

### 1. 导航 (Navigation)
- **组件**: `FloatingNav`
- **特性**: 顶部悬浮，智能显隐
- **样式**: 毛玻璃效果 (`backdrop-blur-md`)，金色边框微光

### 2. 卡片 (Cards)
- **通用卡片**: `CardSpotlight`
    - **交互**: 鼠标移动时产生光照效果
    - **场景**: 仪表盘概览、信息展示
- **财富卡片**: `3D Card Effect`
    - **交互**: 鼠标悬停时产生 3D 视差效果
    - **场景**: 投资类别展示 (WealthCard)
- **网格布局**: `BentoGrid`
    - **场景**: 特性介绍、功能入口

### 3. 按钮 (Buttons)
- **主按钮 (Primary)**: `ShimmerButton`
    - **效果**: 边缘流光动画，吸引点击
    - **场景**: "开始使用"、"添加账户"
- **次要按钮 (Secondary)**: `MovingBorder` Button
    - **效果**: 边框粒子流动动画
    - **场景**: "演示模式"、"返回"

### 4. 背景与特效 (Backgrounds & Effects)
- **页面背景**: `BackgroundBeams` (默认) 或 `Spotlight` (强调页)
- **文字特效**: `TextGenerateEffect` (标题逐字显现)
- **列表交互**: `HoverEffect` (列表项悬停高亮)
- **光照效果 (Spotlight)**:
    - **原则**: 在深色背景上避免使用高饱和度颜色（如纯金 #F59E0B）作为大面积光照，以免造成视觉震颤。
    - **规范**: 使用中性色（如 `#262626` 或低透明度白色）作为 Spotlight 颜色，仅通过边框或文字颜色体现品牌金。

---

## 🛠️ 通用组件规范

### ScoreBar (评分条)
用于展示财务健康度评分。
- **绿色 (≥80)**: `bg-emerald-500`
- **黄色 (≥60)**: `bg-amber-500`
- **红色 (<60)**: `bg-red-500`

### GapAlert (缺口警告)
用于提示保险和养老金缺口。
- **样式**: 红色半透明背景 (`bg-red-500/10`) + 红色边框
- **图标**: `AlertTriangle`

### Input (输入框)
- **样式**: `bg-black-soft` + 底部光晕效果 (Aceternity Style)
- **交互**: 聚焦时显示金色光晕

---

## � 布局系统

基于 **PageContainer** 组件的统一布局：
- **Padding**: `pt-28` (顶部留白，避让 FloatingNav)
- **Content Width**: `max-w-7xl` (仪表盘), `max-w-4xl` (表单页)
- **Z-Index**: 内容层 `z-10`，背景层 `z-0`

---

## ⚠️ 开发注意事项

1.  **Dark Mode Only**: 系统仅支持深色模式，所有新组件必须适配黑色背景。
2.  **Z-Index Management**: 由于使用了大量定位背景 (Beams, Spotlight)，务必确保交互元素 (Buttons, Inputs) 拥有更高的 `z-index`。
3.  **Performance**: 动画组件 (Framer Motion) 较多，注意避免在大型列表中过度使用复杂动画。
