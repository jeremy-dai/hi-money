import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface Product {
  code: string;
  name: string;
  company: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function InvestmentGuidancePage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const aStockProducts: Product[] = [
    { code: '510300', name: '沪深300ETF', company: '华泰柏瑞', description: '大盘蓝筹' },
    { code: '510500', name: '中证500ETF', company: '南方基金', description: '中盘成长' },
  ];

  const usStockProducts: Product[] = [
    { code: '513500', name: '标普500ETF', company: '博时基金', description: '美国大盘' },
    { code: '159632', name: '纳斯达克ETF', company: '华安基金', description: '科技成长' },
  ];

  const goldProducts: Product[] = [
    { code: '518880', name: '黄金ETF', company: '华安基金', description: '固定配置' },
    { code: '159934', name: '黄金ETF', company: '易方达', description: '备选' },
  ];

  const platforms = [
    { name: '天天基金', url: 'https://fund.eastmoney.com/', recommended: true },
    { name: '支付宝', url: 'https://www.alipay.com/', recommended: false },
    { name: '微信理财通', url: 'https://www.95559.com.cn/', recommended: false },
  ];

  const faqs: FAQ[] = [
    {
      question: 'Q1: 场内ETF和场外基金有什么区别？',
      answer: '场内ETF：在股票交易时间内通过证券账户买卖，费用低（约0.01%），实时成交\n场外基金：通过支付宝/天天基金申购，操作简单，T+1确认，费率稍高（0.12-0.15%）\n推荐：如果有股票账户，优先选择场内ETF',
    },
    {
      question: 'Q2: 每个月需要投入多少钱？',
      answer: '根据25-15-50-10法则，将月收入的25%用于投资\n例如：月收入5000元 → 投资金额1250元\n具体分配到各指数，按配置比例计算',
    },
    {
      question: 'Q3: QDII溢价率高时怎么办？',
      answer: '溢价率>3%时，有两个选择：\n1️⃣ 等待溢价率降低后再买入场内ETF\n2️⃣ 改为场外申购对应的QDII基金（无溢价，但申购费稍高）\n场外代码：标普500 - 050025（博时）、纳指100 - 040048（华安）',
    },
    {
      question: 'Q4: 什么时候可以卖出？',
      answer: '不推荐短期买卖！指数基金适合长期持有（3-5年+）\n卖出时机参考：\n• A股：PE百分位>90%（极度高估）\n• 美股：CAPE>44（泡沫区域）\n• 或者达到个人财务目标时（买房、退休等）',
    },
  ];

  const ProductGrid = ({ products, bgColor }: { products: Product[]; bgColor: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      {products.map((product, idx) => (
        <div key={idx} className={`${bgColor} p-4 rounded-xl`}>
          <div className="font-semibold text-sm mb-1">
            {product.code} - {product.name}
          </div>
          <div className="text-xs text-gray-600">
            {product.company} · {product.description}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <div className="text-5xl mb-3">🚀</div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">新手投资行动指南</h1>
            <p className="text-gray-600">3步开始定投，让财富自动增长</p>
          </Card>
        </motion.div>

        {/* Step 1: Open Account */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-growth">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-growth mb-2">
                  第一步：开通证券账户
                </h2>
                <p className="text-sm text-gray-600">10分钟完成</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              推荐券商：天天基金、支付宝（蚂蚁财富）、微信理财通、华泰证券、东方财富
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {platforms.map((platform, idx) => (
                <a
                  key={idx}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-growth/10 hover:bg-growth/20 rounded-lg text-center transition-colors"
                >
                  <div className="font-semibold text-growth">
                    {platform.name}
                    {platform.recommended && ' ⭐'}
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
              💡 <strong>准备材料：</strong>身份证 + 银行卡 + 手机号，按APP指引完成实名认证即可
            </div>
          </Card>
        </motion.div>

        {/* Step 2: Choose Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-stability">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-stability mb-2">
                  第二步：选择投资产品
                </h2>
                <p className="text-sm text-gray-600">根据面板建议配置</p>
              </div>
            </div>

            {/* A-Stock Products */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">📊</span>
                A股指数（场内ETF - 需开通股票账户）
              </h3>
              <ProductGrid products={aStockProducts} bgColor="bg-green-50" />
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ 场内ETF需要在股票交易时间（工作日9:30-15:00）通过证券账户购买
              </p>
            </div>

            {/* US-Stock Products */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🌍</span>
                美股指数（QDII - 场内/场外均可）
              </h3>
              <ProductGrid products={usStockProducts} bgColor="bg-blue-50" />
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ 买入前必须检查溢价率！溢价&gt;3%建议场外申购或等待溢价降低
              </p>
            </div>

            {/* Gold Products */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                黄金ETF（避险资产）
              </h3>
              <ProductGrid products={goldProducts} bgColor="bg-yellow-50" />
            </div>
          </Card>
        </motion.div>

        {/* Step 3: Set Auto-Invest */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-green-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  第三步：设置自动定投
                </h2>
                <p className="text-sm text-gray-600">最重要的一步！</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <strong className="text-gray-800">定投日期：</strong>
                  <span className="text-gray-700">发薪日后1-3天（例如每月5号或10号）</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-lg">💰</span>
                <div>
                  <strong className="text-gray-800">定投金额：</strong>
                  <span className="text-gray-700">月收入的25%（增长投资部分）</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-lg">📊</span>
                <div>
                  <strong className="text-gray-800">资产配置建议：</strong>
                  <div className="mt-2 ml-4 space-y-1 text-sm text-gray-700">
                    <div>• 沪深300：30% （稳健）</div>
                    <div>• 中证500：20% （成长）</div>
                    <div>• 标普500：25% （美股大盘）</div>
                    <div>• 纳斯达克：10% （科技）</div>
                    <div>• 黄金ETF：15% （避险）</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-green-700 mb-2">💡 定投设置小贴士</div>
              <div className="text-sm text-gray-700 space-y-1">
                <div>1️⃣ 场内ETF：通过证券APP设置智能定投（自动扣款买入）</div>
                <div>2️⃣ 场外基金：在天天基金/支付宝设置定投计划</div>
                <div>3️⃣ 根据估值面板每月调整金额（加倍/正常/减半）</div>
                <div>4️⃣ 至少坚持3年，中途不要因市场波动停止</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h3 className="text-xl font-bold mb-4 text-gray-800">❓ 新手常见问题</h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left p-4 font-semibold text-growth hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span>{faq.question}</span>
                    <span className="text-xl">{expandedFaq === idx ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-line border-l-2 border-growth ml-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
            返回仪表盘
          </Button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
