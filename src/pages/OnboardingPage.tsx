import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '../components/profile/ProfileForm';
import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../utils/constants';
import type { UserProfile } from '../types/profile.types';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setUserProfile, applyRecommendedAllocation } = useAppStore();

  const handleComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    applyRecommendedAllocation();
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">欢迎使用 Hi Money</h1>
          <p className="text-gray-400 text-lg">让我们为您创建个性化的财务规划方案</p>
        </div>
        <ProfileForm onComplete={handleComplete} />
      </div>
    </div>
  );
}
