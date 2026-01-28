import { Article } from '../types';

// オンボーディング用の初期記事データ
export const ONBOARDING_ARTICLES = {
  react: [
    {
      title: 'React入門 - コンポーネントの基礎',
      url: 'https://ja.react.dev/learn',
      summary: 'Reactの基本概念であるコンポーネント、props、stateについて学びます。UIを構築するための基礎を理解しましょう。',
      content: `# React入門 - コンポーネントの基礎

## コンポーネントとは
Reactアプリケーションは、コンポーネントと呼ばれる小さな部品から構成されます。

## Propsの使い方
親コンポーネントから子コンポーネントへデータを渡す仕組みです。

## Stateの管理
コンポーネント内で変化するデータを管理します。`,
      tags: ['React', 'JavaScript', '初心者', 'コンポーネント'],
      frequentWords: [
        { word: 'コンポーネント', count: 5, definition: 'UIの再利用可能な部品' },
        { word: 'Props', count: 3, definition: '親から子へ渡されるデータ' },
        { word: 'State', count: 3, definition: 'コンポーネントの内部状態' }
      ],
      practiceGuide: '1. シンプルなコンポーネントを作成してみましょう\n2. Propsを使ってデータを渡してみましょう\n3. useStateフックを使って状態管理を実装してみましょう'
    },
    {
      title: 'React Hooks完全ガイド',
      url: 'https://ja.react.dev/reference/react',
      summary: 'useState、useEffect、useContextなど、よく使われるHooksの使い方を習得します。',
      content: `# React Hooks完全ガイド

## useState
状態管理の基本となるフックです。

## useEffect
副作用を扱うためのフックです。

## useContext
グローバルな状態を管理します。`,
      tags: ['React', 'Hooks', 'useState', 'useEffect'],
      frequentWords: [
        { word: 'Hooks', count: 4, definition: 'Reactの機能を関数コンポーネントで使う仕組み' },
        { word: 'useState', count: 3, definition: '状態管理フック' },
        { word: 'useEffect', count: 3, definition: '副作用処理フック' }
      ],
      practiceGuide: '1. useStateでカウンターを作成\n2. useEffectでAPI呼び出しを実装\n3. useContextでテーマ切り替えを実装'
    },
    {
      title: 'Reactパフォーマンス最適化',
      url: 'https://ja.react.dev/learn/render-and-commit',
      summary: 'useMemo、useCallback、React.memoを使った最適化手法を学びます。',
      content: `# Reactパフォーマンス最適化

## useMemo
計算結果をメモ化します。

## useCallback
関数をメモ化します。

## React.memo
コンポーネントをメモ化します。`,
      tags: ['React', 'パフォーマンス', 'useMemo', '最適化'],
      frequentWords: [
        { word: 'メモ化', count: 4, definition: '計算結果をキャッシュする技術' },
        { word: 'useMemo', count: 2, definition: '値のメモ化フック' },
        { word: 'useCallback', count: 2, definition: '関数のメモ化フック' }
      ],
      practiceGuide: '1. 重い計算をuseMemoで最適化\n2. コールバック関数をuseCallbackでメモ化\n3. React.memoで不要な再レンダリングを防止'
    }
  ],
  
  typescript: [
    {
      title: 'TypeScript基礎 - 型システム入門',
      url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html',
      summary: 'TypeScriptの型システムの基礎を学び、型安全なコードを書けるようになります。',
      content: `# TypeScript基礎 - 型システム入門

## 基本的な型
string, number, boolean, array, objectなど。

## インターフェース
オブジェクトの形を定義します。

## ジェネリクス
型の再利用性を高めます。`,
      tags: ['TypeScript', '型安全', 'インターフェース'],
      frequentWords: [
        { word: '型', count: 5, definition: 'データの種類を定義する仕組み' },
        { word: 'インターフェース', count: 3, definition: 'オブジェクトの構造を定義' },
        { word: 'ジェネリクス', count: 2, definition: '型をパラメータ化する機能' }
      ],
      practiceGuide: '1. 基本的な型を使った変数宣言\n2. インターフェースでオブジェクトを定義\n3. ジェネリクスで汎用的な関数を作成'
    },
    {
      title: 'TypeScriptで型安全なReactを書く',
      url: 'https://react-typescript-cheatsheet.netlify.app/',
      summary: 'React + TypeScriptの組み合わせで、型安全なコンポーネントを作成します。',
      content: `# TypeScriptで型安全なReactを書く

## コンポーネントの型定義
Propsの型を明示的に定義します。

## Hooksの型
useStateやuseEffectで型を活用します。

## イベントハンドラ
イベントの型を正しく指定します。`,
      tags: ['TypeScript', 'React', '型安全', 'Props'],
      frequentWords: [
        { word: 'Props', count: 4, definition: 'コンポーネントのプロパティ' },
        { word: '型定義', count: 3, definition: '型を明示的に宣言すること' },
        { word: 'ジェネリクス', count: 2, definition: 'Hooksで型を指定' }
      ],
      practiceGuide: '1. Propsに型を付けたコンポーネント作成\n2. useState<T>でジェネリクスを使用\n3. イベントハンドラの型を正しく指定'
    }
  ],
  
  ai: [
    {
      title: 'AI・機械学習の基礎概念',
      url: 'https://www.coursera.org/learn/machine-learning',
      summary: '機械学習の基礎となる概念（教師あり学習、教師なし学習、深層学習）を理解します。',
      content: `# AI・機械学習の基礎概念

## 教師あり学習
正解ラベル付きデータで学習します。

## 教師なし学習
ラベルなしデータからパターンを発見します。

## 深層学習
多層ニューラルネットワークを使用します。`,
      tags: ['AI', '機械学習', '深層学習', '教師あり学習'],
      frequentWords: [
        { word: '学習', count: 5, definition: 'データからパターンを抽出すること' },
        { word: 'ニューラルネットワーク', count: 3, definition: '脳の神経回路を模した計算モデル' },
        { word: 'モデル', count: 3, definition: '学習済みのアルゴリズム' }
      ],
      practiceGuide: '1. 簡単な回帰問題を解いてみる\n2. データの前処理を実践\n3. シンプルなニューラルネットワークを構築'
    },
    {
      title: 'ChatGPT API活用ガイド',
      url: 'https://platform.openai.com/docs/guides/gpt',
      summary: 'OpenAI APIを使ったアプリケーション開発の方法を学びます。',
      content: `# ChatGPT API活用ガイド

## APIの基本
リクエストとレスポンスの構造を理解します。

## プロンプトエンジニアリング
効果的な指示の出し方を学びます。

## ストリーミング
レスポンスをリアルタイムで受け取ります。`,
      tags: ['AI', 'ChatGPT', 'API', 'プロンプト'],
      frequentWords: [
        { word: 'プロンプト', count: 4, definition: 'AIへの指示文' },
        { word: 'API', count: 3, definition: 'アプリケーションインターフェース' },
        { word: 'トークン', count: 2, definition: 'テキストの最小単位' }
      ],
      practiceGuide: '1. APIキーを取得して初回リクエスト\n2. システムメッセージでペルソナ設定\n3. ストリーミングレスポンスを実装'
    }
  ]
};

// 初期データを変換する関数
export const convertToArticles = (category: keyof typeof ONBOARDING_ARTICLES): Article[] => {
  return ONBOARDING_ARTICLES[category].map((data, index) => ({
    id: `onboarding-${category}-${index}`,
    url: data.url,
    title: data.title,
    summary: data.summary,
    content: data.content,
    practiceGuide: data.practiceGuide,
    status: 'new' as const,
    frequentWords: data.frequentWords,
    tags: data.tags,
    addedAt: new Date().toISOString(),
    analysisStatus: 'completed' as const,
    analysisProgress: 100,
  }));
};

// すべてのカテゴリを取得
export const getAllOnboardingArticles = (): Article[] => {
  return [
    ...convertToArticles('react'),
    ...convertToArticles('typescript'),
    ...convertToArticles('ai'),
  ];
};
