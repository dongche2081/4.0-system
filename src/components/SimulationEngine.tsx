import React, { useState } from 'react';
import { SimulationScenario } from '../types';
import { ShieldAlert, CheckCircle2, RefreshCw, BarChart3, Quote } from 'lucide-react';
import { RichText } from './RichText';

interface Props {
  scenario: SimulationScenario;
  onExit: () => void;
}

export const SimulationEngine: React.FC<Props> = ({ scenario, onExit }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentOption = scenario.options.find(o => o.id === selectedId);

  const MetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span style={{ color }}>{value > 0 ? `+${value}%` : `${value}%`}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.abs(value) + 40}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col animate-[fadeIn_0.5s]">
      <div className="h-16 border-b border-slate-200 flex items-center px-8 justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> 放弃本次决策
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">实战演练：进行中</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-12 border-r border-slate-200 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="inline-block px-3 py-1 bg-[#F2C94C]/10 border border-[#F2C94C]/20 rounded text-[#F2C94C] text-[10px] font-black tracking-widest">
              CONTEXT / 战况详情
            </div>
            <div className="text-slate-800 text-lg leading-loose font-medium">
              <RichText text={scenario.description} />
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-white p-12 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            {!isSubmitted ? (
              <div className="space-y-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">请下达您的管理指令：</h3>
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
                  确认决策并提交指令
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
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">战后复盘</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#F2C94C] uppercase tracking-widest">
                    <BarChart3 className="w-3 h-3" /> 多维组织影响评价
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <MetricBar label="员工士气" value={currentOption?.isError ? -25 : 15} color={currentOption?.isError ? '#EF4444' : '#10B981'} />
                    <MetricBar label="执行效率" value={currentOption?.isError ? -10 : 20} color={currentOption?.isError ? '#EF4444' : '#10B981'} />
                    <MetricBar label="离职风险" value={currentOption?.isError ? 40 : -15} color={currentOption?.isError ? '#EF4444' : '#10B981'} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">深度战术解析</h5>
                  <div className="text-slate-700 leading-loose bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-sm">
                    {currentOption?.feedback || currentOption?.consequence}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex gap-4">
                    <Quote className="w-8 h-8 text-[#F2C94C] opacity-20 rotate-180" />
                    <p className="text-[#F2C94C] font-serif text-lg italic leading-relaxed">
                      “真正的管理不是管住行为，而是对齐心智。当你试图用强权解决问题时，你已经失去了团队。”
                    </p>
                  </div>
                </div>

                <button onClick={onExit} className="w-full py-5 border-2 border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all">
                  返回演练列表
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
