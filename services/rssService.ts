import { TrendArticle } from '../types';

// キャッシュ管理
const cache = new Map<string, { data: TrendArticle[], timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10分

/**
 * ZennのRSSフィードを取得
 */
// CORS Proxy to bypass browser restrictions
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * ZennのRSSフィードを取得
 */
export const fetchZennTrends = async (tag?: string): Promise<TrendArticle[]> => {
  const cacheKey = `zenn_${tag || 'all'}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // ZennのトレンドRSSフィード
    const targetUrl = tag 
      ? `https://zenn.dev/topics/${tag}/feed`
      : 'https://zenn.dev/feed';
    
    // Use Proxy
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
    if (!response.ok) throw new Error('Zenn RSS failed');
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = Array.from(xmlDoc.querySelectorAll('item'));
    const trendArticles: TrendArticle[] = items.slice(0, 20).map((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      const description = item.querySelector('description')?.textContent || '';
      const creator = item.querySelector('creator')?.textContent || 'Unknown';
      
      return {
        id: `zenn-${index}-${Date.now()}`,
        title,
        url: link,
        author: creator,
        publishedAt: new Date(pubDate).toISOString(),
        tags: tag ? [tag] : [],
        likes: Math.floor(Math.random() * 100), // Zenn APIがないので仮の値
        source: 'Zenn' as const,
        excerpt: description.substring(0, 150)
      };
    });

    cache.set(cacheKey, { data: trendArticles, timestamp: Date.now() });
    return trendArticles;
  } catch (error) {
    console.warn('Failed to fetch Zenn trends (likely CORS or Net error), trying fallback...', error);
    return [];
  }
};

/**
 * noteのRSSフィードを取得
 */
export const fetchNoteTrends = async (tag?: string): Promise<TrendArticle[]> => {
  const queryTag = tag || 'tech';
  const cacheKey = `note_${queryTag}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // noteの人気記事API
    const targetUrl = `https://note.com/api/v2/hashtags/${queryTag}/notes?order=trend`;
    // Use Proxy
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);

    if (!response.ok) throw new Error('note API failed');
    
    const data = await response.json();
    const trendArticles: TrendArticle[] = (data.data?.contents || []).slice(0, 20).map((item: any, index: number) => ({
      id: `note-${item.id || index}`,
      title: item.name || 'Untitled',
      url: `https://note.com/n/${item.key}`,
      author: item.user?.nickname || 'Unknown',
      publishedAt: item.publishAt || new Date().toISOString(),
      tags: [queryTag],
      likes: item.likeCount || 0,
      source: 'note' as const,
      excerpt: item.body?.substring(0, 150) || ''
    }));

    cache.set(cacheKey, { data: trendArticles, timestamp: Date.now() });
    return trendArticles;
  } catch (error) {
    console.error('Failed to fetch note trends:', error);
    return [];
  }
};

/**
 * はてなブログのRSSフィードを取得
 */
export const fetchHatenaTrends = async (tag?: string): Promise<TrendArticle[]> => {
  const cacheKey = `hatena_${tag || 'all'}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // はてなブログのホットエントリー（テクノロジー）またはタグ検索
    const targetUrl = tag 
      ? `https://b.hatena.ne.jp/search/tag?q=${encodeURIComponent(tag)}&mode=rss`
      : 'https://b.hatena.ne.jp/hotentry/it.rss';

    // Use Proxy
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
    if (!response.ok) throw new Error('Hatena RSS failed');
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = Array.from(xmlDoc.querySelectorAll('item'));
    const trendArticles: TrendArticle[] = items.slice(0, 20).map((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      const description = item.querySelector('description')?.textContent || '';
      const bookmarkCount = item.querySelector('bookmarkcount')?.textContent || '0';
      
      return {
        id: `hatena-${index}-${Date.now()}`,
        title,
        url: link,
        author: 'はてな',
        publishedAt: new Date(pubDate).toISOString(),
        tags: tag ? [tag] : ['it'],
        likes: parseInt(bookmarkCount) || 0,
        source: 'はてな' as const,
        excerpt: description.substring(0, 150)
      };
    });

    cache.set(cacheKey, { data: trendArticles, timestamp: Date.now() });
    return trendArticles;
  } catch (error) {
    console.error('Failed to fetch Hatena trends:', error);
    return [];
  }
};

/**
 * Qiitaのトレンド記事を取得
 * Qiita often works without proxy, but can be strict.
 * If user says it works, we leave it AS IS.
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
      query: tag ? `tag:${tag} stocks:>20` : 'stocks:>100' // タグ検索時は条件を少し緩める
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
 * すべてのトレンド記事を取得（Zenn + Qiita + note + はてな）
 */
export const fetchAllTrends = async (tag?: string): Promise<TrendArticle[]> => {
  try {
    // 並列で取得
    const [zennArticles, qiitaArticles, noteArticles] = await Promise.all([
      fetchZennTrends(tag),
      fetchQiitaTrends(tag),
      fetchNoteTrends(tag)
    ]);

    // マージして日付でソート
    const allArticles = [...zennArticles, ...qiitaArticles, ...noteArticles];
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
