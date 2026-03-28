import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, User, Send, Copy, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { DiagnoseResultLayout } from './DiagnoseResultLayout';
import { generateManagementFeedback } from '../services/ai-service';
import { useApp } from '../contexts/AppContext';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  feedback?: 'like' | 'dislike' | null;
  showFeedbackForm?: boolean;
}

interface DiagnoseResultProps {
  query: string;
  answers: Record<string, string>;
  onBack?: () => void;
}

// 点踩反馈选项
const DISLIKE_OPTIONS = [
  { id: 'irrelevant', label: '内容与问题无关' },
  { id: 'unclear', label: '表述不够清晰' },
  { id: 'unhelpful', label: '对解决问题没有帮助' },
  { id: 'incorrect', label: '存在事实性错误' },
];

export const DiagnoseResultView: React.FC<DiagnoseResultProps> = ({
  query,
  answers,
  onBack,
}) => {
  const navigate = useNavigate();
  const { context } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 快捷问题状态
  const [quickQuestions, setQuickQuestions] = useState([
    { id: '1', text: '具体该如何操作？', used: false },
    { id: '2', text: '有成功案例吗？', used: false },
    { id: '3', text: '需要注意什么？', used: false },
  ]);

  // 生成初始诊断报告
  useEffect(() => {
    generateInitialReport();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function generateInitialReport() {
    setIsGeneratingReport(true);
    
    try {
      // 构建诊断上下文
      const diagnosticContext = {
        intentStage: '初步诊断',
        riskAssessment: '基于用户描述的管理困境',
        interventionProgress: '刚刚开始',
        details: Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join(', '),
        teamContext: context,
        questionSet: 'general' as const,
      };

      const response = await generateManagementFeedback(
        query || '核心骨干疑似离职，如何提前切入',
        context,
        diagnosticContext
      );

      const initialMessage: ChatMessage = {
        id: 'initial',
        role: 'ai',
        content: response,
        timestamp: Date.now(),
        feedback: null,
        showFeedbackForm: false,
      };
      
      setMessages([initialMessage]);
    } catch (error) {
      console.error('生成诊断报告失败:', error);
      // 兜底回复
      const fallbackMessage: ChatMessage = {
        id: 'initial',
        role: 'ai',
        content: `📋 **基于您的回答，我为您生成了以下诊断报告：**

**您描述的问题：**${query || '核心骨干疑似离职，如何提前切入'}

**🔍 核心洞察：**
• 目标传递存在"衰减"，下属接收到的信息不完整
• 缺乏即时反馈机制，做的好与不好都一样
• 激励手段单一，难以调动不同动力类型的员工

**💡 建议方向：**
1. 建立「日清看板」机制，可视化目标进度
2. 设计即时反馈系统，让好的行为被看见
3. 针对不同员工类型，设计差异化激励

想了解更多细节，可以直接问我 👇`,
        timestamp: Date.now(),
        feedback: null,
        showFeedbackForm: false,
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  const handleSend = async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      feedback: null,
      showFeedbackForm: false,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'ai',
        content: m.content,
      }));

      const response = await generateManagementFeedback(
        content,
        context,
        null,
        history
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: Date.now(),
        feedback: null,
        showFeedbackForm: false,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        timestamp: Date.now(),
        feedback: null,
        showFeedbackForm: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 处理快捷问题点击
  const handleQuickQuestion = (questionId: string, text: string) => {
    // 标记为已使用
    setQuickQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, used: true } : q)
    );
    // 发送问题
    handleSend(text);
  };

  // 复制消息内容
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 可以在这里显示 toast 提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 点赞
  const handleLike = (messageId: string) => {
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId ? { ...m, feedback: m.feedback === 'like' ? null : 'like' } : m
      )
    );
  };

  // 点踩
  const handleDislike = (messageId: string) => {
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId 
          ? { 
              ...m, 
              feedback: m.feedback === 'dislike' ? null : 'dislike',
              showFeedbackForm: m.feedback !== 'dislike'
            } 
          : { ...m, showFeedbackForm: false }
      )
    );
  };

  // 提交点踩反馈
  const handleFeedbackSubmit = (messageId: string, reason: string, detail?: string) => {
    console.log('反馈提交:', { messageId, reason, detail });
    // TODO: 发送到后端
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, showFeedbackForm: false } : m)
    );
  };

  // 关闭反馈表单
  const closeFeedbackForm = (messageId: string) => {
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, showFeedbackForm: false } : m)
    );
  };

  // 渲染消息列表
  const renderMessages = () => (
    <div className="space-y-6">
      {isGeneratingReport && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-[#F2C94C] border-t-transparent rounded-full animate-spin" />
            <span>AI 正在深度分析...</span>
          </div>
        </motion.div>
      )}

      {messages.map((message, index) => {
        // 判断是否显示时间戳（与上一条消息间隔超过5分钟，或是第一条消息，或是最后一条）
        const prevMessage = messages[index - 1];
        const showTimestamp = !prevMessage || 
          (message.timestamp - prevMessage.timestamp > 5 * 60 * 1000) ||
          index === messages.length - 1;

        return (
          <div key={message.id}>
            {/* 时间分割线 */}
            {showTimestamp && index > 0 && (
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="mx-4 text-xs text-slate-400">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'ai' 
                  ? 'bg-[#F2C94C] text-[#1B3C59]' 
                  : 'bg-[#1B3C59] text-white'
              }`}>
                {message.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* 消息内容 */}
              <div className={`max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-5 py-4 ${
                  message.role === 'ai'
                    ? 'bg-white border border-slate-200 shadow-sm'
                    : 'bg-[#1B3C59] text-white'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('•') || /^\d\./.test(line) ? 'ml-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* AI 消息的操作栏 */}
                {message.role === 'ai' && (
                  <div className="flex items-center gap-2 mt-2">
                    {/* 复制按钮 */}
                    <button 
                      onClick={() => handleCopy(message.content)}
                      className="p-1.5 text-slate-400 hover:text-[#F2C94C] hover:bg-slate-100 rounded transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* 点赞按钮 */}
                    <button 
                      onClick={() => handleLike(message.id)}
                      className={`p-1.5 rounded transition-colors ${
                        message.feedback === 'like' 
                          ? 'text-[#F2C94C] bg-[#F2C94C]/10' 
                          : 'text-slate-400 hover:text-[#F2C94C] hover:bg-slate-100'
                      }`}
                      title="有帮助"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>

                    {/* 点踩按钮 */}
                    <button 
                      onClick={() => handleDislike(message.id)}
                      className={`p-1.5 rounded transition-colors ${
                        message.feedback === 'dislike' 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                      }`}
                      title="没有帮助"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>

                    {/* 时间戳 */}
                    {showTimestamp && (
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )}

                {/* 点踩反馈表单 */}
                {message.showFeedbackForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">请告诉我们原因：</span>
                      <button 
                        onClick={() => closeFeedbackForm(message.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      {DISLIKE_OPTIONS.map(option => (
                        <label 
                          key={option.id}
                          className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                        >
                          <input 
                            type="radio" 
                            name={`feedback-${message.id}`}
                            value={option.id}
                            className="text-[#F2C94C] focus:ring-[#F2C94C]"
                          />
                          <span className="text-sm text-slate-600">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="其他建议（可选）..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-[#F2C94C] focus:border-transparent"
                      rows={2}
                    />
                    <button
                      onClick={() => {
                        const selected = document.querySelector(`input[name="feedback-${message.id}"]:checked`) as HTMLInputElement;
                        const detail = (document.querySelector(`textarea[data-message-id="${message.id}"]`) as HTMLTextAreaElement)?.value;
                        if (selected) {
                          handleFeedbackSubmit(message.id, selected.value, detail);
                        }
                      }}
                      className="mt-3 px-4 py-2 bg-[#F2C94C] text-white text-sm font-medium rounded-lg hover:bg-[#E5B73B] transition-colors"
                    >
                      提交反馈
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}

      {isTyping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[#F2C94C] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#1B3C59]" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );

  // 渲染输入区
  const renderInputArea = () => (
    <div className="max-w-3xl mx-auto">
      {/* 快捷追问 - 横向滚动 */}
      {quickQuestions.some(q => !q.used) && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickQuestions.filter(q => !q.used).map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuickQuestion(q.id, q.text)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-[#F2C94C] hover:text-[#1B3C59] transition-colors whitespace-nowrap flex-shrink-0"
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="追问更多细节..."
            className="w-full px-5 py-3 bg-slate-100 border-0 rounded-full focus:ring-2 focus:ring-[#F2C94C] focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isTyping}
          className="px-6 py-3 bg-[#F2C94C] text-[#1B3C59] font-bold rounded-full hover:bg-[#E5B73B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          发送
        </button>
      </div>
    </div>
  );

  return (
    <DiagnoseResultLayout 
      inputArea={renderInputArea()}
    >
      {renderMessages()}
    </DiagnoseResultLayout>
  );
};
