// 话题详情页面文案配置
export const TOPIC_DETAIL_MESSAGES = {
  // 空状态
  emptyCaseStudy: {
    title: '暂无案例内容',
    description: '该话题正在完善中，敬请期待更多实战经验分享',
    action: '去其他话题看看',
  },

  // 加载状态
  loading: {
    title: '加载中...',
    description: '正在获取话题详情',
  },

  // 错误状态
  error: {
    title: '加载失败',
    description: '抱歉，无法加载话题详情，请稍后重试',
    retry: '重新加载',
  },

  // AI解析卡片
  aiAnalysis: {
    title: 'AI 智能解析算法',
    expand: '展开详细内容',
    collapse: '收起内容',
  },

  // 专家卡片
  expert: {
    title: '参考专家',
    video: '视频',
    audio: '音频',
    text: '文本',
    noExpert: '暂无匹配专家',
  },

  // 实战转化
  practice: {
    title: '实战转化',
    chatTitle: '聊一聊',
    chatDesc: '深度分析你的情况',
    practiceTitle: '练一练',
    practiceDesc: '实战模拟训练',
  },

  // 相关话题
  relatedTopics: {
    title: '相关话题',
    more: '查看更多',
  },

  // 操作按钮
  actions: {
    copy: '复制',
    like: '点赞',
    dislike: '点踩',
    bookmark: '收藏',
    contribute: '我也来支招',
  },

  // Toast 提示
  toast: {
    copySuccess: '内容已复制到剪贴板',
    likeSuccess: '点赞成功！',
    bookmarkSuccess: '收藏成功！',
    feedbackSuccess: '感谢您的反馈，我们会持续改进',
    contributeSuccess: '感谢您的分享，审核通过后将展示',
  },

  // 确认弹窗
  confirm: {
    chatTitle: '确认跳转',
    chatMessage: '即将进入"聊一聊"模块，AI将深度分析您的管理困境。是否继续？',
    practiceTitle: '确认跳转',
    practiceMessage: '即将进入"练一练"模块，开始实战模拟训练。是否继续？',
    confirm: '确认',
    cancel: '取消',
  },
};

// 常量配置
export const TOPIC_DETAIL_CONSTANTS = {
  MAX_EXPERTS_DISPLAY: 3,
  MAX_RELATED_TOPICS: 4,
  EXPANDED_LINES: 6,
};
