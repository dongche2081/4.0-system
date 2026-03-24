import React, { useState, useEffect } from 'react';
import { Expert, Topic } from '../types';
import { EXPERT_CASES } from '../data';
import { ChevronLeft, Quote, BookOpen, MessageSquare, Star, ArrowRight, Video, Play, Headphones, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface ExpertProfileViewProps {
  expert: Expert;
  onBack: () => void;
  onBook: () => void;
  onViewCase: (caseId: string) => void;
}

export const ExpertProfileView: React.FC<ExpertProfileViewProps> = ({
  expert,
  onBack,
  onBook,
  onViewCase
}) => {
  // Get cases for this expert
  const expertCases = Object.values(EXPERT_CASES).filter(c => c.expertId === expert.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('人才留存');
  const [selectedUrgency, setSelectedUrgency] = useState('常规');
  const [showToast, setShowToast] = useState(false);

  const handleConfirmBooking = () => {
    setIsModalOpen(false);
    setShowToast(true);
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24"
    >
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8FAFC]/60 to-[#F8FAFC]" />
        <img 
          src={expert.avatar} 
          alt={expert.name}
          className="w-full h-full object-cover opacity-20 blur-sm scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 flex items-end px-12 pb-12">
          <div className="flex items-center gap-8 max-w-5xl mx-auto w-full">
            <button 
              onClick={onBack}
              className="absolute top-8 left-8 p-2 bg-white hover:bg-slate-50 rounded-full transition-colors border border-slate-200 shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>

            <img 
              src={expert.avatar} 
              alt={expert.name}
              className="w-48 h-48 rounded-3xl object-cover border-2 border-[#F2C94C] shadow-xl"
              referrerPolicy="no-referrer"
            />
            
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4 tracking-tight text-slate-900">{expert.name}</h1>
              <p className="text-xl text-[#F2C94C] font-medium mb-6">{expert.title}</p>
              <div className="flex gap-6">
                {expert.resume.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                    <Star className="w-3 h-3 text-[#F2C94C]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-12 py-12 grid grid-cols-3 gap-12">
        <div className="col-span-2 space-y-12">
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              管理内核
            </h2>
            <div className="relative p-8 bg-white border border-slate-200 rounded-3xl overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-24 h-24 rotate-180" />
              </div>
              <p className="text-2xl font-serif italic leading-relaxed text-slate-800 relative z-10">
                “{expert.quote}”
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              实战履历
            </h2>
            <div className="text-lg leading-loose text-slate-600 font-light space-y-6">
              {expert.bio.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Star className="w-4 h-4" />
              实战案例集
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {expertCases.map(caseItem => (
                <div 
                  key={caseItem.id}
                  onClick={() => onViewCase(caseItem.id)}
                  className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-[#F2C94C]/30 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#F2C94C] opacity-80">
                      实战案例
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#F2C94C] transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 group-hover:text-[#F2C94C] transition-colors">
                    {caseItem.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>
          
          <section className="!mt-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#F2C94C] mb-6 flex items-center gap-2">
              <Video className="w-4 h-4" />
              专家精品 SOP & 事例展示
            </h2>
            <div className="space-y-3">
              <div className="p-5 bg-white border border-slate-200 rounded-3xl flex items-center gap-4 group hover:border-[#F2C94C]/30 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                  <Play className="w-5 h-5 fill-[#F2C94C]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#F2C94C] transition-colors">3分钟视频：如何拆解‘快速扩张期’下的团队目标？</h4>
                  <p className="text-xs text-slate-400 mt-1">专家深度解析华为项目日清机制。</p>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-3xl flex items-center gap-4 group hover:border-[#F2C94C]/30 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#F2C94C] transition-colors">音频课：绩效面谈中的关键对话话术（15分钟）</h4>
                  <p className="text-xs text-slate-400 mt-1">剥离业务指标，纯粹探寻其个人职业发展诉求与当前痛点。</p>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-3xl flex items-center gap-4 group hover:border-[#F2C94C]/30 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#F2C94C] transition-colors">《扩张期人才防御建议》：核心动作执行 SOP（含金句）</h4>
                  <p className="text-xs text-slate-400 mt-1">AI 管理能力提升助手金句摘要：“不要用战术上的勤奋，掩盖战略上的懒惰。”</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-[#F2C94C]">{expert.stats.prescriptions}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">贡献建议</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#F2C94C]">{expert.stats.likes}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">获赞次数</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">响应速度</span>
                <span className="text-slate-600">极快 (1h内)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">好评率</span>
                <span className="text-slate-600">99.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#F2C94C] text-white rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <MessageSquare className="w-5 h-5" />
          预约该参赞面谈 (300 积分/次)
        </button>
      </div>

      {/* Book Consultation Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/20 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-100 w-full max-w-md p-8 flex flex-col gap-8 shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <img 
                src={expert.avatar} 
                alt={expert.name} 
                className="w-16 h-16 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="text-xl font-bold text-slate-900">{expert.name}</div>
            </div>

            {/* Options */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-900">连线主题</div>
                <div className="flex gap-3">
                  {['人才留存', '执行力', '战略'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        selectedTheme === theme 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-900">紧急程度</div>
                <div className="flex gap-3">
                  {['常规', '火速', '特急'].map(urgency => (
                    <button
                      key={urgency}
                      onClick={() => setSelectedUrgency(urgency)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        selectedUrgency === urgency 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {urgency}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="text-sm text-slate-400">
              本次预约将消耗 300 战术积分
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
              >
                确认预约
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-6 py-3 rounded-full text-sm shadow-none">
          预约已提交
        </div>
      )}
    </motion.div>
  );
};
