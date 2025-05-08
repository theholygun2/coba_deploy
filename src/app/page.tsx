'use client';

import { useAppContext } from '@/context/AppContext';
import { AppProvider } from '@/context/AppContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import ClientSelection from '@/components/ClientSelection';
import BriefScreen from '@/components/BriefScreen';
import CampaignForm from '@/components/CampaignForm';
import CaptionInput from '@/components/CaptionInput';
import InstagramMockup from '@/components/InstagramMockup';
import FeedbackScreen from '@/components/FeedbackScreen';

const AppContent = () => {
  const { state } = useAppContext();

  // Render the appropriate component based on the current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeScreen />;
      case 2:
        return <ClientSelection />;
      case 3:
        return <BriefScreen />;
      case 4:
        return <CampaignForm />;
      case 5:
        return <CaptionInput />;
      case 6:
        return <InstagramMockup />;
      case 7:
        return <FeedbackScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100">
      {renderStep()}
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
