import React, { useEffect } from 'react';
import { AppProvider, useAppStore } from './store';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { ThemeManager } from './components/ThemeManager';
import { Loader2 } from 'lucide-react';

import { MainLayout } from './components/MainLayout';

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeManager />
      <MainLayout />
    </AppProvider>
  );
};

export default App;
