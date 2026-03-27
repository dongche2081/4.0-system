import React, { useState, useEffect } from 'react';
import { HistoryItem, AppView, ExpertCase, ProfileContext, SimulationRecord, StudyRecord } from '../types';
import { BookOpen, Activity, Target, History as HistoryIcon, ChevronRight, RefreshCw, Award, Heart, Bookmark, Clock, TrendingUp, MessageSquare, CheckCircle2, XCircle, Zap, Lightbulb, FileText, PlayCircle, BarChart3 } from 'lucide-react';

interface Props {
  history: HistoryItem[];
  bookmarks: ExpertCase[];
  studyRecords: StudyRecord[];
  practiceRecords: SimulationRecord[];
  onReloadChat: (context: any) => void;
  onNavigate: (view: AppView, item: any) => void;
}

// 示例数据 - 学一学
const DEMO_STUDY_RECORDS: StudyRecord[] = [
  {
    id: 'study-001',
    topicId: 'topic-retention',
    topicTitle: '核心骨干突然沉默，疑似有离职倾向',
    expertName: '张建国',
    expertTitle: '前华为组织发展专家',
    action: 'view', // view | bookmark | share
    timestamp: Date.now() - 86400000 * 2, // 2天前
    duration: 180, // 阅读时长（秒）
  },
  {
    id: 'study-002',
    topicId: 'topic-performance',
    topicTitle: '如何提升团队执行力',
    expertName: '李慕华',
    expertTitle: '360高级副总裁/资深教练',
    action: 'bookmark',
    timestamp: Date.now() - 86400000 * 5, // 5天前
    duration: 240,
  },
  {
    id: 'study-003',
    topicId: 'topic-communication',
    topicTitle: '跨部门协作低效',
    expertName: '陈志远',
    expertTitle: '字节跳动前HRBP负责人',
    action: 'view',
    timestamp: Date.now() - 86400000 * 7, // 7天前
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
    timestamp: Date.now() - 86400000 * 1, // 1天前
    timeSpent: 45, // 答题用时（秒）
  },
  {
    id: 'practice-002',
    scenarioId: 'scenario-002',
    scenarioTitle: '【绩效宣贯】团队对新绩效考核标准不理解，抵触情绪严重。',
    category: '绩效宣贯',
    selectedOption: 'option-a',
    isCorrect: false,
    impact: { morale: -15, efficiency: -10, retention: 20 },
    timestamp: Date.now() - 86400000 * 3, // 3天前
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
    timestamp: Date.now() - 86400000 * 6, // 6天前
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
    timestamp: Date.now() - 86400000 * 10, // 10天前
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

// 示例数据 - 收藏
const DEMO_BOOKMARKS: ExpertCase[] = [
  {
    id: 'case-001',
    title: '华为铁三角组织管理模式',
    summary: '解析华为如何构建客户、产品、交付三位一体的铁三角组织',
    content: '...',
    tags: ['组织设计', '华为', '协同'],
    expertId: 'expert-001',
    expertName: '张建国',
    expertProfile: {
      id: 'expert-001',
      name: '张建国',
      avatar: 'https://picsum.photos/seed/zhang/200/200',
      title: '前华为组织发展专家',
      resume: ['华为12年OD经验', '服务过500+管理者'],
    },
  },
  {
    id: 'case-002',
    title: '字节跳动OKR实践指南',
    summary: '字节跳动如何通过OKR实现组织目标与个人成长的对齐',
    content: '...',
    tags: ['绩效管理', '字节', 'OKR'],
    expertId: 'expert-003',
    expertName: '陈志远',
    expertProfile: {
      id: 'expert-003',
      name: '陈志远',
      avatar: 'https://picsum.photos/seed/chen/200/200',
      title: '字节跳动前HRBP负责人',
      resume: ['字节跳动HRBP负责人', 'OKR落地专家'],
    },
  },
];

// 示例数据 - 我的贡献
const DEMO_CONTRIBUTIONS = [
  { 
    id: 'contrib-001',
    topic: '核心骨干离职预警', 
    content: '建议增加"职业发展二次锚定"面谈环节，在离职意向产生前进行深度沟通。',
    points: 200, 
    date: '2026-03-10',
    type: 'suggestion',
    likes: 15,
    status: 'approved'
  },
  { 
    id: 'contrib-002',
    topic: '绩效评价标准', 
    content: '对于研发岗位，建议引入"技术影响力"作为加分项，平衡产出与长期价值。',
    points: 250, 
    date: '2026-03-08',
    type: 'case',
    likes: 23,
    status: 'approved'
  },
  { 
    id: 'contrib-003',
    topic: '新生代员工管理', 
    content: '95后员工更注重成长感和参与感，建议在周会中增加"本周成长分享"环节。',
    points: 0, 
    date: '2026-03-15',
    type: 'suggestion',
    likes: 8,
    status: 'pending'
  },
];

export const HistoryView: React.FC<Props> = ({ 
  history, 
  bookmarks: propBookmarks, 
  studyRecords: propStudyRecords,
  practiceRecords: propPracticeRecords,
  onReloadChat, 
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'practice' | 'chat' | 'mine' | 'favorites'>('ask');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 合并示例数据和真实数据（如果有）
  const studyRecords = mounted && propStudyRecords?.length > 0 ? propStudyRecords : DEMO_STUDY_RECORDS;
  const practiceRecords = mounted && propPracticeRecords?.length > 0 ? propPracticeRecords : DEMO_PRACTICE_RECORDS;
  const chatRecords = mounted && history?.length > 0 ? history.filter(h => h.isDeepDiagnosis) : DEMO_CHAT_RECORDS;
  const displayBookmarks = mounted && propBookmarks?.length > 0 ? propBookmarks : DEMO_BOOKMARKS;

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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* 头部统计 */}
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-black text-[#0A0F1D] flex items-center">
          <HistoryIcon className="w-6 h-6 mr-3 text-[#F2C94C]" /> 指挥官档案库
        </h2>
      </div>

      {/* 标签导航 */}
      <div className="flex gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar relative">
        {[
          { id: 'ask', label: '学一学', icon: BookOpen, count: studyRecords.length },
          { id: 'practice', label: '练一练', icon: Target, count: practiceRecords.length },
          { id: 'chat', label: '聊一聊', icon: Activity, count: chatRecords.length },
          { id: 'favorites', label: '我的收藏', icon: Heart, count: displayBookmarks.length },
          { id: 'mine', label: '我的贡献', icon: Award, count: DEMO_CONTRIBUTIONS.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#F2C94C] text-[#0A0F1D]' : 'border-transparent text-gray-400'}`}
          >
            <tab.icon className="w-4 h-4" /> 
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-gray-100 text-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 隐藏可能的滚动箭头按钮 */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="py-6">
        {/* 学一学 - 学习记录 */}
        {activeTab === 'ask' && (
          <div className="space-y-4">
            {studyRecords.map((record) => (
              <div 
                key={record.id} 
                onClick={() => onNavigate('home', { topicId: record.topicId })}
                className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#F2C94C]/50 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0A0F1D] mb-2 group-hover:text-[#F2C94C] transition-colors">
                      {record.topicTitle}
                    </h4>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F2C94C]" />
                </div>
              </div>
            ))}
            {studyRecords.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无学习记录，去"学一学"看看吧</div>
            )}
          </div>
        )}

        {/* 练一练 - 演练记录 */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            {practiceRecords.map((record) => (
              <div 
                key={record.id} 
                className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#F2C94C]/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0A0F1D] mb-3 group-hover:text-[#F2C94C] transition-colors">
                      {record.scenarioTitle.split('】')[1] || record.scenarioTitle}
                    </h4>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('practice', { scenarioId: record.scenarioId })}
                    className="px-4 py-2 bg-[#F2C94C] text-white text-xs font-bold rounded-full hover:bg-[#E5B73B] transition-colors"
                  >
                    再次演练
                  </button>
                </div>
              </div>
            ))}
            {practiceRecords.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无演练记录，去"练一练"开始挑战吧</div>
            )}
          </div>
        )}

        {/* 聊一聊 - 深度诊断记录 */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {chatRecords.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#F2C94C]/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F2C94C]/10 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#F2C94C]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#0A0F1D]">{item.query}</h4>
                        <span className="px-2 py-0.5 bg-[#F2C94C]/20 text-[#F2C94C] text-[10px] font-bold rounded">
                          深度诊断
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{formatTime(item.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onReloadChat(item.context)}
                    className="px-4 py-2 bg-[#F2C94C] text-white text-xs font-bold rounded-full hover:shadow-lg hover:bg-[#E5B73B] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" /> 继续对话
                  </button>
                </div>

                {/* 对话轮数 */}
                {item.chatHistory && item.chatHistory.length > 2 && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <BarChart3 className="w-3 h-3" />
                    <span>共 {Math.floor(item.chatHistory.length / 2)} 轮对话</span>
                  </div>
                )}
              </div>
            ))}
            {chatRecords.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无诊断记录，去"聊一聊"开始深度咨询吧</div>
            )}
          </div>
        )}

        {/* 我的收藏 */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {displayBookmarks.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onNavigate('case-detail', item)}
                className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#F2C94C]/50 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#F2C94C]">
                  <Bookmark className="w-6 h-6 fill-current" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0A0F1D] mb-1 group-hover:text-[#F2C94C] transition-colors">{item.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.summary}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F2C94C]" />
              </div>
            ))}
            {displayBookmarks.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                暂无收藏案例，浏览时点击收藏按钮即可添加
              </div>
            )}
          </div>
        )}

        {/* 我的贡献 */}
        {activeTab === 'mine' && (
          <div className="space-y-4">
            {/* 贡献统计卡片 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-2xl p-5 flex flex-col items-center text-center">
                <Award className="w-8 h-8 text-[#F2C94C] mb-2" />
                <div className="text-2xl font-black text-[#0A0F1D]">450</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">贡献积分</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col items-center text-center">
                <Lightbulb className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-2xl font-black text-[#0A0F1D]">3</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">建议提交</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col items-center text-center">
                <Heart className="w-8 h-8 text-green-500 mb-2" />
                <div className="text-2xl font-black text-[#0A0F1D]">46</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">获得赞同</div>
              </div>
            </div>
            
            {DEMO_CONTRIBUTIONS.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 数据联动说明 - 自然流式布局，随内容滚动 */}
      <div className="mt-8 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Zap className="w-4 h-4 text-[#F2C94C]" />
          <span>数据自动同步：您在"学一学"浏览的案例、"练一练"完成的演练将自动归档至此</span>
        </div>
      </div>
    </div>
  );
};
