import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store';
import { Sidebar } from './components/Sidebar';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { DocumentDetail } from './components/DocumentDetail';
import { BrainEditor } from './components/BrainEditor';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { LearningDiary } from './components/LearningDiary';
import { Article, DocumentStoredUpload } from './types';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isOnboarded, isLoading } = useAppStore();
  const [view, setView] = useState('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentStoredUpload | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

  // 3. Logged In & Onboarded -> Main App
  const renderContent = () => {
    if (selectedArticle) {
      return (
        <ArticleDetail
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
          toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />
      );
    }

    if (selectedDocument) {
      return (
        <DocumentDetail
          document={selectedDocument}
          onBack={() => setSelectedDocument(null)}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return <ArticleList onSelectArticle={setSelectedArticle} onSelectDocument={setSelectedDocument} />;
      case 'diary':
        return <LearningDiary />;
      case 'brain':
        return <BrainEditor />;
      case 'graph':
        return <KnowledgeGraph />;
      default:
        return <ArticleList onSelectArticle={setSelectedArticle} onSelectDocument={setSelectedDocument} />;
    }
  };

  if (selectedArticle || selectedDocument) {
      return (
        <div className="flex h-screen w-screen overflow-hidden bg-nexus-50">
            {isSidebarVisible && selectedArticle && <Sidebar currentView={view} setView={setView} />}
            <main className="flex-1 h-full relative">
                {renderContent()}
            </main>
        </div>
      );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-nexus-50">
      <Sidebar currentView={view} setView={setView} />
      <main className="flex-1 h-full relative">
        {renderContent()}
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