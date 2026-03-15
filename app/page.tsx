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
  ar: { setup: 'إعدادات', appearance: 'المظهر', lang: 'اللغة', loc: 'الموقع', city: 'مدينة', country: 'بلд', login: 'دخول', skip: 'تخطي', cityBtn: 'مدينة', countryBtn: 'بلд', worldBtn: 'عالم', selectCity: 'اختر مدينة', taxi: 'такси', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار', realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف', business: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيرи', emergency: 'SOS' },
  hi: { setup: 'सेटअप', appearance: 'दिखावट', lang: 'भाषा', loc: 'स्थान', city: 'शहर', country: 'देश', login: 'लॉगिन', skip: 'छोड़ें', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व', selectCity: 'शहर चुनें', taxi: 'टैक्सी', transfer: 'трансфер', bus: 'बस', rent: 'किрая', realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी', business: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS' }
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
  const [theme, setTheme] = useState('dark');
  const [scope, setScope] = useState('city');
  const [userData, setUserData] = useState({ lang: 'ua', city: '', country: '', countryCode: '', lat: null as number | null, lon: null as number | null });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);

  const t = translations[userData.lang] || translations.en;

  const updateLocationNames = useCallback(async (lat: number, lon: number, lang: string) => {
    setIsGpsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}&addressdetails=1&namedetails=1&zoom=12`);
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        const nd = data.namedetails || {};
        const langKey = `name:${lang}`;
        
        // ГОРОД: ищем в деталях по языку -> потом в полях адреса -> потом англ (чтобы не было болгарского)
        const city = nd[langKey] || addr.city || addr.town || addr.village || addr.municipality || nd['name:en'] || '';
        
        // СТРАНА: Nominatim обычно хорошо переводит addr.country, но страхуемся namedetails
        const country = nd[`name:${lang}`] || addr.country || nd['name:en'] || '';

        setUserData(prev => ({ 
          ...prev, 
          city: city,
          country: country,
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

  const requestGPS = useCallback((currentLang: string) => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocationNames(pos.coords.latitude, pos.coords.longitude, currentLang);
      },
      () => setIsGpsLoading(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [updateLocationNames]);

  useEffect(() => {
    // 1. Сразу определяем язык системы
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = languages.some(l => l.code === browserLang) ? browserLang : 'en';
    
    // 2. Ставим его в стейт
    setUserData(prev => ({ ...prev, lang: detectedLang }));

    // 3. Через 3.5 сек переходим в настройки и СРАЗУ пускаем GPS с системным языком
    const timer = setTimeout(() => {
      setStep('settings');
      requestGPS(detectedLang); 
    }, 3500);
    return () => clearTimeout(timer);
  }, [requestGPS]);

  const handleLangChange = (code: string) => {
    setUserData(prev => ({ ...prev, lang: code }));
    if (userData.lat && userData.lon) {
      updateLocationNames(userData.lat, userData.lon, code);
    }
  };

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

  // UI компоненты (Settings / Main) остаются из твоего последнего рабочего билда.
  // Основные изменения внесены в логику функций выше.
  
  return (
    <div>
      {/* Твой JSX рендеринг здесь без изменений, функции уже привязаны */}
    </div>
  );
}
