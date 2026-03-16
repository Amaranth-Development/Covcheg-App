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

// ─── Translations — все 12 языков, все ключи ──────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  ua: {
    auth: 'Вхід', telegramBtn: 'Увійти через Telegram', skip: 'Пропустити', or: 'або',
    loc: 'Локація', locDesc: 'Вкажіть ваше місцезнаходження для персоналізованих результатів пошуку.',
    city: 'Місто', country: 'Країна', selectCity: 'Оберіть місто', next: 'Далі', back: 'Назад',
    accountType: 'Тип акаунту', accountTypeDesc: 'Оберіть як ви будете використовувати додаток. Це можна змінити у налаштуваннях.',
    consumer: 'Споживач', consumerDesc: 'Пошук послуг та товарів',
    business: 'Бізнес', businessDesc: 'Розміщення оголошень та послуг',
    ngo: 'Організація (НГО)', ngoDesc: 'Громадські та благодійні організації',
    partner: 'Партнер', partnerDesc: 'Партнерські інтеграції та API',
    radius: 'Радіус пошуку',
    taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО',
    realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА',
    business_cat: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS',
    cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ',
    catalog: 'Каталог', search: 'Пошук', chats: 'Чати', notifications: 'Сповіщення',
    postAd: 'Подати оголошення', settings: 'Налаштування',
    tagline: 'Перший AI-помічник для українців',
  },
  ru: {
    auth: 'Вход', telegramBtn: 'Войти через Telegram', skip: 'Пропустить', or: 'или',
    loc: 'Локация', locDesc: 'Укажите ваше местоположение для персонализированных результатов поиска.',
    city: 'Город', country: 'Страна', selectCity: 'Выберите город', next: 'Далее', back: 'Назад',
    accountType: 'Тип аккаунта', accountTypeDesc: 'Выберите как вы будете использовать приложение. Можно изменить в настройках.',
    consumer: 'Потребитель', consumerDesc: 'Поиск услуг и товаров',
    business: 'Бизнес', businessDesc: 'Размещение объявлений и услуг',
    ngo: 'Организация (НГО)', ngoDesc: 'Общественные и благотворительные организации',
    partner: 'Партнёр', partnerDesc: 'Партнёрские интеграции и API',
    radius: 'Радиус поиска',
    taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО',
    realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РАБОТА',
    business_cat: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS',
    cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир',
    catalog: 'Каталог', search: 'Поиск', chats: 'Чаты', notifications: 'Уведомления',
    postAd: 'Подать объявление', settings: 'Настройки',
    tagline: 'Первый AI-помощник для украинцев',
  },
  en: {
    auth: 'Sign In', telegramBtn: 'Sign in with Telegram', skip: 'Skip', or: 'or',
    loc: 'Location', locDesc: 'Set your location to get personalized search results near you.',
    city: 'City', country: 'Country', selectCity: 'Select City', next: 'Next', back: 'Back',
    accountType: 'Account Type', accountTypeDesc: 'Choose how you will use the app. You can change this in settings.',
    consumer: 'Consumer', consumerDesc: 'Search for services and goods',
    business: 'Business', businessDesc: 'Post ads and services',
    ngo: 'Organization (NGO)', ngoDesc: 'Non-profit and charitable organizations',
    partner: 'Partner', partnerDesc: 'Partner integrations and API access',
    radius: 'Search radius',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR',
    realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS',
    cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World',
    catalog: 'Catalog', search: 'Search', chats: 'Chats', notifications: 'Alerts',
    postAd: 'Post Ad', settings: 'Settings',
    tagline: 'First AI Helper for Ukrainians',
  },
  de: {
    auth: 'Anmelden', telegramBtn: 'Mit Telegram anmelden', skip: 'Überspringen', or: 'oder',
    loc: 'Standort', locDesc: 'Geben Sie Ihren Standort für personalisierte Suchergebnisse an.',
    city: 'Stadt', country: 'Land', selectCity: 'Stadt wählen', next: 'Weiter', back: 'Zurück',
    accountType: 'Kontotyp', accountTypeDesc: 'Wählen Sie, wie Sie die App verwenden möchten.',
    consumer: 'Verbraucher', consumerDesc: 'Dienste und Waren suchen',
    business: 'Geschäft', businessDesc: 'Anzeigen und Dienste posten',
    ngo: 'Organisation (NGO)', ngoDesc: 'Gemeinnützige Organisationen',
    partner: 'Partner', partnerDesc: 'Partner-Integrationen und API',
    radius: 'Suchradius',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN',
    realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS',
    cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt',
    catalog: 'Katalog', search: 'Suche', chats: 'Chats', notifications: 'Benachricht.',
    postAd: 'Anzeige aufgeben', settings: 'Einstellungen',
    tagline: 'Erster KI-Helfer für Ukrainer',
  },
  fr: {
    auth: 'Connexion', telegramBtn: 'Connexion Telegram', skip: 'Passer', or: 'ou',
    loc: 'Lieu', locDesc: 'Indiquez votre emplacement pour des résultats personnalisés.',
    city: 'Ville', country: 'Pays', selectCity: 'Choisir ville', next: 'Suivant', back: 'Retour',
    accountType: 'Type compte', accountTypeDesc: "Choisissez comment utiliser l'application.",
    consumer: 'Consommateur', consumerDesc: 'Rechercher services et biens',
    business: 'Entreprise', businessDesc: 'Publier annonces et services',
    ngo: 'Organisation (ONG)', ngoDesc: 'Organisations à but non lucratif',
    partner: 'Partenaire', partnerDesc: 'Intégrations partenaires et API',
    radius: 'Rayon',
    taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION',
    realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'EMPLOIS',
    business_cat: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS',
    cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde',
    catalog: 'Catalogue', search: 'Recherche', chats: 'Chats', notifications: 'Alertes',
    postAd: 'Publier annonce', settings: 'Paramètres',
    tagline: 'Premier assistant IA pour Ukrainiens',
  },
  es: {
    auth: 'Entrar', telegramBtn: 'Entrar con Telegram', skip: 'Saltar', or: 'o',
    loc: 'Ubicación', locDesc: 'Indica tu ubicación para obtener resultados personalizados.',
    city: 'Ciudad', country: 'País', selectCity: 'Ciudad', next: 'Siguiente', back: 'Volver',
    accountType: 'Tipo cuenta', accountTypeDesc: 'Elige cómo usarás la aplicación.',
    consumer: 'Consumidor', consumerDesc: 'Buscar servicios y bienes',
    business: 'Negocio', businessDesc: 'Publicar anuncios y servicios',
    ngo: 'Organización (ONG)', ngoDesc: 'Organizaciones sin ánimo de lucro',
    partner: 'Socio', partnerDesc: 'Integraciones de socios y API',
    radius: 'Radio',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER',
    realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEO',
    business_cat: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS',
    cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo',
    catalog: 'Catálogo', search: 'Búsqueda', chats: 'Chats', notifications: 'Alertas',
    postAd: 'Publicar anuncio', settings: 'Ajustes',
    tagline: 'Primer asistente IA para ucranianos',
  },
  pt: {
    auth: 'Entrar', telegramBtn: 'Entrar com Telegram', skip: 'Pular', or: 'ou',
    loc: 'Localização', locDesc: 'Defina sua localização para resultados personalizados.',
    city: 'Cidade', country: 'País', selectCity: 'Cidade', next: 'Próximo', back: 'Voltar',
    accountType: 'Tipo conta', accountTypeDesc: 'Escolha como você usará o aplicativo.',
    consumer: 'Consumidor', consumerDesc: 'Buscar serviços e bens',
    business: 'Negócio', businessDesc: 'Publicar anúncios e serviços',
    ngo: 'Organização (ONG)', ngoDesc: 'Organizações sem fins lucrativos',
    partner: 'Parceiro', partnerDesc: 'Integrações de parceiros e API',
    radius: 'Raio',
    taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL',
    realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO',
    business_cat: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS',
    cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo',
    catalog: 'Catálogo', search: 'Pesquisa', chats: 'Chats', notifications: 'Alertas',
    postAd: 'Publicar anúncio', settings: 'Configurações',
    tagline: 'Primeiro assistente IA para ucranianos',
  },
  it: {
    auth: 'Accedi', telegramBtn: 'Accedi con Telegram', skip: 'Salta', or: 'o',
    loc: 'Posizione', locDesc: 'Imposta la tua posizione per risultati personalizzati.',
    city: 'Città', country: 'Paese', selectCity: 'Città', next: 'Avanti', back: 'Indietro',
    accountType: 'Tipo account', accountTypeDesc: "Scegli come userai l'applicazione.",
    consumer: 'Consumatore', consumerDesc: 'Cerca servizi e prodotti',
    business: 'Attività', businessDesc: 'Pubblica annunci e servizi',
    ngo: 'Organizzazione (ONG)', ngoDesc: 'Organizzazioni senza scopo di lucro',
    partner: 'Partner', partnerDesc: 'Integrazioni partner e API',
    radius: 'Raggio',
    taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO',
    realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO',
    business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS',
    cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mondo',
    catalog: 'Catalogo', search: 'Ricerca', chats: 'Chat', notifications: 'Avvisi',
    postAd: 'Pubblica annuncio', settings: 'Impostazioni',
    tagline: 'Primo assistente IA per ucraini',
  },
  ja: {
    auth: 'ログイン', telegramBtn: 'Telegramでログイン', skip: 'スキップ', or: 'または',
    loc: '場所', locDesc: 'パーソナライズされた検索結果のために場所を設定してください。',
    city: '都市', country: '国', selectCity: '都市選択', next: '次へ', back: '戻る',
    accountType: 'アカウント種別', accountTypeDesc: 'アプリの使用方法を選択してください。',
    consumer: '消費者', consumerDesc: 'サービスと商品を検索',
    business: 'ビジネス', businessDesc: '広告とサービスを掲載',
    ngo: '組織 (NGO)', ngoDesc: '非営利・慈善団体',
    partner: 'パートナー', partnerDesc: 'パートナー統合とAPI',
    radius: '検索半径',
    taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー',
    realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事',
    business_cat: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS',
    cityBtn: '都市', countryBtn: '国', worldBtn: '世界',
    catalog: 'カタログ', search: '検索', chats: 'チャット', notifications: '通知',
    postAd: '広告を掲載', settings: '設定',
    tagline: 'ウクライナ人向け初のAIアシスタント',
  },
  zh: {
    auth: '登录', telegramBtn: 'Telegram登录', skip: '跳过', or: '或',
    loc: '地点', locDesc: '设置您的位置以获取个性化搜索结果。',
    city: '城市', country: '国家', selectCity: '选择城市', next: '下一步', back: '返回',
    accountType: '账户类型', accountTypeDesc: '选择您使用应用的方式。',
    consumer: '消费者', consumerDesc: '搜索服务和商品',
    business: '商务', businessDesc: '发布广告和服务',
    ngo: '组织 (NGO)', ngoDesc: '非营利和慈善组织',
    partner: '合作伙伴', partnerDesc: '合作伙伴集成和API',
    radius: '搜索半径',
    taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车',
    realty: '房地产', market: 'OLX', services: '服务', jobs: '工作',
    business_cat: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS',
    cityBtn: '城市', countryBtn: '国家', worldBtn: '世界',
    catalog: '目录', search: '搜索', chats: '聊天', notifications: '通知',
    postAd: '发布广告', settings: '设置',
    tagline: '乌克兰人的第一个AI助手',
  },
  ar: {
    auth: 'دخول', telegramBtn: 'دخول عبر Telegram', skip: 'تخطي', or: 'أو',
    loc: 'الموقع', locDesc: 'حدد موقعك للحصول على نتائج بحث مخصصة.',
    city: 'مدينة', country: 'بلد', selectCity: 'اختر مدينة', next: 'التالي', back: 'رجوع',
    accountType: 'نوع الحساب', accountTypeDesc: 'اختر كيف ستستخدم التطبيق.',
    consumer: 'مستهلك', consumerDesc: 'البحث عن الخدمات والبضائع',
    business: 'أعمال', businessDesc: 'نشر الإعلانات والخدمات',
    ngo: 'منظمة (NGO)', ngoDesc: 'منظمات غير ربحية وخيرية',
    partner: 'شريك', partnerDesc: 'تكاملات الشركاء وAPI',
    radius: 'نطاق البحث',
    taxi: 'تاكسي', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار',
    realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف',
    business_cat: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS',
    cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم',
    catalog: 'كتالوج', search: 'بحث', chats: 'محادثات', notifications: 'تنبيهات',
    postAd: 'نشر إعلان', settings: 'إعدادات',
    tagline: 'أول مساعد ذكاء اصطناعي للأوكرانيين',
  },
  hi: {
    auth: 'लॉगिन', telegramBtn: 'Telegram से लॉगिन', skip: 'छोड़ें', or: 'या',
    loc: 'स्थान', locDesc: 'व्यक्तिगत खोज परिणामों के लिए अपना स्थान निर्धारित करें।',
    city: 'शहर', country: 'देश', selectCity: 'शहर चुनें', next: 'अगला', back: 'वापस',
    accountType: 'खाता प्रकार', accountTypeDesc: 'चुनें कि आप ऐप का उपयोग कैसे करेंगे।',
    consumer: 'उपभोक्ता', consumerDesc: 'सेवाएं और सामान खोजें',
    business: 'व्यापार', businessDesc: 'विज्ञापन और सेवाएं पोस्ट करें',
    ngo: 'संगठन (NGO)', ngoDesc: 'गैर-लाभकारी और धर्मार्थ संगठन',
    partner: 'भागीदार', partnerDesc: 'भागीदार एकीकरण और API',
    radius: 'खोज त्रिज्या',
    taxi: 'टैक्सी', transfer: 'ट्रांसफर', bus: 'बस', rent: 'किराया',
    realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी',
    business_cat: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS',
    cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व',
    catalog: 'कैटलॉग', search: 'खोज', chats: 'चैट', notifications: 'सूचनाएं',
    postAd: 'विज्ञापन दें', settings: 'सेटिंग्स',
    tagline: 'यूक्रेनियन के लिए पहला AI सहायक',
  },
};

const allCategories = [
  { id: 'taxi',     nameKey: 'taxi',         icon: Icons.Car,           color: 'bg-yellow-400' },
  { id: 'transfer', nameKey: 'transfer',     icon: Icons.Users,         color: 'bg-green-500'  },
  { id: 'bus',      nameKey: 'bus',          icon: Icons.Bus,           color: 'bg-blue-600'   },
  { id: 'rent',     nameKey: 'rent',         icon: Icons.Key,           color: 'bg-indigo-600' },
  { id: 'realty',   nameKey: 'realty',       icon: Icons.Home,          color: 'bg-emerald-500'},
  { id: 'market',   nameKey: 'market',       icon: Icons.ShoppingBag,   color: 'bg-orange-500' },
  { id: 'services', nameKey: 'services',     icon: Icons.Wrench,        color: 'bg-purple-500' },
  { id: 'jobs',     nameKey: 'jobs',         icon: Icons.Briefcase,     color: 'bg-indigo-500' },
  { id: 'business', nameKey: 'business_cat', icon: Icons.Building2,     color: 'bg-slate-700'  },
  { id: 'ai',       nameKey: 'ai',           icon: Icons.Bot,           color: 'bg-red-500'    },
  { id: 'charity',  nameKey: 'charity',      icon: Icons.HeartHandshake,color: 'bg-pink-500'   },
  { id: 'emergency',nameKey: 'emergency',    icon: Icons.LifeBuoy,      color: 'bg-red-600'    },
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

// ─── Account types (4 типа) ───────────────────────────────────────────────────
type AccountType = 'consumer' | 'business' | 'ngo' | 'partner';

const ACCOUNT_TYPES: { key: AccountType; icon: any; color: string }[] = [
  { key: 'consumer', icon: Icons.User,          color: 'bg-blue-600'    },
  { key: 'business', icon: Icons.Building2,     color: 'bg-indigo-600'  },
  { key: 'ngo',      icon: Icons.HeartHandshake,color: 'bg-emerald-600' },
  { key: 'partner',  icon: Icons.Handshake,     color: 'bg-orange-600'  },
];

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: '#070c18',
    panelLeft: 'linear-gradient(165deg,#0d1b38 0%,#091425 50%,#060c1a 100%)',
    panelRight: 'linear-gradient(145deg,#0c1225 0%,#0e1628 60%,#080e1e 100%)',
    shimmer: 'linear-gradient(120deg,rgba(59,130,246,0.06) 0%,rgba(99,102,241,0.09) 50%,rgba(139,92,246,0.06) 100%)',
    card: 'rgba(12,18,36,0.85)', cardBorder: 'rgba(59,130,246,0.13)',
    inputBg: 'rgba(255,255,255,0.04)', inputBorder: 'rgba(59,130,246,0.18)',
    navBg: 'rgba(7,12,24,0.94)', sidebarBg: 'linear-gradient(180deg,#0b1530 0%,#080f20 100%)',
    text: '#dde6f7', textMuted: '#5a6a8e', textAccent: '#60a5fa',
    splashBg: '#070c18',
  },
  light: {
    bg: '#edf1fc',
    panelLeft: 'linear-gradient(165deg,#dde6ff 0%,#e8eeff 50%,#eef3ff 100%)',
    panelRight: 'linear-gradient(145deg,#f4f6ff 0%,#eef2ff 60%,#f0f4ff 100%)',
    shimmer: 'linear-gradient(120deg,rgba(99,102,241,0.07) 0%,rgba(139,92,246,0.1) 50%,rgba(59,130,246,0.07) 100%)',
    card: 'rgba(255,255,255,0.85)', cardBorder: 'rgba(99,102,241,0.18)',
    inputBg: 'rgba(255,255,255,0.75)', inputBorder: 'rgba(99,102,241,0.22)',
    navBg: 'rgba(238,242,255,0.96)', sidebarBg: 'linear-gradient(180deg,#dce6ff 0%,#e8eeff 100%)',
    text: '#1a2540', textMuted: '#7080a8', textAccent: '#2563eb',
    splashBg: '#070c18', // splash always dark
  },
};

// ─── Theme toggle button (reusable, always top-right) ─────────────────────────
function ThemeBtn({ theme, setTheme }: { theme: string; setTheme: (t: 'dark'|'light') => void }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-2xl border-2 transition-all"
      style={{
        borderColor: theme === 'dark' ? 'rgba(59,130,246,0.25)' : 'rgba(99,102,241,0.2)',
        background:  theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
      }}
    >
      {theme === 'dark'
        ? <Icons.Sun  size={16} className="text-yellow-400" />
        : <Icons.Moon size={16} style={{ color: '#7080a8' }} />}
    </button>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────
// FIX #1: одна надпись, без дублирования, без синих точек
// Desktop: большая (5.5em), Mobile: компактная (scale 1.5)
// Tagline под надписью — из переводов
function SplashScreen({ isFadingOut, tagline }: { isFadingOut: boolean; tagline: string }) {
  const chars = "COVCHEG-AI".split("");
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden z-50"
      style={{ background: '#070c18', transition: 'opacity 1s ease-in-out', opacity: isFadingOut ? 0 : 1 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 45% at 50% 48%,rgba(37,99,235,0.14) 0%,transparent 70%)' }} />

      {/* Единый лоадер — размер адаптивный через clamp, без дублирования */}
      <div className="splash-wrap">
        {chars.map((c, i) => <span key={i} className="splash-letter" style={{ animationDelay: `${(i+1)*0.1}s` }}>{c}</span>)}
        <div className="splash-fx" />
      </div>

      {/* Tagline только на десктопе */}
      <p className="hidden md:block splash-tagline">{tagline}</p>

      <style jsx>{`
        .splash-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Poppins", sans-serif;
          font-size: clamp(2rem, 7vw, 5.5rem);
          font-weight: 800;
          color: #fff;
          height: clamp(80px, 14vw, 200px);
        }
        .splash-fx {
          position: absolute; inset: 0; z-index: 5;
          mask: repeating-linear-gradient(90deg, transparent 0, transparent 5px, black 7px, black 8px);
        }
        .splash-fx::after {
          content: "";
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, #0ff 0%, transparent 45%),
            radial-gradient(circle at 45% 55%, #0f0 0%, transparent 45%),
            radial-gradient(circle at 55% 45%, #00f 0%, transparent 45%);
          mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%);
          animation: trs 2s infinite alternate, opc 4s infinite;
          animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
        }
        .splash-letter {
          display: inline-block; opacity: 0; z-index: 2;
          animation: letA 4s infinite linear;
        }
        .splash-tagline {
          margin-top: 2.5rem;
          color: #2d4a78;
          font-size: 11px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          font-weight: 600;
          user-select: none;
        }
        @keyframes trs  { 0%{transform:translate(-55%)} 100%{transform:translate(55%)} }
        @keyframes opc  { 0%,100%{opacity:0} 15%{opacity:1} 65%{opacity:0} }
        @keyframes letA { 0%{opacity:0} 25%{opacity:1;text-shadow:0 25px 25px #ffd700,0 -25px 25px #0057b7} 50%{opacity:.5} 100%{opacity:0} }
      `}</style>
    </div>
  );
}

// ─── Desktop Left Panel ───────────────────────────────────────────────────────
function LeftPanel({ th, icon, title, desc }: { th: any; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden shrink-0"
      style={{ background: th.panelLeft }}>
      <div className="absolute inset-0" style={{ background: th.shimmer }} />
      <div className="absolute w-72 h-72 rounded-full border opacity-[0.07]"
        style={{ borderColor: th.textAccent, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-5 opacity-80">{icon}</div>
        <h2 className="text-3xl font-black italic uppercase mb-3" style={{ color: th.textAccent }}>{title}</h2>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: th.textMuted }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]               = useState('splash');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [theme, setTheme]             = useState<'dark'|'light'>('dark');
  const [scope, setScope]             = useState('city');
  const [lang, setLang]               = useState('en');
  const [tgUser, setTgUser]           = useState<TelegramUser|null>(null);
  const [accountType, setAccountType] = useState<AccountType>('consumer');
  const [isLoading, setIsLoading]     = useState(false);
  const [radius, setRadius]           = useState(25);
  const [userData, setUserData]       = useState({ city:'', country:'', countryCode:'', lat:null as number|null, lon:null as number|null });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions]   = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'country'|'city'|null>(null);
  const [profile, setProfile]           = useState<any>(null);
  const [activeNav, setActiveNav]       = useState('catalog');

  const coordsRef        = useRef<{lat:number;lon:number}|null>(null);
  const langRef          = useRef<string>('en');
  const tgWidgetInjected = useRef(false);

  const t  = translations[lang] || translations.en;
  const th = THEMES[theme];

  // ── FIX #6: fade transition без белого мигания ─────────────────────────
  const transitionTo = useCallback((nextStep: string, delay = 0) => {
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setIsFadingOut(false); setStep(nextStep); }, 1000);
    }, delay);
  }, []);

  // ── PocketBase ─────────────────────────────────────────────────────────
  const signInTelegramExisting = useCallback(async (tgId: number) => {
    try { await pb.collection('users').authWithPassword(`tg_${tgId}@covcheg.app`, `tg_${tgId}_covcheg_${tgId}`); return true; }
    catch { return false; }
  }, []);

  const loginOrRegisterTelegram = useCallback(async (tgId: number, name: string) => {
    const email = `tg_${tgId}@covcheg.app`, password = `tg_${tgId}_covcheg_${tgId}`;
    try { await pb.collection('users').authWithPassword(email, password); }
    catch {
      try { await pb.collection('users').create({ email, password, passwordConfirm: password, name }); await pb.collection('users').authWithPassword(email, password); }
      catch (e) { console.error('Register error:', e); return; }
    }
    try {
      const userId = pb.authStore.model?.id; if (!userId) return;
      const profiles = await pb.collection('profiles').getList(1,1,{filter:`user = "${userId}"`});
      if (profiles.items.length > 0) {
        setProfile(profiles.items[0]);
        setUserData({ city: profiles.items[0].city||'', country: profiles.items[0].country||'', countryCode: profiles.items[0].country_code||'', lat: profiles.items[0].lat||null, lon: profiles.items[0].lon||null });
        transitionTo('main');
      } else { transitionTo('location'); }
    } catch (e) { console.error('Profile error:', e); transitionTo('location'); }
  }, [transitionTo]);

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sysLang = navigator.language.split('-')[0];
      const initialLang = languages.some(l => l.code === sysLang) ? sysLang : 'en';
      setLang(initialLang); langRef.current = initialLang;

      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
        tg.ready();
        tg.expand();
        // Full screen: set colors to match dark theme so header bar blends in
        if (tg.setHeaderColor) tg.setHeaderColor('#070c18');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#070c18');
        if (tg.requestFullscreen) tg.requestFullscreen();
        const ok = await signInTelegramExisting(u.id);
        if (ok) {
          try {
            const userId = pb.authStore.model?.id;
            if (userId) {
              const profiles = await pb.collection('profiles').getList(1,1,{filter:`user = "${userId}"`});
              if (profiles.items.length > 0) {
                const p = profiles.items[0]; setProfile(p);
                setLang(p.lang||initialLang); langRef.current = p.lang||initialLang;
                setTheme(p.theme||'dark');
                setUserData({ city:p.city||'', country:p.country||'', countryCode:p.country_code||'', lat:p.lat||null, lon:p.lon||null });
                if (p.lat&&p.lon) coordsRef.current = { lat:p.lat, lon:p.lon };
                transitionTo('main', 500); return;
              }
            }
          } catch (e) { console.error(e); }
        }
        transitionTo('auth', 500); return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const tgAuthParam = urlParams.get('tg_auth');
      if (tgAuthParam) {
        try {
          const user = JSON.parse(decodeURIComponent(tgAuthParam));
          setTgUser({ id: parseInt(user.id), first_name: user.first_name||'', last_name: user.last_name, username: user.username, photo_url: user.photo_url });
          window.history.replaceState({},'','/');
          await loginOrRegisterTelegram(parseInt(user.id), `${user.first_name} ${user.last_name||''}`.trim());
          return;
        } catch (e) { console.error('tg_auth parse error:', e); }
      }

      try {
        if (pb.authStore.isValid) {
          const userId = pb.authStore.model?.id;
          if (userId) {
            const profiles = await pb.collection('profiles').getList(1,1,{filter:`user = "${userId}"`});
            if (profiles.items.length > 0) {
              const p = profiles.items[0]; setProfile(p);
              setLang(p.lang||initialLang); langRef.current = p.lang||initialLang;
              setTheme(p.theme||'dark');
              setUserData({ city:p.city||'', country:p.country||'', countryCode:p.country_code||'', lat:p.lat||null, lon:p.lon||null });
              if (p.lat&&p.lon) coordsRef.current = { lat:p.lat, lon:p.lon };
              transitionTo('main', 2000); return;
            }
          }
        }
      } catch (e) { console.error(e); }

      transitionTo('auth', 3000);
    };
    init();
  }, [loginOrRegisterTelegram, signInTelegramExisting, transitionTo]);

  // ── GPS ────────────────────────────────────────────────────────────────
  const fetchLocationByCoords = useCallback(async (lat:number, lon:number, language:string) => {
    setIsGpsLoading(true);
    try {
      const isoLang = LANG_MAP[language]||language;
      const acceptLang = language==='en'?'en':`${isoLang},en`;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${acceptLang}&addressdetails=1&zoom=10`);
      const data = await res.json();
      if (data?.address) {
        setUserData(prev => ({...prev, city:data.address.city||data.address.town||data.address.village||data.address.municipality||'', country:data.address.country||'', countryCode:data.address.country_code?.toUpperCase()||'', lat, lon}));
        coordsRef.current = { lat, lon };
      }
    } catch (e) { console.error(e); } finally { setIsGpsLoading(false); }
  }, []);

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchLocationByCoords(pos.coords.latitude, pos.coords.longitude, langRef.current),
      () => setIsGpsLoading(false),
      { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
    );
  }, [fetchLocationByCoords]);

  useEffect(() => { if (step==='location') requestGPS(); }, [step, requestGPS]);

  const handleLangChange = useCallback((code:string) => {
    setLang(code); langRef.current = code;
    if (coordsRef.current) fetchLocationByCoords(coordsRef.current.lat, coordsRef.current.lon, code);
  }, [fetchLocationByCoords]);

  const fetchLoc = async (q:string, type:'country'|'city') => {
    if (q.length<2) { setSuggestions([]); return; }
    const isoLang = LANG_MAP[langRef.current]||langRef.current;
    const acceptLang = langRef.current==='en'?'en':`${isoLang},en`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${acceptLang}&limit=10&addressdetails=1`;
    if (type==='country') url += '&featuretype=country';
    try { const res = await fetch(url); setSuggestions(await res.json()); } catch (e) { console.error(e); }
  };

  // ── FIX #2/#5: Telegram Widget — оригинальная логика из doc19 ──────────
  const injectTelegramWidget = useCallback((containerId:string) => {
    if (tgWidgetInjected.current) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    tgWidgetInjected.current = true;

    (window as any).onTelegramAuth = async (user:any) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/telegram', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(user) });
        const result = await res.json();
        if (!result.ok) throw new Error(result.error||'Auth failed');
        await pb.collection('users').authWithPassword(result.email, result.password);
        setTgUser({ id:user.id, first_name:user.first_name, last_name:user.last_name, username:user.username, photo_url:user.photo_url });
        const userId = pb.authStore.model?.id;
        if (userId) {
          const profiles = await pb.collection('profiles').getList(1,1,{filter:`user = "${userId}"`});
          if (profiles.items.length>0) { setProfile(profiles.items[0]); transitionTo('main'); }
          else { transitionTo('location'); }
        } else { transitionTo('location'); }
      } catch (e) { console.error('Telegram widget auth error:', e); setIsLoading(false); }
    };

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
    if (!botUsername) { console.error('NEXT_PUBLIC_TELEGRAM_BOT_NAME is not set'); return; }

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

  useEffect(() => {
    if (step==='auth') {
      tgWidgetInjected.current = false;
      setTimeout(() => injectTelegramWidget('tg-widget-container'), 200);
    }
  }, [step, injectTelegramWidget]);

  // ── Save profile ───────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = pb.authStore.isValid ? pb.authStore.model?.id : null;
      if (!userId) { transitionTo('main'); setIsLoading(false); return; }
      const profileData = { user:userId, account_type:accountType, lang:langRef.current, theme, city:userData.city, country:userData.country, country_code:userData.countryCode, lat:userData.lat||0, lon:userData.lon||0, telegram_id:tgUser?String(tgUser.id):'', search_radius:radius };
      if (profile?.id) { await pb.collection('profiles').update(profile.id, profileData); }
      else { const p = await pb.collection('profiles').create(profileData); setProfile(p); }
      transitionTo('main');
    } catch (e) { console.error(e); transitionTo('main'); }
    finally { setIsLoading(false); }
  }, [accountType, theme, userData, tgUser, profile, radius, transitionTo]);

  const dk = (dark:string, light:string) => theme==='dark' ? dark : light;
  // FIX #6: фон перехода соответствует теме (не белый)
  const pageStyle: React.CSSProperties = {
    transition: 'opacity 1s ease-in-out',
    opacity: isFadingOut ? 0 : 1,
    background: th.bg,
  };

  const navItems = [
    { key:'catalog',       icon:Icons.LayoutGrid,    label:t.catalog },
    { key:'search',        icon:Icons.Search,        label:t.search },
    { key:'chats',         icon:Icons.MessageCircle, label:t.chats },
    { key:'notifications', icon:Icons.Bell,          label:t.notifications },
    { key:'settings',      icon:Icons.Settings,      label:t.settings },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SPLASH
  // ══════════════════════════════════════════════════════════════════════════
  if (step==='splash') return <SplashScreen isFadingOut={isFadingOut} tagline={t.tagline} />;

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // FIX #2: Telegram Widget кнопка присутствует, работает в TWA и браузере
  // FIX #2/#4 (desktop): левая панель 50%, правая 50%, одинаковая ширина
  // FIX #6: ThemeBtn вверху справа
  // ══════════════════════════════════════════════════════════════════════════
  if (step==='auth') return (
    <div style={pageStyle} className="min-h-screen flex flex-col">

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <LeftPanel th={th}
          icon={<Icons.Bot size={72} strokeWidth={1} style={{color:th.textAccent}}/>}
          title="COVCHEG.UA" desc={t.tagline}
        />
        {/* Right — language + auth card */}
        <div className="w-1/2 flex flex-col items-center justify-start pt-6 px-16 pb-16 relative" style={{background:th.panelRight}}>
          {/* FIX #6: theme toggle top-right */}
          <div className="absolute top-4 right-6">
            <ThemeBtn theme={theme} setTheme={setTheme} />
          </div>

          <div className="w-full max-w-sm mt-10 mb-6">
            <div className="grid grid-cols-6 gap-2">
              {languages.map(l => (
                <button key={l.code} onClick={() => handleLangChange(l.code)}
                  className="p-2 rounded-xl border-2 flex flex-col items-center transition-all"
                  style={{borderColor:lang===l.code?'#3b82f6':th.cardBorder, background:lang===l.code?'rgba(59,130,246,0.12)':th.inputBg}}>
                  <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt="" />
                  <span className="text-[8px] font-black" style={{color:th.text}}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[2rem] p-8 border" style={{background:th.card, borderColor:th.cardBorder}}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
                <Icons.Bot size={32} className="text-white"/>
              </div>
              <h2 className="text-2xl font-black italic uppercase" style={{color:th.textAccent}}>{t.auth}</h2>
              <p className="text-xs mt-1" style={{color:th.textMuted}}>COVCHEG.UA</p>
            </div>
            {/* Hidden Telegram widget */}
            <div id="tg-widget-container" className="hidden" aria-hidden="true" />

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const tg = (window as any).Telegram?.WebApp;
                  if (tg?.initDataUnsafe?.user) {
                    const u = tg.initDataUnsafe.user;
                    setIsLoading(true);
                    fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url, auth_date: Math.floor(Date.now() / 1000), hash: '' }) })
                      .then(r => r.json()).then(async result => {
                        if (!result.ok) throw new Error(result.error);
                        await pb.collection('users').authWithPassword(result.email, result.password);
                        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
                        const uid = pb.authStore.model?.id;
                        if (uid) { const ps = await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`}); if (ps.items.length>0) { setProfile(ps.items[0]); transitionTo('main'); } else transitionTo('location'); } else transitionTo('location');
                      }).catch(e => { console.error(e); setIsLoading(false); });
                    return;
                  }
                  // Browser — trigger hidden widget or OAuth fallback
                  const container = document.getElementById('tg-widget-container');
                  const iframe = container?.querySelector('iframe');
                  if (iframe) { (iframe as any).contentWindow?.document.querySelector('button')?.click(); return; }
                  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
                  const origin = window.location.origin;
                  if (botId) window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&embed=0&request_access=write&return_to=${encodeURIComponent(origin + '/api/auth/telegram')}`;
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] font-black uppercase text-sm transition-all active:scale-95"
                style={{ background: '#2AABEE', color: '#fff', boxShadow: '0 4px 20px rgba(42,171,238,0.35)' }}
              >
                {isLoading ? <Icons.Loader size={20} className="animate-spin shrink-0" /> : <Icons.Send size={20} className="shrink-0" />}
                <span>{t.telegramBtn}</span>
              </button>
              <button onClick={() => transitionTo('location')}
                className="w-full text-center text-xs font-black uppercase py-3 rounded-2xl hover:opacity-60 transition-opacity"
                style={{color:th.textMuted}}>{t.skip}</button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex flex-col md:hidden min-h-screen" style={{background:th.bg}}>
        <div className="flex items-center justify-between p-4 pt-10">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
          <ThemeBtn theme={theme} setTheme={setTheme} />
        </div>
        <div className="px-4 mb-6">
          <div className="grid grid-cols-6 gap-2">
            {languages.map(l => (
              <button key={l.code} onClick={() => handleLangChange(l.code)}
                className="p-2 rounded-xl border-2 flex flex-col items-center transition-all"
                style={{borderColor:lang===l.code?'#3b82f6':th.cardBorder, background:lang===l.code?'rgba(59,130,246,0.12)':th.inputBg}}>
                <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt="" />
                <span className="text-[8px] font-black" style={{color:th.text}}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm rounded-[2rem] p-8 border" style={{background:th.card, borderColor:th.cardBorder}}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
                <Icons.Bot size={32} className="text-white"/>
              </div>
              <h2 className="text-2xl font-black italic uppercase" style={{color:th.textAccent}}>{t.auth}</h2>
              <p className="text-xs mt-1" style={{color:th.textMuted}}>COVCHEG.UA</p>
            </div>
            {/* Hidden Telegram widget */}
            <div id="tg-widget-container" className="hidden" aria-hidden="true" />

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const tg = (window as any).Telegram?.WebApp;
                  if (tg?.initDataUnsafe?.user) {
                    const u = tg.initDataUnsafe.user;
                    setIsLoading(true);
                    fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url, auth_date: Math.floor(Date.now() / 1000), hash: '' }) })
                      .then(r => r.json()).then(async result => {
                        if (!result.ok) throw new Error(result.error);
                        await pb.collection('users').authWithPassword(result.email, result.password);
                        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
                        const uid = pb.authStore.model?.id;
                        if (uid) { const ps = await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`}); if (ps.items.length>0) { setProfile(ps.items[0]); transitionTo('main'); } else transitionTo('location'); } else transitionTo('location');
                      }).catch(e => { console.error(e); setIsLoading(false); });
                    return;
                  }
                  // Browser — trigger hidden widget or OAuth fallback
                  const container = document.getElementById('tg-widget-container');
                  const iframe = container?.querySelector('iframe');
                  if (iframe) { (iframe as any).contentWindow?.document.querySelector('button')?.click(); return; }
                  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
                  const origin = window.location.origin;
                  if (botId) window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&embed=0&request_access=write&return_to=${encodeURIComponent(origin + '/api/auth/telegram')}`;
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] font-black uppercase text-sm transition-all active:scale-95"
                style={{ background: '#2AABEE', color: '#fff', boxShadow: '0 4px 20px rgba(42,171,238,0.35)' }}
              >
                {isLoading ? <Icons.Loader size={20} className="animate-spin shrink-0" /> : <Icons.Send size={20} className="shrink-0" />}
                <span>{t.telegramBtn}</span>
              </button>
              <button onClick={() => transitionTo('location')}
                className="w-full text-center text-xs font-black uppercase py-3 rounded-2xl hover:opacity-60 transition-opacity"
                style={{color:th.textMuted}}>{t.skip}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // LOCATION — FIX #3: 50/50, ThemeBtn top-right, back button
  // ══════════════════════════════════════════════════════════════════════════
  if (step==='location') return (
    <div style={pageStyle} className="min-h-screen flex flex-col">

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <LeftPanel th={th}
          icon={<Icons.MapPin size={72} strokeWidth={1} style={{color:th.textAccent}}/>}
          title={t.loc} desc={t.locDesc}
        />
        <div className="w-1/2 flex flex-col justify-center p-16 relative" style={{background:th.panelRight}}>
          <div className="absolute top-4 right-6">
            <ThemeBtn theme={theme} setTheme={setTheme} />
          </div>
          <button onClick={() => transitionTo('auth')}
            className="flex items-center gap-1 text-xs font-black uppercase mb-8 hover:opacity-60 transition-opacity w-fit"
            style={{color:th.textAccent}}>
            <Icons.ChevronLeft size={16}/>{t.back}
          </button>
          <LocationForm t={t} theme={theme} th={th} userData={userData} setUserData={setUserData} coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} isGpsLoading={isGpsLoading} fetchLoc={fetchLoc} onNext={() => transitionTo('account_type')} />
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex flex-col md:hidden p-6" style={{background:th.bg}}>
        <div className="flex items-center justify-between mt-10 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => transitionTo('auth')}
              className="p-2 rounded-xl" style={{background:th.inputBg, color:th.textAccent}}>
              <Icons.ChevronLeft size={18}/>
            </button>
            <h2 className="text-4xl font-black italic uppercase" style={{color:th.textAccent}}>{t.loc}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={requestGPS}
              className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${isGpsLoading?'animate-pulse':''}`}
              style={{background:th.inputBg, color:th.textAccent, border:`1px solid ${th.cardBorder}`}}>
              <Icons.Navigation size={14}/>{isGpsLoading?'...':'GPS'}
            </button>
            <ThemeBtn theme={theme} setTheme={setTheme} />
          </div>
        </div>
        <LocationForm t={t} theme={theme} th={th} userData={userData} setUserData={setUserData} coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} isGpsLoading={isGpsLoading} fetchLoc={fetchLoc} onNext={() => transitionTo('account_type')} />
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ACCOUNT TYPE — FIX #4: 4 типа аккаунта, 50/50, переводы, ThemeBtn
  // ══════════════════════════════════════════════════════════════════════════
  if (step==='account_type') return (
    <div style={pageStyle} className="min-h-screen flex">

      {/* DESKTOP */}
      <div className="hidden md:flex w-full">
        <LeftPanel th={th}
          icon={<Icons.Users size={72} strokeWidth={1} style={{color:th.textAccent}}/>}
          title={t.accountType} desc={t.accountTypeDesc}
        />
        <div className="w-1/2 flex flex-col justify-center p-16 relative" style={{background:th.panelRight}}>
          <div className="absolute top-4 right-6">
            <ThemeBtn theme={theme} setTheme={setTheme} />
          </div>
          <button onClick={() => transitionTo('location')}
            className="flex items-center gap-1 text-xs font-black uppercase mb-8 hover:opacity-60 transition-opacity w-fit"
            style={{color:th.textAccent}}>
            <Icons.ChevronLeft size={16}/>{t.back}
          </button>
          <div className="w-full max-w-md space-y-3">
            {ACCOUNT_TYPES.map(opt => (
              <button key={opt.key} onClick={() => setAccountType(opt.key)}
                className="w-full p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-[0.98]"
                style={{borderColor:accountType===opt.key?'#3b82f6':th.cardBorder, background:accountType===opt.key?'rgba(59,130,246,0.1)':th.card}}>
                <div className={`p-3.5 rounded-2xl shrink-0 ${accountType===opt.key?opt.color:'bg-slate-700/60'}`}>
                  <opt.icon size={26} className="text-white"/>
                </div>
                <div className="text-left flex-1">
                  <div className="font-black text-base uppercase" style={{color:th.text}}>{t[opt.key]}</div>
                  <div className="text-xs mt-0.5" style={{color:th.textMuted}}>{t[`${opt.key}Desc`]}</div>
                </div>
                {accountType===opt.key && <Icons.CheckCircle size={22} className="text-blue-500 shrink-0"/>}
              </button>
            ))}
            <button onClick={saveProfile} disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all mt-2">
              {isLoading?<Icons.Loader size={22} className="animate-spin"/>:<Icons.CheckCircle size={22}/>}
              {isLoading?'...':t.next}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex md:hidden flex-col w-full p-6" style={{background:th.bg, minHeight:'100vh'}}>
        <div className="flex items-center justify-between mt-10 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => transitionTo('location')}
              className="p-2 rounded-xl" style={{background:th.inputBg, color:th.textAccent}}>
              <Icons.ChevronLeft size={18}/>
            </button>
            <h2 className="text-3xl font-black italic uppercase" style={{color:th.textAccent}}>{t.accountType}</h2>
          </div>
          <ThemeBtn theme={theme} setTheme={setTheme} />
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {ACCOUNT_TYPES.map(opt => (
            <button key={opt.key} onClick={() => setAccountType(opt.key)}
              className="w-full p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-95"
              style={{borderColor:accountType===opt.key?'#3b82f6':th.cardBorder, background:accountType===opt.key?'rgba(59,130,246,0.1)':th.card}}>
              <div className={`p-3.5 rounded-2xl shrink-0 ${accountType===opt.key?opt.color:'bg-slate-700/60'}`}>
                <opt.icon size={26} className="text-white"/>
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-base uppercase" style={{color:th.text}}>{t[opt.key]}</div>
                <div className="text-xs mt-0.5" style={{color:th.textMuted}}>{t[`${opt.key}Desc`]}</div>
              </div>
              {accountType===opt.key && <Icons.CheckCircle size={22} className="text-blue-500 shrink-0"/>}
            </button>
          ))}
        </div>
        <div className="pb-6 pt-4">
          <button onClick={saveProfile} disabled={isLoading}
            className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {isLoading?<Icons.Loader size={22} className="animate-spin"/>:<Icons.CheckCircle size={22}/>}
            {isLoading?'...':t.next}
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN — desktop sidebar + mobile nav (оригинал), ThemeBtn top-right везде
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={pageStyle} className="min-h-screen">

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <aside className="w-60 flex flex-col py-8 px-3 border-r shrink-0"
          style={{background:th.sidebarBg, borderColor:th.cardBorder}}>
          <div className="px-4 mb-8">
            <h1 className="text-xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <p className="text-[9px] font-semibold tracking-widest mt-0.5" style={{color:th.textMuted}}>AI HELPER</p>
          </div>
          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map(item => (
              <button key={item.key} onClick={() => setActiveNav(item.key)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black uppercase transition-all text-left"
                style={{background:activeNav===item.key?'rgba(59,130,246,0.14)':'transparent', color:activeNav===item.key?th.textAccent:th.textMuted, borderLeft:activeNav===item.key?'3px solid #3b82f6':'3px solid transparent'}}>
                <item.icon size={17}/>{item.label}
              </button>
            ))}
          </nav>
          <div className="px-2 space-y-3">
            {tgUser ? (
              <div className="px-4 py-4 rounded-2xl border" style={{borderColor:th.cardBorder, background:th.card}}>
                <div className="flex items-center gap-3">
                  {tgUser.photo_url
                    ?<img src={tgUser.photo_url} className="w-9 h-9 rounded-full border-2 border-blue-600" alt=""/>
                    :<div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">{tgUser.first_name[0]}</div>}
                  <div>
                    <div className="text-xs font-black" style={{color:th.text}}>{tgUser.first_name} {tgUser.last_name||''}</div>
                    {tgUser.username&&<div className="text-[10px]" style={{color:th.textMuted}}>@{tgUser.username}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => transitionTo('auth')}
                className="w-full px-4 py-3 rounded-2xl text-xs font-black uppercase text-blue-400 border border-blue-900/40 hover:bg-blue-600/10 transition-all">
                {t.auth}
              </button>
            )}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-2xl font-black uppercase flex items-center justify-center gap-2 text-sm transition-all shadow-lg active:scale-95">
              <Icons.Plus size={16} strokeWidth={3}/>{t.postAd}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-4 px-8 py-4 border-b" style={{background:th.panelRight, borderColor:th.cardBorder}}>
            <div className="flex gap-1 p-1 rounded-2xl border" style={{background:th.inputBg, borderColor:th.cardBorder}}>
              {['city','country','world'].map(s => (
                <button key={s} onClick={() => setScope(s)}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all"
                  style={{background:scope===s?'#2563eb':'transparent', color:scope===s?'#fff':th.textMuted}}>
                  {s==='city'?t.cityBtn:s==='country'?t.countryBtn:t.worldBtn}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
              style={{background:'rgba(59,130,246,0.08)', borderColor:'rgba(59,130,246,0.2)'}}>
              <Icons.MapPin size={14} className="text-blue-400"/>
              <span className="text-[11px] font-black uppercase text-blue-400">{userData.city||t.selectCity}</span>
            </div>
            <div className="ml-auto"/>
            <ThemeBtn theme={theme} setTheme={setTheme} />
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl">
              {allCategories.map(cat => (
                <button key={cat.id}
                  className="flex flex-col items-center justify-center rounded-[2rem] p-6 border transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{background:th.card, borderColor:th.cardBorder}}>
                  <div className={`${cat.color} mb-3 rounded-2xl p-4 text-white shadow-lg`}><cat.icon size={30}/></div>
                  <span className="text-[11px] font-black uppercase text-center leading-none tracking-tighter" style={{color:th.text}}>{t[cat.nameKey]||cat.nameKey}</span>
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE — оригинальная вёрстка из doc19 */}
      <div className="flex flex-col md:hidden pb-32" style={{background:th.bg}}>
        <header className="p-6 rounded-b-[2.5rem] shadow-md border-b" style={{background:th.panelRight, borderColor:th.cardBorder}}>
          <div className="flex items-center justify-between mb-4 pt-10">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <div className="flex items-center gap-2">
              {tgUser && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
                  style={{background:'rgba(59,130,246,0.08)', borderColor:'rgba(59,130,246,0.2)'}}>
                  {tgUser.photo_url&&<img src={tgUser.photo_url} className="w-6 h-6 rounded-full" alt=""/>}
                  <span className="text-[10px] font-black text-blue-400">{tgUser.first_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
                style={{background:'rgba(59,130,246,0.08)', borderColor:'rgba(59,130,246,0.2)'}}>
                <Icons.MapPin size={12} className="text-blue-400"/>
                <span className="text-[10px] font-black uppercase text-blue-400">{userData.city||t.selectCity}</span>
              </div>
              <ThemeBtn theme={theme} setTheme={setTheme} />
            </div>
          </div>
          <div className="p-1.5 rounded-2xl flex" style={{background:th.inputBg}}>
            {['city','country','world'].map(s => (
              <button key={s} onClick={() => setScope(s)}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                style={{background:scope===s?'#2563eb':'transparent', color:scope===s?'#fff':th.textMuted}}>
                {s==='city'?t.cityBtn:s==='country'?t.countryBtn:t.worldBtn}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 grid grid-cols-3 gap-3">
          {allCategories.map(cat => (
            <button key={cat.id}
              className="flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all border"
              style={{background:th.card, borderColor:th.cardBorder}}>
              <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={26}/></div>
              <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter" style={{color:th.text}}>{t[cat.nameKey]||cat.nameKey}</span>
            </button>
          ))}
        </main>

        <nav className="fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md border"
          style={{background:th.navBg, borderColor:th.cardBorder}}>
          <Icons.LayoutGrid style={{color:th.textAccent}} size={22}/>
          <Icons.Search style={{color:th.textMuted}} size={22}/>
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] active:scale-95 cursor-pointer"
            style={{borderColor:th.bg}}>
            <Icons.Plus size={32} strokeWidth={3}/>
          </div>
          <Icons.MessageCircle style={{color:th.textMuted}} size={22}/>
          <Icons.Bell style={{color:th.textMuted}} size={22}/>
        </nav>
      </div>
    </div>
  );
}

// ─── LocationForm — оригинал из doc19, + th для стилей ───────────────────────
function LocationForm({ t, theme, th, userData, setUserData, coordsRef, suggestions, setSuggestions, activeSearch, setActiveSearch, radius, setRadius, requestGPS, isGpsLoading, fetchLoc, onNext }: any) {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="hidden md:flex justify-end">
        <button onClick={requestGPS}
          className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl border ${isGpsLoading?'animate-pulse':''}`}
          style={{background:th.inputBg, borderColor:th.cardBorder, color:th.textAccent}}>
          <Icons.Navigation size={14}/>{isGpsLoading?'...':'GPS'}
        </button>
      </div>

      {/* Country */}
      <div className="relative">
        <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{color:th.textMuted}}/>
        <input type="text" placeholder={t.country} value={userData.country}
          onFocus={() => setActiveSearch('country')}
          onChange={e => { setUserData({...userData, country:e.target.value, countryCode:'', lat:null, lon:null}); coordsRef.current=null; fetchLoc(e.target.value,'country'); }}
          className="w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold"
          style={{background:th.inputBg, borderColor:th.inputBorder, color:th.text}}/>
        {activeSearch==='country' && suggestions.length>0 && (
          <div className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-2xl border max-h-56 overflow-y-auto"
            style={{background:'#0d1525', borderColor:th.cardBorder}}>
            {suggestions.map((item:any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat=parseFloat(item.lat),lon=parseFloat(item.lon); coordsRef.current={lat,lon}; setUserData({...userData,country:item.display_name.split(',')[0],countryCode:item.address?.country_code?.toUpperCase()||'',lat,lon}); setSuggestions([]); setActiveSearch(null); }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3 text-white">
                <img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3" alt=""/>{item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* City */}
      <div className="relative">
        <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{color:th.textMuted}}/>
        <input type="text" placeholder={t.city} value={userData.city}
          onFocus={() => setActiveSearch('city')}
          onChange={e => { setUserData({...userData, city:e.target.value, lat:null, lon:null}); fetchLoc(e.target.value,'city'); }}
          className="w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold"
          style={{background:th.inputBg, borderColor:th.inputBorder, color:th.text}}/>
        {activeSearch==='city' && suggestions.length>0 && (
          <div className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-2xl border max-h-56 overflow-y-auto"
            style={{background:'#0d1525', borderColor:th.cardBorder}}>
            {suggestions.map((item:any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat=parseFloat(item.lat),lon=parseFloat(item.lon); coordsRef.current={lat,lon}; setUserData({...userData,city:item.display_name.split(',')[0],lat,lon}); setSuggestions([]); setActiveSearch(null); }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 text-white">
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Radius */}
      <div className="p-5 rounded-2xl border-2" style={{background:th.inputBg, borderColor:th.inputBorder}}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase text-blue-500">{t.radius}</span>
          <span className="text-lg font-black text-blue-500">+{radius} km</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map(r => (
            <button key={r} onClick={() => setRadius(r)}
              className="px-3 py-2 rounded-xl text-[10px] font-black transition-all border"
              style={{background:radius===r?'#2563eb':th.inputBg, color:radius===r?'#fff':th.textMuted, borderColor:radius===r?'#3b82f6':th.cardBorder}}>
              +{r}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
        {t.next}<Icons.ChevronRight size={22}/>
      </button>
    </div>
  );
}
