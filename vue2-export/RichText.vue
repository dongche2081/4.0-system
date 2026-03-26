<template>
  <div class="rich-text-content" v-html="formattedText" />
</template>

<script>
export default {
  name: 'RichText',

  props: {
    text: {
      type: String,
      default: ''
    }
  },

  computed: {
    formattedText() {
      if (!this.text) return ''

      let formatted = this.text
        .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-black">$1</b>')
        .replace(/\[gold\](.*?)\[\/gold\]/g, '<span class="text-[#F2C94C] font-bold">$1</span>')
        .replace(/【(.*?)】/g, '<span class="text-[#F2C94C] font-black tracking-widest mr-1">【$1】</span>')
        .replace(/\[img\](.*?)\[\/img\]/g, '<div class="my-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5"><img src="$1" class="w-full h-auto object-contain" referrerpolicy="no-referrer" /></div>')
        .replace(/\[list\]([\s\S]*?)\[\/list\]/g, (match, content) => {
          const items = content.trim().split('\n').filter(i => i.trim())
          return `<ul class="list-disc list-inside space-y-2 my-4 text-white/70">${items.map(item => `<li class="pl-2">${item.trim()}</li>`).join('')}</ul>`
        })
        .replace(/\n/g, '<br/>')

      return formatted
    }
  }
}
</script>
