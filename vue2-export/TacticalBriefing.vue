<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-24 animate-[fadeIn_0.3s] pt-4">
    <!-- A. 研判解析区 (亮色一体化) -->
    <section class="space-y-6">
      <!-- AI Insight Container (Refactored DigestCard) -->
      <DigestCard v-if="topic.id === 'diagnostic-result'" :content="prescription && prescription.summary" />

      <div class="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-sm">
        <div v-if="isGeneratingFeedback" class="flex items-center gap-2 text-[#F2C94C] text-[10px] font-black uppercase tracking-widest mb-6 animate-pulse">
          <Zap class="w-3 h-3 animate-spin" /> 正在深度研判中...
        </div>

        <div class="space-y-6">
          <!-- 实战事例合并展示 -->
          <div v-if="topic.caseStudy" class="pb-6 border-b border-slate-100">
            <div class="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.2em] mb-3">典型实战场景</div>
            <div class="text-slate-800 leading-loose text-base italic font-medium">
              "{{ topic.caseStudy }}"
            </div>
          </div>

          <div ref="contentRef" class="text-slate-800 leading-[1.8] text-base">
            <div class="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.2em] mb-3">深度战术解析</div>
            <RichText :text="prescription && prescription.truth ? prescription.truth : '正在生成深度解析...'" />
          </div>
        </div>
      </div>

      <!-- 互动反馈系统 (紧贴容器下方) -->
      <div class="flex flex-wrap items-center justify-between gap-4 px-2">
        <div class="flex items-center gap-4">
          <button 
            @click="handleLike"
            :class="['flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105', liked ? 'bg-[#F2C94C] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']"
          >
            <ThumbsUp :class="['w-4 h-4', liked ? 'fill-white' : '']" />
            <span class="text-xs font-bold">{{ liked ? '感谢反馈' : '赞同' }}</span>
          </button>
          <button 
            @click="showDislikeModal = true"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#F2C94C] transition-all hover:scale-105"
          >
            <ThumbsDown class="w-4 h-4" />
            <span class="text-xs font-bold">不符合预期</span>
          </button>
        </div>

        <button 
          @click="showContributionModal = true"
          class="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:border-[#F2C94C] hover:text-[#F2C94C] transition-all hover:scale-105 group"
        >
          <Sparkles class="w-4 h-4 group-hover:animate-pulse" />
          <span class="text-xs font-black">我也来支招</span>
        </button>
      </div>

      <!-- B. 参考来源 (专家矩阵 - PRD规范：纵向平铺3-4名) -->
      <div v-if="expertResources.length > 0" class="mt-12 space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-1 h-3 bg-[#F2C94C]/50 rounded-full"></div>
          <h3 class="text-[9px] font-black text-slate-400 tracking-widest uppercase">参考来源</h3>
        </div>
        <div class="space-y-3">
          <div
            v-for="expert in expertResources.slice(0, 4)"
            :key="expert.id"
            class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-5 group hover:border-[#F2C94C]/30"
          >
            <!-- Left: Avatar - 80px per PRD -->
            <div
              class="flex-shrink-0 cursor-pointer"
              @click="navigateToExpert(expert.id)"
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
                @click.stop="navigateToExpertCase(expert.id, 'video')"
                class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                title="视频播放"
              >
                <Video class="w-4 h-4" />
              </button>
              <button
                @click.stop="navigateToExpertCase(expert.id, 'audio')"
                class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                title="音频听取"
              >
                <Headphones class="w-4 h-4" />
              </button>
              <button
                @click.stop="navigateToExpertCase(expert.id, 'text')"
                class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#F2C94C]/10 hover:text-[#F2C94C] transition-all"
                title="图文阅读"
              >
                <FileText class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- D. 实战转化区 -->
    <section v-if="topic.id !== 'diagnostic-result'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        @click="navigateToPractice"
        class="relative h-48 bg-white border border-slate-200 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 hover:scale-[1.02] transition-all"
      >
        <div class="absolute inset-0 p-8 flex flex-col justify-between">
          <div class="w-12 h-12 rounded-2xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
            <Zap class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-xl font-black text-[#0A0F1D] mb-2">练一练</h4>
            <p class="text-xs text-gray-400">情景模拟练习</p>
          </div>
        </div>
        <div class="absolute top-8 right-8 text-slate-200 group-hover:text-[#F2C94C] transition-all">
          <ArrowRight class="w-8 h-8" />
        </div>
      </div>

      <div 
        @click="navigateToDiagnosis"
        class="relative h-48 bg-white border border-slate-200 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md hover:border-[#F2C94C]/50 hover:scale-[1.02] transition-all"
      >
        <div class="absolute inset-0 p-8 flex flex-col justify-between">
          <div class="w-12 h-12 rounded-2xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
            <Activity class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-xl font-black text-[#0A0F1D] mb-2">聊一聊</h4>
            <p class="text-xs text-gray-400">深度智能诊断</p>
          </div>
        </div>
        <div class="absolute top-8 right-8 text-slate-200 group-hover:text-[#F2C94C] transition-all">
          <ArrowRight class="w-8 h-8" />
        </div>
      </div>
    </section>

    <!-- Follow-up Input for Diagnostic Results -->
    <div v-if="topic.id === 'diagnostic-result'" class="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent">
      <div class="max-w-4xl mx-auto">
        <IntentionCapture 
          @search="handleFollowUp"
          placeholder="针对研判结果，您还有什么想追问 AI 管理能力提升助手的？"
        />
      </div>
    </div>

    <!-- High-Premium Modals -->
    <transition name="modal-fade">
      <div v-if="activeModal && activeExpertForModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal" />
        
        <transition name="modal-scale">
          <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[90vh] border border-slate-200">
            <button 
              @click="closeModal"
              class="absolute top-6 right-6 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X class="w-6 h-6 text-slate-400" />
            </button>

            <!-- Document Modal -->
            <div v-if="activeModal === 'document'" class="flex-1 flex flex-col md:flex-row h-full">
              <div class="w-full md:w-1/4 bg-slate-50 p-8 flex flex-col justify-center items-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
                <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <div class="text-4xl font-black rotate-[-45deg] whitespace-nowrap tracking-[0.5em] text-slate-900">机密</div>
                </div>
                <img :src="activeExpertForModal.avatar" class="w-20 h-20 rounded-3xl mb-4 shadow-lg relative z-10" alt="" referrerpolicy="no-referrer" />
                <h3 class="text-lg font-black text-slate-900 relative z-10">{{ activeExpertForModal.name }}</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 relative z-10">实战复盘报告</p>
              </div>
              <div class="flex-1 bg-white p-8 md:p-12 overflow-y-auto">
                <div class="max-w-2xl mx-auto space-y-8">
                  <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div class="text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.3em]">复盘报告</div>
                    <div class="text-[10px] text-slate-300">编号 {{ activeExpertForModal.id.toUpperCase() }}-2026</div>
                  </div>
                  <h2 class="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    关于{{ topic.title }}的实战级复盘摘要
                  </h2>
                  <div class="prose prose-slate max-w-none">
                    <p class="text-slate-600 leading-loose text-lg italic tracking-wide">
                      {{ activeExpertForModal.caseDocument || "正在调取专家实战复盘全文..." }}
                    </p>
                  </div>
                  <div class="pt-12 flex items-center gap-4 opacity-30">
                    <div class="h-px flex-1 bg-slate-200"></div>
                    <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">AI 管理能力提升助手专家库出品</div>
                    <div class="h-px flex-1 bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Audio Modal -->
            <div v-if="activeModal === 'audio'" class="flex-1 bg-white p-12 flex flex-col items-center justify-center text-center space-y-12">
              <!-- Waveform Simulation -->
              <div class="flex items-center justify-center gap-1.5 h-32 w-full max-w-xs">
                <div
                  v-for="(bar, i) in 20"
                  :key="i"
                  :class="['w-1.5 bg-[#F2C94C] rounded-full opacity-60', isPlaying ? 'animate-bounce' : '']"
                  :style="{ 
                    height: isPlaying ? `${Math.random() * 80 + 20}px` : '16px',
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.6 + Math.random() * 0.4}s`
                  }"
                />
              </div>

              <div class="w-full max-w-md space-y-6">
                <div class="relative h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class="absolute inset-y-0 left-0 bg-[#F2C94C]"
                    :style="{ width: '28%' }"
                  />
                </div>
                <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>01:24</span>
                  <span>05:00</span>
                </div>
              </div>

              <div class="flex items-center gap-8">
                <button class="text-slate-300 hover:text-slate-500 transition-colors">
                  <ArrowRight class="w-6 h-6 rotate-180" />
                </button>
                <button 
                  @click="isPlaying = !isPlaying"
                  class="w-20 h-20 bg-[#F2C94C] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#F2C94C]/20 hover:scale-105 transition-all"
                >
                  <Pause v-if="isPlaying" class="w-8 h-8 fill-current" />
                  <Play v-else class="w-8 h-8 fill-current ml-1" />
                </button>
                <button class="text-slate-300 hover:text-slate-500 transition-colors">
                  <ArrowRight class="w-6 h-6" />
                </button>
              </div>
            </div>

            <!-- Video Modal -->
            <div v-if="activeModal === 'video'" class="flex-1 flex flex-col md:flex-row h-full">
              <div class="flex-1 bg-black relative group flex items-center justify-center">
                <img 
                  :src="`https://picsum.photos/seed/${activeExpertForModal.id}/1280/720`" 
                  class="w-full h-full object-cover opacity-60" 
                  alt="" 
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-all group-hover:bg-[#F2C94C] group-hover:text-white group-hover:border-[#F2C94C]">
                  <Play class="w-10 h-10 fill-current ml-1" />
                </button>
                <div class="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                  <div class="space-y-2">
                    <div class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest">精品课程</div>
                    <h3 class="text-xl font-black text-white">{{ activeExpertForModal.videoTitle || "精品 SOP 视频" }}</h3>
                  </div>
                  <div class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10">
                    12:45
                  </div>
                </div>
              </div>
              <div class="w-full md:w-80 bg-white p-8 flex flex-col border-l border-slate-100">
                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">课程大纲</h4>
                <div class="space-y-4 flex-1">
                  <div 
                    v-for="(item, i) in courseOutline" 
                    :key="i" 
                    class="p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-black text-[#F2C94C]">0{{ i + 1 }}</span>
                      <span class="text-[10px] text-slate-300">{{ item.duration }}</span>
                    </div>
                    <div class="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{{ item.title }}</div>
                  </div>
                </div>
                <div class="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                  <img :src="activeExpertForModal.avatar" class="w-10 h-10 rounded-3xl" alt="" referrerpolicy="no-referrer" />
                  <div>
                    <div class="text-xs font-bold text-slate-900">{{ activeExpertForModal.name }}</div>
                    <div class="text-[10px] text-slate-400">主讲专家</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Expert Detail Modal -->
    <div v-if="selectedExpert" class="fixed inset-0 z-[120] flex justify-end">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="selectedExpert = null"></div>
      <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-[slideInRight_0.4s] border-l border-slate-200 flex flex-col">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img :src="selectedExpert.avatar" class="w-12 h-12 rounded-full" />
            <div>
              <h4 class="text-lg font-black text-slate-900">{{ selectedExpert.name }}</h4>
              <p class="text-xs text-[#F2C94C] font-bold uppercase">{{ selectedExpert.title }}</p>
            </div>
          </div>
          <button @click="selectedExpert = null" class="p-2 text-slate-400 hover:text-slate-600"><X class="w-6 h-6" /></button>
        </div>
        <div class="flex-1 overflow-y-auto p-10 space-y-10">
          <div class="space-y-4">
            <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">专家实战复盘原文</h5>
            <div class="text-slate-600 leading-loose text-base bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <RichText :text="selectedExpert.bio" />
            </div>
          </div>
          <div class="p-8 space-y-6">
            <h5 class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest flex items-center gap-2">
              <Video class="w-3 h-3" />
              专家精品 SOP & 事例展示
            </h5>
            <div class="space-y-4">
              <div class="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 group hover:border-[#F2C94C]/30 transition-all">
                <div class="w-8 h-8 rounded-full bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                  <Play class="w-4 h-4 fill-[#F2C94C]" />
                </div>
                <div class="flex-1">
                  <h4 class="text-xs font-bold text-slate-900 group-hover:text-[#F2C94C] transition-colors">专家深度解析：{{ topic.title }}</h4>
                  <p class="text-[10px] text-slate-400 mt-1">实战场景还原与关键动作拆解。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-8 border-t border-slate-100">
          <button class="w-full py-5 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20">一键预约该专家深度连线</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toast" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-white text-[#F2C94C] rounded-full shadow-2xl border border-slate-200 flex items-center gap-3">
        <Check class="w-4 h-4" />
        <span class="text-xs font-black tracking-widest">{{ toast }}</span>
      </div>
    </transition>

    <!-- Dislike Feedback Modal -->
    <transition name="modal-fade">
      <div v-if="showDislikeModal" class="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showDislikeModal = false" />
        <transition name="modal-scale">
          <div class="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <button @click="showDislikeModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X class="w-6 h-6" />
            </button>
            
            <h3 class="text-xl font-black text-slate-900 mb-6 pr-8">指挥官，哪部分内容不符合您的预期？</h3>
            
            <div class="space-y-3 mb-6">
              <button 
                v-for="option in dislikeOptionsList"
                :key="option"
                @click="toggleDislikeOption(option)"
                :class="['w-full p-4 rounded-3xl border transition-all flex items-center justify-between group', dislikeOptions.includes(option) ? 'bg-[#F2C94C]/10 border-[#F2C94C] text-[#F2C94C]' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100']"
              >
                <span class="text-sm font-bold">{{ option }}</span>
                <div :class="['w-5 h-5 rounded-md border flex items-center justify-center transition-all', dislikeOptions.includes(option) ? 'bg-[#F2C94C] border-[#F2C94C]' : 'border-slate-200']">
                  <Check v-if="dislikeOptions.includes(option)" class="w-3 h-3 text-white" />
                </div>
              </button>
            </div>

            <textarea
              v-model="dislikeText"
              placeholder="请告诉我们哪里不对，我们会立即修正"
              class="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-4 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#F2C94C]/30 transition-all mb-6 resize-none"
            />

            <button 
              @click="handleDislikeSubmit"
              class="w-full py-4 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              提交反馈
            </button>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Contribution Modal (我也来支招) -->
    <transition name="modal-fade">
      <div v-if="showContributionModal" class="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showContributionModal = false" />
        <transition name="modal-scale">
          <div class="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl">
            <button @click="showContributionModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X class="w-8 h-8" />
            </button>

            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 rounded-3xl bg-[#F2C94C]/10 flex items-center justify-center text-[#F2C94C]">
                <Sparkles class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-2xl font-black text-slate-900">申请成为"实战案例贡献专家"</h3>
                <p class="text-sm text-slate-500 mt-1">如果您有更犀利的实战招式，欢迎提交案例。审核通过后，您的案例将入库并署名。</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">案例标题</label>
                <input
                  type="text"
                  v-model="contributionForm.title"
                  placeholder="例如：某大厂裁员风波中的人心维稳"
                  class="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">个人头衔</label>
                <input
                  type="text"
                  v-model="contributionForm.expertTitle"
                  placeholder="例如：前阿里P9 / 资深组织专家"
                  class="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all"
                />
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">实战场景描述 <span class="text-red-400">*</span></label>
                <textarea
                  v-model="contributionForm.scenario"
                  placeholder="请描述具体的实战背景、矛盾冲突点..."
                  class="w-full h-24 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all resize-none"
                />
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-[10px] font-black text-[#F2C94C] uppercase tracking-widest ml-1">核心管理动作 <span class="text-red-400">*</span></label>
                <textarea
                  v-model="contributionForm.action"
                  placeholder="您是如何解决的？关键的几步动作是什么？"
                  class="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm text-slate-900 focus:outline-none focus:border-[#F2C94C]/30 transition-all resize-none"
                />
              </div>
            </div>

            <!-- PRD: 底部激励文案 -->
            <p class="text-center text-[11px] text-slate-400 font-medium mb-4">
              贡献案例可申请成为<span class="text-[#F2C94C] font-bold">实战参赞</span>，获取更多积分
            </p>

            <button
              @click="handleContributionSubmit"
              class="w-full py-5 bg-[#F2C94C] text-white font-black rounded-3xl shadow-lg shadow-[#F2C94C]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              提交申请
            </button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
import { 
  FileText, Headphones, Video, ThumbsUp, ThumbsDown, X, Zap, 
  Copy, Download, CornerRightDown, Play, MessageSquare, Search, 
  Mic, ArrowRight, Star, ShieldCheck, Activity, BookOpen, 
  Pause, Volume2, Sparkles, Check 
} from 'lucide-vue'
import RichText from './RichText.vue'
import DigestCard from './DigestCard.vue'
import IntentionCapture from './IntentionCapture.vue'

export default {
  name: 'TacticalBriefing',
  
  components: {
    FileText,
    Headphones,
    Video,
    ThumbsUp,
    ThumbsDown,
    X,
    Zap,
    Copy,
    Download,
    CornerRightDown,
    Play,
    MessageSquare,
    Search,
    Mic,
    ArrowRight,
    Star,
    ShieldCheck,
    Activity,
    BookOpen,
    Pause,
    Volume2,
    Sparkles,
    Check,
    RichText,
    DigestCard,
    IntentionCapture
  },

  props: {
    topic: {
      type: Object,
      required: true
    },
    prescription: {
      type: Object,
      default: null
    },
    experts: {
      type: Array,
      default: () => []
    },
    context: {
      type: Object,
      default: () => ({})
    },
    diagnosticContext: {
      type: Object,
      default: null
    },
    relatedTopics: {
      type: Array,
      default: () => []
    },
    isGeneratingFeedback: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      selectedExpert: null,
      activeModal: null,
      activeExpertForModal: null,
      isPlaying: false,
      liked: false,
      showDislikeModal: false,
      showContributionModal: false,
      dislikeOptions: [],
      dislikeText: '',
      contributionForm: {
        title: '',
        scenario: '',
        action: '',
        expertTitle: ''
      },
      toast: null,
      courseOutline: [
        { title: '现状分析：识别表面下的利益暗流', duration: '03:20' },
        { title: '博弈话术：如何进行非对称压力沟通', duration: '05:45' },
        { title: '落地闭环：确保管理动作不走样', duration: '03:40' }
      ],
      dislikeOptionsList: [
        '文案太笼统：感觉在讲大道理',
        '管理动作生硬：话术不符合真实场景',
        '逻辑有误：前后矛盾',
        '有管理风险：建议的做法可能导致更严重的冲突'
      ]
    }
  },

  computed: {
    matchedExperts() {
      return this.experts.filter(e => e.topics.includes(this.topic.id) || e.topics.includes(this.topic.title))
    },
    expertResources() {
      return this.matchedExperts.length > 0 ? this.matchedExperts.slice(0, 3) : this.experts.slice(0, 3)
    }
  },

  methods: {
    navigateToExpert(expertId) {
      this.$router.push(`/expert/${expertId}`)
    },

    navigateToExpertCase(expertId, type) {
      this.$router.push(`/expert/${expertId}/case/c1?type=${type}`)
    },

    navigateToPractice() {
      this.$emit('navigate-to-practice', this.topic.id)
    },

    navigateToDiagnosis() {
      this.$emit('navigate-to-diagnosis', this.topic.id)
    },

    handleFollowUp(query) {
      this.$emit('follow-up', query)
    },

    openModal(expert, type) {
      this.activeExpertForModal = expert
      this.activeModal = type
      if (type === 'audio') this.isPlaying = true
    },

    closeModal() {
      this.activeModal = null
      this.activeExpertForModal = null
      this.isPlaying = false
    },

    handleLike() {
      this.liked = true
      this.toast = '感谢反馈'
      setTimeout(() => {
        this.toast = null
      }, 2000)
      console.log('User liked the prescription')
    },

    handleDislikeSubmit() {
      console.log('Dislike feedback:', { options: this.dislikeOptions, text: this.dislikeText })
      this.showDislikeModal = false
      this.toast = '反馈已上传指挥中心'
      setTimeout(() => {
        this.toast = null
      }, 2000)
      this.dislikeOptions = []
      this.dislikeText = ''
    },

    handleContributionSubmit() {
      console.log('Contribution submitted:', this.contributionForm)
      this.showContributionModal = false
      this.toast = '申请已提交，AI 管理能力提升助手将尽快审核'
      setTimeout(() => {
        this.toast = null
      }, 2000)
      this.contributionForm = { title: '', scenario: '', action: '', expertTitle: '' }
    },

    toggleDislikeOption(option) {
      if (this.dislikeOptions.includes(option)) {
        this.dislikeOptions = this.dislikeOptions.filter(o => o !== option)
      } else {
        this.dislikeOptions.push(option)
      }
    }
  }
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active, .modal-scale-leave-active {
  transition: all 0.3s ease;
}
.modal-scale-enter, .modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter, .toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 50px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); }
}
</style>
