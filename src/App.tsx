// Refactored to use AppContext and extracted page components - 2026-03-29
import React, { useState, useEffect } from 'react';
import { AppView, ProfileContext, Topic, HistoryItem, Prescription, Expert, ExpertCase } from './types';
import { TOPICS, SCENARIO_DATA, PRESCRIPTION_DATA, EXPERTS, EXPERT_CASES } from './data';
import { generateManagementFeedback } from './services/ai-service';
import { backupUserData, checkCloudBackup, restoreFromBackup, shouldBackup, getLastBackupTime } from './services/backup';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SimulationEngine } from './components/SimulationEngine';
import { IntentionCapture } from './components/IntentionCapture';
import { DiagnoseEngine } from './components/DiagnoseEngine';
import { DiagnoseResultView } from './components/DiagnoseResultView';
import { DiagnosticResultView } from './components/DiagnosticResultView';
import { StudyDetailView } from './components/StudyDetailView';
import { ExpertLeaderboard } from './components/ExpertLeaderboard';
import { ExpertProfileView } from './components/ExpertProfileView';
import { HistoryView } from './components/HistoryView';
import ProfilePage from './pages/ProfilePage';
import PracticePage from './pages/PracticePage';
import DiagnoseStartPage from './pages/DiagnoseStartPage';
import { 
  ExpertProfileViewWrapper, 
  ExpertCaseDetailWrapper 
} from './components/wrappers';
import { motion } from 'motion/react';
import { Shield, ChevronRight, ArrowRight, Flame, Trophy, BookOpen, Sword } from 'lucide-react';

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
    targetTopicId,
    setTargetTopicId,
    pendingQuery,
    setPendingQuery,
    selectedTopic,
    setSelectedTopic,
    diagnosticContext,
    setDiagnosticContext,
    aiFeedback,
    setAiFeedback,
    activePrescription,
    setActivePrescription,
    activeHistoryId,
    setActiveHistoryId,
    isGeneratingFeedback,
    setIsGeneratingFeedback,
    selectedScenario,
    setSelectedScenario,
    handleTrackInteraction,
  } = app;

  // 本地 UI 状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackupRestored, setIsBackupRestored] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 自动备份逻辑：页面关闭前触发备份
  useEffect(() => {
    const handleBeforeUnload = () => {
      backupUserData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 自动备份逻辑：每天首次打开检查云端备份并恢复
  useEffect(() => {
    const restoreBackup = async () => {
      if (!isLoggedIn || isBackupRestored) return;

      try {
        const lastBackupTime = getLastBackupTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const shouldCheckCloud = !lastBackupTime || (Date.now() - lastBackupTime > oneDayMs);

        if (shouldCheckCloud) {
          console.log('[Backup] Checking cloud backup...');
          const cloudBackup = await checkCloudBackup();
          
          if (cloudBackup) {
            const localTimestamp = lastBackupTime || 0;
            const cloudTimestamp = cloudBackup.timestamp;

            if (cloudTimestamp > localTimestamp) {
              console.log('[Backup] Restoring from cloud backup...');
              restoreFromBackup(cloudBackup);
              window.location.reload();
              return;
            }
          }
        }

        if (shouldBackup()) {
          backupUserData();
        }
      } catch (error) {
        console.error('[Backup] Restore check failed:', error);
      }

      setIsBackupRestored(true);
    };

    restoreBackup();
  }, [isLoggedIn, isBackupRestored]);

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

  const handleSearch = (query: string, customDiagnosticContext?: any) => {
    setActivePrescription(null);
    setPendingQuery(query);

    const topic: Topic = selectedTopic || { 
      id: 'custom', 
      title: query, 
      type: '战友最痛' 
    };
    setSelectedTopic(topic);
    navigate(`/topic/${topic.id}`);

    if (customDiagnosticContext) {
      setDiagnosticContext(customDiagnosticContext);
      
      setIsGeneratingFeedback(true);
      generateManagementFeedback(query, customDiagnosticContext.teamContext, customDiagnosticContext, [])
        .then(feedback => {
          const newPrescription: Prescription = {
            truth: feedback,
            script: { opening: '“关于您的追问...”', responses: ['正在思考...'], closing: '“希望这能帮到您。”' },
            redLines: []
          };
          setActivePrescription(newPrescription);
          
          if (activeHistoryId) {
            const newUserMsg = { id: Date.now().toString(), role: 'user' as const, content: query };
            const newAiMsg = { id: (Date.now() + 1).toString(), role: 'ai' as const, content: feedback };
            
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
    navigate(`/topic/${topic.id}`);
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

  const handleUpdateHistory = (chatHistory: any[]) => {
    if (!activeHistoryId) return;
    
    setHistory(prev => {
      const updated = prev.map(item => 
        item.id === activeHistoryId ? { ...item, chatHistory } : item
      );
      localStorage.setItem('management_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDiagnosisComplete = (diagnostic: any) => {
    setDiagnosticContext(diagnostic);
    setContext(diagnostic.teamContext);
    
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
    
    const savedHistory = JSON.parse(localStorage.getItem('management_history') || '[]');
    localStorage.setItem('management_history', JSON.stringify([historyItem, ...savedHistory]));
    
    navigate(`/topic/${topic.id}`);
    setView('diagnose-start');
    setTargetTopicId(null);
  };

  const handleExpertClick = (expert: Expert) => {
    checkAuthAndExecute(() => {
      setSelectedExpert(expert);
      setView('expert-profile');
    });
  };

  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

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
      navigate(`/expert/${eId}/case/${caseId}`);
    }
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

  // 子路由 Wrapper 组件
  const StudyDetailWrapper: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const topic = TOPICS.find(t => t.id === id) || (selectedTopic?.id === id ? selectedTopic : null);
    
    if (!topic) return <div className="flex items-center justify-center h-full text-slate-400">话题加载中...</div>;

    return (
      <StudyDetailView
        topic={topic}
        experts={EXPERTS}
        context={context}
        onNavigateToPractice={(tid) => {
          setTargetTopicId(tid);
          navigate('/practice');
        }}
        onNavigateToDiagnosis={(tid) => {
          setTargetTopicId(tid);
          const t = TOPICS.find(tp => tp.id === tid);
          if (t) setPendingQuery(t.title);
          navigate('/diagnose-engine');
        }}
      />
    );
  };

  const DiagnosticResultWrapper: React.FC = () => {
    const topic = selectedTopic || { id: 'diagnostic-result', title: pendingQuery || '深度诊断结果', type: '战友最痛' } as Topic;
    
    return (
      <DiagnosticResultView
        topic={topic}
        prescription={topic.id === 'diagnostic-result' ? {
          truth: `### 研判真相：${diagnosticContext?.intentStage}\n\n**核心风险：** ${diagnosticContext?.riskAssessment}\n\n**干预进度：** ${diagnosticContext?.interventionProgress}\n\n**补充细节：** ${diagnosticContext?.details || '无'}\n\n--- \n\n基于您的团队处于 **${context.businessStage}** 且压力指数为 **${context.pressure}**，AI 管理能力提升助手建议：\n\n1. **立即对齐利益**：针对${diagnosticContext?.riskAssessment}，需在24小时内开启非正式面谈。\n2. **情绪缓冲**：考虑到${diagnosticContext?.interventionProgress}，建议引入第三方中立视角。`,
          summary: '基于诊断结果生成个性化建议',
          script: { opening: '“我们来聊聊这件事...”', responses: ['正在思考...'], closing: '“希望这能帮到您。”' },
          redLines: ['避免情绪化决策', '避免单方面施压']
        } : topic.id === 'custom' ? {
          truth: aiFeedback.split('\n\n')[0] || '正在剖析真相...',
          summary: aiFeedback.split('\n\n')[1] || '生成建议中...',
          script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
          redLines: ['正在划定红线...']
        } : PRESCRIPTION_DATA[topic.id] || null}
        experts={EXPERTS}
        context={context}
        diagnosticContext={diagnosticContext}
        isGenerating={isGeneratingFeedback}
        chatHistory={history.find(h => h.id === activeHistoryId)?.chatHistory || []}
        onUpdateHistory={handleUpdateHistory}
      />
    );
  };

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
                            onStartDiagnose={() => navigate('/diagnose-start')}
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
                        selectedTopic.id === 'custom' || selectedTopic.id === 'diagnostic-result' ? (
                          <DiagnosticResultView
                            topic={selectedTopic}
                            prescription={selectedTopic.id === 'custom' ? {
                              truth: aiFeedback.split('\n\n')[0] || '正在剖析真相...',
                              summary: aiFeedback.split('\n\n')[1] || '生成建议中...',
                              script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
                              redLines: ['正在划定红线...']
                            } : null}
                            experts={EXPERTS}
                            context={context}
                            diagnosticContext={diagnosticContext}
                            isGenerating={isGeneratingFeedback}
                            chatHistory={history.find(h => h.id === activeHistoryId)?.chatHistory || []}
                            onUpdateHistory={handleUpdateHistory}
                          />
                        ) : (
                          <StudyDetailView
                            topic={selectedTopic}
                            experts={EXPERTS}
                            context={context}
                            onNavigateToPractice={(id) => {
                              setTargetTopicId(id);
                              navigate('/practice');
                            }}
                            onNavigateToDiagnosis={(id) => {
                              setTargetTopicId(id);
                              const t = TOPICS.find(topic => topic.id === id);
                              if (t) setPendingQuery(t.title);
                              navigate('/diagnose-engine');
                            }}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              } />

              <Route path="/topic/:id" element={<StudyDetailWrapper />} />
              <Route path="/diagnostic-result" element={<DiagnosticResultWrapper />} />
              
              <Route path="/expert/:expertId/case/:caseId" element={<ExpertCaseDetailWrapper />} />

              <Route path="/practice" element={<PracticePage />} />

              <Route path="/diagnose-start" element={<DiagnoseStartPage />} />

              <Route path="/diagnose-engine" element={
                <div className="max-w-3xl mx-auto py-10">
                  <DiagnoseEngine
                    mode="problem"
                    query={pendingQuery}
                    targetTopicId={targetTopicId || undefined}
                    initialContext={context}
                    onComplete={handleDiagnosisComplete}
                  />
                </div>
              } />

              <Route path="/diagnose-result" element={
                <DiagnoseResultView
                  query={pendingQuery}
                  answers={{}}
                  onBack={() => navigate('/diagnose-engine')}
                />
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
                    } else if (v === 'diagnose-start') {
                      navigate('/diagnose-start');
                    } else if (v === 'practice') {
                      navigate('/practice');
                    }
                  }}
                  onReloadChat={(ctx) => {
                    setContext(ctx);
                    navigate('/diagnose-start');
                  }}
                  onDeleteStudyRecord={(id) => setStudyRecords(prev => prev.filter(r => r.id !== id))}
                  onDeletePracticeRecord={(id) => setPracticeRecords(prev => prev.filter(r => r.id !== id))}
                  onDeleteChatRecord={(id) => {
                    setHistory(prev => {
                      const updated = prev.filter(h => h.id !== id);
                      localStorage.setItem('management_history', JSON.stringify(updated));
                      return updated;
                    });
                  }}
                  onClearStudyRecords={() => setStudyRecords([])}
                  onClearPracticeRecords={() => setPracticeRecords([])}
                  onClearChatRecords={() => {
                    setHistory([]);
                    localStorage.setItem('management_history', '[]');
                  }}
                />
              } />

              <Route path="/profile" element={<ProfilePage />} />

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

        {/* Global Bottom Input Bar */}
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

        {/* Footer */}
        {location.pathname !== '/diagnose-result' && (
          <footer className="py-8 text-center mt-auto">
            <p className="text-[10px] text-slate-400">
              及时、精准、有效解决管理痛点，助力每一位管理者提升管理能力
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
