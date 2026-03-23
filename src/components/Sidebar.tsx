import React from 'react';
import { AppView, ProfileContext, UserStats } from '../types';
import { BookOpen, Target, Activity, History, LogOut, X, Users, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  view: AppView;
  setView: (view: AppView) => void;
  context: ProfileContext;
  userStats: UserStats;
  showProfilePopup: boolean;
  setShowProfilePopup: (show: boolean) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view, setView, context, userStats, showProfilePopup, setShowProfilePopup, onLogout, isOpen, setIsOpen, isCollapsed, setIsCollapsed
}) => {
  const menuItems = [
    { id: 'home', icon: BookOpen, label: '学一学', desc: '内容聚合' },
    { id: 'practice', icon: Target, label: '练一练', desc: '兵棋推演' },
    { id: 'diagnose-start', icon: Activity, label: '聊一聊', desc: '实战研判' },
    { id: 'history', icon: History, label: '历史记录', desc: '指挥官档案库' },
  ];

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64 lg:w-72'} bg-white text-slate-900 flex flex-col border-r border-slate-200 overflow-hidden`}>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-100 h-14`}>
        <div className="flex items-center space-x-3 cursor-pointer overflow-hidden" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-[#F2C94C] rounded flex-shrink-0 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <h1 className="text-lg font-bold tracking-wider whitespace-nowrap text-slate-900">管理扫地僧</h1>}
        </div>
        {!isCollapsed && <button onClick={() => setIsOpen(false)} className="md:hidden"><X className="w-6 h-6 text-slate-400" /></button>}
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setView(item.id as AppView); setIsOpen(false); }}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${view === item.id ? 'bg-[#F2C94C] text-white font-bold shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {!isCollapsed && (
              <div className="ml-4 text-left overflow-hidden">
                <div className="text-sm whitespace-nowrap">{item.label}</div>
                <div className="text-[11px] uppercase opacity-70 whitespace-nowrap">{item.desc}</div>
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
