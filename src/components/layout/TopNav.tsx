import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingDown, Landmark, Settings2 } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAppStore } from '../../store/useAppStore';
import { FloatingNav } from '@/components/ui/floating-nav';
import { EXAMPLE_PROFILE_METADATA } from '../../data/exampleProfiles';

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeMode, activeExampleId, isAuthenticated, getTotalAssets } = useAppStore();

  const hideNavPaths = [ROUTES.WELCOME, ROUTES.LOGIN, ROUTES.ONBOARDING];
  if (hideNavPaths.includes(location.pathname as '/')) return null;

  const totalAssets = getTotalAssets();

  const navItems = [
    { name: '看板', link: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: '支出', link: ROUTES.SPENDING, icon: <TrendingDown className="h-4 w-4" /> },
    { name: '资产', link: ROUTES.ASSETS, icon: <Landmark className="h-4 w-4" /> },
    { name: '设置', link: ROUTES.SETTINGS, icon: <Settings2 className="h-4 w-4" /> },
  ];

  const modeLabel =
    activeMode === 'SANDBOX'
      ? '本地'
      : activeMode === 'EXAMPLE'
      ? (EXAMPLE_PROFILE_METADATA.find(m => m.id === activeExampleId)?.name?.split('（')[0] ?? '案例')
      : isAuthenticated
      ? '云同步'
      : '未登录';

  const dotColor =
    activeMode === 'SANDBOX'
      ? 'bg-amber-400'
      : activeMode === 'EXAMPLE'
      ? 'bg-blue-400'
      : isAuthenticated
      ? 'bg-emerald-400'
      : 'bg-gray-500';

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
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {modeLabel === '未登录' ? (
              <span
                className="cursor-pointer hover:text-gray-700 hover:underline transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTES.LOGIN);
                }}
              >
                {modeLabel}
              </span>
            ) : (
              <span>{modeLabel}</span>
            )}
          </div>
          {totalAssets > 0 && (
            <span className="hidden md:inline text-xs text-gray-600 font-mono">
              ¥{(totalAssets / 10000).toFixed(1)}万
            </span>
          )}
        </div>
      }
    />
  );
}
