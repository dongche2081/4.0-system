import { useState, useEffect, useCallback } from 'react';
import { AppView, ProfileContext, HistoryItem, UserStats, StudyRecord, SimulationRecord, Topic, Expert } from '../types';
import { EXPERTS, EXPERT_CASES } from '../data';

export function useAppState() {
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // 当前视图
  const [view, setView] = useState<AppView>('home');

  // 简报模式
  const [isBriefingMode, setIsBriefingMode] = useState(false);

  // 用户上下文配置（从 localStorage 读取）
  const [context, setContext] = useState<ProfileContext>(() => {
    const saved = localStorage.getItem('saodiseng_context');
    return saved ? JSON.parse(saved) : {
      businessStage: '快速扩张期',
      teamStatus: '人心浮动中',
      leadershipStyle: '强势结果导向',
      managementMode: '互联网敏捷模式',
      span: 8,
      levels: 2,
      composition: ['研发', '产品'],
      pressure: 6,
      decisionMode: '民主决策',
      memo: ''
    };
  });

  // 保存 context 到 localStorage
  useEffect(() => {
    localStorage.setItem('saodiseng_context', JSON.stringify(context));
  }, [context]);

  // 用户统计数据（从 localStorage 读取）
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('saodiseng_user_stats');
    return saved ? JSON.parse(saved) : {
      points: 1200,
      medals: ['初出茅庐', '战地观察员'],
      experience: '3-5年',
      scale: '5-15人',
      domain: '研发',
      bookmarks: [],
      likes: []
    };
  });

  // 保存 userStats 到 localStorage
  useEffect(() => {
    localStorage.setItem('saodiseng_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  // 历史记录
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 学习记录（从 localStorage 读取）
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>(() => {
    const saved = localStorage.getItem('saodiseng_study_records');
    return saved ? JSON.parse(saved) : [];
  });

  // 保存 studyRecords 到 localStorage
  useEffect(() => {
    localStorage.setItem('saodiseng_study_records', JSON.stringify(studyRecords));
  }, [studyRecords]);

  // 演练记录（从 localStorage 读取）
  const [practiceRecords, setPracticeRecords] = useState<SimulationRecord[]>(() => {
    const saved = localStorage.getItem('saodiseng_practice_records');
    return saved ? JSON.parse(saved) : [];
  });

  // 保存 practiceRecords 到 localStorage
  useEffect(() => {
    localStorage.setItem('saodiseng_practice_records', JSON.stringify(practiceRecords));
  }, [practiceRecords]);

  // 专家列表（用于 handleTrackInteraction）
  const [experts, setExperts] = useState<Expert[]>(EXPERTS);

  // 目标话题ID（用于页面间跳转）
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);

  // 记录学习行为
  const recordStudyAction = (topic: Topic, expert: Expert, action: 'view' | 'bookmark' | 'share', duration: number = 0) => {
    const newRecord: StudyRecord = {
      id: `study-${Date.now()}`,
      topicId: topic.id,
      topicTitle: topic.title,
      expertName: expert.name,
      expertTitle: expert.title,
      action,
      timestamp: Date.now(),
      duration,
    };
    setStudyRecords(prev => [newRecord, ...prev].slice(0, 100)); // 保留最近100条
  };

  // 记录演练行为
  const recordPracticeAction = (scenario: any, selectedOption: string, isCorrect: boolean, timeSpent: number) => {
    const newRecord: SimulationRecord = {
      id: `practice-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.description,
      category: '常规管理', // 可以从scenario中提取
      selectedOption,
      isCorrect,
      impact: scenario.options.find((o: any) => o.id === selectedOption)?.impact || { morale: 0, efficiency: 0, retention: 0 },
      timestamp: Date.now(),
      timeSpent,
    };
    setPracticeRecords(prev => [newRecord, ...prev].slice(0, 100));
  };

  // 跟踪专家案例互动
  const handleTrackInteraction = useCallback((caseId: string, type: 'click' | 'play' | 'bookmark' | 'like' | 'comment') => {
    const expertCase = EXPERT_CASES[caseId];
    if (!expertCase) return;

    setExperts(prev => {
      return prev.map(expert => {
        if (expert.id === expertCase.expertId) {
          const newStats = { ...expert.stats };
          if (type === 'click') newStats.clicks++;
          if (type === 'play') newStats.plays++;
          if (type === 'bookmark') newStats.bookmarks++;
          if (type === 'like') newStats.likes++;
          if (type === 'comment') newStats.comments++;

          // Calculate new points based on formula:
          // Clicks * 1 + Plays * 2 + (Bookmarks + Likes + Comments) * 5
          const newPoints = (newStats.clicks * 1) + 
                           (newStats.plays * 2) + 
                           ((newStats.bookmarks + newStats.likes + newStats.comments) * 5);

          return { ...expert, stats: newStats, points: newPoints };
        }
        return expert;
      }).sort((a, b) => b.points - a.points);
    });

    if (type === 'bookmark') {
      setUserStats(prev => {
        const isBookmarked = prev.bookmarks?.includes(caseId);
        const newBookmarks = isBookmarked 
          ? prev.bookmarks?.filter(id => id !== caseId) 
          : [...(prev.bookmarks || []), caseId];
        return { ...prev, bookmarks: newBookmarks };
      });
    }

    if (type === 'like') {
      setUserStats(prev => {
        const isLiked = prev.likes?.includes(caseId);
        const newLikes = isLiked 
          ? prev.likes?.filter(id => id !== caseId) 
          : [...(prev.likes || []), caseId];
        return { ...prev, likes: newLikes };
      });
    }
  }, []);

  return {
    // 状态
    isLoggedIn,
    setIsLoggedIn,
    view,
    setView,
    isBriefingMode,
    setIsBriefingMode,
    context,
    setContext,
    userStats,
    setUserStats,
    history,
    setHistory,
    studyRecords,
    setStudyRecords,
    practiceRecords,
    setPracticeRecords,
    experts,
    setExperts,
    targetTopicId,
    setTargetTopicId,
    // 业务函数
    recordStudyAction,
    recordPracticeAction,
    handleTrackInteraction,
  };
}
