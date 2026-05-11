import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sounds } from '../lib/sounds';

type FocusID = 'video' | 'youtube' | 'iptv' | 'settings' | 'pin-input' | string;

interface FocusContextType {
  focusedId: FocusID;
  setFocusedId: (id: FocusID) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;
  isGihOpen: boolean;
  setIsGihOpen: (open: boolean) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedId, setFocusedId] = useState<FocusID>('video');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGihOpen, setIsGihOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If settings or GIH are open, we handle focus differently inside them
    if (isSettingsOpen || isGihOpen) return;

    // Fast-path for back/escape in fullscreen
    const isBack = e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 461 || e.keyCode === 10009 || e.key === 'GoBack' || e.keyCode === 27 || e.keyCode === 8;
    if (isFullscreen && isBack) {
      setIsFullscreen(false);
      return;
    }

    // Normal navigation
    if (!isFullscreen) {
      const isEnter = e.key === 'Enter' || e.keyCode === 13 || e.key === 'Select' || e.key === 'OK' || e.keyCode === 23 || e.keyCode === 66 || e.keyCode === 169;
      
      if (isEnter) {
        if (focusedId === 'video') {
          sounds.playTick();
          setIsFullscreen(true);
        }
        return; 
      }

      sounds.playTick();
      
      switch (e.key) {
        case 'ArrowDown':
          if (focusedId === 'video') setFocusedId('gih');
          break;
        case 'ArrowUp':
          if (['gih', 'youtube', 'iptv', 'settings'].includes(focusedId)) setFocusedId('video');
          break;
        case 'ArrowRight':
          if (focusedId === 'gih') setFocusedId('youtube');
          else if (focusedId === 'youtube') setFocusedId('iptv');
          else if (focusedId === 'iptv') setFocusedId('settings');
          break;
        case 'ArrowLeft':
          if (focusedId === 'youtube') setFocusedId('gih');
          else if (focusedId === 'iptv') setFocusedId('youtube');
          else if (focusedId === 'settings') setFocusedId('iptv');
          break;
      }
    }
  }, [focusedId, isSettingsOpen, isFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <FocusContext.Provider value={{ 
      focusedId, 
      setFocusedId, 
      isSettingsOpen, 
      setIsSettingsOpen,
      isFullscreen,
      setIsFullscreen,
      isGihOpen,
      setIsGihOpen
    }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocus must be used within FocusProvider');
  return context;
};
