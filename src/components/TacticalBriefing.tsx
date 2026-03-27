import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic, Prescription, Expert, DiagnosticContext, ChatMessage } from '../types';
import { FileText, Headphones, Video, ThumbsUp, ThumbsDown, X, Zap, Copy, Download, CornerRightDown, Play, MessageSquare, Search, Mic, ArrowRight, Star, ShieldCheck, Activity, BookOpen, Pause, Volume2, Sparkles, Check, ShieldAlert } from 'lucide-react';
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
  chatHistory?: ChatMessage[];
  onUpdateHistory?: (chatHistory: ChatMessage[]) => void;
}

// 消息反馈状态
interface MessageFeedback {
  messageId: string;
  type: 'like' | 'dislike' | null;
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
  relatedTopics = [],
  chatHistory = [],
  onUpdateHistory
}) => {
  const navigate = useNavigate();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeModal, setActiveModal] = useState<'document' | 'audio' | 'video' | null>(null);
  const [activeExpertForModal, setActiveExpertForModal] = useState<Expert | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showDislikeModal, setShowDislikeModal] = useState(false);
  const [dislikeOptions, setDislikeOptions] = useState<string[]>([]);
  const [dislikeText, setDislikeText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isAiContentExpanded, setIsAiContentExpanded] = useState(false);
  const [localChatHistory, setLocalChatHistory] = useState<ChatMessage[]>(chatHistory);
  const [isChatLoading, setIsChatLoading] = useState(false);
  // 消息反馈状态
  const [messageFeedbacks, setMessageFeedbacks] = useState<Record<string, MessageFeedback>>({});
  const [activeFeedbackMessageId, setActiveFeedbackMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // 同步外部 chatHistory 到本地状态
  useEffect(() => {
    setLocalChatHistory(chatHistory);
  }, [chatHistory]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localChatHistory]);

  // 处理追问
  const handleFollowUp = async (query: string) => {
    if (!query.trim()) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    const updatedHistory = [...localChatHistory, userMessage];
    setLocalChatHistory(updatedHistory);
    onUpdateHistory?.(updatedHistory);

    // 显示加载状态
    setIsChatLoading(true);

    try {
      // 调用 AI 服务获取回复
      const response = await generateManagementFeedback(
        query,
        context,
        diagnosticContext || null,
        updatedHistory.map(m => ({ role: m.role, content: m.content }))
      );

      // 添加 AI 回复
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response
      };

      const finalHistory = [...updatedHistory, aiMessage];
      setLocalChatHistory(finalHistory);
      onUpdateHistory?.(finalHistory);
    } catch (error) {
      console.error('Follow-up error:', error);
      // 添加错误提示消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '抱歉，AI 管理能力提升助手的通讯线路受到干扰，请稍后再试。'
      };
      const finalHistory = [...updatedHistory, errorMessage];
      setLocalChatHistory(finalHistory);
      onUpdateHistory?.(finalHistory);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 处理消息点赞
  const handleMessageLike = (messageId: string) => {
    setMessageFeedbacks(prev => ({
      ...prev,
      [messageId]: { messageId, type: 'like' }
    }));
    setToast('感谢反馈');
    setTimeout(() => setToast(null), 2000);
  };

  // 处理消息点踩
  const handleMessageDislike = (messageId: string) => {
    setActiveFeedbackMessageId(messageId);
    setShowDislikeModal(true);
  };

  // 提交点踩反馈
  const handleDislikeSubmit = () => {
    if (activeFeedbackMessageId) {
      setMessageFeedbacks(prev => ({
        ...prev,
        [activeFeedbackMessageId]: { messageId: activeFeedbackMessageId, type: 'dislike' }
      }));
    }
    console.log('Dislike feedback:', { options: dislikeOptions, text: dislikeText });
    setShowDislikeModal(false);
    setActiveFeedbackMessageId(null);
    setToast('反馈已上传指挥中心');
    setTimeout(() => setToast(null), 2000);
    setDislikeOptions([]);
    setDislikeText('');
  };

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

  const toggleDislikeOption = (option: string) => {
    setDislikeOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s] pt-4 pb-24">
      {/* 左右分栏布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧主区域：70% */}
        <div className="w-full lg:w-[70%] space-y-6">
          {/* A. 诊断卡片区 */}
          <section className="space-y-6">
            {/* AI Insight Container - 仅深度诊断显示 */}
            {topic.id === 'diagnostic-result' && <DigestCard content={prescription?.summary} />}

            {/* 学一学页面内容 - 显示话题详情和AI建议 */}
            {topic.id !== 'diagnostic-result' && (
              <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-sm">
                {isGeneratingFeedback && (
                  <div className="flex items-center gap-2 text-[#F2C94C] text-[10px] font-black uppercase tracking-widest mb-6 animate-pulse">
                    <Zap className="w-3 h-3 animate-spin" /> 正在深度研判中...
                  </div>
                )}

                {/* AI 智能解析解法 标签 */}
                <div className="absolute top-0 left-0">
                  <div className="bg-[#F2C94C] text-[#0A0F1D] px-4 py-1.5 rounded-br-xl text-[11px] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    AI 智能解析解法
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* AI建议内容 - 可展开/折叠 */}
                  <div className="relative">
                    <AnimatePresence initial={false}>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isAiContentExpanded ? "auto" : "4.8em"
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="text-slate-800 text-[15px] leading-relaxed">
                          {prescription?.truth || topic.caseStudy || "执行力差的本质往往是目标不清晰或激励不到位。某互联网大厂技术总监张工发现，团队连续三个月延期交付，成员普遍缺乏主动性。经过深度调研，他发现问题的根源在于：任务分解过于粗放，每个人只知道大目标，不清楚每日具体产出；绩效考核季度才做一次，反馈周期太长；团队缺乏成就感，看不到自己的努力如何转化为业务价值。基于此，张工采取了系统性改进措施：首先，他将月度目标拆解为周目标，再细化为每日站会明确的三个核心任务，做到'人人有指标，天天有产出'；其次，建立了'小步快跑'的激励机制，每周五下午进行'本周之星'评选，获奖者可获得半天调休和团队掌声，让优秀及时被看见；第三，他引入了'业务价值可视化看板'，将技术产出与业务数据挂钩，让程序员们看到自己写的代码如何提升用户体验、增加营收。三个月后，团队面貌焕然一新：主动加班不再需要催促，成员开始自发优化代码，跨部门协作也更加顺畅。更重要的是，团队形成了'比学赶超'的良好氛围，连续两个月提前完成迭代，客户满意度提升了40个百分点。这套方法论被公司推广到其他部门，成为组织效能提升的标杆案例。"}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* 未展开时的渐变遮罩 */}
                    {!isAiContentExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* 展开/折叠 按钮 */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setIsAiContentExpanded(!isAiContentExpanded)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#F2C94C] transition-colors"
                    >
                      {isAiContentExpanded ? "收起内容" : "展开详细内容"}
                      <motion.svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: isAiContentExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Chat Dialog Section - 持续追问对话区 */}
          <div className="space-y-4">
            {/* 聊天历史展示 */}
            {localChatHistory.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#F2C94C]" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">持续追问</span>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {localChatHistory.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[85%]">
                        <div
                          className={`rounded-2xl px-5 py-4 ${
                            message.role === 'user'
                              ? 'bg-[#1B3C59] text-white'
                              : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        >
                          {message.role === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-[#F2C94C]" />
                              </div>
                              <span className="text-xs font-bold text-[#F2C94C]">AI 管理能力提升助手</span>
                            </div>
                          )}
                          <div className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                            {message.content}
                          </div>
                        </div>
                        
                        {/* AI消息点赞/点踩按钮 */}
                        {message.role === 'ai' && (
                          <div className="flex items-center gap-2 mt-2 ml-1">
                            <button
                              onClick={() => handleMessageLike(message.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                messageFeedbacks[message.id]?.type === 'like'
                                  ? 'bg-[#F2C94C]/20 text-[#F2C94C]'
                                  : 'text-slate-400 hover:text-[#F2C94C] hover:bg-slate-100'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>有用</span>
                            </button>
                            <button
                              onClick={() => handleMessageDislike(message.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                messageFeedbacks[message.id]?.type === 'dislike'
                                  ? 'bg-red-100 text-red-500'
                                  : 'text-slate-400 hover:text-red-400 hover:bg-slate-100'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>需改进</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* 加载状态 */}
                  {isChatLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 max-w-[85%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-[#F2C94C]" />
                          </div>
                          <span className="text-xs font-bold text-[#F2C94C]">AI 管理能力提升助手</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-2 h-2 bg-[#F2C94C] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-[#F2C94C] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-[#F2C94C] rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span>深度研判中...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
            
            {/* 输入框 - 固定在左侧底部 */}
            <IntentionCapture
              onSearch={handleFollowUp}
              mode="follow-up"
              placeholder={localChatHistory.length > 0 ? "继续追问..." : "基于以上研判，您还有哪些具体的实战困惑？"}
            />
          </div>
        </div>

        {/* 右侧辅助区域：30% */}
        <div className="w-full lg:w-[30%] space-y-6">
          {/* B. 参考来源 (简化专家列表) */}
          {expertResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-3 bg-[#F2C94C]/50 rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">参考来源</h3>
              </div>
              <div className="space-y-3">
                {expertResources.slice(0, 4).map(expert => (
                  <div
                    key={expert.id}
                    className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:border-[#F2C94C]/30"
                  >
                    {/* 头像和基本信息 */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={expert.avatar}
                        className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-all cursor-pointer"
                        alt={expert.name}
                        referrerPolicy="no-referrer"
                        onClick={() => navigate(`/expert/${expert.id}`)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">
                          {expert.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold truncate">
                          {expert.title}
                        </div>
                      </div>
                    </div>
                    
                    {/* 媒体资源按钮 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=video`); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all text-[10px] font-bold"
                      >
                        <Video className="w-3.5 h-3.5" />
                        视频
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=audio`); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all text-[10px] font-bold"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        音频
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=text`); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all text-[10px] font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        图文
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. 实战转化入口 */}
          {topic.id !== 'diagnostic-result' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-3 bg-[#F2C94C]/50 rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">实战转化</h3>
              </div>
              
              <div className="space-y-3">
                <div 
                  onClick={() => onNavigateToPractice?.(topic.id)}
                  className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-[#0A0F1D] mb-1 group-hover:text-[#F2C94C] transition-colors">练一练</h4>
                      <p className="text-[11px] text-gray-400">情景模拟练习，在实战中掌握管理技能</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[#F2C94C] transition-all" />
                  </div>
                </div>

                <div 
                  onClick={() => onNavigateToDiagnosis?.(topic.id)}
                  className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-[#0A0F1D] mb-1 group-hover:text-[#F2C94C] transition-colors">聊一聊</h4>
                      <p className="text-[11px] text-gray-400">深度智能诊断，获取个性化管理建议</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[#F2C94C] transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowDislikeModal(false); setActiveFeedbackMessageId(null); }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl"
            >
              <button onClick={() => { setShowDislikeModal(false); setActiveFeedbackMessageId(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-black text-slate-900 mb-6 pr-8">指挥官，哪部分内容不符合您的预期？</h3>
              
              <div className="space-y-3 mb-6">
                {['建议话术不接地气 (感觉在讲大道理)', '管理动作生硬：话术不符合真实场景', '逻辑有误：前后矛盾', '有管理风险：建议的做法可能导致更严重的冲突'].map(option => (
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
                placeholder="请告诉我们哪里不对，我们会立即修正"
                className="w-full h-32 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all mb-6 resize-none"
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
    </div>
  );
};
