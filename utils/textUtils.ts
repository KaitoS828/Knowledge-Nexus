import React from 'react';

// 画像マークダウンとHTMLタグを削除するユーティリティ関数
export const cleanExcerpt = (text: string): string => {
  if (!text) return '';
  
  return text
    // 画像マークダウン ![alt](url) を削除
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // HTMLタグを削除
    .replace(/<[^>]*>/g, '')
    // 連続する空白を1つに
    .replace(/\s+/g, ' ')
    // 前後の空白を削除
    .trim();
};

// Qiitaのロゴアイコンコンポーネント
export const QiitaLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <div 
    className="flex items-center justify-center rounded"
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: '#55C500' 
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: size * 0.6 }}>Q</span>
  </div>
);

// Zennのロゴアイコンコンポーネント
export const ZennLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <div 
    className="flex items-center justify-center rounded"
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: '#3EA8FF' 
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: size * 0.6 }}>Z</span>
  </div>
);
