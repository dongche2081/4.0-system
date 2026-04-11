import React, { useState } from 'react';
import { Expert } from '../types';
import { ChevronLeft, MessageSquare, Video, Headphones, FileText, Check, Phone, MapPin, Star, X } from 'lucide-react';
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

// 模拟评价数据
const EXPERT_REVIEWS = [
  {
    id: '1',
    name: '张经理',
    title: '产品总监',
    rating: 5,
    content: '李老师的目标穿透方法论帮我们在3个月内将团队执行力提升了40%，非常实战的指导！'
  },
  {
    id: '2',
    name: '王总监',
    title: '技术VP',
    rating: 5,
    content: '不玩虚的，直接给可落地的方案。对于快速扩张期的团队管理很有启发。'
  }
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

  const [selectedMethod, setSelectedMethod] = useState('语音电话');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userPoints, setUserPoints] = useState(1200);
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const [showAllResume, setShowAllResume] = useState(false);

  const handleConfirmBooking = () => {
    setShowSuccess(true);
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

  // 擅长领域
  const expertiseAreas = expert.topics?.slice(0, 4) || ['组织变革', '绩效管理', '团队搭建', '战略解码'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50 text-slate-900 pb-32"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed top-8 left-8 z-50 p-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 主体内容区 */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* 卡片1: 顶部信息区 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-3">
          <div className="flex items-start gap-6">
            {/* 头像 */}
            <div 
              className="relative cursor-pointer group flex-shrink-0"
              onClick={() => setIsAvatarExpanded(true)}
            >
              <img 
                src={expert.avatar} 
                alt={expert.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 group-hover:border-[#F2C94C] transition-colors"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">查看</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{expert.name}</h1>
                  <p className="text-sm text-slate-500 mb-1">
                    {expert.department ? `${expert.department} · ${expert.position || expert.title}` : expert.title}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>北京</span>
                  </div>
                </div>
                
                {/* 数据展示 */}
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{expert.stats.prescriptions}</div>
                    <div className="text-xs text-slate-400">次贡献</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{totalLikesAndBookmarks.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">获赞</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#F2C94C]">{expert.points.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">专家积分</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 分割线 */}
          <div className="border-t border-slate-100 my-4"></div>
          
          {/* 擅长领域 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">擅长领域</h3>
            <div className="flex flex-wrap gap-4">
              {expertiseAreas.map((area, index) => (
                <span key={index} className="text-sm text-slate-600">{area}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 卡片2: 职业履历 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">职业履历</h2>
            <button 
              onClick={() => setShowAllResume(!showAllResume)}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showAllResume ? '[ 收起 ]' : '[ 展开 ]'}
            </button>
          </div>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-[#F2C94C] mb-4"></div>
          
          {/* 简介 */}
          <div className="mb-6">
            {expert.bio.split('\n').map((p, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed">{p}</p>
            ))}
          </div>

          {/* 详细履历 */}
          <div className="space-y-5">
            <div className="pl-4 border-l-2 border-slate-200">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-slate-900">华为技术有限公司</span>
                <span className="text-slate-400">|</span>
                <span className="text-sm text-slate-600">组织发展总监（15年）</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                负责BG级战略解码与绩效体系重构，主导过3次千人级组织变革，沉淀出一套完整的「目标穿透方法论」。
              </p>
            </div>

            {showAllResume && (
              <div className="pl-4 border-l-2 border-slate-200">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-slate-900">前阿里巴巴</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-sm text-slate-600">HRBP总监（8年）</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  负责集团人才发展体系建设，主导设计了管理干部培养体系，支撑业务从500人扩张到5000人。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 卡片3: 过往作品集 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">过往作品集（{EXPERT_TOPICS.length}）</h2>
            <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              [ 查看全部 ]
            </button>
          </div>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-[#F2C94C] mb-4"></div>
          
          <div className="space-y-0">
            {EXPERT_TOPICS.map((topic, index) => (
              <div 
                key={topic.id}
                className="py-3 border-b border-slate-50 last:border-b-0 group cursor-pointer"
                onClick={() => handleTopicClick(topic.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 text-xs w-5">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {topic.hasVideo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=video&from=expert`); }}
                        className="text-slate-300 hover:text-[#F2C94C] transition-colors"
                        title="视频"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                    {topic.hasAudio && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=audio&from=expert`); }}
                        className="text-slate-300 hover:text-[#F2C94C] transition-colors"
                        title="音频"
                      >
                        <Headphones className="w-4 h-4" />
                      </button>
                    )}
                    {topic.hasDoc && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/expert/${expert.id}/case/c1?type=text&from=expert`); }}
                        className="text-slate-300 hover:text-[#F2C94C] transition-colors"
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

        {/* 卡片4: 用户评价 */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">用户评价（128）</h2>
            <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              [ 写评价 ]
            </button>
          </div>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-[#F2C94C] mb-4"></div>
          
          <div className="space-y-4">
            {EXPERT_REVIEWS.map((review) => (
              <div key={review.id} className="pb-4 border-b border-slate-50 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F2C94C] text-[#F2C94C]" />
                    ))}
                  </div>
                  <span className="text-slate-900 font-medium text-sm">{review.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-400 text-xs">{review.title}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">"{review.content}"</p>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            [ 查看全部 128 条评价 ]
          </button>
        </section>
      </div>

      {/* 右下角悬浮预约按钮 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-[#F2C94C] text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        <span>预约</span>
        <span className="text-white/80 text-sm">300积分</span>
      </button>

      {/* 头像放大 Modal */}
      <AnimatePresence>
        {isAvatarExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-8"
            onClick={() => setIsAvatarExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAvatarExpanded(false)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={expert.avatar} 
                alt={expert.name}
                className="w-80 h-80 rounded-full object-cover border-4 border-white"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 预约 Modal */}
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
