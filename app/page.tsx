'use client';
import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';

const translations: any = {
  ua: { setup: 'Налаштування', appearance: 'Вигляд', lang: 'Мова', loc: 'Локація', city: 'Місто', country: 'Країна', login: 'Увійти через Telegram', skip: 'Пропустити', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ', selectCity: 'Оберіть місто', taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО', realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА', business: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS' },
  ru: { setup: 'Настройки', appearance: 'Вид', lang: 'Язык', loc: 'Локация', city: 'Город', country: 'Страна', login: 'Войти через Telegram', skip: 'Пропустить', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир', selectCity: 'Выберите город', taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО', realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РАБОТА', business: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS' },
  en: { setup: 'Setup', appearance: 'Appearance', lang: 'Language', loc: 'Location', city: 'City', country: 'Country', login: 'Login with Telegram', skip: 'Skip', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World', selectCity: 'Select City', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR', realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS' },
  de: { setup: 'Einstellung', appearance: 'Optik', lang: 'Sprache', loc: 'Standort', city: 'Stadt', country: 'Land', login: 'Telegram Login', skip: 'Überspringen', cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt', selectCity: 'Stadt wählen', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN', realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS', business: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS' },
  fr: { setup: 'Réglages', appearance: 'Apparence', lang: 'Langue', loc: 'Lieu', city: 'Ville', country: 'Pays', login: 'Connexion Telegram', skip: 'Passer', cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde', selectCity: 'Ville', taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION', realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS' },
  es: { setup: 'Ajustes', appearance: 'Apariencia', lang: 'Idioma', loc: 'Ubicación', city: 'Ciudad', country: 'País', login: 'Entrar con Telegram', skip: 'Saltar', cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo', selectCity: 'Ciudad', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER', realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEO', business: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS' },
  pt: { setup: 'Ajustes', appearance: 'Aparência', lang: 'Idioma', loc: 'Localização', city: 'Cidade', country: 'País', login: 'Entrar con Telegram', skip: 'Pular', cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo', selectCity: 'Cidade', taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL', realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO', business: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS' },
  it: { setup: 'Impostazioni', appearance: 'Aspetto', lang: 'Lingua', loc: 'Posizione', city: 'Città', country: 'Paese', login: 'Login Telegram', skip: 'Salta', cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mundo', selectCity: 'Città', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO', realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO', business: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS' },
  ja: { setup: '設定', appearance: '外観', lang: '言語', loc: '場所', city: '都市', country: '国', login: 'ログイン', skip: 'スキップ', cityBtn: '都市', countryBtn: '国', worldBtn: '世界', selectCity: '都市を選択', taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー', realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事', business: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS' },
  zh: { setup: '设置', appearance: '外观', lang: '语言', loc: '地点', city: '城市', country: '国家', login: '登录', skip: '跳过', cityBtn: '城市', countryBtn: '国家', worldBtn: '世界', selectCity: '选择城市', taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车', realty: '房地产', market: 'OLX', services: '服务', jobs: '工作', business: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS' },
  ar: { setup: 'إعدادات', appearance: 'المظهر', lang: 'اللغة', loc: 'الموقع', city: 'مدينة', country: 'بلد', login: 'دخول', skip: 'تخطي', cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم', selectCity: 'اخтер مدينة', taxi: 'تاкси', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار', realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف', business: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS' },
  hi: { setup: 'सेटअप', appearance: 'दिखावट', lang: 'भाषा', loc: 'स्थान', city: 'शहर', country: 'देश', login: 'लॉगिन', skip: 'छोड़ें', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व', selectCity: 'शहर चुनें', taxi: 'टैक्सी', transfer: 'трансфер', bus: 'बस', rent: 'किраया', realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी', business: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS' }
};

const allCategories = [
  { id: 'taxi', nameKey: 'taxi', icon: Icons.Car, color: 'bg-yellow-400' },
  { id: 'transfer', nameKey: 'transfer', icon: Icons.Users, color: 'bg-green-500' },
  { id: 'bus', nameKey: 'bus', icon: Icons.Bus, color: 'bg-blue-600' },
  { id: 'rent', nameKey: 'rent', icon: Icons.Key, color: 'bg-indigo-600' },
  { id: 'realty', nameKey: 'realty', icon: Icons.Home, color: 'bg-emerald-500' },
  { id: 'market', nameKey: 'market', icon: Icons.ShoppingBag, color: 'bg-orange-500' },
  { id: 'services', nameKey: 'services', icon: Icons.Wrench, color: 'bg-purple-500' },
  { id: 'jobs', nameKey: 'jobs', icon: Icons.Briefcase, color: 'bg-indigo-500' },
  { id: 'business', nameKey: 'business', icon: Icons.Building2, color: 'bg-slate-700' },
  { id: 'ai', nameKey: 'ai', icon: Icons.Bot, color: 'bg-red-500' },
  { id: 'charity', nameKey: 'charity', icon: Icons.HeartHandshake, color: 'bg-pink-500' },
  { id: 'emergency', nameKey: 'emergency', icon: Icons.LifeBuoy, color: 'bg-red-600' },
];

const languages = [
  { code: 'ua', label: 'UKR', iso: 'ua' }, { code: 'ru', label: 'RUS', iso: 'ru' },
  { code: 'en', label: 'ENG', iso: 'us' }, { code: 'de', label: 'GER', iso: 'de' },
  { code: 'fr', label: 'FRA', iso: 'fr' }, { code: 'es', label: 'ESP', iso: 'es' },
  { code: 'pt', label: 'POR', iso: 'pt' }, { code: 'it', label: 'ITA', iso: 'it' },
  { code: 'ja', label: 'JPN', iso: 'jp' }, { code: 'zh', label: 'CHI', iso: 'cn' },
  { code: 'ar', label: 'ARA', iso: 'sa' }, { code: 'hi', label: 'HIN', iso: 'in' },
];

export default function App() {
  const [step, setStep] = useState('splash');
  const [theme, setTheme] = useState('dark');
  const [scope, setScope] = useState('city');
  const [userData, setUserData] = useState({ lang: 'ua', city: '', country: '', countryCode: '', lat: null as number | null, lon: null as number | null });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);

  const t = translations[userData.lang] || translations.en;
  const loaderText = "COVCHEG-AI".split("");

  // Исправленная функция: форсируем язык и извлекаем его из extratags если нужно
  const updateLocationNames = useCallback(async (lat: number, lon: number, lang: string) => {
    setIsGpsLoading(true);
    try {
      // Добавляем extratags=1 для получения альтернативных названий
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}&extratags=1&zoom=10`);
      const data = await res.json();
      
      if (data.address) {
        // Логика: если Nominatim тупит, пытаемся взять имя из extratags (name:ua, name:en и т.д.)
        const langKey = `name:${lang}`;
        const city = data.extratags?.[langKey] || data.address.city || data.address.town || data.address.village || data.address.municipality || '';
        const country = data.extratags?.[`name:${lang}`] || data.address.country || '';

        setUserData(prev => ({ 
          ...prev, 
          city: city,
          country: country,
          countryCode: data.address.country_code?.toUpperCase() || ''
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGpsLoading(false);
    }
  }, []);

  const requestGPS = () => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserData(prev => ({ ...prev, lat: latitude, lon: longitude }));
        await updateLocationNames(latitude, longitude, userData.lang);
      },
      () => setIsGpsLoading(false),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (languages.some(l => l.code === browserLang)) {
      setUserData(prev => ({ ...prev, lang: browserLang }));
    }
    const timer = setTimeout(() => {
      setStep('settings');
      requestGPS(); 
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Жесткий триггер при смене языка
  useEffect(() => {
    if (userData.lat && userData.lon) {
      updateLocationNames(userData.lat, userData.lon, userData.lang);
    }
  }, [userData.lang]); // Убрали лишнюю зависимость функции, оставили только язык

  const fetchLoc = async (q: string, type: 'country' | 'city') => {
    if (q.length < 2) { setSuggestions([]); return; }
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${userData.lang}&limit=10&addressdetails=1`;
    if (type === 'country') url += '&featuretype=country';
    if (type === 'city' && userData.countryCode) url += `&countrycodes=${userData.countryCode}&featuretype=city`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) { console.error(e); }
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
      <div className={`min-h-screen p-6 flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <h2 className="text-4xl font-black italic mt-10 uppercase text-blue-600">{t.setup}</h2>
        <div className="mt-8 space-y-6 flex-1 overflow-y-auto pb-10">
          {/* Языки - вынес выше, так как это основной переключатель */}
          <section>
            <label className="text-[10px] font-black uppercase text-blue-500 block mb-3">{t.lang}</label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((l) => (
                <button key={l.code} onClick={() => setUserData({...userData, lang: l.code})} className={`p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${userData.lang === l.code ? 'border-blue-600 bg-blue-600/10' : 'border-slate-900 bg-slate-900/40'}`}>
                  <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-8 h-5 object-cover rounded mb-1" alt={l.label} />
                  <span className="text-[10px] font-black">{l.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black uppercase text-blue-500 block mb-3">{t.appearance}</label>
            <div className="flex gap-3">
              {['light', 'dark'].map((t_btn) => (
                <button key={t_btn} onClick={() => setTheme(t_btn)} className={`flex-1 p-4 rounded-2xl border-2 font-black uppercase text-xs ${theme === t_btn ? 'border-blue-600 bg-blue-600/10 text-blue-500' : 'border-slate-800 text-gray-500'}`}>{t_btn}</button>
              ))}
            </div>
          </section>

          <section className="space-y-3 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-blue-500">{t.loc}</label>
              <button onClick={requestGPS} className={`text-[10px] font-black uppercase flex items-center gap-1 text-blue-400 ${isGpsLoading ? 'animate-pulse' : ''}`}>
                <Icons.Navigation size={12} /> {isGpsLoading ? '...' : 'GPS'}
              </button>
            </div>
            
            <div className="relative">
              <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input type="text" placeholder={t.country} value={userData.country} onFocus={() => setActiveSearch('country')} onChange={(e) => { setUserData({...userData, country: e.target.value, countryCode: '', lat: null, lon: null}); fetchLoc(e.target.value, 'country'); }} className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600' : 'bg-white border-gray-200 focus:border-blue-600'}`} />
              {activeSearch === 'country' && suggestions.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                  {suggestions.map((item: any) => (
                    <div key={item.place_id} onMouseDown={() => { setUserData({...userData, country: item.display_name.split(',')[0], countryCode: item.address?.country_code?.toUpperCase() || '', lat: parseFloat(item.lat), lon: parseFloat(item.lon)}); setSuggestions([]); setActiveSearch(null); }} className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3">
                      <img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3" alt="flag" /> {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input type="text" placeholder={t.city} value={userData.city} onFocus={() => setActiveSearch('city')} onChange={(e) => { setUserData({...userData, city: e.target.value, lat: null, lon: null}); fetchLoc(e.target.value, 'city'); }} className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600' : 'bg-white border-gray-200 focus:border-blue-600'}`} />
              {activeSearch === 'city' && suggestions.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                  {suggestions.map((item: any) => (
                    <div key={item.place_id} onMouseDown={() => { setUserData({...userData, city: item.display_name.split(',')[0], lat: parseFloat(item.lat), lon: parseFloat(item.lon)}); setSuggestions([]); setActiveSearch(null); }} className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5">
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="pt-4 pb-6 flex flex-col gap-2">
          <button onClick={() => setStep('main')} className="w-full bg-[#24A1DE] text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <Icons.Send size={22} /> {t.login}
          </button>
          <button onClick={() => setStep('main')} className="w-full p-4 rounded-[2rem] font-black uppercase text-[10px] text-gray-500 hover:text-blue-500 text-center">
            {t.skip}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">COVCHEG.UA</h1>
          <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-600/20">
            <Icons.MapPin size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase text-blue-500">{userData.city || t.selectCity}</span>
          </div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} p-1.5 rounded-2xl flex`}>
          {['city', 'country', 'world'].map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
              {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
            </button>
          ))}
        </div>
      </header>
      <main className="p-4 grid grid-cols-3 gap-3">
        {allCategories.map((cat) => (
          <button key={cat.id} className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
            <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={26} /></div>
            <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.nameKey] || cat.nameKey}</span>
          </button>
        ))}
      </main>
      <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-gray-900/90 border-white/10'}`}>
          <Icons.LayoutGrid className="text-white" size={22} />
          <Icons.Search className="text-gray-500" size={22} />
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] border-white active:scale-95 cursor-pointer">
            <Icons.Plus size={32} strokeWidth={3} />
          </div>
          <Icons.MessageCircle className="text-gray-500" size={22} />
          <Icons.Bell className="text-gray-500" size={22} />
      </nav>
    </div>
  );
}
