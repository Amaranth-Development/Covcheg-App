'use client';
import React, { useState } from 'react';
import * as Icons from 'lucide-react';

// Единый массив всех категорий - всё вместе!
const allCategories = [
  { id: 'taxi', name: 'TAXI', icon: 'Car', color: 'bg-yellow-400' },
  { id: 'transfer', name: 'TRANSFER', icon: 'Users', color: 'bg-green-500' },
  { id: 'bus', name: 'BUS-UA', icon: 'Bus', color: 'bg-blue-600' },
  { id: 'rent', name: 'RENT CAR', icon: 'Key', color: 'bg-indigo-600' },
  { id: 'realty', name: 'REALTY', icon: 'Home', color: 'bg-emerald-500' },
  { id: 'market', name: 'OLX', icon: 'ShoppingBag', color: 'bg-orange-500' },
  { id: 'services', name: 'SERVICE', icon: 'Wrench', color: 'bg-purple-500' },
  { id: 'jobs', name: 'JOBS', icon: 'Briefcase', color: 'bg-indigo-500' },
  { id: 'business', name: 'BUSINESS', icon: 'Building2', color: 'bg-slate-700' },
  { id: 'ai', name: 'COVCHEG-AI', icon: 'Bot', color: 'bg-red-500' },
  { id: 'charity', name: 'CHARITY', icon: 'HeartHandshake', color: 'bg-pink-500' },
  { id: 'emergency', name: 'HELP', icon: 'LifeBuoy', color: 'bg-red-600' },
];

export default function App() {
  const [scope, setScope] = useState('city');

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      {/* HEADER */}
      <header className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black italic tracking-tighter text-blue-600 uppercase">UkraineHelp</h1>
          <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
            <Icons.User size={20} />
          </div>
        </div>

        {/* ВЫБОР РАДИУСА ВИДИМОСТИ */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {['city', 'country', 'world'].map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              {s === 'city' ? 'Город' : s === 'country' ? 'Страна' : 'Мир'}
            </button>
          ))}
        </div>
      </header>

      {/* ЕДИНАЯ СЕТКА КАТЕГОРИЙ */}
      <main className="p-4 mt-2">
        <div className="grid grid-cols-3 gap-3">
          {allCategories.map((cat) => {
            const IconComponent = Icons[cat.icon as keyof typeof Icons];
            return (
              <button 
                key={cat.id} 
                className="flex flex-col items-center justify-center rounded-[2.2rem] bg-white p-5 shadow-sm active:scale-95 transition-all border border-transparent hover:border-blue-50"
              >
                <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}>
                  {IconComponent && <IconComponent size={26} />}
                </div>
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter leading-none text-center">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-6 left-6 right-6 rounded-[2.5rem] bg-gray-900 shadow-2xl p-4 flex justify-around items-center border border-white/10 backdrop-blur-md">
         <Icons.LayoutGrid className="text-white" size={22} />
         <Icons.Search className="text-gray-500" size={22} />
         
         <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-14 border-[6px] border-gray-50 active:scale-95 transition-all cursor-pointer">
            <Icons.Plus size={30} strokeWidth={3} />
         </div>
         
         <Icons.MessageCircle className="text-gray-500" size={22} />
         <Icons.Bell className="text-gray-500" size={22} />
      </nav>
    </div>
  );
}
