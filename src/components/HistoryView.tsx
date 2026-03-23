import React, { useState } from 'react';
import { HistoryItem, AppView, ExpertCase } from '../types';
import { BookOpen, Activity, Target, History as HistoryIcon, ChevronRight, RefreshCw, Award, Heart, Bookmark } from 'lucide-react';

interface Props {
  history: HistoryItem[];
  bookmarks: ExpertCase[];
  onReloadChat: (context: any) => void;
  onNavigate: (view: AppView, item: any) => void;
}

export const HistoryView: React.FC<Props> = ({ history, bookmarks, onReloadChat, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'practice' | 'chat' | 'mine' | 'favorites'>('ask');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-[#0A0F1D] flex items-center">
          <HistoryIcon className="w-6 h-6 mr-3 text-[#F2C94C]" /> 指挥官档案库
        </h2>
      </div>

      <div className="flex gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'ask', label: '问一问', icon: BookOpen },
          { id: 'practice', label: '练一练', icon: Target },
          { id: 'chat', label: '聊一聊', icon: Activity },
          { id: 'favorites', label: '我的收藏', icon: Heart },
          { id: 'mine', label: '我的贡献', icon: Award }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#F2C94C] text-[#0A0F1D]' : 'border-transparent text-gray-400'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {activeTab === 'ask' && (
          <div className="grid grid-cols-1 gap-4">
            {history.filter(h => !h.topicId).map(item => (
              <div key={item.id} onClick={() => onNavigate('home', item)} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#F2C94C] cursor-pointer transition-all flex justify-between items-center group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#0A0F1D]">问：{item.query}</h4>
                    {item.isDeepDiagnosis && (
                      <span className="px-2 py-0.5 bg-[#F2C94C]/20 text-[#F2C94C] text-[10px] font-black rounded uppercase tracking-widest border border-[#F2C94C]/30">
                        聊一聊
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F2C94C]" />
              </div>
            ))}
            {history.filter(h => !h.topicId).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无搜索记录</div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 gap-4">
            {history.filter(h => h.topicId).map(item => (
              <div key={item.id} onClick={() => onNavigate('topic-detail', item)} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#F2C94C] cursor-pointer transition-all flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-[#0A0F1D] mb-1">推演：{item.query}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F2C94C]" />
              </div>
            ))}
            {history.filter(h => h.topicId).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无推演记录</div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 gap-4">
            {history.filter(h => h.query.includes('聊一聊')).map((item, idx) => (
              <div key={item.id} className="glass-card !bg-white p-8 flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#F2C94C]"></div>
                    <h4 className="font-black text-[#0A0F1D]">战地画像快照 - {new Date(item.timestamp).toLocaleDateString()}</h4>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                    <span>规模: {item.context.span}人</span>
                    <span>压强: {item.context.pressure}级</span>
                    <span>阶段: {item.context.businessStage}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onReloadChat(item.context)} 
                  className="px-6 py-2 bg-[#0A0F1D] text-[#F2C94C] text-[10px] font-black rounded-full hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> 重载参数至表单
                </button>
              </div>
            ))}
            {history.filter(h => h.query.includes('聊一聊')).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无聊一聊记录</div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 gap-4">
            {bookmarks.map(item => (
              <div key={item.id} onClick={() => onNavigate('case-detail', item)} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#F2C94C] cursor-pointer transition-all flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#F2C94C]">
                    <Bookmark className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A0F1D] mb-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">专家：{item.expertName}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F2C94C]" />
              </div>
            ))}
            {bookmarks.length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">暂无收藏案例</div>
            )}
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="space-y-4">
            <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-2xl p-6 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F2C94C] uppercase tracking-widest mb-1">贡献总积分</div>
                <div className="text-3xl font-black text-[#0A0F1D]">+ 450</div>
              </div>
              <Award className="w-10 h-10 text-[#F2C94C] opacity-30" />
            </div>
            
            {[
              { topic: '核心骨干离职预警', content: '建议增加“职业发展二次锚定”面谈环节，在离职意向产生前进行深度沟通。', points: 200, date: '2026-03-10' },
              { topic: '绩效评价标准', content: '对于研发岗位，建议引入“技术影响力”作为加分项，平衡产出与长期价值。', points: 250, date: '2026-03-08' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-400">来自话题：{item.topic}</span>
                  <span className="text-xs font-bold text-green-600">已采纳：+{item.points} 积分</span>
                </div>
                <p className="text-sm text-gray-700 italic">“{item.content}”</p>
                <p className="text-[10px] text-gray-300 font-bold">{item.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
