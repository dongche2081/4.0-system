import React, { useState, useRef, useEffect } from 'react';
import { ProfileContext } from '../types';
import { ShieldCheck, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Dimension {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
}

const DIMENSIONS_MAP: Record<string, Dimension[]> = {
  talent: [
    {
      id: 'criticality',
      title: '人才关键度评估',
      subtitle: 'Talent Criticality Assessment',
      options: ['核心资产(无可替代)', '中坚力量(招聘周期长)', '常规人力(可快速补位)']
    },
    {
      id: 'motive',
      title: '离职真实动机起底',
      subtitle: 'True Resignation Motive',
      options: ['薪酬/外部诱惑', '成长瓶颈/技术边缘化', '人际摩擦/直属主管矛盾', '个人原因/家庭变动']
    },
    {
      id: 'feedback',
      title: '当前挽留动作反馈',
      subtitle: 'Retention Action Feedback',
      options: ['尚未正式谈话', '尝试挽留中', '谈话陷入僵局', '对方态度松动']
    }
  ],
  execution: [
    {
      id: 'clarity',
      title: '目标体感清晰度',
      subtitle: 'Goal Clarity & Perception',
      options: ['目标模糊/常变', '目标清晰但无拆解', '目标已拆解但无共识']
    },
    {
      id: 'incentive',
      title: '激励闭环有效性',
      subtitle: 'Incentive Loop Effectiveness',
      options: ['缺乏即时反馈', '激励手段单一', '反馈流于形式']
    },
    {
      id: 'tools',
      title: '资源与工具匹配度',
      subtitle: 'Resource & Tool Match',
      options: ['工具落后/繁琐', '缺乏协作平台', '工具使用门槛高']
    }
  ],
  general: [
    {
      id: 'health',
      title: '组织健康度现状',
      subtitle: 'Org Health Status',
      options: ['氛围压抑', '沟通成本极高', '缺乏信任基础']
    },
    {
      id: 'gap',
      title: '领导力断层观察',
      subtitle: 'Leadership Gap Observation',
      options: ['中层执行力弱', '基层缺乏动力', '高层战略不清晰']
    },
    {
      id: 'alignment',
      title: '团队协作共识度',
      subtitle: 'Team Collaboration Consensus',
      options: ['各自为政', '表面对齐/实际脱节', '缺乏统一语言']
    }
  ]
};

interface Props {
  initialContext: ProfileContext;
  mode: 'problem' | 'commander';
  query?: string;
  targetTopicId?: string;
  onComplete: (diagnostic: any) => void;
}

export const DiagnoseEngine: React.FC<Props> = ({ initialContext, mode, query = '', targetTopicId, onComplete }) => {
  const getQuestionSetKey = () => {
    const q = query.toLowerCase();
    const t = targetTopicId?.toLowerCase() || '';
    if (q.includes('离职') || q.includes('想走') || q.includes('人才') || t === '3') return 'talent';
    if (q.includes('执行力') || q.includes('推不动') || q.includes('慢') || t === '1') return 'execution';
    return 'general';
  };

  const questionSetKey = getQuestionSetKey();
  const dimensions = DIMENSIONS_MAP[questionSetKey];
  
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [details, setDetails] = useState('');
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
  
  const dimensionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleOptionSelect = (dimId: string, option: string, index: number) => {
    setSelections(prev => ({ ...prev, [dimId]: option }));
    
    // Smooth scroll to next dimension or details
    if (index < dimensions.length - 1) {
      setActiveDimensionIndex(index + 1);
      setTimeout(() => {
        dimensionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setActiveDimensionIndex(dimensions.length); // Focus details
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleSubmit = () => {
    onComplete({
      ...selections,
      details,
      questionSet: questionSetKey,
      teamContext: initialContext,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] -m-4 md:-m-6 lg:-m-8 p-4 md:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto pb-32 space-y-6">
        {/* Top Context */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">研判背景</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Context Analysis</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-700 leading-relaxed italic">
              “{query || '正在针对特定管理场景进行深度研判...'}”
            </p>
          </div>
        </motion.div>

        {/* Dimensions */}
        <div className="space-y-6">
          {dimensions.map((dim, index) => {
            const isActive = activeDimensionIndex === index;
            const isCompleted = selections[dim.id] !== undefined;
            
            return (
              <motion.div
                key={dim.id}
                ref={el => dimensionRefs.current[index] = el}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive ? 1 : isCompleted ? 0.7 : 0.4,
                  scale: isActive ? 1 : 0.98,
                  backgroundColor: isActive ? '#FFFFFF' : '#FFFFFF'
                }}
                className={`relative p-8 rounded-[32px] border transition-all duration-500 ${
                  isActive ? 'border-[#F2C94C] shadow-lg' : 'border-slate-200 bg-white'
                }`}
              >
              {isCompleted && !isActive && (
                <div className="absolute top-8 right-8 text-[#F2C94C]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-1">
                  <span className="text-[#F2C94C] mr-3">0{index + 1}.</span>
                  {dim.title}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                  {dim.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dim.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(dim.id, option, index)}
                    className={`relative p-5 rounded-3xl border-2 text-left transition-all overflow-hidden group ${
                      selections[dim.id] === option
                        ? 'border-[#F2C94C] bg-[#F2C94C]/5'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Golden Stream Effect */}
                    {selections[dim.id] === option && (
                      <motion.div
                        layoutId={`stream-${dim.id}`}
                        className="absolute inset-0 border-2 border-[#F2C94C] pointer-events-none"
                        initial={false}
                        animate={{
                          boxShadow: [
                            'inset 0 0 0px rgba(242,201,76,0)',
                            'inset 0 0 20px rgba(242,201,76,0.1)',
                            'inset 0 0 0px rgba(242,201,76,0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`font-bold transition-colors ${
                        selections[dim.id] === option ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
                      }`}>
                        {option}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selections[dim.id] === option ? 'border-[#F2C94C] bg-[#F2C94C]' : 'border-slate-200'
                      }`}>
                        {selections[dim.id] === option && <ShieldCheck className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

        {/* Bottom Detail */}
        <motion.div
          ref={detailsRef}
          initial={{ opacity: 0.4 }}
          animate={{ 
            opacity: activeDimensionIndex === dimensions.length ? 1 : 0.4,
            backgroundColor: '#FFFFFF'
          }}
          className={`p-8 rounded-[32px] border transition-all duration-500 ${
            activeDimensionIndex === dimensions.length ? 'border-[#F2C94C] shadow-lg' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#F2C94C]" />
              深度细节补充
            </h3>
            <p className="text-slate-400 text-sm">
              还有哪些只有您知道的“现场细节”或“吐槽”？（如：该员工性格偏执、老板最近盯得紧等）
            </p>
          </div>
          
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onFocus={() => setActiveDimensionIndex(dimensions.length)}
            placeholder="请在此输入您的观察..."
            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-800 outline-none focus:border-[#F2C94C] transition-all resize-none placeholder:text-slate-300"
          />
        </motion.div>

      {/* Submit Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-8"
      >
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selections).length < dimensions.length}
          className={`w-full py-8 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all ${
            Object.keys(selections).length >= dimensions.length
              ? 'bg-[#F2C94C] text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          完成研判，生成实战建议
          <ArrowRight className="w-6 h-6" />
        </button>
        <p className="text-center text-slate-300 text-xs mt-6 uppercase tracking-widest">
          Secure Tactical Analysis Protocol v4.0
        </p>
      </motion.div>
    </div>
  </div>
);
};
