import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, BarChart3, BookOpen, LogOut } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAppStore } from '../../store/useAppStore';
import { FloatingNav } from '@/components/ui/floating-nav';

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisitorMode, deactivateVisitorMode, getTotalAssets } = useAppStore();

  const hideNavPaths = [ROUTES.WELCOME, ROUTES.LOGIN, ROUTES.ONBOARDING, ROUTES.VISITOR, '/visitor/presentation'];
  if (hideNavPaths.includes(location.pathname)) {
    return null;
  }

  const handleExitVisitorMode = () => {
    deactivateVisitorMode();
    navigate(ROUTES.WELCOME);
  };

  const totalAssets = getTotalAssets();

  const navItems = [
    {
      name: '仪表盘',
      link: ROUTES.DASHBOARD,
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: '账户',
      link: ROUTES.ACCOUNTS,
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      name: '分析',
      link: ROUTES.ANALYTICS,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: '投资指南',
      link: ROUTES.INVESTMENT_GUIDANCE,
      icon: <BookOpen className="h-4 w-4" />,
    },
  ];

  return (
    <FloatingNav
      navItems={navItems}
      startContent={
        <div
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <div className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Hi Money
          </div>
          {totalAssets > 0 && (
            <span className="hidden md:inline text-xs text-gray-500 hover:text-amber-400 transition-colors font-mono">
              ¥{(totalAssets / 10000).toFixed(1)}万
            </span>
          )}
        </div>
      }
      endContent={
        isVisitorMode ? (
          <button
            onClick={handleExitVisitorMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all border border-amber-400/20 flex-shrink-0"
          >
            <LogOut size={14} strokeWidth={2} />
            <span className="hidden md:inline font-medium">退出演示</span>
          </button>
        ) : undefined
      }
    />
  );
}
