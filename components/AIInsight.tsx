import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { TimeLog, Category } from '../types';
import { generateProductivityInsight } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIInsightProps {
  logs: TimeLog[];
  categories: Category[];
}

export const AIInsight: React.FC<AIInsightProps> = ({ logs, categories }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    if (logs.length === 0) return;
    setLoading(true);
    try {
      const result = await generateProductivityInsight(logs, categories);
      setInsight(result);
    } catch (e) {
      setInsight("无法获取建议。");
    } finally {
      setLoading(false);
    }
  };

  if (logs.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" />
            AI 效率教练
          </h3>
          {!insight && !loading && (
            <button 
              onClick={handleGenerateInsight}
              className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors backdrop-blur-sm border border-white/20 font-medium"
            >
              分析今日
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4 space-x-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-indigo-100">正在生成建议...</span>
          </div>
        )}

        {insight && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 animate-fade-in">
            <div className="prose prose-invert prose-sm max-w-none">
               <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
            <div className="mt-3 flex justify-end">
               <button 
                 onClick={() => setInsight(null)}
                 className="text-xs text-indigo-200 hover:text-white underline"
               >
                 关闭
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};