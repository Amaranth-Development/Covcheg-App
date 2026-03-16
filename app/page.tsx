'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Icons from 'lucide-react';
import pb from '@/lib/pocketbase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  ua: { auth: 'Вхід', telegramBtn: 'Увійти через Telegram', skip: 'Пропустити', or: 'або', loc: 'Локація', city: 'Місто', country: 'Країна', selectCity: 'Оберіть місто', next: 'Далі', accountType: 'Тип акаунту', consumer: 'Споживач', business: 'Бізнес', consumerDesc: 'Пошук послуг та товарів', businessDesc: 'Розміщення оголошень та послуг', radius: 'Радіус пошуку', taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО', realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА', business_cat: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ' },
  ru: { auth: 'Вход', telegramBtn: 'Войти через Telegram', skip: 'Пропустить', or: 'или', loc: 'Локация', city: 'Город', country: 'Страна', selectCity: 'Выберите город', next: 'Далее', accountType: 'Тип аккаунта', consumer: 'Потребитель', business: 'Бизнес', consumerDesc: 'Поиск услуг и товаров', businessDesc: 'Размещение объявлений и услуг', radius: 'Радиус поиска', taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО', realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РАБОТА', business_cat: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир' },
  en: { auth: 'Sign In', telegramBtn: 'Sign in with Telegram', skip: 'Skip', or: 'or', loc: 'Location', city: 'City', country: 'Country', selectCity: 'Select City', next: 'Next', accountType: 'Account Type', consumer: 'Consumer', business: 'Business', consumerDesc: 'Search for services and goods', businessDesc: 'Post ads and services', radius: 'Search radius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR', realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World' },
  de: { auth: 'Anmelden', telegramBtn: 'Mit Telegram anmelden', skip: 'Überspringen', or: 'oder', loc: 'Standort', city: 'Stadt', country: 'Land', selectCity: 'Stadt wählen', next: 'Weiter', accountType: 'Kontotyp', consumer: 'Verbraucher', business: 'Geschäft', consumerDesc: 'Dienste suchen', businessDesc: 'Anzeigen posten', radius: 'Suchradius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN', realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS', cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt' },
  fr: { auth: 'Connexion', telegramBtn: 'Connexion Telegram', skip: 'Passer', or: 'ou', loc: 'Lieu', city: 'Ville', country: 'Pays', selectCity: 'Choisir ville', next: 'Suivant', accountType: 'Type compte', consumer: 'Consommateur', business: 'Entreprise', consumerDesc: 'Rechercher services', businessDesc: 'Publier annonces', radius: 'Rayon', taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION', realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS', cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde' },
  es: { auth: 'Entrar', telegramBtn: 'Entrar con Telegram', skip: 'Saltar', or: 'o', loc: 'Ubicación', city: 'Ciudad', country: 'País', selectCity: 'Ciudad', next: 'Siguiente', accountType: 'Tipo cuenta', consumer: 'Consumidor', business: 'Negocio', consumerDesc: 'Buscar servicios', businessDesc: 'Publicar anuncios', radius: 'Radio', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER', realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEO', business_cat: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS', cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo' },
  pt: { auth: 'Entrar', telegramBtn: 'Entrar com Telegram', skip: 'Pular', or: 'ou', loc: 'Localização', city: 'Cidade', country: 'País', selectCity: 'Cidade', next: 'Próximo', accountType: 'Tipo conta', consumer: 'Consumidor', business: 'Negócio', consumerDesc: 'Buscar serviços', businessDesc: 'Publicar anúncios', radius: 'Raio', taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL', realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO', business_cat: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS', cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo' },
  it: { auth: 'Accedi', telegramBtn: 'Accedi con Telegram', skip: 'Salta', or: 'o', loc: 'Posizione', city: 'Città', country: 'Paese', selectCity: 'Città', next: 'Avanti', accountType: 'Tipo account', consumer: 'Consumatore', business: 'Attività', consumerDesc: 'Cerca servizi', businessDesc: 'Pubblica annunci', radius: 'Raggio', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO', realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS', cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mondo' },
  ja: { auth: 'ログイン', telegramBtn: 'Telegramでログイン', skip: 'スキップ', or: 'または', loc: '場所', city: '都市', country: '国', selectCity: '都市選択', next: '次へ', accountType: 'アカウント', consumer: '消費者', business: 'ビジネス', consumerDesc: 'サービス検索', businessDesc: '広告掲載', radius: '半径', taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー', realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事', business_cat: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '都市', countryBtn: '国', worldBtn: '世界' },
  zh: { auth: '登录', telegramBtn: 'Telegram登录', skip: '跳过', or: '或', loc: '地点', city: '城市', country: '国家', selectCity: '选择城市', next: '下一步', accountType: '账户类型', consumer: '消费者', business: '商务', consumerDesc: '搜索服务', businessDesc: '发布广告', radius: '半径', taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车', realty: '房地产', market: 'OLX', services: '服务', jobs: '工作', business_cat: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '城市', countryBtn: '国家', worldBtn: '世界' },
  ar: { auth: 'دخول', telegramBtn: 'دخول عبر Telegram', skip: 'تخطي', or: 'أو', loc: 'الموقع', city: 'مدينة', country: 'بلد', selectCity: 'اختر مدينة', next: 'التالي', accountType: 'نوع الحساب', consumer: 'مستهلك', business: 'أعمال', consumerDesc: 'البحث عن الخدمات', businessDesc: 'نشر الإعلانات', radius: 'نطاق', taxi: 'تاكسي', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار', realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف', business_cat: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS', cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم' },
  hi: { auth: 'लॉगिन', telegramBtn: 'Telegram से लॉगिन', skip: 'छोड़ें', or: 'या', loc: 'स्थान', city: 'शहर', country: 'देश', selectCity: 'शहर चुनें', next: 'अगला', accountType: 'खाता प्रकार', consumer: 'उपभोक्ता', business: 'व्यापार', consumerDesc: 'सेवाएं खोजें', businessDesc: 'विज्ञापन पोस्ट', radius: 'त्रिज्या', taxi: 'टैक्सी', transfer: 'ट्रांसफर', bus: 'बस', rent: 'किराया', realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी', business_cat: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व' },
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

// ─── Splash Component ─────────────────────────────────────────────────────────
// Reusable splash for both mobile and desktop — caller controls size via props
function SplashScreen({ isFadingOut }: { isFadingOut: boolean }) {
  const loaderText = "COVCHEG-AI".split("");
  return (
    <div
      style={{
        transition: 'opacity 1s ease-in-out',
        opacity: isFadingOut ? 0 : 1,
      }}
      className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Desktop: bigger, centered, with tagline */}
      <div className="hidden md:flex flex-col items-center gap-8">
        <div className="loader-wrapper-lg">
          {loaderText.map((char, i) => (
            <span key={i} className="loader-letter-lg" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{char}</span>
          ))}
          <div className="loader-fx-lg"></div>
        </div>
        <p className="text-slate-500 text-sm font-semibold tracking-[0.3em] uppercase">First UA Refugess AI Helper</p>
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>

      {/* Mobile: original compact version */}
      <div className="flex md:hidden loader-wrapper">
        {loaderText.map((char, i) => (
          <span key={i} className="loader-letter" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{char}</span>
        ))}
        <div className="loader"></div>
      </div>

      <style jsx>{`
        /* ── Mobile loader ── */
        .loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 150px;
          font-family: "Poppins", sans-serif;
          font-size: 2.5em;
          font-weight: 800;
          color: #fff;
          scale: 1.5;
        }
        .loader {
          position: absolute;
          inset: 0;
          z-index: 5;
          mask: repeating-linear-gradient(90deg, transparent 0, transparent 5px, black 7px, black 8px);
        }
        .loader::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
            radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
            radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
          mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%);
          animation: transform-animation 2s infinite alternate, opacity-animation 4s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        .loader-letter {
          display: inline-block;
          opacity: 0;
          animation: loader-letter-anim 4s infinite linear;
          z-index: 2;
        }

        /* ── Desktop loader (bigger scale) ── */
        .loader-wrapper-lg {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          font-family: "Poppins", sans-serif;
          font-size: 4em;
          font-weight: 800;
          color: #fff;
        }
        .loader-fx-lg {
          position: absolute;
          inset: 0;
          z-index: 5;
          mask: repeating-linear-gradient(90deg, transparent 0, transparent 5px, black 7px, black 8px);
        }
        .loader-fx-lg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
            radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
            radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
          mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%);
          animation: transform-animation 2s infinite alternate, opacity-animation 4s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        .loader-letter-lg {
          display: inline-block;
          opacity: 0;
          animation: loader-letter-anim 4s infinite linear;
          z-index: 2;
        }

        /* ── Shared keyframes ── */
        @keyframes transform-animation {
          0% { transform: translate(-55%); }
          100% { transform: translate(55%); }
        }
        @keyframes opacity-animation {
          0%, 100% { opacity: 0; }
          15% { opacity: 1; }
          65% { opacity: 0; }
        }
        @keyframes loader-letter-anim {
          0% { opacity: 0; }
          25% { opacity: 1; text-shadow: 0px 25px 25px #ffd700, 0px -25px 25px #0057b7; }
          50% { opacity: 0.5; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState('splash');
  // isFadingOut drives the CSS opacity transition before the step changes
  const [isFadingOut, setIsFadingOut] = useState(false);

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const langRef = useRef<string>('en');
  // Tracks if Telegram Widget script has been injected (avoid duplicates)
  const tgWidgetInjected = useRef(false);

  const t = translations[lang] || translations.en;

  // ── Fade-out helper: fade, then change step ──────────────────────────────
  const transitionTo = useCallback((nextStep: string, delay = 0) => {
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsFadingOut(false);
        setStep(nextStep);
      }, 1000); // matches transition duration: 1s
    }, delay);
  }, []);

  // ── PocketBase helpers ───────────────────────────────────────────────────
  const signInTelegramExisting = useCallback(async (tgId: number) => {
    const email = `tg_${tgId}@covcheg.app`;
    const password = `tg_${tgId}_covcheg_${tgId}`;
    try {
      await pb.collection('users').authWithPassword(email, password);
      return true;
    } catch { return false; }
  }, []);

  const loginOrRegisterTelegram = useCallback(async (tgId: number, name: string) => {
    const email = `tg_${tgId}@covcheg.app`;
    const password = `tg_${tgId}_covcheg_${tgId}`;
    try {
      await pb.collection('users').authWithPassword(email, password);
    } catch {
      try {
        await pb.collection('users').create({ email, password, passwordConfirm: password, name });
        await pb.collection('users').authWithPassword(email, password);
      } catch (e) { console.error('Register error:', e); return; }
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
        transitionTo('main');
      } else {
        transitionTo('location');
      }
    } catch (e) { console.error('Profile error:', e); transitionTo('location'); }
  }, [transitionTo]);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sysLang = navigator.language.split('-')[0];
      const initialLang = languages.some(l => l.code === sysLang) ? sysLang : 'en';
      setLang(initialLang);
      langRef.current = initialLang;

      // Telegram Mini App
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
        tg.ready();
        tg.expand();
        const ok = await signInTelegramExisting(u.id);
        if (ok) {
          try {
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
                // Splash shows for ~3s then fades out
                transitionTo('main', 500);
                return;
              }
            }
          } catch (e) { console.error(e); }
        }
        transitionTo('auth', 500);
        return;
      }

      // Browser OAuth redirect callback (?tg_auth=...)
      const urlParams = new URLSearchParams(window.location.search);
      const tgAuthParam = urlParams.get('tg_auth');
      if (tgAuthParam) {
        try {
          const user = JSON.parse(decodeURIComponent(tgAuthParam));
          setTgUser({ id: parseInt(user.id), first_name: user.first_name || '', last_name: user.last_name, username: user.username, photo_url: user.photo_url });
          window.history.replaceState({}, '', '/');
          await loginOrRegisterTelegram(parseInt(user.id), `${user.first_name} ${user.last_name || ''}`.trim());
          return;
        } catch (e) { console.error('tg_auth parse error:', e); }
      }

      // Existing PocketBase session
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
              transitionTo('main', 2000);
              return;
            }
          }
        }
      } catch (e) { console.error(e); }

      // Default: show splash for ~3s, then go to auth
      transitionTo('auth', 3000);
    };
    init();
  }, [loginOrRegisterTelegram, signInTelegramExisting, transitionTo]);

  // ── GPS & Geocoding ──────────────────────────────────────────────────────
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
  }, [step, requestGPS]);

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

  // ── Telegram Login Widget (callback mode) ────────────────────────────────
  // Injects the widget script into a container div.
  // Uses data-onauth callback — validates on server via POST /api/auth/telegram.
  const injectTelegramWidget = useCallback((containerId: string) => {
    if (tgWidgetInjected.current) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    tgWidgetInjected.current = true;

    // Expose global callback for the widget
    (window as any).onTelegramAuth = async (user: any) => {
      setIsLoading(true);
      try {
        // Send to server for secure hash validation
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        const result = await res.json();
        if (!result.ok) throw new Error(result.error || 'Auth failed');

        // Server validated → login with temp password
        await pb.collection('users').authWithPassword(result.email, result.password);

        setTgUser({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
        });

        // Check if profile exists
        const userId = pb.authStore.model?.id;
        if (userId) {
          const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
          if (profiles.items.length > 0) {
            setProfile(profiles.items[0]);
            transitionTo('main');
          } else {
            transitionTo('location');
          }
        } else {
          transitionTo('location');
        }
      } catch (e) {
        console.error('Telegram widget auth error:', e);
        setIsLoading(false);
      }
    };

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      console.error('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not set');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-radius', '12');
    script.async = true;
    container.appendChild(script);
  }, [transitionTo]);

  // Inject widget when auth step mounts
  useEffect(() => {
    if (step === 'auth') {
      tgWidgetInjected.current = false;
      // Small delay to ensure DOM is ready
      setTimeout(() => injectTelegramWidget('tg-widget-container'), 200);
    }
  }, [step, injectTelegramWidget]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = pb.authStore.isValid ? pb.authStore.model?.id : null;
      if (!userId) { transitionTo('main'); setIsLoading(false); return; }
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
      transitionTo('main');
    } catch (e) { console.error(e); transitionTo('main'); }
    finally { setIsLoading(false); }
  }, [accountType, theme, userData, tgUser, profile, radius, transitionTo]);

  // ── Dark/light class helper ───────────────────────────────────────────────
  const dk = (dark: string, light: string) => theme === 'dark' ? dark : light;

  // ═══════════════════════════════════════════════════════════════════════════
  // ── SPLASH ──────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'splash') {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  // Shared page wrapper with fade-in (when step changes) and fade-out
  const pageStyle: React.CSSProperties = {
    transition: 'opacity 1s ease-in-out',
    opacity: isFadingOut ? 0 : 1,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ── AUTH ────────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'auth') {
    return (
      <div style={pageStyle} className={`min-h-screen flex flex-col ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* ── Desktop layout ── */}
        <div className="hidden md:flex min-h-screen">
          {/* Left brand panel */}
          <div className="w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(59,130,246,0.15),transparent_60%)]" />
            <div className="relative z-10 text-center">
              <h1 className="text-6xl font-black italic tracking-tighter text-blue-400 uppercase mb-4">COVCHEG.UA</h1>
              <p className="text-slate-400 text-lg font-semibold mb-8">First AI Helper for Ukrainians</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {['TAXI', 'REALTY', 'JOBS', 'AI'].map(label => (
                  <span key={label} className="px-4 py-2 rounded-full border border-blue-800 text-blue-400 text-xs font-black uppercase">{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right auth panel */}
          <div className={`w-1/2 flex flex-col items-center justify-center p-16 ${dk('bg-slate-950', 'bg-gray-50')}`}>
            {/* Language selector — compact for desktop */}
            <div className="mb-8 w-full max-w-sm">
              <div className="grid grid-cols-6 gap-2">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => handleLangChange(l.code)}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center transition-all ${lang === l.code ? 'border-blue-600 bg-blue-600/10' : dk('border-slate-800 bg-slate-900/40', 'border-gray-200 bg-white')}`}>
                    <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt="" />
                    <span className="text-[8px] font-black">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl">
                  <Icons.Bot size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black italic uppercase text-blue-600">{t.auth}</h2>
                <p className={`text-xs mt-1 ${dk('text-slate-400', 'text-gray-500')}`}>COVCHEG.UA</p>
              </div>

              {/* Telegram widget container */}
              <div className="flex flex-col items-center gap-4">
                <div id="tg-widget-container" className="flex justify-center w-full min-h-[48px]">
                  {isLoading && <Icons.Loader size={22} className="animate-spin text-blue-400 mt-3" />}
                </div>
                <button
                  onClick={() => { setStep('location'); }}
                  className={`w-full text-center text-xs font-black uppercase py-3 rounded-2xl transition-colors ${dk('text-slate-500 hover:text-blue-400', 'text-gray-400 hover:text-blue-500')}`}>
                  {t.skip}
                </button>
              </div>
            </div>

            {/* Theme toggle */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`mt-6 p-3 rounded-2xl border-2 transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
              {theme === 'dark' ? <Icons.Sun size={18} className="text-yellow-400" /> : <Icons.Moon size={18} className="text-slate-600" />}
            </button>
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="flex flex-col md:hidden min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-10 safe-top">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">COVCHEG.UA</h1>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-2xl border-2 transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
              {theme === 'dark' ? <Icons.Sun size={18} className="text-yellow-400" /> : <Icons.Moon size={18} className="text-slate-600" />}
            </button>
          </div>

          {/* Language grid */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-6 gap-2">
              {languages.map((l) => (
                <button key={l.code} onClick={() => handleLangChange(l.code)}
                  className={`p-2 rounded-xl border-2 flex flex-col items-center transition-all ${lang === l.code ? 'border-blue-600 bg-blue-600/10' : dk('border-slate-800 bg-slate-900/40', 'border-gray-200 bg-white')}`}>
                  <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt="" />
                  <span className="text-[8px] font-black">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 safe-bottom">
            <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl">
                  <Icons.Bot size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black italic uppercase text-blue-600">{t.auth}</h2>
                <p className={`text-xs mt-1 ${dk('text-slate-400', 'text-gray-500')}`}>COVCHEG.UA</p>
              </div>

              {/* Telegram widget container — centered */}
              <div className="flex flex-col items-center gap-4">
                <div id="tg-widget-container" className="flex justify-center w-full min-h-[48px]">
                  {isLoading && <Icons.Loader size={22} className="animate-spin text-blue-400 mt-3" />}
                </div>
                <button
                  onClick={() => setStep('location')}
                  className={`w-full text-center text-xs font-black uppercase py-3 rounded-2xl transition-colors ${dk('text-slate-500 hover:text-blue-400', 'text-gray-400 hover:text-blue-500')}`}>
                  {t.skip}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── LOCATION ────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'location') {
    return (
      <div style={pageStyle} className={`min-h-screen flex flex-col ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* ── Desktop: two-column ── */}
        <div className="hidden md:flex min-h-screen">
          {/* Left decorative */}
          <div className="w-2/5 bg-gradient-to-br from-slate-900 to-blue-950 flex flex-col items-center justify-center p-16">
            <Icons.MapPin size={80} className="text-blue-400 mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-black italic uppercase text-blue-400 mb-2">{t.loc}</h2>
            <p className="text-slate-400 text-center text-sm">Вкажіть ваше місцезнаходження для персоналізованих результатів</p>
          </div>

          {/* Right form */}
          <div className={`flex-1 flex flex-col justify-center p-16 ${dk('bg-slate-950', 'bg-gray-50')}`}>
            <LocationForm
              t={t} theme={theme} dk={dk}
              userData={userData} setUserData={setUserData}
              coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions}
              activeSearch={activeSearch} setActiveSearch={setActiveSearch}
              radius={radius} setRadius={setRadius}
              requestGPS={requestGPS} isGpsLoading={isGpsLoading}
              fetchLoc={fetchLoc}
              onNext={() => setStep('account_type')}
            />
          </div>
        </div>

        {/* ── Mobile: single column ── */}
        <div className="flex flex-col md:hidden p-6 safe-top safe-bottom">
          <div className="flex items-center justify-between mt-10 mb-8">
            <h2 className="text-4xl font-black italic uppercase text-blue-600">{t.loc}</h2>
            <button onClick={requestGPS}
              className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')} ${isGpsLoading ? 'animate-pulse' : ''}`}>
              <Icons.Navigation size={14} /> {isGpsLoading ? '...' : 'GPS'}
            </button>
          </div>
          <LocationForm
            t={t} theme={theme} dk={dk}
            userData={userData} setUserData={setUserData}
            coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions}
            activeSearch={activeSearch} setActiveSearch={setActiveSearch}
            radius={radius} setRadius={setRadius}
            requestGPS={requestGPS} isGpsLoading={isGpsLoading}
            fetchLoc={fetchLoc}
            onNext={() => setStep('account_type')}
          />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── ACCOUNT TYPE ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 'account_type') {
    return (
      <div style={pageStyle} className={`min-h-screen flex ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* Desktop */}
        <div className="hidden md:flex w-full">
          <div className="w-1/2 bg-gradient-to-br from-slate-900 to-blue-950 flex flex-col items-center justify-center p-16">
            <Icons.Users size={80} className="text-blue-400 mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-black italic uppercase text-blue-400 mb-2">{t.accountType}</h2>
          </div>
          <div className={`w-1/2 flex flex-col justify-center p-16 gap-6 ${dk('bg-slate-950', 'bg-gray-50')}`}>
            <AccountTypeCards t={t} theme={theme} dk={dk} accountType={accountType} setAccountType={setAccountType} />
            <button onClick={saveProfile} disabled={isLoading}
              className="w-full max-w-md bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              {isLoading ? <Icons.Loader size={22} className="animate-spin" /> : <Icons.CheckCircle size={22} />}
              {isLoading ? '...' : t.next}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col w-full p-6 safe-top safe-bottom">
          <h2 className="text-4xl font-black italic mt-10 mb-8 uppercase text-blue-600">{t.accountType}</h2>
          <div className="flex-1 flex flex-col gap-4">
            <AccountTypeCards t={t} theme={theme} dk={dk} accountType={accountType} setAccountType={setAccountType} />
          </div>
          <div className="pb-6">
            <button onClick={saveProfile} disabled={isLoading}
              className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              {isLoading ? <Icons.Loader size={22} className="animate-spin" /> : <Icons.CheckCircle size={22} />}
              {isLoading ? '...' : t.next}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── MAIN ────────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={pageStyle} className={`min-h-screen ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

      {/* ── Desktop main ── */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Top nav */}
        <header className={`${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')} px-8 py-4 border-b flex items-center gap-6`}>
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase mr-auto">COVCHEG.UA</h1>

          {/* Scope tabs */}
          <div className={`${dk('bg-slate-800', 'bg-gray-100')} p-1 rounded-2xl flex gap-1`}>
            {['city', 'country', 'world'].map((s) => (
              <button key={s} onClick={() => setScope(s)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>
                {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
              </button>
            ))}
          </div>

          {/* Location badge */}
          <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-600/20">
            <Icons.MapPin size={14} className="text-blue-500" />
            <span className="text-[11px] font-black uppercase text-blue-500">{userData.city || t.selectCity}</span>
          </div>

          {/* User badge */}
          {tgUser && (
            <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
              {tgUser.photo_url && <img src={tgUser.photo_url} className="w-7 h-7 rounded-full" alt="" />}
              <span className="text-[11px] font-black text-blue-500">{tgUser.first_name}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
            {theme === 'dark' ? <Icons.Sun size={16} className="text-yellow-400" /> : <Icons.Moon size={16} className="text-slate-600" />}
          </button>
        </header>

        {/* Category grid — desktop: 4 or 6 cols */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {allCategories.map((cat) => (
              <button key={cat.id}
                className={`flex flex-col items-center justify-center rounded-[2rem] p-6 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${dk('bg-slate-900 border border-slate-800 hover:border-blue-700', 'bg-white border border-gray-100 hover:border-blue-300')}`}>
                <div className={`${cat.color} mb-3 rounded-2xl p-4 text-white shadow-lg`}><cat.icon size={30} /></div>
                <span className="text-[11px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.nameKey] || cat.nameKey}</span>
              </button>
            ))}
          </div>
        </main>

        {/* Desktop bottom bar — plus button for post ad */}
        <div className={`${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')} border-t px-8 py-4 flex items-center justify-between`}>
          <div className="flex gap-6">
            <button className="flex flex-col items-center gap-1 text-blue-500">
              <Icons.LayoutGrid size={20} />
              <span className="text-[9px] font-black uppercase">Каталог</span>
            </button>
            <button className={`flex flex-col items-center gap-1 ${dk('text-slate-500', 'text-gray-400')}`}>
              <Icons.Search size={20} />
              <span className="text-[9px] font-black uppercase">Пошук</span>
            </button>
            <button className={`flex flex-col items-center gap-1 ${dk('text-slate-500', 'text-gray-400')}`}>
              <Icons.MessageCircle size={20} />
              <span className="text-[9px] font-black uppercase">Чати</span>
            </button>
            <button className={`flex flex-col items-center gap-1 ${dk('text-slate-500', 'text-gray-400')}`}>
              <Icons.Bell size={20} />
              <span className="text-[9px] font-black uppercase">Сповіщення</span>
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase flex items-center gap-2 transition-all shadow-xl">
            <Icons.Plus size={20} strokeWidth={3} /> Подати оголошення
          </button>
        </div>
      </div>

      {/* ── Mobile main ── */}
      <div className="flex flex-col md:hidden pb-32">
        <header className={`${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
          <div className="flex items-center justify-between mb-4 safe-top">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 uppercase">COVCHEG.UA</h1>
            <div className="flex items-center gap-2">
              {tgUser && (
                <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
                  {tgUser.photo_url && <img src={tgUser.photo_url} className="w-6 h-6 rounded-full" alt="" />}
                  <span className="text-[10px] font-black text-blue-500">{tgUser.first_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-600/20">
                <Icons.MapPin size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase text-blue-500">{userData.city || t.selectCity}</span>
              </div>
            </div>
          </div>
          <div className={`${dk('bg-slate-800', 'bg-gray-100')} p-1.5 rounded-2xl flex`}>
            {['city', 'country', 'world'].map((s) => (
              <button key={s} onClick={() => setScope(s)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
                {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 grid grid-cols-3 gap-3">
          {allCategories.map((cat) => (
            <button key={cat.id}
              className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100')}`}>
              <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={26} /></div>
              <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.nameKey] || cat.nameKey}</span>
            </button>
          ))}
        </main>

        <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md ${dk('bg-slate-900/90 border border-slate-700', 'bg-gray-900/90 border border-white/10')}`}>
          <Icons.LayoutGrid className="text-white" size={22} />
          <Icons.Search className="text-gray-500" size={22} />
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] border-slate-900 active:scale-95 cursor-pointer">
            <Icons.Plus size={32} strokeWidth={3} />
          </div>
          <Icons.MessageCircle className="text-gray-500" size={22} />
          <Icons.Bell className="text-gray-500" size={22} />
        </nav>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocationForm({
  t, theme, dk, userData, setUserData, coordsRef,
  suggestions, setSuggestions, activeSearch, setActiveSearch,
  radius, setRadius, requestGPS, isGpsLoading, fetchLoc, onNext,
}: any) {
  return (
    <div className="w-full max-w-lg space-y-4">
      {/* GPS button — shown inline in desktop, in header on mobile */}
      <div className="hidden md:flex justify-end">
        <button onClick={requestGPS}
          className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-blue-600'} ${isGpsLoading ? 'animate-pulse' : ''}`}>
          <Icons.Navigation size={14} /> {isGpsLoading ? '...' : 'GPS'}
        </button>
      </div>

      {/* Country input */}
      <div className="relative">
        <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
        <input type="text" placeholder={t.country} value={userData.country}
          onFocus={() => setActiveSearch('country')}
          onChange={(e) => {
            setUserData({ ...userData, country: e.target.value, countryCode: '', lat: null, lon: null });
            coordsRef.current = null;
            fetchLoc(e.target.value, 'country');
          }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'country' && suggestions.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
            {suggestions.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => {
                  const lat = parseFloat(item.lat); const lon = parseFloat(item.lon);
                  coordsRef.current = { lat, lon };
                  setUserData({ ...userData, country: item.display_name.split(',')[0], countryCode: item.address?.country_code?.toUpperCase() || '', lat, lon });
                  setSuggestions([]); setActiveSearch(null);
                }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3 text-white">
                <img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3" alt="" /> {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* City input */}
      <div className="relative">
        <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
        <input type="text" placeholder={t.city} value={userData.city}
          onFocus={() => setActiveSearch('city')}
          onChange={(e) => {
            setUserData({ ...userData, city: e.target.value, lat: null, lon: null });
            fetchLoc(e.target.value, 'city');
          }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'city' && suggestions.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
            {suggestions.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => {
                  const lat = parseFloat(item.lat); const lon = parseFloat(item.lon);
                  coordsRef.current = { lat, lon };
                  setUserData({ ...userData, city: item.display_name.split(',')[0], lat, lon });
                  setSuggestions([]); setActiveSearch(null);
                }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 text-white">
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Radius picker */}
      <div className={`p-5 rounded-2xl border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase text-blue-500">{t.radius}</span>
          <span className="text-lg font-black text-blue-600">+{radius} km</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRadius(r)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${radius === r ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'}`}>
              +{r}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
        {t.next} <Icons.ChevronRight size={22} />
      </button>
    </div>
  );
}

function AccountTypeCards({ t, theme, dk, accountType, setAccountType }: any) {
  return (
    <>
      <button onClick={() => setAccountType('consumer')}
        className={`w-full max-w-md p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-95 ${accountType === 'consumer' ? 'border-blue-600 bg-blue-600/10' : theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <div className={`p-4 rounded-2xl shrink-0 ${accountType === 'consumer' ? 'bg-blue-600' : 'bg-slate-700'}`}>
          <Icons.User size={32} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <div className="font-black text-lg uppercase">{t.consumer}</div>
          <div className={`text-xs ${dk('text-slate-400', 'text-gray-500')}`}>{t.consumerDesc}</div>
        </div>
        {accountType === 'consumer' && <Icons.CheckCircle size={24} className="text-blue-600 shrink-0" />}
      </button>

      <button onClick={() => setAccountType('business')}
        className={`w-full max-w-md p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-95 ${accountType === 'business' ? 'border-blue-600 bg-blue-600/10' : theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <div className={`p-4 rounded-2xl shrink-0 ${accountType === 'business' ? 'bg-blue-600' : 'bg-slate-700'}`}>
          <Icons.Building2 size={32} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <div className="font-black text-lg uppercase">{t.business}</div>
          <div className={`text-xs ${dk('text-slate-400', 'text-gray-500')}`}>{t.businessDesc}</div>
        </div>
        {accountType === 'business' && <Icons.CheckCircle size={24} className="text-blue-600 shrink-0" />}
      </button>
    </>
  );
}
