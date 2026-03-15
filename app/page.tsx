'use client';
import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';

// Объект переводов
const translations: any = {
  ua: { setup: 'Налаштування', appearance: 'Вигляд', lang: 'Мова', loc: 'Локація', city: 'Місто', country: 'Країна', login: 'Увійти через Telegram', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ', selectCity: 'Оберіть місто' },
  ru: { setup: 'Настройка', appearance: 'Вид', lang: 'Язык', loc: 'Локация', city: 'Город', country: 'Страна', login: 'Войти через Telegram', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир', selectCity: 'Выберите город' },
  en: { setup: 'Setup', appearance: 'Appearance', lang: 'Language', loc: 'Location', city: 'City', country: 'Country', login: 'Login with Telegram', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World', selectCity: 'Select City' },
  // Для остальных языков можно добавить по аналогии или использовать авто-фолбэк на EN
};

const languages = [
  { code: 'ua', label: 'UKR', iso: 'ua' },
  { code: 'ru', label: 'RUS', iso: 'ru' },
  { code: 'en', label: 'ENG', iso: 'us' },
  { code: 'de', label: 'GER', iso: 'de' },
  { code: 'fr', label: 'FRA', iso: 'fr' },
  { code: 'es', label: 'ESP', iso: 'es' },
  { code: 'pt', label: 'POR', iso: 'pt' },
  { code: 'it', label: 'ITA', iso: 'it' },
  { code: 'ja', label: 'JPN', iso: 'jp' },
  { code: 'zh', label: 'CHI', iso: 'cn' },
  { code: 'ar', label: 'ARA', iso: 'sa' },
  { code: 'hi', label: 'HIN', iso: 'in' },
];

// Функция для надежного отображения флага (работает везде)
const Flag = ({ iso, className = "w-6 h-4" }: { iso: string, className?: string }) => (
  <img 
    src={`https://flagcdn.com/${iso.toLowerCase()}.svg`} 
    alt={iso} 
    className={`${className} object-cover rounded-sm shadow-sm`}
  />
);

export default function App() {
  const [step, setStep] = useState('splash');
  const [theme, setTheme] = useState('dark');
  const [scope, setScope] = useState('city');
  const [userData, setUserData] = useState({ lang: 'ua', city: '', country: '' });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  
  // Состояния для поиска локаций
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);

  const t = translations[userData.lang] || translations.en;
  const loaderText = "COVCHEG-AI".split("");

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (languages.some(l => l.code === browserLang)) {
        setUserData(prev => ({ ...prev, lang: browserLang }));
    }
    const timer = setTimeout(() => setStep('settings'), 3500);
    return () => clearTimeout(timer);
  }, []);

  const requestGPS = () => {
    setIsGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=${userData.lang}`);
          const data = await res.json();
          setUserData(prev => ({ 
            ...prev, 
            city: data.address.city || data.address.town || data.address.village || '',
            country: data.address.country || ''
          }));
        } catch (e) { console.error(e); }
        finally { setIsGpsLoading(false); }
      }, () => setIsGpsLoading(false));
    }
  };

  if (step === 'splash') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 overflow-hidden p-6 text-white">
        <div className="loader-wrapper relative flex items-center justify-center h-40 text-[2.5em] font-extrabold">
          {loaderText.map((char, i) => (
            <span key={i} className="loader-letter inline-block opacity-0 animate-pulse" style={{ animation: `loader-letter-anim 4s infinite linear ${i * 0.1}s` }}>{char}</span>
          ))}
        </div>
        <style jsx>{`
          @keyframes loader-letter-anim {
            0% { opacity: 0; transform: translateY(10px); }
            25% { opacity: 1; text-shadow: 0 0 20px #2563eb; transform: translateY(0); }
            50% { opacity: 0.3; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (step === 'settings') {
    return (
      <div className={`min-h-screen p-6 flex flex-col transition-all ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <h2 className="text-4xl font-black italic mt-10 uppercase text-blue-600">{t.setup}</h2>
        
        <div className="mt-8 space-y-6 flex-1 overflow-y-auto pb-10">
          {/* Языки */}
          <section>
            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-3 block">{t.lang}</label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => setUserData({...userData, lang: l.code})} 
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${userData.lang === l.code ? 'border-blue-600 bg-blue-600/10' : 'border-transparent bg-slate-900/40'}`}
                >
                  <Flag iso={l.iso} />
                  <span className="text-[10px] font-bold">{l.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Локация */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-blue-500">{t.loc}</label>
              <button onClick={requestGPS} className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                <Icons.Navigation size={12} className={isGpsLoading ? 'animate-spin' : ''} /> GPS
              </button>
            </div>
            
            <div className="relative">
              <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder={t.country}
                value={userData.country}
                onChange={(e) => setUserData({...userData, country: e.target.value})}
                className={`w-full p-4 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}
              />
            </div>

            <div className="relative">
              <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder={t.city}
                value={userData.city}
                onChange={(e) => setUserData({...userData, city: e.target.value})}
                className={`w-full p-4 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}
              />
            </div>
          </section>

          {/* Вид */}
          <section>
             <label className="text-[10px] font-bold uppercase text-blue-500 mb-2 block">{t.appearance}</label>
             <div className="flex gap-2">
               {['light', 'dark'].map(v => (
                 <button key={v} onClick={() => setTheme(v)} className={`flex-1 p-3 rounded-xl border-2 uppercase text-[10px] font-black ${theme === v ? 'border-blue-600 text-blue-600' : 'border-slate-800 text-slate-500'}`}>{v}</button>
               ))}
             </div>
          </section>
        </div>

        <button onClick={() => setStep('main')} className="w-full bg-[#24A1DE] text-white p-5 rounded-[2rem] font-bold uppercase flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mb-4">
          <Icons.Send size={20} /> {t.login}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 transition-all ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} p-6 rounded-b-[2.5rem] shadow-sm border-b`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black italic text-blue-600 tracking-tighter">COVCHEG.UA</h1>
          <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-1.5 rounded-xl border border-blue-600/30">
            <Icons.MapPin size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase text-blue-500">{userData.city || t.selectCity}</span>
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} p-1 rounded-2xl flex`}>
          {['city', 'country', 'world'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${scope === s ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
              {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 grid grid-cols-3 gap-3">
        {allCategories.map((cat) => (
          <button key={cat.id} className={`flex flex-col items-center justify-center rounded-[2rem] p-4 transition-all active:scale-90 ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className={`${cat.color} mb-2 rounded-2xl p-3 text-white shadow-md`}><cat.icon size={24} /></div>
            <span className="text-[9px] font-bold uppercase text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </main>

      <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] p-4 flex justify-around items-center backdrop-blur-lg border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-gray-200'}`}>
          <Icons.LayoutGrid className="text-blue-600" size={22} />
          <Icons.Search className="text-slate-400" size={22} />
          <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-12 border-4 border-slate-950 active:scale-95"><Icons.Plus size={28} /></div>
          <Icons.MessageCircle className="text-slate-400" size={22} />
          <Icons.Bell className="text-slate-400" size={22} />
      </nav>
    </div>
  );
}
