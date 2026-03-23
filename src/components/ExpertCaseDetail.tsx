import React, { useState } from 'react';
import { ExpertCase } from '../types';
import { Award, ChevronLeft, Activity, Users, Coins } from 'lucide-react';

interface ExpertCaseDetailProps {
  expertCase: ExpertCase;
  onClose: () => void;
  onBookExpert?: (expertId: string) => void;
}

export const ExpertCaseDetail: React.FC<ExpertCaseDetailProps> = ({ expertCase, onClose, onBookExpert }) => {
  const [showBooking, setShowBooking] = useState(false);

  const handleConfirmBooking = () => {
    if (onBookExpert) {
      onBookExpert(expertCase.expertProfile.id);
    } else {
      alert('预约成功！积分已扣除。');
    }
    setShowBooking(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#F4F7F9] overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#1B3C59]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1B3C59]">{expertCase.title}</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">专家实战案例库</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-[#F2C94C]/10 rounded-full border border-[#F2C94C]/20">
          <Award className="w-4 h-4 text-[#F2C94C]" />
          <span className="text-xs font-bold text-[#F2C94C]">深度复盘案例</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-[#1B3C59]">
                <div className="w-1 h-6 bg-[#F2C94C] rounded-full"></div>
                <h2 className="text-2xl font-bold">案例背景与核心挑战</h2>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 leading-relaxed text-[#2C3E50] space-y-4">
                <p className="text-lg font-medium text-[#1B3C59]/80 italic border-l-4 border-gray-200 pl-6 py-2">
                  “{expertCase.background || '当时正处于业务的关键转型期，团队面临着前所未有的压力...'}”
                </p>
                <div className="text-base whitespace-pre-wrap">
                  {expertCase.content}
                </div>
                <div className="mt-8 p-6 bg-[#EB5757]/5 rounded-3xl border border-[#EB5757]/10">
                  <div className="text-xs font-bold text-[#EB5757] uppercase tracking-widest mb-4 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    管理深水区挑战
                  </div>
                  <div className="text-sm text-[#EB5757] font-bold leading-relaxed">
                    {expertCase.difficulty || '如何在保持高压交付的同时，不损耗核心人才的积极性？'}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-[#1B3C59]">
                <div className="w-1 h-6 bg-[#F2C94C] rounded-full"></div>
                <h2 className="text-2xl font-bold">专家复盘：手术刀式拆解</h2>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-3xl bg-[#1B3C59]/5 flex items-center justify-center text-[#1B3C59] font-black text-xl flex-shrink-0 group-hover:bg-[#F2C94C] group-hover:text-white transition-colors">
                    01
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#1B3C59]">核心洞察与实战心得</h3>
                    <p className="text-[#2C3E50] leading-relaxed whitespace-pre-wrap">{expertCase.expertInsight || '核心洞察：执行力差往往不是态度问题，而是目标拆解与反馈机制的断层。'}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-12 border-t border-gray-200">
              <div className="bg-[#1B3C59] rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C94C]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">觉得意犹未尽？</h3>
                  <p className="text-white/60">直接与该案例背后的实战专家进行深度 1V1 连线，拆解您的具体难题</p>
                </div>
                <button 
                  onClick={() => setShowBooking(true)}
                  className="relative z-10 px-8 py-4 bg-[#F2C94C] hover:bg-[#F2C94C]/90 text-[#1B3C59] font-black rounded-3xl shadow-xl shadow-[#F2C94C]/20 transition-all active:scale-95 flex items-center space-x-3 whitespace-nowrap"
                >
                  <Users className="w-6 h-6" />
                  <span>与该专家深度聊一聊</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#1B3C59] to-blue-900 relative">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
                <div className="px-8 pb-8 -mt-16 relative">
                  <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden mb-6 mx-auto bg-gray-100">
                    <img 
                      src={expertCase.expertProfile.avatar} 
                      alt={expertCase.expertProfile.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center space-y-2 mb-8">
                    <h3 className="text-2xl font-black text-[#1B3C59]">{expertCase.expertProfile.name}</h3>
                    <p className="text-[#F2C94C] font-bold text-sm uppercase tracking-widest">{expertCase.expertProfile.title}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">核心履历</div>
                      <ul className="space-y-2">
                        {expertCase.expertProfile.resume.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <span className="text-[#F2C94C] mr-2 mt-0.5 flex-shrink-0">▸</span>
                            <span className="text-[#2C3E50]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xl font-black text-[#1B3C59]">120+</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">咨询案例</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#1B3C59]">98%</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">好评率</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 z-[100] bg-[#1B3C59]/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 animate-[scaleIn_0.3s_ease-out]">
            <div className="w-16 h-16 bg-[#F2C94C]/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <Coins className="w-8 h-8 text-[#F2C94C]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B3C59] text-center mb-2">确认预约深度咨询？</h3>
            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              本次预约将消耗 <span className="text-[#1B3C59] font-bold">500 战术积分</span>。AI 管理能力提升助手将在 24 小时内为您协调专家档期。
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-[#1B3C59] text-white font-bold rounded-2xl hover:bg-blue-900 transition-colors shadow-lg shadow-[#1B3C59]/20"
              >
                确认消耗 500 积分预约
              </button>
              <button 
                onClick={() => setShowBooking(false)}
                className="w-full py-4 text-gray-400 font-bold hover:text-[#1B3C59] transition-colors"
              >
                我再想想
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
