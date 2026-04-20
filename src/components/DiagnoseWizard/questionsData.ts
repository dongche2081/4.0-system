import { DiagnoseDimension } from '../../types';

export const DIMENSIONS_MAP: Record<string, DiagnoseDimension[]> = {
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

export function getQuestionSetKey(scenario: string): 'talent' | 'execution' | 'general' {
  const q = scenario.toLowerCase();
  if (q.includes('离职') || q.includes('想走') || q.includes('人才') || q.includes('流失') || q.includes('保留')) return 'talent';
  if (q.includes('执行力') || q.includes('推不动') || q.includes('慢') || q.includes('效率')) return 'execution';
  return 'general';
}
