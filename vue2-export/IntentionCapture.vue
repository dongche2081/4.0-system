<template>
  <div class="relative w-full max-w-3xl mx-auto">
    <div 
      :class="['relative flex items-center rounded-3xl transition-all', containerClass]"
      :style="commandStyle"
    >
      <div :class="['pl-4 pr-2', isCommand ? 'text-[#F2C94C]' : 'text-slate-400']">
        <Search class="w-5 h-5" />
      </div>
      <input
        type="text"
        v-model="query"
        @input="handleInput"
        @keydown.enter="handleSearch"
        :placeholder="placeholder || (mode === 'follow-up' ? '基于以上研判，您还有哪些具体的实战困惑？' : '例如：资源有限如何升级团队能力实现突破')"
        :class="['w-full py-5 bg-transparent outline-none', inputClass]"
      />
      <div class="pr-4 pl-2 flex items-center gap-2">
        <button v-if="!isCommand" class="p-2 text-slate-300 hover:text-[#F2C94C] hover:bg-slate-50 transition-colors rounded-full">
          <Mic class="w-5 h-5" />
        </button>
        <button
          @click="handleSearch"
          :class="['p-2.5 rounded-2xl transition-all', query.trim() ? 'bg-[#F2C94C] text-white' : 'bg-slate-50 text-slate-300']"
        >
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <transition name="dropdown">
      <div v-if="showSuggestions" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
        <div class="p-2 text-xs text-[#95A5A6] uppercase tracking-wider font-medium bg-[#F4F7F9] border-b border-gray-100">
          AI 管理能力提升助手，您是指以下问题吗？
        </div>
        <ul class="py-1">
          <li v-for="(suggestion, idx) in suggestions" :key="idx">
            <button
              @click="handleSuggestionClick(suggestion)"
              class="w-full text-left px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F4F7F9] hover:text-[#1B3C59] transition-colors flex items-center"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#F2C94C] mr-3"></span>
              {{ suggestion }}
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { Search, Mic, ArrowRight } from 'lucide-vue'

export default {
  name: 'IntentionCapture',

  components: {
    Search,
    Mic,
    ArrowRight
  },

  props: {
    mode: {
      type: String,
      default: 'new-search',
      validator: value => ['new-search', 'follow-up'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'command'].includes(value)
    },
    placeholder: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      query: '',
      showSuggestions: false,
      suggestions: ['员工执行力差', '员工有离职倾向', '员工不服从管理']
    }
  },

  computed: {
    isCommand() {
      return this.variant === 'command'
    },
    containerClass() {
      if (this.isCommand) {
        return 'bg-white border-2 border-[#F2C94C] shadow-[0_0_20px_rgba(242,201,76,0.15)]'
      }
      if (this.mode === 'follow-up') {
        return 'bg-white border border-slate-200 focus-within:border-[#F2C94C]/50 shadow-sm'
      }
      return 'bg-white border border-slate-200 focus-within:border-[#F2C94C]/50 shadow-sm'
    },
    inputClass() {
      return this.isCommand 
        ? 'text-slate-900 placeholder-slate-300 text-lg' 
        : 'text-slate-700 placeholder-slate-300'
    },
    commandStyle() {
      if (!this.isCommand) return {}
      return {
        animation: 'glow 3s ease-in-out infinite'
      }
    }
  },

  methods: {
    handleInput(e) {
      if (this.mode === 'follow-up') return
      this.showSuggestions = e.target.value.length > 0
    },

    handleSearch() {
      if (this.query.trim()) {
        this.$emit('search', this.query)
        if (this.mode === 'follow-up') {
          this.query = ''
        }
        this.showSuggestions = false
      }
    },

    handleSuggestionClick(suggestion) {
      this.query = suggestion
      this.$emit('search', suggestion)
      if (this.mode === 'follow-up') {
        this.query = ''
      }
      this.showSuggestions = false
    }
  }
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(242,201,76,0.1);
  }
  50% {
    box-shadow: 0 0 25px rgba(242,201,76,0.3);
  }
}
</style>
