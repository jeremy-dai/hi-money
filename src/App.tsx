import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAppStore } from './store/useAppStore';
import { ROUTES } from './utils/constants';

// Lazy-loaded pages
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const IncomePage = lazy(() => import('./pages/IncomePage'));
const AllocationPage = lazy(() => import('./pages/AllocationPage'));
const GoalPage = lazy(() => import('./pages/GoalPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const AllocateIncomePage = lazy(() => import('./pages/AllocateIncomePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const InvestmentGuidancePage = lazy(() => import('./pages/InvestmentGuidancePage'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasCompletedSetup = useAppStore((state) => state.hasCompletedSetup);
  return hasCompletedSetup ? <>{children}</> : <Navigate to={ROUTES.WELCOME} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.INCOME} element={<IncomePage />} />
          <Route path={ROUTES.ALLOCATION} element={<AllocationPage />} />
          <Route path={ROUTES.GOAL} element={<GoalPage />} />

          {/* Protected routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.DETAIL}
            element={
              <ProtectedRoute>
                <DetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ACCOUNTS}
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALLOCATE_INCOME}
            element={
              <ProtectedRoute>
                <AllocateIncomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ANALYTICS}
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVESTMENT_GUIDANCE}
            element={
              <ProtectedRoute>
                <InvestmentGuidancePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
