// TODO: Re-enable when moved to API route
// @xenova/transformers works only in Node.js environment, not in browser

import { Article, DocumentStoredUpload } from '../types';

// Types
export interface SearchResult {
  item: Article | DocumentStoredUpload;
  score: number;
  type: 'article' | 'document';
}

class LocalRAGService {
  private static instance: LocalRAGService;

  private constructor() {}

  static getInstance(): LocalRAGService {
    if (!LocalRAGService.instance) {
      LocalRAGService.instance = new LocalRAGService();
    }
    return LocalRAGService.instance;
  }

  /**
   * Initialize the embedding model and Voy index
   * NOTE: Disabled - requires server-side API route
   */
  async initialize() {
    console.warn('Local RAG is currently disabled. Will be implemented via API route.');
  }

  /**
   * Index items
   * NOTE: Disabled - requires server-side API route
   */
  async indexItems(
    articles: Article[], 
    documents: DocumentStoredUpload[]
  ) {
    console.warn('Local RAG indexing is currently disabled.');
  }

  /**
   * Search for relevant items
   * NOTE: Disabled - requires server-side API route
   */
  async search(query: string, topK = 5): Promise<SearchResult[]> {
    console.warn('Local RAG search is currently disabled.');
    return [];
  }

  /**
   * Generate Answer
   * NOTE: Disabled - requires server-side API route
   */
  async generateAnswer(query: string, results: SearchResult[]) {
    console.warn('Local RAG answer generation is currently disabled.');
    return "ローカルRAG機能は現在メンテナンス中です。";
  }
}

export const localRag = LocalRAGService.getInstance();
