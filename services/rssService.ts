import { TrendArticle } from '../types';

// キャッシュ管理
const cache = new Map<string, { data: TrendArticle[], timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10分

/**
 * Zennのトレンド記事を取得
 * 注: Zenn APIは公式に提供されていないため、現在は未実装
 * 将来的にFirecrawlなどを使用してスクレイピング実装予定
 */
export const fetchZennTrends = async (tag?: string): Promise<TrendArticle[]> => {
  // 今は空配列を返す（将来実装）
  return [];
};

/**
 * Qiitaのトレンド記事を取得
 */
export const fetchQiitaTrends = async (tag?: string): Promise<TrendArticle[]> => {
  const cacheKey = `qiita_${tag || 'all'}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Qiita APIのトレンド記事を取得
    const params = new URLSearchParams({
      page: '1',
      per_page: '20',
      query: tag ? `tag:${tag} stocks:>50` : 'stocks:>100'
    });
    
    const response = await fetch(`https://qiita.com/api/v2/items?${params}`);
    
    if (!response.ok) {
      throw new Error('Qiita API failed');
    }

    const data = await response.json();
    
    const trendArticles: TrendArticle[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      author: item.user.id,
      publishedAt: item.created_at,
      tags: item.tags.map((t: any) => t.name),
      likes: item.likes_count,
      source: 'Qiita' as const,
      excerpt: item.body?.substring(0, 150) || ''
    }));

    cache.set(cacheKey, { data: trendArticles, timestamp: Date.now() });
    return trendArticles;
  } catch (error) {
    console.error('Failed to fetch Qiita trends:', error);
    return [];
  }
};

/**
 * すべてのトレンド記事を取得（Zenn + Qiita）
 */
export const fetchAllTrends = async (tag?: string): Promise<TrendArticle[]> => {
  try {
    // 並列で取得
    const [zennArticles, qiitaArticles] = await Promise.all([
      fetchZennTrends(tag),
      fetchQiitaTrends(tag)
    ]);

    // マージして日付でソート
    const allArticles = [...zennArticles, ...qiitaArticles];
    allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return allArticles;
  } catch (error) {
    console.error('Failed to fetch all trends:', error);
    return [];
  }
};

/**
 * 人気タグを取得
 */
export const getPopularTags = (): string[] => {
  return [
    'React',
    'TypeScript',
    'Next.js',
    'Vue.js',
    'Node.js',
    'Python',
    'Go',
    'Rust',
    'AWS',
    'Docker',
    'AI',
    '機械学習'
  ];
};
