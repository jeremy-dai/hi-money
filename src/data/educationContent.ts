import type { CategoryType } from '../types';

export interface Step {
  title: string;
  description: string;
  type?: 'risk-ladder' | 'flow' | 'list' | 'questions';
  questions?: Array<{ icon: string; text: string }>;
}

export interface CategoryContent {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  intro: string;
  steps: Step[];
}

export const educationContent: Record<CategoryType, CategoryContent> = {
  growth: {
    title: '增长投资，让你的25%为你工作',
    subtitle: '财富增长的核心引擎',
    icon: '📈',
    bgColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    intro: '这是你财富增长的核心引擎。通过持续投资，让复利的力量帮你走向财务自由。越早开始，复利的威力越大。',
    steps: [
      {
        title: 'Step 1: 选择你的增长型资产',
        description:
          '不同资产有不同的风险和回报。从低风险的指数基金开始，逐步探索其他选项。',
        type: 'risk-ladder',
      },
      {
        title: 'Step 2: 设置税收优惠账户',
        description:
          '利用税收优惠账户能显著加速财富增长：\n• 中国：企业年金、个人养老金\n• 美国：Roth IRA、401k\n• 英国：ISA账户\n\n这些账户能让你的投资增长免税或延税。',
      },
      {
        title: 'Step 3: 开始投资',
        description:
          '设置自动转账，每月工资到账时立即投资25%。推荐三基金组合：\n• 国内股票指数基金\n• 国际股票指数基金\n• 债券基金\n\n不要试图择时，定期投资最重要。',
        type: 'flow',
      },
    ],
  },
  stability: {
    title: '稳定基金，你的15%安全网',
    subtitle: '让你在危机中保持冷静',
    icon: '🛡️',
    bgColor: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    intro: '这是你的安全网。当意外发生时，它让你不必动用投资或欠债。目标是存够5个月的基本开支。',
    steps: [
      {
        title: 'Step 1: 计算你的稳定基金',
        description:
          '列出每月核心开支（房租、食品、水电、交通）然后乘以5。\n\n例如：月开支¥3000 × 5 = ¥15000稳定基金\n\n这个数字看似很大，但通过每月存15%，你会比想象中更快达成。',
      },
      {
        title: 'Step 2: 正确存储',
        description:
          '稳定基金必须满足三个条件：\n\n✓ 易于获取（24小时内可取）\n✓ 零风险（不投资股市）\n✓ 持续增值（高收益储蓄账户4-5%年利率）\n\n不要把应急资金投入股市！',
      },
      {
        title: 'Step 3: 快速积累策略',
        description:
          '① 工资扫描法：工资到账立即自动转账15%\n② 替换承诺：使用了就立即补回\n③ 四舍五入储蓄：消费¥3.6向上取整为¥4，差额存入\n\n一旦达到目标，可将这15%转投增长投资。',
      },
    ],
  },
  essentials: {
    title: '基本开支，优化你的50%',
    subtitle: '让每一分钱都花在刀刃上',
    icon: '🏠',
    bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    intro: '这50%用于生活必需品：房租、食品、水电、交通、保险和基本衣物。不是削减快乐，而是聪明消费。',
    steps: [
      {
        title: 'Step 1: 明确真正的必需品',
        description:
          '必需品：房租/房贷、食品、水电、交通、保险、基本衣物\n\n非必需品：外卖、未使用的订阅、健身房（如果不去）、品牌溢价\n\n很多人把60-70%花在"必需品"上，是因为把欲望当成了需求。',
        type: 'list',
      },
      {
        title: 'Step 2: 缩减两大关键开支',
        description: '住房和交通是最大的两项开支，优化它们影响最大：',
        type: 'questions',
        questions: [
          { icon: '🏠', text: '住房：重新谈判租金、合租、回家住（暂时）' },
          { icon: '🚗', text: '交通：买可靠的二手车、公共交通、步行/骑车' },
        ],
      },
      {
        title: 'Step 3: 用规则代替意志力',
        description:
          '购买决策树：\n\n① 这是冲动消费吗？→ 是：7天法则（等7天再买）\n② 买品牌还是价值？→ 选价值（$60靴子穿100次=$0.6/次）\n③ 会改善生活吗？→ 不会就别买\n\n规则比意志力更可靠。',
      },
    ],
  },
  rewards: {
    title: '奖励消费，你的10%自由金',
    subtitle: '无罪恶感享受生活',
    icon: '🎉',
    bgColor: 'linear-gradient(135deg, #F9A8D4 0%, #F472B6 100%)',
    intro:
      '生活不只是存钱和投资。这10%是你的"零罪恶感"基金，用来享受当下、保持动力。92%的人会在高强度存钱后过度消费，所以预留奖励金很重要。',
    steps: [
      {
        title: 'Step 1: 无罪恶感消费类别',
        description:
          '将奖励金用在真正有价值的地方：\n\n✓ 度假旅行 - 买回忆，不会贬值\n✓ 培养爱好 - 保持热情和创造力\n✓ 社交聚会 - 维护重要的人际关系\n✓ 送礼物 - 加强与亲友的情感联系\n\n这些都是对生活质量的投资。',
      },
      {
        title: 'Step 2: 预加载"快乐罐"',
        description:
          '开设独立银行账户，命名为"快乐罐"(Joy Jar)。\n\n• 每月自动转入收入的10%\n• 只能用这个账户的钱奖励自己\n• 用完就等下个月，不能从其他账户补\n\n限制反而让你更珍惜和明智地使用。',
      },
      {
        title: 'Step 3: 优先体验而非物质',
        description:
          '研究表明，体验带来的快乐持续时间远超物质。\n\n✓ 和朋友的晚餐\n✓ 音乐会和演出\n✓ 周末短途旅行\n✓ 学习新技能的课程\n\n存钱是为了更好的生活，不是为了死前账户里有很多钱。',
      },
    ],
  },
};
