'use client';
import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';

const translations: any = {
  ua: { setup: 'Налаштування', appearance: 'Вигляд', lang: 'Мова', loc: 'Локація', city: 'Місто', country: 'Країна', login: 'Увійти через Telegram', skip: 'Пропустити', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ', selectCity: 'Оберіть місто' },
  ru: { setup: 'Настройки', appearance: 'Вид', lang: 'Язык', loc: 'Локация', city: 'Город', country: 'Страна', login: 'Войти через Telegram', skip: 'Пропустить', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир', selectCity: 'Выберите город' },
  en: { setup: 'Setup', appearance: 'Appearance', lang: 'Language', loc: 'Location', city: 'City', country: 'Country', login: 'Login with Telegram', skip: 'Skip', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World', selectCity: 'Select City' },
  de: { setup: 'Einstellung', appearance: 'Optik', lang: 'Sprache', loc: 'Standort', city: 'Stadt', country: 'Land', login: 'Telegram Login', skip: 'Überspringen', cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt', selectCity: 'Stadt wählen' },
  fr: { setup: 'Réglages', appearance: 'Apparence', lang: 'Langue', loc: 'Lieu', city: 'Ville', country: 'Pays', login: 'Connexion Telegram', skip: 'Passer', cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde', selectCity: 'Ville' },
  es: { setup: 'Ajustes', appearance: 'Apariencia', lang: 'Idioma', loc: 'Ubicación', city: 'Ciudad', country: 'País', login: 'Entrar con Telegram', skip: 'Saltar', cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo', selectCity: 'Ciudad' },
  pt: { setup: 'Ajustes', appearance: 'Aparência', lang: 'Idioma', loc: 'Localização', city: 'Cidade', country: 'País', login: 'Entrar con Telegram', skip: 'Pular', cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo', selectCity: 'Cidade' },
  it: { setup: 'Impostazioni', appearance: 'Aspetto', lang: 'Lingua', loc: 'Posizione', city: 'Città', country: 'Paese', login: 'Login Telegram', skip: 'Salta', cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mundo', selectCity: 'Città' },
  ja: { setup: '設定', appearance: '外観', lang: '言語', loc: '場所', city: '都市', country: '国', login: 'ログイン', skip: 'スキップ', cityBtn: '都市', countryBtn: '国', worldBtn: '世界', selectCity: '都市を選択' },
  zh: { setup: '设置', appearance: '外观', lang: '语言', loc: '地点', city: '城市', country: '国家', login: '登录', skip: '跳过', cityBtn: '城市', countryBtn: '国家', worldBtn: '世界', selectCity: '选择城市' },
  ar: { setup: 'إعدادات', appearance: 'المظهر', lang: 'اللغة', loc: 'الموقع', city: 'مدينة', country: 'بلد', login: 'دخول', skip: 'تخطي', cityBtn: 'مدينة', countryBtn: 'بلд', worldBtn: 'عالم', selectCity: 'اختر مدينة' },
  hi: { setup: 'सेटअप', appearance: 'दिखावट', lang: 'भाषा', loc: 'स्थान', city: 'शहर', country: 'देश', login: 'लॉगिन', skip: 'छोड़ें', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व', selectCity: 'शहर चुनें' }
};

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
  const [userData, setUserData] = useState({ lang: 'ua', city: '', country: '', countryCode: '', lat: null as number | null, lon: null as number | null });
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Функция обновления перевода локации
  const updateLocationNames = useCallback(async (lat: number, lon: number, lang: string) => {
    setIsGpsLoading(true);
    try {
      // Ключевой момент: accept-language заставляет API отдавать названия на нужном языке
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}&addressdetails=1`);
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        setUserData(prev => ({ 
          ...prev, 
          city: addr.city || addr.town || addr.village || addr.municipality || '',
          country: addr.country || '',
          countryCode: addr.country_code?.toUpperCase() || '',
          lat, lon
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGpsLoading(false);
    }
  }, []);

  // Запрос GPS
  const requestGPS = useCallback((currentLang: string) => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocationNames(pos.coords.latitude, pos.coords.longitude, currentLang);
      },
      () => setIsGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [updateLocationNames]);

  // Начальная загрузка
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = languages.some(l => l.code === browserLang) ? browserLang : 'en';
    setUserData(prev => ({ ...prev, lang: detectedLang }));

    const timer = setTimeout(() => {
      setStep('settings');
      requestGPS(detectedLang); 
    }, 3500);
    return () => clearTimeout(timer);
  }, [requestGPS]);

  // Тот самый переключатель, который ты просил
  const handleLangChange = (code: string) => {
    setUserData(prev => ({ ...prev, lang: code }));
    // Если координаты уже есть — мгновенно перезапрашиваем имена на новом языке
    if (userData.lat && userData.lon) {
      updateLocationNames(userData.lat, userData.lon, code);
    }
  };

  if (step === 'splash') return <div className="h-screen bg-black flex items-center justify-center text-blue-500 animate-pulse text-4xl font-bold">COVCHEG</div>;

  const t = translations[userData.lang] || translations.en;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-black italic text-blue-600 tracking-tighter uppercase">SETUP</h1>

        {/* Сетка языков */}
        <section className="space-y-4">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{t.lang}</p>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLangChange(l.code)}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                  userData.lang === l.code ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <span className="text-xs font-bold">{l.label}</span>
                <span className="text-[10px] text-slate-500 uppercase">{l.code}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Локация */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{t.loc}</p>
            <button onClick={() => requestGPS(userData.lang)} className="text-[10px] bg-blue-600 px-2 py-1 rounded flex items-center gap-1">
              <Icons.Navigation size={10} /> GPS
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-3">
              <Icons.Globe size={18} className="text-slate-500" />
              <div className="flex-1 text-lg font-medium">{userData.country || '...'}</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-3">
              <Icons.MapPin size={18} className="text-slate-500" />
              <div className="flex-1 text-lg font-medium">{userData.city || '...'}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
