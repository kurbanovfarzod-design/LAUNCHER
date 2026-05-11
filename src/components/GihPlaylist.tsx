import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../lib/i18n';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { sounds } from '../lib/sounds';
import { cn } from '../lib/utils';
import { GihVideo } from '../App';
import { useIdbUrl } from '../hooks/useIdbUrl';

const IdbImage = ({ src, className }: { src: string, className?: string }) => {
  const resolved = useIdbUrl(src);
  return <img src={resolved} className={className} />;
};

const IdbVideo = ({ src, className, videoRef, onEnded, isPlaying }: { src: string, className?: string, videoRef: React.RefObject<HTMLVideoElement>, onEnded: () => void, isPlaying: boolean }) => {
  const resolved = useIdbUrl(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      if (resolved && !resolved.startsWith('idb://')) {
        video.play().catch(e => console.error(e));
      }
    } else {
      video.pause();
    }
  }, [isPlaying, resolved, videoRef]);

  return <video ref={videoRef} src={resolved === src && src.startsWith('idb://') ? '' : resolved} className={className} onEnded={onEnded} playsInline />;
};

interface GihPlaylistProps {
  lang: Language;
  videos: GihVideo[];
  onClose: () => void;
}

export const GihPlaylist = ({ lang, videos, onClose }: GihPlaylistProps) => {
  const t = translations[lang];
  const [absoluteIndex, setAbsoluteIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeArea, setActiveArea] = useState<'list' | 'player'>('list');

  // If there are no videos, show a placeholder or handle it gracefully
  const hasVideos = videos.length > 0;
  const selectedDataIndex = hasVideos ? ((absoluteIndex % videos.length) + videos.length) % videos.length : 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't prevent default on everything, otherwise we might block normal browser keys,
      // but for arrows and enter we should.
      const isBack = e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 461 || e.keyCode === 10009 || e.key === 'GoBack' || e.keyCode === 27 || e.keyCode === 8;
      
      if (isBack) {
        e.preventDefault();
        sounds.playPop();
        if (activeArea === 'player') {
          setActiveArea('list');
          setIsPlaying(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        sounds.playTick();
        if (activeArea === 'list') {
          setAbsoluteIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sounds.playTick();
        if (activeArea === 'list') {
          setAbsoluteIndex(prev => prev - 1);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sounds.playPop();
        if (activeArea === 'list') {
          setActiveArea('player');
          setIsPlaying(true);
        } else if (activeArea === 'player') {
          setIsPlaying(p => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeArea, onClose]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Window of visible indices based on absolute index
  const visibleOffsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const visibleItems = visibleOffsets.map(offset => absoluteIndex + offset);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex-1 w-full px-12 mb-6 relative overflow-hidden flex flex-col min-h-0"
    >
      <AnimatePresence mode="wait">
        {activeArea === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full bg-transparent relative overflow-hidden flex items-center justify-center min-h-0"
          >
            {/* Infinite Horizontal Carousel */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden">
              <AnimatePresence>
                {hasVideos && visibleItems.map((idx) => {
                  const dataIndex = ((idx % videos.length) + videos.length) % videos.length;
                  const video = videos[dataIndex];
                  const offset = idx - absoluteIndex;
                  const isSelected = offset === 0;

                  return (
                      <motion.div 
                        key={idx}
                        initial={{ 
                          opacity: 0, 
                          scale: 0.8,
                          x: `${offset * 105}%` 
                        }}
                        animate={{ 
                          opacity: Math.abs(offset) >= 3 ? 0 : 1, 
                          scale: isSelected ? 1 : 0.85,
                          x: `${offset * 105}%`,
                          zIndex: 10 - Math.abs(offset)
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.8,
                          x: `${offset * 105}%` 
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                        onClick={() => {
                          setAbsoluteIndex(idx);
                          setActiveArea('player');
                          setIsPlaying(true);
                          sounds.playPop();
                        }}
                        className={cn(
                          "absolute rounded-[2rem] h-[90%] max-h-[750px] aspect-[9/16] flex flex-col cursor-pointer overflow-hidden group transition-colors shadow-xl",
                          isSelected 
                            ? "shadow-[0_20px_50px_rgba(0,188,212,0.4)] ring-4 ring-[#00BCD4]/50 hover:ring-[#00BCD4]/70" 
                            : "shadow-lg hover:shadow-2xl"
                        )}
                      >
                      <IdbImage src={video.thumb} className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-24 flex flex-col justify-end">
                        <div className={cn(
                          "w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 transition-transform duration-300",
                          isSelected ? "scale-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        )}>
                          <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                        </div>
                        <span className="font-bold text-xl md:text-2xl leading-tight text-white drop-shadow-md">
                          {video.title[lang]}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeArea === 'player' && (
          <motion.div 
            key="player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-8 z-20 flex items-center gap-6 bg-gradient-to-b from-black/80 to-transparent">
              <button 
                onClick={() => {
                  setActiveArea('list');
                  setIsPlaying(false);
                  sounds.playPop();
                }}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {hasVideos ? videos[selectedDataIndex].title[lang] : ''}
                </h2>
                <p className="text-white/70 text-sm font-medium">
                  {t.aboutGih} • {hasVideos ? selectedDataIndex + 1 : 0} / {videos.length}
                </p>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black" onClick={() => setIsPlaying(!isPlaying)}>
              {hasVideos && (
                <IdbVideo 
                  videoRef={videoRef}
                  src={videos[selectedDataIndex].url} 
                  className="w-full h-full object-contain"
                  isPlaying={isPlaying}
                  onEnded={() => {
                    setAbsoluteIndex(prev => prev + 1);
                  }}
                />
              )}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                  >
                    <PlayCircle className="w-24 h-24 text-white opacity-80 drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

