import React, { useState, useEffect, useRef } from 'react';
import { Topic, Prescription, Expert, DiagnosticContext, ChatMessage } from '../types';
import { FileText, Headphones, Video, ThumbsUp, ThumbsDown, X, Zap, Copy, Download, CornerRightDown, Play, MessageSquare, Search, Mic, ArrowRight, Star, ShieldCheck, Activity, BookOpen, Pause, Volume2, Sparkles, Check } from 'lucide-react';
import { RichText } from './RichText';
import { DigestCard } from './DigestCard';
import { motion, AnimatePresence } from 'motion/react';
import { generateManagementFeedback } from '../services/gemini';
import { IntentionCapture } from './IntentionCapture';

interface Props {
  topic: Topic;
  prescription: Prescription | null;
  experts: Expert[];
  context: any; 
  diagnosticContext?: DiagnosticContext | null;
  onNavigateToTopic?: (topic: Topic) => void;
  onNavigateToPractice?: (topicId: string) => void;
  onNavigateToDiagnosis?: (topicId: string) => void;
  onFollowUp?: (query: string) => void;
  onExpertClick?: (expert: Expert) => void;
  isGeneratingFeedback?: boolean;
  relatedTopics?: Topic[];
}

export const TacticalBriefing: React.FC<Props> = ({ 
  topic, 
  prescription, 
  experts, 
  context, 
  diagnosticContext,
  onNavigateToTopic, 
  onNavigateToPractice,
  onNavigateToDiagnosis,
  onFollowUp,
  onExpertClick,
  isGeneratingFeedback,
  relatedTopics = []
}) => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeModal, setActiveModal] = useState<'document' | 'audio' | 'video' | null>(null);
  const [activeExpertForModal, setActiveExpertForModal] = useState<Expert | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showDislikeModal, setShowDislikeModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [dislikeOptions, setDislikeOptions] = useState<string[]>([]);
  const [dislikeText, setDislikeText] = useState('');
  const [contributionForm, setContributionForm] = useState({ title: '', scenario: '', action: '', expertTitle: '' });
  const [toast, setToast] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const matchedExperts = experts.filter(e => e.topics.includes(topic.id) || e.topics.includes(topic.title));
  const expertResources = matchedExperts.length > 0 ? matchedExperts.slice(0, 3) : experts.slice(0, 3);

  const openModal = (expert: Expert, type: 'document' | 'audio' | 'video') => {
    setActiveExpertForModal(expert);
    setActiveModal(type);
    if (type === 'audio') setIsPlaying(true);
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveExpertForModal(null);
    setIsPlaying(false);
  };

  const handleLike = () => {
    setLiked(true);
    setToast('感谢反馈');
    setTimeout(() => setToast(null), 2000);
    console.log('User liked the prescription');
  };

  const handleDislikeSubmit = () => {
    console.log('Dislike feedback:', { options: dislikeOptions, text: dislikeText });
    setShowDislikeModal(false);
    setToast('反馈已上传指挥中心');
    setTimeout(() => setToast(null), 2000);
    setDislikeOptions([]);
    setDislikeText('');
  };

  const handleContributionSubmit = () => {
    console.log('Contribution submitted:', contributionForm);
    setShowContributionModal(false);
    setToast('申请已提交，AI 管理能力提升助手将尽快审核');
    setTimeout(() => setToast(null), 2000);
    setContributionForm({ title: '', scenario: '', action: '', expertTitle: '' });
  };

  const toggleDislikeOption = (option: string) => {
    setDislikeOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-[fadeIn_0.3s] pt-4">
      {/* A. 研判解析区 (亮色一体化) */}
      <section className="space-y-6">
        {/* AI Insight Container (Refactored DigestCard) */}
        {topic.id === 'diagnostic-result' && <DigestCard content={prescription?.summary} />}

        <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-sm">
          {isGeneratingFeedback && (
            <div className="flex items-center gap-2 text-[#F2C94C] text-[10px] font-black uppercase tracking-widest mb-6 animate-pulse">
              <Zap className="w-3 h-3 animate-spin" /> 正在深度研判中...
            </div>
          )}

          <div className="space-y-6">
            {/* 实战事例合并展示 */}
            {topic.caseStudy && (
              <div className="pb-6 border-b border-slate-100">
                <div className="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.2em] mb-3">典型实战场景</div>
                <div className="text-slate-800 leading-loose text-base italic font-medium">
                  “{topic.caseStudy}”
                </div>
              </div>
            )}

            <div 
              ref={contentRef}
              className="text-slate-800 leading-[1.8] text-base"
            >
              <div className="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.2em] mb-3">深度战术解析</div>
              <RichText text={prescription?.truth || '正在生成深度解析...'} />
            </div>
          </div>
        </div>

        {/* 互动反馈系统 (紧贴容器下方) */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${liked ? 'bg-[#F2C94C] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
              <span className="text-xs font-bold">{liked ? '感谢反馈' : '赞同'}</span>
            </button>
            <button 
              onClick={() => setShowDislikeModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#F2C94C] transition-all hover:scale-105"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs font-bold">不符合预期</span>
            </button>
          </div>

          <button 
            onClick={() => setShowContributionModal(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:border-[#F2C94C] hover:text-[#F2C94C] transition-all hover:scale-105 group"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
            <span className="text-xs font-black">我也来支招</span>
          </button>
        </div>

        {/* B. 参考来源 (原专家矩阵) */}
        {expertResources.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-3 bg-[#F2C94C]/50 rounded-full"></div>
              <h3 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">参考来源</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expertResources.map(expert => (
                <div 
                  key={expert.id}
                  onClick={() => onExpertClick?.(expert)}
                  className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer hover:scale-[1.02] hover:border-[#F2C94C]/30"
                >
                  <div className="relative mb-4">
                    <img 
                      src={expert.avatar} 
                      className="w-14 h-14 rounded-3xl object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-all" 
                      alt={expert.name} 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F2C94C] rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">{expert.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold mb-4 line-clamp-1">{expert.title}</p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openModal(expert, 'document'); }}
                      className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openModal(expert, 'audio'); }}
                      className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openModal(expert, 'video'); }}
                      className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* D. 实战转化区 */}
      {topic.id !== 'diagnostic-result' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => onNavigateToPractice?.(topic.id)}
            className="relative h-48 bg-white border border-slate-200 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 hover:scale-[1.02] transition-all"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-[#0A0F1D] mb-2">练一练</h4>
                <p className="text-xs text-gray-400">情景模拟练习</p>
              </div>
            </div>
            <div className="absolute top-8 right-8 text-slate-200 group-hover:text-[#F2C94C] transition-all">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToDiagnosis?.(topic.id)}
            className="relative h-48 bg-white border border-slate-200 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 hover:scale-[1.02] transition-all"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-[#0A0F1D] mb-2">聊一聊</h4>
                <p className="text-xs text-gray-400">深度智能诊断</p>
              </div>
            </div>
            <div className="absolute top-8 right-8 text-slate-200 group-hover:text-[#F2C94C] transition-all">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>
        </section>
      )}

      {/* Follow-up Input for Diagnostic Results */}
      {topic.id === 'diagnostic-result' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent">
          <div className="max-w-4xl mx-auto">
            <IntentionCapture 
              onSearch={(q) => onFollowUp?.(q)}
              placeholder="针对研判结果，您还有什么想追问 AI 管理能力提升助手的？"
            />
          </div>
        </div>
      )}

      {/* High-Premium Modals */}
      <AnimatePresence>
        {activeModal && activeExpertForModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[90vh] border border-slate-200"
            >
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              {/* Document Modal */}
              {activeModal === 'document' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-1/4 bg-slate-50 p-8 flex flex-col justify-center items-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <div className="text-4xl font-black rotate-[-45deg] whitespace-nowrap tracking-[0.5em] text-slate-900">机密</div>
                    </div>
                    <img src={activeExpertForModal.avatar} className="w-20 h-20 rounded-3xl mb-4 shadow-lg relative z-10" alt="" referrerPolicy="no-referrer" />
                    <h3 className="text-lg font-black text-slate-900 relative z-10">{activeExpertForModal.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 relative z-10">实战复盘报告</p>
                  </div>
                  <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-2xl mx-auto space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.3em]">复盘报告</div>
                        <div className="text-[10px] text-slate-300">编号 {activeExpertForModal.id.toUpperCase()}-2026</div>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                        关于{topic.title}的实战级复盘摘要
                      </h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-loose text-lg italic tracking-wide">
                          {activeExpertForModal.caseDocument || "正在调取专家实战复盘全文..."}
                        </p>
                      </div>
                      <div className="pt-12 flex items-center gap-4 opacity-30">
                        <div className="h-px flex-1 bg-slate-200"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI 管理能力提升助手专家库出品</div>
                        <div className="h-px flex-1 bg-slate-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Modal */}
              {activeModal === 'audio' && (
                <div className="flex-1 bg-white p-12 flex flex-col items-center justify-center text-center space-y-12">
                  {/* Waveform Simulation */}
                  <div className="flex items-center justify-center gap-1.5 h-32 w-full max-w-xs">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 bg-[#F2C94C] rounded-full opacity-60 ${isPlaying ? 'animate-bounce' : ''}`}
                        style={{ 
                          height: isPlaying ? `${Math.random() * 80 + 20}px` : '16px',
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: `${0.6 + Math.random() * 0.4}s`
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-full max-w-md space-y-6">
                    <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: isPlaying ? "28%" : "28%" }}
                        className="absolute inset-y-0 left-0 bg-[#F2C94C]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>01:24</span>
                      <span>05:00</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                      <ArrowRight className="w-6 h-6 rotate-180" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-20 h-20 bg-[#F2C94C] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#F2C94C]/20 hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* Video Modal */}
              {activeModal === 'video' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  <div className="flex-1 bg-black relative group flex items-center justify-center">
                    <img 
                      src={`https://picsum.photos/seed/${activeExpertForModal.id}/1280/720`} 
                      className="w-full h-full object-cover opacity-60" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-all group-hover:bg-[#F2C94C] group-hover:text-white group-hover:border-[#F2C94C]">
                      <Play className="w-10 h-10 fill-current ml-1" />
                    </button>
                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest">精品课程</div>
                        <h3 className="text-xl font-black text-white">{activeExpertForModal.videoTitle || "精品 SOP 视频"}</h3>
                      </div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10">
                        12:45
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-80 bg-white p-8 flex flex-col border-l border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">课程大纲</h4>
                    <div className="space-y-4 flex-1">
                      {[
                        { title: '现状分析：识别表面下的利益暗流', duration: '03:20' },
                        { title: '博弈话术：如何进行非对称压力沟通', duration: '05:45' },
                        { title: '落地闭环：确保管理动作不走样', duration: '03:40' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-[#F2C94C]">0{i+1}</span>
                            <span className="text-[10px] text-slate-300">{item.duration}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{item.title}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                      <img src={activeExpertForModal.avatar} className="w-10 h-10 rounded-3xl" alt="" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{activeExpertForModal.name}</div>
                        <div className="text-[10px] text-slate-400">主讲专家</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedExpert(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-[slideInRight_0.4s] border-l border-slate-200 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedExpert.avatar} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="text-lg font-black text-slate-900">{selectedExpert.name}</h4>
                  <p className="text-xs text-[#F2C94C] font-bold uppercase">{selectedExpert.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedExpert(null)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">专家实战复盘原文</h5>
                <div className="text-slate-600 leading-loose text-base bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <RichText text={selectedExpert.bio} />
                </div>
              </div>
              <div className="p-8 space-y-6">
                <h5 className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest flex items-center gap-2">
                  <Video className="w-3 h-3" />
                  专家精品 SOP & 事例展示
                </h5>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 group hover:border-[#F2C94C]/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                      <Play className="w-4 h-4 fill-[#F2C94C]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#F2C94C] transition-colors">专家深度解析：{topic.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">实战场景还原与关键动作拆解。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100">
              <button className="w-full py-5 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20">一键预约该专家深度连线</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-white text-[#F2C94C] rounded-full shadow-2xl border border-slate-200 flex items-center gap-3"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs font-black tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dislike Feedback Modal */}
      <AnimatePresence>
        {showDislikeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDislikeModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl"
            >
              <button onClick={() => setShowDislikeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-black text-slate-900 mb-6 pr-8">指挥官，哪部分内容不符合您的预期？</h3>
              
              <div className="space-y-3 mb-6">
                {['内容太泛，不落地', '逻辑有误，不符合实际', '话术生硬，没法直接用', '建议存在管理风险'].map(option => (
                  <button 
                    key={option}
                    onClick={() => toggleDislikeOption(option)}
                    className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between group ${dislikeOptions.includes(option) ? 'bg-[#F2C94C]/10 border-[#F2C94C] text-[#F2C94C]' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <span className="text-sm font-bold">{option}</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${dislikeOptions.includes(option) ? 'bg-[#F2C94C] border-[#F2C94C]' : 'border-slate-200'}`}>
                      {dislikeOptions.includes(option) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <textarea 
                value={dislikeText}
                onChange={(e) => setDislikeText(e.target.value)}
                placeholder="请详细吐槽或给出改进建议，AI 管理能力提升助手将针对性优化..."
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-4 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#F2C94C]/30 transition-all mb-6 resize-none"
              />

              <button 
                onClick={handleDislikeSubmit}
                className="w-full py-4 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                提交反馈
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contribution Modal (我也来支招) */}
      <AnimatePresence>
        {showContributionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowContributionModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl"
            >
              <button onClick={() => setShowContributionModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
                <X className="w-8 h-8" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-3xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">申请成为“实战案例贡献专家”</h3>
                  <p className="text-sm text-slate-500 mt-1">如果您有更犀利的实战招式，欢迎提交案例。审核通过后，您的案例将入库并署名。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">案例标题</label>
                  <input 
                    type="text" 
                    value={contributionForm.title}
                    onChange={(e) => setContributionForm({...contributionForm, title: e.target.value})}
                    placeholder="例如：某大厂裁员风波中的人心维稳"
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">个人头衔</label>
                  <input 
                    type="text" 
                    value={contributionForm.expertTitle}
                    onChange={(e) => setContributionForm({...contributionForm, expertTitle: e.target.value})}
                    placeholder="例如：前阿里P9 / 资深组织专家"
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">场景描述</label>
                  <textarea 
                    value={contributionForm.scenario}
                    onChange={(e) => setContributionForm({...contributionForm, scenario: e.target.value})}
                    placeholder="请描述具体的实战背景、矛盾冲突点..."
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">核心动作</label>
                  <textarea 
                    value={contributionForm.action}
                    onChange={(e) => setContributionForm({...contributionForm, action: e.target.value})}
                    placeholder="您是如何解决的？关键的几步动作是什么？"
                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleContributionSubmit}
                className="w-full py-5 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                提交申请
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
