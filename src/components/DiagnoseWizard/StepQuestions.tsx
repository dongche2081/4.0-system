import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { DIMENSIONS_MAP, getQuestionSetKey } from './questionsData';

interface Props {
  scenario: string;
  answers: Record<string, string>;
  onAnswersChange: (answers: Record<string, string>) => void;
  details: string;
  onDetailsChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const StepQuestions: React.FC<Props> = ({
  scenario,
  answers,
  onAnswersChange,
  details,
  onDetailsChange,
  onBack,
  onSubmit,
  canSubmit
}) => {
  const questionSetKey = getQuestionSetKey(scenario);
  const dimensions = DIMENSIONS_MAP[questionSetKey];

  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / dimensions.length) * 100;
  const remainingCount = dimensions.length - completedCount;

  const dimensionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<HTMLDivElement>(null);

  // 进入步骤2时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOptionSelect = (dimId: string, optionLabel: string, index: number) => {
    const newAnswers = { ...answers, [dimId]: optionLabel };
    onAnswersChange(newAnswers);

    // 自动滚动到下一题或补充细节
    if (index < dimensions.length - 1) {
      setTimeout(() => {
        dimensionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* 步骤标签 */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-[#F2C94C]/10 text-[#F2C94C] text-xs font-bold rounded-lg">步骤 2 / 3</span>
        <span className="text-sm font-bold text-slate-900">回答调研题目</span>
        <span className="text-xs text-slate-400">基于您的场景「{scenario.length > 20 ? scenario.slice(0, 20) + '...' : scenario}」匹配题目</span>
      </div>

      {/* 诊断进度条 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-900">答题进度</span>
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

      <div className="flex gap-6">
        {/* 左侧主内容区 */}
        <div className="flex-1 space-y-4">
          {/* 题目卡片 */}
          {dimensions.map((dim, index) => {
            const isCompleted = answers[dim.id] !== undefined;

            return (
              <motion.div
                key={dim.id}
                ref={(el: HTMLDivElement | null) => { dimensionRefs.current[index] = el; }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-5 rounded-xl border transition-all duration-300 ${
                  isCompleted ? 'border-[#F2C94C]/30 bg-white' : 'border-slate-200 bg-white'
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
                        answers[dim.id] === option.label
                          ? 'border-[#F2C94C] bg-[#F2C94C]/5'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className={`font-bold block mb-1 ${
                            answers[dim.id] === option.label ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {option.label}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {option.desc}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                          answers[dim.id] === option.label ? 'border-[#F2C94C] bg-[#F2C94C]' : 'border-slate-200'
                        }`}>
                          {answers[dim.id] === option.label && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* 补充细节 */}
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl border border-slate-200 bg-white"
          >
            <div className="mb-3">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                请再补充一些您团队针对该管理痛点的细节情况？
              </h3>
              <p className="text-slate-500 text-xs">
                还有哪些只有你知道的现场细节？（选填）
              </p>
            </div>

            <textarea
              value={details}
              onChange={(e) => onDetailsChange(e.target.value)}
              placeholder="例如：团队目前士气低落，连续三个月未达成目标，上周有两位核心成员提出了离职意向..."
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 outline-none focus:border-[#F2C94C] focus:ring-2 focus:ring-[#F2C94C]/20 transition-all resize-none placeholder:text-slate-400"
            />
          </motion.div>

          {/* 占位空间，防止被固定按钮遮挡 */}
          <div className="h-24"></div>
        </div>

        {/* 右侧边栏 - 进度和提示 */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="sticky top-4 space-y-4">
            {/* 答题进度 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-3 text-sm">答题进度</h4>
              <div className="space-y-2">
                {dimensions.map((dim, idx) => {
                  const isCompleted = answers[dim.id] !== undefined;
                  return (
                    <div
                      key={dim.id}
                      onClick={() => {
                        dimensionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                        isCompleted
                          ? 'bg-[#F2C94C]/10 border-[#F2C94C]/30'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        isCompleted ? 'bg-[#F2C94C] text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs truncate text-slate-600">{dim.title}</span>
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

            {/* 返回修改场景按钮 */}
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回修改场景
            </button>
          </div>
        </div>
      </div>

      {/* 底部固定提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 px-6 py-4 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="hidden md:flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回修改场景
            </button>
            <div className="text-sm text-slate-500">
              {remainingCount > 0 ? (
                <span>还剩 <span className="font-bold text-[#F2C94C]">{remainingCount}</span> 题未完成</span>
              ) : (
                <span className="text-green-600 font-medium">✓ 所有题目已完成</span>
              )}
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              canSubmit
                ? 'bg-[#F2C94C] text-white shadow-md hover:bg-[#E5B73B] hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canSubmit ? (
              <>
                开始 AI 诊断
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
