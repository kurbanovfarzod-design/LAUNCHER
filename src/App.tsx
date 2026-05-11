/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoBlock } from './components/VideoBlock';
import { InfoCard } from './components/InfoCard';
import { BottomMenu } from './components/BottomMenu';
import { Settings } from './components/Settings';
import { GihPlaylist } from './components/GihPlaylist';
import { FocusProvider, useFocus } from './hooks/useFocus';
import { Language, translations } from './lib/i18n';
import { sounds } from './lib/sounds';

export interface GihVideo {
  id: string;
  title: Record<Language, string>;
  url: string;
  thumb: string;
}

const DEFAULT_VIDEO = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; // Placeholder for hospital video
const DEFAULT_PIN = '1234';
const DEFAULT_YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const DEFAULT_QR = 'https://globalhospital.com';

const DEFAULT_GIH_VIDEOS: GihVideo[] = [
  { id: '1', title: { ru: 'О клинике', uz: 'Klinika haqida', en: 'About Clinic' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' },
  { id: '2', title: { ru: 'Наши стандарты', uz: 'Bizning standartlar', en: 'Our Standards' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg' },
  { id: '3', title: { ru: 'Отделение хирургии', uz: 'Xirurgiya bo\'limi', en: 'Surgery Department' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg' },
  { id: '4', title: { ru: 'Реабилитация', uz: 'Reabilitatsiya', en: 'Rehabilitation' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg' },
  { id: '5', title: { ru: 'Отзывы пациентов', uz: 'Bemorlar sharhlari', en: 'Patient Reviews' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg' },
  { id: '6', title: { ru: 'Инновации', uz: 'Innovatsiyalar', en: 'Innovations' }, url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg' },
];

function AppContent() {
  const { setFocusedId, isSettingsOpen, setIsSettingsOpen, isFullscreen, setIsFullscreen, isGihOpen, setIsGihOpen } = useFocus();
  
  // State from LocalStorage
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('hospital_lang') as Language) || 'ru');
  const [pin, setPin] = useState(() => localStorage.getItem('hospital_pin') || DEFAULT_PIN);
  const [youtubeUrl, setYoutubeUrl] = useState(() => localStorage.getItem('hospital_yt') || DEFAULT_YOUTUBE);
  const [iptvApp, setIptvApp] = useState(() => localStorage.getItem('hospital_iptv') || 'Smart IPTV');
  const [soundsEnabled, setSoundsEnabled] = useState(() => (localStorage.getItem('hospital_sounds') || 'true') === 'true');
  const [qrLink, setQrLink] = useState(() => localStorage.getItem('hospital_qr') || DEFAULT_QR);
  const [videoUrl, setVideoUrl] = useState(() => {
    const saved = localStorage.getItem('hospital_video');
    if (saved?.startsWith('blob:')) return DEFAULT_VIDEO;
    return saved || DEFAULT_VIDEO;
  });
  const [weatherCity, setWeatherCity] = useState(() => localStorage.getItem('hospital_weather_city') || 'Tashkent');
  const [wifiLogin, setWifiLogin] = useState(() => localStorage.getItem('hospital_wifi_login') || '');
  const [wifiPassword, setWifiPassword] = useState(() => localStorage.getItem('hospital_wifi_password') || '');
  const [gihVideos, setGihVideos] = useState<GihVideo[]>(() => {
    try {
      const saved = localStorage.getItem('hospital_gih_videos');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEFAULT_GIH_VIDEOS;
  });

  // Update sound manager
  useEffect(() => {
    sounds.setEnabled(soundsEnabled);
  }, [soundsEnabled]);

  // Persist state
  useEffect(() => localStorage.setItem('hospital_lang', lang), [lang]);
  useEffect(() => localStorage.setItem('hospital_pin', pin), [pin]);
  useEffect(() => localStorage.setItem('hospital_yt', youtubeUrl), [youtubeUrl]);
  useEffect(() => localStorage.setItem('hospital_iptv', iptvApp), [iptvApp]);
  useEffect(() => localStorage.setItem('hospital_sounds', String(soundsEnabled)), [soundsEnabled]);
  useEffect(() => localStorage.setItem('hospital_qr', qrLink), [qrLink]);
  useEffect(() => localStorage.setItem('hospital_video', videoUrl), [videoUrl]);
  useEffect(() => localStorage.setItem('hospital_weather_city', weatherCity), [weatherCity]);
  useEffect(() => localStorage.setItem('hospital_wifi_login', wifiLogin), [wifiLogin]);
  useEffect(() => localStorage.setItem('hospital_wifi_password', wifiPassword), [wifiPassword]);
  useEffect(() => localStorage.setItem('hospital_gih_videos', JSON.stringify(gihVideos)), [gihVideos]);

  return (
    <div className="relative w-screen h-screen bg-[#F0F4F8] overflow-hidden font-sans select-none flex flex-col">
      {/* Background Ambience - Modified for lighter theme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#00BCD4]/10 blur-[250px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/40 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Header lang={lang} city={weatherCity} />
        
        {isGihOpen ? (
          <GihPlaylist lang={lang} videos={gihVideos} onClose={() => {
            setIsGihOpen(false);
            setFocusedId('gih');
          }} />
        ) : (
          <>
            <main className="flex-1 grid grid-cols-12 gap-8 px-12 mt-6 items-stretch min-h-0 pb-6">
              <div className="col-span-8 h-full flex flex-col">
                <VideoBlock 
                  lang={lang} 
                  videoUrl={videoUrl} 
                  isMuted={isSettingsOpen}
                />
              </div>
              <div className="col-span-4 h-full flex flex-col items-start">
                <InfoCard lang={lang} qrLink={qrLink} wifiLogin={wifiLogin} wifiPassword={wifiPassword} />
              </div>
            </main>

            <BottomMenu 
              lang={lang} 
              youtubeUrl={youtubeUrl} 
              iptvApp={iptvApp}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
                setFocusedId('settings');
              }}
              onOpenGih={() => setIsGihOpen(true)}
            />
          </>
        )}
      </div>

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentLang={lang}
        onLangChange={setLang}
        pin={pin}
        onPinChange={setPin}
        youtubeUrl={youtubeUrl}
        onYoutubeUrlChange={setYoutubeUrl}
        iptvApp={iptvApp}
        onIptvAppChange={setIptvApp}
        soundsEnabled={soundsEnabled}
        onSoundsToggle={setSoundsEnabled}
        qrLink={qrLink}
        onQrLinkChange={setQrLink}
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        weatherCity={weatherCity}
        onWeatherCityChange={setWeatherCity}
        wifiLogin={wifiLogin}
        onWifiLoginChange={setWifiLogin}
        wifiPassword={wifiPassword}
        onWifiPasswordChange={setWifiPassword}
        gihVideos={gihVideos}
        onGihVideosChange={setGihVideos}
      />
    </div>
  );
}

export default function App() {
  return (
    <FocusProvider>
      <AppContent />
    </FocusProvider>
  );
}

