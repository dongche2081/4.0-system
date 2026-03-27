import React from 'react';
import { AppView, ProfileContext, UserStats } from '../types';
import { BookOpen, Target, Activity, History, LogOut, X, Users, Sparkles } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: AppView) => void;
  context: ProfileContext;
  userStats: UserStats;
  showProfilePopup: boolean;
  setShowProfilePopup: (show: boolean) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsBriefingMode: (mode: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView, onNavigate, context, userStats, showProfilePopup, setShowProfilePopup, onLogout, isOpen, setIsOpen, isCollapsed, setIsCollapsed, setIsBriefingMode
}) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'home', icon: BookOpen, label: '学一学', subLabel: '学习标杆实践', path: '/' },
    { id: 'practice', icon: Target, label: '练一练', subLabel: '情景模拟练习', path: '/practice' },
    { id: 'diagnose-start', icon: Activity, label: '聊一聊', subLabel: '深度智能诊断', path: '/diagnose-start' },
    { id: 'history', icon: History, label: '历史记录', subLabel: '指挥官档案库', path: '/history' },
  ];

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'} bg-white text-slate-900 flex flex-col border-r border-slate-200 overflow-hidden`}>
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-100 h-16`}>
        <div className={`flex items-center cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`} onClick={() => {
          navigate('/');
          setIsBriefingMode(false);
          onNavigate('home');
        }}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#F2C94C] to-[#E5A73B] rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm border border-[#F2C94C]/30">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <path d="M9 21h6"/>
              <circle cx="12" cy="9" r="2"/>
              <path d="M12 2v2"/>
              <path d="M5 9H3"/>
              <path d="M21 9h-2"/>
            </svg>
          </div>
          {!isCollapsed && <h1 className="text-lg font-bold tracking-wider whitespace-nowrap text-slate-900">AI 管理能力提升助手</h1>}
        </div>
        {!isCollapsed && <button onClick={() => setIsOpen(false)} className="md:hidden"><X className="w-6 h-6 text-slate-400" /></button>}
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { 
              navigate(item.path);
              setIsBriefingMode(false);
              onNavigate(item.id as AppView); 
              setIsOpen(false); 
            }}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeView === item.id ? 'bg-[#F2C94C] text-white font-bold shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && (
              <div className="ml-4 text-left overflow-hidden">
                <div className="text-sm whitespace-nowrap">{item.label}</div>
                <div className="text-xs text-slate-500 font-normal whitespace-nowrap">{item.subLabel}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-100">
        <div className={`flex items-center p-2 rounded-xl bg-slate-50 border border-slate-100 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-[#F2C94C]/10 flex-shrink-0 flex items-center justify-center border border-[#F2C94C]/20">
            <Users className="w-5 h-5 text-[#F2C94C]" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-xs font-bold whitespace-nowrap text-slate-900">{userStats.points} 积分</div>
              <div className="text-[10px] text-slate-400 whitespace-nowrap">战地观察员</div>
            </div>
          )}
          {!isCollapsed && <button onClick={onLogout} className="ml-auto p-2 text-slate-400 hover:text-red-500"><LogOut className="w-4 h-4" /></button>}
        </div>
      </div>
    </aside>
  );
};
