<template>
  <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-5 group hover:border-[#F2C94C]/30">
    <!-- Left: Avatar - 80px per PRD -->
    <div 
      class="flex-shrink-0 cursor-pointer"
      @click="handleNavigate()"
    >
      <img 
        :src="expert.avatar" 
        class="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-[#F2C94C] transition-all" 
        :alt="expert.name" 
        referrerpolicy="no-referrer"
      />
    </div>

    <!-- Middle: Info - BG/岗位/姓名 -->
    <div class="flex-grow min-w-0">
      <div class="text-[10px] font-bold text-[#F2C94C] uppercase tracking-wider mb-0.5 truncate">
        {{ expert.resume && expert.resume[0] ? expert.resume[0] : '事业部' }}
      </div>
      <div class="text-xs text-slate-400 font-bold mb-1 truncate">
        {{ expert.title }}
      </div>
      <div class="text-base font-black text-slate-900 truncate">
        {{ expert.name }}
      </div>
    </div>

    <!-- Right: Triple Media Icons (Video/Audio/Text) -->
    <div class="flex items-center gap-2">
      <button 
        @click.stop="handleNavigate('video')"
        class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
        title="视频播放"
      >
        <Video class="w-4 h-4" />
      </button>
      <button 
        @click.stop="handleNavigate('audio')"
        class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
        title="音频听取"
      >
        <Headphones class="w-4 h-4" />
      </button>
      <button 
        @click.stop="handleNavigate('text')"
        class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
        title="图文阅读"
      >
        <FileText class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script>
import { Video, FileText, Headphones } from 'lucide-vue'

export default {
  name: 'ExpertCard',

  components: {
    Video,
    FileText,
    Headphones
  },

  props: {
    expert: {
      type: Object,
      required: true
    },
    topicId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      caseId: 'c1'
    }
  },

  methods: {
    handleNavigate(mediaType) {
      const path = mediaType 
        ? `/expert/${this.expert.id}/case/${this.caseId}?type=${mediaType}`
        : `/expert/${this.expert.id}/case/${this.caseId}`
      this.$router.push({ 
        path: path,
        state: { topicId: this.topicId }
      })
    }
  }
}
</script>
