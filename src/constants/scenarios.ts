/**
 * 场景映射配置
 * 用于将话题 ID 映射到场景 ID
 */
export const TOPIC_TO_SCENARIO_MAP: Record<string, string> = {
  '1': '1',     // 执行力差 -> s1
  '3': 't2',    // 核心骨干离职 -> s2
  '6': 't1',    // 绩效宣贯 -> s3
  '7': 't3',    // 目标对齐 -> s4
};

/**
 * 场景分类标签
 */
export const SCENARIO_CATEGORIES = {
  TALENT_RETENTION: '人才留存',
  PERFORMANCE_MANAGEMENT: '绩效管理',
  CROSS_DEPT_COMMUNICATION: '跨部门沟通',
  TEAM_MANAGEMENT: '团队管理',
  COMMUNICATION_MANAGEMENT: '沟通管理',
  NEW_GEN_MANAGEMENT: '新生代管理',
  GENERAL: '常规管理',
} as const;

/**
 * 实战演练页面标签
 */
export const PRACTICE_TABS = ['全部', '人才留存', '绩效管理', '跨部门沟通'] as const;

/**
 * 常见困境卡片数据
 */
export const COMMON_PROBLEMS = [
  {
    id: 'bottleneck',
    title: '执行力瓶颈',
    desc: '团队推一下动一下，缺乏自驱力'
  },
  {
    id: 'turnover',
    title: '人才流失',
    desc: '核心骨干疑似离职，如何提前切入'
  },
  {
    id: 'collaboration',
    title: '跨部门协作',
    desc: '资源调不动，协作撞墙'
  },
  {
    id: 'communication',
    title: '向上管理',
    desc: '如何有效汇报，争取资源支持'
  },
  {
    id: 'motivation',
    title: '团队激励',
    desc: '如何激发团队积极性，提升士气'
  },
  {
    id: 'performance',
    title: '绩效面谈',
    desc: '如何与低绩效员工进行有效沟通'
  }
];

/**
 * 根据描述获取场景分类
 */
export function getScenarioCategory(description: string): string {
  if (description.includes('离职') || description.includes('留存')) return SCENARIO_CATEGORIES.TALENT_RETENTION;
  if (description.includes('绩效') || description.includes('目标')) return SCENARIO_CATEGORIES.PERFORMANCE_MANAGEMENT;
  if (description.includes('跨部门') || description.includes('协同')) return SCENARIO_CATEGORIES.CROSS_DEPT_COMMUNICATION;
  if (description.includes('冲突')) return SCENARIO_CATEGORIES.TEAM_MANAGEMENT;
  if (description.includes('沟通') || description.includes('汇报')) return SCENARIO_CATEGORIES.COMMUNICATION_MANAGEMENT;
  if (description.includes('95后') || description.includes('新生代')) return SCENARIO_CATEGORIES.NEW_GEN_MANAGEMENT;
  return SCENARIO_CATEGORIES.GENERAL;
}
