import React from 'react';
import { ProfileContext } from '../types';
import { Activity, Users, Target, Shield } from 'lucide-react';

interface ContextPanelProps {
  context: ProfileContext;
  onChange: (context: ProfileContext) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ context, onChange }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-[#F2C94C]/20 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] group hover:border-[#F2C94C]/40 transition-all duration-300">
      <h3 className="text-xs font-black text-[#2C3E50] mb-5 flex items-center uppercase tracking-[0.2em]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2C94C] mr-2.5 shadow-[0_0_8px_rgba(242,201,76,0.5)]"></span>
        三维预诊数据
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between group/item">
          <div className="flex items-center text-[11px] font-bold text-[#2C3E50]/50 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 mr-2 text-[#2C3E50]/30 group-hover/item:text-[#F2C94C] transition-colors" />
            业务阶段
          </div>
          <span className="text-xs font-black text-[#2C3E50]">{context.businessStage}</span>
        </div>
        <div className="flex items-center justify-between group/item">
          <div className="flex items-center text-[11px] font-bold text-[#2C3E50]/50 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 mr-2 text-[#2C3E50]/30 group-hover/item:text-[#F2C94C] transition-colors" />
            团队状态
          </div>
          <span className="text-xs font-black text-[#EB5757]">{context.teamStatus}</span>
        </div>
        <div className="flex items-center justify-between group/item">
          <div className="flex items-center text-[11px] font-bold text-[#2C3E50]/50 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 mr-2 text-[#2C3E50]/30 group-hover/item:text-[#F2C94C] transition-colors" />
            领导风格
          </div>
          <span className="text-xs font-black text-[#2C3E50]">{context.leadershipStyle}</span>
        </div>
        <div className="pt-4 border-t border-black/5 flex items-center justify-between group/item">
          <div className="flex items-center text-[11px] font-bold text-[#2C3E50]/50 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 mr-2 text-[#2C3E50]/30 group-hover/item:text-[#F2C94C] transition-colors" />
            管理模式
          </div>
          <span className="text-xs font-black text-[#F2C94C]">{context.managementMode}</span>
        </div>
      </div>
      <div className="mt-5 p-3 bg-black/[0.02] rounded-xl text-[9px] text-gray-400 font-medium leading-relaxed">
        * 数据已根据您的“聊一聊”结果及偏好设置实时校准
      </div>
    </div>
  );
};
