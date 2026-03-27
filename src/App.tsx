// Refactored to use AppContext - 2026-03-27
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AppView, ProfileContext, Topic, HistoryItem, UserStats, Prescription, Expert, ExpertCase, DiagnosticContext, ChatMessage, StudyRecord, SimulationRecord } from './types';
import { TOPICS, SCENARIO_DATA, PRESCRIPTION_DATA, EXPERTS, EXPERT_CASES } from './data';
import { generateManagementFeedback } from './services/gemini';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SimulationEngine } from './components/SimulationEngine';
import { IntentionCapture } from './components/IntentionCapture';
import { DiagnoseConsent } from './components/DiagnoseConsent';
import { DiagnoseEngine } from './components/DiagnoseEngine';
import { TacticalBriefing } from './components/TacticalBriefing';
import { ExpertCaseDetail } from './components/ExpertCaseDetail';
import { ExpertLeaderboard } from './components/ExpertLeaderboard';
import { ExpertProfileView } from './components/ExpertProfileView';
import { HistoryView } from './components/HistoryView';
import {
  ExpertProfileViewWrapper,
  TacticalBriefingWrapper,
  ExpertCaseDetailWrapper
} from './components/wrappers';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, ArrowRight, Flame, Trophy, BookOpen, Activity, MessageSquare, X, Users, Target, ArrowUpDown } from 'lucide-react';

// 懒加载页面组件
const PracticePage = lazy(() => import('./pages/PracticePage'));

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从 AppContext 获取全局状态
  const app = useApp();
  const {
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
    recordStudyAction,
    recordPracticeAction,
    handleTrackInteraction,
  } = app;

  // 本地 UI 状态（不需要全局共享）
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [diagnosticContext, setDiagnosticContext] = useState<DiagnosticContext | null>(null);
  const [selectedCase, setSelectedCase] = useState<ExpertCase | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('全部');
  const [sortBy, setSortBy] = useState<'default' | 'practiceCount' | 'accuracyRate'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


  const checkAuthAndExecute = (action: () => void) => {
    if (!isLoggedIn) {
      alert('指挥官，请先对一对身份（登录）以解锁高级战术分析。');
      return;
    }
    action();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setView('home');
  };

  const handleSearch = (query: string, customDiagnosticContext?: DiagnosticContext | null) => {
    setActivePrescription(null);
    setPendingQuery(query);

    // Skip diagnosis, go straight to content
    const topic: Topic = selectedTopic || { 
      id: 'custom', 
      title: query, 
      type: '战友最痛' 
    };
    setSelectedTopic(topic);
    navigate(`/topic/${topic.id}`);

    if (customDiagnosticContext) {
      setDiagnosticContext(customDiagnosticContext);
      
      // Generate follow-up feedback in background
      setIsGeneratingFeedback(true);
      generateManagementFeedback(query, customDiagnosticContext.teamContext, customDiagnosticContext, [])
        .then(feedback => {
          const newPrescription: Prescription = {
            truth: feedback,
            script: { opening: '“关于您的追问...”', responses: ['正在思考...'], closing: '“希望这能帮到您。”' },
            redLines: []
          };
          setActivePrescription(newPrescription);
          
          // Update history with follow-up
          if (activeHistoryId) {
            const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
            const newAiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: feedback };
            
            setHistory(prev => {
              const updated = prev.map(item => 
                item.id === activeHistoryId 
                  ? { ...item, chatHistory: [...(item.chatHistory || []), newUserMsg, newAiMsg] }
                  : item
              );
              localStorage.setItem('management_history', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(error => {
          console.error('Follow-up error:', error);
        })
        .finally(() => {
          setIsGeneratingFeedback(false);
        });
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setActivePrescription(null);
    setSelectedTopic(topic);
    setPendingQuery(topic.title);
    
    // Skip diagnosis, go straight to content
    navigate(`/topic/${topic.id}`);
  };

  const handleReloadChat = (oldContext: ProfileContext) => {
    setContext(oldContext);
    setView('diagnose-start');
  };

  const handleHistoryNavigate = (targetView: AppView, item: HistoryItem) => {
    setContext(item.context);
    setActiveHistoryId(item.id);
    if (item.diagnosticContext) {
      setDiagnosticContext(item.diagnosticContext);
    }
    if (item.topicId) {
      const topic = TOPICS.find(t => t.id === item.topicId);
      if (topic) setSelectedTopic(topic);
    } else {
      setSelectedTopic({ id: 'custom', title: item.query, type: '战友最痛' });
      setAiFeedback(item.aiResponse);
    }
    setActivePrescription(item.prescription || null);
    setView(targetView);
  };

  const handleUpdateHistory = (chatHistory: ChatMessage[]) => {
    if (!activeHistoryId) return;
    
    setHistory(prev => {
      const updated = prev.map(item => 
        item.id === activeHistoryId ? { ...item, chatHistory } : item
      );
      // Persist to localStorage
      localStorage.setItem('management_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDiagnosisComplete = (diagnostic: any) => {
    setDiagnosticContext(diagnostic);
    setContext(diagnostic.teamContext);
    
    // Create a custom topic for the diagnostic result
    const topic: Topic = selectedTopic || { 
      id: 'diagnostic-result', 
      title: `针对【${pendingQuery}】的研判报告`, 
      type: '战友最痛' 
    };
    setSelectedTopic(topic);
    
    const prescription: Prescription = {
      truth: `### 研判真相：${pendingQuery}\n\n**研判维度：** ${diagnostic.questionSet === 'talent' ? '人才保留' : diagnostic.questionSet === 'execution' ? '执行力穿透' : '基础组织画像'}\n\n**核心发现：** ${Object.values(diagnostic).filter(v => typeof v === 'string' && v.length > 0).join(' | ')}\n\n--- \n\n基于您的团队画像，AI 管理能力提升助手建议：\n\n1. **精准打击**：针对研判出的核心问题，立即启动专项对齐。\n2. **工具赋能**：引入匹配当前阶段的管理工具。`,
      summary: `当前团队核心骨干流失风险已达临界点，主要源于业务快速扩张期压力传导失衡，以及管理者对核心人才情绪价值与成长路径规划的长期忽视。建议指挥官立即开启非业务导向的一对一深度面谈，剥离KPI考核，纯粹探寻其个人职业发展诉求与当前核心痛点，切忌单纯依靠物质承诺进行防御性挽留。通过此次精准的心理干预与资源倾斜，预期能有效缓解骨干成员的职业倦怠感，重建团队信任纽带，将核心人才流失风险降低至安全水位，从而确保组织在高速行军中的核心战斗力与业务连续性。`,
      script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
      redLines: ['正在划定红线...']
    };
    setActivePrescription(prescription);

    // Auto-archive
    const newHistoryId = Date.now().toString();
    setActiveHistoryId(newHistoryId);
    const historyItem: HistoryItem = {
      id: newHistoryId,
      query: `针对【${pendingQuery}】的研判报告`,
      aiResponse: '研判报告已生成',
      timestamp: Date.now(),
      context: { ...diagnostic.teamContext },
      isDeepDiagnosis: true,
      diagnosticContext: diagnostic,
      prescription
    };
    setHistory(prev => [historyItem, ...prev]);
    
    // Persist to localStorage
    const savedHistory = JSON.parse(localStorage.getItem('management_history') || '[]');
    localStorage.setItem('management_history', JSON.stringify([historyItem, ...savedHistory]));
    
    navigate(`/topic/${topic.id}`);
    setView('diagnose-start'); // 保持聊一聊模块高亮
    setTargetTopicId(null);
  };

  const handleExpertClick = (expert: Expert) => {
    checkAuthAndExecute(() => {
      setSelectedExpert(expert);
      setView('expert-profile');
    });
  };

  const handleBookConsultant = (expertId: string) => {
    if (userStats.points < 300) {
      alert('战术积分不足，请通过实战推演获取积分。');
      return;
    }
    
    setUserStats(prev => ({
      ...prev,
      points: prev.points - 300
    }));
    
    alert('预约申请已提交！专家将在24小时内联系您。');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('home');
    setSelectedTopic(null);
    setTargetTopicId(null);
    setHistory([]);
    setAiFeedback('');
    setShowProfilePopup(false);
    setIsBriefingMode(false);
  };

  const handleSetView = (newView: AppView) => {
    if (newView !== 'home' && !isLoggedIn) {
      alert('指挥官，请先对一对身份（登录）以解锁该模块。');
      return;
    }
    setView(newView);
    
    const viewToPath: Record<string, string> = {
      'home': '/',
      'practice': '/practice',
      'diagnose-start': '/diagnose-start',
      'diagnose-engine': '/diagnose-engine',
      'history': '/history',
      'expert-profile': '/expert-profile',
      'topic-detail': selectedTopic ? `/topic/${selectedTopic.id}` : '/',
    };

    if (viewToPath[newView]) {
      navigate(viewToPath[newView]);
    }

    if (newView !== 'home') {
      setIsBriefingMode(false);
    }
    if (newView !== 'practice' && newView !== 'diagnose-engine') {
      setTargetTopicId(null);
    }
  };

  const handleViewCase = (caseId: string, expertId?: string) => {
    const expertCase = EXPERT_CASES[caseId];
    const eId = expertId || selectedExpert?.id;
    if (expertCase && eId) {
      setSelectedCase(expertCase);
      navigate(`/expert/${eId}/case/${caseId}`);
    }
  };

  const TacticalBriefingWrapper = () => {
    const { id } = useParams<{ id: string }>();
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
        onNavigateToPractice={(id) => {
          setTargetTopicId(id);
          navigate('/practice');
        }}
        onNavigateToDiagnosis={(id) => {
          setTargetTopicId(id);
          const topic = TOPICS.find(t => t.id === id);
          if (topic) setPendingQuery(topic.title);
          navigate('/diagnose-engine');
        }}
        onExpertClick={handleExpertClick}
        onFollowUp={(q) => handleSearch(q, diagnosticContext)}
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

  const ExpertCaseDetailWrapper = () => {
    const { expertId, caseId } = useParams<{ expertId: string; caseId: string }>();
    const location = useLocation();
    const autoFocusMedia = location.state?.autoFocusMedia as any;
    const expertCase = EXPERT_CASES[caseId || ''];

    if (!expertCase) return <div className="flex items-center justify-center h-full text-slate-400">案例加载中...</div>;

    return (
      <ExpertCaseDetail 
        expertCase={expertCase} 
        onClose={() => navigate(`/expert/${expertId}`)} 
        autoFocusMedia={autoFocusMedia}
        onTrackInteraction={(type) => handleTrackInteraction(expertCase.id, type)}
        initialIsBookmarked={userStats.bookmarks?.includes(expertCase.id)}
        initialIsLiked={userStats.likes?.includes(expertCase.id)}
      />
    );
  };

  interface PracticeRouteProps {
    selectedScenario: any;
    setSelectedScenario: (scenario: any) => void;
    targetTopicId: string | null;
    setTargetTopicId: (id: string | null) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sortBy: 'default' | 'practiceCount' | 'accuracyRate';
    setSortBy: (sort: 'default' | 'practiceCount' | 'accuracyRate') => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
  }

  const PracticeRoute: React.FC<PracticeRouteProps> = ({
    selectedScenario,
    setSelectedScenario,
    targetTopicId,
    setTargetTopicId,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // 自动跳转逻辑
    useEffect(() => {
      if (targetTopicId && !selectedScenario) {
        const scenarioMap: Record<string, string> = {
          '1': '1', '3': 't2', '6': 't1', '7': 't3',
        };
        const scenarioId = scenarioMap[targetTopicId];
        if (scenarioId && SCENARIO_DATA[scenarioId]) {
          setSelectedScenario(SCENARIO_DATA[scenarioId]);
          setTargetTopicId(null);
        }
      }
    }, [targetTopicId, selectedScenario, setSelectedScenario, setTargetTopicId]);

    if (selectedScenario) {
      return <SimulationEngine scenario={selectedScenario} onExit={() => setSelectedScenario(null)} />;
    }

    const getCategory = (description: string) => {
      if (description.includes('离职') || description.includes('留存')) return '人才留存';
      if (description.includes('绩效') || description.includes('目标')) return '绩效管理';
      if (description.includes('跨部门') || description.includes('协同')) return '跨部门沟通';
      if (description.includes('冲突')) return '团队管理';
      if (description.includes('沟通') || description.includes('汇报')) return '沟通管理';
      if (description.includes('95后') || description.includes('新生代')) return '新生代管理';
      return '常规管理';
    };

    const getSortedScenarios = () => {
      let scenarios = Object.values(SCENARIO_DATA)
        .filter(scenario => {
          // 搜索过滤
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return scenario.description.toLowerCase().includes(query) ||
                   getCategory(scenario.description).toLowerCase().includes(query);
          }
          // 标签过滤
          if (activeTab === '全部') return true;
          if (activeTab === '人才留存') return scenario.description.includes('离职') || scenario.description.includes('留存');
          if (activeTab === '绩效管理') return scenario.description.includes('绩效') || scenario.description.includes('目标');
          if (activeTab === '跨部门沟通') return scenario.description.includes('跨部门') || scenario.description.includes('协同');
          return true;
        });
      
      if (sortBy === 'default') return scenarios;
      
      return scenarios.sort((a, b) => {
        const aValue = sortBy === 'practiceCount' ? (a.practiceCount || 0) : (a.accuracyRate || 0);
        const bValue = sortBy === 'practiceCount' ? (b.practiceCount || 0) : (b.accuracyRate || 0);
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    };

    const handleSort = (type: 'practiceCount' | 'accuracyRate') => {
      if (sortBy === type) {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
      } else {
        setSortBy(type);
        setSortOrder('desc');
      }
    };

    const tabs = ['全部', '人才留存', '绩效管理', '跨部门沟通'];

    return (
      <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-slate-900">实战演练</h2>
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索题目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/20 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-full transition-all ${
                  activeTab === tab
                    ? 'bg-[#F2C94C] text-white font-medium shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mb-2">
          <span className="text-xs text-slate-400">排序：</span>
          <button
            onClick={() => handleSort('practiceCount')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
              sortBy === 'practiceCount'
                ? 'bg-[#F2C94C]/20 text-[#F2C94C] font-medium'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            练习人数
            {sortBy === 'practiceCount' && (
              sortOrder === 'desc' ? '↓' : '↑'
            )}
          </button>
          <button
            onClick={() => handleSort('accuracyRate')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
              sortBy === 'accuracyRate'
                ? 'bg-[#F2C94C]/20 text-[#F2C94C] font-medium'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3 h-3" />
            正确率
            {sortBy === 'accuracyRate' && (
              sortOrder === 'desc' ? '↓' : '↑'
            )}
          </button>
          {sortBy !== 'default' && (
            <button
              onClick={() => setSortBy('default')}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              重置
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {getSortedScenarios().map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:border-[#F2C94C]/50 hover:shadow-md hover:scale-[1.02] transition-all shadow-none"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    getCategory(scenario.description) === '人才留存' ? 'bg-red-50 text-red-600' :
                    getCategory(scenario.description) === '绩效管理' ? 'bg-blue-50 text-blue-600' :
                    getCategory(scenario.description) === '跨部门沟通' ? 'bg-green-50 text-green-600' :
                    getCategory(scenario.description) === '团队管理' ? 'bg-purple-50 text-purple-600' :
                    getCategory(scenario.description) === '沟通管理' ? 'bg-orange-50 text-orange-600' :
                    getCategory(scenario.description) === '新生代管理' ? 'bg-pink-50 text-pink-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {getCategory(scenario.description)}
                  </span>
                </div>
                <h4 className="text-slate-900 text-base font-normal mb-3">
                  {scenario.description.split('】')[0].replace('【', '') || scenario.description}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{scenario.practiceCount?.toLocaleString() || 0}人已练</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Target className="w-3.5 h-3.5" />
                    <span>正确率 {scenario.accuracyRate || 0}%</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedScenario(scenario)}
                className="px-6 py-2 bg-[#F2C94C] text-white font-medium rounded-full text-sm hover:bg-[#E5B73B] transition-all shadow-sm cursor-pointer"
              >
                开始演练
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEmergencyBulletin = () => {
    if (context.pressure <= 8) return null;
    return (
      <div className="flex justify-center mb-8 animate-[slideUp_0.5s_ease-out]">
        <div className="bg-red-500/10 border border-red-500/50 px-6 py-2.5 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <span className="text-xs font-black text-red-500 uppercase tracking-widest">
            紧急军事通报：监测到高压爆仓风险，建议立即阅研《扩张期人才防御建议》
          </span>
          <ArrowRight className="w-4 h-4 text-red-500" />
        </div>
      </div>
    );
  };

  const renderLogin = () => (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F2C94C] rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">对一对身份</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="text" 
            placeholder="管理 ID"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-[#F2C94C] outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="通行密钥"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-[#F2C94C] outline-none"
            required
          />
          <button type="submit" className="w-full bg-[#F2C94C] text-white font-bold py-4 rounded-xl hover:bg-[#F2C94C]/90 transition-all shadow-lg shadow-[#F2C94C]/20">准许进入</button>
        </form>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return renderLogin();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#1A1C1E] font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar 
        activeView={view} 
        onNavigate={handleSetView} 
        context={context} 
        userStats={userStats}
        showProfilePopup={showProfilePopup} 
        setShowProfilePopup={setShowProfilePopup}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        setIsBriefingMode={setIsBriefingMode}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden" id="main-scroll-container">
        <Header 
          view={view} 
          setView={handleSetView} 
          selectedTopic={selectedTopic} 
          setSelectedTopic={setSelectedTopic}
          context={context}
          toggleSidebar={() => {
            if (window.innerWidth >= 768) {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            } else {
              setIsSidebarOpen(!isSidebarOpen);
            }
          }}
        />

        <div className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={
                <div className="min-h-[calc(100vh-120px)] flex flex-col">
                  {!isBriefingMode ? (
                    <div className="flex flex-col flex-1">
                      {/* Hero Section - Centered Input */}
                      <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-12">
                        <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
                          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                            输入你的管理痛点<br/>AI将为您自动匹配资深管理者的实战经验
                          </h2>
                          {renderEmergencyBulletin()}
                        </div>

                        <div className="w-full max-w-3xl mx-auto px-4 animate-[slideUp_0.6s_ease-out]">
                          <IntentionCapture 
                            mode="new-search"
                            onSearch={handleSearch} 
                            onStartDiagnose={() => navigate('/diagnose-engine')}
                          />
                        </div>
                      </div>

                      {/* Content Grid - Below Input */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 animate-[fadeIn_1s_ease-out]">
                        {/* 1. 个人高频痛点 TOP 10 */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 flex flex-col overflow-hidden group hover:border-[#F2C94C]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                          <div className="p-6 border-b border-black/5 flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-[#F2C94C]" />
                            <h3 className="text-sm font-black text-[#0A0F1D]/80 uppercase tracking-[0.2em]">个人高频痛点 TOP 10</h3>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {TOPICS.filter(t => t.isTop10).slice(0, 10).map((topic, idx) => (
                              <button key={topic.id} onClick={() => handleTopicClick(topic)} className="w-full text-left p-4 hover:bg-white/80 rounded-2xl flex items-center gap-6 group transition-all duration-300">
                                <span className="text-sm font-black text-[#F2C94C]/60 group-hover:text-[#F2C94C] group-hover:scale-110 transition-all duration-300">
                                  {(idx + 1).toString().padStart(2, '0')}
                                </span>
                                <span className="flex-1 text-sm font-bold text-gray-600 group-hover:text-[#0A0F1D]">{topic.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. 公司热点话题 TOP 10 (中间位置) */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 flex flex-col overflow-hidden group hover:border-[#F2C94C]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                          <div className="p-6 border-b border-black/5 flex items-center gap-3">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                            <h3 className="text-sm font-black text-[#0A0F1D]/80 uppercase tracking-[0.2em]">公司热点话题 TOP 10</h3>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {TOPICS.filter(t => t.isHot).slice(0, 10).map((topic, idx) => (
                              <button key={topic.id} onClick={() => handleTopicClick(topic)} className="w-full text-left p-4 hover:bg-white/80 rounded-2xl flex items-center gap-6 group transition-all duration-300">
                                <span className="text-sm font-black text-orange-500/60 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300">
                                  {(idx + 1).toString().padStart(2, '0')}
                                </span>
                                <span className="flex-1 text-sm font-bold text-gray-600 group-hover:text-[#0A0F1D]">{topic.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <ExpertLeaderboard experts={experts} onExpertClick={handleExpertClick} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <button onClick={() => setIsBriefingMode(false)} className="flex items-center text-sm font-bold text-[#0A0F1D] hover:text-[#F2C94C] transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> 返回搜索
                      </button>
                      {selectedTopic && (
                        <TacticalBriefing 
                          topic={selectedTopic}
                          prescription={selectedTopic.id === 'custom' ? {
                            truth: aiFeedback.split('\n\n')[0] || '正在剖析真相...',
                            script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
                            redLines: ['正在划定红线...']
                          } : PRESCRIPTION_DATA[selectedTopic.id] || null}
                          experts={EXPERTS}
                          context={context}
                          onNavigateToTopic={handleTopicClick}
                          onNavigateToPractice={(id) => {
                            setTargetTopicId(id);
                            navigate('/practice');
                          }}
                          onNavigateToDiagnosis={(id) => {
                            setTargetTopicId(id);
                            const topic = TOPICS.find(t => t.id === id);
                            if (topic) setPendingQuery(topic.title);
                            navigate('/diagnose-engine');
                          }}
                          onExpertClick={handleExpertClick}
                          isGeneratingFeedback={isGeneratingFeedback}
                        />
                      )}
                    </div>
                  )}
                </div>
              } />

              <Route path="/topic/:id" element={<TacticalBriefingWrapper />} />
              
              <Route path="/expert/:expertId/case/:caseId" element={<ExpertCaseDetailWrapper />} />

              <Route path="/practice" element={
                <PracticeRoute
                  selectedScenario={selectedScenario}
                  setSelectedScenario={setSelectedScenario}
                  targetTopicId={targetTopicId}
                  setTargetTopicId={setTargetTopicId}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />
              } />

              <Route path="/diagnose-start" element={
                <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen">
                  {/* 顶部 - 输入区 */}
                  <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-full max-w-3xl space-y-10">
                      {/* 标题区 */}
                      <div className="text-center space-y-5">
                        <h1 className="text-4xl md:text-5xl font-black text-[#0A0F1D] tracking-tight">
                          深度诊断您的<span className="text-[#F2C94C]">管理困境</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                          AI 管理参谋为您起底问题本质，提供定制化决策路径
                        </p>
                      </div>

                      {/* 搜索输入区 */}
                      <div className="space-y-4">
                        <div className="relative group">
                          <textarea
                            placeholder="描述一个让你头疼的管理场景，或说出现在的团队状态..."
                            rows={3}
                            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 text-base focus:outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/10 resize-none transition-all shadow-sm"
                            onChange={(e) => setPendingQuery(e.target.value)}
                          />
                          <div className="absolute bottom-4 right-4 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => navigate('/diagnose-engine')}
                          className="w-full py-4 bg-[#F2C94C] hover:bg-[#E5B73B] text-white font-black text-lg rounded-xl shadow-lg shadow-[#F2C94C]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <Activity className="w-5 h-5" />
                          点击开启深度诊断
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 中部 - 高频现象自测区 */}
                  <div className="px-6 pb-8">
                    <div className="max-w-5xl mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-[#F2C94C] rounded-full"></div>
                        <h3 className="text-lg font-bold text-slate-800">高频现象自测区</h3>
                        <span className="text-xs text-slate-400">选择与您最贴近的症状，快速进入诊断</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            id: 'bottleneck',
                            title: '管理瓶颈诊断',
                            desc: '团队推一下动一下，不推就不动，缺乏自驱力',
                            icon: '🔍',
                            bgColor: 'bg-amber-50'
                          },
                          {
                            id: 'turnover',
                            title: '人才流失预警',
                            desc: '核心干劲突然沉寂，疑似有离职倾向，该如何提前切入？',
                            icon: '⚠️',
                            bgColor: 'bg-red-50'
                          },
                          {
                            id: 'collaboration',
                            title: '跨部门破冰',
                            desc: '资源调不动，协作像撞墙，如何打破利益围栏？',
                            icon: '🌉',
                            bgColor: 'bg-blue-50'
                          }
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => {
                              setPendingQuery(item.desc);
                              navigate('/diagnose-engine');
                            }}
                            className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#F2C94C] hover:shadow-lg hover:shadow-[#F2C94C]/5 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <span className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center text-xl`}>{item.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-2 group-hover:text-[#F2C94C] transition-colors">{item.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 group-hover:text-[#F2C94C] transition-colors">
                              <span>立即诊断</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 底部 - 历史诊断档案 */}
                  <div className="px-6 pb-12">
                    <div className="max-w-5xl mx-auto">
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-[#F2C94C] rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-800">历史诊断档案</h3>
                          </div>
                          <button
                            onClick={() => navigate('/history')}
                            className="text-xs text-[#F2C94C] hover:text-[#E5B73B] transition-colors flex items-center gap-1"
                          >
                            查看全部
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {history.slice(0, 4).length > 0 ? (
                            history.slice(0, 4).map((item, i) => (
                              <div
                                key={i}
                                onClick={() => navigate('/history')}
                                className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all cursor-pointer group"
                              >
                                <div className="text-xs text-slate-400 mb-1">{new Date(item.timestamp).toLocaleDateString()}</div>
                                <div className="text-sm text-slate-700 line-clamp-2 group-hover:text-[#F2C94C] transition-colors">
                                  {item.query}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${item.isDeepDiagnosis ? 'bg-[#F2C94C]' : 'bg-slate-400'}`}></span>
                                  <span className="text-xs text-slate-500">{item.isDeepDiagnosis ? '深度诊断' : '快速咨询'}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <div className="text-xs text-slate-500">暂无历史诊断</div>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                                    <span className="text-xs">🎯</span>
                                  </div>
                                  <span className="text-xs text-slate-400">示例诊断</span>
                                </div>
                                <div className="text-sm text-slate-600">团队执行力持续下滑...</div>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                                    <span className="text-xs">⚡</span>
                                  </div>
                                  <span className="text-xs text-slate-400">示例诊断</span>
                                </div>
                                <div className="text-sm text-slate-600">跨部门项目推进受阻...</div>
                              </div>
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                                    <span className="text-xs">🔥</span>
                                  </div>
                                  <span className="text-xs text-slate-400">示例诊断</span>
                                </div>
                                <div className="text-sm text-slate-600">核心骨干提出离职...</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } />

              <Route path="/diagnose-engine" element={
                <div className="max-w-4xl mx-auto py-10">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-[#0A0F1D] mb-4">深度管理研判：多维透视</h2>
                    <p className="text-gray-500">针对复杂管理场景，我们需要更精准的团队画像以提供实战建议</p>
                  </div>
                  <DiagnoseEngine 
                    mode="problem"
                    query={pendingQuery}
                    targetTopicId={targetTopicId || undefined}
                    initialContext={context}
                    onComplete={handleDiagnosisComplete} 
                  />
                </div>
              } />

              <Route path="/history" element={
                <HistoryView
                  history={history}
                  studyRecords={studyRecords}
                  practiceRecords={practiceRecords}
                  onNavigate={(v, item) => {
                    handleHistoryNavigate(v, item);
                    if (v === 'topic-detail' && item.topicId) {
                      navigate(`/topic/${item.topicId}`);
                    } else if (v === 'topic-detail') {
                      navigate(`/topic/custom`);
                    } else if (v === 'practice' && item.scenarioId) {
                      const scenario = Object.values(SCENARIO_DATA).find(s => s.id === item.scenarioId);
                      if (scenario) {
                        setSelectedScenario(scenario);
                        navigate('/practice');
                      }
                    } else if (v === 'home') {
                      navigate('/');
                    }
                  }}
                  bookmarks={Object.values(EXPERT_CASES).filter(c => userStats.bookmarks?.includes(c.id))}
                  onReloadChat={(ctx) => {
                    setContext(ctx);
                    navigate('/diagnose-start');
                  }}
                />
              } />

              <Route path="/expert-profile" element={
                selectedExpert && (
                  <ExpertProfileView 
                    expert={selectedExpert} 
                    onBack={() => navigate('/')} 
                    onBook={() => handleBookConsultant(selectedExpert.id)}
                    onViewCase={handleViewCase}
                  />
                )
              } />

              <Route path="/expert/:expertId" element={
                <ExpertProfileViewWrapper 
                  experts={experts}
                  onBook={handleBookConsultant}
                  onViewCase={handleViewCase}
                />
              } />
            </Routes>
          </div>
        </div>

        {/* Global Bottom Input Bar - Hidden in Home View now as it's centered */}
        {isBriefingMode && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 p-2 shadow-2xl">
                <IntentionCapture 
                  mode="new-search"
                  onSearch={handleSearch} 
                  onStartDiagnose={() => navigate('/diagnose-engine')}
                />
              </div>
            </div>
          </div>
        )}

        {/* 页脚 - 自然流式布局，随内容滚动 */}
        <footer className="py-8 text-center mt-auto">
          <p className="text-[10px] text-slate-400">
            及时、精准、有效解决管理痛点，助力每一位管理者提升管理能力
          </p>
        </footer>
      </main>
    </div>
  );
}
