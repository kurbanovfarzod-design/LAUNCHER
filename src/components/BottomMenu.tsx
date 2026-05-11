import React from 'react';
import { Youtube, Monitor, Settings as SettingsIcon, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useFocus } from '../hooks/useFocus';
import { translations, Language } from '../lib/i18n';
import { cn } from '../lib/utils';
import { sounds } from '../lib/sounds';

interface BottomMenuProps {
  lang: Language;
  youtubeUrl: string;
  iptvApp: string;
  onOpenSettings: () => void;
  onOpenGih: () => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({ 
  lang, 
  youtubeUrl, 
  iptvApp,
  onOpenSettings,
  onOpenGih
}) => {
  const { focusedId } = useFocus();
  const t = translations[lang];

  const menuItems = [
    { id: 'gih', icon: PlayCircle, label: t.aboutGih, color: 'bg-emerald-600', sub: t.aboutGihSub, action: onOpenGih },
    { id: 'youtube', icon: Youtube, label: t.youtube, color: 'bg-red-600', sub: t.streaming, action: () => window.open(youtubeUrl, '_blank') },
    { id: 'iptv', icon: Monitor, label: t.iptv, color: 'bg-indigo-600', sub: t.liveTv, action: () => alert(`Opening IPTV: ${iptvApp}`) },
    { id: 'settings', icon: SettingsIcon, label: t.settings, color: 'bg-gray-800', sub: t.system, action: onOpenSettings },
  ];

  // Global listener for Enter on menu items
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const item = menuItems.find(i => i.id === focusedId);
        if (item) {
          sounds.playPop();
          item.action();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusedId, youtubeUrl, iptvApp, onOpenSettings, onOpenGih]);

  return (
    <div className="mt-4 mb-4 w-full flex justify-center gap-8 px-12">
      {menuItems.map((item) => {
        const isFocused = focusedId === item.id;
        return (
          <motion.div
            key={item.id}
            animate={{ 
              scale: isFocused ? 1.05 : 1,
              y: isFocused ? -8 : 0
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "relative flex-1 group cursor-pointer h-32",
              "bg-white rounded-[24px] p-6",
              "flex items-center gap-6",
              "border-4 border-white card-shadow transition-all duration-300",
              isFocused && "medical-cyan-glow"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300",
              item.color,
              isFocused ? "scale-110" : ""
            )}>
              <item.icon className="w-8 h-8 text-white" />
            </div>

            <div className="flex flex-col">
              <span className={cn(
                "text-xl font-bold tracking-tight",
                isFocused ? "text-[#1A202C]" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </div>
            
            {isFocused && (
              <div className="absolute right-6 w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
