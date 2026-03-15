'use client';
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const allCategories = [
  { id: 'taxi', name: 'TAXI', icon: Icons.Car, color: 'bg-yellow-400' },
  { id: 'transfer', name: 'TRANSFER', icon: Icons.Users, color: 'bg-green-500' },
  { id: 'bus', name: 'BUS-UA', icon: Icons.Bus, color: 'bg-blue-600' },
  { id: 'rent', name: 'RENT CAR', icon: Icons.Key, color: 'bg-indigo-600' },
  { id: 'realty', name: 'REALTY ESTATE', icon: Icons.Home, color: 'bg-emerald-500' },
  { id: 'market', name: 'OLX', icon: Icons.ShoppingBag, color: 'bg-orange-500' },
  { id: 'services', name: 'SERVICE HUB', icon: Icons.Wrench, color: 'bg-purple-500' },
  { id: 'jobs', name: 'JOBS', icon: Icons.Briefcase, color: 'bg-indigo-500' },
  { id: 'business', name: 'BUSINESS', icon: Icons.Building2, color: 'bg-slate-700' },
  { id: 'ai', name: 'COVCHEG-AI', icon: Icons.Bot, color: 'bg-red-500' },
  { id: 'charity', name: 'CHARITY', icon: Icons.HeartHandshake, color: 'bg-pink-500' },
  { id: 'emergency', name: 'HELP', icon: Icons.LifeBuoy, color: 'bg-red-600' },
];

const languages = [
  { code: 'ua', label: 'UKR', flag: '🇺🇦' },
  { code: 'ru', label: 'RUS', flag: '🇷🇺' },
  { code: 'en', label: 'ENG', flag: '🇺🇸' },
  { code: 'de', label: 'GER', flag: '🇩🇪' },
  { code: 'fr', label: 'FRA', flag: '🇫🇷' },
  { code: 'es', label: 'ESP', flag: '🇪🇸' },
  { code: 'pl', label: 'POL', flag: '🇵🇱' },
];

export default function App() {
  const [step, setStep] = useState('splash');
  const [theme, setTheme] = useState('dark'); // По умолчанию DARK
  const [scope, setScope] = useState('city');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [userData, setUserData] = useState({ lang: 'en', city: '', country: '' });
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const loaderText = "COVCHEG-AI".split("");

  useEffect(() => {
    // Авто-язык
    const browserLang = navigator.language.split('-')[0];
    setUserData(prev => ({ ...prev, lang: languages.some(l => l.code === browserLang) ? browserLang : 'en' }));
    
    const timer = setTimeout(() => setStep('settings'), 3500);
    return () => clearTimeout(timer);
  }, []);

  const requestGPS = () => {
    setIsGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          setUserData(prev => ({ 
            ...prev, 
            city: data.address.city || data.address.town || '',
            country: data.address.country || ''
          }));
        } catch (e) { console.error(e); }
        finally { setIsGpsLoading(false); }
      }, () => setIsGpsLoading(false));
    } else { setIsGpsLoading(false); }
  };

  if (step === 'splash') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 overflow-hidden p-6">
        <div className="loader-wrapper">
          {loaderText.map((char, i) => (
            <span key={i} className="loader-letter" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{char}</span>
          ))}
          <div className="loader"></div>
        </div>
        <style jsx>{`
          .loader-wrapper { position: relative; display: flex; align-items: center; justify-content: center; height: 150px; font-family: "Poppins", sans-serif; font-size: 2.5em; font-weight: 800; color: #fff; scale: 1.5; }
          .loader { position: absolute; inset: 0; z-index: 5; mask: repeating-linear-gradient(90deg, transparent 0, transparent 5px, black 7px, black 8px); }
          .loader::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%), radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%), radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%), radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%), radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%); mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%); animation: transform-animation 2s infinite alternate, opacity-animation 4s infinite; animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1); }
          @keyframes transform-animation { 0% { transform: translate(-55%); } 100% { transform: translate(55%); } }
          @keyframes opacity-animation { 0%, 100% { opacity: 0; } 15% { opacity: 1; } 65% { opacity: 0; } }
          .loader-letter { display: inline-block; opacity: 0; animation: loader-letter-anim 4s infinite linear; z-index: 2; }
          @keyframes loader-letter-anim { 0% { opacity: 0; } 25% { opacity: 1; text-shadow: 0px 25px 25px #ffd700, 0px -25px 25px #0057b7; } 50% { opacity: 0.5; } 100% { opacity: 0; } }
        `}</style>
      </div>
    );
  }

  if (step === 'settings') {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-500 flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <h2 className="text-4xl font-black italic mt-10 tracking-tighter uppercase leading-none">Setup</h2>
        
        <div className="mt-8 space-y-6 flex-1 overflow-y-auto pb-10">
          {/* Theme */}
          <section>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 block mb-3">Appearance</label>
            <div className="flex gap-3">
              {['light', 'dark'].map(t => (
                <button key={t} onClick={() => setTheme(t)} className={`flex-1 p-4 rounded-2xl border-2 font-black uppercase text-xs transition-all ${theme === t ? 'border-blue-600 bg-blue-600/10 text-blue-500' : 'border-slate-800'}`}>{t}</button>
              ))}
            </div>
          </section>

          {/* Language Selection */}
          <section>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 block mb-3">Choose Language</label>
            <div className="grid grid-cols-4 gap-2">
              {languages.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => setUserData({...userData, lang: l.code})} 
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${userData.lang === l.code ? 'border-blue-600 bg-blue-600/10' : 'border-slate-800'}`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-[9px] font-bold mt-1">{l.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Location Selection */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Location</label>
              <button onClick={requestGPS} className={`text-[10px] font-black uppercase flex items-center gap-1 text-blue-400 ${isGpsLoading ? 'animate-pulse' : ''}`}>
                <Icons.Navigation size={12} /> {isGpsLoading ? 'Detecting...' : 'Auto-GPS'}
              </button>
            </div>
            <div className="relative">
              <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Country" 
                value={userData.country}
                onChange={(e) => setUserData({...userData, country: e.target.value})}
                className={`w-full p-4 pl-12 rounded-2xl border-2 outline-none font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600' : 'bg-white border-gray-200 focus:border-blue-600'}`} 
              />
            </div>
            <div className="relative">
              <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="City" 
                value={userData.city}
                onChange={(e) => setUserData({...userData, city: e.target.value})}
                className={`w-full p-4 pl-12 rounded-2xl border-2 outline-none font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600' : 'bg-white border-gray-200 focus:border-blue-600'}`} 
              />
            </div>
          </section>
        </div>

        {/* Telegram Auth Footer */}
        <div className="pt-4 pb-6">
          <button 
            onClick={() => setStep('main')}
            className="w-full bg-[#24A1DE] text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all mb-4"
          >
            <Icons.Send size={20} /> Login with Telegram
          </button>
          <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">Connect profile to start using Covcheg</p>
        </div>
      </div>
    );
  }

  // --- MAIN APP SCREEN ---
  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">COVCHEG.UA</h1>
          <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-1.5 rounded-xl border border-blue-600/20">
            <Icons.MapPin size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase text-blue-500">{userData.city || 'World'}</span>
          </div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} p-1.5 rounded-2xl flex`}>
          {['city', 'country', 'world'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
              {s === 'city' ? 'Город' : s === 'country' ? 'Страна' : 'Мир'}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 grid grid-cols-3 gap-3">
        {allCategories.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => { setSelectedCategory(cat); setShowAddForm(true); }}
            className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}
          >
            <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}>
              <cat.icon size={26} />
            </div>
            <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">
              {cat.name}
            </span>
          </button>
        ))}
      </main>

      {/* Navigation & Modals remain the same as your source */}
      <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-gray-900/90 border-white/10'}`}>
          <Icons.LayoutGrid className="text-white" size={22} />
          <Icons.Search className="text-gray-500" size={22} />
          <div onClick={() => setShowAddForm(true)} className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] border-white active:scale-95 cursor-pointer">
            <Icons.Plus size={32} strokeWidth={3} />
          </div>
          <Icons.MessageCircle className="text-gray-500" size={22} />
          <Icons.Bell className="text-gray-500" size={22} />
      </nav>
    </div>
  );
}
