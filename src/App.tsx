import React, { useState, useEffect } from 'react';
import { AppView, ProfileContext, Topic, HistoryItem, UserStats, Prescription, Expert, ExpertCase, DiagnosticContext, ChatMessage } from './types';
import { TOPICS, SCENARIO_DATA, PRESCRIPTION_DATA, EXPERTS, EXPERT_CASES } from './data';
import { generateManagementFeedback } from './services/gemini';
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
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, ArrowRight, Flame, Trophy, BookOpen, Activity, MessageSquare } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState<AppView>('home');
  const [pendingQuery, setPendingQuery] = useState('');
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

  useEffect(() => {
    localStorage.setItem('saodiseng_context', JSON.stringify(context));
  }, [context]);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [diagnosticContext, setDiagnosticContext] = useState<DiagnosticContext | null>(null);
  const [selectedCase, setSelectedCase] = useState<ExpertCase | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isBriefingMode, setIsBriefingMode] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('全部'); 
  const [userStats, setUserStats] = useState<UserStats>({
    points: 1200,
    medals: ['初出茅庐', '战地观察员'],
    experience: '3-5年',
    scale: '5-15人',
    domain: '研发'
  });

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
    setView('topic-detail');

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
    setView('topic-detail');
  };

  const handleReloadChat = (oldContext: ProfileContext) => {
    setContext(oldContext);
    setView('chat');
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

  const handleDiagnoseComplete = (newContext: ProfileContext, stats?: Partial<UserStats>) => {
    setContext(newContext);
    if (stats) {
      setUserStats(prev => ({ ...prev, ...stats }));
    }
    setView('home');
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
    if (newView !== 'home') {
      setIsBriefingMode(false);
    }
    if (newView !== 'practice' && newView !== 'diagnose-engine') {
      setTargetTopicId(null);
    }
  };

  const handleViewCase = (caseId: string) => {
    const expertCase = EXPERT_CASES[caseId];
    if (expertCase) {
      setSelectedCase(expertCase);
      setView('case-detail');
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
        view={view} 
        setView={handleSetView} 
        context={context} 
        userStats={userStats}
        showProfilePopup={showProfilePopup} 
        setShowProfilePopup={setShowProfilePopup}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
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
            
            {view === 'home' && (
              <div className="min-h-[calc(100vh-120px)] flex flex-col">
                {!isBriefingMode ? (
                  <div className="flex flex-col flex-1">
                    
                    {/* Hero Section - Centered Input */}
                    <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-12">
                      <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                          输入你的管理痛点，AI将为您自动匹配资深管理者的实战经验
                        </h2>
                        {renderEmergencyBulletin()}
                      </div>

                      <div className="w-full max-w-3xl mx-auto px-4 animate-[slideUp_0.6s_ease-out]">
                        <IntentionCapture 
                          mode="new-search"
                          onSearch={handleSearch} 
                          onStartDiagnose={() => setView('diagnose-engine')}
                        />
                      </div>
                    </div>

                    {/* Content Grid - Below Input */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 animate-[fadeIn_1s_ease-out]">
                      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 flex flex-col overflow-hidden group hover:border-[#F2C94C]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                        <div className="p-6 border-b border-black/5 flex items-center gap-3">
                          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                          <h3 className="text-sm font-black text-[#0A0F1D]/80 uppercase tracking-[0.2em]">公司热点话题 TOP 10</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                          {TOPICS.filter(t => t.isHot).map(topic => (
                            <button key={topic.id} onClick={() => handleTopicClick(topic)} className="w-full text-left p-5 hover:bg-white/80 rounded-2xl flex items-center justify-between group transition-all duration-300">
                              <span className="text-sm font-bold text-gray-600 group-hover:text-[#0A0F1D]">{topic.title}</span>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F2C94C] group-hover:translate-x-1" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/80 flex flex-col overflow-hidden group hover:border-[#F2C94C]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
                        <div className="p-6 border-b border-black/5 flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-[#F2C94C]" />
                          <h3 className="text-sm font-black text-[#0A0F1D]/80 uppercase tracking-[0.2em]">个人高频痛点 TOP 10</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                          {TOPICS.filter(t => t.isTop10).map((topic, idx) => (
                            <button key={topic.id} onClick={() => handleTopicClick(topic)} className="w-full text-left p-4 hover:bg-white/80 rounded-2xl flex items-center gap-6 group transition-all duration-300">
                              <span className="text-sm font-black text-[#F2C94C]/60 group-hover:text-[#F2C94C] group-hover:scale-110 transition-all duration-300">
                                {(idx + 1).toString().padStart(2, '0')}
                              </span>
                              <span className="flex-1 text-sm font-bold text-gray-600 group-hover:text-[#0A0F1D]">{topic.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <ExpertLeaderboard experts={EXPERTS} onExpertClick={handleExpertClick} />
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
                          setView('practice');
                        }}
                        onNavigateToDiagnosis={(id) => {
                          setTargetTopicId(id);
                          const topic = TOPICS.find(t => t.id === id);
                          if (topic) setPendingQuery(topic.title);
                          setView('diagnose-engine');
                        }}
                        onExpertClick={handleExpertClick}
                        isGeneratingFeedback={isGeneratingFeedback}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'topic-detail' && selectedTopic && (
              <TacticalBriefing 
                topic={selectedTopic} 
                prescription={activePrescription || (selectedTopic.id === 'diagnostic-result' ? {
                  truth: `### 研判真相：${diagnosticContext?.intentStage}\n\n**核心风险：** ${diagnosticContext?.riskAssessment}\n\n**干预进度：** ${diagnosticContext?.interventionProgress}\n\n**补充细节：** ${diagnosticContext?.details || '无'}\n\n--- \n\n基于您的团队处于 **${context.businessStage}** 且压力指数为 **${context.pressure}**，AI 管理能力提升助手建议：\n\n1. **立即对齐利益**：针对${diagnosticContext?.riskAssessment}，需在24小时内开启非正式面谈。\n2. **情绪缓冲**：考虑到${diagnosticContext?.interventionProgress}，建议引入第三方中立视角。`,
                  script: { opening: '“我们来聊聊这件事...”', responses: ['正在思考...'], closing: '“希望这能帮到您。”' },
                  redLines: []
                } : selectedTopic.id === 'custom' ? {
                  truth: aiFeedback.split('\n\n')[0] || '正在剖析真相...',
                  script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
                  redLines: ['正在划定红线...']
                } : PRESCRIPTION_DATA[selectedTopic.id] || null)} 
                experts={EXPERTS}
                context={context}
                diagnosticContext={diagnosticContext}
                onNavigateToTopic={handleTopicClick}
                onNavigateToPractice={(id) => {
                  setTargetTopicId(id);
                  setView('practice');
                }}
                onNavigateToDiagnosis={(id) => {
                  setTargetTopicId(id);
                  const topic = TOPICS.find(t => t.id === id);
                  if (topic) setPendingQuery(topic.title);
                  setView('diagnose-engine');
                }}
                onExpertClick={handleExpertClick}
                onFollowUp={(q) => handleSearch(q, diagnosticContext)}
                isGeneratingFeedback={isGeneratingFeedback}
                onUpdateHistory={handleUpdateHistory}
                initialChatHistory={history.find(h => h.id === activeHistoryId)?.chatHistory || []}
                relatedTopics={
                  selectedTopic.relatedIds 
                    ? TOPICS.filter(t => selectedTopic.relatedIds?.includes(t.id))
                    : TOPICS.filter(t => t.id !== selectedTopic.id).slice(0, 3)
                }
              />
            )}

                    {view === 'practice' && !selectedScenario && (
                      <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                        {(() => {
                          // Auto-load scenario if targetTopicId is present
                          if (targetTopicId && !selectedScenario) {
                            const scenarioMap: Record<string, string> = {
                              '1': '1',
                              '3': 't2',
                              '6': 't1',
                              '7': 't3',
                            };
                            const scenarioId = scenarioMap[targetTopicId];
                            if (scenarioId && SCENARIO_DATA[scenarioId]) {
                              setTimeout(() => setSelectedScenario(SCENARIO_DATA[scenarioId]), 0);
                              return null;
                            }
                          }
                          return (
                            <>
                              <div className="flex flex-col gap-6">
                                <h2 className="text-2xl font-medium text-slate-900">实战演练</h2>
                                <div className="flex gap-6 border-b border-slate-100 pb-4">
                                  {['全部', '人才留存', '绩效管理', '跨部门沟通'].map(tab => (
                                    <button 
                                      key={tab}
                                      onClick={() => setActiveTab(tab)}
                                      className={`text-sm transition-all ${activeTab === tab ? 'text-slate-900 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                {Object.values(SCENARIO_DATA)
                                  .filter(scenario => {
                                    if (activeTab === '全部') return true;
                                    if (activeTab === '人才留存') return scenario.description.includes('离职') || scenario.description.includes('留存');
                                    if (activeTab === '绩效管理') return scenario.description.includes('绩效') || scenario.description.includes('目标');
                                    if (activeTab === '跨部门沟通') return scenario.description.includes('跨部门') || scenario.description.includes('协同');
                                    return true;
                                  })
                                  .slice(0, 3)
                                  .map((scenario) => (
                                  <div 
                                    key={scenario.id} 
                                    onClick={() => setSelectedScenario(scenario)}
                                    className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:border-slate-300 transition-all shadow-none"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md">
                                          {scenario.description.includes('离职') ? '人才留存' : scenario.description.includes('绩效') ? '绩效管理' : '常规管理'}
                                        </span>
                                      </div>
                                      <h4 className="text-slate-900 text-base font-normal">
                                        {scenario.description.split('】')[0].replace('【', '') || '常规管理任务'}
                                      </h4>
                                    </div>
                                    <div className="px-6 py-2 border border-slate-200 rounded-full text-slate-600 text-sm group-hover:bg-slate-50 transition-all">
                                      开始演练
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

            {view === 'practice' && selectedScenario && (
              <SimulationEngine scenario={selectedScenario} onExit={() => setSelectedScenario(null)} />
            )}

            {view === 'diagnose-consent' && (
              <DiagnoseConsent 
                pendingQuery={pendingQuery}
                onSelectStandard={() => {
                  // Skip diagnosis, go straight to detail
                  const topic: Topic = selectedTopic || { 
                    id: 'search-result', 
                    title: pendingQuery, 
                    type: '战友最痛' 
                  };
                  setSelectedTopic(topic);
                  setDiagnosticContext(null); // Clear previous context
                  
                  // Auto-archive
                  const newHistoryId = Date.now().toString();
                  setActiveHistoryId(newHistoryId);
                  setHistory(prev => [{
                    id: newHistoryId,
                    query: pendingQuery,
                    aiResponse: '常规诊断报告已生成',
                    timestamp: Date.now(),
                    context: { ...context },
                    topicId: topic.id === 'search-result' ? undefined : topic.id
                  }, ...prev]);
                  
                  setView('topic-detail');
                }}
                onSelectDeep={() => {
                  setView('diagnose-engine');
                }}
              />
            )}

            {view === 'diagnose-engine' && (
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
                  onComplete={(diagnostic) => {
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
                    
                    setView('topic-detail');
                    setTargetTopicId(null);
                  }} 
                />
              </div>
            )}

            {view === 'diagnose-start' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh]">
                <div className="max-w-4xl w-full space-y-16">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F2C94C]/10 border border-[#F2C94C]/30 rounded-full text-[#F2C94C] text-[10px] font-black uppercase tracking-widest">
                      <Activity className="w-3 h-3" /> 实战研判中心
                    </div>
                    <h1 className="text-5xl font-black text-[#0A0F1D] tracking-tight">描述您的管理卡点</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                      【问一问】提供通用锦囊，【聊一聊】针对您的具体“人、事、时、空”，发起定制化起底与决策辅助。
                    </p>
                  </div>
                  
                  <div className="relative">
                    <IntentionCapture 
                      mode="new-search"
                      variant="command"
                      onSearch={(q) => {
                        setPendingQuery(q);
                        setView('diagnose-engine');
                      }} 
                      onStartDiagnose={() => setView('diagnose-engine')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {[
                      { title: '团队执行力差', desc: '指令下达后，结果总是打折扣' },
                      { title: '核心骨干流失', desc: '关键人才突然提出离职，如何挽留' },
                      { title: '跨部门协作难', desc: '资源协调不动，推进受阻' }
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => {
                          setPendingQuery(item.title);
                          setView('diagnose-engine');
                        }}
                        className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-[#F2C94C] hover:shadow-xl hover:shadow-[#F2C94C]/5 transition-all cursor-pointer group"
                      >
                        <h4 className="font-bold text-[#0A0F1D] mb-2 group-hover:text-[#F2C94C]">{item.title}</h4>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'history' && (
              <HistoryView 
                history={history} 
                onReloadChat={handleReloadChat}
                onNavigate={handleHistoryNavigate}
              />
            )}

            {view === 'expert-profile' && selectedExpert && (
              <ExpertProfileView 
                expert={selectedExpert}
                topics={TOPICS}
                onClose={() => handleSetView('home')}
                onBookExpert={handleBookConsultant}
                onTopicClick={handleTopicClick}
              />
            )}

            {view === 'case-detail' && selectedCase && (
              <ExpertCaseDetail expertCase={selectedCase} onClose={() => handleSetView('home')} />
            )}

          </div>
        </div>

        {/* Global Bottom Input Bar - Hidden in Home View now as it's centered */}
        {view === 'home' && isBriefingMode && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 p-2 shadow-2xl">
                <IntentionCapture 
                  mode="new-search"
                  onSearch={handleSearch} 
                  onStartDiagnose={() => setView('diagnose-engine')}
                />
              </div>
            </div>
          </div>
        )}

        <footer className="py-8 text-center">
          <p className="text-[10px] text-slate-400">
            及时、精准、有效解决管理痛点，助力每一位管理者提升管理能力
          </p>
        </footer>
      </main>
    </div>
  );
}
