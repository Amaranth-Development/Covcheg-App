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

type Step = 'splash' | 'auth' | 'profile_confirm' | 'location' | 'account_type' | 'main';
type Theme = 'dark' | 'light';
type AccountType = 'consumer' | 'business';

// ─── Translations — 12 языков, все ключи ─────────────────────────────────────
const T: Record<string, Record<string, string>> = {
  ua: {
    auth: 'Вхід', telegramBtn: 'Увійти через Telegram', skip: 'Пропустити', or: 'або',
    authDesc: 'Оберіть мову та увійдіть через Telegram',
    loc: 'Локація', locDesc: 'Вкажіть місцезнаходження для персоналізованих результатів',
    city: 'Місто', country: 'Країна', selectCity: 'Оберіть місто', next: 'Далі', back: 'Назад',
    accountType: 'Тип акаунту', accountTypeDesc: 'Оберіть як ви будете використовувати додаток',
    consumer: 'Споживач', consumerDesc: 'Пошук послуг та товарів',
    business: 'Бізнес', businessDesc: 'Розміщення оголошень та послуг',
    radius: 'Радіус пошуку',
    taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО',
    realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА',
    business_cat: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS',
    cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ',
    catalog: 'Каталог', search: 'Пошук', chats: 'Чати', notifications: 'Сповіщення',
    postAd: 'Подати оголошення', settings: 'Налаштування',
    authSuccess: 'Авторизовано через Telegram', profileTitle: 'Ваш профіль',
    tagline: 'Перший AI-помічник для українців',
  },
  ru: {
    auth: 'Вход', telegramBtn: 'Войти через Telegram', skip: 'Пропустить', or: 'или',
    authDesc: 'Выберите язык и войдите через Telegram',
    loc: 'Локация', locDesc: 'Укажите местоположение для персонализированных результатов',
    city: 'Город', country: 'Страна', selectCity: 'Выберите город', next: 'Далее', back: 'Назад',
    accountType: 'Тип аккаунта', accountTypeDesc: 'Выберите как вы будете использовать приложение',
    consumer: 'Потребитель', consumerDesc: 'Поиск услуг и товаров',
    business: 'Бизнес', businessDesc: 'Размещение объявлений и услуг',
    radius: 'Радиус поиска',
    taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО',
    realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РАБОТА',
    business_cat: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS',
    cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир',
    catalog: 'Каталог', search: 'Поиск', chats: 'Чаты', notifications: 'Уведомления',
    postAd: 'Подать объявление', settings: 'Настройки',
    authSuccess: 'Авторизован через Telegram', profileTitle: 'Ваш профиль',
    tagline: 'Первый AI-помощник для украинцев',
  },
  en: {
    auth: 'Sign In', telegramBtn: 'Sign in with Telegram', skip: 'Skip', or: 'or',
    authDesc: 'Choose language and sign in with Telegram',
    loc: 'Location', locDesc: 'Set your location for personalized results',
    city: 'City', country: 'Country', selectCity: 'Select City', next: 'Next', back: 'Back',
    accountType: 'Account Type', accountTypeDesc: 'Choose how you will use the app',
    consumer: 'Consumer', consumerDesc: 'Search for services and goods',
    business: 'Business', businessDesc: 'Post ads and services',
    radius: 'Search radius',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR',
    realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS',
    cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World',
    catalog: 'Catalog', search: 'Search', chats: 'Chats', notifications: 'Alerts',
    postAd: 'Post Ad', settings: 'Settings',
    authSuccess: 'Authorized via Telegram', profileTitle: 'Your Profile',
    tagline: 'First AI Helper for Ukrainians',
  },
  de: {
    auth: 'Anmelden', telegramBtn: 'Mit Telegram anmelden', skip: 'Überspringen', or: 'oder',
    authDesc: 'Sprache wählen und mit Telegram anmelden',
    loc: 'Standort', locDesc: 'Standort für personalisierte Ergebnisse angeben',
    city: 'Stadt', country: 'Land', selectCity: 'Stadt wählen', next: 'Weiter', back: 'Zurück',
    accountType: 'Kontotyp', accountTypeDesc: 'Wählen Sie, wie Sie die App nutzen möchten',
    consumer: 'Verbraucher', consumerDesc: 'Dienste und Waren suchen',
    business: 'Geschäft', businessDesc: 'Anzeigen und Dienste posten',
    radius: 'Suchradius',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN',
    realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS',
    cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt',
    catalog: 'Katalog', search: 'Suche', chats: 'Chats', notifications: 'Hinweise',
    postAd: 'Anzeige aufgeben', settings: 'Einstellungen',
    authSuccess: 'Über Telegram autorisiert', profileTitle: 'Ihr Profil',
    tagline: 'Erster KI-Helfer für Ukrainer',
  },
  fr: {
    auth: 'Connexion', telegramBtn: 'Connexion Telegram', skip: 'Passer', or: 'ou',
    authDesc: 'Choisissez la langue et connectez-vous via Telegram',
    loc: 'Lieu', locDesc: 'Indiquez votre emplacement pour des résultats personnalisés',
    city: 'Ville', country: 'Pays', selectCity: 'Choisir ville', next: 'Suivant', back: 'Retour',
    accountType: 'Type compte', accountTypeDesc: "Choisissez comment vous utiliserez l'application",
    consumer: 'Consommateur', consumerDesc: 'Rechercher services et biens',
    business: 'Entreprise', businessDesc: 'Publier annonces et services',
    radius: 'Rayon',
    taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION',
    realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'EMPLOIS',
    business_cat: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS',
    cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde',
    catalog: 'Catalogue', search: 'Recherche', chats: 'Chats', notifications: 'Alertes',
    postAd: 'Publier annonce', settings: 'Paramètres',
    authSuccess: 'Autorisé via Telegram', profileTitle: 'Votre profil',
    tagline: 'Premier assistant IA pour Ukrainiens',
  },
  es: {
    auth: 'Entrar', telegramBtn: 'Entrar con Telegram', skip: 'Saltar', or: 'o',
    authDesc: 'Elige idioma e inicia sesión con Telegram',
    loc: 'Ubicación', locDesc: 'Indica tu ubicación para resultados personalizados',
    city: 'Ciudad', country: 'País', selectCity: 'Ciudad', next: 'Siguiente', back: 'Volver',
    accountType: 'Tipo cuenta', accountTypeDesc: 'Elige cómo usarás la aplicación',
    consumer: 'Consumidor', consumerDesc: 'Buscar servicios y bienes',
    business: 'Negocio', businessDesc: 'Publicar anuncios y servicios',
    radius: 'Radio',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER',
    realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEO',
    business_cat: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS',
    cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo',
    catalog: 'Catálogo', search: 'Búsqueda', chats: 'Chats', notifications: 'Alertas',
    postAd: 'Publicar anuncio', settings: 'Ajustes',
    authSuccess: 'Autorizado vía Telegram', profileTitle: 'Tu perfil',
    tagline: 'Primer asistente IA para ucranianos',
  },
  pt: {
    auth: 'Entrar', telegramBtn: 'Entrar com Telegram', skip: 'Pular', or: 'ou',
    authDesc: 'Escolha o idioma e entre com Telegram',
    loc: 'Localização', locDesc: 'Defina sua localização para resultados personalizados',
    city: 'Cidade', country: 'País', selectCity: 'Cidade', next: 'Próximo', back: 'Voltar',
    accountType: 'Tipo conta', accountTypeDesc: 'Escolha como você usará o aplicativo',
    consumer: 'Consumidor', consumerDesc: 'Buscar serviços e bens',
    business: 'Negócio', businessDesc: 'Publicar anúncios e serviços',
    radius: 'Raio',
    taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL',
    realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO',
    business_cat: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS',
    cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo',
    catalog: 'Catálogo', search: 'Pesquisa', chats: 'Chats', notifications: 'Alertas',
    postAd: 'Publicar anúncio', settings: 'Configurações',
    authSuccess: 'Autorizado via Telegram', profileTitle: 'Seu perfil',
    tagline: 'Primeiro assistente IA para ucranianos',
  },
  it: {
    auth: 'Accedi', telegramBtn: 'Accedi con Telegram', skip: 'Salta', or: 'o',
    authDesc: 'Scegli la lingua e accedi con Telegram',
    loc: 'Posizione', locDesc: 'Imposta la posizione per risultati personalizzati',
    city: 'Città', country: 'Paese', selectCity: 'Città', next: 'Avanti', back: 'Indietro',
    accountType: 'Tipo account', accountTypeDesc: "Scegli come userai l'applicazione",
    consumer: 'Consumatore', consumerDesc: 'Cerca servizi e prodotti',
    business: 'Attività', businessDesc: 'Pubblica annunci e servizi',
    radius: 'Raggio',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO',
    realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS',
    cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mondo',
    catalog: 'Catalogo', search: 'Ricerca', chats: 'Chat', notifications: 'Avvisi',
    postAd: 'Pubblica annuncio', settings: 'Impostazioni',
    authSuccess: 'Autorizzato via Telegram', profileTitle: 'Il tuo profilo',
    tagline: 'Primo assistente IA per ucraini',
  },
  ja: {
    auth: 'ログイン', telegramBtn: 'Telegramでログイン', skip: 'スキップ', or: 'または',
    authDesc: '言語を選択してTelegramでログイン',
    loc: '場所', locDesc: 'パーソナライズされた結果のために場所を設定',
    city: '都市', country: '国', selectCity: '都市選択', next: '次へ', back: '戻る',
    accountType: 'アカウント種別', accountTypeDesc: 'アプリの使用方法を選択',
    consumer: '消費者', consumerDesc: 'サービスと商品を検索',
    business: 'ビジネス', businessDesc: '広告とサービスを掲載',
    radius: '検索半径',
    taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー',
    realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事',
    business_cat: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS',
    cityBtn: '都市', countryBtn: '国', worldBtn: '世界',
    catalog: 'カタログ', search: '検索', chats: 'チャット', notifications: '通知',
    postAd: '広告を掲載', settings: '設定',
    authSuccess: 'Telegramで認証済み', profileTitle: 'あなたのプロフィール',
    tagline: 'ウクライナ人向け初のAIアシスタント',
  },
  zh: {
    auth: '登录', telegramBtn: 'Telegram登录', skip: '跳过', or: '或',
    authDesc: '选择语言并通过Telegram登录',
    loc: '地点', locDesc: '设置您的位置以获取个性化结果',
    city: '城市', country: '国家', selectCity: '选择城市', next: '下一步', back: '返回',
    accountType: '账户类型', accountTypeDesc: '选择您使用应用的方式',
    consumer: '消费者', consumerDesc: '搜索服务和商品',
    business: '商务', businessDesc: '发布广告和服务',
    radius: '搜索半径',
    taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车',
    realty: '房地产', market: 'OLX', services: '服务', jobs: '工作',
    business_cat: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS',
    cityBtn: '城市', countryBtn: '国家', worldBtn: '世界',
    catalog: '目录', search: '搜索', chats: '聊天', notifications: '通知',
    postAd: '发布广告', settings: '设置',
    authSuccess: '已通过Telegram授权', profileTitle: '您的个人资料',
    tagline: '乌克兰人的第一个AI助手',
  },
  ar: {
    auth: 'دخول', telegramBtn: 'دخول عبر Telegram', skip: 'تخطي', or: 'أو',
    authDesc: 'اختر اللغة وادخل عبر Telegram',
    loc: 'الموقع', locDesc: 'حدد موقعك للحصول على نتائج مخصصة',
    city: 'مدينة', country: 'بلد', selectCity: 'اختر مدينة', next: 'التالي', back: 'رجوع',
    accountType: 'نوع الحساب', accountTypeDesc: 'اختر كيف ستستخدم التطبيق',
    consumer: 'مستهلك', consumerDesc: 'البحث عن الخدمات والبضائع',
    business: 'أعمال', businessDesc: 'نشر الإعلانات والخدمات',
    radius: 'نطاق البحث',
    taxi: 'تاكسي', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار',
    realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف',
    business_cat: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS',
    cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم',
    catalog: 'كتالوج', search: 'بحث', chats: 'محادثات', notifications: 'تنبيهات',
    postAd: 'نشر إعلان', settings: 'إعدادات',
    authSuccess: 'تم التفويض عبر Telegram', profileTitle: 'ملفك الشخصي',
    tagline: 'أول مساعد ذكاء اصطناعي للأوكرانيين',
  },
  hi: {
    auth: 'लॉगिन', telegramBtn: 'Telegram से लॉगिन', skip: 'छोड़ें', or: 'या',
    authDesc: 'भाषा चुनें और Telegram से लॉगिन करें',
    loc: 'स्थान', locDesc: 'व्यक्तिगत परिणामों के लिए स्थान निर्धारित करें',
    city: 'शहर', country: 'देश', selectCity: 'शहर चुनें', next: 'अगला', back: 'वापस',
    accountType: 'खाता प्रकार', accountTypeDesc: 'चुनें कि आप ऐप का उपयोग कैसे करेंगे',
    consumer: 'उपभोक्ता', consumerDesc: 'सेवाएं और सामान खोजें',
    business: 'व्यापार', businessDesc: 'विज्ञापन और सेवाएं पोस्ट करें',
    radius: 'खोज त्रिज्या',
    taxi: 'टैक्सी', transfer: 'ट्रांसफर', bus: 'बस', rent: 'किराया',
    realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी',
    business_cat: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS',
    cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व',
    catalog: 'कैटलॉग', search: 'खोज', chats: 'चैट', notifications: 'सूचनाएं',
    postAd: 'विज्ञापन दें', settings: 'सेटिंग्स',
    authSuccess: 'Telegram के माध्यम से अधिकृत', profileTitle: 'आपकी प्रोफ़ाइल',
    tagline: 'यूक्रेनियन के लिए पहला AI सहायक',
  },
};

const CATEGORIES = [
  { id: 'taxi',     key: 'taxi',         icon: Icons.Car,            color: 'bg-yellow-400' },
  { id: 'transfer', key: 'transfer',     icon: Icons.Users,          color: 'bg-green-500'  },
  { id: 'bus',      key: 'bus',          icon: Icons.Bus,            color: 'bg-blue-600'   },
  { id: 'rent',     key: 'rent',         icon: Icons.Key,            color: 'bg-indigo-600' },
  { id: 'realty',   key: 'realty',       icon: Icons.Home,           color: 'bg-emerald-500'},
  { id: 'market',   key: 'market',       icon: Icons.ShoppingBag,    color: 'bg-orange-500' },
  { id: 'services', key: 'services',     icon: Icons.Wrench,         color: 'bg-purple-500' },
  { id: 'jobs',     key: 'jobs',         icon: Icons.Briefcase,      color: 'bg-indigo-500' },
  { id: 'business', key: 'business_cat', icon: Icons.Building2,      color: 'bg-slate-700'  },
  { id: 'ai',       key: 'ai',           icon: Icons.Bot,            color: 'bg-red-500'    },
  { id: 'charity',  key: 'charity',      icon: Icons.HeartHandshake, color: 'bg-pink-500'   },
  { id: 'emergency',key: 'emergency',    icon: Icons.LifeBuoy,       color: 'bg-red-600'    },
];

const LANGUAGES = [
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

// ─── Splash: адаптивный, один лоадер, без дублирования ───────────────────────
function SplashScreen({ fading }: { fading: boolean }) {
  const chars = 'COVCHEG-AI'.split('');
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070c18] overflow-hidden"
      style={{ transition: 'opacity 1s ease-in-out', opacity: fading ? 0 : 1 }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(37,99,235,0.13) 0%, transparent 70%)' }} />

      <div className="splash-root">
        {chars.map((c, i) => <span key={i} className="sl" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{c}</span>)}
        <div className="sfx" />
      </div>
      <p className="splash-sub">First AI Helper for Ukrainians</p>

      <style jsx>{`
        /* Один лоадер — адаптивный через vw: мобиль / поворот / планшет / ПК */
        .splash-root {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          font-family: "Poppins", "Inter", sans-serif;
          font-weight: 800; color: #fff;
          font-size: clamp(1.8rem, 9vw, 5.5rem);
          height: clamp(60px, 15vw, 200px);
        }
        @media (orientation: landscape) and (max-height: 500px) {
          .splash-root { font-size: clamp(1.4rem, 7vh, 3.5rem); height: clamp(50px, 12vh, 120px); }
          .splash-sub  { display: none; }
        }
        .sfx {
          position: absolute; inset: 0; z-index: 5;
          mask: repeating-linear-gradient(90deg, transparent 0, transparent 5px, black 7px, black 8px);
        }
        .sfx::after {
          content: ""; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
            radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
            radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
          mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%);
          animation: strs 2s infinite alternate, sopc 4s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        .sl { display: inline-block; opacity: 0; z-index: 2; animation: sltr 4s infinite linear; }
        .splash-sub {
          margin-top: clamp(1rem, 3vw, 2.5rem);
          font-size: 11px; letter-spacing: 0.45em;
          text-transform: uppercase; font-weight: 600;
          color: #1e3a5f;
        }
        @keyframes strs  { 0%  { transform: translate(-55%); } 100% { transform: translate(55%); } }
        @keyframes sopc  { 0%, 100% { opacity: 0; } 15% { opacity: 1; } 65% { opacity: 0; } }
        @keyframes sltr  { 0% { opacity: 0; } 25% { opacity: 1; text-shadow: 0 25px 25px #ffd700, 0 -25px 25px #0057b7; } 50% { opacity: .5; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]     = useState<Step>('splash');
  const [fading, setFading] = useState(false);
  const [theme, setTheme]   = useState<Theme>('dark');
  const [scope, setScope]   = useState('city');
  const [lang, setLang]     = useState('en');
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [acType, setAcType] = useState<AccountType>('consumer');
  const [loading, setLoading] = useState(false);
  const [radius, setRadius]   = useState(25);
  const [loc, setLoc]         = useState({ city: '', country: '', cc: '', lat: null as number | null, lon: null as number | null });
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [sugg, setSugg]               = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);
  const [profile, setProfile]           = useState<any>(null);

  const coordsRef  = useRef<{ lat: number; lon: number } | null>(null);
  const langRef    = useRef('en');
  const widgetRef  = useRef(false);

  const t  = T[lang] || T.en;
  const dk = (d: string, l: string) => theme === 'dark' ? d : l;

  // Fade transition
  const go = useCallback((next: Step, delay = 0) => {
    setTimeout(() => {
      setFading(true);
      setTimeout(() => { setFading(false); setStep(next); }, 1000);
    }, delay);
  }, []);

  // ── PocketBase auth ─────────────────────────────────────────────────────
  const pbSignIn = useCallback(async (tgId: number) => {
    try {
      await pb.collection('users').authWithPassword(`tg_${tgId}@covcheg.app`, `tg_${tgId}_covcheg_${tgId}`);
      return true;
    } catch { return false; }
  }, []);

  const pbRegister = useCallback(async (tgId: number, name: string) => {
    const email = `tg_${tgId}@covcheg.app`, password = `tg_${tgId}_covcheg_${tgId}`;
    try { await pb.collection('users').authWithPassword(email, password); }
    catch {
      try {
        await pb.collection('users').create({ email, password, passwordConfirm: password, name });
        await pb.collection('users').authWithPassword(email, password);
      } catch (e) { console.error(e); return false; }
    }
    return true;
  }, []);

  // Load profile from PocketBase
  const loadProfile = useCallback(async (initialLang: string): Promise<boolean> => {
    const userId = pb.authStore.model?.id;
    if (!userId) return false;
    try {
      const res = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
      if (res.items.length > 0) {
        const p = res.items[0];
        setProfile(p);
        const l = p.lang || initialLang;
        setLang(l); langRef.current = l;
        setTheme(p.theme || 'dark');
        setLoc({ city: p.city || '', country: p.country || '', cc: p.country_code || '', lat: p.lat || null, lon: p.lon || null });
        if (p.lat && p.lon) coordsRef.current = { lat: p.lat, lon: p.lon };
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  }, []);

  // ── After TG auth callback ──────────────────────────────────────────────
  const onTgAuthSuccess = useCallback(async (user: TelegramUser, tempEmail?: string, tempPass?: string) => {
    setTgUser(user);
    // If we have temp credentials (from widget POST) — login with them
    if (tempEmail && tempPass) {
      try { await pb.collection('users').authWithPassword(tempEmail, tempPass); }
      catch (e) { console.error('pb login with temp creds failed', e); }
    }
    const hasProfile = await loadProfile(langRef.current);
    if (hasProfile) {
      go('main');
    } else {
      go('profile_confirm');
    }
    setLoading(false);
  }, [loadProfile, go]);

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sysLang = navigator.language.split('-')[0];
      const initLang = LANGUAGES.some(l => l.code === sysLang) ? sysLang : 'en';
      setLang(initLang); langRef.current = initLang;

      // ── Telegram Mini App (TWA) ──
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor)     tg.setHeaderColor('#070c18');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#070c18');
        if (tg.requestFullscreen)  tg.requestFullscreen();

        const tgU: TelegramUser = { id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url };
        setTgUser(tgU);

        // Try existing login
        const ok = await pbSignIn(u.id);
        if (ok) {
          const hasProfile = await loadProfile(initLang);
          go(hasProfile ? 'main' : 'profile_confirm', 500);
          return;
        }
        // Register new user
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
        await pbRegister(u.id, name);
        go('profile_confirm', 500);
        return;
      }

      // ── Browser: OAuth redirect callback (?tg_auth=...) ──
      const params = new URLSearchParams(window.location.search);
      const tgAuthParam = params.get('tg_auth');
      if (tgAuthParam) {
        try {
          const user = JSON.parse(decodeURIComponent(tgAuthParam));
          const tgU: TelegramUser = { id: parseInt(user.id), first_name: user.first_name || '', last_name: user.last_name, username: user.username, photo_url: user.photo_url };
          window.history.replaceState({}, '', '/');
          const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
          await pbRegister(parseInt(user.id), name);
          await onTgAuthSuccess(tgU);
          return;
        } catch (e) { console.error('tg_auth parse error:', e); }
      }

      // ── Existing PocketBase session ──
      try {
        if (pb.authStore.isValid) {
          const hasProfile = await loadProfile(initLang);
          if (hasProfile) { go('main', 2000); return; }
        }
      } catch (e) { console.error(e); }

      go('auth', 3500);
    };
    init();
  }, [pbSignIn, pbRegister, loadProfile, onTgAuthSuccess, go]);

  // ── GPS / Geocoding ─────────────────────────────────────────────────────
  const fetchByCoords = useCallback(async (lat: number, lon: number, language: string) => {
    setGpsLoading(true);
    try {
      const iso = LANG_MAP[language] || language;
      const al  = language === 'en' ? 'en' : `${iso},en`;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${al}&addressdetails=1&zoom=10`);
      const data = await res.json();
      if (data?.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
        setLoc(prev => ({ ...prev, city, country: data.address.country || '', cc: data.address.country_code?.toUpperCase() || '', lat, lon }));
        coordsRef.current = { lat, lon };
      }
    } catch (e) { console.error(e); } finally { setGpsLoading(false); }
  }, []);

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude, langRef.current),
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchByCoords]);

  useEffect(() => { if (step === 'location') requestGPS(); }, [step, requestGPS]);

  const changeLang = useCallback((code: string) => {
    setLang(code); langRef.current = code;
    if (coordsRef.current) fetchByCoords(coordsRef.current.lat, coordsRef.current.lon, code);
  }, [fetchByCoords]);

  const fetchSugg = async (q: string, type: 'country' | 'city') => {
    if (q.length < 2) { setSugg([]); return; }
    const iso = LANG_MAP[langRef.current] || langRef.current;
    const al  = langRef.current === 'en' ? 'en' : `${iso},en`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${al}&limit=10&addressdetails=1`;
    if (type === 'country') url += '&featuretype=country';
    try { const r = await fetch(url); setSugg(await r.json()); } catch (e) { console.error(e); }
  };

  // ── Telegram Widget injection (hidden iframe + styled button) ───────────
  const injectWidget = useCallback((containerId: string) => {
    if (widgetRef.current) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    widgetRef.current = true;

    // Global callback called by the widget iframe
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      try {
        // Validate on server, get temp credentials
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        const result = await res.json();
        if (!result.ok) throw new Error(result.error || 'Auth failed');

        const tgU: TelegramUser = { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username, photo_url: user.photo_url };
        await onTgAuthSuccess(tgU, result.email, result.password);
      } catch (e) { console.error('Widget auth error:', e); setLoading(false); }
    };

    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
    if (!botName) { console.error('NEXT_PUBLIC_TELEGRAM_BOT_NAME not set'); return; }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-radius', '12');
    script.async = true;
    container.appendChild(script);
  }, [onTgAuthSuccess]);

  useEffect(() => {
    if (step === 'auth') {
      widgetRef.current = false;
      setTimeout(() => injectWidget('tg-hidden-widget'), 300);
    }
  }, [step, injectWidget]);

  // Styled button click
  const handleTgBtnClick = useCallback(() => {
    // TWA path — already handled in init, but handle manual re-click
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      setLoading(true);
      const tgU: TelegramUser = { id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url };
      pbSignIn(u.id).then(async ok => {
        if (!ok) await pbRegister(u.id, [u.first_name, u.last_name].filter(Boolean).join(' '));
        await onTgAuthSuccess(tgU);
      });
      return;
    }
    // Browser: click hidden widget button
    setLoading(true);
    const container = document.getElementById('tg-hidden-widget');
    if (container) {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        try {
          (iframe as HTMLIFrameElement).contentWindow?.document.querySelector('button')?.click();
          return;
        } catch {}
      }
    }
    // Fallback: OAuth redirect
    const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
    const origin = window.location.origin;
    if (botId) {
      window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&embed=0&request_access=write&return_to=${encodeURIComponent(origin + '/api/auth/telegram')}`;
    } else {
      setLoading(false);
    }
  }, [pbSignIn, pbRegister, onTgAuthSuccess]);

  // ── Save profile ────────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userId = pb.authStore.isValid ? pb.authStore.model?.id : null;
      if (!userId) { go('main'); setLoading(false); return; }
      const data = {
        user: userId, account_type: acType, lang: langRef.current, theme,
        city: loc.city, country: loc.country, country_code: loc.cc,
        lat: loc.lat || 0, lon: loc.lon || 0,
        telegram_id: tgUser ? String(tgUser.id) : '',
        search_radius: radius,
      };
      if (profile?.id) { await pb.collection('profiles').update(profile.id, data); }
      else { const p = await pb.collection('profiles').create(data); setProfile(p); }
      go('main');
    } catch (e) { console.error(e); go('main'); } finally { setLoading(false); }
  }, [acType, theme, loc, tgUser, profile, radius, go]);

  // ── Shared page fade style ──────────────────────────────────────────────
  const ps: React.CSSProperties = {
    transition: 'opacity 1s ease-in-out',
    opacity: fading ? 0 : 1,
    minHeight: '100dvh',
    background: theme === 'dark' ? '#070c18' : '#edf1fc',
  };

  // ── Language grid (reused in auth) ──────────────────────────────────────
  const LangGrid = () => (
    <div className="grid grid-cols-6 gap-2">
      {LANGUAGES.map(l => (
        <button key={l.code} onClick={() => changeLang(l.code)}
          className={`p-2 rounded-xl border-2 flex flex-col items-center transition-all ${lang === l.code ? 'border-blue-600 bg-blue-600/10' : dk('border-slate-800 bg-slate-900/40', 'border-gray-200 bg-white')}`}>
          <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt="" />
          <span className={`text-[8px] font-black ${dk('text-slate-300', 'text-slate-700')}`}>{l.label}</span>
        </button>
      ))}
    </div>
  );

  // ── Telegram button ─────────────────────────────────────────────────────
  const TgBtn = () => (
    <button onClick={handleTgBtnClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-60"
      style={{ background: '#2AABEE', color: '#fff', boxShadow: '0 4px 24px rgba(42,171,238,0.4)' }}>
      {loading
        ? <Icons.Loader size={20} className="animate-spin shrink-0" />
        : <Icons.Send size={20} className="shrink-0" />}
      {t.telegramBtn}
    </button>
  );

  // ── Theme toggle ────────────────────────────────────────────────────────
  const ThemeBtn = () => (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`p-2.5 rounded-2xl border-2 transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
      {theme === 'dark'
        ? <Icons.Sun size={16} className="text-yellow-400" />
        : <Icons.Moon size={16} className="text-slate-600" />}
    </button>
  );

  // ════════════════════════════════════════════════════════════════════════
  // SPLASH
  // ════════════════════════════════════════════════════════════════════════
  if (step === 'splash') return <SplashScreen fading={fading} />;

  // ════════════════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════════════════
  if (step === 'auth') return (
    <div style={ps} className={`min-h-screen flex flex-col ${dk('text-white', 'text-slate-900')}`}>
      {/* Hidden widget container — invisible */}
      <div id="tg-hidden-widget" style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden', top: 0, left: 0 }} />

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        {/* Left brand */}
        <div className="w-1/2 flex flex-col items-center justify-center p-16 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0d1b3e 0%,#091230 50%,#060c1e 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.14) 0%, transparent 60%)' }} />
          <div className="relative z-10 text-center">
            <h1 className="text-6xl font-black italic tracking-tighter text-blue-400 uppercase mb-3">COVCHEG.UA</h1>
            <p className="text-slate-400 text-base font-semibold mb-8">{t.tagline}</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {['TAXI', 'REALTY', 'JOBS', 'AI'].map(lbl => (
                <span key={lbl} className="px-4 py-2 rounded-full border border-blue-800/60 text-blue-400 text-xs font-black uppercase">{lbl}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div className={`w-1/2 flex flex-col items-center justify-center p-16 gap-8 relative ${dk('bg-slate-950', 'bg-gray-50')}`}>
          <div className="absolute top-4 right-6"><ThemeBtn /></div>
          <div className="w-full max-w-sm"><LangGrid /></div>
          <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
            <div className="flex flex-col items-center mb-7">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
                <Icons.Bot size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black italic uppercase text-blue-500">{t.auth}</h2>
              <p className={`text-xs mt-1 text-center ${dk('text-slate-400', 'text-gray-500')}`}>{t.authDesc}</p>
            </div>
            <div className="flex flex-col gap-3">
              <TgBtn />
              <button onClick={() => go('location')}
                className={`w-full text-center text-xs font-black uppercase py-3 rounded-2xl hover:opacity-60 transition-opacity ${dk('text-slate-500', 'text-gray-400')}`}>
                {t.skip}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex flex-col md:hidden min-h-screen">
        <div className="flex items-center justify-between p-4 pt-10">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
          <ThemeBtn />
        </div>
        <div className="px-4 mb-5"><LangGrid /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
          <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
            <div className="flex flex-col items-center mb-7">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
                <Icons.Bot size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black italic uppercase text-blue-500">{t.auth}</h2>
              <p className={`text-xs mt-1 text-center ${dk('text-slate-400', 'text-gray-500')}`}>{t.authDesc}</p>
            </div>
            <div className="flex flex-col gap-3">
              <TgBtn />
              <button onClick={() => go('location')}
                className={`w-full text-center text-xs font-black uppercase py-3 rounded-2xl hover:opacity-60 transition-opacity ${dk('text-slate-500', 'text-gray-400')}`}>
                {t.skip}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // PROFILE CONFIRM — после авторизации, показывает данные TG профиля
  // ════════════════════════════════════════════════════════════════════════
  if (step === 'profile_confirm') return (
    <div style={ps} className={`min-h-screen flex flex-col items-center justify-center px-6 ${dk('text-white', 'text-slate-900')}`}>
      <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
        {/* Auth success badge */}
        <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Icons.CheckCircle size={16} className="text-green-400" />
          <span className="text-green-400 text-xs font-black uppercase">{t.authSuccess}</span>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt=""
              className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-xl shadow-blue-600/30 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
              <Icons.User size={40} className="text-white" />
            </div>
          )}

          {/* Name */}
          <h2 className="text-2xl font-black tracking-tight text-center">
            {tgUser?.first_name || ''}{tgUser?.last_name ? ` ${tgUser.last_name}` : ''}
          </h2>

          {/* Username */}
          {tgUser?.username && (
            <a href={`https://t.me/${tgUser.username}`} target="_blank" rel="noopener noreferrer"
              className="text-blue-400 text-sm font-bold mt-1 hover:underline">
              @{tgUser.username}
            </a>
          )}

          {/* TG ID */}
          <p className={`text-xs mt-1 font-mono ${dk('text-slate-500', 'text-gray-400')}`}>
            ID: {tgUser?.id}
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px mb-6 ${dk('bg-slate-800', 'bg-gray-100')}`} />

        {/* Next button */}
        <button onClick={() => go('location')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
          {t.next} <Icons.ChevronRight size={22} />
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // LOCATION
  // ════════════════════════════════════════════════════════════════════════
  if (step === 'location') return (
    <div style={ps} className={`min-h-screen flex flex-col ${dk('text-white', 'text-slate-900')}`}>
      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-2/5 flex flex-col items-center justify-center p-16"
          style={{ background: 'linear-gradient(160deg,#0d1b3e 0%,#060c1e 100%)' }}>
          <Icons.MapPin size={72} className="text-blue-400 mb-5" strokeWidth={1.5} />
          <h2 className="text-4xl font-black italic uppercase text-blue-400 mb-3">{t.loc}</h2>
          <p className="text-slate-400 text-center text-sm leading-relaxed">{t.locDesc}</p>
        </div>
        <div className={`flex-1 flex flex-col justify-center p-16 relative ${dk('bg-slate-950', 'bg-gray-50')}`}>
          <div className="absolute top-4 right-6"><ThemeBtn /></div>
          <button onClick={() => go('auth')}
            className="flex items-center gap-1 text-xs font-black uppercase mb-6 text-blue-400 hover:opacity-60 transition-opacity w-fit">
            <Icons.ChevronLeft size={16} />{t.back}
          </button>
          <LocationForm t={t} theme={theme} dk={dk} loc={loc} setLoc={setLoc} coordsRef={coordsRef} sugg={sugg} setSugg={setSugg} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} gpsLoading={gpsLoading} fetchSugg={fetchSugg} onNext={() => go('account_type')} />
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex flex-col md:hidden p-6">
        <div className="flex items-center justify-between mt-10 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => go('auth')}
              className={`p-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')}`}>
              <Icons.ChevronLeft size={18} />
            </button>
            <h2 className="text-3xl font-black italic uppercase text-blue-500">{t.loc}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={requestGPS}
              className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')} ${gpsLoading ? 'animate-pulse' : ''}`}>
              <Icons.Navigation size={14} />{gpsLoading ? '...' : 'GPS'}
            </button>
            <ThemeBtn />
          </div>
        </div>
        <LocationForm t={t} theme={theme} dk={dk} loc={loc} setLoc={setLoc} coordsRef={coordsRef} sugg={sugg} setSugg={setSugg} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} gpsLoading={gpsLoading} fetchSugg={fetchSugg} onNext={() => go('account_type')} />
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ACCOUNT TYPE
  // ════════════════════════════════════════════════════════════════════════
  if (step === 'account_type') return (
    <div style={ps} className={`min-h-screen flex ${dk('text-white', 'text-slate-900')}`}>
      {/* DESKTOP */}
      <div className="hidden md:flex w-full">
        <div className="w-1/2 flex flex-col items-center justify-center p-16"
          style={{ background: 'linear-gradient(160deg,#0d1b3e 0%,#060c1e 100%)' }}>
          <Icons.Users size={72} className="text-blue-400 mb-5" strokeWidth={1.5} />
          <h2 className="text-4xl font-black italic uppercase text-blue-400 mb-3">{t.accountType}</h2>
          <p className="text-slate-400 text-center text-sm leading-relaxed">{t.accountTypeDesc}</p>
        </div>
        <div className={`w-1/2 flex flex-col justify-center p-16 gap-4 relative ${dk('bg-slate-950', 'bg-gray-50')}`}>
          <div className="absolute top-4 right-6"><ThemeBtn /></div>
          <button onClick={() => go('location')}
            className="flex items-center gap-1 text-xs font-black uppercase mb-2 text-blue-400 hover:opacity-60 transition-opacity w-fit">
            <Icons.ChevronLeft size={16} />{t.back}
          </button>
          <AcTypeCards t={t} theme={theme} dk={dk} acType={acType} setAcType={setAcType} />
          <button onClick={saveProfile} disabled={loading}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {loading ? <Icons.Loader size={22} className="animate-spin" /> : <Icons.CheckCircle size={22} />}
            {loading ? '...' : t.next}
          </button>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex md:hidden flex-col w-full p-6" style={{ minHeight: '100dvh' }}>
        <div className="flex items-center justify-between mt-10 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => go('location')}
              className={`p-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')}`}>
              <Icons.ChevronLeft size={18} />
            </button>
            <h2 className="text-3xl font-black italic uppercase text-blue-500">{t.accountType}</h2>
          </div>
          <ThemeBtn />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <AcTypeCards t={t} theme={theme} dk={dk} acType={acType} setAcType={setAcType} />
        </div>
        <div className="pb-6 pt-4">
          <button onClick={saveProfile} disabled={loading}
            className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {loading ? <Icons.Loader size={22} className="animate-spin" /> : <Icons.CheckCircle size={22} />}
            {loading ? '...' : t.next}
          </button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // MAIN
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={ps} className={`min-h-screen ${dk('text-white', 'text-slate-900')}`}>

      {/* DESKTOP */}
      <div className="hidden md:flex flex-col min-h-screen">
        <header className={`px-8 py-4 border-b flex items-center gap-5 ${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')}`}>
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase mr-auto">COVCHEG.UA</h1>
          {/* Scope tabs */}
          <div className={`p-1 rounded-2xl flex gap-1 ${dk('bg-slate-800', 'bg-gray-100')}`}>
            {['city', 'country', 'world'].map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow' : dk('text-slate-400', 'text-gray-400')}`}>
                {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
              </button>
            ))}
          </div>
          {/* Location */}
          <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-600/20">
            <Icons.MapPin size={14} className="text-blue-400" />
            <span className="text-[11px] font-black uppercase text-blue-400">{loc.city || t.selectCity}</span>
          </div>
          {/* User */}
          {tgUser && (
            <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
              {tgUser.photo_url && <img src={tgUser.photo_url} className="w-7 h-7 rounded-full" alt="" />}
              <span className="text-[11px] font-black text-blue-400">{tgUser.first_name}</span>
            </div>
          )}
          <ThemeBtn />
        </header>
        <main className="flex-1 p-8">
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                className={`flex flex-col items-center justify-center rounded-[2rem] p-6 border transition-all hover:scale-105 active:scale-95 cursor-pointer ${dk('bg-slate-900 border-slate-800 hover:border-blue-700', 'bg-white border-gray-100 hover:border-blue-300')}`}>
                <div className={`${cat.color} mb-3 rounded-2xl p-4 text-white shadow-lg`}><cat.icon size={30} /></div>
                <span className="text-[11px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.key] || cat.key}</span>
              </button>
            ))}
          </div>
        </main>
        <div className={`border-t px-8 py-4 flex items-center justify-between ${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')}`}>
          <div className="flex gap-6">
            {[['catalog', Icons.LayoutGrid], ['search', Icons.Search], ['chats', Icons.MessageCircle], ['notifications', Icons.Bell]].map(([key, Icon]: any) => (
              <button key={key} className={`flex flex-col items-center gap-1 ${key === 'catalog' ? 'text-blue-500' : dk('text-slate-500', 'text-gray-400')}`}>
                <Icon size={20} /><span className="text-[9px] font-black uppercase">{t[key]}</span>
              </button>
            ))}
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase flex items-center gap-2 transition-all shadow-xl">
            <Icons.Plus size={20} strokeWidth={3} />{t.postAd}
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex flex-col md:hidden pb-32">
        <header className={`p-6 rounded-b-[2.5rem] shadow-md border-b ${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')}`}>
          <div className="flex items-center justify-between mb-4" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <div className="flex items-center gap-2">
              {tgUser && (
                <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
                  {tgUser.photo_url && <img src={tgUser.photo_url} className="w-6 h-6 rounded-full" alt="" />}
                  <span className="text-[10px] font-black text-blue-400">{tgUser.first_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
                <Icons.MapPin size={12} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase text-blue-400">{loc.city || t.selectCity}</span>
              </div>
              <ThemeBtn />
            </div>
          </div>
          <div className={`p-1.5 rounded-2xl flex ${dk('bg-slate-800', 'bg-gray-100')}`}>
            {['city', 'country', 'world'].map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : dk('text-slate-400', 'text-gray-400')}`}>
                {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
              </button>
            ))}
          </div>
        </header>
        <main className="p-4 grid grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all border ${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')}`}>
              <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={26} /></div>
              <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.key] || cat.key}</span>
            </button>
          ))}
        </main>
        <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md border ${dk('bg-slate-900/90 border-slate-700', 'bg-white/90 border-gray-200')}`}>
          <Icons.LayoutGrid className="text-blue-500" size={22} />
          <Icons.Search className={dk('text-slate-500', 'text-gray-400')} size={22} />
          <div className={`h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-8 active:scale-95 cursor-pointer ${dk('border-[#070c18]', 'border-[#edf1fc]')}`}>
            <Icons.Plus size={32} strokeWidth={3} />
          </div>
          <Icons.MessageCircle className={dk('text-slate-500', 'text-gray-400')} size={22} />
          <Icons.Bell className={dk('text-slate-500', 'text-gray-400')} size={22} />
        </nav>
      </div>
    </div>
  );
}

// ─── LocationForm ─────────────────────────────────────────────────────────────
function LocationForm({ t, theme, dk, loc, setLoc, coordsRef, sugg, setSugg, activeSearch, setActiveSearch, radius, setRadius, requestGPS, gpsLoading, fetchSugg, onNext }: any) {
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="hidden md:flex justify-end">
        <button onClick={requestGPS}
          className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl border ${gpsLoading ? 'animate-pulse' : ''} ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-gray-100 border-gray-200 text-blue-600'}`}>
          <Icons.Navigation size={14} />{gpsLoading ? '...' : 'GPS'}
        </button>
      </div>
      {/* Country */}
      <div className="relative">
        <Icons.Globe className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} size={18} />
        <input type="text" placeholder={t.country} value={loc.country}
          onFocus={() => setActiveSearch('country')}
          onChange={e => { setLoc({ ...loc, country: e.target.value, cc: '', lat: null, lon: null }); coordsRef.current = null; fetchSugg(e.target.value, 'country'); }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'country' && sugg.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-2xl border border-slate-700 max-h-56 overflow-y-auto" style={{ background: '#0d1525' }}>
            {sugg.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat = parseFloat(item.lat), lon = parseFloat(item.lon); coordsRef.current = { lat, lon }; setLoc({ ...loc, country: item.display_name.split(',')[0], cc: item.address?.country_code?.toUpperCase() || '', lat, lon }); setSugg([]); setActiveSearch(null); }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3 text-white">
                <img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3 shrink-0" alt="" />{item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* City */}
      <div className="relative">
        <Icons.MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} size={18} />
        <input type="text" placeholder={t.city} value={loc.city}
          onFocus={() => setActiveSearch('city')}
          onChange={e => { setLoc({ ...loc, city: e.target.value, lat: null, lon: null }); fetchSugg(e.target.value, 'city'); }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'city' && sugg.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-2xl border border-slate-700 max-h-56 overflow-y-auto" style={{ background: '#0d1525' }}>
            {sugg.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat = parseFloat(item.lat), lon = parseFloat(item.lon); coordsRef.current = { lat, lon }; setLoc({ ...loc, city: item.display_name.split(',')[0], lat, lon }); setSugg([]); setActiveSearch(null); }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 text-white">
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Radius */}
      <div className={`p-5 rounded-2xl border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase text-blue-500">{t.radius}</span>
          <span className="text-lg font-black text-blue-500">+{radius} km</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map(r => (
            <button key={r} onClick={() => setRadius(r)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${radius === r ? 'bg-blue-600 text-white border-blue-600' : theme === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              +{r}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
        {t.next}<Icons.ChevronRight size={22} />
      </button>
    </div>
  );
}

// ─── AccountTypeCards ─────────────────────────────────────────────────────────
function AcTypeCards({ t, theme, dk, acType, setAcType }: any) {
  const types = [
    { key: 'consumer', icon: Icons.User,      descKey: 'consumerDesc' },
    { key: 'business', icon: Icons.Building2, descKey: 'businessDesc' },
  ];
  return (
    <>
      {types.map(({ key, icon: Icon, descKey }) => (
        <button key={key} onClick={() => setAcType(key)}
          className={`w-full max-w-md p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-95 ${acType === key ? 'border-blue-600 bg-blue-600/10' : theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className={`p-4 rounded-2xl shrink-0 ${acType === key ? 'bg-blue-600' : 'bg-slate-700/70'}`}>
            <Icon size={30} className="text-white" />
          </div>
          <div className="text-left flex-1">
            <div className="font-black text-base uppercase">{t[key]}</div>
            <div className={`text-xs mt-0.5 ${dk('text-slate-400', 'text-gray-500')}`}>{t[descKey]}</div>
          </div>
          {acType === key && <Icons.CheckCircle size={22} className="text-blue-500 shrink-0" />}
        </button>
      ))}
    </>
  );
}
