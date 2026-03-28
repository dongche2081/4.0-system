import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ThumbsDown, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail?: string) => void;
}

const REASONS = [
  { id: 'inaccurate', label: '内容不实' },
  { id: 'irrelevant', label: '与主题无关' },
  { id: 'outdated', label: '信息过时' },
  { id: 'other', label: '其他原因' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    const reasonLabel = REASONS.find((r) => r.id === selectedReason)?.label || selectedReason;
    onSubmit(reasonLabel, detail);
    setSelectedReason('');
    setDetail('');
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetail('');
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
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <ThumbsDown className="w-4 h-4 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">内容反馈</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              请告诉我们您不满意的原因，帮助我们改进内容质量。
            </p>

            {/* Reasons */}
            <div className="space-y-2 mb-4">
              {REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedReason === reason.id
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedReason === reason.id
                          ? 'border-amber-400'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedReason === reason.id && (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{reason.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail Input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                补充说明（选填）
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="请详细描述您的问题..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400 transition-colors"
                rows={3}
                maxLength={200}
              />
              <div className="text-right text-xs text-slate-400 mt-1">
                {detail.length}/200
              </div>
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
                disabled={!selectedReason}
                className="flex-1 px-4 py-2.5 bg-amber-400 text-white rounded-xl hover:bg-amber-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交反馈
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
