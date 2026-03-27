import React, { useState, useEffect } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';

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
  content = "当前团队核心骨干流失风险已达临界点，主要源于业务快速扩张期压力传导失衡，以及管理者对核心人才情绪价值与成长路径规划的长期忽视。建议指挥官立即开启非业务导向的一对一深度面谈，剥离KPI考核，纯粹探寻其个人职业发展诉求与当前核心痛点，切忌单纯依靠物质承诺进行防御性挽留。通过此次精准的心理干预与资源倾斜，预期能有效缓解骨干成员的职业倦怠感，重建团队信任纽带，将核心人才流失风险降低至安全水位，从而确保组织在高速行军中的核心战斗力与业务连续性。"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Validation logic: 300 characters max per PRD
  const charCount = content.length;
  const isValidLength = charCount <= 300;
  
  // Debug warning for development
  if (process.env.NODE_ENV === 'development' && !isValidLength) {
    console.warn(`[DigestCard] Content length (${charCount}) exceeds PRD limit (300 chars max).`);
  }

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
        {/* Character count warning for content managers (dev mode only) */}
        {process.env.NODE_ENV === 'development' && !isValidLength && (
          <div className="mb-3 flex items-center gap-2 text-amber-500 text-[10px]">
            <AlertCircle className="w-3 h-3" />
            <span>字数 {charCount}，PRD 要求 300 字以内</span>
          </div>
        )}

        <p className="text-slate-800 leading-relaxed text-sm">
          {content}
        </p>
      </div>
    </div>
  );
};
