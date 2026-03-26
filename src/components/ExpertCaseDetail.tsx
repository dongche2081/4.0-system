import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExpertCase } from '../types';
import {
  ChevronLeft,
  Share2,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Check,
  Users,
  X,
  MessageCircle,
  Link2,
  FolderPlus,
  ThumbsUp,
  Star,
  Send,
  Hash,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ExpertCaseDetailProps {
  expertCase: ExpertCase;
  onClose: () => void;
  autoFocusMedia?: 'video' | 'audio' | 'text';
  onTrackInteraction?: (type: 'click' | 'play' | 'bookmark' | 'like' | 'comment') => void;
  initialIsBookmarked?: boolean;
  initialIsLiked?: boolean;
}

export const ExpertCaseDetail: React.FC<ExpertCaseDetailProps> = ({ 
  expertCase, 
  onClose,
  autoFocusMedia: propAutoFocus,
  onTrackInteraction,
  initialIsBookmarked = false,
  initialIsLiked = false
}) => {
  const [searchParams] = useSearchParams();
  
  // 各图标的状态管理
  // 图标2：点赞状态 - 点击切换
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  // 图标3：收藏状态 - 点击切换
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  
  // 分享下拉菜单状态
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [showTeamShareModal, setShowTeamShareModal] = useState(false);
  
  // 收藏夹下拉状态
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('未分类');
  
  // Toast 提示状态
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // 评论区状态
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{
    id: string;
    author: string;
    avatar: string;
    date: string;
    content: string;
    isOfficial?: boolean;
  }>>([
    {
      id: '1',
      author: '魏红亮',
      avatar: '魏',
      date: '2023-05-24',
      content: '宁老师的这节课，我对着电脑把四象限的图画下来，然后看着文字看了两三遍，最后用一个大拇哥来表达敬意！\n\n胡光书老师的《精益管理实战课》中就提到八大浪费，其中有一个是"员工积极性的浪费"，而员工积极性的浪费原因很多，除了我们经常提及的：领导独断、管理上没有鼓励机制外，还有一个非常重要的因素就是员工觉得"公平感"缺失。\n\n鞭打快牛在很多企业尤其是销售部门中是非常常见的，做得好接下来任务就压的重，而且有时候随着任务的增加预期的收入却没有多少增加，在遇到领导只会压任务不会分解任务，员工的公平感就会更加受挫，第一反应往往是：凭啥！',
      isOfficial: true
    }
  ]);
  const [commentFilter, setCommentFilter] = useState<'all' | 'featured'>('all');
  
  // 显示 Toast
  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };
  
  // ==================== 图标1：分享 ====================
  const handleShareClick = () => {
    setShowShareDropdown(!showShareDropdown);
    setShowFolderDropdown(false); // 关闭其他下拉
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('链接已复制', 'success');
    setShowShareDropdown(false);
  };
  
  const handleWechatShare = () => {
    setShowShareDropdown(false);
    setShowWechatModal(true);
  };
  
  const handleTeamShare = () => {
    setShowShareDropdown(false);
    setShowTeamShareModal(true);
  };
  
  // ==================== 图标2：点赞（切换） ====================
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    showToast(isLiked ? '已取消点赞' : '已点赞！', isLiked ? 'info' : 'success');
    if (onTrackInteraction) {
      onTrackInteraction('like');
    }
  };
  
  // ==================== 图标3：收藏（切换） ====================
  const handleBookmarkToggle = () => {
    if (!isBookmarked) {
      // 未收藏 -> 收藏
      setIsBookmarked(true);
      showToast('已收藏！', 'success');
      // 自动打开收藏夹下拉菜单
      setTimeout(() => {
        setShowFolderDropdown(true);
      }, 200);
    } else {
      // 已收藏 -> 取消收藏
      setIsBookmarked(false);
      showToast('已取消收藏', 'info');
    }
    if (onTrackInteraction) {
      onTrackInteraction('bookmark');
    }
  };
  
  // ==================== 评论功能 ====================
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      author: '当前用户',
      avatar: '我',
      date: new Date().toISOString().split('T')[0],
      content: commentText.trim(),
      isOfficial: false
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    showToast('评论发布成功！', 'success');
    
    if (onTrackInteraction) {
      onTrackInteraction('comment');
    }
  };
  
  const handleFolderSelect = (folder: string) => {
    if (folder === '新建文件夹...') {
      showToast('创建新文件夹功能即将上线', 'info');
      setShowFolderDropdown(false);
      return;
    }
    setSelectedFolder(folder);
    setShowFolderDropdown(false);
    showToast(`已保存到「${folder}」`, 'success');
  };
  
  // Video State
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [hasTrackedVideoPlay, setHasTrackedVideoPlay] = useState(false);
  
  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [hasTrackedAudioPlay, setHasTrackedAudioPlay] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const audioSectionRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  
  // 使用 ref 确保 onTrackInteraction 只被调用一次
  const hasTrackedClick = useRef(false);

  const autoFocus = propAutoFocus || searchParams.get('type') as any;

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
        setShowFolderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track CTR on load - 暂时禁用自动跟踪以避免无限循环
  // useEffect(() => {
  //   if (onTrackInteraction && !hasTrackedClick.current) {
  //     hasTrackedClick.current = true;
  //     onTrackInteraction('click');
  //   }
  // }, [onTrackInteraction]);

  // 仅在初始加载时执行一次自动滚动，避免与父容器滚动冲突
  useEffect(() => {
    if (!autoFocus) return;
    
    // 延迟执行，确保父容器已准备好
    const timer = setTimeout(() => {
      let targetRef = null;
      if (autoFocus === 'video') targetRef = videoSectionRef.current;
      else if (autoFocus === 'audio') targetRef = audioSectionRef.current;
      else if (autoFocus === 'text') targetRef = contentSectionRef.current;
      
      if (targetRef) {
        // 使用 scrollTo 而不是 scrollIntoView，避免与父容器冲突
        const top = targetRef.offsetTop - 100; // 留出顶部空间
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // 空依赖数组，只在挂载时执行一次

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // 暂时禁用播放跟踪以避免无限循环
        // if (!hasTrackedVideoPlay && onTrackInteraction) {
        //   onTrackInteraction('play');
        //   setHasTrackedVideoPlay(true);
        // }
      }
      setIsPlayingVideo(!isPlayingVideo);
    }
  };

  const handleVideoSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIndex = (speeds.indexOf(videoSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setVideoSpeed(nextSpeed);
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        // 暂时禁用播放跟踪以避免无限循环
        // if (!hasTrackedAudioPlay && onTrackInteraction) {
        //   onTrackInteraction('play');
        //   setHasTrackedAudioPlay(true);
        // }
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 滚动到评论区
  const scrollToComment = () => {
    const commentSection = document.getElementById('comment-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pt-16 pb-20">
      {/* 固定 Header - fixed 定位，避开左侧边栏 */}
      <header className="fixed top-0 left-16 lg:left-72 right-0 z-50 bg-white border-b border-slate-100 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
            {expertCase.title}
          </h1>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Section 1: Video Center */}
        <section ref={videoSectionRef} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-amber-400 rounded-full"></div>
              视频中心
            </h2>
          </div>
          <div className="aspect-video bg-black relative group">
            <video 
              ref={videoRef}
              className="w-full h-full"
              poster={`https://picsum.photos/seed/${expertCase.id}-video/1280/720`}
              onTimeUpdate={() => setVideoCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 0)}
              onEnded={() => setIsPlayingVideo(false)}
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
            
            {/* Custom Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={toggleVideo} className="hover:text-amber-400 transition-colors">
                    {isPlayingVideo ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <div className="text-xs font-mono">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleVideoSpeed}
                    className="text-xs font-bold px-2 py-1 border border-white/30 rounded hover:bg-white/20 transition-all"
                  >
                    {videoSpeed}x
                  </button>
                  <button className="hover:text-amber-400 transition-colors">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {!isPlayingVideo && (
              <button 
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-2xl shadow-amber-400/40">
                  <Play className="w-10 h-10 text-white fill-current ml-1" />
                </div>
              </button>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-bold text-slate-800 mb-2">{expertCase.title} - 实战拆解视频</h3>
            <p className="text-sm text-slate-500">主讲人：{expertCase.expertName}</p>
          </div>
        </section>

        {/* Section 2: Content Body */}
        <section ref={contentSectionRef} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
          
          {/* 音频播放器 - 嵌入到正文顶部 */}
          <audio
            ref={audioRef}
            onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
            onEnded={() => setIsPlayingAudio(false)}
          >
            <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg" />
          </audio>
          
          {/* 得到APP风格的音频播放器 - 可拖动进度条 */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 mb-8">
            {/* 播放按钮 - 橙色圆形 */}
            <button
              onClick={toggleAudio}
              className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 hover:scale-105 transition-all flex-shrink-0"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-0.5" />}
            </button>
            
            {/* 音频信息 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {expertCase.title} - 音频解读
              </div>
              {/* 可拖动的进度条 */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 w-10 text-right">{formatTime(audioCurrentTime)}</span>
                <div
                  className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    if (audioRef.current) {
                      audioRef.current.currentTime = percent * audioDuration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-amber-400 transition-all duration-100"
                    style={{ width: `${(audioCurrentTime / audioDuration) * 100 || 0}%` }}
                  />
                  {/* 拖动滑块 */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-md cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${(audioCurrentTime / audioDuration) * 100 || 0}% - 6px)` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-10">{formatTime(audioDuration)}</span>
              </div>
            </div>
          </div>
          
          <article className="prose prose-slate max-w-none">
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${expertCase.id}-content/1200/600`}
                alt="实战场景"
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
              {expertCase.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              
              {expertCase.expertInsight && (
                <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 italic relative">
                  <div className="absolute -top-4 left-8 px-4 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">专家点评</div>
                  <p className="text-slate-600">"{expertCase.expertInsight}"</p>
                </div>
              )}
            </div>
          </article>
        </section>

        {/* Section 4: 评论区 */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {/* 我的留言 - 输入区 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">我的留言</h3>
            <div className="flex gap-4">
              {/* 用户头像 */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                我
              </div>
              
              {/* 输入框区域 */}
              <div className="flex-1">
                <div className="bg-slate-50 rounded-xl p-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写留言，与作者互动"
                    className="w-full bg-transparent border-none outline-none resize-none text-slate-700 placeholder-slate-400 min-h-[80px]"
                    maxLength={5000}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      {/* 话题标签 */}
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm">话题</span>
                      </button>
                      {/* 公开/私密切换 */}
                      <button className="flex items-center gap-1 text-amber-500 hover:text-amber-600 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-sm font-medium">公开</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{commentText.length} / 5000</span>
                      <button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                        className="px-6 py-2 bg-amber-400 text-white text-sm font-medium rounded-full hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        发布
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 用户留言列表 */}
          <div>
            {/* 筛选标签 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <h3 className="text-lg font-bold text-slate-900">用户留言</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCommentFilter('all')}
                    className={`text-sm font-medium transition-colors ${
                      commentFilter === 'all' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setCommentFilter('featured')}
                    className={`text-sm font-medium transition-colors ${
                      commentFilter === 'featured' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    精选
                  </button>
                </div>
              </div>
              <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                筛选
              </button>
            </div>

            {/* 评论列表 */}
            <div className="space-y-6">
              {(commentFilter === 'featured'
                ? comments.filter(c => c.isOfficial)
                : comments
              ).map((comment) => (
                <div key={comment.id} className="flex gap-4 pb-6 border-b border-slate-100 last:border-none">
                  {/* 评论者头像 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    comment.isOfficial
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                    {comment.avatar}
                  </div>
                  
                  {/* 评论内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-900">{comment.author}</span>
                      {comment.isOfficial && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                          官方
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{comment.date}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    
                    {/* 评论操作 */}
                    <div className="flex items-center gap-6 mt-3">
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>回复</span>
                      </button>
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        <span>点赞</span>
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 微信分享二维码模态框 */}
      <AnimatePresence>
        {showWechatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowWechatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  微信扫码分享
                </h3>
                <button
                  onClick={() => setShowWechatModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 mb-6">
                {/* 二维码占位 */}
                <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-1 w-32 h-32">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className={`${[0,2,4,6,8,10,12,14,16,18,20,22,24].includes(i) ? 'bg-slate-800' : 'bg-white'} rounded-sm`}
                          style={{ aspectRatio: '1' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                打开微信扫一扫，快速分享给战友
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 团队分享模态框 */}
      <AnimatePresence>
        {showTeamShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTeamShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  分享给战友
                </h3>
                <button
                  onClick={() => setShowTeamShareModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {[
                  { name: '王志强', role: '产品总监', avatar: 'WZ' },
                  { name: '李晓红', role: 'HRBP', avatar: 'LX' },
                  { name: '陈建华', role: '技术负责人', avatar: 'CJ' },
                  { name: '赵敏', role: '运营经理', avatar: 'ZM' },
                  { name: '刘建国', role: '销售总监', avatar: 'LJ' },
                ].map((colleague, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    onClick={() => {
                      showToast(`已分享给 ${colleague.name}`, 'success');
                      setShowTeamShareModal(false);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                      {colleague.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-800">{colleague.name}</div>
                      <div className="text-xs text-slate-500">{colleague.role}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作栏 */}
      <footer className="fixed bottom-0 left-16 lg:left-72 right-0 z-50 bg-white border-t border-slate-100 shadow-sm px-4 md:px-8 py-3 flex items-center justify-center gap-2">
        {/* 图标群 - 从左到右：点赞、评论、收藏、分享 */}
        <div className="flex items-center gap-1">
          {/* ========== 图标1：点赞（大拇指） ========== */}
          <button
            onClick={handleLikeToggle}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              isLiked
                ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                : 'hover:bg-slate-100 text-slate-400'
            }`}
            title={isLiked ? '已点赞，点击取消' : '点赞'}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          {/* ========== 图标2：评论 ========== */}
          <button
            onClick={scrollToComment}
            className="p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-400"
            title="写评论"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          {/* ========== 图标3：收藏（五角星） ========== */}
          <div className="relative" ref={folderDropdownRef}>
            <button
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                  : 'hover:bg-slate-100 text-slate-400'
              }`}
              title={isBookmarked ? '已收藏，点击取消' : '收藏'}
            >
              <Star className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            
            {/* 收藏夹下拉菜单 */}
            <AnimatePresence>
              {showFolderDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    选择收藏夹
                  </div>
                  {['未分类', 'Favorites', 'Tech Insights', '新建文件夹...'].map((folder, index) => (
                    <button
                      key={folder}
                      onClick={() => handleFolderSelect(folder)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        selectedFolder === folder
                          ? 'bg-amber-100 text-amber-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {folder === '新建文件夹...' ? (
                          <FolderPlus className="w-4 h-4" />
                        ) : (
                          <Star className={`w-4 h-4 ${selectedFolder === folder ? 'fill-current' : ''}`} />
                        )}
                        {folder}
                      </span>
                      {selectedFolder === folder && folder !== '新建文件夹...' && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* ========== 图标4：分享 ========== */}
          <div className="relative" ref={shareDropdownRef}>
            <button
              onClick={handleShareClick}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                showShareDropdown
                  ? 'bg-amber-100 text-amber-600'
                  : 'hover:bg-slate-100 text-slate-400'
              }`}
              title="分享"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {/* 分享下拉菜单 */}
            <AnimatePresence>
              {showShareDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <Link2 className="w-4 h-4 text-slate-400" />
                    复制链接
                  </button>
                  <button
                    onClick={handleWechatShare}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    分享到微信
                  </button>
                  <button
                    onClick={handleTeamShare}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <Users className="w-4 h-4 text-amber-500" />
                    内部团队分享
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </footer>
    </div>
  );
};
