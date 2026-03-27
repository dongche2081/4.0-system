import React, { useState, useEffect } from 'react';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  content?: string;
}

const Waveform = () => (
  <div className="flex items-center gap-0.5 h-4">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-0.5 bg-[#F2C94C] rounded-full"
        animate={{
          height: ["30%", "100%", "30%"],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export const DigestCard: React.FC<Props> = ({
  content = `执行力差的本质往往是目标不清晰或激励不到位。当团队成员出现"推一下动一下"的情况时，问题通常不在于员工的态度，而在于管理者未能将目标拆解到可执行粒度，也未能建立有效的反馈闭环。建议指挥官立即进行目标颗粒度诊断，检查每个任务是否有明确的交付标准、截止时间和验收方式。同时，建立日清机制，每日同步进度而非每周汇报，让问题暴露在24小时内而非一周后。管理者的核心价值在于消除信息不对称，并为下属提供即时反馈，而非在问题爆发后才进行事后追责。`
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 判断内容是否需要展开（超过80字视为长内容）
  const shouldShowExpand = content.length > 80;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'zh-CN';
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {/* Hanging Label - 左上角悬挂金色"AI智能诊断解法"标签 */}
      <div className="absolute -top-3 left-8 bg-[#F2C94C] text-[#0A0F1D] text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm tracking-widest uppercase flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#0A0F1D] rounded-full"></span>
        AI智能诊断解法
      </div>

      {/* TTS Trigger - PRD: 右上角小喇叭图标 */}
      <button
        onClick={togglePlay}
        className="absolute top-6 right-8 p-2 rounded-full hover:bg-slate-50 transition-colors group"
        title={isPlaying ? "停止播报" : "语音播报"}
      >
        {isPlaying ? (
          // Playing state: golden waveform animation
          <Waveform />
        ) : (
          // Static state: outline speaker icon
          <Volume2 className="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] transition-colors" />
        )}
      </button>

      {/* Content Area */}
      <div className="mt-4">
        {/* 诊断来源说明 */}
        <p className="text-xs text-slate-400 mb-3">基于您提供的现场信息，我们匹配了相关管理案例与解决方案</p>

        {/* 内容区域，支持展开/折叠 */}
        <div className="relative">
          <AnimatePresence initial={false}>
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded || !shouldShowExpand ? "auto" : "3.2em"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-slate-800 leading-relaxed text-sm">
                {content}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* 未展开时的渐变遮罩 */}
          {shouldShowExpand && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {/* 展开/折叠按钮 */}
        {shouldShowExpand && (
          <button
            onClick={toggleExpand}
            className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-[#F2C94C] transition-colors group"
          >
            <span>{isExpanded ? "收起内容" : "展开详细内容"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        )}
      </div>
    </div>
  );
};
