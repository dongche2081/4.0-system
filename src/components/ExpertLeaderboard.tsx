import React from 'react';
import { Expert } from '../types';
import { Award, Zap } from 'lucide-react';

export const ExpertLeaderboard: React.FC<{ experts: Expert[], onExpertClick: (e: Expert) => void }> = ({ experts, onExpertClick }) => {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 flex flex-col h-full overflow-hidden group hover:border-[#F2C94C]/40 hover:shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F2C94C]" /> 专家贡献排行榜
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {experts.map((expert, idx) => (
          <div 
            key={expert.id} 
            onClick={() => onExpertClick(expert)}
            className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all duration-300"
          >
            <div className="relative">
              <img src={expert.avatar} className="w-12 h-12 rounded-full border-2 border-slate-100 group-hover:border-[#F2C94C] transition-all duration-300" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F2C94C] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {idx + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate group-hover:text-[#F2C94C] transition-colors duration-300">{expert.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-[#F2C94C] flex items-center gap-1 group-hover:text-[#F2C94C] transition-colors duration-300"><Zap className="w-3 h-3 text-[#F2C94C]" /> {expert.points} 战力</span>
                <span className="text-[10px] text-slate-400">{expert.contentCount} 情报</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
