import React, { useState, useEffect } from 'react';
import { Cloud, Wifi, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru, uz, enUS } from 'date-fns/locale';
import { Language, translations } from '../lib/i18n';

interface HeaderProps {
  lang: Language;
  city: string;
}

export const Header: React.FC<HeaderProps> = ({ lang, city }) => {
  const [time, setTime] = useState(new Date());
  const t = translations[lang];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocale = () => {
    if (lang === 'uz') return uz;
    if (lang === 'en') return enUS;
    return ru;
  };

  return (
    <header className="flex justify-between items-center w-full px-12 pt-10">
      <div className="flex items-center">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="h-14 w-auto object-contain"
          onError={(e) => {
            // If logo is not found, show a placeholder or keep space
            e.currentTarget.style.opacity = '0';
          }}
        />
      </div>

      <div className="flex items-center gap-10">
        {/* Network Status Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-white">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{t.wifiConnected}</span>
        </div>

        <div className="h-10 w-[1px] bg-gray-300" />

        {/* Weather */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-[#1A202C]">22°C</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{t.sunny} | {(t.cities as any)[city] || city}</span>
          </div>
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(250,204,21,0.3)]">
            <Cloud className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="h-10 w-[1px] bg-gray-300" />

        {/* Time and Date */}
        <div className="flex flex-col items-end">
          <span className="text-4xl font-light text-[#1A202C]">
            {format(time, 'HH:mm')}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {format(time, 'EEEE, MMM d', { locale: getLocale() })}
          </span>
        </div>
      </div>
    </header>
  );
};
