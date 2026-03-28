import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExpertCase, Expert } from '../types';
import { EXPERTS } from '../data';
import {
  Play,
  Pause,
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
  MoreHorizontal,
  Share2,
  Clock,
  Eye
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
  
  // 获取专家信息
  const expert = EXPERTS.find(e => e.id === expertCase.expertId);
  
  // 各图标的状态管理
  const [isLiked, setIsLiked] = useState(initialIsLiked);
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
  
  // Video State
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);

  const autoFocus = propAutoFocus || searchParams.get('type') as any;

  // 显示 Toast
  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };
  
  // ==================== 分享功能 ====================
  const handleShareClick = () => {
    setShowShareDropdown(!showShareDropdown);
    setShowFolderDropdown(false);
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
  
  // ==================== 点赞功能 ====================
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    showToast(isLiked ? '已取消点赞' : '已点赞！', isLiked ? 'info' : 'success');
    if (onTrackInteraction) {
      onTrackInteraction('like');
    }
  };
  
  // ==================== 收藏功能 ====================
  const handleBookmarkToggle = () => {
    if (!isBookmarked) {
      setIsBookmarked(true);
      showToast('已收藏！', 'success');
      setTimeout(() => {
        setShowFolderDropdown(true);
      }, 200);
    } else {
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

  // 自动滚动到指定媒体区域
  useEffect(() => {
    if (!autoFocus) return;
    
    const timer = setTimeout(() => {
      let targetRef = null;
      if (autoFocus === 'video') targetRef = videoSectionRef.current;
      else if (autoFocus === 'text') targetRef = contentSectionRef.current;
      
      if (targetRef) {
        const top = targetRef.offsetTop - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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
      }
      setIsPlayingAudio(!isPlayingAudio);
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
    <div className="min-h-full bg-slate-50 pb-24">
      {/* 内容区域 */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        
        {/* 1. 标题区 - 白色卡片 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4">
            {expertCase.title}
          </h1>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>
          
          {/* 专家信息 - 简化版 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {expert?.avatar ? (
                  <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                ) : (
                  expert?.name?.[0] || '专'
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900">{expert?.name || '专家'}</div>
                <div className="text-xs text-slate-500">{expert?.title || ''}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {expertCase.views?.toLocaleString() || '1,234'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {expertCase.duration || '15 分钟'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2. 视频区块 - 白色卡片 */}
        {expertCase.videoUrl && (
          <motion.div 
            ref={videoSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="aspect-video bg-black relative group rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-full"
                poster={`https://picsum.photos/seed/${expertCase.id}-video/1280/720`}
                onTimeUpdate={() => setVideoCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 0)}
                onEnded={() => setIsPlayingVideo(false)}
              >
                <source src={expertCase.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
              </video>
              
              {/* Custom Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <button onClick={toggleVideo} className="hover:text-amber-400 transition-colors">
                      {isPlayingVideo ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <div className="text-xs font-mono">
                      {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleVideoSpeed}
                      className="text-xs font-bold px-2 py-0.5 border border-white/30 rounded hover:bg-white/20 transition-all"
                    >
                      {videoSpeed}x
                    </button>
                    <button className="hover:text-amber-400 transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {!isPlayingVideo && (
                <button 
                  onClick={toggleVideo}
                  className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-xl">
                    <Play className="w-7 h-7 text-white fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. 音频+正文合并区块 - 白色卡片 */}
        <motion.div 
          ref={contentSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {/* 音频播放器 */}
          {expertCase.audioUrl && (
            <>
              <audio
                ref={audioRef}
                onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
                onEnded={() => setIsPlayingAudio(false)}
              >
                <source src={expertCase.audioUrl || 'https://www.w3schools.com/html/horse.mp3'} type="audio/mpeg" />
              </audio>
              
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 mb-6">
                <button
                  onClick={toggleAudio}
                  className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0"
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-0.5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {expertCase.title} - 音频解读
                  </div>
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
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-md cursor-grab active:cursor-grabbing"
                        style={{ left: `calc(${(audioCurrentTime / audioDuration) * 100 || 0}% - 6px)` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-10">{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </div>
              
              {/* 分隔线 */}
              <div className="h-px bg-slate-200 mb-6"></div>
            </>
          )}
          
          {/* 正文内容 */}
          <div className="prose prose-slate max-w-none">
            {expertCase.coverImage && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={expertCase.coverImage}
                  alt="实战场景"
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="space-y-4 text-slate-700 leading-relaxed">
              {expertCase.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-base">{para}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 4. 讨论区 - 白色卡片 */}
        <motion.div 
          id="comment-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {/* 讨论区标题 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              讨论区
              <span className="text-sm font-normal text-slate-400">({comments.length})</span>
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCommentFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  commentFilter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              <button 
                onClick={() => setCommentFilter('featured')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  commentFilter === 'featured' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                精选
              </button>
            </div>
          </div>
          
          {/* 金色分隔线 */}
          <div className="w-12 h-0.5 bg-amber-400 mb-6"></div>
          
          {/* 评论输入 */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                我
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-xl p-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="分享你的观点，与专家互动..."
                    className="w-full bg-transparent border-none outline-none resize-none text-slate-700 placeholder-slate-400 min-h-[80px]"
                    maxLength={5000}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                      <Hash className="w-4 h-4" />
                      <span>话题</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{commentText.length}/5000</span>
                      <button 
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                        className="px-4 py-2 bg-amber-400 text-white text-sm font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        发布
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 评论列表 */}
          <div className="space-y-4">
            {(commentFilter === 'featured'
              ? comments.filter(c => c.isOfficial)
              : comments
            ).map((comment) => (
              <div key={comment.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-none">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  comment.isOfficial
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {comment.avatar}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 text-sm">{comment.author}</span>
                    {comment.isOfficial && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                        官方
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{comment.date}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{comment.content}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>回复</span>
                    </button>
                    <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-xs">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>点赞</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
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

      {/* 右下角悬浮操作按钮组 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* 点赞 */}
        <button
          onClick={handleLikeToggle}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            isLiked
              ? 'bg-amber-400 text-white'
              : 'bg-white text-slate-400 hover:text-amber-400'
          }`}
          title={isLiked ? '已点赞' : '点赞'}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        {/* 评论 */}
        <button
          onClick={scrollToComment}
          className="w-12 h-12 rounded-full bg-white shadow-lg text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="写评论"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        
        {/* 收藏 */}
        <div className="relative" ref={folderDropdownRef}>
          <button
            onClick={handleBookmarkToggle}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isBookmarked
                ? 'bg-amber-400 text-white'
                : 'bg-white text-slate-400 hover:text-amber-400'
            }`}
            title={isBookmarked ? '已收藏' : '收藏'}
          >
            <Star className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showFolderDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  选择收藏夹
                </div>
                {['未分类', '管理干货', '团队建设', '新建文件夹...'].map((folder) => (
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
        
        {/* 分享 */}
        <div className="relative" ref={shareDropdownRef}>
          <button
            onClick={handleShareClick}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              showShareDropdown
                ? 'bg-amber-400 text-white'
                : 'bg-white text-slate-400 hover:text-amber-400'
            }`}
            title="分享"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showShareDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
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
    </div>
  );
};
