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

export default function App() {
  const [step, setStep] = useState('splash');
  const [theme, setTheme] = useState('light');
  const [scope, setScope] = useState('city');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [userData, setUserData] = useState({ lang: 'en', city: 'Detecting...', country: '' });

  // Массив для анимации букв лоадера
  const loaderText = "COVCHEG-AI".split("");

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    setUserData(prev => ({ ...prev, lang: browserLang }));
    // Увеличил до 4.5с, чтобы лоадер успел красиво проиграться
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

  if (step === 'splash') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 overflow-hidden p-6">
        {/* --- ТВОЙ КРУТОЙ ЛОАДЕР ИЗ UIVERSE --- */}
        <div className="loader-wrapper">
          {loaderText.map((char, i) => (
            <span 
              key={i} 
              className="loader-letter" 
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
              {char}
            </span>
          ))}
          <div className="loader"></div>
        </div>

        {/* CSS для лоадера */}
        <style jsx>{`
          .loader-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 150px;
            width: auto;
            font-family: "Poppins", sans-serif;
            font-size: 2.5em;
            font-weight: 800;
            user-select: none;
            color: #fff;
            scale: 1.5;
          }

          .loader {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 5;
            background-color: transparent;
            mask: repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 5px,
              black 7px,
              black 8px
            );
          }

          .loader::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
              radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
              radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
              radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
              radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
            mask: radial-gradient(
              circle at 50% 50%,
              transparent 0%,
              transparent 10%,
              black 25%
            );
            animation:
              transform-animation 2s infinite alternate,
              opacity-animation 4s infinite;
            animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
          }

          @keyframes transform-animation {
            0% { transform: translate(-55%); }
            100% { transform: translate(55%); }
          }

          @keyframes opacity-animation {
            0%, 100% { opacity: 0; }
            15% { opacity: 1; }
            65% { opacity: 0; }
          }

          .loader-letter {
            display: inline-block;
            opacity: 0;
            animation: loader-letter-anim 4s infinite linear;
            z-index: 2;
          }

          @keyframes loader-letter-anim {
            0% { opacity: 0; }
            25% {
              opacity: 1;
              text-shadow:
                0px 25px 25px #ffd700,
                0px -25px 25px #0057b7;
              transform: none;
            }
            50% { opacity: 0.5; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (step === 'settings') {
    return (
      <div className={`min-h-screen p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <h2 className="text-4xl font-black italic mt-12 tracking-tighter uppercase leading-none">Setup</h2>
        <div className="mt-12 space-y-10">
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Appearance</label>
            <div className="flex gap-4 mt-3">
              <button onClick={() => setTheme('light')} className={`flex-1 p-5 rounded-3xl border-2 font-black ${theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100'}`}>LIGHT</button>
              <button onClick={() => setTheme('dark')} className={`flex-1 p-5 rounded-3xl border-2 font-black ${theme === 'dark' ? 'border-blue-600 bg-slate-800 text-white' : 'border-gray-100'}`}>DARK</button>
            </div>
          </section>
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Location</label>
            <button onClick={requestGPS} className="w-full mt-3 flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-[2rem] font-black shadow-xl active:scale-95 transition-all text-xl uppercase">
              <Icons.Navigation size={22} /> Enable GPS
            </button>
            <button onClick={() => setStep('main')} className="w-full mt-4 p-4 text-sm font-bold text-gray-400 italic">Skip</button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">COVCHEG.UA</h1>
          <div className="h-11 w-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
            <Icons.User size={22} />
          </div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} p-1.5 rounded-2xl flex`}>
          {['city', 'country', 'world'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
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
            className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
          >
            <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}>
              <cat.icon size={26} />
            </div>
            <span className={`text-[10px] font-black uppercase text-center leading-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </main>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-[3rem] p-8 pb-12 text-slate-900 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase">Новое объявление</h2>
              <button onClick={() => { setShowAddForm(false); setSelectedCategory(null); }} className="p-2 bg-gray-100 rounded-full"><Icons.X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className={`${selectedCategory?.color || 'bg-gray-400'} p-2 rounded-xl text-white`}>
                  {selectedCategory && <selectedCategory.icon size={20} />}
                </div>
                <span className="font-black uppercase text-xs">{selectedCategory?.name || 'Выберите Категорию'}</span>
              </div>
              <input type="text" placeholder="Заголовок..." className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" />
              {selectedCategory?.id === 'bus' && (
                <label className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl text-green-700 font-bold text-xs cursor-pointer border border-green-100">
                  <input type="checkbox" className="w-5 h-5 rounded border-green-300" />
                  <span>ЗАБРАТЬ С НОВОЙ ПОЧТЫ </span>
                </label>
              )}
              <button className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black shadow-lg uppercase active:scale-95 transition-all">Опубликовать</button>
            </div>
          </div>
        </div>
      )}

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
