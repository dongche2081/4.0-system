import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DiagnoseWizard, WizardData } from '../components/DiagnoseWizard';
import { useApp } from '../contexts/AppContext';
import { calculateRiskAssessment } from '../services/ai-service';
import { getQuestionSetKey } from '../components/DiagnoseWizard/questionsData';
import { Topic, HistoryItem, Prescription } from '../types';

const DiagnoseStartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    context,
    setContext,
    setPendingQuery,
    setSelectedTopic,
    setDiagnosticContext,
    setActivePrescription,
    setActiveHistoryId,
    setHistory,
  } = useApp();

  const handleComplete = (data: WizardData) => {
    const { scenario, answers, details } = data;

    // 设置待诊断查询
    setPendingQuery(scenario);

    // 确定问题集类型
    const questionSetKey = getQuestionSetKey(scenario);

    // 计算风险评估
    const riskAssessment = calculateRiskAssessment(
      answers,
      questionSetKey as 'talent' | 'execution' | 'general'
    );

    // 组装诊断数据
    const diagnostic = {
      intentStage: scenario,
      riskAssessment: `${riskAssessment.level}（${riskAssessment.score}分）- ${riskAssessment.primaryRisk}`,
      interventionProgress: Object.values(answers).join(' | '),
      details,
      teamContext: context,
    };

    // 设置诊断上下文
    setDiagnosticContext(diagnostic);
    setContext(diagnostic.teamContext);

    // 创建话题
    const topic: Topic = {
      id: 'diagnostic-result',
      title: `针对【${scenario}】的研判报告`,
      type: '战友最痛',
    };
    setSelectedTopic(topic);

    // 创建处方
    const prescription: Prescription = {
      truth: `### 研判真相：${scenario}\n\n**研判维度：** ${questionSetKey === 'talent' ? '人才保留' : questionSetKey === 'execution' ? '执行力穿透' : '基础组织画像'}\n\n**核心发现：** ${Object.values(answers).filter(v => typeof v === 'string' && v.length > 0).join(' | ')}\n\n--- \n\n基于您的团队画像，AI 管理能力提升助手建议：\n\n1. **精准打击**：针对研判出的核心问题，立即启动专项对齐。\n2. **工具赋能**：引入匹配当前阶段的管理工具。`,
      summary: `当前团队核心骨干流失风险已达临界点，主要源于业务快速扩张期压力传导失衡，以及管理者对核心人才情绪价值与成长路径规划的长期忽视。建议指挥官立即开启非业务导向的一对一深度面谈，剥离KPI考核，纯粹探寻其个人职业发展诉求与当前核心痛点，切忌单纯依靠物质承诺进行防御性挽留。通过此次精准的心理干预与资源倾斜，预期能有效缓解骨干成员的职业倦怠感，重建团队信任纽带，将核心人才流失风险降低至安全水位，从而确保组织在高速行军中的核心战斗力与业务连续性。`,
      script: { opening: '“我们来聊聊这件事...”', responses: ['正在生成话术...'], closing: '“按此执行即可。”' },
      redLines: ['正在划定红线...']
    };
    setActivePrescription(prescription);

    // 保存历史记录
    const newHistoryId = Date.now().toString();
    setActiveHistoryId(newHistoryId);
    const historyItem: HistoryItem = {
      id: newHistoryId,
      query: `针对【${scenario}】的研判报告`,
      aiResponse: '研判报告已生成',
      timestamp: Date.now(),
      context: { ...diagnostic.teamContext },
      isDeepDiagnosis: true,
      diagnosticContext: diagnostic,
      prescription
    };
    setHistory(prev => [historyItem, ...prev]);

    const savedHistory = JSON.parse(localStorage.getItem('management_history') || '[]');
    localStorage.setItem('management_history', JSON.stringify([historyItem, ...savedHistory]));

    // 导航到结果页
    navigate('/diagnose-result');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      {/* 顶部 - 标题 */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 pt-8 pb-4">
        <div className="w-full max-w-3xl space-y-4">
          {/* 标题区 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              <span className="text-[#F2C94C]">AI</span> 诊断你的管理困境
            </h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              描述您面临的挑战，并且回答几个针对性问题，AI将为您生成个性化行动建议。
            </p>
          </div>
        </div>
      </div>

      {/* Wizard 内容区 */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          <DiagnoseWizard onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default DiagnoseStartPage;
