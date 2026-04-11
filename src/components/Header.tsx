import React from 'react';
import { AppView, Topic, ProfileContext } from '../types';
import { ChevronRight, Settings, Menu, Home } from 'lucide-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  
  // 检测当前路由
  const isExpertCaseDetail = location.pathname.includes('/expert/') && location.pathname.includes('/case/');
  const isExpertProfile = location.pathname.includes('/expert/') && !location.pathname.includes('/case/');
  const isTopicDetail = location.pathname.includes('/topic/');
  const isDiagnosticResult = location.pathname.includes('/topic/diagnostic-result');
  const isHome = location.pathname === '/';
  const isPractice = location.pathname === '/practice';
  const isDiagnoseStart = location.pathname === '/diagnose-start';
  const isDiagnose = location.pathname === '/diagnose-engine' || isDiagnoseStart;
  const isHistory = location.pathname === '/history';
  const isProfile = location.pathname === '/profile';
  const isDiagnoseResultPage = location.pathname === '/diagnose-result';
  const isDiagnoseEngine = location.pathname === '/diagnose-engine';
  
  // 判断是否为首页（不显示面包屑）
  const isHomePage = isHome || isPractice;
  
  // 从路由解析专家名称和案例标题
  const pathParts = location.pathname.split('/');
  const expertId = params.expertId || pathParts[2];
  const caseId = params.caseId || pathParts[4];
  
  // 获取专家信息
  const expert = expertId ? EXPERTS.find(e => e.id === expertId) : null;
  // 获取案例信息
  const expertCase = caseId ? EXPERT_CASES[caseId] : null;

  // 从 URL 参数获取来源信息
  const source = searchParams.get('source');
  const topicName = searchParams.get('topicName');

  const handleRootClick = () => {
    setSelectedTopic(null);
    setView('home');
    navigate('/');
  };
  
  // 返回专家主页（从案例详情）
  const handleBackToExpert = () => {
    if (expertId) {
      navigate(`/expert/${expertId}`);
    } else {
      navigate('/');
    }
  };

  // 返回话题页（首页）
  const handleBackToTopic = () => {
    setView('home');
    navigate('/');
  };

  return (
    <div className="flex flex-col flex-shrink-0 z-30">
      <header className="bg-white border-b border-gray-100 h-14 flex items-center px-8 justify-between sticky top-0">
        <div className="flex items-center text-sm text-gray-500">
          <button onClick={toggleSidebar} className="text-gray-400 mr-4 hover:text-[#F2C94C] transition-colors"><Menu className="w-5 h-5" /></button>
          
          {/* 首页不显示面包屑 */}
          {!isHomePage && (
            <>
              {/* 首页根节点 */}
              <button
                onClick={handleRootClick}
                className="flex items-center gap-1 hover:text-[#F2C94C] transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>首页</span>
              </button>

              {/* 专家案例详情页面的面包屑 */}
              {isExpertCaseDetail && (
                <>
                  {/* 从话题进入：首页 > 话题详情 > 案例详情 */}
                  {source === 'topic' && (
                    <>
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                      <button
                        onClick={handleBackToTopic}
                        className="hover:text-[#F2C94C] transition-colors"
                      >
                        话题详情
                      </button>
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                      <span className="text-[#0A0F1D] font-medium">案例详情</span>
                    </>
                  )}
                  
                  {/* 从专家进入：首页 > 专家主页 > 案例详情 */}
                  {source === 'expert' && expert && (
                    <>
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                      <button
                        onClick={handleBackToExpert}
                        className="hover:text-[#F2C94C] transition-colors"
                      >
                        专家主页
                      </button>
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                      <span className="text-[#0A0F1D] font-medium">案例详情</span>
                    </>
                  )}
                  
                  {/* 直接访问或其他情况：首页 > 案例详情 */}
                  {source !== 'topic' && source !== 'expert' && (
                    <>
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                      <span className="text-[#0A0F1D] font-medium">案例详情</span>
                    </>
                  )}
                </>
              )}

              {/* 专家主页面包屑：首页 > 专家主页（固定） */}
              {isExpertProfile && expert && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">专家主页</span>
                </>
              )}

              {/* 话题详情页面的面包屑：首页 > 话题详情（固定） */}
              {isTopicDetail && selectedTopic && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">话题详情</span>
                </>
              )}

              {/* 深度诊断结果页面的面包屑：首页 > 深度诊断结果 */}
              {isDiagnoseResultPage && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">深度诊断结果</span>
                </>
              )}

              {/* 诊断引擎页面的面包屑：首页 > 深度诊断 > 回答调研题目 */}
              {isDiagnoseEngine && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-gray-400">深度诊断</span>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">回答调研题目</span>
                </>
              )}

              {/* 历史记录页面的面包屑：首页 > 历史记录 */}
              {isHistory && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">历史记录</span>
                </>
              )}

              {/* 个人中心页面的面包屑：首页 > 个人中心 */}
              {isProfile && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                  <span className="text-[#0A0F1D] font-medium">个人中心</span>
                </>
              )}
            </>
          )}
        </div>
        <button className="p-2 text-gray-300 hover:text-[#0A0F1D]"><Settings className="w-5 h-5" /></button>
      </header>

    </div>
  );
};
