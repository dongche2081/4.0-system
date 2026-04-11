import React, { useState, useRef, useEffect } from 'react';
import { ProfileContext, DiagnoseDimension } from '../types';
import { ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { calculateRiskAssessment, RiskAssessment } from '../services/ai-service';

// 本地类型别名以保持代码简洁
type Dimension = DiagnoseDimension;

const DIMENSIONS_MAP: Record<string, DiagnoseDimension[]> = {
  talent: [
    {
      id: 'criticality',
      title: '人才关键度评估',
      subtitle: 'Talent Criticality Assessment',
      description: '评估该员工对团队业务的重要程度',
      options: [
        { label: '核心资产(无可替代)', desc: '掌握核心技术或资源，离职会造成重大损失' },
        { label: '中坚力量(招聘周期长)', desc: '独当一面，招聘替代者需要3个月以上' },
        { label: '常规人力(可快速补位)', desc: '工作标准化，1个月内可找到替代者' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'motive',
      title: '离职真实动机起底',
      subtitle: 'True Resignation Motive',
      description: '分析员工离职的根本原因',
      options: [
        { label: '薪酬/外部诱惑', desc: '被高薪挖角或对当前薪资不满' },
        { label: '成长瓶颈/技术边缘化', desc: '感觉学不到东西，技术能力在退化' },
        { label: '人际摩擦/直属主管矛盾', desc: '与上级或同事关系紧张，工作不开心' },
        { label: '个人原因/家庭变动', desc: '家庭、健康、地域等个人因素' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'feedback',
      title: '当前挽留动作反馈',
      subtitle: 'Retention Action Feedback',
      description: '评估你目前已经采取的挽留措施',
      options: [
        { label: '尚未正式谈话', desc: '还没有与员工进行深入沟通' },
        { label: '尝试挽留中', desc: '已经谈过一次，正在观察效果' },
        { label: '谈话陷入僵局', desc: '双方立场僵持，没有进展' },
        { label: '对方态度松动', desc: '员工开始重新考虑离职决定' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    }
  ],
  execution: [
    {
      id: 'clarity',
      title: '目标体感清晰度',
      subtitle: 'Goal Clarity & Perception',
      description: '团队成员对目标的理解和共识程度',
      options: [
        { label: '目标模糊/常变', desc: '目标不清晰，或经常变动，团队无所适从' },
        { label: '目标清晰但无拆解', desc: '知道大方向，但不知道怎么落实到个人' },
        { label: '目标已拆解但无共识', desc: '有详细目标，但团队成员不认同或不理解' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'incentive',
      title: '激励闭环有效性',
      subtitle: 'Incentive Loop Effectiveness',
      description: '激励措施是否及时、有效、公平',
      options: [
        { label: '缺乏即时反馈', desc: '做得好与不好都一样，没有及时的反馈' },
        { label: '激励手段单一', desc: '只有物质奖励，或只有口头表扬，方式单调' },
        { label: '反馈流于形式', desc: '有反馈机制，但执行不到位，员工无感' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'tools',
      title: '资源与工具匹配度',
      subtitle: 'Resource & Tool Match',
      description: '团队是否有足够的资源和工具完成目标',
      options: [
        { label: '工具落后/繁琐', desc: '使用的工具效率低下，影响工作进度' },
        { label: '缺乏协作平台', desc: '跨部门协作困难，信息不透明' },
        { label: '工具使用门槛高', desc: '工具太复杂，团队成员不会用或不愿意用' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    }
  ],
  general: [
    {
      id: 'health',
      title: '组织健康度现状',
      subtitle: 'Org Health Status',
      description: '团队整体的工作氛围和心理安全感',
      options: [
        { label: '氛围压抑', desc: '团队气氛紧张，大家不敢表达真实想法' },
        { label: '沟通成本极高', desc: '简单的事情需要反复确认，效率低下' },
        { label: '缺乏信任基础', desc: '团队成员之间互相防备，难以协作' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'gap',
      title: '领导力断层观察',
      subtitle: 'Leadership Gap Observation',
      description: '各层级管理者的能力是否匹配当前需求',
      options: [
        { label: '中层执行力弱', desc: '战略无法落地，中层推诿扯皮' },
        { label: '基层缺乏动力', desc: '一线员工消极怠工，缺乏自驱力' },
        { label: '高层战略不清晰', desc: '方向模糊，团队不知道往哪里走' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    },
    {
      id: 'alignment',
      title: '团队协作共识度',
      subtitle: 'Team Collaboration Consensus',
      description: '跨部门、跨层级之间的协作顺畅程度',
      options: [
        { label: '各自为政', desc: '各部门只关心自己的KPI，不管整体目标' },
        { label: '表面对齐/实际脱节', desc: '会议上都说好，实际执行各做各的' },
        { label: '缺乏统一语言', desc: '不同部门对同一事物的理解不一致' },
        { label: '不确定/跳过', desc: '暂时无法判断，跳过此题' }
      ]
    }
  ]
};

interface Props {
  initialContext: ProfileContext;
  mode: 'problem' | 'commander';
  query?: string;
  targetTopicId?: string;
  onComplete: (diagnostic: any) => void;
}

export const DiagnoseEngine: React.FC<Props> = ({ initialContext, mode, query = '', targetTopicId, onComplete }) => {
  const getQuestionSetKey = () => {
    const q = query.toLowerCase();
    const t = targetTopicId?.toLowerCase() || '';
    if (q.includes('离职') || q.includes('想走') || q.includes('人才') || t === '3') return 'talent';
    if (q.includes('执行力') || q.includes('推不动') || q.includes('慢') || t === '1') return 'execution';
    return 'general';
  };

  const questionSetKey = getQuestionSetKey();
  const dimensions = DIMENSIONS_MAP[questionSetKey];
  
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [details, setDetails] = useState('');
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  
  const dimensionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<HTMLDivElement>(null);

  // 计算进度
  const completedCount = Object.keys(selections).length;
  const progress = (completedCount / dimensions.length) * 100;
  const remainingCount = dimensions.length - completedCount;

  const handleOptionSelect = (dimId: string, option: string, index: number) => {
    const newSelections = { ...selections, [dimId]: option };
    setSelections(newSelections);
    
    // 计算风险评分
    if (Object.keys(newSelections).length === dimensions.length) {
      const assessment = calculateRiskAssessment(
        newSelections,
        questionSetKey as 'talent' | 'execution' | 'general'
      );
      setRiskAssessment(assessment);
    }
    
    // Smooth scroll to next dimension or details
    if (index < dimensions.length - 1) {
      setActiveDimensionIndex(index + 1);
      setTimeout(() => {
        dimensionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setActiveDimensionIndex(dimensions.length); // Focus details
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSubmit = () => {
    const assessment = riskAssessment || calculateRiskAssessment(
      selections,
      questionSetKey as 'talent' | 'execution' | 'general'
    );
    
    onComplete({
      ...selections,
      details,
      questionSet: questionSetKey,
      teamContext: initialContext,
      riskAssessment: assessment,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] -m-4 md:-m-6 lg:-m-8 p-4 md:p-8 lg:p-12">
      {/* 面包屑导航 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 hover:text-[#F2C94C] transition-colors"
          >
            <span>首页</span>
          </button>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
          <span className="text-gray-400">深度诊断</span>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
          <span className="text-[#0A0F1D] font-medium">回答调研题目</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <p className="text-base font-bold text-slate-900 mb-3">
          {query || '正在针对特定管理场景进行深度研判...'}
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">诊断进度</span>
          <span className="text-sm font-bold text-[#F2C94C]">{completedCount}/{dimensions.length}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#F2C94C]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-6">
        {/* 左侧主内容区 */}
        <div className="flex-1 space-y-4">
          {/* 题目卡片 */}
          <div className="space-y-4">
            {dimensions.map((dim, index) => {
              const isActive = activeDimensionIndex === index;
              const isCompleted = selections[dim.id] !== undefined;
              
              return (
                <motion.div
                  key={dim.id}
                  ref={(el: HTMLDivElement | null) => { dimensionRefs.current[index] = el; }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isActive ? 1 : isCompleted ? 0.9 : 0.6,
                    scale: isActive ? 1 : 0.99,
                  }}
                  className={`relative p-5 rounded-xl border transition-all duration-300 ${
                    isActive ? 'border-[#F2C94C] shadow-md' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-[#F2C94C]">0{index + 1}.</span>
                        {dim.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">{dim.description}</p>
                    </div>
                    {isCompleted && (
                      <span className="text-xs font-bold text-[#F2C94C] bg-[#F2C94C]/10 px-2 py-1 rounded">
                        已完成
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {dim.options.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleOptionSelect(dim.id, option.label, index)}
                        className={`relative p-3 rounded-lg border-2 text-left transition-all group ${
                          selections[dim.id] === option.label
                            ? 'border-[#F2C94C] bg-[#F2C94C]/5'
                            : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className={`font-bold block mb-1 ${
                              selections[dim.id] === option.label ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              {option.desc}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                            selections[dim.id] === option.label ? 'border-[#F2C94C] bg-[#F2C94C]' : 'border-slate-200'
                          }`}>
                            {selections[dim.id] === option.label && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 补充细节 */}
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0.6 }}
            animate={{
              opacity: activeDimensionIndex === dimensions.length ? 1 : 0.8,
            }}
            className={`p-5 rounded-xl border transition-all duration-300 ${
              activeDimensionIndex === dimensions.length ? 'border-[#F2C94C] shadow-md bg-white' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-3">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                请再补充一些您团队针对该管理痛点的细节情况？
              </h3>
              <p className="text-slate-500 text-xs">
                还有哪些只有你知道的现场细节？
              </p>
            </div>
            
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              onFocus={() => setActiveDimensionIndex(dimensions.length)}
              placeholder="例如：团队目前士气低落，连续三个月未达成目标，上周有两位核心成员提出了离职意向..."
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/20 transition-all resize-none placeholder:text-slate-400"
            />
          </motion.div>

          {/* 占位空间，防止被固定按钮遮挡 */}
          <div className="h-24" />
        </div>

        {/* 右侧边栏 - 进度和提示 */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            {/* 完成状态卡片 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4">答题进度</h4>
              <div className="space-y-3">
                {dimensions.map((dim, idx) => {
                  const isCompleted = selections[dim.id] !== undefined;
                  const isActive = activeDimensionIndex === idx;
                  return (
                    <div 
                      key={dim.id}
                      onClick={() => {
                        setActiveDimensionIndex(idx);
                        dimensionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        isActive ? 'bg-[#F2C94C]/10' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted 
                          ? 'bg-[#F2C94C] text-white' 
                          : isActive 
                            ? 'bg-[#F2C94C]/20 text-[#F2C94C]' 
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-sm ${isActive ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                        {dim.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 提示卡片 */}
            <div className="bg-[#F2C94C]/10 border border-[#F2C94C]/20 rounded-xl p-5">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-[#F2C94C] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">填写提示</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• 请根据实际情况选择，没有标准答案</li>
                    <li>• 可选择"不确定/跳过"暂时跳过</li>
                    <li>• 补充细节有助于生成更精准的建议</li>
                    <li>• 完成所有题目后可查看诊断结果</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定提交按钮 */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 px-6 py-4 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {remainingCount > 0 ? (
              <span>还剩 <span className="font-bold text-[#F2C94C]">{remainingCount}</span> 题未完成</span>
            ) : (
              <span className="text-green-600 font-medium">✓ 所有题目已完成</span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={completedCount < dimensions.length}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              completedCount >= dimensions.length
                ? 'bg-[#F2C94C] text-white shadow-md hover:bg-[#E5B73B] hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {completedCount >= dimensions.length ? (
              <>
                查看诊断结果
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              `还剩 ${remainingCount} 题`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
