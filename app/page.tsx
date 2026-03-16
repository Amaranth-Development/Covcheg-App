'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Icons from 'lucide-react';
import pb from '@/lib/pocketbase';

interface TelegramUser {
  id: number; first_name: string; last_name?: string; username?: string; photo_url?: string;
}

// ─── Translations — все 12 языков, все ключи ──────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  ua: { auth:'Вхід', telegramBtn:'Увійти через Telegram', skip:'Пропустити', or:'або', loc:'Локація', locDesc:'Вкажіть ваше місцезнаходження для персоналізованих результатів пошуку.', city:'Місто', country:'Країна', selectCity:'Оберіть місто', next:'Далі', back:'Назад', accountType:'Тип акаунту', accountTypeDesc:'Оберіть як ви будете використовувати додаток. Це можна змінити у налаштуваннях.', consumer:'Споживач', business:'Бізнес', consumerDesc:'Пошук послуг та товарів', businessDesc:'Розміщення оголошень та послуг', radius:'Радіус пошуку', taxi:'ТАКСІ', transfer:'ТРАНСФЕР', bus:'АВТОБУСИ', rent:'ОРЕНДА АВТО', realty:'НЕРУХОМІСТЬ', market:'OLX', services:'ПОСЛУГИ', jobs:'РОБОТА', business_cat:'БІЗНЕС', ai:'COVCHEG-AI', charity:'ДОПОМОГА', emergency:'SOS', cityBtn:'Місто', countryBtn:'Країна', worldBtn:'Світ', catalog:'Каталог', search:'Пошук', chats:'Чати', notifications:'Сповіщення', postAd:'Подати оголошення', settings:'Налаштування', tagline:'Перший AI-помічник для українців' },
  ru: { auth:'Вход', telegramBtn:'Войти через Telegram', skip:'Пропустить', or:'или', loc:'Локация', locDesc:'Укажите ваше местоположение для персонализированных результатов поиска.', city:'Город', country:'Страна', selectCity:'Выберите город', next:'Далее', back:'Назад', accountType:'Тип аккаунта', accountTypeDesc:'Выберите как вы будете использовать приложение. Можно изменить в настройках.', consumer:'Потребитель', business:'Бизнес', consumerDesc:'Поиск услуг и товаров', businessDesc:'Размещение объявлений и услуг', radius:'Радиус поиска', taxi:'ТАКСИ', transfer:'ТРАНСФЕР', bus:'АВТОБУСЫ', rent:'АРЕНДА АВТО', realty:'НЕДВИЖИМОСТЬ', market:'OLX', services:'УСЛУГИ', jobs:'РАБОТА', business_cat:'БИЗНЕС', ai:'COVCHEG-AI', charity:'ПОМОЩЬ', emergency:'SOS', cityBtn:'Город', countryBtn:'Страна', worldBtn:'Мир', catalog:'Каталог', search:'Поиск', chats:'Чаты', notifications:'Уведомления', postAd:'Подать объявление', settings:'Настройки', tagline:'Первый AI-помощник для украинцев' },
  en: { auth:'Sign In', telegramBtn:'Sign in with Telegram', skip:'Skip', or:'or', loc:'Location', locDesc:'Set your location to get personalized search results near you.', city:'City', country:'Country', selectCity:'Select City', next:'Next', back:'Back', accountType:'Account Type', accountTypeDesc:'Choose how you will use the app. You can change this in settings.', consumer:'Consumer', business:'Business', consumerDesc:'Search for services and goods', businessDesc:'Post ads and services', radius:'Search radius', taxi:'TAXI', transfer:'TRANSFER', bus:'BUS-UA', rent:'RENT CAR', realty:'REALTY', market:'OLX', services:'SERVICES', jobs:'JOBS', business_cat:'BUSINESS', ai:'COVCHEG-AI', charity:'CHARITY', emergency:'SOS', cityBtn:'City', countryBtn:'Country', worldBtn:'World', catalog:'Catalog', search:'Search', chats:'Chats', notifications:'Alerts', postAd:'Post Ad', settings:'Settings', tagline:'First AI Helper for Ukrainians' },
  de: { auth:'Anmelden', telegramBtn:'Mit Telegram anmelden', skip:'Überspringen', or:'oder', loc:'Standort', locDesc:'Geben Sie Ihren Standort für personalisierte Suchergebnisse an.', city:'Stadt', country:'Land', selectCity:'Stadt wählen', next:'Weiter', back:'Zurück', accountType:'Kontotyp', accountTypeDesc:'Wählen Sie, wie Sie die App verwenden möchten.', consumer:'Verbraucher', business:'Geschäft', consumerDesc:'Dienste und Waren suchen', businessDesc:'Anzeigen und Dienste posten', radius:'Suchradius', taxi:'TAXI', transfer:'TRANSFER', bus:'BUSSE', rent:'AUTO MIETEN', realty:'IMMOBILIEN', market:'OLX', services:'DIENSTE', jobs:'JOBS', business_cat:'BUSINESS', ai:'COVCHEG-AI', charity:'HILFE', emergency:'SOS', cityBtn:'Stadt', countryBtn:'Land', worldBtn:'Welt', catalog:'Katalog', search:'Suche', chats:'Chats', notifications:'Benachricht.', postAd:'Anzeige aufgeben', settings:'Einstellungen', tagline:'Erster KI-Helfer für Ukrainer' },
  fr: { auth:'Connexion', telegramBtn:'Connexion Telegram', skip:'Passer', or:'ou', loc:'Lieu', locDesc:'Indiquez votre emplacement pour des résultats de recherche personnalisés.', city:'Ville', country:'Pays', selectCity:'Choisir ville', next:'Suivant', back:'Retour', accountType:'Type compte', accountTypeDesc:"Choisissez comment utiliser l'application.", consumer:'Consommateur', business:'Entreprise', consumerDesc:'Rechercher services et biens', businessDesc:'Publier annonces et services', radius:'Rayon de recherche', taxi:'TAXI', transfer:'TRANSFERT', bus:'BUS', rent:'LOCATION VOITURE', realty:'IMMOBILIER', market:'OLX', services:'SERVICES', jobs:'EMPLOIS', business_cat:'AFFAIRES', ai:'COVCHEG-AI', charity:'CHARITÉ', emergency:'SOS', cityBtn:'Ville', countryBtn:'Pays', worldBtn:'Monde', catalog:'Catalogue', search:'Recherche', chats:'Chats', notifications:'Alertes', postAd:'Publier annonce', settings:'Paramètres', tagline:'Premier assistant IA pour Ukrainiens' },
  es: { auth:'Entrar', telegramBtn:'Entrar con Telegram', skip:'Saltar', or:'o', loc:'Ubicación', locDesc:'Indica tu ubicación para obtener resultados personalizados.', city:'Ciudad', country:'País', selectCity:'Seleccionar ciudad', next:'Siguiente', back:'Volver', accountType:'Tipo de cuenta', accountTypeDesc:'Elige cómo usarás la aplicación.', consumer:'Consumidor', business:'Negocio', consumerDesc:'Buscar servicios y bienes', businessDesc:'Publicar anuncios y servicios', radius:'Radio de búsqueda', taxi:'TAXI', transfer:'TRANSFER', bus:'AUTOBÚS', rent:'ALQUILER COCHE', realty:'INMUEBLES', market:'OLX', services:'SERVICIOS', jobs:'EMPLEOS', business_cat:'NEGOCIOS', ai:'COVCHEG-AI', charity:'AYUDA', emergency:'SOS', cityBtn:'Ciudad', countryBtn:'País', worldBtn:'Mundo', catalog:'Catálogo', search:'Búsqueda', chats:'Chats', notifications:'Alertas', postAd:'Publicar anuncio', settings:'Ajustes', tagline:'Primer asistente IA para ucranianos' },
  pt: { auth:'Entrar', telegramBtn:'Entrar com Telegram', skip:'Pular', or:'ou', loc:'Localização', locDesc:'Defina sua localização para resultados de pesquisa personalizados.', city:'Cidade', country:'País', selectCity:'Selecionar cidade', next:'Próximo', back:'Voltar', accountType:'Tipo de conta', accountTypeDesc:'Escolha como você usará o aplicativo.', consumer:'Consumidor', business:'Negócio', consumerDesc:'Buscar serviços e produtos', businessDesc:'Publicar anúncios e serviços', radius:'Raio de pesquisa', taxi:'TÁXI', transfer:'TRANSFER', bus:'AUTOCARRO', rent:'ALUGUEL CARRO', realty:'IMÓVEIS', market:'OLX', services:'SERVIÇOS', jobs:'EMPREGOS', business_cat:'NEGÓCIOS', ai:'COVCHEG-AI', charity:'CARIDADE', emergency:'SOS', cityBtn:'Cidade', countryBtn:'País', worldBtn:'Mundo', catalog:'Catálogo', search:'Pesquisa', chats:'Chats', notifications:'Alertas', postAd:'Publicar anúncio', settings:'Configurações', tagline:'Primeiro assistente IA para ucranianos' },
  it: { auth:'Accedi', telegramBtn:'Accedi con Telegram', skip:'Salta', or:'o', loc:'Posizione', locDesc:'Imposta la tua posizione per risultati di ricerca personalizzati.', city:'Città', country:'Paese', selectCity:'Seleziona città', next:'Avanti', back:'Indietro', accountType:'Tipo account', accountTypeDesc:"Scegli come userai l'applicazione.", consumer:'Consumatore', business:'Attività', consumerDesc:'Cerca servizi e prodotti', businessDesc:'Pubblica annunci e servizi', radius:'Raggio di ricerca', taxi:'TAXI', transfer:'TRANSFER', bus:'BUS', rent:'NOLEGGIO AUTO', realty:'IMMOBILI', market:'OLX', services:'SERVIZI', jobs:'LAVORO', business_cat:'BUSINESS', ai:'COVCHEG-AI', charity:'CARITÀ', emergency:'SOS', cityBtn:'Città', countryBtn:'Paese', worldBtn:'Mondo', catalog:'Catalogo', search:'Ricerca', chats:'Chat', notifications:'Avvisi', postAd:'Pubblica annuncio', settings:'Impostazioni', tagline:'Primo assistente IA per ucraini' },
  ja: { auth:'ログイン', telegramBtn:'Telegramでログイン', skip:'スキップ', or:'または', loc:'場所', locDesc:'パーソナライズされた検索結果のために場所を設定してください。', city:'都市', country:'国', selectCity:'都市を選択', next:'次へ', back:'戻る', accountType:'アカウント種別', accountTypeDesc:'アプリの使用方法を選択してください。', consumer:'消費者', business:'ビジネス', consumerDesc:'サービスと商品を検索', businessDesc:'広告とサービスを掲載', radius:'検索半径', taxi:'タクシー', transfer:'送迎', bus:'バス', rent:'レンタカー', realty:'不動産', market:'OLX', services:'サービス', jobs:'仕事', business_cat:'ビジネス', ai:'COVCHEG-AI', charity:'慈善', emergency:'SOS', cityBtn:'都市', countryBtn:'国', worldBtn:'世界', catalog:'カタログ', search:'検索', chats:'チャット', notifications:'通知', postAd:'広告を掲載', settings:'設定', tagline:'ウクライナ人向け初のAIアシスタント' },
  zh: { auth:'登录', telegramBtn:'Telegram登录', skip:'跳过', or:'或', loc:'地点', locDesc:'设置您的位置以获取个性化搜索结果。', city:'城市', country:'国家', selectCity:'选择城市', next:'下一步', back:'返回', accountType:'账户类型', accountTypeDesc:'选择您使用应用的方式。', consumer:'消费者', business:'商务', consumerDesc:'搜索服务和商品', businessDesc:'发布广告和服务', radius:'搜索半径', taxi:'出租车', transfer:'接送', bus:'巴士', rent:'租车', realty:'房地产', market:'OLX', services:'服务', jobs:'工作', business_cat:'商务', ai:'COVCHEG-AI', charity:'慈善', emergency:'SOS', cityBtn:'城市', countryBtn:'国家', worldBtn:'世界', catalog:'目录', search:'搜索', chats:'聊天', notifications:'通知', postAd:'发布广告', settings:'设置', tagline:'乌克兰人的第一个AI助手' },
  ar: { auth:'دخول', telegramBtn:'دخول عبر Telegram', skip:'تخطي', or:'أو', loc:'الموقع', locDesc:'حدد موقعك للحصول على نتائج بحث مخصصة.', city:'مدينة', country:'بلد', selectCity:'اختر مدينة', next:'التالي', back:'رجوع', accountType:'نوع الحساب', accountTypeDesc:'اختر كيف ستستخدم التطبيق.', consumer:'مستهلك', business:'أعمال', consumerDesc:'البحث عن الخدمات والبضائع', businessDesc:'نشر الإعلانات والخدمات', radius:'نطاق البحث', taxi:'تاكسي', transfer:'توصيل', bus:'حافلة', rent:'ايجار سيارة', realty:'عقارات', market:'OLX', services:'خدمات', jobs:'وظائف', business_cat:'أعمال', ai:'COVCHEG-AI', charity:'خيري', emergency:'SOS', cityBtn:'مدينة', countryBtn:'بلد', worldBtn:'عالم', catalog:'كتالوج', search:'بحث', chats:'محادثات', notifications:'تنبيهات', postAd:'نشر إعلان', settings:'إعدادات', tagline:'أول مساعد ذكاء اصطناعي للأوكرانيين' },
  hi: { auth:'लॉगिन', telegramBtn:'Telegram से लॉगिन', skip:'छोड़ें', or:'या', loc:'स्थान', locDesc:'व्यक्तिगत खोज परिणामों के लिए अपना स्थान निर्धारित करें।', city:'शहर', country:'देश', selectCity:'शहर चुनें', next:'अगला', back:'वापस', accountType:'खाता प्रकार', accountTypeDesc:'चुनें कि आप ऐप का उपयोग कैसे करेंगे।', consumer:'उपभोक्ता', business:'व्यापार', consumerDesc:'सेवाएं और सामान खोजें', businessDesc:'विज्ञापन और सेवाएं पोस्ट करें', radius:'खोज त्रिज्या', taxi:'टैक्सी', transfer:'ट्रांसफर', bus:'बस', rent:'किराये की कार', realty:'रियल एस्टेट', market:'OLX', services:'सेवाएं', jobs:'नौकरी', business_cat:'व्यापार', ai:'COVCHEG-AI', charity:'दान', emergency:'SOS', cityBtn:'शहर', countryBtn:'देश', worldBtn:'विश्व', catalog:'कैटलॉग', search:'खोज', chats:'चैट', notifications:'सूचनाएं', postAd:'विज्ञापन दें', settings:'सेटिंग्स', tagline:'यूक्रेनियन के लिए पहला AI सहायक' },
};

// ─── Categories ───────────────────────────────────────────────────────────────
const allCategories = [
  { id:'taxi',     nameKey:'taxi',         icon:Icons.Car,           color:'bg-yellow-400' },
  { id:'transfer', nameKey:'transfer',     icon:Icons.Users,         color:'bg-green-500'  },
  { id:'bus',      nameKey:'bus',          icon:Icons.Bus,           color:'bg-blue-600'   },
  { id:'rent',     nameKey:'rent',         icon:Icons.Key,           color:'bg-indigo-600' },
  { id:'realty',   nameKey:'realty',       icon:Icons.Home,          color:'bg-emerald-500'},
  { id:'market',   nameKey:'market',       icon:Icons.ShoppingBag,   color:'bg-orange-500' },
  { id:'services', nameKey:'services',     icon:Icons.Wrench,        color:'bg-purple-500' },
  { id:'jobs',     nameKey:'jobs',         icon:Icons.Briefcase,     color:'bg-indigo-500' },
  { id:'business', nameKey:'business_cat', icon:Icons.Building2,     color:'bg-slate-700'  },
  { id:'ai',       nameKey:'ai',           icon:Icons.Bot,           color:'bg-red-500'    },
  { id:'charity',  nameKey:'charity',      icon:Icons.HeartHandshake,color:'bg-pink-500'   },
  { id:'emergency',nameKey:'emergency',    icon:Icons.LifeBuoy,      color:'bg-red-600'    },
];

const languages = [
  { code:'ua', label:'UKR', iso:'ua' }, { code:'ru', label:'RUS', iso:'ru' },
  { code:'en', label:'ENG', iso:'us' }, { code:'de', label:'GER', iso:'de' },
  { code:'fr', label:'FRA', iso:'fr' }, { code:'es', label:'ESP', iso:'es' },
  { code:'pt', label:'POR', iso:'pt' }, { code:'it', label:'ITA', iso:'it' },
  { code:'ja', label:'JPN', iso:'jp' }, { code:'zh', label:'CHI', iso:'cn' },
  { code:'ar', label:'ARA', iso:'sa' }, { code:'hi', label:'HIN', iso:'in' },
];
const LANG_MAP: Record<string,string> = { ua:'uk', ru:'ru', en:'en', de:'de', fr:'fr', es:'es', pt:'pt', it:'it', ja:'ja', zh:'zh', ar:'ar', hi:'hi' };
const RADIUS_OPTIONS = [5,10,15,20,25,50,100,200,300,500];

// ─── Theme tokens (перламутровый/металлик эффект) ─────────────────────────────
const THEMES = {
  dark: {
    bg:'#070c18', panel:'linear-gradient(145deg,#0c1225 0%,#0e1628 60%,#080e1e 100%)',
    panelLeft:'linear-gradient(165deg,#0d1b38 0%,#091425 50%,#060c1a 100%)',
    shimmer:'linear-gradient(120deg,rgba(59,130,246,0.06) 0%,rgba(99,102,241,0.09) 50%,rgba(139,92,246,0.06) 100%)',
    card:'rgba(12,18,36,0.85)', cardBorder:'rgba(59,130,246,0.13)',
    inputBg:'rgba(255,255,255,0.04)', inputBorder:'rgba(59,130,246,0.18)',
    navBg:'rgba(7,12,24,0.94)', sidebarBg:'linear-gradient(180deg,#0b1530 0%,#080f20 100%)',
    text:'#dde6f7', textMuted:'#5a6a8e', textAccent:'#60a5fa',
  },
  light: {
    bg:'#edf1fc', panel:'linear-gradient(145deg,#f4f6ff 0%,#eef2ff 60%,#f0f4ff 100%)',
    panelLeft:'linear-gradient(165deg,#dde6ff 0%,#e8eeff 50%,#eef3ff 100%)',
    shimmer:'linear-gradient(120deg,rgba(99,102,241,0.07) 0%,rgba(139,92,246,0.1) 50%,rgba(59,130,246,0.07) 100%)',
    card:'rgba(255,255,255,0.85)', cardBorder:'rgba(99,102,241,0.18)',
    inputBg:'rgba(255,255,255,0.75)', inputBorder:'rgba(99,102,241,0.22)',
    navBg:'rgba(238,242,255,0.96)', sidebarBg:'linear-gradient(180deg,#dce6ff 0%,#e8eeff 100%)',
    text:'#1a2540', textMuted:'#7080a8', textAccent:'#2563eb',
  },
};

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen({ isFadingOut, tagline }: { isFadingOut:boolean; tagline:string }) {
  const chars = "COVCHEG-AI".split("");
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#070c18] overflow-hidden z-50"
      style={{ transition:'opacity 1s ease', opacity: isFadingOut ? 0 : 1 }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 65% 45% at 50% 48%,rgba(37,99,235,0.14) 0%,transparent 70%)' }}/>

      {/* Mobile */}
      <div className="flex md:hidden loader-wrap">
        {chars.map((c,i) => <span key={i} className="ltr" style={{ animationDelay:`${(i+1)*0.1}s` }}>{c}</span>)}
        <div className="lfx"/>
      </div>

      {/* Desktop — one big centered loader + tagline */}
      <div className="hidden md:flex flex-col items-center gap-10">
        <div className="loader-wrap-lg">
          {chars.map((c,i) => <span key={i} className="ltr-lg" style={{ animationDelay:`${(i+1)*0.1}s` }}>{c}</span>)}
          <div className="lfx-lg"/>
        </div>
        <p className="text-[#2d4a78] text-[11px] tracking-[0.45em] uppercase font-semibold select-none">{tagline}</p>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-800/60 animate-bounce"
              style={{ animationDelay:`${i*0.2}s` }}/>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes trs  { 0%{transform:translate(-55%)} 100%{transform:translate(55%)} }
        @keyframes opc  { 0%,100%{opacity:0} 15%{opacity:1} 65%{opacity:0} }
        @keyframes letA { 0%{opacity:0} 25%{opacity:1;text-shadow:0 25px 25px #ffd700,0 -25px 25px #0057b7} 50%{opacity:.5} 100%{opacity:0} }
        .loader-wrap    { position:relative;display:flex;align-items:center;justify-content:center;height:150px;font-family:Poppins,sans-serif;font-size:2.5em;font-weight:800;color:#fff;scale:1.5 }
        .loader-wrap-lg { position:relative;display:flex;align-items:center;justify-content:center;height:180px;font-family:Poppins,sans-serif;font-size:5.5em;font-weight:800;color:#fff }
        .lfx,.lfx-lg    { position:absolute;inset:0;z-index:5;mask:repeating-linear-gradient(90deg,transparent 0,transparent 5px,black 7px,black 8px) }
        .lfx::after,.lfx-lg::after { content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 50% 50%,#ff0 0%,transparent 50%),radial-gradient(circle at 45% 45%,#f00 0%,transparent 45%),radial-gradient(circle at 55% 55%,#0ff 0%,transparent 45%),radial-gradient(circle at 45% 55%,#0f0 0%,transparent 45%),radial-gradient(circle at 55% 45%,#00f 0%,transparent 45%);mask:radial-gradient(circle at 50% 50%,transparent 0%,transparent 10%,black 25%);animation:trs 2s infinite alternate cubic-bezier(.6,.8,.5,1),opc 4s infinite }
        .ltr,.ltr-lg { display:inline-block;opacity:0;animation:letA 4s infinite linear;z-index:2 }
      `}</style>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step,setStep]                     = useState('splash');
  const [isFadingOut,setIsFadingOut]       = useState(false);
  const [theme,setTheme]                   = useState<'dark'|'light'>('dark');
  const [scope,setScope]                   = useState('city');
  const [lang,setLang]                     = useState('en');
  const [tgUser,setTgUser]                 = useState<TelegramUser|null>(null);
  const [accountType,setAccountType]       = useState<'consumer'|'business'>('consumer');
  const [isLoading,setIsLoading]           = useState(false);
  const [radius,setRadius]                 = useState(25);
  const [userData,setUserData]             = useState({ city:'', country:'', countryCode:'', lat:null as number|null, lon:null as number|null });
  const [isGpsLoading,setIsGpsLoading]     = useState(false);
  const [suggestions,setSuggestions]       = useState<any[]>([]);
  const [activeSearch,setActiveSearch]     = useState<'country'|'city'|null>(null);
  const [profile,setProfile]               = useState<any>(null);
  const [activeNav,setActiveNav]           = useState('catalog');
  const coordsRef        = useRef<{lat:number;lon:number}|null>(null);
  const langRef          = useRef('en');
  const tgWidgetInjected = useRef(false);
  const t  = translations[lang] || translations.en;
  const th = THEMES[theme];

  // ── Fade transition ────────────────────────────────────────────────────
  const transitionTo = useCallback((nextStep:string, delay=0) => {
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setIsFadingOut(false); setStep(nextStep); }, 900);
    }, delay);
  }, []);

  // ── PocketBase ─────────────────────────────────────────────────────────
  const signInTelegramExisting = useCallback(async (tgId:number) => {
    try { await pb.collection('users').authWithPassword(`tg_${tgId}@covcheg.app`,`tg_${tgId}_covcheg_${tgId}`); return true; } catch { return false; }
  }, []);

  const loginOrRegisterTelegram = useCallback(async (tgId:number, name:string) => {
    const email=`tg_${tgId}@covcheg.app`, password=`tg_${tgId}_covcheg_${tgId}`;
    try { await pb.collection('users').authWithPassword(email,password); }
    catch { try { await pb.collection('users').create({email,password,passwordConfirm:password,name}); await pb.collection('users').authWithPassword(email,password); } catch(e){console.error(e);return;} }
    try {
      const uid=pb.authStore.model?.id; if(!uid)return;
      const ps=await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`});
      if(ps.items.length>0){ const p=ps.items[0]; setProfile(p); setUserData({city:p.city||'',country:p.country||'',countryCode:p.country_code||'',lat:p.lat||null,lon:p.lon||null}); transitionTo('main'); }
      else transitionTo('location');
    } catch { transitionTo('location'); }
  }, [transitionTo]);

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sl=navigator.language.split('-')[0];
      const il=languages.some(l=>l.code===sl)?sl:'en';
      setLang(il); langRef.current=il;

      const tg=(window as any).Telegram?.WebApp;
      if(tg?.initDataUnsafe?.user){
        const u=tg.initDataUnsafe.user;
        setTgUser({id:u.id,first_name:u.first_name,last_name:u.last_name,username:u.username,photo_url:u.photo_url});
        tg.ready(); tg.expand();
        const ok=await signInTelegramExisting(u.id);
        if(ok){
          const uid=pb.authStore.model?.id;
          if(uid){
            const ps=await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`});
            if(ps.items.length>0){
              const p=ps.items[0]; setProfile(p);
              setLang(p.lang||il); langRef.current=p.lang||il; setTheme(p.theme||'dark');
              setUserData({city:p.city||'',country:p.country||'',countryCode:p.country_code||'',lat:p.lat||null,lon:p.lon||null});
              if(p.lat&&p.lon)coordsRef.current={lat:p.lat,lon:p.lon};
              transitionTo('main',500); return;
            }
          }
        }
        transitionTo('auth',500); return;
      }

      const urlParams=new URLSearchParams(window.location.search);
      const tgAuthParam=urlParams.get('tg_auth');
      if(tgAuthParam){
        try{
          const user=JSON.parse(decodeURIComponent(tgAuthParam));
          setTgUser({id:parseInt(user.id),first_name:user.first_name||'',last_name:user.last_name,username:user.username,photo_url:user.photo_url});
          window.history.replaceState({},'','/');
          await loginOrRegisterTelegram(parseInt(user.id),`${user.first_name} ${user.last_name||''}`.trim());
          return;
        } catch(e){console.error('tg_auth parse error:',e);}
      }

      try{
        if(pb.authStore.isValid){
          const uid=pb.authStore.model?.id;
          if(uid){
            const ps=await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`});
            if(ps.items.length>0){
              const p=ps.items[0]; setProfile(p);
              setLang(p.lang||il); langRef.current=p.lang||il; setTheme(p.theme||'dark');
              setUserData({city:p.city||'',country:p.country||'',countryCode:p.country_code||'',lat:p.lat||null,lon:p.lon||null});
              if(p.lat&&p.lon)coordsRef.current={lat:p.lat,lon:p.lon};
              transitionTo('main',2000); return;
            }
          }
        }
      } catch(e){console.error(e);}

      transitionTo('auth',3200);
    };
    init();
  }, [loginOrRegisterTelegram,signInTelegramExisting,transitionTo]);

  // ── GPS ────────────────────────────────────────────────────────────────
  const fetchLocationByCoords = useCallback(async (lat:number, lon:number, language:string) => {
    setIsGpsLoading(true);
    try{
      const il=LANG_MAP[language]||language;
      const res=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${il},en&addressdetails=1&zoom=10`);
      const data=await res.json();
      if(data?.address){ setUserData(prev=>({...prev,city:data.address.city||data.address.town||data.address.village||data.address.municipality||'',country:data.address.country||'',countryCode:data.address.country_code?.toUpperCase()||'',lat,lon})); coordsRef.current={lat,lon}; }
    } catch(e){console.error(e);} finally{setIsGpsLoading(false);}
  }, []);

  const requestGPS = useCallback(() => {
    if(!navigator.geolocation)return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos=>fetchLocationByCoords(pos.coords.latitude,pos.coords.longitude,langRef.current),
      ()=>setIsGpsLoading(false),
      {enableHighAccuracy:true,timeout:10000,maximumAge:0}
    );
  }, [fetchLocationByCoords]);

  useEffect(()=>{ if(step==='location')requestGPS(); },[step,requestGPS]);

  const handleLangChange = useCallback((code:string) => {
    setLang(code); langRef.current=code;
    if(coordsRef.current)fetchLocationByCoords(coordsRef.current.lat,coordsRef.current.lon,code);
  }, [fetchLocationByCoords]);

  const fetchLoc = async (q:string, type:'country'|'city') => {
    if(q.length<2){setSuggestions([]);return;}
    const il=LANG_MAP[langRef.current]||langRef.current;
    let url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&accept-language=${il},en&limit=10&addressdetails=1`;
    if(type==='country')url+='&featuretype=country';
    try{ const res=await fetch(url); setSuggestions(await res.json()); } catch(e){console.error(e);}
  };

  // ── Telegram Widget ────────────────────────────────────────────────────
  const injectTelegramWidget = useCallback((containerId:string) => {
    if(tgWidgetInjected.current)return;
    const container=document.getElementById(containerId);
    if(!container)return;
    container.innerHTML=''; tgWidgetInjected.current=true;

    (window as any).onTelegramAuth = async (user:any) => {
      setIsLoading(true);
      try{
        const res=await fetch('/api/auth/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(user)});
        const result=await res.json();
        if(!result.ok)throw new Error(result.error||'Auth failed');
        await pb.collection('users').authWithPassword(result.email,result.password);
        setTgUser({id:user.id,first_name:user.first_name,last_name:user.last_name,username:user.username,photo_url:user.photo_url});
        const uid=pb.authStore.model?.id;
        if(uid){
          const ps=await pb.collection('profiles').getList(1,1,{filter:`user="${uid}"`});
          if(ps.items.length>0){setProfile(ps.items[0]);transitionTo('main');}else transitionTo('location');
        } else transitionTo('location');
      } catch(e){console.error('Widget auth error:',e);setIsLoading(false);}
    };

    const botUsername=process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if(!botUsername){console.error('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME not set');return;}
    const s=document.createElement('script');
    s.src='https://telegram.org/js/telegram-widget.js?22';
    s.setAttribute('data-telegram-login',botUsername);
    s.setAttribute('data-size','large');
    s.setAttribute('data-onauth','onTelegramAuth(user)');
    s.setAttribute('data-request-access','write');
    s.setAttribute('data-radius','14');
    s.async=true; container.appendChild(s);
  }, [transitionTo]);

  useEffect(()=>{
    if(step==='auth'){ tgWidgetInjected.current=false; setTimeout(()=>injectTelegramWidget('tg-widget-container'),250); }
  },[step,injectTelegramWidget]);

  // ── Save profile ───────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    setIsLoading(true);
    try{
      const uid=pb.authStore.isValid?pb.authStore.model?.id:null;
      if(!uid){transitionTo('main');setIsLoading(false);return;}
      const data={user:uid,account_type:accountType,lang:langRef.current,theme,city:userData.city,country:userData.country,country_code:userData.countryCode,lat:userData.lat||0,lon:userData.lon||0,telegram_id:tgUser?String(tgUser.id):'',search_radius:radius};
      if(profile?.id)await pb.collection('profiles').update(profile.id,data);
      else{const p=await pb.collection('profiles').create(data);setProfile(p);}
      transitionTo('main');
    } catch(e){console.error(e);transitionTo('main');} finally{setIsLoading(false);}
  }, [accountType,theme,userData,tgUser,profile,radius,transitionTo]);

  const fadeStyle:React.CSSProperties = { transition:'opacity 0.9s ease', opacity:isFadingOut?0:1 };

  // ── Reusable: Desktop Left Panel ───────────────────────────────────────
  const LeftPanel = ({ icon, title, desc, extra }:{icon:React.ReactNode;title:string;desc:string;extra?:React.ReactNode}) => (
    <div className="hidden md:flex w-5/12 flex-col items-center justify-center p-14 relative overflow-hidden shrink-0"
      style={{background:th.panelLeft}}>
      <div className="absolute inset-0" style={{background:th.shimmer}}/>
      <div className="absolute w-80 h-80 rounded-full border opacity-[0.07]"
        style={{borderColor:th.textAccent,top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6 opacity-80">{icon}</div>
        <h2 className="text-3xl font-black italic uppercase mb-3" style={{color:th.textAccent}}>{title}</h2>
        <p className="text-sm leading-relaxed max-w-xs" style={{color:th.textMuted}}>{desc}</p>
        {extra}
      </div>
    </div>
  );

  // ── Reusable: Back button ──────────────────────────────────────────────
  const BackBtn = ({to}:{to:string}) => (
    <button onClick={()=>transitionTo(to)}
      className="flex items-center gap-1 text-xs font-black uppercase mb-8 hover:opacity-60 transition-opacity w-fit"
      style={{color:th.textAccent}}>
      <Icons.ChevronLeft size={16}/>{t.back}
    </button>
  );

  // ── Reusable: Suggestion dropdown ──────────────────────────────────────
  const SuggestionDropdown = ({type}:{type:'country'|'city'}) => (
    activeSearch===type&&suggestions.length>0?(
      <div className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-2xl border max-h-56 overflow-y-auto"
        style={{background:'#0d1525',borderColor:th.cardBorder}}>
        {suggestions.map((item:any)=>(
          <div key={item.place_id}
            onMouseDown={()=>{
              const lat=parseFloat(item.lat),lon=parseFloat(item.lon);
              coordsRef.current={lat,lon};
              if(type==='country'){ setUserData(prev=>({...prev,country:item.display_name.split(',')[0],countryCode:item.address?.country_code?.toUpperCase()||'',lat,lon})); }
              else { setUserData(prev=>({...prev,city:item.display_name.split(',')[0],lat,lon})); }
              setSuggestions([]); setActiveSearch(null);
            }}
            className="p-4 hover:bg-blue-600 cursor-pointer text-sm font-bold border-b border-white/5 flex items-center gap-3 text-white">
            {type==='country'&&<img src={`https://flagcdn.com/${item.address?.country_code}.svg`} className="w-5 h-3 rounded" alt=""/>}
            {item.display_name}
          </div>
        ))}
      </div>
    ):null
  );

  const navItems = [
    {key:'catalog',       icon:Icons.LayoutGrid,    label:t.catalog},
    {key:'search',        icon:Icons.Search,        label:t.search},
    {key:'chats',         icon:Icons.MessageCircle, label:t.chats},
    {key:'notifications', icon:Icons.Bell,          label:t.notifications},
    {key:'settings',      icon:Icons.Settings,      label:t.settings},
  ];

  // ══════════════════════════════════════════════════════════════════════════
  if(step==='splash') return <SplashScreen isFadingOut={isFadingOut} tagline={t.tagline}/>;

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════════════════
  if(step==='auth') return (
    <div style={{...fadeStyle,background:th.bg}} className="min-h-screen flex">
      <LeftPanel
        icon={<Icons.Bot size={64} strokeWidth={1} style={{color:th.textAccent}}/>}
        title="COVCHEG.UA" desc={t.tagline}
        extra={
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {allCategories.map(cat=>(
              <div key={cat.id} className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border"
                style={{borderColor:th.cardBorder,background:'rgba(255,255,255,0.025)'}}>
                <cat.icon size={16} strokeWidth={1.5} style={{color:th.textAccent}}/>
                <span className="text-[8px] font-black uppercase" style={{color:th.textMuted}}>{t[cat.nameKey]}</span>
              </div>
            ))}
          </div>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-14" style={{background:th.panel}}>
        {/* Language grid */}
        <div className="w-full max-w-sm mb-6">
          <div className="grid grid-cols-6 gap-2">
            {languages.map(l=>(
              <button key={l.code} onClick={()=>handleLangChange(l.code)}
                className="p-2 rounded-xl flex flex-col items-center transition-all border-2"
                style={{borderColor:lang===l.code?'#3b82f6':th.cardBorder,background:lang===l.code?'rgba(59,130,246,0.12)':th.inputBg}}>
                <img src={`https://flagcdn.com/${l.iso}.svg`} className="w-6 h-4 object-cover rounded mb-1" alt=""/>
                <span className="text-[8px] font-black" style={{color:th.text}}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Auth card */}
        <div className="w-full max-w-sm rounded-[2rem] p-8 border" style={{background:th.card,borderColor:th.cardBorder}}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
              <Icons.Bot size={32} className="text-white"/>
            </div>
            <h2 className="text-2xl font-black italic uppercase" style={{color:th.textAccent}}>{t.auth}</h2>
            <p className="text-xs mt-1" style={{color:th.textMuted}}>COVCHEG.UA</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div id="tg-widget-container" className="flex justify-center w-full min-h-[50px]">
              {isLoading&&<Icons.Loader size={22} className="animate-spin mt-3" style={{color:th.textAccent}}/>}
            </div>
            <button onClick={()=>transitionTo('location')}
              className="w-full text-center text-xs font-black uppercase py-3 rounded-2xl hover:opacity-60 transition-opacity"
              style={{color:th.textMuted}}>{t.skip}</button>
          </div>
        </div>
        <button onClick={()=>setTheme(theme==='dark'?'light':'dark')}
          className="mt-6 p-3 rounded-2xl border-2 transition-all"
          style={{borderColor:th.cardBorder,background:th.inputBg}}>
          {theme==='dark'?<Icons.Sun size={18} className="text-yellow-400"/>:<Icons.Moon size={18} style={{color:th.textMuted}}/>}
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // LOCATION
  // ══════════════════════════════════════════════════════════════════════════
  if(step==='location') return (
    <div style={{...fadeStyle,background:th.bg}} className="min-h-screen flex">
      <LeftPanel icon={<Icons.MapPin size={64} strokeWidth={1} style={{color:th.textAccent}}/>} title={t.loc} desc={t.locDesc}/>
      <div className="flex-1 flex flex-col justify-center p-6 md:p-14" style={{background:th.panel}}>
        <BackBtn to="auth"/>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black italic uppercase md:hidden" style={{color:th.textAccent}}>{t.loc}</h2>
          <button onClick={requestGPS}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${isGpsLoading?'animate-pulse':''}`}
            style={{background:th.inputBg,borderColor:th.cardBorder,color:th.textAccent}}>
            <Icons.Navigation size={14}/>{isGpsLoading?'…':'GPS'}
          </button>
        </div>
        <div className="w-full max-w-lg space-y-3">
          {/* Country */}
          <div className="relative">
            <Icons.Globe className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{color:th.textMuted}}/>
            <input type="text" placeholder={t.country} value={userData.country}
              onFocus={()=>setActiveSearch('country')}
              onChange={e=>{setUserData({...userData,country:e.target.value,countryCode:'',lat:null,lon:null});coordsRef.current=null;fetchLoc(e.target.value,'country');}}
              className="w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold"
              style={{background:th.inputBg,borderColor:th.inputBorder,color:th.text}}/>
            <SuggestionDropdown type="country"/>
          </div>
          {/* City */}
          <div className="relative">
            <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{color:th.textMuted}}/>
            <input type="text" placeholder={t.city} value={userData.city}
              onFocus={()=>setActiveSearch('city')}
              onChange={e=>{setUserData({...userData,city:e.target.value,lat:null,lon:null});fetchLoc(e.target.value,'city');}}
              className="w-full p-5 pl-12 rounded-2xl border-2 outline-none font-bold"
              style={{background:th.inputBg,borderColor:th.inputBorder,color:th.text}}/>
            <SuggestionDropdown type="city"/>
          </div>
          {/* Radius */}
          <div className="p-5 rounded-2xl border-2" style={{background:th.inputBg,borderColor:th.inputBorder}}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase" style={{color:th.textAccent}}>{t.radius}</span>
              <span className="text-lg font-black text-blue-500">+{radius} km</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map(r=>(
                <button key={r} onClick={()=>setRadius(r)}
                  className="px-3 py-2 rounded-xl text-[10px] font-black transition-all border"
                  style={{background:radius===r?'#2563eb':th.inputBg,color:radius===r?'#fff':th.textMuted,borderColor:radius===r?'#3b82f6':th.cardBorder}}>
                  +{r}
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>transitionTo('account_type')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {t.next}<Icons.ChevronRight size={22}/>
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ACCOUNT TYPE
  // ══════════════════════════════════════════════════════════════════════════
  if(step==='account_type') return (
    <div style={{...fadeStyle,background:th.bg}} className="min-h-screen flex">
      <LeftPanel icon={<Icons.Users size={64} strokeWidth={1} style={{color:th.textAccent}}/>} title={t.accountType} desc={t.accountTypeDesc}/>
      <div className="flex-1 flex flex-col justify-center p-6 md:p-14" style={{background:th.panel}}>
        <BackBtn to="location"/>
        <h2 className="text-3xl font-black italic uppercase mb-8 md:hidden" style={{color:th.textAccent}}>{t.accountType}</h2>
        <div className="w-full max-w-md space-y-4">
          {([
            {key:'consumer',Icon:Icons.User,     label:t.consumer,desc:t.consumerDesc},
            {key:'business',Icon:Icons.Building2,label:t.business,desc:t.businessDesc},
          ] as any[]).map(opt=>(
            <button key={opt.key} onClick={()=>setAccountType(opt.key)}
              className="w-full p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{borderColor:accountType===opt.key?'#3b82f6':th.cardBorder,background:accountType===opt.key?'rgba(59,130,246,0.1)':th.card}}>
              <div className="p-4 rounded-2xl shrink-0" style={{background:accountType===opt.key?'#2563eb':'rgba(59,130,246,0.15)'}}>
                <opt.Icon size={28} className="text-white"/>
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-lg uppercase" style={{color:th.text}}>{opt.label}</div>
                <div className="text-xs mt-0.5" style={{color:th.textMuted}}>{opt.desc}</div>
              </div>
              {accountType===opt.key&&<Icons.CheckCircle size={24} className="text-blue-500 shrink-0"/>}
            </button>
          ))}
          <button onClick={saveProfile} disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            {isLoading?<Icons.Loader size={22} className="animate-spin"/>:<Icons.CheckCircle size={22}/>}
            {isLoading?'…':t.next}
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{...fadeStyle,background:th.bg}} className="min-h-screen flex flex-col">

      {/* ── DESKTOP ─────────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 flex flex-col py-8 px-3 border-r shrink-0" style={{background:th.sidebarBg,borderColor:th.cardBorder}}>
          <div className="px-4 mb-8">
            <h1 className="text-xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <p className="text-[9px] font-semibold tracking-widest mt-0.5" style={{color:th.textMuted}}>AI HELPER</p>
          </div>
          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map(item=>(
              <button key={item.key} onClick={()=>setActiveNav(item.key)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black uppercase transition-all text-left"
                style={{background:activeNav===item.key?'rgba(59,130,246,0.14)':'transparent',color:activeNav===item.key?th.textAccent:th.textMuted,borderLeft:activeNav===item.key?'3px solid #3b82f6':'3px solid transparent'}}>
                <item.icon size={17}/>{item.label}
              </button>
            ))}
          </nav>
          <div className="px-2 space-y-3">
            {tgUser?(
              <div className="px-4 py-4 rounded-2xl border" style={{borderColor:th.cardBorder,background:th.card}}>
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
            ):(
              <button onClick={()=>transitionTo('auth')}
                className="w-full px-4 py-3 rounded-2xl text-xs font-black uppercase text-blue-400 border border-blue-900/40 hover:bg-blue-600/10 transition-all">
                {t.auth}
              </button>
            )}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-2xl font-black uppercase flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95">
              <Icons.Plus size={16} strokeWidth={3}/>{t.postAd}
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-4 px-8 py-4 border-b shrink-0" style={{background:th.panel,borderColor:th.cardBorder}}>
            <div className="flex gap-1 p-1 rounded-2xl border" style={{background:th.inputBg,borderColor:th.cardBorder}}>
              {['city','country','world'].map(s=>(
                <button key={s} onClick={()=>setScope(s)}
                  className="px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all"
                  style={{background:scope===s?'#2563eb':'transparent',color:scope===s?'#fff':th.textMuted}}>
                  {s==='city'?t.cityBtn:s==='country'?t.countryBtn:t.worldBtn}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
              style={{background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.2)'}}>
              <Icons.MapPin size={14} className="text-blue-400"/>
              <span className="text-[11px] font-black uppercase text-blue-400">{userData.city||t.selectCity}</span>
            </div>
            <div className="ml-auto"/>
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')}
              className="p-3 rounded-2xl border transition-all" style={{borderColor:th.cardBorder,background:th.inputBg}}>
              {theme==='dark'?<Icons.Sun size={16} className="text-yellow-400"/>:<Icons.Moon size={16} style={{color:th.textMuted}}/>}
            </button>
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-4 xl:grid-cols-6 gap-4 max-w-5xl">
              {allCategories.map(cat=>(
                <button key={cat.id}
                  className="group flex flex-col items-center justify-center rounded-[2rem] p-6 border transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{background:th.card,borderColor:th.cardBorder}}>
                  <div className={`${cat.color} mb-3 rounded-2xl p-4 text-white shadow-lg`}><cat.icon size={28}/></div>
                  <span className="text-[11px] font-black uppercase text-center leading-tight tracking-tight" style={{color:th.text}}>
                    {t[cat.nameKey]||cat.nameKey}
                  </span>
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:hidden min-h-screen pb-28">
        <header className="rounded-b-[2.5rem] border-b px-5 pt-12 pb-4 shadow" style={{background:th.panel,borderColor:th.cardBorder}}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">COVCHEG.UA</h1>
            <div className="flex items-center gap-2">
              {tgUser&&(
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
                  style={{background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.2)'}}>
                  {tgUser.photo_url&&<img src={tgUser.photo_url} className="w-6 h-6 rounded-full" alt=""/>}
                  <span className="text-[10px] font-black text-blue-400">{tgUser.first_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border"
                style={{background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.2)'}}>
                <Icons.MapPin size={12} className="text-blue-400"/>
                <span className="text-[10px] font-black uppercase text-blue-400">{userData.city||t.selectCity}</span>
              </div>
              {/* Theme toggle on mobile */}
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')}
                className="p-2 rounded-xl border" style={{borderColor:th.cardBorder,background:th.inputBg}}>
                {theme==='dark'?<Icons.Sun size={14} className="text-yellow-400"/>:<Icons.Moon size={14} style={{color:th.textMuted}}/>}
              </button>
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-2xl" style={{background:th.inputBg}}>
            {['city','country','world'].map(s=>(
              <button key={s} onClick={()=>setScope(s)}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                style={{background:scope===s?'#2563eb':'transparent',color:scope===s?'#fff':th.textMuted}}>
                {s==='city'?t.cityBtn:s==='country'?t.countryBtn:t.worldBtn}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 grid grid-cols-3 gap-3">
          {allCategories.map(cat=>(
            <button key={cat.id}
              className="flex flex-col items-center justify-center rounded-[2.5rem] p-5 border active:scale-95 transition-all"
              style={{background:th.card,borderColor:th.cardBorder}}>
              <div className={`${cat.color} mb-3 rounded-2xl p-3 text-white shadow-lg`}><cat.icon size={24}/></div>
              <span className="text-[9px] font-black uppercase text-center leading-none tracking-tighter" style={{color:th.text}}>
                {t[cat.nameKey]||cat.nameKey}
              </span>
            </button>
          ))}
        </main>

        <nav className="fixed bottom-5 left-4 right-4 rounded-[2.5rem] shadow-2xl px-5 py-3 flex items-center justify-around border backdrop-blur-xl"
          style={{background:th.navBg,borderColor:th.cardBorder}}>
          {navItems.slice(0,2).map(item=>(
            <button key={item.key} onClick={()=>setActiveNav(item.key)}
              className="flex flex-col items-center gap-1"
              style={{color:activeNav===item.key?th.textAccent:th.textMuted}}>
              <item.icon size={20}/>
              <span className="text-[8px] font-black uppercase">{item.label}</span>
            </button>
          ))}
          <div className="flex flex-col items-center -mt-8">
            <button className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 active:scale-95 transition-all"
              style={{borderColor:th.bg}}>
              <Icons.Plus size={28} strokeWidth={3}/>
            </button>
          </div>
          {navItems.slice(2,4).map(item=>(
            <button key={item.key} onClick={()=>setActiveNav(item.key)}
              className="flex flex-col items-center gap-1"
              style={{color:activeNav===item.key?th.textAccent:th.textMuted}}>
              <item.icon size={20}/>
              <span className="text-[8px] font-black uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
