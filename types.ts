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

export interface AppState {
  user: any | null; // Supabase user
  brain: PersonalBrain;
  articles: Article[];
  activityLogs: ActivityLog[];
  diaryEntries: DiaryEntry[];
  learningTweets: LearningTweet[];
  bookmarks: Bookmark[];
  isOnboarded: boolean;
  isLoading: boolean;
}