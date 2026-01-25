import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { DocumentDetail } from './components/DocumentDetail';
import { BrainEditor } from './components/BrainEditor';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { LearningDiary } from './components/LearningDiary';
import { PricingPage } from './components/PricingPage';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { ReflectionPage } from './components/ReflectionPage';

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
        element: <ArticleList />,
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
        path: 'brain',
        element: <BrainEditor />,
      },
      {
        path: 'graph',
        element: <KnowledgeGraph />,
      },
      {
        path: 'diary',
        element: <LearningDiary />,
      },
      {
        path: 'reflection',
        element: <ReflectionPage />,
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
