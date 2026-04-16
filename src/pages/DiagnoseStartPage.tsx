import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { IntentionCapture } from '../components/IntentionCapture';
import { COMMON_PROBLEMS } from '../constants/scenarios';
import { useApp } from '../contexts/AppContext';

const DiagnoseStartPage: React.FC = () => {
  const navigate = useNavigate();
  const { pendingQuery, setPendingQuery } = useApp();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmptyTip, setShowEmptyTip] = useState(false);

  // 组件挂载时重置 loading 状态，防止卡住
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleStartDiagnose = () => {
    if (!inputValue.trim() && !pendingQuery.trim()) {
      setShowEmptyTip(true);
      setTimeout(() => setShowEmptyTip(false), 2000);
      return;
    }
    setIsLoading(true);
    setPendingQuery(inputValue || pendingQuery);
    // 添加超时保护，3秒后自动重置 loading 状态
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    setTimeout(() => {
      try {
        navigate('/diagnose-engine');
      } catch (e) {
        console.error('导航失败:', e);
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    }, 300);
  };

  const handleCardClick = (desc: string) => {
    setIsLoading(true);
    setPendingQuery(desc);
    // 添加超时保护，3秒后自动重置 loading 状态
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    setTimeout(() => {
      try {
        navigate('/diagnose-engine');
      } catch (e) {
        console.error('导航失败:', e);
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      {/* 顶部 - 标题 + 步骤指示器 */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 pt-8 pb-4">
        <div className="w-full max-w-3xl space-y-4">
          {/* 标题区 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              <span className="text-[#F2C94C]">AI</span> 诊断你的管理困境
            </h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              描述您面临的挑战，并且回答几个针对性问题，AI将为您生成个性化行动建议。
            </p>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 md:gap-4 py-2">
            {[
              { step: 1, title: '描述场景', desc: '输入你的管理困境' },
              { step: 2, title: '回答题目', desc: '几道关键调研题目' },
              { step: 3, title: 'AI 生成', desc: '定制化，可追问' },
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  s.step === 1 
                    ? 'bg-[#F2C94C] border-[#F2C94C] text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.step === 1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {s.step}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-bold ${s.step === 1 ? 'text-white' : 'text-slate-600'}`}>{s.title}</div>
                    <div className={`text-[10px] ${s.step === 1 ? 'text-white/80' : 'text-slate-400'}`}>{s.desc}</div>
                  </div>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block text-slate-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 步骤1 内容区 */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            {/* 步骤标签 */}
            <div className="flex items-center gap-2 mb-5">
              <span className="px-2.5 py-1 bg-[#F2C94C]/10 text-[#F2C94C] text-xs font-bold rounded-lg">步骤 1 / 3</span>
              <span className="text-sm font-bold text-slate-900">描述场景</span>
              <span className="text-xs text-slate-400">输入你的管理困境，或从下方快速选择</span>
            </div>

            {/* 搜索输入区 */}
            <div className="space-y-3 mb-8">
              <div className={`rounded-xl transition-all ${showEmptyTip ? 'animate-pulse ring-2 ring-red-400' : ''}`}>
                <IntentionCapture
                  mode="new-search"
                  placeholder="描述你的管理困境..."
                  onSearch={(query) => {
                    setPendingQuery(query);
                    navigate('/diagnose-engine');
                  }}
                />
              </div>
              <button
                onClick={handleStartDiagnose}
                disabled={isLoading}
                className={`w-full py-4 bg-[#F2C94C] hover:bg-[#E5B73B] text-white font-black text-lg rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  !inputValue.trim() && !pendingQuery.trim() ? 'opacity-80' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    准备中...
                  </>
                ) : (
                  '开始 AI 诊断'
                )}
              </button>
              {showEmptyTip && (
                <p className="text-center text-sm text-red-500 animate-pulse">
                  请先描述你的管理困境
                </p>
              )}
            </div>

            {/* 常见困境 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-[#F2C94C] rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800">常见困境（点击快速选择）</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_PROBLEMS.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => !isLoading && handleCardClick(item.desc)}
                    className={`p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#F2C94C] hover:shadow-md hover:shadow-[#F2C94C]/5 transition-all cursor-pointer group ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-[#F2C94C] transition-colors">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnoseStartPage;
