import React from 'react';
import { AppProvider, useAppStore } from './store';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isOnboarded, isLoading } = useAppStore();
  const navigate = useNavigate();
  const params = useParams();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-nexus-50">
        <Loader2 className="animate-spin text-nexus-500" size={48} />
      </div>
    );
  }

  // 1. Not Logged In -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 2. Logged In but No Brain -> Onboarding (Setup)
  if (!isOnboarded) {
    return <Onboarding />;
  }

  // 3. Logged In & Onboarded -> Main App with Sidebar and Outlet
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-nexus-50">
      <Sidebar />
      <main className="flex-1 h-full relative">
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;