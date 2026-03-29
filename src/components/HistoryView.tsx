import React, { useState, useEffect, useMemo } from 'react';
import { HistoryItem, AppView, ExpertCase, StudyRecord, SimulationRecord } from '../types';
import {
  BookOpen, Activity, Target, History as HistoryIcon, ChevronRight, Award, Clock,
  MessageSquare, CheckCircle2, XCircle, FileText, BarChart3, Search,
  MoreHorizontal, Trash2, TrendingUp, TrendingDown, Minus, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  history: HistoryItem[];
  studyRecords: StudyRecord[];
  practiceRecords: SimulationRecord[];
  onReloadChat: (context: any) => void;
  onNavigate: (view: AppView, item: any) => void;
  onDeleteStudyRecord?: (id: string) => void;
  onDeletePracticeRecord?: (id: string) => void;
  onDeleteChatRecord?: (id: string) => void;
  onClearStudyRecords?: () => void;
  onClearPracticeRecords?: () => void;
  onClearChatRecords?: () => void;
}

// 示例数据 - 学一学
const DEMO_STUDY_RECORDS: StudyRecord[] = [
  {
    id: 'study-001',
    topicId: 'topic-retention',
    topicTitle: '核心骨干突然沉默，疑似有离职倾向',
    expertName: '张建国',
    expertTitle: '前华为组织发展专家',
    action: 'view',
    timestamp: Date.now() - 86400000 * 2,
    duration: 180,
  },
  {
    id: 'study-002',
    topicId: 'topic-performance',
    topicTitle: '如何提升团队执行力',
    expertName: '李慕华',
    expertTitle: '360高级副总裁/资深教练',
    action: 'bookmark',
    timestamp: Date.now() - 86400000 * 5,
    duration: 240,
  },
  {
    id: 'study-003',
    topicId: 'topic-communication',
    topicTitle: '跨部门协作低效',
    expertName: '陈志远',
    expertTitle: '字节跳动前HRBP负责人',
    action: 'view',
    timestamp: Date.now() - 86400000 * 7,
    duration: 120,
  },
];

// 示例数据 - 练一练
const DEMO_PRACTICE_RECORDS: SimulationRecord[] = [
  {
    id: 'practice-001',
    scenarioId: 'scenario-001',
    scenarioTitle: '【常规管理】你安排了一项重要任务，但下属反馈消极，进度缓慢。',
    category: '常规管理',
    selectedOption: 'option-b',
    isCorrect: true,
    impact: { morale: 15, efficiency: 20, retention: -5 },
    timestamp: Date.now() - 86400000 * 1,
    timeSpent: 45,
  },
  {
    id: 'practice-002',
    scenarioId: 'scenario-002',
    scenarioTitle: '【绩效宣贯】团队对新绩效考核标准不理解，抵触情绪严重。',
    category: '绩效宣贯',
    selectedOption: 'option-a',
    isCorrect: false,
    impact: { morale: -15, efficiency: -10, retention: 20 },
    timestamp: Date.now() - 86400000 * 3,
    timeSpent: 62,
  },
  {
    id: 'practice-003',
    scenarioId: 'scenario-003',
    scenarioTitle: '【离职预警】核心员工突然提出离职，HR希望你协助挽留。',
    category: '离职预警',
    selectedOption: 'option-c',
    isCorrect: true,
    impact: { morale: 25, efficiency: 10, retention: -20 },
    timestamp: Date.now() - 86400000 * 6,
    timeSpent: 88,
  },
  {
    id: 'practice-004',
    scenarioId: 'scenario-004',
    scenarioTitle: '【执行力差】项目进度严重滞后，团队成员互相推诿责任。',
    category: '常规管理',
    selectedOption: 'option-b',
    isCorrect: true,
    impact: { morale: 10, efficiency: 25, retention: 0 },
    timestamp: Date.now() - 86400000 * 10,
    timeSpent: 55,
  },
];

// 示例数据 - 聊一聊
const DEMO_CHAT_RECORDS: HistoryItem[] = [
  {
    id: 'chat-001',
    query: '团队核心骨干流失风险高，如何建立有效的留人机制？',
    aiResponse: '当前团队核心骨干流失风险已达临界点，建议立即开启非业务导向的一对一深度面谈...',
    timestamp: Date.now() - 86400000 * 1,
    context: {
      businessStage: '快速扩张期',
      teamStatus: '人心浮动中',
      leadershipStyle: '强势结果导向',
      managementMode: '互联网敏捷模式',
      span: 12,
      levels: 3,
      composition: ['研发', '产品', '运营'],
      pressure: 8,
      decisionMode: '民主决策',
    },
    isDeepDiagnosis: true,
    chatHistory: [
      { id: '1', role: 'user', content: '团队核心骨干流失风险高，如何建立有效的留人机制？' },
      { id: '2', role: 'ai', content: '理解您的困境。快速扩张期人心浮动，建议从三个维度入手...' },
      { id: '3', role: 'user', content: '具体应该如何进行一对一沟通？' },
      { id: '4', role: 'ai', content: '建议采用"3F倾听法"：Fact（事实）、Feeling（感受）、Focus（聚焦）...' },
    ],
  },
  {
    id: 'chat-002',
    query: '跨部门协作效率低下，如何建立有效的协同机制？',
    aiResponse: '跨部门协作低效的核心是利益不对齐，建议建立"三方对齐"机制...',
    timestamp: Date.now() - 86400000 * 4,
    context: {
      businessStage: '稳定成熟期',
      teamStatus: '内耗血栓化',
      leadershipStyle: '温和关系导向',
      managementMode: '华为实战模式',
      span: 8,
      levels: 2,
      composition: ['研发', '测试'],
      pressure: 5,
      decisionMode: '层级审批',
    },
    isDeepDiagnosis: true,
  },
];

export const HistoryView: React.FC<Props> = ({
  history,
  studyRecords: propStudyRecords,
  practiceRecords: propPracticeRecords,
  onReloadChat,
  onNavigate,
  onDeleteStudyRecord,
  onDeletePracticeRecord,
  onDeleteChatRecord,
  onClearStudyRecords,
  onClearPracticeRecords,
  onClearChatRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'practice' | 'chat'>('ask');
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 合并示例数据和真实数据（测试环境）
  const studyRecords = mounted && propStudyRecords?.length > 0 ? propStudyRecords : DEMO_STUDY_RECORDS;
  const practiceRecords = mounted && propPracticeRecords?.length > 0 ? propPracticeRecords : DEMO_PRACTICE_RECORDS;
  const chatRecords = mounted && history?.length > 0 ? history.filter(h => h.isDeepDiagnosis) : DEMO_CHAT_RECORDS;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  };

  const isWithinTimeFilter = (timestamp: number) => {
    if (timeFilter === 'all') return true;
    const now = Date.now();
    const diff = now - timestamp;
    if (timeFilter === '7d') return diff <= 7 * 86400000;
    if (timeFilter === '30d') return diff <= 30 * 86400000;
    return true;
  };

  const filteredStudyRecords = useMemo(() => {
    return studyRecords.filter(r => {
      if (!isWithinTimeFilter(r.timestamp)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return r.topicTitle.toLowerCase().includes(q) || r.expertName.toLowerCase().includes(q);
    });
  }, [studyRecords, searchQuery, timeFilter]);

  const filteredPracticeRecords = useMemo(() => {
    return practiceRecords.filter(r => {
      if (!isWithinTimeFilter(r.timestamp)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return r.scenarioTitle.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    });
  }, [practiceRecords, searchQuery, timeFilter]);

  const filteredChatRecords = useMemo(() => {
    return chatRecords.filter(r => {
      if (!isWithinTimeFilter(r.timestamp)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return r.query.toLowerCase().includes(q) || r.aiResponse.toLowerCase().includes(q);
    });
  }, [chatRecords, searchQuery, timeFilter]);



  const handleDelete = (id: string) => {
    if (activeTab === 'ask') onDeleteStudyRecord?.(id);
    if (activeTab === 'practice') onDeletePracticeRecord?.(id);
    if (activeTab === 'chat') onDeleteChatRecord?.(id);
    setOpenMenuId(null);
  };

  const handleClear = () => {
    if (activeTab === 'ask') onClearStudyRecords?.();
    if (activeTab === 'practice') onClearPracticeRecords?.();
    if (activeTab === 'chat') onClearChatRecords?.();
    setShowClearConfirm(false);
  };

  const canClear = activeTab === 'ask' || activeTab === 'practice' || activeTab === 'chat';
  const currentListLength = activeTab === 'ask' ? filteredStudyRecords.length
    : activeTab === 'practice' ? filteredPracticeRecords.length
    : filteredChatRecords.length;

  const tabs = [
    { id: 'ask', label: '学一学', icon: BookOpen, count: studyRecords.length },
    { id: 'practice', label: '练一练', icon: Target, count: practiceRecords.length },
    { id: 'chat', label: '聊一聊', icon: Activity, count: chatRecords.length },
  ] as const;

  const renderImpact = (impact?: { morale: number; efficiency: number; retention: number }) => {
    if (!impact) return null;
    const items = [
      { label: '士气', value: impact.morale },
      { label: '效率', value: impact.efficiency },
      { label: '保留', value: impact.retention },
    ];
    return (
      <div className="flex items-center gap-3 mt-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-1 text-[11px]">
            {item.value > 0 ? <TrendingUp className="w-3 h-3 text-green-500" />
              : item.value < 0 ? <TrendingDown className="w-3 h-3 text-red-500" />
              : <Minus className="w-3 h-3 text-slate-300" />}
            <span className={item.value > 0 ? 'text-green-600' : item.value < 0 ? 'text-red-600' : 'text-slate-400'}>
              {item.label}{item.value > 0 ? `+${item.value}` : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* 头部标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center">
          <HistoryIcon className="w-6 h-6 mr-3 text-[#F2C94C]" /> 历史档案
        </h2>
        {canClear && currentListLength > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        )}
      </div>

      {/* 标签导航 */}
      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto no-scrollbar relative">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
              setTimeFilter('all');
            }}
            className={`pb-3 text-sm font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#F2C94C] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-slate-100 text-slate-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 搜索与时间筛选 */}
      <div className="flex flex-col sm:flex-row gap-3 sticky top-0 z-10 bg-[#F8FAFC] py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索话题、专家、场景..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', '7d', '30d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${timeFilter === tf ? 'bg-[#F2C94C] text-white border-[#F2C94C]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#F2C94C] hover:text-[#F2C94C]'}`}
              >
                {tf === 'all' ? '全部' : tf === '7d' ? '最近7天' : '最近30天'}
              </button>
            ))}
          </div>
        </div>

      <div className="py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* 学一学 */}
            {activeTab === 'ask' && (
              <>
                {filteredStudyRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => onNavigate('home', { topicId: record.topicId })}
                    className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-[#F2C94C]/40 cursor-pointer transition-all group relative"
                  >
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2 group-hover:text-[#F2C94C] transition-colors">
                          {record.topicTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(record.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            阅读 {formatDuration(record.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {record.expertName} · {record.expertTitle}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {/* 更多菜单 */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === record.id ? null : record.id); }}
                        className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === record.id && (
                        <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                            className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredStudyRecords.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm">
                      暂无学习记录，去
                      <span className="text-[#F2C94C] cursor-pointer hover:underline" onClick={() => onNavigate('home', {})}>学一学</span>
                      看看吧
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 练一练 */}
            {activeTab === 'practice' && (
              <>
                {filteredPracticeRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => onNavigate('practice', { scenarioId: record.scenarioId })}
                    className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-[#F2C94C]/40 cursor-pointer transition-all group relative"
                  >
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-900 group-hover:text-[#F2C94C] transition-colors">
                            {record.scenarioTitle.split('】')[1] || record.scenarioTitle}
                          </h4>
                          {record.isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded">
                              <CheckCircle2 className="w-3 h-3" /> 决策正确
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                              <XCircle className="w-3 h-3" /> 红区警告
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(record.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            答题用时 {formatDuration(record.timeSpent)}
                          </span>
                        </div>
                        {renderImpact(record.impact)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {/* 更多菜单 */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === record.id ? null : record.id); }}
                        className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === record.id && (
                        <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                            className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPracticeRecords.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <Target className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm">
                      暂无演练记录，去
                      <span className="text-[#F2C94C] cursor-pointer hover:underline" onClick={() => onNavigate('practice', {})}>练一练</span>
                      开始挑战吧
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 聊一聊 */}
            {activeTab === 'chat' && (
              <>
                {filteredChatRecords.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onReloadChat(item.context)}
                    className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-[#F2C94C]/40 cursor-pointer transition-all group relative"
                  >
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F2C94C]/10 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[#F2C94C]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{item.query}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{formatTime(item.timestamp)}</p>
                          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 max-w-md">
                            {item.aiResponse.slice(0, 40)}{item.aiResponse.length > 40 ? '...' : ''}
                          </p>
                          {item.chatHistory && item.chatHistory.length > 2 && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                              <BarChart3 className="w-3 h-3" />
                              <span>共 {Math.floor(item.chatHistory.length / 2)} 轮对话</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {/* 更多菜单 */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                        className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredChatRecords.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm">
                      暂无诊断记录，去
                      <span className="text-[#F2C94C] cursor-pointer hover:underline" onClick={() => onNavigate('diagnose-start', {})}>聊一聊</span>
                      开始深度咨询吧
                    </p>
                  </div>
                )}
              </>
            )}


          </motion.div>
        </AnimatePresence>
      </div>

      {/* 点击外部关闭菜单 */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* 清空确认弹窗 */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">确认清空？</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                清空后，当前分类下的所有记录将无法恢复，是否继续？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认清空
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
