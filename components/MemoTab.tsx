import React, { useState } from 'react';
import { Mic, ArrowRight, Wand2, ArrowDownToLine, Trash } from 'lucide-react';
import { Memo, TaskCategory } from '../types';
import { analyzeMemo } from '../services/geminiService';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';

const MemoTab: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [input, setInput] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, category: TaskCategory, text: string} | null>(null);

  const addMemo = () => {
    if (!input.trim()) return;
    const newMemo: Memo = {
      id: Date.now().toString(),
      content: input,
      createdAt: new Date(),
    };
    setMemos([newMemo, ...memos]);
    setInput('');
  };

  const handleAnalyze = async (memo: Memo) => {
    setAnalyzingId(memo.id);
    const result = await analyzeMemo(memo.content);
    setAnalyzingId(null);
    if (result) {
      setAnalysisResult({
        id: memo.id,
        category: result.suggestedCategory,
        text: result.polishedText
      });
    }
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter(m => m.id !== id));
    if (analysisResult?.id === id) setAnalysisResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-6 py-6 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">灵感速记</h1>
        <p className="text-sm text-gray-500">随时记录想法，稍后整理。</p>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-md p-2 border border-blue-100 flex items-center gap-2 sticky top-0 z-20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入内容... (例如：告诉高一3班关于春游的事)"
            className="flex-1 p-2 outline-none resize-none text-gray-700 h-12 bg-transparent"
          />
          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            <Mic size={20} />
          </button>
          <button 
            onClick={addMemo}
            disabled={!input.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Memos List */}
        <div className="space-y-4 pt-4">
          {memos.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              <p>暂无速记。</p>
            </div>
          )}
          {memos.map(memo => (
            <div key={memo.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group relative">
              <p className="text-gray-800 font-medium mb-3">{memo.content}</p>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                <span className="text-[10px] text-gray-400">{memo.createdAt.toLocaleTimeString()}</span>
                
                <div className="flex gap-2">
                   <button 
                     onClick={() => deleteMemo(memo.id)}
                     className="text-gray-300 hover:text-red-500 p-1"
                   >
                     <Trash size={16} />
                   </button>
                   <button 
                      onClick={() => handleAnalyze(memo)}
                      disabled={analyzingId === memo.id}
                      className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                   >
                     {analyzingId === memo.id ? '分析中...' : <><Wand2 size={12} /> AI 整理</>}
                   </button>
                </div>
              </div>

              {/* Analysis Result Overlay */}
              {analysisResult && analysisResult.id === memo.id && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-purple-200 animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-purple-500 uppercase">AI 建议分类</span>
                    <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${CATEGORY_COLORS[analysisResult.category]}`}>
                      {CATEGORY_LABELS[analysisResult.category]}
                    </span>
                    <p className="text-sm font-semibold text-gray-800">{analysisResult.text}</p>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-bold py-2 rounded hover:bg-black transition-colors">
                    <ArrowDownToLine size={12} /> 转为待办任务
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoTab;