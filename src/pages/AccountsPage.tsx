import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_NAMES, CATEGORY_COLORS } from '../utils/constants';
import type { CategoryType } from '../types';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { accounts, addAccount, deleteAccount, getCategoryTotal } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('growth');
  const [accountName, setAccountName] = useState('');
  const [accountAmount, setAccountAmount] = useState('');

  const handleAddAccount = () => {
    const amount = parseFloat(accountAmount);
    if (!accountName || isNaN(amount)) return;

    addAccount(selectedCategory, { name: accountName, amount });
    setAccountName('');
    setAccountAmount('');
  };

  // Only investment categories (Phase 4: remove spending tracking)
  const categories: CategoryType[] = ['growth', 'stability', 'special'];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">管理账户</h1>
          <p className="text-white-soft">添加和管理您的各类账户</p>
        </div>

        {/* Info Banner - Phase 4: Focus on investments only */}
        <Card className="mb-6 bg-gradient-to-r from-gold-primary/10 to-gold-primary/5 border-gold-primary/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-white font-semibold mb-1">专注于投资追踪</p>
              <p className="text-gray-400 text-sm">生活开支和娱乐消费无需记录。Hi Money 专注于帮助您管理投资资产。</p>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">添加新账户</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedCategory === cat
                    ? 'border-gold-primary bg-black-soft text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <div className="font-semibold">{CATEGORY_NAMES[cat]}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              placeholder="账户名称"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="账户金额"
              value={accountAmount}
              onChange={(e) => setAccountAmount(e.target.value)}
            />
            <Button onClick={handleAddAccount} className="w-full">
              添加账户
            </Button>
          </div>
        </Card>

        {categories.map((category) => (
          <Card key={category} className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{CATEGORY_NAMES[category]}</h3>
              <span className="text-lg font-semibold" style={{ color: CATEGORY_COLORS[category] }}>
                ¥{getCategoryTotal(category).toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              {accounts[category].map((account, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-gray-200">{account.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">¥{account.amount.toFixed(2)}</span>
                    <button
                      onClick={() => deleteAccount(category, index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {accounts[category].length === 0 && <p className="text-gray-500 text-center py-4">暂无账户</p>}
            </div>
          </Card>
        ))}

        <Button onClick={() => navigate(-1)} variant="secondary" className="w-full">
          返回仪表盘
        </Button>
      </div>
    </PageContainer>
  );
}
