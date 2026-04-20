import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  scenario: string;
  onRestart: () => void;
}

export const StepResult: React.FC<Props> = ({ scenario, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24">
      {/* 加载动画 */}
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-[#F2C94C]/20 rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-[#F2C94C] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#F2C94C]" />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3 text-center">
        AI 正在深度研判您的管理困境...
      </h2>
      <p className="text-sm text-slate-500 text-center max-w-md mb-2">
        基于场景「{scenario.length > 30 ? scenario.slice(0, 30) + '...' : scenario}」
      </p>
      <p className="text-sm text-slate-400 text-center">
        正在生成个性化诊断报告与行动建议，请稍候
      </p>

      {/* 提示卡片 */}
      <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md w-full mx-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#F2C94C]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">诊断完成后您可以获得</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 核心问题根因分析</li>
              <li>• 定制化行动建议与话术脚本</li>
              <li>• 管理红线预警与避坑指南</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 取消/重新开始 */}
      <button
        onClick={onRestart}
        className="mt-8 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        取消并重新填写
      </button>
    </div>
  );
};
