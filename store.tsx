import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Article, Bookmark, DiaryEntry, LearningTweet, DocumentStoredUpload, Subscription, UsageSummary } from './types';
import { supabase } from './services/supabase';

const INITIAL_BRAIN = `# 私のエンジニア外部脳

## Frontend
- **React**: UI構築のためのライブラリ。コンポーネント指向。
- **TypeScript**: 型付きJavaScript。スケーラビリティに必須。

## Backend
- **Node.js**: JSランタイム。
`;

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'japanese',
  aiPersona: 'mentor',
  codeTheme: 'github',
  summaryDetail: 'standard',
  notificationsEnabled: true
};

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
  documents: [],
  subscription: null,
  usageSummary: null,
  preferences: DEFAULT_PREFERENCES
};

interface AppContextType extends AppState {
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
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
  // Subscription
  upgradeToProMonthly: () => Promise<void>;
  upgradeToProYearly: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkUsageLimit: () => Promise<boolean>;
  checkStorageLimit: () => boolean;
  logUsage: (operationType: string, inputTokens: number, outputTokens: number, resourceId?: string) => Promise<void>;
  refreshUsage: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  deleteAccount: () => Promise<void>;
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

    // Fetch Subscription
    const { data: subscriptionData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();

    // Fetch Current Month Usage
    const { data: usageData } = await supabase.rpc('get_current_month_usage', { p_user_id: user.id }).single();

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
      })) || [],
      subscription: subscriptionData ? {
        id: subscriptionData.id,
        userId: subscriptionData.user_id,
        planType: subscriptionData.plan_type,
        billingCycle: subscriptionData.billing_cycle,
        status: subscriptionData.status,
        stripeCustomerId: subscriptionData.stripe_customer_id,
        stripeSubscriptionId: subscriptionData.stripe_subscription_id,
        stripePriceId: subscriptionData.stripe_price_id,
        currentPeriodStart: subscriptionData.current_period_start,
        currentPeriodEnd: subscriptionData.current_period_end,
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        canceledAt: subscriptionData.canceled_at,
        createdAt: subscriptionData.created_at,
        updatedAt: subscriptionData.updated_at
      } : null,
      usageSummary: usageData ? {
        totalOperations: usageData.total_operations,
        totalCostCents: usageData.total_cost_cents
      } : { totalOperations: 0, totalCostCents: 0 }
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


  const signUpWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw new Error(error.message || 'メール送信に失敗しました');
      }
    } catch (err: any) {
      throw new Error(err.message || 'メール送信に失敗しました');
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        throw new Error(error.message || 'OTP検証に失敗しました');
      }

      if (data.user) {
        await loadUserData(data.user.id);
      }
    } catch (err: any) {
      throw new Error(err.message || 'OTP検証に失敗しました');
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        throw new Error(error.message || 'メール再送信に失敗しました');
      }
    } catch (err: any) {
      throw new Error(err.message || 'メール再送信に失敗しました');
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

    // Check storage limit for free users
    if (!checkStorageLimit() && !state.user.isGuest) {
      alert('Freeプランの保存上限（2件）に達しました。Proプランにアップグレードしてください。');
      throw new Error('Storage limit reached');
    }

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

    // Check storage limit for free users
    if (!checkStorageLimit() && !state.user.isGuest) {
      alert('Freeプランの保存上限（2件）に達しました。Proプランにアップグレードしてください。');
      throw new Error('Storage limit reached');
    }

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

  // ========== Subscription Functions ==========

  const upgradeToProMonthly = async () => {
    if (!state.user || state.user.isGuest) {
      throw new Error('ログインが必要です');
    }

    // TODO: Implement Stripe checkout
    // For now, just update the database directly (for testing)
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: state.user.id,
      plan_type: 'pro',
      billing_cycle: 'monthly',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) throw error;

    // Reload user data to get updated subscription
    await loadUserData(state.user);
  };

  const upgradeToProYearly = async () => {
    if (!state.user || state.user.isGuest) {
      throw new Error('ログインが必要です');
    }

    // TODO: Implement Stripe checkout
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: state.user.id,
      plan_type: 'pro',
      billing_cycle: 'yearly',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) throw error;
    await loadUserData(state.user);
  };

  const cancelSubscription = async () => {
    if (!state.user || state.user.isGuest) return;

    const { error } = await supabase.from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString()
      })
      .eq('user_id', state.user.id);

    if (error) throw error;
    await loadUserData(state.user);
  };

  const checkUsageLimit = async (): Promise<boolean> => {
    if (!state.user) return false;
    if (state.user.isGuest) return state.usageSummary ? state.usageSummary.totalOperations < 10 : true;

    // Pro users have no limit (soft limit of 1000)
    if (state.subscription?.planType === 'pro') {
      return state.usageSummary ? state.usageSummary.totalOperations < 1000 : true;
    }

    // Free users: 10 AI operations per month
    return state.usageSummary ? state.usageSummary.totalOperations < 10 : true;
  };

  const checkStorageLimit = (): boolean => {
    if (!state.user) return false;

    // Pro users have unlimited storage
    if (state.subscription?.planType === 'pro') return true;

    // Free users: 2 items total (articles + documents)
    const totalItems = state.articles.length + state.documents.length;
    return totalItems < 2;
  };

  const logUsage = async (
    operationType: string,
    inputTokens: number,
    outputTokens: number,
    resourceId?: string
  ) => {
    if (!state.user || state.user.isGuest) return;

    // Calculate cost (Gemini 3 Flash pricing)
    // Input: $0.50 / 1M tokens, Output: $3.00 / 1M tokens
    const inputCostCents = (inputTokens / 1000000) * 0.50 * 150; // Convert to JPY cents
    const outputCostCents = (outputTokens / 1000000) * 3.00 * 150;
    const estimatedCostCents = Math.round(inputCostCents + outputCostCents);

    await supabase.from('usage_logs').insert({
      user_id: state.user.id,
      operation_type: operationType,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_cents: estimatedCostCents,
      resource_id: resourceId
    });

    // Refresh usage summary
    await refreshUsage();
  };

  const refreshUsage = async () => {
    if (!state.user || state.user.isGuest) return;

    const { data: usageData, error } = await supabase.rpc('get_current_month_usage', {
      p_user_id: state.user.id
    });

    if (error) {
        console.error("Failed to fetch usage:", error);
        return;
    }

    const typedUsage = usageData as { total_operations: number; total_cost_cents: number };

    setState(prev => ({
      ...prev,
      usageSummary: typedUsage ? {
        totalOperations: typedUsage.total_operations,
        totalCostCents: typedUsage.total_cost_cents
      } : { totalOperations: 0, totalCostCents: 0 }
    }));
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));

    if (!state.user || state.user.isGuest) return;

    const { error } = await supabase.from('user_preferences').upsert({
        user_id: state.user.id,
        ...updates,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) console.error("Failed to save preferences:", error);
  };

  const deleteAccount = async () => {
    if (!state.user || state.user.isGuest) return;

    if (!confirm('本当にアカウントを削除しますか？全てのデータが完全に消去され、復旧することはできません。')) {
        return;
    }

    try {
        const userId = state.user.id;
        await supabase.from('articles').delete().eq('user_id', userId);
        await supabase.from('brains').delete().eq('user_id', userId);
        await supabase.from('diary_entries').delete().eq('user_id', userId);
        await supabase.from('learning_tweets').delete().eq('user_id', userId);
        await supabase.from('bookmarks').delete().eq('user_id', userId);
        await supabase.from('documents').delete().eq('user_id', userId);
        await supabase.from('subscriptions').delete().eq('user_id', userId);
        await supabase.from('user_preferences').delete().eq('user_id', userId);

        await supabase.auth.signOut();
        alert('アカウントと全てのデータが削除されました。');
    } catch (e) {
        console.error("Deletion failed:", e);
        alert('削除中にエラーが発生しました。');
    }
  };

  return (
    <AppContext.Provider value={{
      ...state,
      signInWithGoogle,
      signInWithGitHub,
      signInAsGuest,
      signOut,
      signUpWithEmail,
      verifyOTP,
      resendOTP,
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
      deleteDocument,
      upgradeToProMonthly,
      upgradeToProYearly,
      cancelSubscription,
      checkUsageLimit,
      checkStorageLimit,
      logUsage,
      refreshUsage,
      updatePreferences,
      deleteAccount
    }}>
      {children}
    </AppContext.Provider>
  );
};