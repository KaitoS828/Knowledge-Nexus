export type ArticleStatus = 'new' | 'reading' | 'practice' | 'mastered';

export interface FrequentWord {
  word: string;
  count: number;
  definition: string; // Contextual definition
}

export interface Article {
  id: string;
  url: string;
  title: string;
  summary: string;
  content: string; // The full markdown content
  practiceGuide: string;
  status: ArticleStatus;
  frequentWords: FrequentWord[];
  tags: string[]; // AI generated tags
  addedAt: string;
  isTestPassed?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PersonalBrain {
  content: string; // The monolithic markdown
  lastRefactored: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  group: number;
  val: number; // size
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ActivityLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DiaryEntry {
  id: string;
  content: string;
  date: string; // ISO String
}

export interface LearningTweet {
  id: string;
  content: string;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  url: string;
  note?: string;
  addedAt: string;
}

export interface DocumentStoredUpload {
  id: string;
  name: string;
  type: 'pdf' | 'markdown' | 'text';
  content: string;
  summary: string;
  keyPoints: string[];
  chapters: { title: string; content: string; summary: string }[];
  addedAt: string;
  fileSize: number;
}

export type PlanType = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  billingCycle?: BillingCycle;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  operationType: 'article_analysis' | 'pdf_analysis' | 'quiz_generation' | 'chat_message' | 'brain_merge' | 'learning_action_generation';
  inputTokens: number;
  outputTokens: number;
  estimatedCostCents: number;
  resourceId?: string;
  createdAt: string;
}

export interface UsageSummary {
  totalOperations: number;
  totalCostCents: number;
}

export interface AppState {
  user: any | null; // Supabase user
  brain: PersonalBrain;
  articles: Article[];
  activityLogs: ActivityLog[];
  diaryEntries: DiaryEntry[];
  learningTweets: LearningTweet[];
  bookmarks: Bookmark[];
  subscription: Subscription | null;
  usageSummary: UsageSummary | null;
  documents: DocumentStoredUpload[];
  isOnboarded: boolean;
  isLoading: boolean;
}