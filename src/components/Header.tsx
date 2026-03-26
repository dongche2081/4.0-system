import React from 'react';
import { AppView, Topic, ProfileContext } from '../types';
import { ChevronRight, Settings, Menu } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { EXPERTS, EXPERT_CASES } from '../data';

interface HeaderProps {
  view: AppView;
  setView: (view: AppView) => void;
  selectedTopic: Topic | null;
  setSelectedTopic: (topic: Topic | null) => void;
  context: ProfileContext;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, selectedTopic, setSelectedTopic, context, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ expertId?: string; caseId?: string }>();
  
  // 检测当前路由
  const isExpertCaseDetail = location.pathname.includes('/expert/') && location.pathname.includes('/case/');
  const isExpertProfile = location.pathname.includes('/expert/') && !location.pathname.includes('/case/');
  const isTopicDetail = location.pathname.includes('/topic/');
  const isHome = location.pathname === '/';
  const isPractice = location.pathname === '/practice';
  const isDiagnose = location.pathname === '/diagnose-engine';
  const isHistory = location.pathname === '/history';
  
  // 从路由解析专家名称和案例标题
  const pathParts = location.pathname.split('/');
  const expertId = params.expertId || pathParts[2];
  const caseId = params.caseId || pathParts[4];
  
  // 获取专家信息
  const expert = expertId ? EXPERTS.find(e => e.id === expertId) : null;
  // 获取案例信息
  const expertCase = caseId ? EXPERT_CASES[caseId] : null;

  const handleRootClick = () => {
    setSelectedTopic(null);
    setView('home');
    navigate('/');
  };

  // 点击模块名返回对应模块首页
  const handleModuleClick = () => {
    setSelectedTopic(null);
    if (isExpertCaseDetail || isExpertProfile) {
      // 专家实战模块返回首页（专家列表）
      navigate('/');
    } else if (isTopicDetail) {
      setView('home');
      navigate('/');
    } else {
      navigate('/');
    }
  };
  
  // 返回专家主页（从案例详情）
  const handleBackToExpert = () => {
    if (expertId) {
      navigate(`/expert/${expertId}`);
    } else {
      navigate('/');
    }
  };

  // 获取当前模块名称
  const getModuleName = () => {
    if (isExpertCaseDetail || isExpertProfile) return '专家实战';
    if (isHome || isTopicDetail) return '问一问';
    if (isPractice) return '练一练';
    if (isDiagnose) return '聊一聊';
    if (isHistory) return '历史记录';
    return '问一问';
  };

  return (
    <div className="flex flex-col flex-shrink-0 z-30">
      <header className="bg-white border-b border-gray-100 h-14 flex items-center px-8 justify-between sticky top-0">
        <div className="flex items-center text-xs font-bold text-gray-400">
          <button onClick={toggleSidebar} className="text-[#0A0F1D] mr-4 hover:text-[#F2C94C] transition-colors"><Menu className="w-5 h-5" /></button>
          
          {/* Logo - 点击返回首页 */}
          <button onClick={handleRootClick} className="hover:text-[#F2C94C] transition-colors cursor-pointer">AI 管理能力提升助手</button>
          
          <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
          
          {/* 模块导航 */}
          <button 
            onClick={handleModuleClick}
            className={`transition-colors ${(selectedTopic || isExpertCaseDetail) ? 'hover:text-[#F2C94C] cursor-pointer' : 'text-[#0A0F1D]'}`}
          >
            {getModuleName()}
          </button>

          {/* 专家案例详情页面的面包屑：专家实战 > 专家名 > 案例标题 */}
          {isExpertCaseDetail && expert && (
            <>
              <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
              <button 
                onClick={handleBackToExpert}
                className="hover:text-[#F2C94C] cursor-pointer transition-colors"
              >
                {expert.name}
              </button>
              {expertCase && (
                <>
                  <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
                  <span className="text-[#F2C94C] font-black truncate max-w-[300px]">{expertCase.title}</span>
                </>
              )}
            </>
          )}

          {/* 专家主页面包屑 */}
          {isExpertProfile && expert && (
            <>
              <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
              <span className="text-[#F2C94C] font-black truncate max-w-[300px]">{expert.name}</span>
            </>
          )}

          {/* 话题详情页面的面包屑 */}
          {isTopicDetail && selectedTopic && (
            <>
              <ChevronRight className="w-3 h-3 mx-2 opacity-30" />
              <span className="text-[#F2C94C] font-black truncate max-w-[300px]">{selectedTopic.title}</span>
            </>
          )}
        </div>
        <button className="p-2 text-gray-300 hover:text-[#0A0F1D]"><Settings className="w-5 h-5" /></button>
      </header>

    </div>
  );
};
