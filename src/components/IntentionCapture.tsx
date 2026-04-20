import React, { useState } from 'react';
import { Search, Mic, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onSearch: (query: string) => void;
  onStartDiagnose?: () => void;
  mode?: 'new-search' | 'follow-up';
  variant?: 'default' | 'command';
  placeholder?: string;
  hideSubmitButton?: boolean;
}

export const IntentionCapture: React.FC<Props> = ({
  onSearch,
  onStartDiagnose,
  mode = 'new-search',
  variant = 'default',
  placeholder,
  hideSubmitButton = false
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      if (mode === 'follow-up') {
        setQuery('');
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    if (mode === 'follow-up') {
      setQuery('');
    }
    setShowSuggestions(false);
  };

  const isCommand = variant === 'command';

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <motion.div 
        animate={isCommand ? {
          boxShadow: [
            '0 0 15px rgba(242,201,76,0.1)',
            '0 0 25px rgba(242,201,76,0.3)',
            '0 0 15px rgba(242,201,76,0.1)'
          ]
        } : {}}
        transition={isCommand ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`relative flex items-center rounded-3xl transition-all ${
          isCommand
            ? 'bg-white border-2 border-[#F2C94C] shadow-[0_0_20px_rgba(242,201,76,0.15)]'
            : mode === 'follow-up' 
              ? 'bg-white border border-slate-200 focus-within:border-[#F2C94C]/50 shadow-sm' 
              : 'bg-white border border-slate-200 focus-within:border-[#F2C94C]/50 shadow-sm'
        }`}
      >
        <div className={`pl-4 pr-2 ${isCommand ? 'text-[#F2C94C]' : 'text-slate-400'}`}>
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (mode === 'follow-up') return;
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder || (mode === 'follow-up' ? "基于以上研判，您还有哪些具体的实战困惑？" : "例如：资源有限如何升级团队能力实现突破")}
          className={`w-full py-5 bg-transparent outline-none ${
            isCommand ? 'text-slate-900 placeholder-slate-300 text-lg' : 'text-slate-700 placeholder-slate-300'
          }`}
        />
        <div className="pr-4 pl-2 flex items-center gap-2">
          {!isCommand && (
            <button className="p-2 text-slate-300 hover:text-[#F2C94C] hover:bg-slate-50 transition-colors rounded-full">
              <Mic className="w-5 h-5" />
            </button>
          )}
          {!hideSubmitButton && (
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all bg-[#F2C94C] text-white hover:bg-[#E5B73B] shadow-md hover:shadow-lg"
            >
              立即提问
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-2 text-xs text-[#95A5A6] uppercase tracking-wider font-medium bg-[#F4F7F9] border-b border-gray-100">
              AI 管理能力提升助手，您是指以下问题吗？
            </div>
            <ul className="py-1">
              {['员工执行力差', '员工有离职倾向', '员工不服从管理'].map((suggestion, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F4F7F9] hover:text-[#1B3C59] transition-colors flex items-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F2C94C] mr-3"></span>
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
