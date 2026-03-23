import React from 'react';
import { FileText, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  pendingQuery: string;
  onSelectStandard: () => void;
  onSelectDeep: () => void;
}

export const DiagnoseConsent: React.FC<Props> = ({ pendingQuery, onSelectStandard, onSelectDeep }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-[fadeIn_0.5s]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F2C94C]/10 border border-[#F2C94C]/30 rounded-full text-[#F2C94C] text-[10px] font-black uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> 实战研判中心
        </div>
        <h2 className="text-3xl font-black text-[#0A0F1D] tracking-tight">
          针对您提出的问题 <span className="text-[#F2C94C] bg-[#0A0F1D] px-3 py-1 rounded-lg inline-block mx-1">【{pendingQuery}】</span>
        </h2>
        <div className="space-y-2 max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm leading-relaxed">
            为了提供更具实战价值的建议，AI 管理能力提升助手建议先进行一次针对性研判。聊一聊能帮助我们更精准地识别组织痛点。
          </p>
          <p className="text-[#F2C94C] text-[11px] font-bold bg-[#0A0F1D] px-4 py-2 rounded-full inline-block">
            【问一问】提供通用锦囊，【聊一聊】针对您的具体“人、事、时、空”，发起定制化起底与决策辅助。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧：通用方案 */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card !bg-white border border-gray-100 p-10 flex flex-col items-center text-center space-y-6 group cursor-pointer hover:border-gray-300 transition-all"
          onClick={onSelectStandard}
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#0A0F1D]">查看标准管理建议</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            基于通用管理模型，快速获取针对该类问题的标准应对策略与话术。
          </p>
          <div className="pt-4 w-full">
            <button className="w-full py-4 border-2 border-[#0A0F1D] rounded-xl text-[#0A0F1D] font-black text-sm flex items-center justify-center gap-2 group-hover:bg-[#0A0F1D] group-hover:text-white transition-all">
              直接查看结果 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* 右侧：聊一聊 */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card !bg-[#0A0F1D] border border-white/10 p-10 flex flex-col items-center text-center space-y-6 group cursor-pointer relative overflow-hidden"
          onClick={onSelectDeep}
        >
          {/* 流光效果 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F2C94C]/0 via-[#F2C94C]/5 to-[#F2C94C]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-[#F2C94C] flex items-center justify-center text-[#0A0F1D] shadow-[0_0_20px_rgba(242,201,76,0.4)]">
            <Zap className="w-8 h-8 fill-[#0A0F1D]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">开启多维战术研判</h3>
          </div>
          <p className="text-white/40 text-sm leading-relaxed">
            基于专家模型，通过 3-4 个关键维度透视您的具体组织环境，提供定制化建议。
          </p>
          <div className="pt-4 w-full space-y-4">
            <button className="w-full py-4 bg-[#F2C94C] text-[#0A0F1D] rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#F2C94C]/90 transition-all shadow-xl">
              进入实战研判 <Zap className="w-4 h-4" />
            </button>
            <p className="text-[10px] font-bold text-[#F2C94C]/60 italic">
              * 已有 82% 的管理者通过研判获得了破局思路
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
