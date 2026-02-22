import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from './utils/constants';
import { TopNav } from './components/layout/TopNav';

// Lazy-loaded pages
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const AllocateIncomePage = lazy(() => import('./pages/AllocateIncomePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const InvestmentGuidancePage = lazy(() => import('./pages/InvestmentGuidancePage'));
const InsurancePlanningPage = lazy(() => import('./pages/InsurancePlanningPage'));
const RetirementPlanningPage = lazy(() => import('./pages/RetirementPlanningPage'));
const VisitorModePage = lazy(() => import('./pages/VisitorModePage'));
const PresentationMode = lazy(() => import('./components/visitor/PresentationMode').then(m => ({ default: m.PresentationMode })));

// Loading component with black-gold theme
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-primary">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gold-primary shadow-gold-lg"></div>
      <p className="mt-6 text-gold-primary font-semibold text-lg">加载中...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes - Always accessible */}
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
          <Route path={ROUTES.DETAIL} element={<DetailPage />} />

          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />
          <Route path={ROUTES.ALLOCATE_INCOME} element={<AllocateIncomePage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.INVESTMENT_GUIDANCE} element={<InvestmentGuidancePage />} />
          <Route path={ROUTES.INSURANCE_PLANNING} element={<InsurancePlanningPage />} />
          <Route path={ROUTES.RETIREMENT_PLANNING} element={<RetirementPlanningPage />} />
          <Route
            path={ROUTES.VISITOR}
            element={<VisitorModePage />}
          />
          <Route
            path="/visitor/presentation"
            element={<PresentationMode />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
