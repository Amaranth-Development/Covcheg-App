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

// ─── Translations (все 12 языков, все ключи) ──────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  ua: { auth: 'Вхід', telegramBtn: 'Увійти через Telegram', skip: 'Пропустити', or: 'або', loc: 'Локація', locDesc: 'Вкажіть ваше місцезнаходження для персоналізованих результатів пошуку.', city: 'Місто', country: 'Країна', selectCity: 'Оберіть місто', next: 'Далі', back: 'Назад', accountType: 'Тип акаунту', accountTypeDesc: 'Оберіть як ви будете використовувати додаток. Це можна змінити у налаштуваннях.', consumer: 'Споживач', business: 'Бізнес', consumerDesc: 'Пошук послуг та товарів', businessDesc: 'Розміщення оголошень та послуг', radius: 'Радіус пошуку', taxi: 'ТАКСІ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСИ', rent: 'ОРЕНДА АВТО', realty: 'НЕРУХОМІСТЬ', market: 'OLX', services: 'ПОСЛУГИ', jobs: 'РОБОТА', business_cat: 'БІЗНЕС', ai: 'COVCHEG-AI', charity: 'ДОПОМОГА', emergency: 'SOS', cityBtn: 'Місто', countryBtn: 'Країна', worldBtn: 'Світ', catalog: 'Каталог', search: 'Пошук', chats: 'Чати', notifications: 'Сповіщення', postAd: 'Подати оголошення', settings: 'Налаштування', tagline: 'Перший AI-помічник для українців' },
  ru: { auth: 'Вход', telegramBtn: 'Войти через Telegram', skip: 'Пропустить', or: 'или', loc: 'Локация', locDesc: 'Укажите ваше местоположение для персонализированных результатов поиска.', city: 'Город', country: 'Страна', selectCity: 'Выберите город', next: 'Далее', back: 'Назад', accountType: 'Тип аккаунта', accountTypeDesc: 'Выберите как вы будете использовать приложение. Можно изменить в настройках.', consumer: 'Потребитель', business: 'Бизнес', consumerDesc: 'Поиск услуг и товаров', businessDesc: 'Размещение объявлений и услуг', radius: 'Радиус поиска', taxi: 'ТАКСИ', transfer: 'ТРАНСФЕР', bus: 'АВТОБУСЫ', rent: 'АРЕНДА АВТО', realty: 'НЕДВИЖИМОСТЬ', market: 'OLX', services: 'УСЛУГИ', jobs: 'РАБОТА', business_cat: 'БИЗНЕС', ai: 'COVCHEG-AI', charity: 'ПОМОЩЬ', emergency: 'SOS', cityBtn: 'Город', countryBtn: 'Страна', worldBtn: 'Мир', catalog: 'Каталог', search: 'Поиск', chats: 'Чаты', notifications: 'Уведомления', postAd: 'Подать объявление', settings: 'Настройки', tagline: 'Первый AI-помощник для украинцев' },
  en: { auth: 'Sign In', telegramBtn: 'Sign in with Telegram', skip: 'Skip', or: 'or', loc: 'Location', locDesc: 'Set your location to get personalized search results near you.', city: 'City', country: 'Country', selectCity: 'Select City', next: 'Next', back: 'Back', accountType: 'Account Type', accountTypeDesc: 'Choose how you will use the app. You can change this in settings.', consumer: 'Consumer', business: 'Business', consumerDesc: 'Search for services and goods', businessDesc: 'Post ads and services', radius: 'Search radius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS-UA', rent: 'RENT CAR', realty: 'REALTY', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CHARITY', emergency: 'SOS', cityBtn: 'City', countryBtn: 'Country', worldBtn: 'World', catalog: 'Catalog', search: 'Search', chats: 'Chats', notifications: 'Alerts', postAd: 'Post Ad', settings: 'Settings', tagline: 'First AI Helper for Ukrainians' },
  de: { auth: 'Anmelden', telegramBtn: 'Mit Telegram anmelden', skip: 'Überspringen', or: 'oder', loc: 'Standort', locDesc: 'Geben Sie Ihren Standort für personalisierte Suchergebnisse an.', city: 'Stadt', country: 'Land', selectCity: 'Stadt wählen', next: 'Weiter', back: 'Zurück', accountType: 'Kontotyp', accountTypeDesc: 'Wählen Sie, wie Sie die App verwenden möchten.', consumer: 'Verbraucher', business: 'Geschäft', consumerDesc: 'Dienste suchen', businessDesc: 'Anzeigen posten', radius: 'Suchradius', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUSSE', rent: 'AUTO MIETEN', realty: 'IMMOBILIEN', market: 'OLX', services: 'DIENSTE', jobs: 'JOBS', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'HILFE', emergency: 'SOS', cityBtn: 'Stadt', countryBtn: 'Land', worldBtn: 'Welt', catalog: 'Katalog', search: 'Suche', chats: 'Chats', notifications: 'Benachricht.', postAd: 'Anzeige aufgeben', settings: 'Einstellungen', tagline: 'Erster KI-Helfer für Ukrainer' },
  fr: { auth: 'Connexion', telegramBtn: 'Connexion Telegram', skip: 'Passer', or: 'ou', loc: 'Lieu', locDesc: 'Indiquez votre emplacement pour des résultats de recherche personnalisés.', city: 'Ville', country: 'Pays', selectCity: 'Choisir ville', next: 'Suivant', back: 'Retour', accountType: 'Type compte', accountTypeDesc: "Choisissez comment utiliser l'application.", consumer: 'Consommateur', business: 'Entreprise', consumerDesc: 'Rechercher services', businessDesc: 'Publier annonces', radius: 'Rayon', taxi: 'TAXI', transfer: 'TRANSFERT', bus: 'BUS', rent: 'LOCATION', realty: 'IMMOBILIER', market: 'OLX', services: 'SERVICES', jobs: 'JOBS', business_cat: 'AFFAIRES', ai: 'COVCHEG-AI', charity: 'CHARITÉ', emergency: 'SOS', cityBtn: 'Ville', countryBtn: 'Pays', worldBtn: 'Monde', catalog: 'Catalogue', search: 'Recherche', chats: 'Chats', notifications: 'Alertes', postAd: 'Publier annonce', settings: 'Paramètres', tagline: 'Premier assistant IA pour Ukrainiens' },
  es: { auth: 'Entrar', telegramBtn: 'Entrar con Telegram', skip: 'Saltar', or: 'o', loc: 'Ubicación', locDesc: 'Indica tu ubicación para obtener resultados personalizados.', city: 'Ciudad', country: 'País', selectCity: 'Ciudad', next: 'Siguiente', back: 'Volver', accountType: 'Tipo cuenta', accountTypeDesc: 'Elige cómo usarás la aplicación.', consumer: 'Consumidor', business: 'Negocio', consumerDesc: 'Buscar servicios', businessDesc: 'Publicar anuncios', radius: 'Radio', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'AUTOBÚS', rent: 'ALQUILER', realty: 'INMUEBLES', market: 'OLX', services: 'SERVICIOS', jobs: 'EMPLEO', business_cat: 'NEGOCIOS', ai: 'COVCHEG-AI', charity: 'AYUDA', emergency: 'SOS', cityBtn: 'Ciudad', countryBtn: 'País', worldBtn: 'Mundo', catalog: 'Catálogo', search: 'Búsqueda', chats: 'Chats', notifications: 'Alertas', postAd: 'Publicar anuncio', settings: 'Ajustes', tagline: 'Primer asistente IA para ucranianos' },
  pt: { auth: 'Entrar', telegramBtn: 'Entrar com Telegram', skip: 'Pular', or: 'ou', loc: 'Localização', locDesc: 'Defina sua localização para resultados de pesquisa personalizados.', city: 'Cidade', country: 'País', selectCity: 'Cidade', next: 'Próximo', back: 'Voltar', accountType: 'Tipo conta', accountTypeDesc: 'Escolha como você usará o aplicativo.', consumer: 'Consumidor', business: 'Negócio', consumerDesc: 'Buscar serviços', businessDesc: 'Publicar anúncios', radius: 'Raio', taxi: 'TÁXI', transfer: 'TRANSFER', bus: 'AUTOCARRO', rent: 'ALUGUEL', realty: 'IMÓVEIS', market: 'OLX', services: 'SERVIÇOS', jobs: 'EMPREGO', business_cat: 'NEGÓCIOS', ai: 'COVCHEG-AI', charity: 'CARIDADE', emergency: 'SOS', cityBtn: 'Cidade', countryBtn: 'País', worldBtn: 'Mundo', catalog: 'Catálogo', search: 'Pesquisa', chats: 'Chats', notifications: 'Alertas', postAd: 'Publicar anúncio', settings: 'Configurações', tagline: 'Primeiro assistente IA para ucranianos' },
  it: { auth: 'Accedi', telegramBtn: 'Accedi con Telegram', skip: 'Salta', or: 'o', loc: 'Posizione', locDesc: 'Imposta la tua posizione per risultati di ricerca personalizzati.', city: 'Città', country: 'Paese', selectCity: 'Città', next: 'Avanti', back: 'Indietro', accountType: 'Tipo account', accountTypeDesc: "Scegli come userai l'applicazione.", consumer: 'Consumatore', business: 'Attività', consumerDesc: 'Cerca servizi', businessDesc: 'Pubblica annunci', radius: 'Raggio', taxi: 'TAXI', transfer: 'TRANSFER', bus: 'BUS', rent: 'NOLEGGIO', realty: 'IMMOBILI', market: 'OLX', services: 'SERVIZI', jobs: 'LAVORO', business_cat: 'BUSINESS', ai: 'COVCHEG-AI', charity: 'CARITÀ', emergency: 'SOS', cityBtn: 'Città', countryBtn: 'Paese', worldBtn: 'Mondo', catalog: 'Catalogo', search: 'Ricerca', chats: 'Chat', notifications: 'Avvisi', postAd: 'Pubblica annuncio', settings: 'Impostazioni', tagline: 'Primo assistente IA per ucraini' },
  ja: { auth: 'ログイン', telegramBtn: 'Telegramでログイン', skip: 'スキップ', or: 'または', loc: '場所', locDesc: 'パーソナライズされた検索結果のために場所を設定してください。', city: '都市', country: '国', selectCity: '都市選択', next: '次へ', back: '戻る', accountType: 'アカウント', accountTypeDesc: 'アプリの使用方法を選択してください。', consumer: '消費者', business: 'ビジネス', consumerDesc: 'サービス検索', businessDesc: '広告掲載', radius: '半径', taxi: 'タクシー', transfer: '送迎', bus: 'バス', rent: 'レンタカー', realty: '不動産', market: 'OLX', services: 'サービス', jobs: '仕事', business_cat: 'ビジネス', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '都市', countryBtn: '国', worldBtn: '世界', catalog: 'カタログ', search: '検索', chats: 'チャット', notifications: '通知', postAd: '広告を掲載', settings: '設定', tagline: 'ウクライナ人向け初のAIアシスタント' },
  zh: { auth: '登录', telegramBtn: 'Telegram登录', skip: '跳过', or: '或', loc: '地点', locDesc: '设置您的位置以获取个性化搜索结果。', city: '城市', country: '国家', selectCity: '选择城市', next: '下一步', back: '返回', accountType: '账户类型', accountTypeDesc: '选择您使用应用的方式。', consumer: '消费者', business: '商务', consumerDesc: '搜索服务', businessDesc: '发布广告', radius: '半径', taxi: '出租车', transfer: '接送', bus: '巴士', rent: '租车', realty: '房地产', market: 'OLX', services: '服务', jobs: '工作', business_cat: '商务', ai: 'COVCHEG-AI', charity: '慈善', emergency: 'SOS', cityBtn: '城市', countryBtn: '国家', worldBtn: '世界', catalog: '目录', search: '搜索', chats: '聊天', notifications: '通知', postAd: '发布广告', settings: '设置', tagline: '乌克兰人的第一个AI助手' },
  ar: { auth: 'دخول', telegramBtn: 'دخول عبر Telegram', skip: 'تخطي', or: 'أو', loc: 'الموقع', locDesc: 'حدد موقعك للحصول على نتائج بحث مخصصة.', city: 'مدينة', country: 'بلد', selectCity: 'اختر مدينة', next: 'التالي', back: 'رجوع', accountType: 'نوع الحساب', accountTypeDesc: 'اختر كيف ستستخدم التطبيق.', consumer: 'مستهلك', business: 'أعمال', consumerDesc: 'البحث عن الخدمات', businessDesc: 'نشر الإعلانات', radius: 'نطاق', taxi: 'تاكسي', transfer: 'توصيل', bus: 'حافلة', rent: 'ايجار', realty: 'عقارات', market: 'OLX', services: 'خدمات', jobs: 'وظائف', business_cat: 'أعمال', ai: 'COVCHEG-AI', charity: 'خيري', emergency: 'SOS', cityBtn: 'مدينة', countryBtn: 'بلد', worldBtn: 'عالم', catalog: 'كتالوج', search: 'بحث', chats: 'محادثات', notifications: 'تنبيهات', postAd: 'نشر إعلان', settings: 'إعدادات', tagline: 'أول مساعد ذكاء اصطناعي للأوكرانيين' },
  hi: { auth: 'लॉगिन', telegramBtn: 'Telegram से लॉगिन', skip: 'छोड़ें', or: 'या', loc: 'स्थान', locDesc: 'व्यक्तिगत खोज परिणामों के लिए अपना स्थान निर्धारित करें।', city: 'शहर', country: 'देश', selectCity: 'शहर चुनें', next: 'अगला', back: 'वापस', accountType: 'खाता प्रकार', accountTypeDesc: 'चुनें कि आप ऐप का उपयोग कैसे करेंगे।', consumer: 'उपभोक्ता', business: 'व्यापार', consumerDesc: 'सेवाएं खोजें', businessDesc: 'विज्ञापन पोस्ट', radius: 'त्रिज्या', taxi: 'टैक्सी', transfer: 'ट्रांसफर', bus: 'बस', rent: 'किराया', realty: 'रियल एस्टेट', market: 'OLX', services: 'सेवाएं', jobs: 'नौकरी', business_cat: 'व्यापार', ai: 'COVCHEG-AI', charity: 'दान', emergency: 'SOS', cityBtn: 'शहर', countryBtn: 'देश', worldBtn: 'विश्व', catalog: 'कैटलॉग', search: 'खोज', chats: 'चैट', notifications: 'सूचनाएं', postAd: 'विज्ञापन दें', settings: 'सेटिंग्स', tagline: 'यूक्रेनियन के लिए पहला AI सहायक' },
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

// ─── Theme tokens (перламутровый/металлик эффект) ─────────────────────────────
const THEMES = {
  dark: {
    bg: '#070c18',
    panel: 'linear-gradient(145deg,#0c1225 0%,#0e1628 60%,#080e1e 100%)',
    panelLeft: 'linear-gradient(165deg,#0d1b38 0%,#091425 50%,#060c1a 100%)',
    shimmer: 'linear-gradient(120deg,rgba(59,130,246,0.06) 0%,rgba(99,102,241,0.09) 50%,rgba(139,92,246,0.06) 100%)',
    card: 'rgba(12,18,36,0.85)',
    cardBorder: 'rgba(59,130,246,0.13)',
    inputBg: 'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(59,130,246,0.18)',
    navBg: 'rgba(7,12,24,0.94)',
    sidebarBg: 'linear-gradient(180deg,#0b1530 0%,#080f20 100%)',
    text: '#dde6f7',
    textMuted: '#5a6a8e',
    textAccent: '#60a5fa',
  },
  light: {
    bg: '#edf1fc',
    panel: 'linear-gradient(145deg,#f4f6ff 0%,#eef2ff 60%,#f0f4ff 100%)',
    panelLeft: 'linear-gradient(165deg,#dde6ff 0%,#e8eeff 50%,#eef3ff 100%)',
    shimmer: 'linear-gradient(120deg,rgba(99,102,241,0.07) 0%,rgba(139,92,246,0.1) 50%,rgba(59,130,246,0.07) 100%)',
    card: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(99,102,241,0.18)',
    inputBg: 'rgba(255,255,255,0.75)',
    inputBorder: 'rgba(99,102,241,0.22)',
    navBg: 'rgba(238,242,255,0.96)',
    sidebarBg: 'linear-gradient(180deg,#dce6ff 0%,#e8eeff 100%)',
    text: '#1a2540',
    textMuted: '#7080a8',
    textAccent: '#2563eb',
  },
};

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen({ isFadingOut, tagline }: { isFadingOut: boolean; tagline: string }) {
  const loaderText = "COVCHEG-AI".split("");
  return (
    <div
      style={{ transition: 'opacity 1s ease-in-out', opacity: isFadingOut ? 0 : 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#070c18] overflow-hidden z-50"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 45% at 50% 48%,rgba(37,99,235,0.14) 0%,transparent 70%)' }} />

      {/* Mobile: original compact */}
      <div className="flex md:hidden loader-wrapper">
        {loaderText.map((char, i) => (
          <span key={i} className="loader-letter" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{char}</span>
        ))}
        <div className="loader" />
      </div>

      {/* Desktop: bigger, centered, tagline from translations */}
      <div className="hidden md:flex flex-col items-center gap-8">
        <div className="loader-wrapper-lg">
          {loaderText.map((char, i) => (
            <span key={i} className="loader-letter-lg" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>{char}</span>
          ))}
          <div className="loader-fx-lg" />
        </div>
        <p className="text-[#2d4a78] text-[11px] tracking-[0.45em] uppercase font-semibold select-none">{tagline}</p>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-800/60 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* ── Mobile loader ── */
        .loader-wrapper { position:relative;display:flex;align-items:center;justify-content:center;height:150px;font-family:"Poppins",sans-serif;font-size:2.5em;font-weight:800;color:#fff;scale:1.5 }
        .loader { position:absolute;inset:0;z-index:5;mask:repeating-linear-gradient(90deg,transparent 0,transparent 5px,black 7px,black 8px) }
        .loader::after { content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 50% 50%,#ff0 0%,transparent 50%),radial-gradient(circle at 45% 45%,#f00 0%,transparent 45%),radial-gradient(circle at 55% 55%,#0ff 0%,transparent 45%),radial-gradient(circle at 45% 55%,#0f0 0%,transparent 45%),radial-gradient(circle at 55% 45%,#00f 0%,transparent 45%);mask:radial-gradient(circle at 50% 50%,transparent 0%,transparent 10%,black 25%);animation:transform-animation 2s infinite alternate,opacity-animation 4s infinite;animation-timing-function:cubic-bezier(0.6,0.8,0.5,1) }
        .loader-letter { display:inline-block;opacity:0;animation:loader-letter-anim 4s infinite linear;z-index:2 }
        /* ── Desktop loader ── */
        .loader-wrapper-lg { position:relative;display:flex;align-items:center;justify-content:center;height:200px;font-family:"Poppins",sans-serif;font-size:5.5em;font-weight:800;color:#fff }
        .loader-fx-lg { position:absolute;inset:0;z-index:5;mask:repeating-linear-gradient(90deg,transparent 0,transparent 5px,black 7px,black 8px) }
        .loader-fx-lg::after { content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 50% 50%,#ff0 0%,transparent 50%),radial-gradient(circle at 45% 45%,#f00 0%,transparent 45%),radial-gradient(circle at 55% 55%,#0ff 0%,transparent 45%),radial-gradient(circle at 45% 55%,#0f0 0%,transparent 45%),radial-gradient(circle at 55% 45%,#00f 0%,transparent 45%);mask:radial-gradient(circle at 50% 50%,transparent 0%,transparent 10%,black 25%);animation:transform-animation 2s infinite alternate,opacity-animation 4s infinite;animation-timing-function:cubic-bezier(0.6,0.8,0.5,1) }
        .loader-letter-lg { display:inline-block;opacity:0;animation:loader-letter-anim 4s infinite linear;z-index:2 }
        /* ── Shared keyframes ── */
        @keyframes transform-animation { 0%{transform:translate(-55%)} 100%{transform:translate(55%)} }
        @keyframes opacity-animation { 0%,100%{opacity:0} 15%{opacity:1} 65%{opacity:0} }
        @keyframes loader-letter-anim { 0%{opacity:0} 25%{opacity:1;text-shadow:0px 25px 25px #ffd700,0px -25px 25px #0057b7} 50%{opacity:0.5} 100%{opacity:0} }
      `}</style>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]               = useState('splash');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [theme, setTheme]             = useState<'dark' | 'light'>('dark');
  const [scope, setScope]             = useState('city');
  const [lang, setLang]               = useState('en');
  const [tgUser, setTgUser]           = useState<TelegramUser | null>(null);
  const [accountType, setAccountType] = useState<'consumer' | 'business'>('consumer');
  const [isLoading, setIsLoading]     = useState(false);
  const [radius, setRadius]           = useState(25);
  const [userData, setUserData]       = useState({
    city: '', country: '', countryCode: '',
    lat: null as number | null, lon: null as number | null,
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions]   = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<'country' | 'city' | null>(null);
  const [profile, setProfile]           = useState<any>(null);
  const [activeNav, setActiveNav]       = useState('catalog');

  const coordsRef        = useRef<{ lat: number; lon: number } | null>(null);
  const langRef          = useRef<string>('en');
  const tgWidgetInjected = useRef(false);

  const t  = translations[lang] || translations.en;
  const th = THEMES[theme];

  // ── Fade transition ────────────────────────────────────────────────────
  const transitionTo = useCallback((nextStep: string, delay = 0) => {
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setIsFadingOut(false); setStep(nextStep); }, 1000);
    }, delay);
  }, []);

  // ── PocketBase helpers ─────────────────────────────────────────────────
  const signInTelegramExisting = useCallback(async (tgId: number) => {
    const email    = `tg_${tgId}@covcheg.app`;
    const password = `tg_${tgId}_covcheg_${tgId}`;
    try { await pb.collection('users').authWithPassword(email, password); return true; }
    catch { return false; }
  }, []);

  const loginOrRegisterTelegram = useCallback(async (tgId: number, name: string) => {
    const email = `tg_${tgId}@covcheg.app`, password = `tg_${tgId}_covcheg_${tgId}`;
    try { await pb.collection('users').authWithPassword(email, password); }
    catch {
      try {
        await pb.collection('users').create({ email, password, passwordConfirm: password, name });
        await pb.collection('users').authWithPassword(email, password);
      } catch (e) { console.error('Register error:', e); return; }
    }
    try {
      const userId = pb.authStore.model?.id; if (!userId) return;
      const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
      if (profiles.items.length > 0) {
        setProfile(profiles.items[0]);
        setUserData({ city: profiles.items[0].city || '', country: profiles.items[0].country || '', countryCode: profiles.items[0].country_code || '', lat: profiles.items[0].lat || null, lon: profiles.items[0].lon || null });
        transitionTo('main');
      } else { transitionTo('location'); }
    } catch (e) { console.error('Profile error:', e); transitionTo('location'); }
  }, [transitionTo]);

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sysLang    = navigator.language.split('-')[0];
      const initialLang = languages.some(l => l.code === sysLang) ? sysLang : 'en';
      setLang(initialLang); langRef.current = initialLang;

      // Telegram Mini App
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, username: u.username, photo_url: u.photo_url });
        tg.ready(); tg.expand();
        const ok = await signInTelegramExisting(u.id);
        if (ok) {
          try {
            const userId = pb.authStore.model?.id;
            if (userId) {
              const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
              if (profiles.items.length > 0) {
                const p = profiles.items[0]; setProfile(p);
                setLang(p.lang || initialLang); langRef.current = p.lang || initialLang;
                setTheme(p.theme || 'dark');
                setUserData({ city: p.city || '', country: p.country || '', countryCode: p.country_code || '', lat: p.lat || null, lon: p.lon || null });
                if (p.lat && p.lon) coordsRef.current = { lat: p.lat, lon: p.lon };
                transitionTo('main', 500); return;
              }
            }
          } catch (e) { console.error(e); }
        }
        transitionTo('auth', 500); return;
      }

      // Browser OAuth redirect (?tg_auth=...)
      const urlParams   = new URLSearchParams(window.location.search);
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
              const p = profiles.items[0]; setProfile(p);
              setLang(p.lang || initialLang); langRef.current = p.lang || initialLang;
              setTheme(p.theme || 'dark');
              setUserData({ city: p.city || '', country: p.country || '', countryCode: p.country_code || '', lat: p.lat || null, lon: p.lon || null });
              if (p.lat && p.lon) coordsRef.current = { lat: p.lat, lon: p.lon };
              transitionTo('main', 2000); return;
            }
          }
        }
      } catch (e) { console.error(e); }

      transitionTo('auth', 3200);
    };
    init();
  }, [loginOrRegisterTelegram, signInTelegramExisting, transitionTo]);

  // ── GPS & Geocoding ────────────────────────────────────────────────────
  const fetchLocationByCoords = useCallback(async (lat: number, lon: number, language: string) => {
    setIsGpsLoading(true);
    try {
      const isoLang    = LANG_MAP[language] || language;
      const acceptLang = language === 'en' ? 'en' : `${isoLang},en`;
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${acceptLang}&addressdetails=1&zoom=10`);
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
      ()    => setIsGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchLocationByCoords]);

  useEffect(() => { if (step === 'location') requestGPS(); }, [step, requestGPS]);

  const handleLangChange = useCallback((code: string) => {
    setLang(code); langRef.current = code;
    if (coordsRef.current) fetchLocationByCoords(coordsRef.current.lat, coordsRef.current.lon, code);
  }, [fetchLocationByCoords]);

  const fetchLoc = async (q: string, type: 'country' | 'city') => {
    if (q.length < 2) { setSuggestions([]); return; }
    const isoLang    = LANG_MAP[langRef.current] || langRef.current;
    const acceptLang = langRef.current === 'en' ? 'en' : `${isoLang},en`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${acceptLang}&limit=10&addressdetails=1`;
    if (type === 'country') url += '&featuretype=country';
    try { const res = await fetch(url); setSuggestions(await res.json()); } catch (e) { console.error(e); }
  };

  // ── Telegram Login Widget ──────────────────────────────────────────────
  const injectTelegramWidget = useCallback((containerId: string) => {
    if (tgWidgetInjected.current) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    tgWidgetInjected.current = true;

    (window as any).onTelegramAuth = async (user: any) => {
      setIsLoading(true);
      try {
        const res    = await fetch('/api/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
        const result = await res.json();
        if (!result.ok) throw new Error(result.error || 'Auth failed');
        await pb.collection('users').authWithPassword(result.email, result.password);
        setTgUser({ id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username, photo_url: user.photo_url });
        const userId = pb.authStore.model?.id;
        if (userId) {
          const profiles = await pb.collection('profiles').getList(1, 1, { filter: `user = "${userId}"` });
          if (profiles.items.length > 0) { setProfile(profiles.items[0]); transitionTo('main'); }
          else { transitionTo('location'); }
        } else { transitionTo('location'); }
      } catch (e) { console.error('Telegram widget auth error:', e); setIsLoading(false); }
    };

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername) { console.error('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not set'); return; }

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
    if (step === 'auth') {
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
      const profileData = { user: userId, account_type: accountType, lang: langRef.current, theme, city: userData.city, country: userData.country, country_code: userData.countryCode, lat: userData.lat || 0, lon: userData.lon || 0, telegram_id: tgUser ? String(tgUser.id) : '', search_radius: radius };
      if (profile?.id) { await pb.collection('profiles').update(profile.id, profileData); }
      else { const newProfile = await pb.collection('profiles').create(profileData); setProfile(newProfile); }
      transitionTo('main');
    } catch (e) { console.error(e); transitionTo('main'); }
    finally { setIsLoading(false); }
  }, [accountType, theme, userData, tgUser, profile, radius, transitionTo]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const dk = (dark: string, light: string) => theme === 'dark' ? dark : light;
  const fadeStyle: React.CSSProperties = { transition: 'opacity 1s ease-in-out', opacity: isFadingOut ? 0 : 1 };

  const navItems = [
    { key: 'catalog',       icon: Icons.LayoutGrid,    label: t.catalog },
    { key: 'search',        icon: Icons.Search,        label: t.search },
    { key: 'chats',         icon: Icons.MessageCircle, label: t.chats },
    { key: 'notifications', icon: Icons.Bell,          label: t.notifications },
    { key: 'settings',      icon: Icons.Settings,      label: t.settings },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SPLASH
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'splash') {
    return <SplashScreen isFadingOut={isFadingOut} tagline={t.tagline} />;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH — оригинальная вёрстка из doc18 + Telegram Widget кнопка
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'auth') {
    return (
      <div style={fadeStyle} className={`min-h-screen flex flex-col ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* ── Desktop layout ── */}
        <div className="hidden md:flex min-h-screen">
          {/* Left brand panel — облако всех категорий */}
          <div className="w-1/2 flex flex-col items-center justify-center p-16 relative overflow-hidden"
            style={{ background: th.panelLeft }}>
            <div className="absolute inset-0" style={{ background: th.shimmer }} />
            <div className="relative z-10 text-center">
              <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4" style={{ color: th.textAccent }}>COVCHEG.UA</h1>
              <p className="text-lg font-semibold mb-8" style={{ color: th.textMuted }}>{t.tagline}</p>
              {/* Облако всех категорий — монохром */}
              <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {allCategories.map(cat => (
                  <div key={cat.id} className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border"
                    style={{ borderColor: th.cardBorder, background: 'rgba(255,255,255,0.025)' }}>
                    <cat.icon size={15} strokeWidth={1.5} style={{ color: th.textAccent }} />
                    <span className="text-[8px] font-black uppercase" style={{ color: th.textMuted }}>{t[cat.nameKey]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right auth panel */}
          <div className={`w-1/2 flex flex-col items-center justify-center p-16 ${dk('bg-slate-950', 'bg-gray-50')}`}>
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
                <h2 className="text-2xl font-black italic uppercase text-blue-500">{t.auth}</h2>
                <p className={`text-xs mt-1 ${dk('text-slate-400', 'text-gray-500')}`}>COVCHEG.UA</p>
              </div>

              {/* Telegram Widget — официальная кнопка */}
              <div className="flex flex-col items-center gap-4">
                <div id="tg-widget-container" className="flex justify-center w-full min-h-[48px]">
                  {isLoading && <Icons.Loader size={22} className="animate-spin text-blue-400 mt-3" />}
                </div>
                <button onClick={() => transitionTo('location')}
                  className={`w-full text-center text-xs font-black uppercase py-3 rounded-2xl transition-colors ${dk('text-slate-500 hover:text-blue-400', 'text-gray-400 hover:text-blue-500')}`}>
                  {t.skip}
                </button>
              </div>
            </div>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`mt-6 p-3 rounded-2xl border-2 transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
              {theme === 'dark' ? <Icons.Sun size={18} className="text-yellow-400" /> : <Icons.Moon size={18} className="text-slate-600" />}
            </button>
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="flex flex-col md:hidden min-h-screen">
          <div className="flex items-center justify-between p-4 pt-10">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-2xl border-2 transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
              {theme === 'dark' ? <Icons.Sun size={18} className="text-yellow-400" /> : <Icons.Moon size={18} className="text-slate-600" />}
            </button>
          </div>

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

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
            <div className={`w-full max-w-sm rounded-[2rem] p-8 ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100 shadow-xl')}`}>
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl">
                  <Icons.Bot size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black italic uppercase text-blue-500">{t.auth}</h2>
                <p className={`text-xs mt-1 ${dk('text-slate-400', 'text-gray-500')}`}>COVCHEG.UA</p>
              </div>

              {/* Telegram Widget — официальная кнопка, центрирована */}
              <div className="flex flex-col items-center gap-4">
                <div id="tg-widget-container" className="flex justify-center w-full min-h-[48px]">
                  {isLoading && <Icons.Loader size={22} className="animate-spin text-blue-400 mt-3" />}
                </div>
                <button onClick={() => transitionTo('location')}
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

  // ══════════════════════════════════════════════════════════════════════════
  // LOCATION — оригинал из doc18 + BackBtn + locDesc из переводов
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'location') {
    return (
      <div style={fadeStyle} className={`min-h-screen flex flex-col ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* Desktop */}
        <div className="hidden md:flex min-h-screen">
          <div className="w-2/5 flex flex-col items-center justify-center p-16 relative overflow-hidden"
            style={{ background: th.panelLeft }}>
            <div className="absolute inset-0" style={{ background: th.shimmer }} />
            <div className="relative z-10 text-center">
              <Icons.MapPin size={80} strokeWidth={1.5} className="mx-auto mb-6" style={{ color: th.textAccent }} />
              <h2 className="text-4xl font-black italic uppercase mb-4" style={{ color: th.textAccent }}>{t.loc}</h2>
              <p className="text-sm leading-relaxed" style={{ color: th.textMuted }}>{t.locDesc}</p>
            </div>
          </div>
          <div className={`flex-1 flex flex-col justify-center p-16 ${dk('bg-slate-950', 'bg-gray-50')}`}>
            {/* Back button */}
            <button onClick={() => transitionTo('auth')}
              className="flex items-center gap-1 text-xs font-black uppercase mb-8 hover:opacity-60 transition-opacity w-fit"
              style={{ color: th.textAccent }}>
              <Icons.ChevronLeft size={16} /> {t.back}
            </button>
            <LocationForm t={t} theme={theme} dk={dk} userData={userData} setUserData={setUserData} coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} isGpsLoading={isGpsLoading} fetchLoc={fetchLoc} onNext={() => transitionTo('account_type')} />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col md:hidden p-6">
          <div className="flex items-center justify-between mt-10 mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => transitionTo('auth')}
                className={`p-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')}`}>
                <Icons.ChevronLeft size={18} />
              </button>
              <h2 className="text-4xl font-black italic uppercase text-blue-500">{t.loc}</h2>
            </div>
            <button onClick={requestGPS}
              className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')} ${isGpsLoading ? 'animate-pulse' : ''}`}>
              <Icons.Navigation size={14} /> {isGpsLoading ? '...' : 'GPS'}
            </button>
          </div>
          <LocationForm t={t} theme={theme} dk={dk} userData={userData} setUserData={setUserData} coordsRef={coordsRef} suggestions={suggestions} setSuggestions={setSuggestions} activeSearch={activeSearch} setActiveSearch={setActiveSearch} radius={radius} setRadius={setRadius} requestGPS={requestGPS} isGpsLoading={isGpsLoading} fetchLoc={fetchLoc} onNext={() => transitionTo('account_type')} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACCOUNT TYPE — оригинал из doc18 + BackBtn + accountTypeDesc
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'account_type') {
    return (
      <div style={fadeStyle} className={`min-h-screen flex ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

        {/* Desktop */}
        <div className="hidden md:flex w-full">
          <div className="w-1/2 flex flex-col items-center justify-center p-16 relative overflow-hidden"
            style={{ background: th.panelLeft }}>
            <div className="absolute inset-0" style={{ background: th.shimmer }} />
            <div className="relative z-10 text-center">
              <Icons.Users size={80} strokeWidth={1.5} className="mx-auto mb-6" style={{ color: th.textAccent }} />
              <h2 className="text-4xl font-black italic uppercase mb-4" style={{ color: th.textAccent }}>{t.accountType}</h2>
              <p className="text-sm leading-relaxed" style={{ color: th.textMuted }}>{t.accountTypeDesc}</p>
            </div>
          </div>
          <div className={`w-1/2 flex flex-col justify-center p-16 gap-6 ${dk('bg-slate-950', 'bg-gray-50')}`}>
            <button onClick={() => transitionTo('location')}
              className="flex items-center gap-1 text-xs font-black uppercase mb-2 hover:opacity-60 transition-opacity w-fit"
              style={{ color: th.textAccent }}>
              <Icons.ChevronLeft size={16} /> {t.back}
            </button>
            <AccountTypeCards t={t} theme={theme} dk={dk} accountType={accountType} setAccountType={setAccountType} />
            <button onClick={saveProfile} disabled={isLoading}
              className="w-full max-w-md bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              {isLoading ? <Icons.Loader size={22} className="animate-spin" /> : <Icons.CheckCircle size={22} />}
              {isLoading ? '...' : t.next}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col w-full p-6">
          <div className="flex items-center gap-3 mt-10 mb-8">
            <button onClick={() => transitionTo('location')}
              className={`p-2 rounded-xl ${dk('bg-slate-800 text-blue-400', 'bg-gray-100 text-blue-600')}`}>
              <Icons.ChevronLeft size={18} />
            </button>
            <h2 className="text-4xl font-black italic uppercase text-blue-500">{t.accountType}</h2>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <AccountTypeCards t={t} theme={theme} dk={dk} accountType={accountType} setAccountType={setAccountType} />
          </div>
          <div className="pb-6 pt-4">
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

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN — оригинал из doc18: desktop sidebar + mobile nav из doc18
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={fadeStyle} className={`min-h-screen ${dk('bg-slate-950 text-white', 'bg-gray-50 text-slate-900')}`}>

      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 flex flex-col py-8 px-3 border-r shrink-0"
          style={{ background: th.sidebarBg, borderColor: th.cardBorder }}>
          <div className="px-4 mb-8">
            <h1 className="text-xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <p className="text-[9px] font-semibold tracking-widest mt-0.5" style={{ color: th.textMuted }}>AI HELPER</p>
          </div>
          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map(item => (
              <button key={item.key} onClick={() => setActiveNav(item.key)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black uppercase transition-all text-left"
                style={{ background: activeNav === item.key ? 'rgba(59,130,246,0.14)' : 'transparent', color: activeNav === item.key ? th.textAccent : th.textMuted, borderLeft: activeNav === item.key ? '3px solid #3b82f6' : '3px solid transparent' }}>
                <item.icon size={17} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="px-2 space-y-3">
            {tgUser ? (
              <div className="px-4 py-4 rounded-2xl border" style={{ borderColor: th.cardBorder, background: th.card }}>
                <div className="flex items-center gap-3">
                  {tgUser.photo_url
                    ? <img src={tgUser.photo_url} className="w-9 h-9 rounded-full border-2 border-blue-600" alt="" />
                    : <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">{tgUser.first_name[0]}</div>}
                  <div>
                    <div className="text-xs font-black" style={{ color: th.text }}>{tgUser.first_name} {tgUser.last_name || ''}</div>
                    {tgUser.username && <div className="text-[10px]" style={{ color: th.textMuted }}>@{tgUser.username}</div>}
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
              <Icons.Plus size={16} strokeWidth={3} /> {t.postAd}
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-4 px-8 py-4 border-b" style={{ background: th.panel, borderColor: th.cardBorder }}>
            <div className="flex gap-1 p-1 rounded-2xl border" style={{ background: th.inputBg, borderColor: th.cardBorder }}>
              {['city', 'country', 'world'].map(s => (
                <button key={s} onClick={() => setScope(s)}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all"
                  style={{ background: scope === s ? '#2563eb' : 'transparent', color: scope === s ? '#fff' : th.textMuted }}>
                  {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
              style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }}>
              <Icons.MapPin size={14} className="text-blue-400" />
              <span className="text-[11px] font-black uppercase text-blue-400">{userData.city || t.selectCity}</span>
            </div>
            <div className="ml-auto" />
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
              {theme === 'dark' ? <Icons.Sun size={16} className="text-yellow-400" /> : <Icons.Moon size={16} className="text-slate-600" />}
            </button>
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl">
              {allCategories.map(cat => (
                <button key={cat.id}
                  className={`flex flex-col items-center justify-center rounded-[2rem] p-6 border transition-all hover:scale-105 active:scale-95 cursor-pointer ${dk('bg-slate-900 border-slate-800 hover:border-blue-700', 'bg-white border-gray-100 hover:border-blue-300')}`}>
                  <div className={`${cat.color} mb-3 rounded-2xl p-4 text-white shadow-lg`}><cat.icon size={30} /></div>
                  <span className="text-[11px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.nameKey] || cat.nameKey}</span>
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile — оригинал из doc18 ───────────────────────────────── */}
      <div className="flex flex-col md:hidden pb-32">
        <header className={`${dk('bg-slate-900 border-slate-800', 'bg-white border-gray-100')} p-6 rounded-b-[2.5rem] shadow-md border-b`}>
          <div className="flex items-center justify-between mb-4 pt-10">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <div className="flex items-center gap-2">
              {tgUser && (
                <div className="flex items-center gap-2 bg-blue-600/10 px-3 py-2 rounded-2xl border border-blue-600/20">
                  {tgUser.photo_url && <img src={tgUser.photo_url} className="w-6 h-6 rounded-full" alt="" />}
                  <span className="text-[10px] font-black text-blue-400">{tgUser.first_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-600/20">
                <Icons.MapPin size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase text-blue-400">{userData.city || t.selectCity}</span>
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-xl border ${dk('border-slate-700 bg-slate-800', 'border-gray-200 bg-white')}`}>
                {theme === 'dark' ? <Icons.Sun size={14} className="text-yellow-400" /> : <Icons.Moon size={14} className="text-slate-600" />}
              </button>
            </div>
          </div>
          <div className={`${dk('bg-slate-800', 'bg-gray-100')} p-1.5 rounded-2xl flex`}>
            {['city', 'country', 'world'].map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scope === s ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400'}`}>
                {s === 'city' ? t.cityBtn : s === 'country' ? t.countryBtn : t.worldBtn}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 grid grid-cols-3 gap-3">
          {allCategories.map(cat => (
            <button key={cat.id}
              className={`flex flex-col items-center justify-center rounded-[2.5rem] p-5 shadow-sm active:scale-95 transition-all ${dk('bg-slate-900 border border-slate-800', 'bg-white border border-gray-100')}`}>
              <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={26} /></div>
              <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{t[cat.nameKey] || cat.nameKey}</span>
            </button>
          ))}
        </main>

        {/* Bottom nav — оригинал из doc18 */}
        <nav className={`fixed bottom-6 left-6 right-6 rounded-[2.5rem] shadow-2xl p-4 flex justify-around items-center backdrop-blur-md ${dk('bg-slate-900/90 border border-slate-700', 'bg-white/90 border border-gray-200')}`}>
          {navItems.slice(0, 2).map(item => (
            <button key={item.key} onClick={() => setActiveNav(item.key)}
              className="flex flex-col items-center gap-1"
              style={{ color: activeNav === item.key ? th.textAccent : th.textMuted }}>
              <item.icon size={22} />
              <span className="text-[8px] font-black uppercase">{item.label}</span>
            </button>
          ))}
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl -mt-16 border-[7px] border-slate-900 active:scale-95 cursor-pointer">
            <Icons.Plus size={32} strokeWidth={3} />
          </div>
          {navItems.slice(2, 4).map(item => (
            <button key={item.key} onClick={() => setActiveNav(item.key)}
              className="flex flex-col items-center gap-1"
              style={{ color: activeNav === item.key ? th.textAccent : th.textMuted }}>
              <item.icon size={22} />
              <span className="text-[8px] font-black uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ─── Sub-components (оригинал из doc18, без изменений) ───────────────────────

function LocationForm({
  t, theme, dk, userData, setUserData, coordsRef,
  suggestions, setSuggestions, activeSearch, setActiveSearch,
  radius, setRadius, requestGPS, isGpsLoading, fetchLoc, onNext,
}: any) {
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="hidden md:flex justify-end">
        <button onClick={requestGPS}
          className={`text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-blue-600'} ${isGpsLoading ? 'animate-pulse' : ''}`}>
          <Icons.Navigation size={14} /> {isGpsLoading ? '...' : 'GPS'}
        </button>
      </div>

      {/* Country */}
      <div className="relative">
        <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input type="text" placeholder={t.country} value={userData.country}
          onFocus={() => setActiveSearch('country')}
          onChange={(e) => { setUserData({ ...userData, country: e.target.value, countryCode: '', lat: null, lon: null }); coordsRef.current = null; fetchLoc(e.target.value, 'country'); }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'country' && suggestions.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
            {suggestions.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat = parseFloat(item.lat), lon = parseFloat(item.lon); coordsRef.current = { lat, lon }; setUserData({ ...userData, country: item.display_name.split(',')[0], countryCode: item.address?.country_code?.toUpperCase() || '', lat, lon }); setSuggestions([]); setActiveSearch(null); }}
                className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3 text-white">
                <img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3" alt="" /> {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* City */}
      <div className="relative">
        <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input type="text" placeholder={t.city} value={userData.city}
          onFocus={() => setActiveSearch('city')}
          onChange={(e) => { setUserData({ ...userData, city: e.target.value, lat: null, lon: null }); fetchLoc(e.target.value, 'city'); }}
          className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-600 text-white' : 'bg-white border-gray-200 focus:border-blue-600 text-slate-900'}`} />
        {activeSearch === 'city' && suggestions.length > 0 && (
          <div className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
            {suggestions.map((item: any) => (
              <div key={item.place_id}
                onMouseDown={() => { const lat = parseFloat(item.lat), lon = parseFloat(item.lon); coordsRef.current = { lat, lon }; setUserData({ ...userData, city: item.display_name.split(',')[0], lat, lon }); setSuggestions([]); setActiveSearch(null); }}
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
        {accountType === 'consumer' && <Icons.CheckCircle size={24} className="text-blue-500 shrink-0" />}
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
        {accountType === 'business' && <Icons.CheckCircle size={24} className="text-blue-500 shrink-0" />}
      </button>
    </>
  );
}
