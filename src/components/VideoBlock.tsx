import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFocus } from '../hooks/useFocus';
import { translations, Language } from '../lib/i18n';
import { sounds } from '../lib/sounds';

interface VideoBlockProps {
  lang: Language;
  videoUrl: string;
  isMuted: boolean;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ 
  lang, 
  videoUrl, 
  isMuted
}) => {
  const { focusedId, setFocusedId, isFullscreen, setIsFullscreen, isSettingsOpen } = useFocus();
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = translations[lang];

  const isActive = focusedId === 'video';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => {
        console.log("Autoplay blocked:", err);
      });
    }
  }, [isFullscreen, isSettingsOpen]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(err => {
        console.log("Autoplay blocked, waiting for interaction:", err);
      });
    }
  }, [videoUrl]);

  return (
    <div 
      onClick={() => {
        if (!isFullscreen) {
          setFocusedId('video');
          setIsFullscreen(true);
        }
      }}
      className={cn(
        "transition-all duration-500 overflow-hidden",
        isFullscreen 
          ? "fixed inset-0 z-[100] bg-black border-none rounded-none w-screen h-screen" 
          : "relative flex-1 h-full rounded-[40px] bg-[#1A202C] border-4 border-white card-shadow",
        !isFullscreen && isActive ? "medical-cyan-glow scale-[1.02]" : (!isFullscreen ? "shadow-xl" : "")
      )}>
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        playsInline
        controls={isFullscreen}
        className={cn(
          isFullscreen ? "w-full h-full object-contain opacity-100" : "absolute inset-0 w-full h-full object-cover opacity-80"
        )}
      />
      
      {/* Overlay */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl pointer-events-none">
            <Play className="w-10 h-10 text-white fill-current ml-1" />
          </div>

          {isActive && (
            <motion.div 
              initial={{ opacity: 0.4 }}
              animate={{ 
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-4 text-white text-[10px] font-bold uppercase tracking-[0.25em] drop-shadow-2xl pointer-events-none"
            >
              {t.pressOk}
            </motion.div>
          )}
        </div>
      )}

      {/* Fullscreen Video Hints */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 left-10 text-white/50 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md z-[110] pointer-events-none"
          >
            {t.pressBack}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
