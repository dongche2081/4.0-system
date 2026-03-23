import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExpertCase } from '../types';
import { 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Maximize2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
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

  const autoFocus = propAutoFocus || searchParams.get('type') as any;

  // Track CTR on load
  useEffect(() => {
    if (onTrackInteraction) {
      onTrackInteraction(expertCase.expertId, 'click');
    }
  }, [expertCase.expertId, onTrackInteraction]);

  useEffect(() => {
    if (autoFocus === 'video' && videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (autoFocus === 'audio' && audioSectionRef.current) {
      audioSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (autoFocus === 'text' && contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [autoFocus]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const handleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    if (newState && onTrackInteraction) {
      onTrackInteraction(expertCase.expertId, 'bookmark');
    }
  };

  const handleLike = () => {
    const newState = !isLiked;
    setIsLiked(newState);
    if (newState && onTrackInteraction) {
      onTrackInteraction(expertCase.expertId, 'like');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (!hasTrackedVideoPlay && onTrackInteraction) {
          onTrackInteraction(expertCase.expertId, 'play');
          setHasTrackedVideoPlay(true);
        }
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
        if (!hasTrackedAudioPlay && onTrackInteraction) {
          onTrackInteraction(expertCase.expertId, 'play');
          setHasTrackedAudioPlay(true);
        }
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95"
            title="分享链接"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLike}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-slate-100 text-slate-600'}`}
            title="点赞"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleBookmark}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${isBookmarked ? 'bg-[#F2C94C]/10 text-[#F2C94C]' : 'hover:bg-slate-100 text-slate-600'}`}
            title="收藏"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Section 1: Video Center */}
        <section ref={videoSectionRef} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#F2C94C] rounded-full"></div>
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
                  <button onClick={toggleVideo} className="hover:text-[#F2C94C] transition-colors">
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
                  <button className="hover:text-[#F2C94C] transition-colors">
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
                <div className="w-20 h-20 bg-[#F2C94C] rounded-full flex items-center justify-center shadow-2xl shadow-[#F2C94C]/40">
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

        {/* Section 2: Audio Center */}
        <section ref={audioSectionRef} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-8">
            <div className="w-1 h-5 bg-[#F2C94C] rounded-full"></div>
            音频中心
          </h2>
          
          <div className="flex flex-col items-center gap-8">
            {/* Waveform Visualization (Simulated) */}
            <div className="w-full h-24 flex items-center justify-center gap-1">
              {[...Array(40)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={isPlayingAudio ? {
                    height: [20, Math.random() * 60 + 20, 20]
                  } : { height: 20 }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-1.5 bg-[#F2C94C] rounded-full opacity-60"
                />
              ))}
            </div>

            <audio 
              ref={audioRef}
              onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
              onEnded={() => setIsPlayingAudio(false)}
            >
              <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg" />
            </audio>

            <div className="flex items-center gap-8">
              <button onClick={() => skipAudio(-30)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <RotateCcw className="w-6 h-6" />
              </button>
              <button 
                onClick={toggleAudio}
                className="w-16 h-16 bg-[#F2C94C] rounded-full flex items-center justify-center shadow-xl shadow-[#F2C94C]/20 hover:scale-105 transition-all"
              >
                {isPlayingAudio ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current ml-1" />}
              </button>
              <button onClick={() => skipAudio(30)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full space-y-2">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#F2C94C] transition-all duration-300" 
                  style={{ width: `${(audioCurrentTime / audioDuration) * 100 || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{formatTime(audioCurrentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Content Body */}
        <section ref={contentSectionRef} className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-8">
            <div className="w-1 h-5 bg-[#F2C94C] rounded-full"></div>
            图文正文
          </h2>
          
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
                  <div className="absolute -top-4 left-8 px-4 py-1 bg-[#F2C94C] text-white text-xs font-bold rounded-full">专家点评</div>
                  <p className="text-slate-600">“{expertCase.expertInsight}”</p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>

      {/* Copy Toast */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold">链接已复制，快去分享给战友吧</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
