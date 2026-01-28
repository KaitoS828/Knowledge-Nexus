import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { ArticleDetail } from './components/ArticleDetail';
import { DocumentDetail } from './components/DocumentDetail';
import { PricingPage } from './components/PricingPage';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'onboarding',
        element: <Onboarding />,
      },
      {
        path: 'dashboard',
        element: <UnifiedDashboard />,
      },
      {
        path: 'dashboard/:tab',
        element: <UnifiedDashboard />,
      },
      {
        path: 'article/:id',
        element: <ArticleDetail />,
      },
      {
        path: 'document/:id',
        element: <DocumentDetail />,
      },
      {
        path: 'pricing',
        element: <PricingPage />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);
