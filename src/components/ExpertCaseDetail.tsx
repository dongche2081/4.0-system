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
  Share2,
  Clock,
  Eye,
  Loader2,
  Minimize2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  
  const expert = EXPERTS.find(e => e.id === expertCase.expertId);
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [showTeamShareModal, setShowTeamShareModal] = useState(false);
  
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('未分类');
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // 评论相关状态
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Array<{
    id: string;
    author: string;
    avatar: string;
    date: string;
    content: string;
    isOfficial?: boolean;
    likes?: number;
    replies?: Array<{
      id: string;
      author: string;
      avatar: string;
      date: string;
      content: string;
    }>;
  }>>([
    {
      id: '1',
      author: '魏红亮',
      avatar: '魏',
      date: '2023-05-24',
      content: '宁老师的这节课，我对着电脑把四象限的图画下来，然后看着文字看了两三遍，最后用一个大拇哥来表达敬意！\n\n胡光书老师的《精益管理实战课》中就提到八大浪费，其中有一个是"员工积极性的浪费"...',
      isOfficial: true,
      likes: 12,
      replies: []
    }
  ]);
  const [commentFilter, setCommentFilter] = useState<'all' | 'featured'>('all');
  
  // 视频状态
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 音频状态
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

  // 话题标签
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const topics = ['执行力', '团队管理', '绩效面谈', '跨部门协作', '人才保留'];

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);

  const autoFocus = propAutoFocus || searchParams.get('type') as any;

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };
  
  // 分享功能
  const handleShareClick = () => {
    setShowShareDropdown(!showShareDropdown);
    setShowFolderDropdown(false);
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制', 'success');
    } catch {
      showToast('复制失败', 'error' as any);
    }
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
  
  // 点赞功能
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    showToast(isLiked ? '已取消点赞' : '已点赞！', isLiked ? 'info' : 'success');
    if (onTrackInteraction) {
      onTrackInteraction('like');
    }
  };
  
  // 评论点赞
  const handleCommentLike = (commentId: string) => {
    setCommentLikes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        showToast('已取消点赞', 'info');
      } else {
        newSet.add(commentId);
        showToast('点赞成功！', 'success');
      }
      return newSet;
    });
  };
  
  // 回复评论
  const handleReplyClick = (commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    if (replyTo !== commentId) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setCommentText(`@${comment.author} `);
      }
    } else {
      setCommentText('');
    }
  };
  
  // 插入话题
  const handleTopicClick = () => {
    setShowTopicDropdown(!showTopicDropdown);
  };
  
  const insertTopic = (topic: string) => {
    setCommentText(prev => prev + `#${topic}# `);
    setShowTopicDropdown(false);
  };
  
  // 收藏功能
  const handleBookmarkToggle = () => {
    if (!isBookmarked) {
      setIsBookmarked(true);
      showToast('已收藏！', 'success');
    } else {
      setIsBookmarked(false);
      showToast('已取消收藏', 'info');
    }
    if (onTrackInteraction) {
      onTrackInteraction('bookmark');
    }
  };
  
  // 提交评论
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      author: '当前用户',
      avatar: '我',
      date: new Date().toISOString().split('T')[0],
      content: commentText.trim(),
      isOfficial: false,
      likes: 0,
      replies: []
    };
    
    if (replyTo) {
      // 添加回复
      setComments(prev => prev.map(c => {
        if (c.id === replyTo) {
          return {
            ...c,
            replies: [...(c.replies || []), {
              id: Date.now().toString(),
              author: '当前用户',
              avatar: '我',
              date: new Date().toISOString().split('T')[0],
              content: commentText.trim()
            }]
          };
        }
        return c;
      }));
      showToast('回复发布成功！', 'success');
      setReplyTo(null);
    } else {
      setComments([newComment, ...comments]);
      showToast('评论发布成功！', 'success');
    }
    
    setCommentText('');
    
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
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setShowTopicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 自动滚动
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

  // 视频控制
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

  // 全屏功能
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('全屏切换失败:', error);
      showToast('全屏切换失败', 'error' as any);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const scrollToComment = () => {
    const commentSection = document.getElementById('comment-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 处理视频点击播放
  const handleVideoContainerClick = (e: React.MouseEvent) => {
    // 如果点击的是控制按钮区域，不触发播放
    if ((e.target as HTMLElement).closest('.video-controls')) return;
    toggleVideo();
  };

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        
        {/* 1. 标题区 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4">
            {expertCase.title}
          </h1>
          
          <div className="w-12 h-0.5 bg-amber-400 mb-4"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all">
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

        {/* 2. 视频区块 */}
        {expertCase.videoUrl && (
          <motion.div 
            ref={videoSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div 
              ref={videoContainerRef}
              className="aspect-video bg-black relative group rounded-lg overflow-hidden cursor-pointer"
              onClick={handleVideoContainerClick}
            >
              {/* 加载状态 */}
              {isVideoLoading && (
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                    <span className="text-sm text-slate-400">视频加载中...</span>
                  </div>
                </div>
              )}
              
              <video 
                ref={videoRef}
                className="w-full h-full"
                poster={`https://picsum.photos/seed/${expertCase.id}-video/1280/720`}
                onTimeUpdate={() => setVideoCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => {
                  setVideoDuration(videoRef.current?.duration || 0);
                  setIsVideoLoading(false);
                }}
                onEnded={() => setIsPlayingVideo(false)}
                onWaiting={() => setIsVideoLoading(true)}
                onPlaying={() => setIsVideoLoading(false)}
              >
                <source src={expertCase.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
              </video>
              
              {/* Custom Controls Overlay */}
              <div className="video-controls absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {isPlayingVideo ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <div className="text-xs font-mono">
                      {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleVideoSpeed(); }}
                      className="text-xs font-bold px-2 py-0.5 border border-white/30 rounded hover:bg-white/20 transition-all"
                    >
                      {videoSpeed}x
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 播放按钮 */}
              {!isPlayingVideo && !isVideoLoading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
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

        {/* 3. 音频+正文合并区块 */}
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
                onLoadedMetadata={() => {
                  setAudioDuration(audioRef.current?.duration || 0);
                  setIsAudioLoading(false);
                }}
                onEnded={() => setIsPlayingAudio(false)}
                onWaiting={() => setIsAudioLoading(true)}
                onPlaying={() => setIsAudioLoading(false)}
              >
                <source src={expertCase.audioUrl} type="audio/mpeg" />
              </audio>
              
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 mb-6">
                <button
                  onClick={toggleAudio}
                  disabled={isAudioLoading}
                  className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0 disabled:opacity-50"
                >
                  {isAudioLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    isPlayingAudio ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
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
              
              <div className="h-px bg-slate-100 mb-6"></div>
            </>
          )}
          
          {/* 正文内容 - Markdown 渲染 */}
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
            
            <div className="text-slate-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {expertCase.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* 4. 讨论区 */}
        <motion.div 
          id="comment-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
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
          
          {/* 评论输入 */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                我
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-xl p-4">
                  {replyTo && (
                    <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                      <span>正在回复...</span>
                      <button 
                        onClick={() => { setReplyTo(null); setCommentText(''); }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        handleSubmitComment();
                      }
                    }}
                    placeholder="分享你的观点，与专家互动..."
                    className="w-full bg-transparent border-none outline-none resize-none text-slate-700 placeholder-slate-400 min-h-[120px]"
                    maxLength={5000}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="relative" ref={topicDropdownRef}>
                      <button 
                        onClick={handleTopicClick}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                      >
                        <Hash className="w-4 h-4" />
                        <span>话题</span>
                      </button>
                      
                      {/* 话题下拉 */}
                      {showTopicDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                          {topics.map(topic => (
                            <button
                              key={topic}
                              onClick={() => insertTopic(topic)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              #{topic}#
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{commentText.length}/5000</span>
                      <span className="text-xs text-slate-400">Ctrl+Enter 发送</span>
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
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {comment.avatar}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 text-sm">{comment.author}</span>
                    {comment.isOfficial && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                        官方
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{comment.date}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{comment.content}</p>
                  
                  {/* 回复列表 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-2 bg-slate-50 rounded-lg p-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {reply.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 text-xs">{reply.author}</span>
                              <span className="text-xs text-slate-400">{reply.date}</span>
                            </div>
                            <p className="text-slate-700 text-xs leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => handleReplyClick(comment.id)}
                      className={`flex items-center gap-1 transition-colors text-xs ${
                        replyTo === comment.id ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>回复</span>
                    </button>
                    <button 
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1 transition-colors text-xs ${
                        commentLikes.has(comment.id) ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${commentLikes.has(comment.id) ? 'fill-current' : ''}`} />
                      <span>{(comment.likes || 0) + (commentLikes.has(comment.id) ? 1 : 0)}</span>
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
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
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
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                    alt="微信分享二维码"
                    className="w-full h-full"
                  />
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm">
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
        
        <button
          onClick={scrollToComment}
          className="w-12 h-12 rounded-full bg-white shadow-lg text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="写评论"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        
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
