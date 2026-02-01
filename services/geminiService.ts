import { GoogleGenAI, Type } from "@google/genai";
import { Article, FrequentWord, GraphData, PersonalBrain, QuizQuestion, LearningTweet } from "../types";

// Environment variable access for Next.js
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const FIRECRAWL_API_KEY = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || '';

// Initialize Gemini with a fallback key to prevent runtime crash on initialization if env is missing
// The actual API call will fail gracefully instead of the entire app crashing
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

// Models
const TEXT_MODEL = 'gemini-3-flash-preview';
const REASONING_MODEL = 'gemini-3-pro-preview';

/**
 * Utility to clean up dense markdown and improve Japanese readability
 * Aggressively filters out noise from scraped content
 */
const cleanMarkdown = (text: string): string => {
  if (!text) return "";

  let cleaned = text;

  // 0. Remove common SNS/share button patterns FIRST
  const noisePatterns = [
    // SNS share buttons
    /X\(Twitter\).*?はてなブックマーク.*?(?=\n|$)/gi,
    /にポスト.*?登録\n?/gi,
    /Twitter.*?Facebook.*?(?:\n|$)/gi,
    /Xにシェア|Facebookでシェア|はてなブックマーク/gi,

    // Backslash-wrapped keywords (\ \ AI \ \ Flutter \ \)
    /\\+\s*[A-Za-z]+\s*\\+/g,
    /\\+\s*([ぁ-ん]|[ァ-ヴー]|[一-龥])+\s*\\+/g,

    // Single line with just numbers (page numbers, line numbers)
    /^\s*(\d{1,3})\s*$/gm,

    // Lines with only symbols
    /^\s*[|\/\\~\-=]*\s*$/gm,

    // Comment-like markers (//)
    /^\/\/\s+[^\n]*$/gm,

    // Tag-like patterns
    /^\s*[#]+\s*(?:[a-z]+|[ぁ-ん]+|[ァ-ヴー]+)\s*$/gm,

    // Sponsored/Ad indicators
    /※.*?(?:広告|提供|スポンサー).*/gi,
    /\[?(?:広告|AD|Related|More)\]?/gi,

    // Navigation breadcrumbs
    /^\s*(?:ホーム|トップ|前へ|次へ|メニュー)\s*>\s*.*$/gm,
  ];

  noisePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 1. Line-by-line filtering
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();

    // Skip completely empty lines (but preserve paragraph breaks)
    if (trimmed.length === 0) return true;

    // Skip lines with only numbers
    if (/^\d+$/.test(trimmed)) return false;

    // Skip lines with only symbols/special chars
    if (/^[|\/\\~\-=\*\s]+$/.test(trimmed)) return false;

    // Skip if it's only backslash-wrapped text
    if (/^\\+\s*[A-Za-z\s]+\\+$/.test(trimmed)) return false;

    // Skip pure URL lines without context
    if (/^https?:\/\/[^\s]+$/.test(trimmed)) return false;

    // Skip navigation-like text
    if (/^(メニュー|ホーム|トップ|サイトマップ|お問い合わせ|プライバシー|利用規約|戻る|次へ|前へ)$/i.test(trimmed)) return false;

    return true;
  });

  cleaned = filteredLines.join('\n');

  // 2. Basic Markdown cleaning
  // Ensure space before headers
  cleaned = cleaned.replace(/(?<!\n)\n(#+ )/g, "\n\n$1");
  // Ensure space before lists
  cleaned = cleaned.replace(/(?<!\n)\n(- )/g, "\n\n$1");
  // Ensure space before numbered lists (but not page numbers)
  cleaned = cleaned.replace(/(?<!\n)\n(\d{1,2}\. [A-Za-zぁ-ん])/g, "\n\n$1");
  // Ensure space before code blocks
  cleaned = cleaned.replace(/(?<!\n)\n(```)/g, "\n\n$1");

  // 3. Japanese readability improvement (Sentence spacing)
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const parts = cleaned.split(codeBlockRegex);

  cleaned = parts.map(part => {
    if (part.startsWith('```')) return part;

    // Replace "。" with "。\n\n" for paragraph breaks
    let readablePart = part.replace(/。(?!\n)/g, '。\n\n');
    return readablePart;
  }).join('');

  // 4. Remove excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');

  // 5. Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * Stage 1: Fast Fetch
 * Just fetches the content and title. No heavy AI analysis yet.
 */
export const fetchArticleContent = async (url: string): Promise<Partial<Article>> => {
  let content = "";
  let title = "新しい記事 (読み込み中)";
  
  // Check domain for specialized handling
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isTwitter = url.includes('twitter.com') || url.includes('x.com');
  
  // 1. Firecrawl API (Text articles)
  // Skip Firecrawl for Youtube/X as it might struggle with JS/Video content, rely on Gemini Search instead.
  if (FIRECRAWL_API_KEY && !isYoutube && !isTwitter) {
    try {
      console.log(`Scraping ${url} with Firecrawl...`);
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          excludeTags: [
            'nav', 'header', 'footer', 'aside', 'script', 'style', 'form', 'iframe',
            'svg', 'noscript', 'meta', 'link', 'button', 'input', 'select', 'textarea'
          ],
          removeCSSSelectors: [
            // Social share buttons
            '.social-share', '.share-buttons', '.sns-share', '.sns',
            '[class*="twitter"]', '[class*="facebook"]', '[class*="share"]',
            // Navigation
            '.navbar', '.nav', '.menu', '.sidebar', '.toc', '.breadcrumb',
            // Ads
            '.advertisement', '.ad', '.ads', '.banner', '[data-ad]', '[class*="sponsor"]',
            // Related content
            '.related', '.recommended', '.more-articles', '[class*="related"]',
            // Comments and forms
            '.comments', '.comment-form', '[class*="widget"]',
            // Tags and metadata
            '.tags', '.categories', '.meta', '.post-meta', '.author-info',
            // Avatar and profile images (not article content images)
            '.avatar', '.profile-image', '[class*="author-avatar"]', '[class*="user-icon"]',
            // Icon images (logos, social icons)
            '[class*="logo"]', '[class*="icon"]:not([class*="article"])'
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data?.markdown) {
          content = json.data.markdown;
          // Simple title extraction attempt from markdown # header
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) title = titleMatch[1];
          else if (json.data.metadata?.title) title = json.data.metadata.title;
        }
      }
    } catch (error) {
      console.error("Firecrawl scraping failed:", error);
    }
  }

  // 2. Fallback / Primary for Video & Social: Gemini Search
  // If content is still empty, or it's a special domain
  if (!content) {
    console.log("Fetching content via Gemini Search...");
    try {
      let searchPrompt = `URL: ${url} の記事の**本文のみ**をMarkdown形式で取得してください。

以下のようなノイズは**絶対に含めないでください**:
- SNS共有ボタン（「X(Twitter)にポスト」「Facebookに投稿」「はてなブックマーク」など）
- ナビゲーションメニューやサイト管理メニュー
- ページ番号や行番号（単なる数字）
- タグやカテゴリー表記
- 広告やスポンサー表記
- 著者情報や投稿日時（記事本文に関係ない場合）

**記事の実質的な本文のみを抽出**してください。`;

      if (isYoutube) {
        searchPrompt = `URL: ${url} はYouTube動画です。この動画の「タイトル」と「内容の詳細な要約（文字起こしのような詳細レベル）」を取得してください。

ノイズは含めないでください:
- ライク数やコメント数などの統計情報
- 関連動画のリンク
- チャンネル情報やプロフィール

実質的な動画の内容のみをMarkdown形式で出力してください。`;
      } else if (isTwitter) {
        searchPrompt = `URL: ${url} はX (旧Twitter) の投稿です。このスレッドまたはポストの**テキスト内容のみ**を全文取得してください。

以下は含めないでください:
- いいね数やリツイート数
- プロフィール情報
- 他ユーザーへのメンション（スレッド本体でなければ）

投稿の実質的なテキスト内容をMarkdown形式で出力してください。`;
      }

      const searchResponse = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: searchPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      if (searchResponse.text) {
        content = searchResponse.text;
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) title = titleMatch[1];
        else if (isYoutube) title = "YouTube Video Analysis";
        else if (isTwitter) title = "X Post Analysis";
      }
    } catch (e) {
      console.error("Gemini Search failed", e);
    }
  }

  // 3. Fallback: Mock
  if (!content) {
    content = "# (コンテンツの取得に失敗しました)\n\nURLを確認してください。または、サイトがスクレイピングをブロックしている可能性があります。";
  }

  return {
    url,
    title,
    content: cleanMarkdown(content), // Apply cleaning
    summary: "AI解析中... (APIキーを確認してください)",
    practiceGuide: "解析中...",
    frequentWords: [],
    tags: [],
    status: 'new',
    addedAt: new Date().toISOString(),
  };
};

/**
 * Stage 2: Background Analysis
 * Generates Summary, 3 Patterns for Skill Improvement, Tags, etc.
 */
export const analyzeArticleContent = async (content: string, preferences?: any): Promise<Partial<Article>> => {
  const analysisPrompt = `
    # 役割
    あなたは、エンジニアの技術力向上を支援する「専属キャリアコーチ」です。

    # 入力テキスト
    ${content.substring(0, 30000)} ... (truncated for prompt)

    # 重要な注意事項 - ノイズフィルタリング
    入力テキストには、以下のようなノイズが含まれている可能性があります。**これらは絶対に無視してください**:

    - SNS共有ボタンテキスト: 「X(Twitter)にポスト」「Facebookに投稿」「はてなブックマークに登録」など
    - ナビゲーションリンク: メニュー、パンくずリスト、関連記事リンク
    - ページ番号・行番号: 単なる数字「67」「40」など
    - ロゴやカテゴリー記号: 「\ \ AI \ \」「\ \ Flutter \ \」などのバックスラッシュ囲み
    - タグやカテゴリー: 「#」記号のみの行、複数の「技術」タグ
    - 広告・スポンサー: 「※広告」「提供:」「スポンサー」
    - 著者情報・メタデータ: 投稿日時、著者プロフィール（要約に不要な場合）

    **記事の実質的な本文内容にのみ集中**して分析し、上記のノイズは完全に除外してください。

    # タスク
    この記事を分析し、エンジニアが実務や学習に活かすための具体的な提案を作成してください。

    # 出力要件 (JSON)
    以下の構造でJSONのみを出力してください。Markdownコードブロックは不要です。

    1. **summary**: 記事の要約（300文字程度）。
    2. **title**: 記事の最適なタイトル（補正が必要な場合）。
    3. **skillImprovementPatterns**: 「技術を高めるための3つの活用パターン」を配列で返してください。
       各パターンは以下のフィールドを持ちます:
       - icon: 内容を表すLucideアイコン名に近い短い英単語 (例: "code", "database", "rocket", "book")
       - title: キャッチーな見出し (例: "React Server Componentsでパフォーマンスを極める")
       - summary: 概要 (100文字程度)
       - action: 明日からできる具体的なアクション (Markdown形式、コード例を含めても良い)
    
    4. **tags**: 記事に関連する技術タグ（例: React, Architecture）5つ以内。
    5. **frequentWords**: 重要キーワード抽出（定義付き）。

    **注意**: "practiceGuide" フィールドには、skillImprovementPatterns配列をJSON.stringifyした文字列を入れてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            skillImprovementPatterns: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  icon: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  action: { type: Type.STRING }
                }
              }
            },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            frequentWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  definition: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    let rawText = response.text || '{}';
    rawText = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const data = JSON.parse(rawText);

    return {
      title: data.title,
      summary: data.summary,
      practiceGuide: JSON.stringify(data.skillImprovementPatterns), // Store as JSON string
      tags: data.tags,
      frequentWords: data.frequentWords,
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      summary: "解析に失敗しました。",
      practiceGuide: "解析に失敗しました。",
    };
  }
};

/**
 * Generate Step-by-Step Guide for a specific pattern
 */
export const generateStepByStepGuide = async (articleContent: string, patternTitle: string, patternAction: string): Promise<string> => {
  const prompt = `
    以下の技術記事の内容と、抽出されたアクションプランに基づき、
    初学者が実際に手を動かして実行できる「具体的かつ詳細なステップバイステップ・チュートリアル」を作成してください。
    
    ターゲット: 実務経験1年未満のジュニアエンジニア
    トーン: 励ますような、優しくわかりやすい口調
    
    アクションのテーマ: ${patternTitle}
    アクションの概要: ${patternAction}

    記事コンテキスト:
    ${articleContent.substring(0, 10000)}

    要件:
    - 可能な限りコードスニペットを含めること
    - 1ステップずつ明確に手順を示すこと (Step 1, Step 2...)
    - なぜその手順が必要なのかの「理由」も添えること
    - Markdown形式で出力
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt
    });
    return response.text || "ガイドを生成できませんでした。";
  } catch (e) {
    return "エラーが発生しました。もう一度お試しください。";
  }
};


export const sendChatMessage = async (
  message: string, 
  mode: 'article' | 'advisor' | 'brain', 
  articleContent: string, 
  brainContent: string,
  preferences?: any
): Promise<string> => {
  const persona = preferences?.aiPersona || 'mentor';
  const language = preferences?.language || 'japanese';

  const personaPrompts = {
    mentor: "あなたは優しく励ますメンターです。初心者に寄り添い、ポジティブな言葉で導いてください。",
    coach: "あなたは厳しく的確なプロのコーチです。無駄を省き、改善点をストレートに指摘してください。",
    socratic: "あなたはソクラテス式の対話を行う哲学者です。直接答えを教えるのではなく、賢明な問いかけによってユーザー自身に答えを導き出させてください。"
  };

  const langPrompt = language === 'english' ? "Please respond in English." : "回答は日本語で行ってください。";

  let systemInstruction = "";
  if (mode === 'article') {
    systemInstruction = `${personaPrompts[persona as keyof typeof personaPrompts]}\n記事のコンテキストのみに基づいて回答してください: \n\n${articleContent}\n\n${langPrompt}`;
  } else if (mode === 'brain') {
    systemInstruction = `${personaPrompts[persona as keyof typeof personaPrompts]}\nユーザーの過去の全学習記録（Brain Context）に基づいて、質問に答えてください。過去の知識から関連する情報を引き出し、繋がりを意識して回答してください。\n\nBrain Context:\n${brainContent}\n\n${langPrompt}`;
  } else {
    systemInstruction = `${personaPrompts[persona as keyof typeof personaPrompts]}\nBrain ContextとArticle Contextを比較し助言してください。\n\n${langPrompt}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: message,
      config: { systemInstruction }
    });
    return response.text || "エラー";
  } catch (e) { return "エラー"; }
};

export const generateMergeProposal = async (article: Article, brain: PersonalBrain): Promise<string> => {
    // Same implementation
    const prompt = `Merge proposal for ${article.title}. Brain: ${brain.content.substring(0,1000)}. Article Guide: ${article.practiceGuide}`;
    try {
        const r = await ai.models.generateContent({ model: TEXT_MODEL, contents: prompt });
        return r.text || "";
    } catch(e) { return ""; }
};

export const generateQuiz = async (content: string): Promise<QuizQuestion[]> => {
    try {
        // Explicitly request Japanese language
        const r = await ai.models.generateContent({
            model: TEXT_MODEL, 
            contents: `Generate 10 multiple choice quiz questions based on the content. 
            The questions and options MUST be in Japanese language (日本語).
            Return JSON array.
            
            Content: ${content.substring(0, 15000)}`,
            config: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER, description: "0-based index of the correct option (0, 1, 2, or 3)." }
                  },
                  required: ["question", "options", "correctIndex"]
                }
              }
            }
        });
        
        const text = r.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch(e) { 
        console.error("Quiz generation failed", e);
        return []; 
    }
};

export const generateKnowledgeGraph = async (content: string): Promise<GraphData> => {
    // Same local parsing logic
    const nodes: any[] = [{id:"Brain", group:0, val:30}];
    const links: any[] = [];
    // ... simplified local parsing logic ...
    return { nodes, links };
};

export const draftDiaryFromTweets = async (tweets: LearningTweet[]): Promise<string> => {
    if (tweets.length === 0) return "";
    
    const tweetContent = tweets.map(t => `- [${new Date(t.timestamp).toLocaleTimeString()}] ${t.content}`).join('\n');
    const prompt = `
      以下の「学習つぶやき（Learning Tweets）」は、あるエンジニアが学習中に書き留めた断片的なメモや思考です。
      これらを元に、整理された「学習日記（Tech Diary）」のドラフトを作成してください。

      つぶやき:
      ${tweetContent}

      要件:
      - 日付は見出しにする（今日の日付）
      - 「やったこと」「学んだこと」「次の課題」のような構造的なセクションに分ける
      - 感情的なつぶやきも、振り返りとして意味のある形に取り込む
      - Markdown形式で出力
    `;

    try {
        const r = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt
        });
        return r.text || "";
    } catch (e) {
        return "ドラフト生成に失敗しました。";
    }
}

/**
 * Teaching Mode: AI acts as a beginner asking questions
 */
export const getTeachingResponse = async (
    articleContent: string,
    history: { role: string, content: string }[],
    lastUserAnswer?: string
): Promise<string> => {
    const systemInstruction = `
        役割: あなたは「物分かりの悪い初心者エンジニア」です。
        タスク: ユーザー（先輩エンジニア）から、以下の記事の内容について教えてもらってください。

        記事内容:
        ${articleContent.substring(0, 10000)}

        ルール:
        1. 常に「敬語だけど少し自信なさげ」なトーンで話してください。
        2. ユーザーの説明が専門用語だらけだったり、抽象的すぎたりする場合は、「えっと、つまりどういうことですか？」「その〇〇って何ですか？」と素直に聞き返してください。
        3. ユーザーの説明が分かりやすく、核心を突いている場合は、「なるほど！つまり〜〜ということですね！」と理解を示し、さらに「じゃあ、この場合はどうなるんですか？」と応用的な質問をしてください。
        4. 1回の発言は短く（150文字以内）。
        5. 最初に会話を始める場合は、記事のメインテーマについて「これって結局何なんですか？」と聞いてください。
    `;

    // Construct chat history for the model
    let contents = [];
    
    if (!lastUserAnswer && history.length === 0) {
        // First message trigger
        contents = [{ role: 'user', parts: [{ text: "私にこの記事の内容を教えてください。最初の質問をしてください。" }] }];
    } else {
        // Standard turn
        // Convert history to compatible format if needed, here we simplified
        contents = [
             { role: 'user', parts: [{ text: "今から教えます。" }] },
             ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.content }] })),
        ];
        if (lastUserAnswer) {
             contents.push({ role: 'user', parts: [{ text: lastUserAnswer }] });
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: REASONING_MODEL, // Use Pro model for better persona
            contents: contents as any,
            config: { systemInstruction }
        });
        return response.text || "えっと...すみません、よくわかりませんでした。";
    } catch (e) {
        return "（考え込んでいます...）";
    }
};

/**
 * Gap Analysis: Recommend next topics based on Brain and Articles
 */
export const getLearningRecommendations = async (
    brainContent: string,
    articles: Article[]
): Promise<string> => {
    const articleTags = articles.flatMap(a => a.tags).join(', ');
    const articleTitles = articles.map(a => a.title).join(', ');

    const prompt = `
        あなたは優秀なエンジニアリングマネージャーです。
        私の現在の知識ベース（Brain）と、最近読んだ記事のリストを分析し、
        「次に学ぶべき技術」や「知識の空白地帯（ミッシングリンク）」を3つ提案してください。

        現在のBrain（知識ベース）:
        ${brainContent.substring(0, 5000)}

        最近読んだ記事:
        ${articleTitles}
        タグ: ${articleTags}

        出力フォーマット:
        Markdown形式。
        各提案について以下の要素を含めてください：
        1. **トピック名**: 推奨する技術や概念
        2. **理由**: 「〇〇（Brainにある知識）は理解されていますが、××の視点が不足しています」といった具体的な理由。
        3. **検索クエリ案**: 次に読むべき記事を探すための検索キーワード。
    `;

    try {
        const response = await ai.models.generateContent({
            model: REASONING_MODEL,
            contents: prompt
        });
        return response.text || "分析に失敗しました。";
    } catch (e) {
        return "エラーが発生しました。";
    }
};

/**
 * Search Result Interface
 */
export interface SearchResult {
    title: string;
    url: string;
    source: 'Zenn' | 'note' | 'Qiita';
    publishedDate?: string;
    snippet?: string;
}

// Simple in-memory cache for search results
const searchCache = new Map<string, { results: SearchResult[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Search articles by keyword from Zenn, note, and Qiita
 * Uses Gemini Search API to find recent articles
 * Results are cached for 5 minutes to improve performance
 */
export const searchArticlesByKeyword = async (
    keyword: string
): Promise<SearchResult[]> => {
    if (!keyword.trim()) return [];

    // Check cache first
    const cacheKey = keyword.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached search results for:', keyword);
        return cached.results;
    }

    try {
        // Simplified and more concise prompt for faster response
        const prompt = `キーワード「${keyword}」の技術記事を Zenn/note/Qiita から3件探してJSON形式で返してください。

\`\`\`json
[{"title":"タイトル","url":"https://完全URL","source":"Zenn","publishedDate":"2026-01-20","snippet":"要約"}]
\`\`\`

JSONのみ返し、他のテキストは不要です。`;

        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                temperature: 0.3  // Lower temperature for faster, more deterministic results
            }
        });

        const text = response.text || '';
        
        // Extract JSON from code block
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
        
        let results: SearchResult[] = [];
        
        if (jsonMatch && jsonMatch[1]) {
            results = JSON.parse(jsonMatch[1]);
        } else {
            // Fallback: try to parse the entire response as JSON
            try {
                results = JSON.parse(text);
            } catch {
                console.warn('Could not parse search results as JSON');
                results = [];
            }
        }

        // Validate and filter results
        results = Array.isArray(results) ? results.filter(r => r.title && r.url) : [];

        // Cache the results
        searchCache.set(cacheKey, { results, timestamp: Date.now() });

        return results;
    } catch (error) {
        console.error('Article search failed:', error);
        return [];
    }
};

/**
 * Discover Tech Articles: Recommend curated articles based on query
 */
export const discoverTechArticles = async (query: string): Promise<{title: string, url: string, reason: string}[]> => {
    const prompt = `
        あなたはシニアテックリードです。
        ユーザーが学習したいキーワード「${query}」に基づいて、
        **実務で役立つ、質が高い技術ブログ記事や公式ドキュメント**を3件〜5件厳選して提案してください。

        選定基準:
        - できるだけ最新の情報（この知識カットオフ時点での最新）
        - 公式ドキュメント、Zenn、Qiita、有名企業のテックブログ、Dev.to、Mediumなど信頼性の高いソース
        - なぜその記事がお勧めなのかの「推薦理由」を添える

        除外:
        - まとめサイト、質の低いQ&A、内容が薄いチュートリアル

        出力フォーマット:
        JSON配列のみ。Markdownコードブロックは不要。
        各要素のプロパティ:
        - title: 記事のタイトル
        - url: 記事のURL（実在するもの、あるいは公式ドキュメントのトップなど確実なもの）
        - reason: 推薦理由（50文字以内）
    `;

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ["title", "url", "reason"]
                    }
                }
            }
        });

        const text = response.text || '[]';
        return JSON.parse(text);
    } catch (e) {
        console.error("Discovery failed", e);
        return [];
    }
};

/**
 * Generate Public Article (Zenn/Qiita) from Diary/Notes
 */
export const generatePublicArticle = async (content: string): Promise<string> => {
    const prompt = `
        あなたは技術メディア（ZennやQiita）で人気の「テックライター」です。
        以下の断片的な「学習日記・メモ」を元に、多くの人に読まれる（バズる）技術記事を執筆してください。

        入力コンテンツ:
        ${content.substring(0, 15000)}

        執筆のルール:
        1. **タイトル**: キャッチーで、クリックしたくなる魅力的なものにする（例: 「〜を完全に理解した」「〜でハマったので解決策をまとめる」）。
        2. **構成**: 
           - **はじめに**: 読者の共感を呼ぶ導入。
           - **本文**: 見出しを使って論理的に構成。コードブロックを適切に整形。
           - **まとめ/あとがき**: 学びの総括。
        3. **文体**: "です・ます"調。親しみやすく、かつ技術的に正確に。
        4. **Zenn/Qiita互換**: Markdown形式で出力。冒頭にFrontmatter（---で囲まれたメタデータ）を含める。
           Frontmatter例:
           ---
           title: "タイトル"
           emoji: "💻"
           type: "tech"
           topics: ["React", "TypeScript"]
           published: false
           ---
        5. **プロモーション**: 記事の最後に必ず以下のフッターを追加する。
           
           ---
           *この記事は、学習記録アプリ「Knowledge Nexus」で生成されました。*

        出力形式:
        Markdownテキストのみ。
    `;

    try {
        const response = await ai.models.generateContent({
            model: REASONING_MODEL, // Use Pro model for better writing structure
            contents: prompt
        });
        return response.text || "記事の生成に失敗しました。";
    } catch (e) {
        return "エラーが発生しました。";
    }
};