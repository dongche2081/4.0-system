import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COMMON_PROBLEMS } from '../../constants/scenarios';
import { ArrowRight, Search } from 'lucide-react';

interface Props {
  scenario: string;
  onScenarioChange: (value: string) => void;
  onNext: () => void;
  canGoNext: boolean;
}

export const StepScenario: React.FC<Props> = ({ scenario, onScenarioChange, onNext, canGoNext }) => {
  const [inputValue, setInputValue] = useState(scenario);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onScenarioChange(e.target.value);
  };

  const handleCardClick = (desc: string) => {
    setInputValue(desc);
    onScenarioChange(desc);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canGoNext) {
      onNext();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      {/* 步骤标签 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="px-2.5 py-1 bg-[#F2C94C]/10 text-[#F2C94C] text-xs font-bold rounded-lg">步骤 1 / 3</span>
        <span className="text-sm font-bold text-slate-900">描述场景</span>
        <span className="text-xs text-slate-400">输入你的管理困境，或从下方快速选择</span>
      </div>

      {/* 搜索输入区 */}
      <div className="space-y-3 mb-8">
        <div className="relative flex items-center rounded-2xl bg-white border border-slate-200 focus-within:border-[#F2C94C]/50 shadow-sm transition-all">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="描述你的管理困境..."
            className="w-full py-5 bg-transparent outline-none text-slate-700 placeholder-slate-300"
          />
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`w-full py-4 font-black text-lg rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            canGoNext
              ? 'bg-[#F2C94C] hover:bg-[#E5B73B] text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          下一步：回答调研题目
          <ArrowRight className="w-5 h-5" />
        </button>
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
              onClick={() => handleCardClick(item.desc)}
              className={`p-4 bg-slate-50 border rounded-xl hover:border-[#F2C94C] hover:shadow-md hover:shadow-[#F2C94C]/5 transition-all cursor-pointer group ${
                scenario === item.desc ? 'border-[#F2C94C] bg-[#F2C94C]/5' : 'border-slate-200'
              }`}
            >
              <h4 className={`text-sm font-bold mb-1 transition-colors ${
                scenario === item.desc ? 'text-[#F2C94C]' : 'text-slate-800 group-hover:text-[#F2C94C]'
              }`}>{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
