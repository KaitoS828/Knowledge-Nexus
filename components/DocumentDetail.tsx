import React, { useState } from 'react';
import { DocumentStoredUpload } from '../types';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocumentDetailProps {
  document: DocumentStoredUpload;
  onBack: () => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onBack }) => {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-700"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="text-purple-600" size={20} />
              <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 uppercase">
                PDF
              </span>
            </div>
            <h1 className="text-2xl font-bold text-purple-900 line-clamp-1">{document.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600" />
            概要
          </h2>
          <div className="text-purple-800 leading-relaxed">
            <ReactMarkdown>{document.summary}</ReactMarkdown>
          </div>
        </section>

        {/* Key Points */}
        {document.keyPoints && document.keyPoints.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-500" />
              重要ポイント
            </h2>
            <ul className="space-y-3">
              {document.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-purple-800 leading-relaxed flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Chapters */}
        {document.chapters && document.chapters.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4">章ごとの詳細</h2>
            <div className="space-y-3">
              {document.chapters.map((chapter, i) => (
                <div key={i} className="border border-purple-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 mb-1">{chapter.title}</h3>
                      <p className="text-sm text-purple-600">{chapter.summary}</p>
                    </div>
                    {expandedChapter === i ? (
                      <ChevronUp className="text-purple-600 flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-purple-600 flex-shrink-0" size={20} />
                    )}
                  </button>
                  {expandedChapter === i && (
                    <div className="p-4 bg-white border-t border-purple-200">
                      <div className="text-purple-800 leading-relaxed prose prose-purple max-w-none">
                        <ReactMarkdown>{chapter.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full Content (Collapsible) */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h2 className="text-xl font-bold text-purple-900">全文テキスト</h2>
            {showFullContent ? (
              <ChevronUp className="text-purple-600" size={24} />
            ) : (
              <ChevronDown className="text-purple-600" size={24} />
            )}
          </button>
          {showFullContent && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 max-h-96 overflow-y-auto">
              <pre className="text-sm text-purple-800 whitespace-pre-wrap font-mono leading-relaxed">
                {document.content}
              </pre>
            </div>
          )}
        </section>

        {/* Metadata */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-4">ドキュメント情報</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-purple-600 font-bold mb-1">追加日時</dt>
              <dd className="text-purple-800">{new Date(document.addedAt).toLocaleString('ja-JP')}</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">ファイルサイズ</dt>
              <dd className="text-purple-800">{(document.fileSize / 1024).toFixed(2)} KB</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">種類</dt>
              <dd className="text-purple-800 uppercase">{document.type}</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">章数</dt>
              <dd className="text-purple-800">{document.chapters?.length || 0} 章</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};
