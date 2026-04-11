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
      {/* 顶部 - 输入区 */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 pt-10 pb-8">
        <div className="w-full max-w-3xl space-y-6">
          {/* 标题区 */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              <span className="text-[#F2C94C]">AI</span> 诊断你的管理困境
            </h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              描述您面临的挑战，并且回答几个针对性问题，AI将为您生成个性化行动建议。
            </p>
          </div>

          {/* 搜索输入区 */}
          <div className="space-y-3">
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
        </div>
      </div>

      {/* 诊断流程 */}
      <div className="flex-shrink-0 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-base font-medium text-slate-600 mb-6">诊断流程</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#F2C94C] rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <h4 className="font-bold text-slate-800 mb-1">描述场景</h4>
              <p className="text-xs text-slate-500">输入你的管理困境</p>
            </div>
            <div className="hidden md:block text-slate-300">→</div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#F2C94C] rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <h4 className="font-bold text-slate-800 mb-1">回答题目</h4>
              <p className="text-xs text-slate-500">几道关键调研题目</p>
            </div>
            <div className="hidden md:block text-slate-300">→</div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#F2C94C] rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <h4 className="font-bold text-slate-800 mb-1">AI 生成</h4>
              <p className="text-xs text-slate-500">定制化，可追问</p>
            </div>
          </div>
        </div>
      </div>

      {/* 中部 - 常见困境 */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 bg-[#F2C94C] rounded-full"></div>
            <h3 className="text-base font-bold text-slate-800">常见困境</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_PROBLEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !isLoading && handleCardClick(item.desc)}
                className={`p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#F2C94C] hover:shadow-lg hover:shadow-[#F2C94C]/5 transition-all cursor-pointer group ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-[#F2C94C] transition-colors">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnoseStartPage;
