import React, { useEffect, useRef, useState } from 'react';
import { Users, Gamepad2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPERTS, SCENARIO_DATA } from '../data';

interface DiagnoseResultLayoutProps {
  children: React.ReactNode;
  inputArea: React.ReactNode;
}

export const DiagnoseResultLayout: React.FC<DiagnoseResultLayoutProps> = ({
  children,
  inputArea,
}) => {
  const navigate = useNavigate();
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(80);
  const matchedExperts = EXPERTS.slice(0, 3);
  const recommendedScenarios = Object.values(SCENARIO_DATA).slice(0, 3);

  useEffect(() => {
    if (inputAreaRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setInputHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(inputAreaRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-[#F8FAFC] z-10"
      style={{ 
        top: '64px',
        left: '256px',
      }}
    >
      {/* 左侧内容区 */}
      <div 
        className="absolute inset-0 overflow-y-auto"
        style={{ 
          right: '380px',
          paddingBottom: `${inputHeight + 24}px`,
        }}
      >
        <div className="px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* 底部输入区 */}
      <div 
        ref={inputAreaRef}
        className="absolute bottom-0 left-0 bg-white border-t border-slate-200 px-6 py-4 z-20"
        style={{
          right: '380px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {inputArea}
      </div>

      {/* 右侧边栏 */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-slate-200 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#F2C94C transparent',
        }}
      >
        <div className="p-6 space-y-6">
          {/* 专家推荐 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F2C94C]" />
                <h3 className="font-bold text-slate-900">为您匹配的专家</h3>
              </div>
              <button className="text-sm text-slate-500 hover:text-[#F2C94C] flex items-center gap-1">
                更多 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {matchedExperts.map((expert) => (
                <div
                  key={expert.id}
                  onClick={() => navigate(`/expert/${expert.id}`)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group"
                >
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{expert.name}</p>
                    <p className="text-xs text-slate-500 truncate">{expert.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {expert.topics.slice(0, 2).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#F2C94C]/10 text-[#F2C94C] text-xs rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 针对性训练 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#F2C94C]" />
                <h3 className="font-bold text-slate-900">针对性训练</h3>
              </div>
            </div>

            <div className="space-y-3">
              {recommendedScenarios.map((scenario, i) => (
                <div
                  key={scenario.id}
                  onClick={() => navigate('/practice')}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 bg-[#F2C94C]/10 text-[#F2C94C] text-xs font-bold rounded">
                      情景演练
                    </span>
                    <span className="text-xs text-slate-400">匹配度 {95 - i * 3}%</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1 group-hover:text-[#F2C94C] transition-colors line-clamp-1">
                    情景演练 {i + 1}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {scenario.description}
                  </p>
                  <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-[#F2C94C] hover:text-[#1B3C59] hover:border-[#F2C94C] transition-colors">
                    开始演练
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background-color: #F2C94C;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: #E5B73B;
        }
      `}</style>
    </div>
  );
};
