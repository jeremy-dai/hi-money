/**
 * Tooltip content for financial and insurance terms.
 * All content in Simplified Chinese for client education.
 */


export const TOOLTIP = {
  // ── Dashboard metrics ────────────────────────────────────────────────────
  coreNetWorth: (
    <span>
      <span className="text-white font-semibold block mb-1">核心净资产</span>
      投资账户余额 + 保单现金价值之和，反映家庭当前可调动的实际财富总量。不含房产等非流动性资产。
    </span>
  ),

  ma3Spending: (
    <span>
      <span className="text-white font-semibold block mb-1">MA-3 移动平均支出</span>
      过去 3 个月支出的<span className="text-white">简单平均值</span>（Moving Average 3）。
      <br />
      能平滑单月异常消费波动（如年节大额支出），更真实地反映日常支出水平，是制定月度预算的重要参考。
    </span>
  ),

  spendingRate: (
    <span>
      <span className="text-white font-semibold block mb-1">上月支出率</span>
      计算公式：<span className="text-indigo-300">上月实际支出 ÷ 月收入 × 100%</span>
      <br />
      反映上个月消费占收入的比例。按照 25-15-50-10 法则，基本开支 + 享乐奖励合计应控制在收入的
      <span className="text-amber-400"> 60% 以内</span>。超过 55% 视为偏高。
    </span>
  ),

  riskLeverageRatio: (
    <span>
      <span className="text-white font-semibold block mb-1">抗风险杠杆率</span>
      计算公式：<span className="text-indigo-300">保障总额 ÷ 家庭净资产</span>
      <br />
      衡量保险对家庭财富的放大保护效应。建议维持在
      <span className="text-emerald-400"> 10 倍以上</span>，
      即若净资产为 100 万，则保障总额应不低于 1000 万。
    </span>
  ),

  // ── Insurance summary ─────────────────────────────────────────────────────
  annualPremium: (
    <span>
      <span className="text-white font-semibold block mb-1">年度保费支出</span>
      所有保单每年需缴纳的保费合计，计入年度支出预算，直接影响家庭现金流规划。
    </span>
  ),

  cashValue: (
    <span>
      <span className="text-white font-semibold block mb-1">保单现金价值</span>
      保单在当前时点退保可获得的金额，归类为家庭<span className="text-blue-300">稳健资产</span>。
      <br />
      纯消费型险种（如定期寿险、医疗险）现金价值为 0，储蓄型险种现金价值随时间增长。
    </span>
  ),

  coverageAmount: (
    <span>
      <span className="text-white font-semibold block mb-1">风险保障总额</span>
      所有保单核心保额之和，代表家庭在最坏情况下可获得的最大理赔金额。
      <br />
      用于计算<span className="text-emerald-300">抗风险杠杆率</span>，是衡量保障充足性的核心指标。
    </span>
  ),

  tripleDispatch: (
    <span>
      <span className="text-white font-semibold block mb-1">三重调度机制</span>
      每张保单同时影响三个财务维度：
      <ul className="list-disc pl-4 mt-1 space-y-0.5">
        <li><span className="text-indigo-400">支出预算</span>：保费计入年度支出</li>
        <li><span className="text-blue-400">净资产</span>：现金价值计入家庭资产</li>
        <li><span className="text-emerald-400">抗风险杠杆</span>：保额用于抵御风险</li>
      </ul>
    </span>
  ),

  // ── Insurance subcategories ───────────────────────────────────────────────
  criticalIllness: (
    <span>
      <span className="text-white font-semibold block mb-1">重疾险</span>
      确诊特定重大疾病（癌症、心梗、脑梗等约100种）后，<span className="text-white">一次性赔付保额</span>，无需凭发票报销。
      主要用于补偿治疗期间的收入损失，建议保额为年收入的 3~5 倍。
    </span>
  ),

  medical: (
    <span>
      <span className="text-white font-semibold block mb-1">医疗险</span>
      住院及门诊费用的<span className="text-white">报销型</span>险种，按实际花费报销（不可超过实际支出）。
      通常设有免赔额，与社保医保形成互补，覆盖自费和高额住院费用。
    </span>
  ),

  accident: (
    <span>
      <span className="text-white font-semibold block mb-1">意外险</span>
      因外来、突发、非疾病原因导致的身故、伤残或医疗费用，给付保险金。
      保费极低、杠杆极高，是性价比最高的基础保障之一。
    </span>
  ),

  termLife: (
    <span>
      <span className="text-white font-semibold block mb-1">定期寿险</span>
      在约定期限内（如20年）身故则赔付保额，期满无赔付无返还。
      保费极低但杠杆极高，是家庭经济支柱<span className="text-white">必备</span>的基础保障，建议保额为年收入的 10~20 倍。
    </span>
  ),

  cancer: (
    <span>
      <span className="text-white font-semibold block mb-1">防癌险</span>
      专门针对恶性肿瘤的险种，确诊癌症后一次性给付。保费低于综合重疾险，
      适合预算有限或有肿瘤家族史的人群作为补充保障。
    </span>
  ),

  increasingWholeLife: (
    <span>
      <span className="text-white font-semibold block mb-1">增额终身寿险</span>
      保额每年按固定比率（通常 3.0%~3.5%）复利递增的终身寿险，兼具身故保障与
      <span className="text-blue-300">确定性资产增值</span>功能。现金价值持续增长，是储蓄类保险的核心品种。
    </span>
  ),

  pensionAnnuity: (
    <span>
      <span className="text-white font-semibold block mb-1">养老年金</span>
      到达约定年龄（通常 60/65 岁）后，每月或每年领取固定金额直至终身。
      用于规划退休后的稳定现金流，对冲长寿风险。
    </span>
  ),

  educationAnnuity: (
    <span>
      <span className="text-white font-semibold block mb-1">教育金</span>
      子女达到特定年龄时分阶段给付的保险金，用于规划教育费用。
      具有强制储蓄属性，通常附带被保险人豁免条款（父母身故保费豁免，保障持续）。
    </span>
  ),

  endowment: (
    <span>
      <span className="text-white font-semibold block mb-1">两全险</span>
      保障期满生存则给付满期金，被保险人身故则给付保额。兼具储蓄和保障功能，
      但灵活性较低，实际收益率通常偏低。
    </span>
  ),

  wholeLife: (
    <span>
      <span className="text-white font-semibold block mb-1">终身寿险</span>
      终身有效的寿险保障，被保险人身故必然赔付。现金价值长期积累，
      常用于<span className="text-white">财富传承</span>和遗产规划。
    </span>
  ),

  participating: (
    <span>
      <span className="text-white font-semibold block mb-1">分红险</span>
      保险公司将经营盈余的一部分以红利形式分配给保单持有人。
      分红不保证，实际收益与保险公司投资业绩挂钩，存在一定不确定性。
    </span>
  ),

  universalLife: (
    <span>
      <span className="text-white font-semibold block mb-1">万能险</span>
      设有最低保证利率（通常 1.75%~2%），超额收益来自保险公司投资账户（结算利率）。
      保费缴纳和保额调整较灵活，但需关注初始费用和管理费的扣除。
    </span>
  ),

  unitLinked: (
    <span>
      <span className="text-white font-semibold block mb-1">投连险（投资连结险）</span>
      保费扣除保障成本后，投入各类独立投资账户（股票型、债券型等）。
      收益完全与市场挂钩，<span className="text-red-400">无最低保证</span>，适合风险承受能力较高的投保人。
    </span>
  ),

  taxAdvantaged: (
    <span>
      <span className="text-white font-semibold block mb-1">税优产品</span>
      享受国家税收优惠政策的保险产品，如：
      <ul className="list-disc pl-4 mt-1 space-y-0.5">
        <li>税优健康险：保费在税前列支</li>
        <li>税延养老险：缴费阶段递延纳税</li>
      </ul>
      可合法降低当期应税收入，适合高收入人群。
    </span>
  ),

  // ── Insurance gap analysis ────────────────────────────────────────────────
  coverageGap: (
    <span>
      <span className="text-white font-semibold block mb-1">保障缺口</span>
      <span className="text-red-400">建议保额 − 现有保额</span>，反映家庭保障的不足程度。
      建议优先补足"高"优先级险种的缺口，再逐步完善其他保障。
    </span>
  ),

  coverageCompleteness: (
    <span>
      <span className="text-white font-semibold block mb-1">保障完整度</span>
      计算公式：<span className="text-white">现有保额 ÷ 建议保额 × 100%</span>
      <br />
      综合评估家庭在寿险、重疾、医疗、意外四大险种上的保障覆盖率。
    </span>
  ),

  familyAllocation631: (
    <span>
      <span className="text-white font-semibold block mb-1">6:3:1 家庭保险分配原则</span>
      家庭保险预算的经典配置比例：
      <ul className="list-disc pl-4 mt-1 space-y-0.5">
        <li><span className="text-white">60%</span>：主要收入者（经济支柱）</li>
        <li><span className="text-white">30%</span>：次要收入者（配偶）</li>
        <li><span className="text-white">10%</span>：子女</li>
      </ul>
      优先保障收入来源，再保障其他家庭成员。
    </span>
  ),

  // ── Policy form fields ────────────────────────────────────────────────────
  categoryProtection: (
    <span>
      <span className="text-white font-semibold block mb-1">保障型保险</span>
      以风险保障为核心目的，包括重疾险、医疗险、意外险、寿险等。
      现金价值通常较低或为零，核心价值在于保额提供的风险保障。
    </span>
  ),

  categorySavings: (
    <span>
      <span className="text-white font-semibold block mb-1">储蓄型保险</span>
      兼具保障与资产积累功能，现金价值随时间持续增长。
      包括增额终身寿险、养老年金等，适合长期财富规划。
    </span>
  ),

  categoryInvestment: (
    <span>
      <span className="text-white font-semibold block mb-1">投资型保险</span>
      将部分保费用于投资，收益与市场表现挂钩（分红险/万能险/投连险）。
      收益不确定性较高，需结合自身风险偏好选择。
    </span>
  ),

  premiumSchedule: (
    <span>
      <span className="text-white font-semibold block mb-1">保费进度表</span>
      若保费分期缴纳且各年不同（如前5年高、后期低），可按保单年度录入准确金额，
      系统将根据当前保单年度自动匹配当年保费。
    </span>
  ),

  cashValueSchedule: (
    <span>
      <span className="text-white font-semibold block mb-1">现金价值表</span>
      保险公司提供的逐年现金价值数据（通常在保险合同附件中）。
      录入后系统将根据投保日期自动计算当前现金价值，无需手动维护。
    </span>
  ),

  coverageSchedule: (
    <span>
      <span className="text-white font-semibold block mb-1">保额进度表</span>
      若保额随年度递增（如增额终身寿险），可按保单年度录入各年保额，
      系统将自动匹配当前年度的有效保额用于杠杆率计算。
    </span>
  ),
} as const;
