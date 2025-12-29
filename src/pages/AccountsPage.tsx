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

  const categories: CategoryType[] = ['growth', 'stability', 'essentials', 'rewards'];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">管理账户</h1>
          <p className="text-purple-100">添加和管理您的各类账户</p>
        </div>

        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4">添加新账户</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedCategory === cat
                    ? 'border-primary-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
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
              <h3 className="text-xl font-bold">{CATEGORY_NAMES[category]}</h3>
              <span className="text-lg font-semibold" style={{ color: CATEGORY_COLORS[category] }}>
                ¥{getCategoryTotal(category).toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              {accounts[category].map((account, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span>{account.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">¥{account.amount.toFixed(2)}</span>
                    <button
                      onClick={() => deleteAccount(category, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {accounts[category].length === 0 && <p className="text-gray-400 text-center py-4">暂无账户</p>}
            </div>
          </Card>
        ))}

        <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
          返回仪表盘
        </Button>
      </div>
    </PageContainer>
  );
}
