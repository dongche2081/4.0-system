import OpenAI from 'openai';
import { ProfileContext, DiagnosticContext, Prescription } from '../types';

// ===============================
// 阿里云百炼配置
// ===============================
const getEnv = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - Vite 注入的 env
    return import.meta.env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

const AI_CONFIG = {
  apiKey: getEnv('VITE_AI_API_KEY', ''),
  baseURL: getEnv('VITE_AI_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
  model: getEnv('VITE_AI_MODEL', 'qwen-max'),
  timeout: 10000,
};

// 初始化 OpenAI 客户端（阿里云百炼兼容模式）
const aiClient = new OpenAI({
  apiKey: AI_CONFIG.apiKey,
  baseURL: AI_CONFIG.baseURL,
  dangerouslyAllowBrowser: true,
  timeout: AI_CONFIG.timeout,
});

// ===============================
// 结构化专家 System Prompt
// ===============================
const STRUCTURED_EXPERT_PROMPT = `你是一个资深的实战派企业管理顾问，人称「AI 管理能力提升助手」。

【核心特质】
- 高冷、专业、直指人心，绝不讨好、不说教、不废话
- 擅长透过表象看本质，一针见血指出管理逻辑和人性弱点

【输出格式 - 必须严格遵循以下 JSON 格式，不要输出任何其他内容】
{
  "truth": "一针见血指出本质原因（80-100字，直指管理逻辑或人性弱点）",
  "summary": "核心观点一句话总结（30字以内）",
  "script": {
    "opening": "谈话开场白（40-60字，建立信任感）",
    "responses": [
      "核心拆解要点1（50-80字，针对痛点的深度剖析）",
      "核心拆解要点2（50-80字，给出可执行方向）"
    ],
    "closing": "收尾动作（40-60字，锁定下一步）"
  },
  "redLines": [
    "红线1：绝对禁止的动作（20-30字）",
    "红线2：常见但危险的误区（20-30字）",
    "红线3：必须避免的后果（20-30字）"
  ]
}

【绝对禁忌】
- 禁止输出 JSON 以外的任何内容
- 禁止使用「你可以考虑...」这类软弱表达
- 禁止字数超限，必须字字珠玑`;

// ===============================
// 评分算法配置
// ===============================
export interface RiskAssessment {
  score: number;        // 0-100 风险分数
  level: '低危' | '中危' | '高危' | '极高危';
  primaryRisk: string;  // 主要风险点
  riskFactors: string[];
  suggestions: string[];
}

// 诊断选项风险权重映射
const RISK_WEIGHTS: Record<string, number> = {
  // 人才关键度
  '核心资产(无可替代)': 10,
  '中坚力量(招聘周期长)': 7,
  '常规人力(可快速补位)': 4,

  // 离职动机
  '薪酬/外部诱惑': 6,
  '成长瓶颈/技术边缘化': 9,
  '人际摩擦/直属主管矛盾': 8,
  '个人原因/家庭变动': 5,

  // 挽留动作反馈
  '尚未正式谈话': 8,
  '尝试挽留中': 5,
  '谈话陷入僵局': 9,
  '对方态度松动': 3,

  // 目标清晰度
  '目标模糊/常变': 9,
  '目标清晰但无拆解': 6,
  '目标已拆解但无共识': 5,

  // 激励闭环
  '缺乏即时反馈': 8,
  '激励手段单一': 6,
  '反馈流于形式': 7,

  // 资源工具
  '工具落后/繁琐': 6,
  '缺乏协作平台': 7,
  '工具使用门槛高': 5,

  // 组织健康度
  '氛围压抑': 9,
  '沟通成本极高': 8,
  '缺乏信任基础': 9,

  // 领导力断层
  '中层执行力弱': 7,
  '基层缺乏动力': 8,
  '高层战略不清晰': 9,

  // 团队协作
  '各自为政': 8,
  '表面对齐/实际脱节': 7,
  '缺乏统一语言': 6,
};

/**
 * 计算诊断风险评分
 */
export function calculateRiskAssessment(
  selections: Record<string, string>,
  dimension: 'talent' | 'execution' | 'general'
): RiskAssessment {
  let totalRisk = 0;
  let maxRisk = 0;
  const riskFactors: string[] = [];

  Object.entries(selections).forEach(([key, value]) => {
    const weight = RISK_WEIGHTS[value] || 5;
    totalRisk += weight;
    maxRisk += 10;

    // 记录高风险因子
    if (weight >= 8) {
      riskFactors.push(value);
    }
  });

  const score = Math.min(100, Math.round((totalRisk / maxRisk) * 100));

  // 确定风险等级
  let level: RiskAssessment['level'];
  if (score >= 85) level = '极高危';
  else if (score >= 70) level = '高危';
  else if (score >= 50) level = '中危';
  else level = '低危';

  // 识别主要风险点
  const primaryRisk = identifyPrimaryRisk(selections, dimension);

  // 生成针对性建议
  const suggestions = generateSuggestions(selections, level);

  return {
    score,
    level,
    primaryRisk,
    riskFactors: riskFactors.slice(0, 3),
    suggestions,
  };
}

/**
 * 识别主要风险点
 */
function identifyPrimaryRisk(
  selections: Record<string, string>,
  dimension: 'talent' | 'execution' | 'general'
): string {
  const values = Object.values(selections);

  if (dimension === 'talent') {
    if (values.some(v => v.includes('核心资产'))) {
      return values.some(v => v.includes('成长瓶颈'))
        ? '核心人才因成长受限而流失'
        : '核心人才流失将造成业务断层';
    }
    if (values.some(v => v.includes('谈话陷入僵局'))) {
      return '挽留谈判已陷入被动局面';
    }
  }

  if (dimension === 'execution') {
    if (values.some(v => v.includes('目标模糊'))) {
      return '目标管理体系存在系统性缺陷';
    }
    if (values.some(v => v.includes('缺乏即时反馈'))) {
      return '激励反馈机制严重滞后';
    }
  }

  if (dimension === 'general') {
    if (values.some(v => v.includes('氛围压抑') || v.includes('缺乏信任'))) {
      return '组织文化存在深层危机';
    }
    if (values.some(v => v.includes('高层战略不清晰'))) {
      return '战略传导链条断裂';
    }
  }

  return '管理现状存在潜在优化空间';
}

/**
 * 生成针对性建议
 */
function generateSuggestions(
  selections: Record<string, string>,
  level: RiskAssessment['level']
): string[] {
  const suggestions: string[] = [];

  if (level === '高危' || level === '极高危') {
    suggestions.push('建议 24 小时内启动紧急干预流程');
  }

  Object.values(selections).forEach(value => {
    if (value.includes('核心资产')) {
      suggestions.push('立即启动核心人才备份计划，降低单点依赖');
    }
    if (value.includes('成长瓶颈')) {
      suggestions.push('设计差异化职业发展通道，提供技术纵深空间');
    }
    if (value.includes('目标模糊')) {
      suggestions.push('重构目标拆解体系，建立日清看板机制');
    }
    if (value.includes('缺乏即时反馈')) {
      suggestions.push('建立周度小激励+月度大认可的反馈闭环');
    }
    if (value.includes('氛围压抑')) {
      suggestions.push('开展非正式一对一沟通，重建心理安全感');
    }
  });

  return [...new Set(suggestions)].slice(0, 3);
}

// ===============================
// 专家匹配算法
// ===============================
export interface ExpertMatch {
  expertId: string;
  score: number;
  reason: string;
}

/**
 * 计算专家匹配度
 */
export function calculateExpertMatches(
  topicTitle: string,
  context: ProfileContext,
  experts: Array<{ id: string; topics: string[]; tags: string[]; resume: string[] }>
): ExpertMatch[] {
  return experts
    .map(expert => {
      let score = 0;
      const reasons: string[] = [];

      // 1. 话题匹配（40%）
      const topicMatch = expert.topics.some(t =>
        topicTitle.includes(t) || t.includes(topicTitle)
      );
      if (topicMatch) {
        score += 40;
        reasons.push('话题领域高度契合');
      }

      // 2. 管理风格匹配（30%）
      const styleMatch =
        (context.managementMode === '华为实战模式' &&
          expert.tags.some(t => t.includes('华为'))) ||
        (context.managementMode === '互联网敏捷模式' &&
          expert.tags.some(t => t.includes('互联网') || t.includes('字节') || t.includes('阿里')));
      if (styleMatch) {
        score += 30;
        reasons.push(`${context.managementMode}经验匹配`);
      }

      // 3. 业务阶段匹配（30%）
      const stageMatch =
        (context.businessStage === '初创生存期' &&
          expert.resume.some(r => r.includes('0到1') || r.includes('初创'))) ||
        (context.businessStage === '快速扩张期' &&
          expert.resume.some(r => r.includes('扩张') || r.includes('规模化'))) ||
        (context.businessStage === '组织变革期' &&
          expert.tags.some(t => t.includes('变革') || t.includes('组织')));
      if (stageMatch) {
        score += 30;
        reasons.push(`${context.businessStage}实战经验`);
      }

      return {
        expertId: expert.id,
        score,
        reason: reasons.join('，') || '综合管理顾问',
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ===============================
// 核心服务函数
// ===============================

/**
 * 生成结构化管理咨询反馈
 */
export async function generateStructuredFeedback(
  query: string,
  context: ProfileContext,
  diagnosticContext?: DiagnosticContext | null
): Promise<Prescription> {
  // 组装诊断背景
  let diagnosticPrompt = '';
  if (diagnosticContext) {
    diagnosticPrompt = `
【深度诊断背景】：
- 离职意向阶段：${diagnosticContext.intentStage}
- 核心风险评估：${diagnosticContext.riskAssessment}
- 当前干预进度：${diagnosticContext.interventionProgress}
- 细节补充：${diagnosticContext.details || '无'}
`;
  }

  const contextMessage = `【管理者画像】
- 业务阶段：${context.businessStage}
- 团队状态：${context.teamStatus}
- 管理风格：${context.leadershipStyle}
- 管理模式：${context.managementMode}
- 管理幅度：${context.span} 人
- 环境压强：${context.pressure}/10
${diagnosticPrompt}

【管理问题】
${query}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: STRUCTURED_EXPERT_PROMPT },
    { role: 'user', content: contextMessage },
  ];

  try {
    console.log('[AI-Service] 结构化处方请求中...');
    const response = await aiClient.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    console.log('[AI-Service] ✅ 结构化响应成功');

    // 解析 JSON
    try {
      const parsed = JSON.parse(content);
      return {
        truth: parsed.truth || '',
        summary: parsed.summary || '',
        script: {
          opening: parsed.script?.opening || '',
          responses: parsed.script?.responses || [],
          closing: parsed.script?.closing || '',
        },
        redLines: parsed.redLines || [],
      };
    } catch (parseError) {
      console.warn('[AI-Service] JSON 解析失败，使用兜底回复');
      return generateMockPrescription(query);
    }
  } catch (error: any) {
    console.warn('[AI-Service] ❌ 请求失败:', error.message);
    return generateMockPrescription(query);
  }
}

/**
 * 生成管理咨询反馈（兼容旧接口，返回 markdown 文本）
 */
export async function generateManagementFeedback(
  query: string,
  context: ProfileContext,
  diagnosticContext?: DiagnosticContext | null,
  history: { role: 'user' | 'ai'; content: string }[] = []
): Promise<string> {
  // 如果是追问模式，使用旧的文本格式
  if (history.length > 0) {
    return generateFollowUpFeedback(query, context, diagnosticContext, history);
  }

  // 首次诊断，使用结构化生成
  const prescription = await generateStructuredFeedback(query, context, diagnosticContext);

  // 转换为 markdown 格式保持兼容
  return formatPrescriptionToMarkdown(prescription);
}

/**
 * 追问模式反馈
 */
async function generateFollowUpFeedback(
  query: string,
  context: ProfileContext,
  diagnosticContext?: DiagnosticContext | null,
  history: { role: 'user' | 'ai'; content: string }[] = []
): Promise<string> {
  const contextMessage = `【管理者画像】
- 业务阶段：${context.businessStage}
- 团队状态：${context.teamStatus}
- 管理风格：${context.leadershipStyle}
- 管理模式：${context.managementMode}
- 环境压强：${context.pressure}/10

【历史对话】已有 ${history.length} 轮交流`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${STRUCTURED_EXPERT_PROMPT}

【当前模式：深度追问】
- 保持高冷专业的语气
- 针对用户的具体追问给出针对性补充
- 可以适当展开细节，但依然要字字珠玑`,
    },
    { role: 'user', content: contextMessage },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  messages.push({
    role: 'user',
    content: `管理者最新的追问是：${query}`,
  });

  try {
    const response = await aiClient.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      temperature: 0.4,
      max_tokens: 800,
    });
    return response.choices[0]?.message?.content || generateMockResponse(query);
  } catch (error: any) {
    return generateMockResponse(query);
  }
}

/**
 * 将结构化处方转为 markdown
 */
function formatPrescriptionToMarkdown(prescription: Prescription): string {
  return `【本质原因】
${prescription.truth}

【破局思路】
${prescription.summary}

【谈话剧本】
**开场**：${prescription.script.opening}

${prescription.script.responses.map((r, i) => `**要点${i + 1}**：${r}`).join('\n\n')}

**收尾**：${prescription.script.closing}

【动作红线】
${prescription.redLines.map((line, i) => `${i + 1}. ${line}`).join('\n')}`;
}

/**
 * Mock 结构化处方（兜底）
 */
function generateMockPrescription(query: string): Prescription {
  return {
    truth: `${query ? query + ' - ' : ''}此问题的表象背后，是目标传导链断裂与反馈机制失效的双重系统性失调。核心骨干的流失风险实质上是组织在高速扩张中对「人」的感知与响应滞后。`,
    summary: '管理的本质不是控制，而是消除信息不对称',
    script: {
      opening: '「听说你在考虑新的机会，我很重视你的想法，能聊聊是什么触发了这个决定吗？」',
      responses: [
        '「如果抛开薪资，现在的工作状态是你想要的吗？」——剥离表面诉求，探寻真实动机',
        '「如果给你一个更纯粹的做事空间，你愿意再考虑吗？」——试探弹性空间，为后续方案设计提供依据',
      ],
      closing: '「不管最终决定如何，我都会尊重。但希望你给我一个机会，让我们看看是否能一起创造你想要的成长环境。」',
    },
    redLines: [
      '严禁第一时间用加薪防御性挽留',
      '严禁威胁或情感绑架',
      '严禁拖延离职流程消耗信任',
    ],
  };
}

/**
 * Mock 兜底回复（兼容旧接口）
 */
function generateMockResponse(query: string): string {
  return formatPrescriptionToMarkdown(generateMockPrescription(query));
}

// ===============================
// 健康检查
// ===============================

export interface HealthCheckResult {
  healthy: boolean;
  latency: number;
  error?: string;
}

/**
 * 健康检查
 */
export async function checkAIServiceHealth(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    await aiClient.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });
    return { healthy: true, latency: Date.now() - start };
  } catch (error: any) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error.message,
    };
  }
}
