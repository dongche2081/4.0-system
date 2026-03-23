import React from 'react';
import { Play, FileText, Link as LinkIcon } from 'lucide-react';

interface Props {
  topicTitle: string;
}

export const DigestCard: React.FC<Props> = ({ topicTitle }) => {
  return (
    <div className="digest-card mb-6">
      <h2 className="text-lg font-bold text-[#1B3C59] mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-[#F2C94C]" />
        划个重点：{topicTitle}
      </h2>
      
      <div className="space-y-4 text-sm">
        <div className="bg-[#F4F7F9] p-3 rounded-sm border-l-2 border-gray-300">
          <strong className="text-[#1B3C59] block mb-1">【本质原因】</strong>
          <p className="text-[#2C3E50]">
            核心骨干离职往往不是因为钱不够，而是因为“心委屈了”或者“看不到希望”。在快速扩张期，骨干承担了最多的压力，却往往被忽视了情绪价值和成长路径的规划。
          </p>
        </div>
        
        <div className="bg-[#F4F7F9] p-3 rounded-sm border-l-2 border-gray-300">
          <strong className="text-[#1B3C59] block mb-1">【核心动作】</strong>
          <p className="text-[#2C3E50]">
            立即进行一对一深度面谈，剥离业务指标，纯粹探寻其个人职业发展诉求与当前痛点，切忌直接用物质承诺进行挽留。
          </p>
        </div>
        
        <div className="bg-[#F4F7F9] p-3 rounded-sm border-l-2 border-[#F2C94C]">
          <strong className="text-[#F2C94C] block mb-1">【扫地僧金句】</strong>
          <p className="text-[#2C3E50] font-semibold">
            “不要用战术上的勤奋，掩盖战略上的懒惰。管理者的核心价值，在于激发他人的善意与潜能。”
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="text-sm font-bold text-[#1B3C59] mb-3 flex items-center">
          <Play className="w-4 h-4 mr-2" />
          扫地僧原声
        </h3>
        <div className="bg-black/5 rounded-lg h-32 flex items-center justify-center relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-full bg-[#F2C94C] flex items-center justify-center shadow-lg z-10">
            <Play className="w-6 h-6 text-[#1B3C59] ml-1" />
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-white/80 z-10">
            <span>00:00</span>
            <span>02:15</span>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-[#F2C94C] w-1/3 z-10"></div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="text-sm font-bold text-[#1B3C59] mb-3 flex items-center">
          <LinkIcon className="w-4 h-4 mr-2" />
          看看别人怎么搞
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="text-[#1B3C59] hover:text-[#F2C94C] hover:underline flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
              某大厂技术骨干离职挽留实录
            </a>
          </li>
          <li>
            <a href="#" className="text-[#1B3C59] hover:text-[#F2C94C] hover:underline flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
              如何建立有效的核心人才预警机制
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
