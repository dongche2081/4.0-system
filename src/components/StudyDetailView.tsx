import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic, Expert, ProfileContext } from '../types';
import { TOPICS } from '../data';
import { 
  FileText, Headphones, Video, Zap, Activity, Sparkles, Users, Sword, 
  Link2, ChevronDown, ChevronRight, ThumbsUp, ThumbsDown, Bookmark, 
  Copy, Lightbulb, ArrowRight, FileX, ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateExpertMatches } from '../services/ai-service';
import { ErrorBoundary } from './ErrorBoundary';
import { Toast, useToast } from './Toast';

import { FeedbackModal } from './FeedbackModal';
import { ContributeModal } from './ContributeModal';
import { TOPIC_DETAIL_MESSAGES, TOPIC_DETAIL_CONSTANTS } from '../constants/messages';

interface Props {
  topic: Topic;
  experts: Expert[];
  context: ProfileContext;
  onNavigateToPractice: (topicId: string) => void;
  onNavigateToDiagnosis: (topicId: string) => void;
}

// 骨架屏组件
const TopicDetailSkeleton: React.FC = () => (
  <div className="min-h-full bg-slate-50 pb-12">
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* 标题骨架 */}
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex gap-2 mb-3">
          <div className="w-16 h-6 bg-slate-200 rounded-full" />
          <div className="w-12 h-6 bg-slate-200 rounded-full" />
        </div>
        <div className="w-3/4 h-8 bg-slate-200 rounded mb-4" />
        <div className="w-12 h-0.5 bg-slate-200 mb-4" />
        <div className="flex gap-4">
          <div className="w-20 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
        </div>
      </div>

      {/* 内容骨架 */}
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="w-32 h-5 bg-slate-200 rounded mb-3" />
        <div className="w-12 h-0.5 bg-slate-200 mb-4" />
        <div className="space-y-2">
          <div className="w-full h-4 bg-slate-200 rounded" />
          <div className="w-full h-4 bg-slate-200 rounded" />
          <div className="w-2/3 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// 空状态组件
const EmptyCaseStudy: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <FileX className="w-8 h-8 text-slate-400" />
    </div>
    <h4 className="text-base font-bold text-slate-700 mb-2">
      {TOPIC_DETAIL_MESSAGES.emptyCaseStudy.title}
    </h4>
    <p className="text-sm text-slate-500 max-w-xs mb-4">
      {TOPIC_DETAIL_MESSAGES.emptyCaseStudy.description}
    </p>
  </div>
);

// 相关话题组件
const RelatedTopics: React.FC<{ relatedIds: string[]; currentTopicId: string }> = ({ 
  relatedIds, 
  currentTopicId 
}) => {
  const navigate = useNavigate();
  
  const relatedTopics = useMemo(() => {
    return relatedIds
      .slice(0, TOPIC_DETAIL_CONSTANTS.MAX_RELATED_TOPICS)
      .map(id => TOPICS.find(t => t.id === id))
      .filter(Boolean) as Topic[];
  }, [relatedIds]);

  if (relatedTopics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      {/* 标题区 */}
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-black text-slate-900">
          {TOPIC_DETAIL_MESSAGES.relatedTopics.title}
        </h3>
      </div>

      {/* 分隔线 */}
      <div className="w-12 h-0.5 bg-amber-400 mb-4" />

      <div className="space-y-2">
        {relatedTopics.map((topic, index) => (
          <button
            key={topic.id}
            onClick={() => navigate(`/topic/${topic.id}`)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
          >
            <span className="text-xs font-bold text-amber-400/60 group-hover:text-amber-400 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">
              {topic.title}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const StudyDetailView: React.FC<Props> = ({
  topic,
  experts,
  context,
  onNavigateToPractice = (_topicId: string) => {},
  onNavigateToDiagnosis = (_topicId: string) => {}
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);

  // 常量
  const { MAX_EXPERTS_DISPLAY } = TOPIC_DETAIL_CONSTANTS;

  // 专家匹配（修复重复问题）
  const expertMatches = useMemo(() => {
    try {
      const matches = calculateExpertMatches(
        topic.title,
        context,
        experts.map(e => ({ id: e.id, topics: e.topics, tags: e.tags, resume: e.resume }))
      );
      return matches.slice(0, MAX_EXPERTS_DISPLAY);
    } catch (error) {
      console.error('专家匹配失败:', error);
      return [];
    }
  }, [topic, context, experts]);

  // 修复：避免重复的专家
  const matchedExperts = useMemo(() => {
    const matched = expertMatches
      .map(m => experts.find(e => e.id === m.expertId))
      .filter(Boolean) as Expert[];
    
    // 如果匹配专家不足，从剩余专家中补充，避免重复
    if (matched.length < MAX_EXPERTS_DISPLAY) {
      const matchedIds = new Set(matched.map(e => e.id));
      const remainingExperts = experts.filter(e => !matchedIds.has(e.id));
      const needCount = MAX_EXPERTS_DISPLAY - matched.length;
      return [...matched, ...remainingExperts.slice(0, needCount)];
    }
    
    return matched;
  }, [expertMatches, experts]);

  // 滚动专家卡片
  const scrollExperts = (direction: 'left' | 'right') => {
    const container = document.getElementById('expert-scroll-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(topic.caseStudy || '');
      addToast(TOPIC_DETAIL_MESSAGES.toast.copySuccess, 'success');
    } catch {
      addToast('复制失败，请手动复制', 'error');
    }
  };

  // 点赞
  const handleLike = () => {
    addToast(TOPIC_DETAIL_MESSAGES.toast.likeSuccess, 'success');
  };

  // 点踩
  const handleDislike = () => {
    setFeedbackModalOpen(true);
  };

  // 提交反馈
  const handleFeedbackSubmit = (reason: string, detail?: string) => {
    console.log('反馈内容:', { reason, detail });
    addToast(TOPIC_DETAIL_MESSAGES.toast.feedbackSuccess, 'success');
  };

  // 收藏
  const handleBookmark = () => {
    addToast(TOPIC_DETAIL_MESSAGES.toast.bookmarkSuccess, 'success');
  };

  // 我也来支招
  const handleContribute = () => {
    setContributeModalOpen(true);
  };

  // 提交支招
  const handleContributeSubmit = (content: string) => {
    console.log('用户支招:', content);
    addToast(TOPIC_DETAIL_MESSAGES.toast.contributeSuccess, 'success');
  };

  // 导航到聊一聊
  const handleNavigateToChat = () => {
    onNavigateToDiagnosis?.(topic.id);
  };

  // 导航到练一练
  const handleNavigateToPractice = () => {
    onNavigateToPractice?.(topic.id);
  };

  if (isLoading) {
    return <TopicDetailSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-full bg-slate-50 pb-12">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          
          {/* 1. 标题卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                {topic.type}
              </span>
              {topic.isHot && (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                  HOT
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4 break-words">
              {topic.title}
            </h1>
            
            {/* 金色分隔线 */}
            <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>
            
            {/* 元信息 */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Video className="w-3.5 h-3.5" />
                {topic.views?.toLocaleString() || '1,234'} 浏览
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI 智能解析
              </span>
            </div>
          </motion.div>

          {/* 2. AI 智能解析算法卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* 标题区 */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-slate-900">
                {TOPIC_DETAIL_MESSAGES.aiAnalysis.title}
              </h3>
            </div>
            
            {/* 金色分隔线 */}
            <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>

            {/* 内容区 */}
            <div className="relative">
              {topic.caseStudy ? (
                <>
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : '6em' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="text-slate-700 text-[15px] leading-relaxed">
                      {topic.caseStudy}
                    </div>
                  </motion.div>

                  {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </>
              ) : (
                <EmptyCaseStudy />
              )}
            </div>

            {/* 展开/收起按钮 + 操作按钮 */}
            {topic.caseStudy && (
              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm text-amber-400 font-bold hover:text-amber-500 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? TOPIC_DETAIL_MESSAGES.aiAnalysis.collapse : TOPIC_DETAIL_MESSAGES.aiAnalysis.expand}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* 操作按钮栏 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                    title={TOPIC_DETAIL_MESSAGES.actions.copy}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{TOPIC_DETAIL_MESSAGES.actions.copy}</span>
                  </button>
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                    title={TOPIC_DETAIL_MESSAGES.actions.like}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{TOPIC_DETAIL_MESSAGES.actions.like}</span>
                  </button>
                  <button
                    onClick={handleDislike}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                    title={TOPIC_DETAIL_MESSAGES.actions.dislike}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{TOPIC_DETAIL_MESSAGES.actions.dislike}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                    title={TOPIC_DETAIL_MESSAGES.actions.bookmark}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{TOPIC_DETAIL_MESSAGES.actions.bookmark}</span>
                  </button>
                  <button
                    onClick={handleContribute}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                    title={TOPIC_DETAIL_MESSAGES.actions.contribute}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{TOPIC_DETAIL_MESSAGES.actions.contribute}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* 3. 参考专家卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* 标题区 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-slate-900">
                  {TOPIC_DETAIL_MESSAGES.expert.title}
                </h3>
              </div>
              {/* 桌面端滚动按钮 */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => scrollExperts('left')}
                  className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollExperts('right')}
                  className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 金色分隔线 */}
            <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>

            {/* 专家列表 - 移动端横向滚动，桌面端网格 */}
            <div className="relative">
              {/* 滚动提示阴影 */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" />
              
              <div 
                id="expert-scroll-container"
                className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible"
              >
                {matchedExperts.length > 0 ? (
                  matchedExperts.map((expert) => (
                    <motion.div
                      key={expert.id}
                      whileHover={{ y: -4 }}
                      className="flex-shrink-0 w-36 md:w-auto bg-slate-50 border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all"
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* 头像和姓名 - 可点击跳转 */}
                        <div
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => navigate(`/expert/${expert.id}`)}
                        >
                          <img
                            src={expert.avatar}
                            className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 mb-3 group-hover:border-amber-400 transition-colors"
                            alt={expert.name}
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {expert.name}
                          </div>
                        </div>
                        
                        {/* 部门 + 职务 */}
                        <div className="text-xs text-slate-500 mb-3 line-clamp-1" title={`${expert.department || ''} · ${expert.position || expert.title || ''}`}>
                          {expert.department ? `${expert.department} · ${expert.position || expert.title}` : (expert.position || expert.title)}
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-1.5 w-full">
                          <button
                            onClick={() => navigate(`/expert/${expert.id}/case/c1?type=video&from=topic`)}
                            className="flex-1 flex items-center justify-center py-1.5 bg-white rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-all"
                            title={TOPIC_DETAIL_MESSAGES.expert.video}
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/expert/${expert.id}/case/c1?type=audio&from=topic`)}
                            className="flex-1 flex items-center justify-center py-1.5 bg-white rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-all"
                            title={TOPIC_DETAIL_MESSAGES.expert.audio}
                          >
                            <Headphones className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/expert/${expert.id}/case/c1?type=text&from=topic`)}
                            className="flex-1 flex items-center justify-center py-1.5 bg-white rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-all"
                            title={TOPIC_DETAIL_MESSAGES.expert.text}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-8 text-slate-400 text-sm">
                    {TOPIC_DETAIL_MESSAGES.expert.noExpert}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 4. 实战转化卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* 标题区 */}
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-slate-900">
                {TOPIC_DETAIL_MESSAGES.practice.title}
              </h3>
            </div>
            
            {/* 金色分隔线 */}
            <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 聊一聊 */}
              <button
                onClick={handleNavigateToChat}
                className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all text-left h-full"
              >
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:bg-amber-50 transition-colors">
                  <Activity className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div className="text-sm font-bold text-slate-900 mb-1">
                  {TOPIC_DETAIL_MESSAGES.practice.chatTitle}
                </div>
                <div className="text-xs text-slate-500">
                  {TOPIC_DETAIL_MESSAGES.practice.chatDesc}
                </div>
              </button>
              
              {/* 练一练 */}
              <button
                onClick={handleNavigateToPractice}
                className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all text-left h-full"
              >
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:bg-amber-50 transition-colors">
                  <Sword className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div className="text-sm font-bold text-slate-900 mb-1">
                  {TOPIC_DETAIL_MESSAGES.practice.practiceTitle}
                </div>
                <div className="text-xs text-slate-500">
                  {TOPIC_DETAIL_MESSAGES.practice.practiceDesc}
                </div>
              </button>
            </div>
          </motion.div>

          {/* 5. 相关话题 */}
          {topic.relatedIds && topic.relatedIds.length > 0 && (
            <RelatedTopics 
              relatedIds={topic.relatedIds} 
              currentTopicId={topic.id} 
            />
          )}

        </div>

        {/* Toast 提示 */}
        <Toast toasts={toasts} onRemove={removeToast} />

        {/* 反馈弹窗 */}
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />

        {/* 支招弹窗 */}
        <ContributeModal
          isOpen={contributeModalOpen}
          onClose={() => setContributeModalOpen(false)}
          onSubmit={handleContributeSubmit}
          topicTitle={topic.title}
        />
      </div>
    </ErrorBoundary>
  );
};
