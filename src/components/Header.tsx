import React from 'react';
import { AppView, Topic, ProfileContext } from '../types';
import { ChevronRight, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  view: AppView;
  setView: (view: AppView) => void;
  selectedTopic: Topic | null;
  setSelectedTopic: (topic: Topic | null) => void;
  context: ProfileContext;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, selectedTopic, setSelectedTopic, context, toggleSidebar }) => {
  const handleRootClick = () => {
    setSelectedTopic(null);
    setView('home');
  };

  const handleModuleClick = () => {
    setSelectedTopic(null);
    if (view === 'topic-detail') setView('home');
    if (view === 'case-detail') setView('home');
  };

  return (
    <div className="flex flex-col flex-shrink-0 z-30">
      <header className="bg-white border-b border-gray-100 h-14 flex items-center px-8 justify-between">
        <div className="flex items-center text-xs font-bold text-gray-400">
          <button onClick={toggleSidebar} className="text-[#0A0F1D] mr-4 hover:text-[#F2C94C] transition-colors"><Menu className="w-5 h-5" /></button>
          
          <button onClick={handleRootClick} className="hover:text-[#F2C94C] transition-colors cursor-pointer">AI 管理能力提升助手</button>
          
          <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
          
          <button 
            onClick={handleModuleClick}
            className={`transition-colors ${selectedTopic ? 'hover:text-[#F2C94C] cursor-pointer' : 'text-[#0A0F1D]'}`}
          >
            {view === 'home' || view === 'topic-detail' ? '问一问' : view === 'practice' ? '练一练' : view === 'diagnose-engine' ? '聊一聊' : '历史记录'}
          </button>

          {selectedTopic && (
            <>
              <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
              <span className="text-[#F2C94C] font-black">{selectedTopic.title}</span>
            </>
          )}
        </div>
        <button className="p-2 text-gray-300 hover:text-[#0A0F1D]"><Settings className="w-5 h-5" /></button>
      </header>

    </div>
  );
};
