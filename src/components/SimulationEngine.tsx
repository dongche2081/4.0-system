import React, { useState } from 'react';
import { SimulationScenario } from '../types';
import { ShieldAlert, CheckCircle2, RefreshCw, Star } from 'lucide-react';

interface Props {
  scenario: SimulationScenario;
  onExit: () => void;
  onNext?: () => void;
}

export const SimulationEngine: React.FC<Props> = ({ scenario, onExit, onNext }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentOption = scenario.options.find(o => o.id === selectedId);

  const handleBookmark = () => {
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    
    // 保存到 localStorage 的收藏记录
    const bookmarks = JSON.parse(localStorage.getItem('simulation_bookmarks') || '[]');
    if (newBookmarkedState) {
      bookmarks.push({
        id: scenario.id,
        description: scenario.description,
        selectedOption: currentOption?.text || '',
        result: currentOption?.isError ? 'warning' : 'success',
        bookmarkedAt: Date.now(),
      });
    } else {
      const index = bookmarks.findIndex((b: any) => b.id === scenario.id);
      if (index > -1) bookmarks.splice(index, 1);
    }
    localStorage.setItem('simulation_bookmarks', JSON.stringify(bookmarks));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col animate-[fadeIn_0.5s]">
      <div className="h-16 border-b border-slate-200 flex items-center px-8 justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> 退出演练
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">实战演练：进行中</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-12 border-r border-slate-200 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-slate-800 text-lg leading-loose font-medium">
              {scenario.description}
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-white p-12 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            {!isSubmitted ? (
              <div className="space-y-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">战术选择</h3>
                <div className="space-y-4">
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedId(option.id)}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all group ${
                        selectedId === option.id
                          ? 'border-[#F2C94C] bg-[#F2C94C]/5'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedId === option.id ? 'border-[#F2C94C] bg-[#F2C94C]' : 'border-slate-300'}`}>
                          {selectedId === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-sm font-bold transition-all ${selectedId === option.id ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {option.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  disabled={!selectedId}
                  onClick={() => setIsSubmitted(true)}
                  className="w-full py-6 bg-[#F2C94C] disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                  {selectedId ? '确认提交' : '先选择战术'}
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-[slideUp_0.5s]">
                <div className="flex items-center gap-6">
                  {currentOption?.isError ? (
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center border border-red-100">
                      <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center border border-green-100">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-2xl font-black ${currentOption?.isError ? 'text-red-500' : 'text-green-500'}`}>
                      {currentOption?.isError ? '决策判定：红区警告' : '决策判定：推演成功'}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">深度战术解析</h5>
                  <div className="text-slate-700 leading-loose bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm">
                    {currentOption?.feedback || currentOption?.consequence}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onExit}
                    className="flex-1 py-4 border-2 border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    退出演练
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex-1 py-4 border-2 font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                      isBookmarked
                        ? 'border-[#F2C94C] text-[#F2C94C] bg-[#F2C94C]/5'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isBookmarked ? 'fill-[#F2C94C]' : ''}`} />
                    {isBookmarked ? '已收藏' : '收藏题目'}
                  </button>
                  <button
                    onClick={onNext}
                    className="flex-1 py-4 bg-[#F2C94C] text-white font-black rounded-2xl hover:bg-[#E5B73B] transition-all"
                  >
                    进入下一关
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
