import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Article, Bookmark, DiaryEntry, LearningTweet, DocumentStoredUpload } from './types';
import { supabase } from './services/supabase';

const INITIAL_BRAIN = `# 私のエンジニア外部脳

## Frontend
- **React**: UI構築のためのライブラリ。コンポーネント指向。
- **TypeScript**: 型付きJavaScript。スケーラビリティに必須。

## Backend
- **Node.js**: JSランタイム。
`;

const INITIAL_STATE: AppState = {
  user: null,
  isOnboarded: false,
  isLoading: true,
  brain: {
    content: INITIAL_BRAIN,
    lastRefactored: new Date().toISOString(),
  },
  articles: [],
  activityLogs: [],
  diaryEntries: [],
  learningTweets: [],
  bookmarks: [],
  documents: []
};

interface AppContextType extends AppState {
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  addArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  updateArticleStatus: (id: string, status: Article['status']) => Promise<void>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<void>;
  updateBrain: (content: string) => Promise<void>;
  completeOnboarding: (initialBrain: string) => Promise<void>;
  logActivity: () => Promise<void>;
  // Diary
  addDiaryEntry: (content: string) => Promise<void>;
  deleteDiaryEntry: (id: string) => Promise<void>;
  // Tweets
  addTweet: (content: string) => Promise<void>;
  deleteTweet: (id: string) => Promise<void>;
  clearTweets: () => Promise<void>;
  // Bookmarks
  addBookmark: (url: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  // Documents
  addDocument: (doc: DocumentStoredUpload) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Initialize and check session
  useEffect(() => {
    const init = async () => {
      // Check Supabase Session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check failed:", error);
      }

      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setState(prev => ({ ...prev, isLoading: false, user: null }));
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
           await loadUserData(session.user);
        } else {
           // Don't reset if we are in guest mode (user id starts with 'guest')
           setState(prev => {
             if (prev.user?.id?.startsWith('guest')) return prev;
             return { ...INITIAL_STATE, isLoading: false, user: null };
           });
        }
      });

      return () => subscription.unsubscribe();
    };
    init();
  }, []);

  const loadUserData = async (user: any) => {
    setState(prev => ({ ...prev, isLoading: true, user }));
    
    // Fetch Brain
    const { data: brainData } = await supabase.from('brains').select('*').eq('user_id', user.id).single();
    // Fetch Articles
    const { data: articlesData } = await supabase.from('articles').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
    // Fetch Logs
    const { data: logsData } = await supabase.from('activity_logs').select('*').eq('user_id', user.id);
    // Fetch Diary
    const { data: diaryData } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
    // Fetch Tweets
    const { data: tweetsData } = await supabase.from('learning_tweets').select('*').eq('user_id', user.id).order('timestamp', { ascending: false });
    // Fetch Bookmarks
    const { data: bookmarksData } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
    // Fetch Documents
    const { data: documentsData } = await supabase.from('documents').select('*').eq('user_id', user.id).order('added_at', { ascending: false });

    setState(prev => ({
      ...prev,
      isOnboarded: !!brainData, // If brain exists, user is onboarded
      isLoading: false,
      brain: brainData ? { content: brainData.content, lastRefactored: brainData.last_refactored } : prev.brain,
      articles: articlesData?.map((a: any) => ({
        id: a.id,
        url: a.url,
        title: a.title,
        summary: a.summary,
        content: a.content,
        practiceGuide: a.practice_guide,
        status: a.status,
        frequentWords: a.frequent_words || [],
        tags: a.tags || [],
        addedAt: a.added_at,
        isTestPassed: a.is_test_passed
      })) || [],
      activityLogs: logsData || [],
      diaryEntries: diaryData || [],
      learningTweets: tweetsData || [],
      bookmarks: bookmarksData?.map((b: any) => ({
          id: b.id,
          url: b.url,
          note: b.note,
          addedAt: b.added_at
      })) || [],
      documents: documentsData?.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          content: d.content,
          summary: d.summary,
          keyPoints: d.key_points || [],
          chapters: d.chapters || [],
          addedAt: d.added_at,
          fileSize: d.file_size
      })) || []
    }));
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };

  const signInAsGuest = async () => {
    setState(prev => ({
        ...prev,
        isLoading: false,
        user: { id: 'guest-user', email: 'guest@example.com', isGuest: true },
        isOnboarded: false, // Go through onboarding flow
    }));
  };

  const signOut = async () => {
    if (state.user?.isGuest) {
        setState({ ...INITIAL_STATE, isLoading: false, user: null });
    } else {
        await supabase.auth.signOut();
    }
  };

  const logActivity = async () => {
    if (!state.user) return;
    const today = new Date().toISOString().split('T')[0];
    
    // Optimistic UI update
    setState(prev => {
      const logs = [...prev.activityLogs];
      const existing = logs.find(l => l.date === today);
      if (existing) {
        existing.count += 1;
      } else {
        logs.push({ date: today, count: 1 });
      }
      return { ...prev, activityLogs: logs };
    });

    if (state.user.isGuest) return;

    // DB Upsert
    const existing = state.activityLogs.find(l => l.date === today);
    const count = existing ? existing.count + 1 : 1;
    await supabase.from('activity_logs').upsert({ 
        user_id: state.user.id, 
        date: today, 
        count: count 
    }, { onConflict: 'user_id, date' });
  };

  const addArticle = async (article: Article) => {
    if (!state.user) return;

    // Optimistic UI
    setState(prev => ({ ...prev, articles: [article, ...prev.articles] }));
    logActivity();

    if (state.user.isGuest) return;

    // DB Insert
    await supabase.from('articles').insert({
        id: article.id,
        user_id: state.user.id,
        url: article.url,
        title: article.title,
        summary: article.summary,
        content: article.content,
        practice_guide: article.practiceGuide,
        status: article.status,
        frequent_words: article.frequentWords,
        tags: article.tags,
        added_at: article.addedAt
    });
  };

  const deleteArticle = async (id: string) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, articles: prev.articles.filter(a => a.id !== id) }));
    
    if (state.user.isGuest) return;
    await supabase.from('articles').delete().eq('id', id);
  };

  const updateArticleStatus = async (id: string, status: Article['status']) => {
    if (!state.user) return;
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === id ? { ...a, status } : a)
    }));
    logActivity();
    
    if (state.user.isGuest) return;
    await supabase.from('articles').update({ status }).eq('id', id);
  };

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    if (!state.user) return;
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    
    if (state.user.isGuest) return;

    // Map camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.summary) dbUpdates.summary = updates.summary;
    if (updates.practiceGuide) dbUpdates.practice_guide = updates.practiceGuide;
    if (updates.frequentWords) dbUpdates.frequent_words = updates.frequentWords;
    if (updates.tags) dbUpdates.tags = updates.tags;
    if (updates.isTestPassed !== undefined) dbUpdates.is_test_passed = updates.isTestPassed;

    if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('articles').update(dbUpdates).eq('id', id);
    }
  };

  const updateBrain = async (content: string) => {
    if (!state.user) return;
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      brain: { ...prev.brain, content, lastRefactored: now }
    }));
    logActivity();
    
    if (state.user.isGuest) return;

    // Upsert Brain
    const { data: existingBrain } = await supabase.from('brains').select('id').eq('user_id', state.user.id).single();
    if (existingBrain) {
        await supabase.from('brains').update({ content, last_refactored: now }).eq('id', existingBrain.id);
    } else {
        await supabase.from('brains').insert({ user_id: state.user.id, content, last_refactored: now });
    }
  };

  const completeOnboarding = async (initialBrain: string) => {
    if (!state.user) return;
    const now = new Date().toISOString();
    
    setState(prev => ({
      ...prev,
      isOnboarded: true,
      brain: { content: initialBrain, lastRefactored: now }
    }));

    if (state.user.isGuest) return;

    await supabase.from('brains').insert({
        user_id: state.user.id,
        content: initialBrain,
        last_refactored: now
    });
  };

  // Diary Actions
  const addDiaryEntry = async (content: string) => {
    if (!state.user) return;
    const now = new Date().toISOString();
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content,
      date: now
    };
    setState(prev => ({ ...prev, diaryEntries: [newEntry, ...prev.diaryEntries] }));
    logActivity();

    if (state.user.isGuest) return;

    await supabase.from('diary_entries').insert({
        id: newEntry.id,
        user_id: state.user.id,
        content: newEntry.content,
        date: newEntry.date
    });
  };

  const deleteDiaryEntry = async (id: string) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, diaryEntries: prev.diaryEntries.filter(e => e.id !== id) }));
    
    if (state.user.isGuest) return;
    await supabase.from('diary_entries').delete().eq('id', id);
  };

  // Tweet Actions
  const addTweet = async (content: string) => {
    if (!state.user) return;
    const now = Date.now();
    const newTweet: LearningTweet = {
      id: crypto.randomUUID(),
      content,
      timestamp: now
    };
    setState(prev => ({ ...prev, learningTweets: [newTweet, ...prev.learningTweets] }));
    
    if (state.user.isGuest) return;

    await supabase.from('learning_tweets').insert({
        id: newTweet.id,
        user_id: state.user.id,
        content: newTweet.content,
        timestamp: newTweet.timestamp
    });
  };

  const deleteTweet = async (id: string) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, learningTweets: prev.learningTweets.filter(t => t.id !== id) }));
    
    if (state.user.isGuest) return;
    await supabase.from('learning_tweets').delete().eq('id', id);
  };

  const clearTweets = async () => {
    if (!state.user) return;
    setState(prev => ({ ...prev, learningTweets: [] }));
    
    if (state.user.isGuest) return;
    await supabase.from('learning_tweets').delete().eq('user_id', state.user.id);
  };

  // Bookmark Actions
  const addBookmark = async (url: string) => {
    if (!state.user) return;
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      url,
      addedAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, bookmarks: [newBookmark, ...prev.bookmarks] }));

    if (state.user.isGuest) return;

    await supabase.from('bookmarks').insert({
        id: newBookmark.id,
        user_id: state.user.id,
        url: newBookmark.url,
        added_at: newBookmark.addedAt
    });
  };

  const removeBookmark = async (id: string) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, bookmarks: prev.bookmarks.filter(b => b.id !== id) }));

    if (state.user.isGuest) return;
    await supabase.from('bookmarks').delete().eq('id', id);
  };

  // Document Actions
  const addDocument = async (doc: DocumentStoredUpload) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, documents: [doc, ...prev.documents] }));
    logActivity();

    if (state.user.isGuest) return;

    await supabase.from('documents').insert({
      id: doc.id,
      user_id: state.user.id,
      name: doc.name,
      type: doc.type,
      content: doc.content,
      summary: doc.summary,
      key_points: doc.keyPoints,
      chapters: doc.chapters,
      added_at: doc.addedAt,
      file_size: doc.fileSize
    });
  };

  const deleteDocument = async (id: string) => {
    if (!state.user) return;
    setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));

    if (state.user.isGuest) return;
    await supabase.from('documents').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{
      ...state,
      signInWithGoogle,
      signInWithGitHub,
      signInAsGuest,
      signOut,
      addArticle,
      deleteArticle,
      updateArticleStatus,
      updateArticle,
      updateBrain,
      completeOnboarding,
      logActivity,
      addDiaryEntry,
      deleteDiaryEntry,
      addTweet,
      deleteTweet,
      clearTweets,
      addBookmark,
      removeBookmark,
      addDocument,
      deleteDocument
    }}>
      {children}
    </AppContext.Provider>
  );
};