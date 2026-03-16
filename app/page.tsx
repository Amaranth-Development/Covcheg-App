'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Icons from 'lucide-react';
import pb from '@/lib/pocketbase';

const translations: any = {
  ua: { auth: 'Вхід', telegramBtn: 'Увійти через Telegram', googleBtn: 'Увійти через Google', facebookBtn: 'Увійти через Facebook', skip: 'Пропустити', or: 'або', loc: 'Локація', city: 'Місто', country: 'Країна', selectCity: 'Оберіть місто', next: 'Далі', accountType: 'Тип акаунту', consumer: 'Споживач', business: 'Бізнес', consumerDesc: 'Пошук послуг та товарів', businessDesc: 'Розміщення оголошень та послуг', radius: 'Радіус пошуку', taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО', realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА', business_cat: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ' },
  ru: { auth: 'Вход', telegramBtn: 'Войти через Telegram', googleBtn: 'Войти через Google', facebookBtn: 'Войти через Facebook', skip: 'Пропустить', or: 'или', loc: 'Локация', city: 'Город', country: 'Страна', selectCity: 'Выберите город', next: 'Далее', accountType: 'Тип аккаунта', consumer: 'Потребитель', business: 'Бизнес', consumerDesc: 'Поиск услуг и товаров', businessDesc: 'Размещение объявлений и услуг', radius: 'Радиус поиска', taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО', realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РОБОТА', business_cat: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир' },
  en: { auth: 'Sign In', telegramBtn: 'Sign in with Telegram', googleBtn: 'Sign in with Google', facebookBtn: 'Sign in with Facebook', skip: 'Skip', or: 'or', loc: 'Location', city: 'City', country: 'Country', selectCity: 'Select City', next: 'Next', accountType: 'Account Type', consumer: 'Consumer', business: 'Business', consumerDesc: 'Search for services and goods', businessDesc: 'Post ads and services', radius: 'Search radius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR', realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World' },
  de: { auth: 'Anmelden', telegramBtn: 'Mit Telegram', googleBtn: 'Mit Google', facebookBtn: 'Mit Facebook', skip: 'Überspringen', or: 'oder', loc: 'Standort', city: 'Stadt', country: 'Land', selectCity: 'Stadt wählen', next: 'Weiter', accountType: 'Kontotyp', consumer: 'Verbraucher', business: 'Geschäft', consumerDesc: 'Dienste suchen', businessDesc: 'Anzeigen posten', radius: 'Suchradius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN', realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS', cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt' },
  fr: { auth: 'Connexion', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'Passer', or: 'ou', loc: 'Lieu', city: 'Ville', country: 'Pays', selectCity: 'Choisir ville', next: 'Suivant', accountType: 'Type compte', consumer: 'Consommateur', business: 'Entreprise', consumerDesc: 'Rechercher services', businessDesc: 'Publier annonces', radius: 'Rayon recherche', taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION', realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS', cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde' },
  es: { auth: 'Entrar', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'Saltar', or: 'o', loc: 'Ubicación', city: 'Ciudad', country: 'País', selectCity: 'Ciudad', next: 'Siguiente', accountType: 'Tipo cuenta', consumer: 'Consumidor', business: 'Negocio', consumerDesc: 'Buscar servicios', businessDesc: 'Publicar anuncios', radius: 'Radio búsqueda', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER', realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEО', business_cat: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS', cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo' },
  pt: { auth: 'Entrar', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'Pular', or: 'ou', loc: 'Localização', city: 'Cidade', country: 'País', selectCity: 'Cidade', next: 'Próximo', accountType: 'Tipo conta', consumer: 'Consumidor', business: 'Negócio', consumerDesc: 'Buscar serviços', businessDesc: 'Publicar anúncios', radius: 'Raio pesquisa', taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL', realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO', business_cat: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS', cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Мundo' },
  it: { auth: 'Accedi', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'Salta', or: 'o', loc: 'Posizione', city: 'Città', country: 'Paese', selectCity: 'Città', next: 'Avanti', accountType: 'Tipo account', consumer: 'Consumatore', business: 'Attività', consumerDesc: 'Cerca servizi', businessDesc: 'Pubblica annunci', radius: 'Raggio ricerca', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO', realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS', cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mondo' },
  ja: { auth: 'ログイン', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'スキップ', or: 'または', loc: '場所', city: '都市', country: '国', selectCity: '都市選択', next: '次へ', accountType: 'アカウント', consumer: '消費者', business: 'ビジネス', consumerDesc: 'サービス検索', businessDesc: '広告掲載', radius: '検索半径', taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー', realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事', business_cat: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '都市', countryBtn: '国', worldBtn: '世界' },
  zh: { auth: '登录', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: '跳过', or: '或', loc: '地点', city: '城市', country: '国家', selectCity: '选择城市', next: '下一步', accountType: '账户类型', consumer: '消费者', business: '商务', consumerDesc: '搜索服务', businessDesc: '发布广告', radius: '搜索半径', taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车', realty: '房地产', market: 'OLX', services: '服务', jobs: '工作', business_cat: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '城市', countryBtn: '国家', worldBtn: '世界' },
  ar: { auth: 'دخول', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'تخطي', or: 'أو', loc: 'الموقع', city: 'مدينة', country: 'بلد', selectCity: 'اختر مدينة', next: 'التالي', accountType: 'نوع الحساب', consumer: 'مستهلك', business: 'أعمال', consumerDesc: 'البحث عن الخدمات', businessDesc: 'نشر الإعلانات', radius: 'نطاق البحث', taxi: 'تاكسي', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار', realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف', business_cat: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS', cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم' },
  hi: { auth: 'लॉगिन', telegramBtn: 'Telegram', googleBtn: 'Google', facebookBtn: 'Facebook', skip: 'छोड़ें', or: 'या', loc: 'स्थान', city: 'शहर', country: 'देश', selectCity: 'शहर चुनें', next: 'अगला', accountType: 'खाता प्रकार', consumer: 'उपभोक्ता', business: 'व्यापार', consumerDesc: 'सेवाएं खोजें', businessDesc: 'विज्ञापन पोस्ट', radius: 'खोज त्रिज्या', taxi: 'टैक्सी', transfer: 'ट्रांसफर', bus: 'बस', rent: 'किराया', realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी', business_cat: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व' },
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
  { id: 'business', nameKey: 'business_cat', icon: Icons.Building2, color: 'bg-slate-700' },
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

const LANG_MAP: Record<string, string> = {
  ua: 'uk', ru: 'ru', en: 'en', de: 'de', fr: 'fr',
  es: 'es', pt: 'pt', it: 'it', ja: 'ja', zh: 'zh', ar: 'ar', hi: 'hi',
};

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 50, 100, 200, 300, 500];

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function App() {
  const [step, setStep] = useState('splash');
  const [theme, setTheme] = useState('dark');
  const [scope, setScope] = useState('city');
  const [lang, setLang] = useState('en');
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [accountType, setAccountType] = useState<'consumer' | 'business'>('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [radius, setRadius] = useState(25);
  const [userData, setUserData] = useState({
    city: '', country: '', countryCode: '',
    lat: null as number | null, lon: null as number | null,
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const langRef = useRef<string>('en');

  const t = translations[lang] || translations.en;
  const loaderText = "COVCHEG-AI".split("");

  const loginOrRegisterTelegram = useCallback(async (tgData: any) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgData),
      });
      if (!res.ok) {
        console.error('Telegram auth failed', await res.text());
        setStep('auth');
        return;
      }
      const { email, password } = await res.json();
      await pb.collection('users').authWithPassword(email, password);
    } catch (e) {
      console.error('Telegram auth error', e);
      setStep('auth');
      return;
    }

    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;
      const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
      if (profiles.items.length > 0) {
        setProfile(profiles.items[0]);
        setUserData({
          city: profiles.items[0].city || '',
          country: profiles.items[0].country || '',
          countryCode: profiles.items[0].country_code || '',
          lat: profiles.items[0].lat || null,
          lon: profiles.items[0].lon || null,
        });
        setStep('main');
      } else {
        setStep('location');
      }
    } catch (e) {
      console.error('Profile error:', e);
      setStep('location');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
        tg.ready();
        tg.expand();
      }

      const sysLang = navigator.language.split('-')[0];
      const initialLang = languages.some(l => l.code === sysLang) ? sysLang : 'en';
      setLang(initialLang);
      langRef.current = initialLang;

      const urlParams = new URLSearchParams(window.location.search);
      const tgAuthParam = urlParams.get('tg_auth');
      if (tgAuthParam) {
        try {
          const user = JSON.parse(decodeURIComponent(tgAuthParam));
          setTgUser({ id: parseInt(user.id), first_name: user.first_name || '', last_name: user.last_name, username: user.username, photo_url: user.photo_url });
          window.history.replaceState({}, '', '/');
          await loginOrRegisterTelegram(user);
          return;
        } catch (e) { console.error('tg_auth parse error:', e); }
      }

      try {
        if (pb.authStore.isValid) {
          const userId = pb.authStore.model?.id;
          if (userId) {
            const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
            if (profiles.items.length > 0) {
              const p = profiles.items[0];
              setProfile(p);
              setLang(p.lang || initialLang);
              langRef.current = p.lang || initialLang;
              setTheme(p.theme || 'dark');
              setUserData({ city: p.city || '', country: p.country || '', countryCode: p.country_code || '', lat: p.lat || null, lon: p.lon || null });
              if (p.lat && p.lon) coordsRef.current = { lat: p.lat, lon: p.lon };
              setTimeout(() => setStep('main'), 2000);
              return;
            }
          }
        }
      } catch (e) { console.error(e); }

      setTimeout(() => setStep('auth'), 2000);
    };
    init();
  }, [loginOrRegisterTelegram]);

  const fetchLocationByCoords = useCallback(async (lat: number, lon: number, language: string) => {
    setIsGpsLoading(true);
    try {
      const isoLang = LANG_MAP[language] || language;
      const acceptLang = language === 'en' ? 'en' : `${isoLang},en`;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${acceptLang}&addressdetails=1&zoom=10`);
      const data = await res.json();
      if (data?.address) {
        setUserData(prev => ({
          ...prev,
          city: data.address.city || data.address.town || data.address.village || data.address.municipality || '',
          country: data.address.country || '',
          countryCode: data.address.country_code?.toUpperCase() || '',
          lat, lon,
        }));
        coordsRef.current = { lat, lon };
      }
    } catch (e) { console.error(e); }
    finally { setIsGpsLoading(false); }
  }, []);

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchLocationByCoords(pos.coords.latitude, pos.coords.longitude, langRef.current),
      () => setIsGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchLocationByCoords]);

  useEffect(() => {
    if (step === 'location') requestGPS();
  }, [step]);

  const handleLangChange = useCallback((code: string) => {
    setLang(code);
    langRef.current = code;
    if (coordsRef.current) {
      fetchLocationByCoords(coordsRef.current.lat, coordsRef.current.lon, code);
    }
  }, [fetchLocationByCoords]);

  const fetchLoc = async (q: string, type: 'country' | 'city') => {
    if (q.length < 2) { setSuggestions([]); return; }
    const isoLang = LANG_MAP[langRef.current] || langRef.current;
    const acceptLang = langRef.current === 'en' ? 'en' : `${isoLang},en`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${acceptLang}&limit=10&addressdetails=1`;
    if (type === 'country') url += '&featuretype=country';
    try {
      const res = await fetch(url);
      setSuggestions(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleTelegramAuth = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
      loginOrRegisterTelegram({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
        photo_url: u.photo_url,
        auth_date: Math.floor(Date.now() / 1000),
        hash: '',
      });
      return;
    }

    const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
    const origin = window.location.origin;
    setIsLoading(true);

    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&embed=1&request_access=write&return_to=${encodeURIComponent(origin + '/api/auth/telegram')}`;
    const popup = window.open(authUrl, 'tg_auth', 'width=550,height=470');

    const checkClosed = setInterval(() => {
      if (popup?.closed) { clearInterval(checkClosed); setIsLoading(false); }
    }, 500);

    const onMsg = async (e: MessageEvent) => {
      if (e.origin !== 'https://oauth.telegram.org') return;
      clearInterval(checkClosed);
      window.removeEventListener('message', onMsg);
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        const user = d?.result || d?.user || d;
        if (user?.id) {
          setTgUser({ id: Number(user.id), first_name: user.first_name || '', last_name: user.last_name, username: user.username, photo_url: user.photo_url });
          await loginOrRegisterTelegram(user);
          popup?.close();
        }
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };
    window.addEventListener('message', onMsg);
  }, [loginOrRegisterTelegram]);

  const saveProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = pb.authStore.isValid ? pb.authStore.model?.id : null;
      if (!userId) { setStep('main'); setIsLoading(false); return; }
      const profileData = {
        user: userId,
        account_type: accountType,
        lang: langRef.current,
        theme,
        city: userData.city,
        country: userData.country,
        country_code: userData.countryCode,
        lat: userData.lat || 0,
        lon: userData.lon || 0,
        telegram_id: tgUser ? String(tgUser.id) : '',
        search_radius: radius,
      };
      if (profile?.id) {
        await pb.collection('profiles').update(profile.id, profileData);
      } else {
        const newProfile = await pb.collection('profiles').create(profileData);
        setProfile(newProfile);
      }
      setStep('main');
    } catch (e) { console.error(e); setStep('main'); }
    finally { setIsLoading(false); }
  }, [accountType, theme, userData, tgUser, profile, radius]);

  // остальной JSX без изменений...
}
