import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { EXPERT_CASES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, ChevronRight, Bookmark, Award, Heart, Lightbulb, Lock, LogOut,
  AlertTriangle
} from 'lucide-react';

// 示例数据 - 我的贡献
const DEMO_CONTRIBUTIONS = [
  {
    id: 'contrib-001',
    topic: '核心骨干离职预警',
    content: '建议增加"职业发展二次锚定"面谈环节，在离职意向产生前进行深度沟通。',
    points: 200,
    date: '2026-03-10',
    type: 'suggestion',
    likes: 15,
    status: 'approved'
  },
  {
    id: 'contrib-002',
    topic: '绩效评价标准',
    content: '对于研发岗位，建议引入"技术影响力"作为加分项，平衡产出与长期价值。',
    points: 250,
    date: '2026-03-08',
    type: 'case',
    likes: 23,
    status: 'approved'
  },
  {
    id: 'contrib-003',
    topic: '新生代员工管理',
    content: '95后员工更注重成长感和参与感，建议在周会中增加"本周成长分享"环节。',
    points: 0,
    date: '2026-03-15',
    type: 'suggestion',
    likes: 8,
    status: 'pending'
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userStats, setIsLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'contributions' | 'settings'>('favorites');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // 我的收藏
  const bookmarks = useMemo(() => {
    return Object.values(EXPERT_CASES).filter(c => userStats.bookmarks?.includes(c.id));
  }, [userStats.bookmarks]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('请填写所有密码字段');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('新密码与确认密码不一致');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('新密码长度不能少于6位');
      return;
    }

    // mock 成功
    setPasswordSuccess('密码修改成功');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const tabs = [
    { id: 'favorites' as const, label: '我的收藏', icon: Bookmark, count: bookmarks.length },
    { id: 'contributions' as const, label: '我的贡献', icon: Award, count: DEMO_CONTRIBUTIONS.length },
    { id: 'settings' as const, label: '账号设置', icon: Lock, count: null },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out] pb-12">
      {/* 顶部用户信息卡 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F2C94C]/10 flex items-center justify-center border border-[#F2C94C]/20">
          <User className="w-10 h-10 text-[#F2C94C]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">管理者</h2>
        <div className="text-2xl font-black text-[#F2C94C] mb-4">
          {userStats.points.toLocaleString()} 积分
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-sm text-red-500 hover:text-red-600 font-medium px-4 py-2 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto no-scrollbar relative">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#F2C94C] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#F2C94C]/20 text-[#F2C94C]' : 'bg-slate-100 text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* 我的收藏 */}
            {activeTab === 'favorites' && (
              <>
                {bookmarks.length > 0 ? (
                  bookmarks.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/expert/${item.expertId}/case/${item.id}`)}
                      className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-[#F2C94C]/40 cursor-pointer transition-all flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-[#F2C94C]">
                        <Bookmark className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-[#F2C94C] transition-colors truncate">{item.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-1">{item.summary}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm">
                      暂无收藏案例，浏览时点击收藏按钮即可添加
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 我的贡献 */}
            {activeTab === 'contributions' && (
              <>
                {/* 贡献统计卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-lg p-5 flex flex-col items-center text-center">
                    <Award className="w-8 h-8 text-[#F2C94C] mb-2" />
                    <div className="text-2xl font-black text-slate-900">450</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">贡献积分</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex flex-col items-center text-center">
                    <Lightbulb className="w-8 h-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-black text-slate-900">3</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">建议提交</div>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-5 flex flex-col items-center text-center">
                    <Heart className="w-8 h-8 text-green-500 mb-2" />
                    <div className="text-2xl font-black text-slate-900">46</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">获得赞同</div>
                  </div>
                </div>

                {DEMO_CONTRIBUTIONS.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-500">{item.topic}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.status === 'approved' ? '已通过' : '审核中'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" /> +{item.points}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 账号设置 */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#F2C94C]" />
                  修改密码
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">当前密码</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#F2C94C] outline-none transition-all"
                      placeholder="请输入当前密码"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">新密码</label>
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#F2C94C] outline-none transition-all"
                      placeholder="请输入新密码"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">确认新密码</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#F2C94C] outline-none transition-all"
                      placeholder="请再次输入新密码"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-500">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-xs text-green-600">{passwordSuccess}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasswordForm({ current: '', new: '', confirm: '' })}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#F2C94C] text-white text-sm font-medium rounded-xl hover:bg-[#E5B73B] transition-colors"
                    >
                      确认修改
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 退出登录确认弹窗 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">确认退出登录？</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                退出后需要重新登录才能访问个人数据。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
