import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingDown, Landmark, Settings2 } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAppStore } from '../../store/useAppStore';
import { FloatingNav } from '@/components/ui/floating-nav';
import { EXAMPLE_PROFILE_METADATA } from '../../data/exampleProfiles';

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeMode, activeExampleId, getTotalAssets } = useAppStore();

  const hideNavPaths = [ROUTES.WELCOME, ROUTES.LOGIN, ROUTES.ONBOARDING];
  if (hideNavPaths.includes(location.pathname as '/')) return null;

  const totalAssets = getTotalAssets();

  const navItems = [
    { name: '看板', link: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: '支出', link: ROUTES.SPENDING, icon: <TrendingDown className="h-4 w-4" /> },
    { name: '资产', link: ROUTES.ASSETS, icon: <Landmark className="h-4 w-4" /> },
    { name: '设置', link: ROUTES.SETTINGS, icon: <Settings2 className="h-4 w-4" /> },
  ];

  // Workspace mode indicator for nav
  const modeLabel =
    activeMode === 'SANDBOX'
      ? '沙盒'
      : activeMode === 'EXAMPLE'
      ? (EXAMPLE_PROFILE_METADATA.find(m => m.id === activeExampleId)?.name?.split('（')[0] ?? '案例')
      : null;

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
        modeLabel ? (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              activeMode === 'SANDBOX'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {modeLabel}
          </span>
        ) : undefined
      }
    />
  );
}
