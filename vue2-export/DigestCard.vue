<template>
  <div class="relative bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
    <!-- Hanging Label - PRD: 左上角悬挂金色"AI 实战建议"标签 -->
    <div class="absolute -top-3 left-8 bg-[#F2C94C] text-[#0A0F1D] text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm tracking-widest uppercase">
      AI 实战建议
    </div>

    <!-- TTS Trigger - PRD: 右上角小喇叭图标 -->
    <button 
      @click="togglePlay"
      class="absolute top-6 right-8 p-2 rounded-full hover:bg-slate-50 transition-colors group"
      :title="isPlaying ? '停止播报' : '语音播报'"
    >
      <!-- Playing state: golden waveform animation -->
      <div v-if="isPlaying" class="flex items-center gap-0.5 h-4">
        <div
          v-for="i in 4"
          :key="i"
          class="w-0.5 bg-[#F2C94C] rounded-full waveform-bar"
          :style="{ animationDelay: `${i * 0.1}s` }"
        />
      </div>
      <!-- Static state: outline speaker icon -->
      <Volume2 v-else class="w-5 h-5 text-slate-300 group-hover:text-[#F2C94C] transition-colors" />
    </button>

    <!-- Content Area -->
    <div class="mt-4">
      <!-- Character count warning for content managers (dev mode only) -->
      <div v-if="isDev && !isValidLength" class="mb-3 flex items-center gap-2 text-amber-500 text-[10px]">
        <AlertCircle class="w-3 h-3" />
        <span>字数 {{ charCount }}，建议控制在 180-220 字</span>
      </div>

      <div
        class="overflow-hidden relative"
        :style="{ height: isExpanded ? 'auto' : '4.5rem' }"
      >
        <p :class="['text-slate-800 leading-relaxed text-sm', !isExpanded ? 'line-clamp-3' : '']">
          {{ displayContent }}
        </p>
        
        <!-- Gradient overlay when collapsed -->
        <div v-if="!isExpanded" class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      <!-- Expand/Collapse Button - PRD: 底部居中"展开全部内容" -->
      <div class="mt-4 flex justify-center">
        <button
          @click="isExpanded = !isExpanded"
          class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-[#F2C94C] transition-colors group"
        >
          <template v-if="isExpanded">
            收起内容 <ChevronUp class="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </template>
          <template v-else>
            展开全部内容 <ChevronDown class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Volume2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-vue'

export default {
  name: 'DigestCard',

  components: {
    Volume2,
    ChevronDown,
    ChevronUp,
    AlertCircle
  },

  props: {
    content: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      isExpanded: false,
      isPlaying: false,
      defaultContent: '当前团队核心骨干流失风险已达临界点，主要源于业务快速扩张期压力传导失衡，以及管理者对核心人才情绪价值与成长路径规划的长期忽视。建议指挥官立即开启非业务导向的一对一深度面谈，剥离KPI考核，纯粹探寻其个人职业发展诉求与当前核心痛点，切忌单纯依靠物质承诺进行防御性挽留。通过此次精准的心理干预与资源倾斜，预期能有效缓解骨干成员的职业倦怠感，重建团队信任纽带，将核心人才流失风险降低至安全水位，从而确保组织在高速行军中的核心战斗力与业务连续性。',
      isDev: process.env.NODE_ENV === 'development'
    }
  },

  computed: {
    displayContent() {
      return this.content || this.defaultContent
    },
    charCount() {
      return this.displayContent.length
    },
    isValidLength() {
      return this.charCount >= 180 && this.charCount <= 220
    }
  },

  beforeDestroy() {
    window.speechSynthesis.cancel()
  },

  methods: {
    togglePlay(e) {
      e.stopPropagation()
      if (!this.isPlaying) {
        const utterance = new SpeechSynthesisUtterance(this.displayContent)
        utterance.lang = 'zh-CN'
        utterance.onend = () => {
          this.isPlaying = false
        }
        utterance.onerror = () => {
          this.isPlaying = false
        }
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
        this.isPlaying = true
      } else {
        window.speechSynthesis.cancel()
        this.isPlaying = false
      }
    }
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.waveform-bar {
  height: 100%;
  animation: waveform 0.6s ease-in-out infinite;
}

@keyframes waveform {
  0%, 100% {
    height: 30%;
  }
  50% {
    height: 100%;
  }
}
</style>
