'use client';
import './globals.css';
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const allCategories = [
  { id: 'taxi', name: 'TAXI', icon: 'Car', color: 'bg-yellow-400' },
  { id: 'transfer', name: 'TRANSFER', icon: 'Users', color: 'bg-green-500' },
  { id: 'bus', name: 'BUS-UA', icon: 'Bus', color: 'bg-blue-600' },
  { id: 'rent', name: 'RENT CAR', icon: 'Key', color: 'bg-indigo-600' },
  { id: 'realty', name: 'REALTY ESTATE', icon: 'Home', color: 'bg-emerald-500' },
  { id: 'market', name: 'OLX', icon: 'ShoppingBag', color: 'bg-orange-500' },
  { id: 'services', name: 'SERVICE HUB', icon: 'Wrench', color: 'bg-purple-500' },
  { id: 'jobs', name: 'JOBS', icon: 'Briefcase', color: 'bg-indigo-500' },
  { id: 'business', name: 'BUSINESS', icon: 'Building2', color: 'bg-slate-700' },
  { id: 'ai', name: 'COVCHEG-AI', icon: 'Bot', color: 'bg-red-500' },
  { id: 'charity', name: 'CHARITY', icon: 'HeartHandshake', color: 'bg-pink-500' },
  { id: 'emergency', name: 'HELP', icon: 'LifeBuoy', color: 'bg-red-600' },
];

export default function App() {
  const [step, setStep] = useState('splash'); // splash -> settings -> main
  const [theme, setTheme] = useState('light');
  const [scope, setScope] = useState('city');
  const [userData, setUserData] = useState({ lang: 'en', city: 'Detecting...', country: '' });

  useEffect(() => {
    // 1. Авто-детект языка
    const browserLang = navigator.language.split('-')[0];
    setUserData(prev => ({ ...prev, lang: browserLang }));

    // Имитация загрузки Ковчега
    const timer = setTimeout(() => setStep('settings'), 3500);
    return () => clearTimeout(timer);
  }, []);

  const requestGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          setUserData(prev => ({ 
            ...prev, 
            city: data.address.city || data.address.town || 'Unknown',
            country: data.address.country 
          }));
          setStep('main');
        } catch (e) { setStep('main'); }
      }, () => setStep('main'));
    } else { setStep('main'); }
  };

  // ==========================================
  // --- ЭКРАН ЗАСТАВКИ: КОВЧЕГ И ПОМОЩЬ ---
  // ==========================================
  if (step === 'splash') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden p-6 animate-in fade-in duration-1000">
        <div className="relative flex flex-col items-center">
          
          {/* СИМВОЛ: ДВЕ РУКИ, ТЯНУЩИЕСЯ ДРУГ К ДРУГУ (СВЕРХУ) */}
          <div className="flex gap-1 mb-6 animate-pulse">
            <span className="text-7xl">🫱</span>
            <span className="text-7xl">🫲</span>
          </div>

          {/* СИМВОЛ: КОВЧЕГ (ЦЕНТР) */}
          <div className="relative z-10">
            <span className="text-[120px] leading-none animate-float">🚢</span>
            {/* АНИМИРОВАННЫЕ ВОЛНЫ ПОД КОВЧЕГОМ */}
            <div className="absolute -bottom-4 left-0 right-0 h-4 overflow-hidden">
                <div className="w-[200%] h-full bg-blue-100 rounded-full animate-wave opacity-60"></div>
                <div className="absolute inset-0 w-[200%] h-full bg-blue-200 rounded-full animate-wave-slow opacity-80" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
          
          {/* ФОНОВЫЙ СВЕТ */}
          <div className="absolute -inset-10 bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        </div>

        {/* НАЗВАНИЕ И ОПИСАНИЕ */}
        <h1 className="mt-12 text-6xl font-black italic tracking-tighter text-blue-600 animate-in fade-in zoom-in duration-1500 delay-300">
          COVCHEG-UA
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.5em] text-gray-300 animate-in fade-in delay-700">
          FIRST AI HELPER
        </p>

        {/* ПРОГРЕСС-БАР "КОРАБЛЬ ПЛЫВЕТ" */}
        <div className="mt-10 h-1.5 w-32 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full bg-blue-500 animate-progress"></div>
        </div>
      </div>
    );
  }

  // --- ЭКРАН НАСТРОЕК (Тот же, что и был) ---
  if (step === 'settings') {
    return (
      <div className={`min-h-screen p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <h2 className="text-4xl font-black italic mt-12 tracking-tighter uppercase leading-none">Setup</h2>
        <p className="text-gray-400 mt-2 italic">Customize your Ark experience</p>
        
        <div className="mt-12 space-y-10">
          {/* ТЕМА */}
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Appearance</label>
            <div className="flex gap-4 mt-3">
              <button onClick={() => setTheme('light')} className={`flex-1 p-5 rounded-3xl border-2 font-black transition-all ${theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100'}`}>LIGHT</button>
              <button onClick={() => setTheme('dark')} className={`flex-1 p-5 rounded-3xl border-2 font-black transition-all ${theme === 'dark' ? 'border-blue-600 bg-slate-800 text-white' : 'border-gray-100'}`}>DARK</button>
            </div>
          </section>

          {/* ЯЗЫК */}
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Language</label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {['uk', 'en', 'pl'].map(l => (
                <button key={l} onClick={() => setUserData({...userData, lang: l})} className={`p-4 rounded-xl border-2 font-bold uppercase ${userData.lang === l ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                  {l}
                </button>
              ))}
            </div>
          </section>

          {/* GPS */}
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Location Services</label>
            <button onClick={requestGPS} className="w-full mt-3 flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-[2rem] font-black shadow-xl shadow-blue-500/30 active:scale-95 transition-all text-xl">
              <Icons.Navigation size={22} /> ENABLE AUTO-DETECTION
            </button>
            <button onClick={() => setStep('main')} className="w-full mt-4 p-4 text-sm font-bold text-gray-400 italic">Skip & set manually</button>
          </section>
        </div>
      </div>
    );
  }

  // --- ГЛАВНЫЙ ЭКРАН (Тот же, что и был) ---
  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">UkraineHelp</h1>
          <div className={`h-11 w-11 rounded-3xl flex items-center justify-center border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
            <Icons.User size={22} />
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} p-1.5 rounded-2xl flex`}>
          {['city', 'country', 'world'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
              {s === 'city' ? 'Город' : s === 'country' ? 'Страна' : 'Мир'}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 px-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {userData.city}, {userData.country || 'Global'}
          </span>
        </div>
      </header>

      <main className="p-4 mt-2">
        <div className="grid grid-cols-3 gap-3">
          {allCategories.map((cat) => {
            const IconComponent = Icons[cat.icon as keyof typeof Icons];
            return (
              <button key={cat.id} className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all border border-transparent ${theme === 'dark' ? 'bg-slate-900 hover:border-slate-700' : 'bg-white hover:border-blue-50 shadow-blue-100/30'}`}>
                <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}>
                  {IconComponent && <IconComponent size={26} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter leading-none text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center border backdrop-blur-md transition-all ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-gray-900/90 border-white/10'}`}>
         <Icons.LayoutGrid className="text-white" size={22} />
         <Icons.Search className="text-gray-500" size={22} />
         <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] transition-all border-gray-50 active:scale-95 cursor-pointer">
            <Icons.Plus size={32} strokeWidth={3} />
         </div>
         <Icons.MessageCircle className="text-gray-500" size={22} />
         <Icons.Bell className="text-gray-500" size={22} />
      </nav>

      {/* CSS АНИМАЦИИ ДЛЯ КОВЧЕГА */}
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes grow { from { width: 0; } to { width: 100%; } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-wave { animation: wave 1.5s linear infinite; }
        .animate-wave-slow { animation: wave 2.5s linear infinite; }
        .animate-progress { animation: grow 3.5s linear forwards; }
      `}</style>
    </div>
  );
}
