import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TacticalBriefing } from '../TacticalBriefing';
import { TOPICS, PRESCRIPTION_DATA, EXPERTS } from '../../data';
import { useApp } from '../../contexts/AppContext';
import type { Topic } from '../../types';

export const TacticalBriefingWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useApp();
  const { 
    selectedTopic, 
    setSelectedTopic,
    diagnosticContext,
    context,
    aiFeedback,
    isGeneratingFeedback,
    history,
    activeHistoryId,
    setTargetTopicId,
    setPendingQuery,
    handleTopicClick,
    handleUpdateHistory,
    handleExpertClick,
    handleSearch
  } = app;

  const topic = TOPICS.find(t => t.id === id) || (selectedTopic?.id === id ? selectedTopic : null);
  
  if (!topic) return <div className="flex items-center justify-center h-full text-slate-400">话题加载中...</div>;

  return (
    <TacticalBriefing 
      topic={topic}
      prescription={topic.id === 'diagnostic-result' ? {
        truth: `### 研判真相：${diagnosticContext?.intentStage}\n\n**核心风险：** ${diagnosticContext?.riskAssessment}\n\n**干预进度：** ${diagnosticContext?.interventionProgress}\n\n**补充细节：** ${diagnosticContext?.details || '无'}\n\n--- \n\n基于您的团队处于 **${context.businessStage}** 且压力指数为 **${context.pressure}**，AI 管理能力提升助手建议：\n\n1. **立即对齐利益**：针对${diagnosticContext?.riskAssessment}，需在24小时内开启非正式面谈。\n2. **情绪缓冲**：考虑到${diagnosticContext?.interventionProgress}，建议引入第三方中立视角。`,
        script: { opening: '“我们来聊聊这件事...”', responses: ['正在思考...'], closing: '“希望这能帮到您。”' },
        redLines: []
      } : topic.id === 'custom' ? {
        truth: aiFeedback.split('\n\n')[0] || '正在剖析真相...',
        script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
        redLines: ['正在划定红线...']
      } : PRESCRIPTION_DATA[topic.id] || null}
      experts={EXPERTS}
      context={context}
      diagnosticContext={diagnosticContext}
      onNavigateToTopic={handleTopicClick}
      onNavigateToPractice={(pid: string) => {
        setTargetTopicId(pid);
        navigate('/practice');
      }}
      onNavigateToDiagnosis={(pid: string) => {
        setTargetTopicId(pid);
        const t = TOPICS.find(tp => tp.id === pid);
        if (t) setPendingQuery(t.title);
        navigate('/diagnose-engine');
      }}
      onExpertClick={handleExpertClick}
      onFollowUp={(q: string) => handleSearch(q, diagnosticContext)}
      isGeneratingFeedback={isGeneratingFeedback}
      onUpdateHistory={handleUpdateHistory}
      chatHistory={history.find(h => h.id === activeHistoryId)?.chatHistory || []}
      relatedTopics={
        topic.relatedIds 
          ? TOPICS.filter(t => topic.relatedIds?.includes(t.id))
          : TOPICS.filter(t => t.id !== topic.id).slice(0, 3)
      }
    />
  );
};
