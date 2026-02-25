
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ROUTES } from './utils/constants';
import { TopNav } from './components/layout/TopNav';
import { ModeBanner } from './components/workspace/ModeBanner';
import { supabase } from './lib/supabase';
import { useAppStore, createEmptyProfile } from './store/useAppStore';
import { fetchProfileData, saveProfileData } from './services/supabaseService';

// Pre-auth pages
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));

// Main 4 tabs
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SpendingPage = lazy(() => import('./pages/SpendingPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-primary">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gold-primary shadow-gold-lg" />
      <p className="mt-6 text-gold-primary font-semibold text-lg">加载中...</p>
    </div>
  );
}

function App() {
  const { setAuthenticated, loadPersonalData, refreshPolicies, resetAll } = useAppStore();

  useEffect(() => {
    // Refresh policies on mount (for persisted data)
    refreshPolicies();

    // Helper: load or create profile for authenticated user
    const initUserProfile = async (userId: string) => {
      const data = await fetchProfileData(userId);
      if (data) {
        loadPersonalData(data);
      } else {
        // New user — create empty profile in Supabase so spending syncs work
        const emptyProfile = createEmptyProfile();
        await saveProfileData(userId, emptyProfile);
        loadPersonalData(emptyProfile);
      }
      refreshPolicies();
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      if (session?.user) initUserProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
      if (session?.user) initUserProfile(session.user.id);
      if (event === 'SIGNED_OUT') {
        resetAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuthenticated, loadPersonalData, refreshPolicies, resetAll]);

  return (
    <BrowserRouter>
      <ModeBanner />
      <TopNav />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SPENDING} element={<SpendingPage />} />
          <Route path={ROUTES.ASSETS} element={<AssetsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
