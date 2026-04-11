import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic, Prescription, Expert, DiagnosticContext, ChatMessage, ProfileContext } from '../types';
import { FileText, Headphones, Video, Zap, MessageSquare, Sparkles, Award, AlertOctagon, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateManagementFeedback, calculateExpertMatches } from '../services/ai-service';
import { IntentionCapture } from './IntentionCapture';

interface Props {
  topic: Topic;
  prescription: Prescription | null;
  experts: Expert[];
  context: ProfileContext;
  diagnosticContext?: DiagnosticContext | null;
  isGenerating?: boolean;
  chatHistory?: ChatMessage[];
  onUpdateHistory?: (chatHistory: ChatMessage[]) => void;
}

// 打字机效果 Hook
const useTypewriter = (text: string, isActive: boolean, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isActive, speed]);

  return displayedText;
};

export const DiagnosticResultView: React.FC<Props> = ({
  topic,
  prescription,
  experts,
  context,
  diagnosticContext,
  isGenerating = false,
  chatHistory = [],
  onUpdateHistory,
}) => {
  const navigate = useNavigate();
  const [localChatHistory, setLocalChatHistory] = useState<ChatMessage[]>(chatHistory);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showGeneratingAnimation, setShowGeneratingAnimation] = useState(isGenerating);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 打字机效果状态
  const [showTruth, setShowTruth] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [showRedLines, setShowRedLines] = useState(false);

  const truthText = useTypewriter(prescription?.truth || '', showTruth, 25);
  const openingText = useTypewriter(prescription?.script?.opening || '', showScript && truthText === prescription?.truth, 20);

  // 专家匹配
  const expertMatches = useMemo(() => {
    const matches = calculateExpertMatches(
      topic.title,
      context,
      experts.map(e => ({ id: e.id, topics: e.topics, tags: e.tags, resume: e.resume }))
    );
    return matches.slice(0, 3);
  }, [topic, context, experts]);

  const matchedExperts = expertMatches
    .map(m => experts.find(e => e.id === m.expertId))
    .filter(Boolean) as Expert[];
  const expertResources = matchedExperts.length > 0 ? matchedExperts : experts.slice(0, 3);

  // 同步外部 chatHistory
  useEffect(() => {
    setLocalChatHistory(chatHistory);
  }, [chatHistory]);

  // 自动滚动
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localChatHistory]);

  // 生成动画序列
  useEffect(() => {
    if (isGenerating) {
      setShowGeneratingAnimation(true);
      setShowTruth(false);
      setShowScript(false);
      setShowRedLines(false);
    } else if (prescription) {
      // 生成完成，开始打字机效果
      setShowGeneratingAnimation(false);
      setShowTruth(true);

      // 依次显示各部分内容
      const truthTimer = setTimeout(() => {
        setShowScript(true);
      }, (prescription.truth?.length || 0) * 25 + 500);

      const scriptTimer = setTimeout(() => {
        setShowRedLines(true);
      }, (prescription.truth?.length || 0) * 25 + (prescription.script?.opening?.length || 0) * 20 + 1000);

      return () => {
        clearTimeout(truthTimer);
        clearTimeout(scriptTimer);
      };
    }
  }, [isGenerating, prescription]);

  // 处理追问
  const handleFollowUp = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    const updatedHistory = [...localChatHistory, userMessage];
    setLocalChatHistory(updatedHistory);
    onUpdateHistory?.(updatedHistory);

    setIsChatLoading(true);

    try {
      const response = await generateManagementFeedback(
        query,
        context,
        diagnosticContext || null,
        updatedHistory.map(m => ({ role: m.role, content: m.content }))
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
      };

      const finalHistory = [...updatedHistory, aiMessage];
      setLocalChatHistory(finalHistory);
      onUpdateHistory?.(finalHistory);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '抱歉，AI 管理能力提升助手的通讯线路受到干扰，请稍后再试。',
      };
      const finalHistory = [...updatedHistory, errorMessage];
      setLocalChatHistory(finalHistory);
      onUpdateHistory?.(finalHistory);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-4 pb-24">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧主内容区 */}
        <div className="w-full lg:w-[70%] space-y-6">
          {/* 生成中动画 */}
          <AnimatePresence>
            {showGeneratingAnimation && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-[#F2C94C]/10 to-[#F2C94C]/5 border border-[#F2C94C]/30 p-8 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[#F2C94C]/20 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#F2C94C] animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F2C94C] rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">AI 正在深度分析</h3>
                    <p className="text-sm text-slate-500">基于您的诊断结果，生成符合实际现状的实战建议...</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1 bg-[#F2C94C] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: ['0%', '100%', '0%'] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut',
                      }}
                      style={{ flex: 1 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 诊断结果内容 */}
          {!showGeneratingAnimation && prescription && (
            <>
              {/* 真相揭秘 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">本质原因</h3>
                    <p className="text-xs text-slate-400">AI 深度诊断分析</p>
                  </div>
                </div>
                <div className="text-slate-800 text-[15px] leading-relaxed">
                  {truthText}
                  {showTruth && truthText.length < (prescription.truth?.length || 0) && (
                    <span className="inline-block w-0.5 h-5 bg-[#F2C94C] animate-pulse ml-1" />
                  )}
                </div>
              </motion.div>

              {/* 谈话剧本 */}
              {showScript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3C59]/10 flex items-center justify-center text-[#1B3C59]">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">谈话剧本</h3>
                      <p className="text-xs text-slate-400">实战级沟通话术参考</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* 开场白 */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">开场白</span>
                      <div className="mt-2 p-4 bg-slate-50 rounded-2xl border-l-4 border-[#1B3C59]">
                        <p className="text-slate-700 italic">"{openingText}"</p>
                      </div>
                    </div>

                    {/* 核心拆解 */}
                    {prescription.script?.responses?.map((response, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#1B3C59] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 pt-1">{response}</p>
                      </motion.div>
                    ))}

                    {/* 收尾 */}
                    {prescription.script?.closing && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">收尾动作</span>
                        <div className="mt-2 p-4 bg-slate-50 rounded-2xl border-l-4 border-[#1B3C59]">
                          <p className="text-slate-700 italic">"{prescription.script.closing}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 动作红线 */}
              {showRedLines && prescription.redLines && prescription.redLines.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 p-6 md:p-8 rounded-3xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-red-900">动作红线</h3>
                      <p className="text-xs text-red-400">绝对避免的管理误区</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {prescription.redLines.map((line, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-red-800">{line}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </>
          )}

          {/* 追问对话区 */}
          {showRedLines && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#F2C94C]" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">持续追问</span>
              </div>

              {/* 对话历史 */}
              {localChatHistory.length > 0 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {localChatHistory.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        message.role === 'user'
                          ? 'bg-[#1B3C59] text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}>
                        {message.role === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-[#F2C94C]" />
                            </div>
                            <span className="text-xs font-bold text-[#F2C94C]">AI 管理能力提升助手</span>
                          </div>
                        )}
                        <div className="text-sm leading-relaxed">{message.content}</div>
                      </div>
                    </motion.div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-[#F2C94C] animate-spin" />
                          <span className="text-sm text-slate-400">思考中...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* 追问输入框 */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <IntentionCapture
                  onSearch={handleFollowUp}
                  mode="follow-up"
                  placeholder="基于以上研判，您还有哪些具体的实战困惑？"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 右侧边栏 - 仅展示专家 */}
        <div className="w-full lg:w-[30%] space-y-6">
          {expertResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-3 bg-[#F2C94C]/50 rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">推荐专家</h3>
              </div>
              <div className="space-y-3">
                {expertResources.slice(0, 2).map((expert, idx) => {
                  const matchInfo = expertMatches.find(m => m.expertId === expert.id);
                  return (
                    <div
                      key={expert.id}
                      className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:border-[#F2C94C]/30"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={expert.avatar}
                          className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-all cursor-pointer"
                          alt={expert.name}
                          referrerPolicy="no-referrer"
                          onClick={() => navigate(`/expert/${expert.id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-black text-slate-900 truncate">{expert.name}</div>
                            {matchInfo && idx === 0 && (
                              <span className="px-2 py-0.5 bg-[#F2C94C]/10 text-[#F2C94C] text-[9px] font-bold rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                推荐
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold truncate">
                            {expert.department ? `${expert.department} · ${expert.position || expert.title}` : expert.title}
                          </div>
                          {matchInfo && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#F2C94C] to-[#F2C94C]/70 rounded-full"
                                  style={{ width: `${matchInfo.score}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400">{matchInfo.score}分</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
