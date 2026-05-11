import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Languages, Video, Link, Monitor, Volume2, QrCode, Home, 
  ChevronRight, Save, X, ArrowLeft, Settings as SettingsIcon, Cloud, Wifi,
  PlaySquare
} from 'lucide-react';
import { translations, Language } from '../lib/i18n';
import { cn } from '../lib/utils';
import { sounds } from '../lib/sounds';
import { GihVideo } from '../App';
import { set } from 'idb-keyval';
import { useIdbUrl } from '../hooks/useIdbUrl';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  pin: string;
  onPinChange: (pin: string) => void;
  youtubeUrl: string;
  onYoutubeUrlChange: (url: string) => void;
  iptvApp: string;
  onIptvAppChange: (app: string) => void;
  soundsEnabled: boolean;
  onSoundsToggle: (enabled: boolean) => void;
  qrLink: string;
  onQrLinkChange: (link: string) => void;
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  weatherCity: string;
  onWeatherCityChange: (city: string) => void;
  wifiLogin: string;
  onWifiLoginChange: (login: string) => void;
  wifiPassword: string;
  onWifiPasswordChange: (password: string) => void;
  gihVideos: GihVideo[];
  onGihVideosChange: (videos: GihVideo[]) => void;
}

export const Settings: React.FC<SettingsProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'pin' | 'lang' | 'video' | 'youtube' | 'iptv' | 'sounds' | 'qr' | 'weather' | 'wifi' | 'gih'>('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  
  const t = translations[props.currentLang];

  const menuItems = [
    { id: 'pin', icon: Key, label: t.changePin },
    { id: 'lang', icon: Languages, label: t.changeLang },
    { id: 'video', icon: Video, label: t.usbVideo },
    { id: 'gih', icon: PlaySquare, label: t.aboutGih },
    { id: 'youtube', icon: Link, label: t.youtubeLink },
    { id: 'iptv', icon: Monitor, label: t.iptvApp },
    { id: 'sounds', icon: Volume2, label: t.uiSounds },
    { id: 'qr', icon: QrCode, label: t.qrSettings },
    { id: 'wifi', icon: Wifi, label: t.wifiSettings },
    { id: 'weather', icon: Cloud, label: t.weatherSettings },
  ];

  const handlePinSubmit = () => {
    if (enteredPin === props.pin) {
      setIsAuthenticated(true);
      sounds.playSuccess();
      setErrorVisible(false);
    } else {
      sounds.playError();
      setErrorVisible(true);
      setEnteredPin('');
      setTimeout(() => setErrorVisible(false), 2000);
    }
  };

  useEffect(() => {
    if (!props.isOpen) {
      setIsAuthenticated(false);
      setEnteredPin('');
      setActiveTab('menu');
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (!isAuthenticated) {
        if (e.key >= '0' && e.key <= '9') {
          if (enteredPin.length < 4) {
            setEnteredPin(prev => prev + e.key);
            sounds.playTick();
          }
        }
        if (e.key === 'Enter' && enteredPin.length === 4) handlePinSubmit();
        if (e.key === 'Backspace') {
          setEnteredPin(prev => prev.slice(0, -1));
          sounds.playTick();
        }
        if (e.key === 'Escape') props.onClose();
        return;
      }

      // If Authenticated
      switch (e.key) {
        case 'ArrowDown':
          if (activeTab === 'menu') {
            setMenuIndex(prev => Math.min(prev + 1, menuItems.length - 1));
            sounds.playTick();
          }
          break;
        case 'ArrowUp':
          if (activeTab === 'menu') {
            setMenuIndex(prev => Math.max(prev - 1, 0));
            sounds.playTick();
          }
          break;
        case 'Enter':
          if (activeTab === 'menu') {
            setActiveTab(menuItems[menuIndex].id as any);
            sounds.playPop();
          }
          break;
        case 'Backspace':
        case 'Escape':
          if (activeTab === 'menu') props.onClose();
          else {
            setActiveTab('menu');
            sounds.playTick();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [props.isOpen, isAuthenticated, enteredPin, activeTab, menuIndex, props.pin]);

  if (!props.isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl p-6 md:p-10 lg:p-20 overflow-hidden"
    >
      {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 md:gap-8 w-[90%] max-w-[500px] mx-auto">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#00CCCC]/20 flex items-center justify-center mb-2 md:mb-4">
            <Key className="w-8 h-8 md:w-10 md:h-10 text-[#00CCCC]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">{t.adminPin}</h2>
          <div className="flex gap-3 md:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className={cn(
                  "w-12 h-16 md:w-16 md:h-20 rounded-xl md:rounded-2xl border-2 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-300",
                  enteredPin.length > i 
                    ? "border-[#00CCCC] bg-[#00CCCC]/10 text-white" 
                    : "border-white/10 bg-white/5 text-transparent"
                )}
              >
                {enteredPin[i] ? '•' : ''}
              </div>
            ))}
          </div>
          <AnimatePresence>
            {errorVisible && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 font-medium text-sm md:text-base"
              >
                {t.wrongPin}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-white/30 text-xs md:text-sm mt-4 uppercase tracking-widest">Default PIN: 1234</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full h-full gap-4 md:gap-10 min-h-0">
          {/* Sidebar Menu */}
          <div className={cn(
            "w-full h-full min-h-0 md:w-[300px] lg:w-[400px] flex-col gap-3 md:gap-4 flex-shrink-0 md:shrink-0 overflow-y-auto pb-4 no-scrollbar px-2",
            activeTab === 'menu' ? "flex" : "hidden md:flex"
          )}>
            <div className="flex items-center gap-3 md:gap-4 mb-4 lg:mb-10 shrink-0">
              <div className="p-2 lg:p-3 bg-[#00CCCC] rounded-xl lg:rounded-2xl">
                <SettingsIcon className="w-6 h-6 lg:w-8 lg:h-8 text-black" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{t.settingsTitle}</h1>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {menuItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 md:p-4 lg:p-6 rounded-[16px] md:rounded-[20px] lg:rounded-[24px] transition-all duration-300 cursor-pointer",
                    menuIndex === idx && activeTab === 'menu'
                      ? "bg-[#00CCCC] text-black shadow-[0_0_30px_rgba(0,204,204,0.3)] scale-[1.02]"
                      : "bg-white/5 text-white/60 hover:bg-white/10",
                    activeTab === item.id && "bg-[#00CCCC]/20 text-[#00CCCC] border border-[#00CCCC]/30"
                  )}
                  onClick={() => {
                    setMenuIndex(idx);
                    setActiveTab(item.id as any);
                    sounds.playPop();
                  }}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="text-sm md:text-base lg:text-lg font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 opacity-40" />
                </div>
              ))}
            </div>

            <button 
              onClick={props.onClose}
              className="mt-4 md:mt-auto shrink-0 flex items-center gap-3 md:gap-4 p-3 md:p-4 lg:p-6 bg-white/5 rounded-[16px] md:rounded-[20px] lg:rounded-[24px] text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Home className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="text-sm md:text-base lg:text-lg font-semibold">{t.home}</span>
            </button>
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex-1 h-full min-h-0 bg-white/5 rounded-[24px] md:rounded-[36px] lg:rounded-[48px] p-6 lg:p-12 border border-white/5 relative overflow-y-auto no-scrollbar",
            activeTab !== 'menu' ? "block" : "hidden md:block"
          )}>
            <AnimatePresence mode="wait">
              {activeTab === 'menu' ? (
                <motion.div 
                  key="empty" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-full flex flex-col items-center justify-center opacity-20 hidden md:flex"
                >
                  <SettingsIcon className="w-32 h-32 lg:w-40 lg:h-40" />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="md:hidden flex items-center gap-2 text-white/50 hover:text-white mb-6 p-2 -ml-2 rounded-lg hover:bg-white/5 self-start transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold text-sm">{t.back}</span>
                  </button>
                  <TabContent 
                    tab={activeTab} 
                    props={props} 
                    t={t} 
                    onBack={() => setActiveTab('menu')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Simplified sub-components for tabs
const TabContent: React.FC<{ tab: string, props: SettingsProps, t: any, onBack: () => void }> = ({ tab, props, t, onBack }) => {
  switch (tab) {
    case 'pin': return <PinTab props={props} t={t} onBack={onBack} />;
    case 'lang': return <LangTab props={props} t={t} onBack={onBack} />;
    case 'video': return <VideoTab props={props} t={t} onBack={onBack} />;
    case 'gih': return <GihTab props={props} t={t} onBack={onBack} />;
    case 'youtube': return <YoutubeTab props={props} t={t} onBack={onBack} />;
    case 'iptv': return <IPTVTab props={props} t={t} onBack={onBack} />;
    case 'sounds': return <SoundsTab props={props} t={t} onBack={onBack} />;
    case 'qr': return <QRTab props={props} t={t} onBack={onBack} />;
    case 'wifi': return <WifiTab props={props} t={t} onBack={onBack} />;
    case 'weather': return <WeatherTab props={props} t={t} onBack={onBack} />;
    default: return null;
  }
};

const IdbImage = ({ src, className }: { src: string, className?: string }) => {
  const resolved = useIdbUrl(src);
  return <img src={resolved} className={className} />;
};

const GihTab = ({ props, t }: any) => {
  const [videos, setVideos] = useState<GihVideo[]>(props.gihVideos);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [ruTab, setRuTab] = useState('');
  const [uzTab, setUzTab] = useState('');
  const [enTab, setEnTab] = useState('');
  const [url, setUrl] = useState('');
  const [thumb, setThumb] = useState('');

  const fileInputVideoRef = useRef<HTMLInputElement>(null);
  const fileInputImageRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setRuTab('');
    setUzTab('');
    setEnTab('');
    setUrl('');
    setThumb('');
    setEditingId(null);
  };

  const handleEdit = (v: GihVideo) => {
    setEditingId(v.id);
    setRuTab(v.title.ru);
    setUzTab(v.title.uz);
    setEnTab(v.title.en);
    setUrl(v.url);
    setThumb(v.thumb);
  };

  const handleDelete = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    props.onGihVideosChange(updated);
    sounds.playPop();
  };

  const handleSaveVideo = () => {
    if (!url || (!ruTab && !uzTab && !enTab)) return;
    
    let updated: GihVideo[];
    if (editingId) {
      updated = videos.map(v => v.id === editingId ? {
        ...v,
        title: { ru: ruTab, uz: uzTab, en: enTab },
        url,
        thumb
      } : v);
    } else {
      updated = [...videos, {
        id: Date.now().toString(),
        title: { ru: ruTab, uz: uzTab, en: enTab },
        url,
        thumb
      }];
    }
    setVideos(updated);
    props.onGihVideosChange(updated);
    resetForm();
    sounds.playSuccess();
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const key = `gih_video_${Date.now()}`;
      await set(key, file);
      setUrl(`idb://${key}`);
      sounds.playPop();
    }
  };

  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const key = `gih_thumb_${Date.now()}`;
      await set(key, file);
      setThumb(`idb://${key}`);
      sounds.playPop();
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 h-full">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.aboutGih}</h3>
      
      <div className="flex flex-col gap-4">
        <h4 className="text-white/60 font-semibold">{editingId ? 'Редактировать видео' : 'Добавить видео'}</h4>
        <Input label="Название (RU)" value={ruTab} onChange={setRuTab} />
        <Input label="Название (UZ)" value={uzTab} onChange={setUzTab} />
        <Input label="Название (EN)" value={enTab} onChange={setEnTab} />
        
        <div className="flex flex-col gap-2">
          <Input label="URL видео (или выберите файл)" value={url} onChange={setUrl} />
          <input type="file" ref={fileInputVideoRef} className="hidden" accept="video/*" onChange={handleVideoFileChange}/>
          <button onClick={() => fileInputVideoRef.current?.click()} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all self-start text-sm">Выбрать видео</button>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <Input label="URL обложки (или выберите файл)" value={thumb} onChange={setThumb} />
          <input type="file" ref={fileInputImageRef} className="hidden" accept="image/*" onChange={handleThumbFileChange}/>
          <button onClick={() => fileInputImageRef.current?.click()} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all self-start text-sm">Выбрать обложку</button>
        </div>

        <div className="flex gap-4">
          <button onClick={handleSaveVideo} className="bg-[#00CCCC] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <Save className="w-5 h-5" /> Сохранить
          </button>
          {editingId && (
            <button onClick={resetForm} className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold">
              Отмена
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6 pb-20">
        <h4 className="text-white/60 font-semibold mb-2">Список видео</h4>
        {videos.map((v, i) => (
          <div key={v.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-4">
              <span className="text-white/40">{i+1}</span>
              {v.thumb && <IdbImage src={v.thumb} className="w-16 h-10 object-cover rounded-md" />}
              <span className="text-white font-semibold">{v.title[props.currentLang] || v.title.ru}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(v)} className="p-2 bg-[#00CCCC]/20 text-[#00CCCC] rounded-lg">Ред</button>
              <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="text-white/40 text-sm">Нет видео</p>}
      </div>
    </div>
  );
};

const WifiTab = ({ props, t }: any) => {
  const [login, setLogin] = useState(props.wifiLogin);
  const [password, setPassword] = useState(props.wifiPassword);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.wifiSettings}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <Input label={t.wifiName} value={login} onChange={setLogin} />
        <Input label={t.wifiPasswordText} value={password} onChange={setPassword} />
        <button 
          onClick={() => { 
            props.onWifiLoginChange(login);
            props.onWifiPasswordChange(password);
            sounds.playSuccess(); 
          }}
          className="bg-[#00BCD4] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start mt-2 md:mt-4"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const WeatherTab = ({ props, t }: any) => {
  const [city, setCity] = useState(props.weatherCity);
  const commonCities = ['Tashkent', 'Samarkand', 'Bukhara', 'London', 'New York', 'Dubai'];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.weatherSettings}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <Input label={t.weatherLocation} value={city} onChange={setCity} />
        
        <div className="mt-2 md:mt-4">
          <h4 className="text-white/40 uppercase tracking-widest text-xs md:text-sm mb-3 md:mb-4">{t.quickSelect}</h4>
          <div className="grid grid-cols-2 gap-2">
            {commonCities.map(c => (
              <button 
                key={c}
                onClick={() => setCity(c)}
                className={cn(
                  "p-3 md:p-4 rounded-xl text-sm md:text-base text-left transition-all",
                  city === c ? "bg-[#00BCD4] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                {(t.cities as any)[c] || c}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { props.onWeatherCityChange(city); sounds.playSuccess(); }}
          className="bg-[#00BCD4] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start mt-2 md:mt-4"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const PinTab = ({ props, t }: any) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.changePin}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <Input label={t.oldPin} value={oldPin} onChange={setOldPin} type="password" />
        <Input label={t.newPin} value={newPin} onChange={setNewPin} type="password" />
        <Input label={t.confirmPin} value={confirmPin} onChange={setConfirmPin} type="password" />
        <button 
          onClick={() => {
            if (oldPin === props.pin && newPin === confirmPin && newPin.length === 4) {
              props.onPinChange(newPin);
              sounds.playSuccess();
            } else {
              sounds.playError();
            }
          }}
          className="bg-[#00CCCC] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start mt-2 md:mt-4"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const LangTab = ({ props, t }: any) => {
  const langs: { id: Language; label: string }[] = [
    { id: 'ru', label: 'Русский' },
    { id: 'uz', label: 'Oʻzbekcha' },
    { id: 'en', label: 'English' }
  ];
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.changeLang}</h3>
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {langs.map(l => (
          <button
            key={l.id}
            onClick={() => props.onLangChange(l.id)}
            className={cn(
              "p-4 lg:p-8 rounded-[16px] lg:rounded-[24px] text-left text-lg lg:text-2xl font-bold transition-all",
              props.currentLang === l.id ? "bg-[#00CCCC] text-black" : "bg-white/5 text-white/60"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const VideoTab = ({ props, t }: any) => {
  const [url, setUrl] = useState(props.videoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the selected local file
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      sounds.playPop();
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.usbVideo}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Input label={t.enterUrl} value={url} onChange={setUrl} />
          </div>
          <div className="flex flex-col gap-3 justify-end shrink-0">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="video/*"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/10 hover:bg-white/20 text-white p-4 h-full md:p-6 rounded-xl md:rounded-2xl transition-all flex justify-center items-center gap-2 md:gap-3 border border-white/10"
            >
              <Video className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-semibold text-base md:text-lg">{t.selectFile}</span>
            </button>
          </div>
        </div>
        
        <p className="text-white/40 text-xs md:text-sm italic truncate">
          {t.detectedFiles}: {url.startsWith('blob:') ? 'Selected local file' : url || 'None'}
        </p>

        <button 
          onClick={() => { props.onVideoUrlChange(url); sounds.playSuccess(); }}
          className="bg-[#00CCCC] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start mt-2 md:mt-4"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const YoutubeTab = ({ props, t }: any) => {
  const [url, setUrl] = useState(props.youtubeUrl);
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.youtubeLink}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <Input label={t.youtubeLink} value={url} onChange={setUrl} />
        <button 
          onClick={() => { props.onYoutubeUrlChange(url); sounds.playSuccess(); }}
          className="bg-[#00CCCC] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const IPTVTab = ({ props, t }: any) => {
  const apps = ['Smart IPTV', 'OTT Navigator', 'OTT Player', 'TiviMate'];
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.iptvApp}</h3>
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {apps.map(app => (
          <button
            key={app}
            onClick={() => props.onIptvAppChange(app)}
            className={cn(
              "p-4 lg:p-8 rounded-[16px] lg:rounded-[24px] text-left text-lg lg:text-2xl font-bold transition-all",
              props.iptvApp === app ? "bg-[#00CCCC] text-black" : "bg-white/5 text-white/60"
            )}
          >
            {app}
          </button>
        ))}
      </div>
    </div>
  );
};

const SoundsTab = ({ props, t }: any) => {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.uiSounds}</h3>
      <button
        onClick={() => props.onSoundsToggle(!props.soundsEnabled)}
        className={cn(
          "w-full p-6 lg:p-12 rounded-[24px] lg:rounded-[40px] text-2xl lg:text-4xl font-bold transition-all flex items-center justify-between",
          props.soundsEnabled ? "bg-[#00CCCC] text-black" : "bg-white/5 text-white/20"
        )}
      >
        <span>{props.soundsEnabled ? t.on : t.off}</span>
        <Volume2 className="w-8 h-8 lg:w-12 lg:h-12" />
      </button>
    </div>
  );
};

const QRTab = ({ props, t }: any) => {
  const [link, setLink] = useState(props.qrLink);
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{t.qrSettings}</h3>
      <div className="flex flex-col gap-4 lg:gap-6">
        <Input label={t.enterUrl} value={link} onChange={setLink} />
        <button 
          onClick={() => { props.onQrLinkChange(link); sounds.playSuccess(); }}
          className="bg-[#00CCCC] text-black px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl flex items-center gap-3 md:gap-4 self-start"
        >
          <Save className="w-5 h-5 md:w-6 md:h-6" /> {t.save}
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div className="flex flex-col gap-2 md:gap-3">
    <label className="text-xs md:text-sm font-medium text-white/40 uppercase tracking-widest">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-lg md:text-2xl text-white outline-none focus:border-[#00CCCC] focus:bg-white/10 transition-all font-mono min-w-0"
    />
  </div>
);
