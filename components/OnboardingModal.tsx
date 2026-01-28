import React, { useState } from 'react';
import { X, BookOpen, Code, Sparkles, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { convertToArticles } from '../data/onboardingData';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const { addArticle, setIsOnboarded } = useAppStore();

  const topics = [
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      description: 'モダンなWebアプリ開発',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '📘',
      description: '型安全なJavaScript',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'ai',
      name: 'AI・機械学習',
      icon: '🤖',
      description: 'AIの基礎と応用',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) {
      alert('少なくとも1つのトピックを選択してください');
      return;
    }

    // 選択されたトピックの記事を追加
    for (const topic of selectedTopics) {
      const articles = convertToArticles(topic as any);
      for (const article of articles) {
        await addArticle(article);
      }
    }

    setIsOnboarded(true);
    onClose();
  };

  const handleSkip = () => {
    setIsOnboarded(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-nexus-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-nexus-100 dark:hover:bg-nexus-800 transition-colors"
          >
            <X size={20} className="text-nexus-600 dark:text-nexus-400" />
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-nexus-900 to-nexus-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-nexus-900 dark:text-nexus-50 mb-2">
              Knowledge Nexusへようこそ！
            </h2>
            <p className="text-nexus-600 dark:text-nexus-400 text-lg">
              学習の旅を始めましょう 🚀
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-nexus-900 dark:text-nexus-100 mb-2">
              💡 知識の種を植えよう
            </h3>
            <p className="text-sm text-nexus-600 dark:text-nexus-400">
              興味のあるトピックを選ぶと、厳選された記事が自動的に追加されます。
              最初からグラフが繋がった状態で、楽しく学習を始められます！
            </p>
          </div>
        </div>

        {/* Topics */}
        <div className="px-8 pb-8">
          <p className="text-sm font-bold text-nexus-600 dark:text-nexus-400 mb-4">
            興味のあるトピックを選択してください（複数選択可）
          </p>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedTopics.includes(topic.id)
                    ? 'border-nexus-900 dark:border-nexus-500 bg-gradient-to-br ' + topic.color + ' bg-opacity-10'
                    : 'border-nexus-200 dark:border-nexus-700 hover:border-nexus-300 dark:hover:border-nexus-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-nexus-900 dark:text-nexus-100 mb-1">
                      {topic.name}
                    </h4>
                    <p className="text-sm text-nexus-600 dark:text-nexus-400">
                      {topic.description}
                    </p>
                  </div>
                  {selectedTopics.includes(topic.id) && (
                    <div className="w-8 h-8 bg-nexus-900 dark:bg-nexus-600 rounded-full flex items-center justify-center">
                      <Check className="text-white" size={18} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-nexus-200 dark:border-nexus-700 text-nexus-700 dark:text-nexus-300 rounded-xl font-bold hover:bg-nexus-50 dark:hover:bg-nexus-800 transition-all"
            >
              スキップ
            </button>
            <button
              onClick={handleStart}
              disabled={selectedTopics.length === 0}
              className="flex-1 px-6 py-3 bg-nexus-900 dark:bg-nexus-600 hover:bg-nexus-800 dark:hover:bg-nexus-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              学習を始める ({selectedTopics.length}個選択中)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
