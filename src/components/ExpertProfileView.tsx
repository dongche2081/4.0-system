import React, { useState } from 'react';
import { Expert } from '../types';
import { ChevronLeft, MessageSquare, Video, Headphones, FileText, Check, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ExpertProfileViewProps {
  expert: Expert;
  onBack: () => void;
  onBook: () => void;
  onViewCase: (caseId: string) => void;
}

// 模拟话题数据
const EXPERT_TOPICS = [
  { id: '1', title: '核心员工离职预警与挽留', hasVideo: true, hasAudio: true, hasDoc: true },
  { id: '2', title: '如何拆解快速扩张期的团队目标', hasVideo: true, hasAudio: false, hasDoc: true },
  { id: '3', title: '执行力破局：从推一下动一下到自驱动', hasVideo: false, hasAudio: true, hasDoc: true },
  { id: '4', title: '战略解码：如何把公司目标穿透到个人', hasVideo: true, hasAudio: true, hasDoc: false },
];

export const ExpertProfileView: React.FC<ExpertProfileViewProps> = ({
  expert,
  onBack,
  onBook,
  onViewCase
}) => {
  const navigate = useNavigate();
  
  // Booking modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('人才留存');
  const [selectedUrgency, setSelectedUrgency] = useState('常规复盘');
  const [selectedMethod, setSelectedMethod] = useState('语音电话');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userPoints, setUserPoints] = useState(1200); // 模拟用户积分

  const handleConfirmBooking = () => {
    setShowSuccess(true);
    // 2秒后关闭modal并扣减积分
    setTimeout(() => {
      setUserPoints(prev => prev - 300);
      setIsModalOpen(false);
      setShowSuccess(false);
      onBook();
    }, 2000);
  };

  const handleTopicClick = (topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  // 计算获赞与收藏总数
  const totalLikesAndBookmarks = expert.stats.likes + expert.stats.bookmarks;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed top-8 left-8 z-50 p-2 bg-white hover:bg-slate-50 rounded-full transition-colors border border-slate-200 shadow-sm"
      >
        <ChevronLeft className="w-6 h-6 text-slate-600" />
      </button>

      {/* Phase 1: 顶部核心信息区 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-12 py-12">
          <div className="flex items-center gap-8">
            {/* 纯圆形头像 */}
            <img 
              src={expert.avatar} 
              alt={expert.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#F2C94C] shadow-xl"
              referrerPolicy="no-referrer"
            />
            
            <div className="flex-1">
              {/* 真实姓名 */}
              <h1 className="text-4xl font-bold mb-3 tracking-tight text-slate-900">{expert.name}</h1>
              {/* 主Title */}
              <p className="text-lg text-[#F2C94C] font-medium mb-2">{expert.title}</p>
              {/* 常驻地点 */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>常驻地点：北京</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页面主体内容 */}
      <div className="max-w-5xl mx-auto px-12 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* 左侧主要内容区 */}
          <div className="col-span-2 space-y-10">
            
            {/* Phase 2: 实战履历 (已上移，删除管理内核后填补空白) */}
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                实战履历
              </h2>
              <div className="text-lg leading-loose text-slate-600 font-light space-y-6">
                {expert.bio.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* Phase 3: 专家自述 */}
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">专家自述</h2>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-700 leading-relaxed">
                  坚持"以终为始"的管理哲学，注重在组织变革中平衡人本主义与绩效导向。认为管理的本质不是控制，而是释放每个人的潜能。
                </p>
              </div>
            </section>

            {/* Phase 3: 详细职业履历 */}
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">详细职业履历</h2>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-700 leading-relaxed">
                  华为技术有限公司 | 组织发展总监 (15年) | 负责BG级战略解码与绩效体系重构。主导过3次千人级组织变革，沉淀出一套完整的"目标穿透方法论"。
                </p>
              </div>
            </section>

            {/* Phase 3: 过往作品集 (话题列表) */}
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">过往作品集</h2>
              <div className="space-y-3">
                {EXPERT_TOPICS.map(topic => (
                  <div 
                    key={topic.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#F2C94C]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      {/* 话题标题 - 点击跳转 */}
                      <div 
                        onClick={() => handleTopicClick(topic.id)}
                        className="flex-1"
                      >
                        <h3 className="text-base font-medium text-slate-800 group-hover:text-[#F2C94C] transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                      
                      {/* 三栖媒介图标 */}
                      <div className="flex items-center gap-2">
                        {topic.hasVideo && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=video`); }}
                            className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                            title="视频"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        {topic.hasAudio && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=audio`); }}
                            className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                            title="音频"
                          >
                            <Headphones className="w-4 h-4" />
                          </button>
                        )}
                        {topic.hasDoc && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=text`); }}
                            className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                            title="图文"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Phase 3: 右侧数据看板 */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm sticky top-8">
              <h3 className="text-sm font-bold text-slate-900 mb-6">专家数据</h3>
              
              <div className="space-y-6">
                {/* 贡献次数 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">贡献次数</span>
                  <span className="text-2xl font-bold text-[#F2C94C]">{expert.stats.prescriptions} 次</span>
                </div>
                
                {/* 获赞与收藏总数 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">获赞与收藏</span>
                  <span className="text-2xl font-bold text-[#F2C94C]">{totalLikesAndBookmarks.toLocaleString()} 次</span>
                </div>
                
                {/* 专家当前总积分 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500">专家积分</span>
                  <span className="text-2xl font-bold text-[#F2C94C]">{expert.points.toLocaleString()} 分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 4: 常驻入口 - 悬浮按钮 */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-4 bg-[#F2C94C] text-white rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <MessageSquare className="w-5 h-5" />
          预约该参赞面谈 (300 积分/次)
        </button>
      </div>

      {/* Phase 4: 极简预约 Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!showSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <img 
                      src={expert.avatar} 
                      alt={expert.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#F2C94C]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-lg font-bold text-slate-900">预约 {expert.name}</div>
                      <div className="text-sm text-slate-400">300 积分/次</div>
                    </div>
                  </div>

                  {/* 连线主题 */}
                  <div className="space-y-3 mb-6">
                    <div className="text-sm font-bold text-slate-900">连线主题</div>
                    <div className="flex flex-wrap gap-2">
                      {['人才留存', '执行力破局', '战略解码'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                            selectedTheme === theme 
                              ? 'bg-[#F2C94C] text-white' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 紧急程度 */}
                  <div className="space-y-3 mb-6">
                    <div className="text-sm font-bold text-slate-900">紧急程度</div>
                    <div className="flex flex-wrap gap-2">
                      {['常规复盘', '火速支援', '战区特急'].map(urgency => (
                        <button
                          key={urgency}
                          onClick={() => setSelectedUrgency(urgency)}
                          className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                            selectedUrgency === urgency 
                              ? 'bg-[#F2C94C] text-white' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {urgency}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 连线方式 */}
                  <div className="space-y-3 mb-8">
                    <div className="text-sm font-bold text-slate-900">连线方式</div>
                    <div className="flex gap-2">
                      {[
                        { id: '语音电话', icon: Phone, label: '语音电话 (1对1通话)' },
                        { id: '线下约见', icon: MapPin, label: '线下约见' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${
                            selectedMethod === method.id 
                              ? 'bg-[#F2C94C] text-white' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <method.icon className="w-4 h-4" />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 扣费提示 */}
                  <div className="p-4 bg-slate-50 rounded-xl mb-6">
                    <p className="text-sm text-slate-600">
                      本次预约将消耗您的 <span className="font-bold text-[#F2C94C]">300 战术积分</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      当前余额：{userPoints} 积分
                    </p>
                  </div>

                  {/* 确认按钮 */}
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-4 bg-[#F2C94C] text-white rounded-2xl font-bold hover:bg-[#e5b73c] transition-colors"
                  >
                    确认预约
                  </button>
                </>
              ) : (
                /* 成功状态 */
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">指令已下达</h3>
                  <p className="text-sm text-slate-400">预约成功，专家将尽快与您联系</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
