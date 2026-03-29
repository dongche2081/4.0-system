import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Users, Target } from 'lucide-react';
import { SimulationEngine } from '../components/SimulationEngine';
import { SCENARIO_DATA } from '../data';
import { 
  TOPIC_TO_SCENARIO_MAP, 
  PRACTICE_TABS, 
  getScenarioCategory 
} from '../constants/scenarios';
import { useApp } from '../contexts/AppContext';

export interface PracticePageProps {
  targetTopicId?: string | null;
}

const PracticePage: React.FC<PracticePageProps> = ({ targetTopicId: initialTargetTopicId }) => {
  const navigate = useNavigate();
  const app = useApp();
  const { 
    targetTopicId, 
    setTargetTopicId, 
    practiceRecords,
    setPracticeRecords 
  } = app;

  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('全部');
  const [sortBy, setSortBy] = useState<'default' | 'practiceCount' | 'accuracyRate'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // 优先使用 props 传入的 targetTopicId，否则使用 context 中的
  const effectiveTargetTopicId = initialTargetTopicId ?? targetTopicId;

  // 自动跳转逻辑
  useEffect(() => {
    if (effectiveTargetTopicId && !selectedScenario) {
      const scenarioId = TOPIC_TO_SCENARIO_MAP[effectiveTargetTopicId];
      if (scenarioId && SCENARIO_DATA[scenarioId]) {
        setSelectedScenario(SCENARIO_DATA[scenarioId]);
        setTargetTopicId(null);
      }
    }
  }, [effectiveTargetTopicId, selectedScenario, setTargetTopicId]);

  // 记录演练行为
  const handlePracticeComplete = (scenario: any, selectedOption: string, isCorrect: boolean, timeSpent: number) => {
    const newRecord = {
      id: `practice-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.description,
      category: getScenarioCategory(scenario.description),
      selectedOption,
      isCorrect,
      impact: scenario.options.find((o: any) => o.id === selectedOption)?.impact || { morale: 0, efficiency: 0, retention: 0 },
      timestamp: Date.now(),
      timeSpent,
    };
    setPracticeRecords(prev => [newRecord, ...prev].slice(0, 100));
  };

  if (selectedScenario) {
    const scenarioIds = Object.keys(SCENARIO_DATA);
    const currentIndex = scenarioIds.findIndex(id => SCENARIO_DATA[id].id === selectedScenario.id);
    const nextScenarioId = scenarioIds[currentIndex + 1];
    
    return (
      <SimulationEngine
        scenario={selectedScenario}
        onExit={() => setSelectedScenario(null)}
        onNext={() => {
          if (nextScenarioId) {
            setSelectedScenario(SCENARIO_DATA[nextScenarioId]);
          } else {
            setSelectedScenario(null);
          }
        }}
      />
    );
  }

  const handleSort = (type: 'practiceCount' | 'accuracyRate') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const getSortedScenarios = () => {
    let scenarios = Object.values(SCENARIO_DATA)
      .filter(scenario => {
        // 搜索过滤
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return scenario.description.toLowerCase().includes(query) ||
                 getScenarioCategory(scenario.description).toLowerCase().includes(query);
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

  return (
    <div className="min-h-full bg-slate-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        
        {/* 标题控制区卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 顶部：标题 + 搜索 + 排序 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-[#F2C94C]" />
              <h2 className="text-2xl font-black text-slate-900">实战演练</h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 排序按钮 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">排序：</span>
                <button
                  onClick={() => handleSort('practiceCount')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
                    sortBy === 'practiceCount'
                      ? 'bg-amber-100 text-amber-600 font-medium'
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
                      ? 'bg-amber-100 text-amber-600 font-medium'
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
              
              {/* 搜索框 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索题目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-4 py-2 pl-10 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/20 transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-[#F2C94C] mb-4"></div>
          
          {/* 分类标签 */}
          <div className="flex gap-2">
            {PRACTICE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-full border transition-all ${
                  activeTab === tab
                    ? 'bg-[#F2C94C] text-white border-[#F2C94C] font-medium'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#F2C94C] hover:text-[#F2C94C]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 场景卡片列表 */}
        <div className="space-y-3">
          {getSortedScenarios().map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between border border-slate-100"
            >
              <div className="flex-1">
                {/* 分类标签 - 统一风格 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                    {getScenarioCategory(scenario.description)}
                  </span>
                </div>
                
                {/* 标题 */}
                <h4 className="text-slate-900 text-base font-bold mb-3">
                  {scenario.description.split('】')[0].replace('【', '') || scenario.description}
                </h4>
                
                {/* 元信息 */}
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
              
              {/* 开始按钮 */}
              <button
                onClick={() => setSelectedScenario(scenario)}
                className="px-6 py-2.5 bg-[#F2C94C] text-white font-medium rounded-full text-sm hover:bg-[#E5B73B] transition-colors shadow-sm"
              >
                开始演练
              </button>
            </div>
          ))}
        </div>
        
        {/* 空状态 */}
        {getSortedScenarios().length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-sm">暂无匹配的场景</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
