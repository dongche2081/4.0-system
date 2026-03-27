import React, { useState, useEffect } from 'react';
import { SimulationEngine } from '../components/SimulationEngine';
import { SCENARIO_DATA } from '../data';
import { useApp } from '../contexts/AppContext';
import { Users, Target } from 'lucide-react';

const PracticePage: React.FC = () => {
  const { targetTopicId, setTargetTopicId } = useApp();
  
  // 本地页面状态
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('全部');
  const [sortBy, setSortBy] = useState<'default' | 'practiceCount' | 'accuracyRate'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

export default PracticePage;
