import React, { useState } from 'react';
import { X, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContributeFormProps {
  onClose: () => void;
  onSuccess: (points: number) => void;
}

export const ContributeForm: React.FC<ContributeFormProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState('');
  const [action, setAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim() || !action.trim()) return;

    setIsSubmitting(true);
    
    // Mock sync to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      onSuccess(100); // Add 100 base points
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">我也来支招</h2>
            <p className="text-slate-500 text-sm">分享你的实战智慧，赋能更多管理战友</p>
          </div>

          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">案例标题</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：如何处理核心员工的突然离职"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">实战场景描述 <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="请描述具体的管理痛点或业务场景..."
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">核心管理动作 <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="你是如何通过具体的管理动作解决问题的？"
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 transition-all resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>提交实战案例</span>
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-center text-[11px] text-slate-400 font-medium">
                    贡献案例可申请成为<span className="text-[#F2C94C] font-bold">实战参赞</span>，获取更多积分
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">提交成功！</h3>
                <p className="text-slate-500">感谢你的贡献，基础积分 <span className="text-[#F2C94C] font-bold">+100</span> 已发放</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
