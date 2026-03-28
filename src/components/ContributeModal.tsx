import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, Send } from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  topicTitle: string;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  topicTitle,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">我也来支招</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Topic Info */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-slate-500 mb-1">当前话题</p>
              <p className="text-sm font-medium text-slate-900">{topicTitle}</p>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              分享您的实战经验或独到见解，帮助更多管理者解决类似问题。
            </p>

            {/* Content Input */}
            <div className="mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享您的经验或建议..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400 transition-colors"
                rows={6}
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>建议包含：背景、做法、成效</span>
                <span>{content.length}/1000</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-700">
                💡 优质内容将被展示在案例库中，并获得积分奖励
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex-1 px-4 py-2.5 bg-amber-400 text-white rounded-xl hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                提交分享
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
