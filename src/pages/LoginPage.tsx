import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../utils/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuthenticated, resetAll } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? '邮箱或密码错误'
        : authError.message);
      return;
    }

    setAuthenticated(true);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(ROUTES.WELCOME)}
            className="flex items-center gap-2 text-gold-primary hover:text-gold-secondary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回首页</span>
          </button>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LogIn className="text-gold-primary icon-glow" size={48} strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">登录账户</h1>
              <p className="text-white-soft">登录后可使用AI聊天等高级功能</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="邮箱"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <Input
                label="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="space-y-3">
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  onClick={() => {
                    resetAll();
                    setAuthenticated(false);
                    navigate(ROUTES.DASHBOARD);
                  }}
                >
                  跳过，使用本地存储模式
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                暂未开放注册
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-black-soft border-gold-primary/20">
            <h3 className="text-lg font-bold text-gold-primary mb-3">登录 vs 本地存储</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span><strong>登录模式：</strong>数据云端同步，可使用AI聊天、智能推荐等高级功能</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span><strong>本地模式：</strong>数据仅保存在浏览器，完全隐私，但功能受限</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}
