import React from 'react';

export const RichText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-black">$1</b>')
    .replace(/\[gold\](.*?)\[\/gold\]/g, '<span class="text-[#F2C94C] font-bold">$1</span>')
    .replace(/【(.*?)】/g, '<span class="text-[#F2C94C] font-black tracking-widest mr-1">【$1】</span>')
    .replace(/\[img\](.*?)\[\/img\]/g, '<div class="my-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5"><img src="$1" class="w-full h-auto object-contain" referrerPolicy="no-referrer" /></div>')
    .replace(/\[list\]([\s\S]*?)\[\/list\]/g, (_, content) => {
      const items = content.trim().split('\n').filter((i: string) => i.trim());
      return `<ul class="list-disc list-inside space-y-2 my-4 text-white/70">${items.map((item: string) => `<li class="pl-2">${item.trim()}</li>`).join('')}</ul>`;
    })
    .replace(/\n/g, '<br/>');

  return <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: formatted }} />;
};
