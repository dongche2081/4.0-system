import { GoogleGenAI } from '@google/genai';
import { ProfileContext, DiagnosticContext } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateManagementFeedback(
  query: string, 
  context: ProfileContext, 
  diagnosticContext?: DiagnosticContext | null,
  history: { role: 'user' | 'ai', content: string }[] = []
): Promise<string> {
  try {
    let diagnosticPrompt = '';
    if (diagnosticContext) {
      diagnosticPrompt = `
【聊一聊背景】：
- 离职意向阶段：${diagnosticContext.intentStage}
- 核心风险评估：${diagnosticContext.riskAssessment}
- 当前干预进度：${diagnosticContext.interventionProgress}
- 细节补充：${diagnosticContext.details || '无'}
`;
    }

    let historyPrompt = '';
    if (history.length > 0) {
      historyPrompt = `
【对话历史】：
${history.map(m => `${m.role === 'user' ? '管理者' : 'AI 管理能力提升助手'}: ${m.content}`).join('\n')}
`;
    }

    const prompt = `你是一个资深的实战派企业管理顾问（人称"AI 管理能力提升助手"）。
当前管理者的背景：业务处于"${context.businessStage}"，团队状态是"${context.teamStatus}"，管理者的个人风格是"${context.leadershipStyle}"，当前管理模式为"${context.managementMode}"。
${diagnosticPrompt}
${historyPrompt}

管理者最新的追问是：${query}

请基于之前的研判背景和对话历史，给出一段专业、犀利、直击本质的管理研判反馈（约200-300字）。
注意：
1. 你正处于一个“持续咨询”的过程中，回复应体现对之前信息的承接。
2. 语气要像 AI 管理能力提升助手一样：高冷、专业、直指人心。
3. 不要直接给出标准答案，而是要反馈深层的管理知识、逻辑剖析和人性洞察。

包含：
1. 【本质原因】：结合之前的风险评估和最新追问，一针见血指出问题背后的管理逻辑或人性弱点。
2. 【破局思路】：给出高维度的解决方向。
3. 【AI 管理能力提升助手金句】：一句简短有力的管理格言。

请使用纯文本格式，适当换行。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || '抱歉，AI 管理能力提升助手正在闭关，请稍后再试。';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return '抱歉，AI 管理能力提升助手的通讯线路受到干扰，请稍后再试。';
  }
}
