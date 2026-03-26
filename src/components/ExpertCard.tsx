import React from 'react';
import { Expert } from '../types';
import { Video, FileText, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpertCardProps {
  expert: Expert;
  topicId: string;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, topicId }) => {
  const navigate = useNavigate();
  
  // Mock case ID for now, in a real app this would come from the expert's data
  const caseId = 'c1'; 

  const handleNavigate = (mediaType?: 'video' | 'audio' | 'text') => {
    const path = `/expert/${expert.id}/case/${caseId}${mediaType ? `?type=${mediaType}` : ''}`;
    navigate(path, { state: { topicId } });
  };

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-5 group hover:border-[#F2C94C]/30">
      {/* Left: Avatar - 80px per PRD */}
      <div 
        className="flex-shrink-0 cursor-pointer"
        onClick={() => handleNavigate()}
      >
        <img 
          src={expert.avatar} 
          className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-all" 
          alt={expert.name} 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Middle: Info - BG/岗位/姓名 */}
      <div className="flex-grow min-w-0">
        <div className="text-[10px] font-bold text-[#F2C94C] uppercase tracking-wider mb-0.5 truncate">
          {expert.resume?.[0] || '事业部'}
        </div>
        <div className="text-xs text-slate-400 font-bold mb-1 truncate">
          {expert.title}
        </div>
        <div className="text-base font-black text-slate-900 truncate">
          {expert.name}
        </div>
      </div>

      {/* Right: Triple Media Icons (Video/Audio/Text) */}
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleNavigate('video'); }}
          className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
          title="视频播放"
        >
          <Video className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNavigate('audio'); }}
          className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
          title="音频听取"
        >
          <Headphones className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNavigate('text'); }}
          className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
          title="图文阅读"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
