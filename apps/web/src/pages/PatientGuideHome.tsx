import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight,
  CircleHelp, Footprints, Hand, Headphones, HeartPulse, Info,
  PackageCheck, Ruler, Search, ShieldCheck, ShoppingCart, Stethoscope,
  Truck, X, BadgeCheck, Shield, ClipboardList, PersonStanding
} from 'lucide-react';
import { categories, products, formatPrice } from '../data/products';
import './PatientGuideHome.css';
import {readGuideHome,GUIDE_EVENT} from '../data/guideContent';

type GuideZone = { id: string; ro: string; ru: string; detailRo: string; detailRu: string; img: string };
const img = (file: string) => `/ortomed/images/${file}.webp`;
const zones: GuideZone[] = [
  {id:'knee',ro:'Genunchi',ru:'Колено',detailRo:'Orteze pentru stabilitate, protecție și recuperare.',detailRu:'Ортезы для стабилизации, защиты и восстановления.',img:img('product-1')},
  {id:'ankle',ro:'Gleznă și picior',ru:'Голеностоп и стопа',detailRo:'Orteze pentru stabilizare și protecție după traumatisme.',detailRu:'Ортезы для стабилизации и защиты после травм.',img:img('product-2')},
  {id:'hand',ro:'Mână și încheietură',ru:'Кисть и запястье',detailRo:'Orteze pentru susținere, protecție și recuperare.',detailRu:'Ортезы для поддержки, защиты и восстановления.',img:img('product-5')},
  {id:'back',ro:'Spate și lombar',ru:'Спина и поясница',detailRo:'Suporturi lombare pentru susținerea spatelui.',detailRu:'Пояса и корсеты для поддержки спины.',img:img('product-3')},
  {id:'cap-gat',ro:'Gât și claviculă',ru:'Шея и ключица',detailRo:'Orteze cervicale pentru susținere și protecție.',detailRu:'Шейные ортезы для поддержки и фиксации.',img:img('product-9')},
  {id:'compression',ro:'Ciorapi compresivi',ru:'Компрессионный трикотаж',detailRo:'Mărimi, clase și mod de utilizare.',detailRu:'Размеры, классы и особенности применения.',img:img('product-4')},
  {id:'insoles',ro:'Tălpi ortopedice',ru:'Ортопедические стельки',detailRo:'Suport plantar și confort la mers.',detailRu:'Поддержка стопы и комфорт при ходьбе.',img:img('product-10')},
  {id:'reabilitare',ro:'Reabilitare',ru:'Реабилитация',detailRo:'Accesorii pentru recuperare și mobilitate.',detailRu:'Изделия для реабилитации и мобильности.',img:img('product-6')},
];
const route = (id:string) => id === 'knee' ? '/ghid-pacient/orteze-genunchi' : `/ghid-pacient/categorie/${encodeURIComponent(id)}`;
const problems = [
  {id:'knee',ro:'Durere de genunchi',ru:'Боль в колене',detailRo:'Află ce tipuri de orteze există și cum diferă susținerea.',detailRu:'Узнайте о видах ортезов и уровнях поддержки.',pic:img('product-1')},
  {id:'ankle',ro:'Instabilitate gleznă',ru:'Нестабильность голеностопа',detailRo:'Modele pentru susținere, protecție și prevenirea recidivelor.',detailRu:'Изделия для поддержки и защиты.',pic:img('product-2')},
  {id:'back',ro:'Durere lombară',ru:'Боль в пояснице',detailRo:'Suporturi lombare și recomandări generale de utilizare.',detailRu:'Поясничные корсеты и правила применения.',pic:img('product-3')},
  {id:'compression',ro:'Umflarea picioarelor',ru:'Отёки ног',detailRo:'Ghid despre ciorapi compresivi și măsurători.',detailRu:'О компрессионном трикотаже и измерениях.',pic:img('product-4')},
  {id:'reabilitare',ro:'Recuperare după traumă',ru:'Восстановление после травмы',detailRo:'Produse pentru recuperare conform recomandării specialistului.',detailRu:'Изделия для восстановления по назначению специалиста.',pic:img('product-6')},
  {id:'hand',ro:'Durere la încheietură',ru:'Боль в запястье',detailRo:'Orteze pentru susținere și protecție.',detailRu:'Ортезы для поддержки и защиты.',pic:img('product-5')},
];
const faq = [
  {q:'Cum aleg orteza potrivită pentru problema mea?',r:'Как выбрать подходящий ортез?',a:'Alege mai întâi zona corpului, apoi compară modelele cu recomandarea medicului. Ghidul nu stabilește diagnostice.',b:'Выберите область тела и сравните модели с рекомендацией врача. Гид не ставит диагноз.'},
  {q:'Cum știu ce mărime mi se potrivește?',r:'Как определить свой размер?',a:'Consultă tabelul de măsuri al producătorului pentru modelul exact. Nu toate ortezele folosesc aceleași dimensiuni.',b:'Используйте таблицу размеров производителя конкретной модели: системы измерения различаются.'},
  {q:'Cât timp pot purta o orteză?',r:'Как долго можно носить ортез?',a:'Depinde de tipul produsului și de indicația specialistului. Respectă instrucțiunile producătorului.',b:'Зависит от изделия и медицинских рекомендаций. Соблюдайте инструкцию производителя.'},
  {q:'Pot folosi produsele ortopedice și pentru prevenție?',r:'Можно ли использовать изделия для профилактики?',a:'Unele produse sunt destinate susținerii în activități zilnice, dar indicațiile diferă de la model la model.',b:'Некоторые изделия предназначены для поддержки при ежедневной активности, но показания зависят от модели.'},
  {q:'Ciorapii compresivi sunt indicați doar în caz de varice?',r:'Компрессионные чулки нужны только при варикозе?',a:'Indicațiile sunt mai variate. Clasa de compresie medicală se alege potrivit recomandării specialistului.',b:'Показания шире. Медицинский класс компрессии следует выбирать по рекомендации специалиста.'},
];
function ZoneIcon({id, size=23}:{id:string;size?:number}){
  if(id==='ankle'||id==='insoles'||id==='compression') return <Footprints size={size}/>;
  if(id==='hand')return <Hand size={size}/>;
  if(id==='knee')return <Activity size={size}/>;
  if(id==='reabilitare')return <HeartPulse size={size}/>;
  if(id==='cap-gat')return <PersonStanding size={size}/>;
  return <ShieldCheck size={size}/>;
}
export default function PatientGuideHome(){
  const {i18n}=useTranslation(); const ru=i18n.language.toLowerCase().startsWith('ru');
  const t=(ro:string,russian:string)=>ru?russian:ro;
  const [selected,setSelected]=useState('knee');
  const [faqOpen,setFaqOpen]=useState<number|null>(null);
  const [query,setQuery]=useState('');
  const [rev,setRev]=useState(0);
  useEffect(()=>{const fn=()=>setRev(v=>v+1);window.addEventListener('ortomed-catalog-updated',fn);window.addEventListener('ortomed-categories-updated',fn);window.addEventListener(GUIDE_EVENT,fn);return()=>{window.removeEventListener('ortomed-catalog-updated',fn);window.removeEventListener('ortomed-categories-updated',fn);window.removeEventListener(GUIDE_EVENT,fn)}},[]);
  const availableCategories=useMemo(()=>[...categories],[rev]);
  const availableProducts=useMemo(()=>products.slice(0,5),[rev]);
  const found=useMemo(()=>query.trim()?products.filter(p=>p.id.toLowerCase().includes(query.trim().toLowerCase())||(ru?p.nameRu:p.nameRo).toLowerCase().includes(query.trim().toLowerCase())).slice(0,5):[],[query,ru,rev]);
  const c=zones.find(z=>z.id===selected)||zones[0];
  const customHome=readGuideHome();
  const guideName=(z:GuideZone)=>ru?z.ru:z.ro;
  const select=(id:string)=>{setSelected(id);document.getElementById('opg-zones')?.scrollIntoView({behavior:'smooth',block:'nearest'})};
  return <main className="opg24">
    <section className="opg24-hero"><div className="opg24-hero-inner">
      <div className="opg24-hero-copy"><em>{customHome?t(customHome.eyebrow.ro,customHome.eyebrow.ru):t('Informație, orientare, alegerea corectă','Информация, рекомендации, правильный выбор')}</em><h1>{customHome?t(customHome.title.ro,customHome.title.ru):t('Ghidul pacientului','Гид пациента')}</h1><p>{customHome?t(customHome.intro.ro,customHome.intro.ru):t('Identifică rapid produsele ortopedice potrivite, în funcție de zona corpului, simptomele tale și nevoile zilnice.','Найдите ортопедические изделия по области тела, потребностям и рекомендации специалиста.')}</p>
        <div className="opg24-trust"><span><ShieldCheck/>{t('Recomandări de specialitate','Советы специалистов')}</span><span><BookOpen/>{t('Ghiduri practice','Практические гиды')}</span><span><Check/>{t('Alegere încrezătoare','Уверенный выбор')}</span></div>
        <a className="opg24-cta" href="#opg-zones">{t('Explorează ghidul','Изучить гид')} <ArrowRight size={19}/></a>
      </div><div className="opg24-hero-art" aria-label={t('Anatomie interactivă','Интерактивная анатомия')}><img src={customHome?.heroImage||"/ortomed/guide/hero-anatomy-reference.webp"} alt=""/><Link to={route('knee')} className="opg24-hero-hit hit-knee" aria-label={t('Genunchi','Колено')}/><Link to={route('back')} className="opg24-hero-hit hit-back" aria-label={t('Spate','Спина')}/><Link to={route('ankle')} className="opg24-hero-hit hit-ankle" aria-label={t('Gleznă','Голеностоп')}/><Link to={route('hand')} className="opg24-hero-hit hit-hand" aria-label={t('Mână','Кисть')}/></div>
    </div></section>
    <nav className="opg24-fast" aria-label={t('Zonele corpului','Области тела')}><div className="opg24-container opg24-fast-track">{zones.map(z=><button key={z.id} onClick={()=>select(z.id)} className={selected===z.id?'selected':''}><ZoneIcon id={z.id}/><span>{guideName(z)}</span></button>)}</div></nav>
    <div className="opg24-container">
    <section id="opg-zones" className="opg24-map">
      <div className="opg24-map-copy"><small>{t('Anatomie interactivă','Интерактивная анатомия')}</small><h2>{t('Alege zona care te preocupă','Выберите область тела')}</h2><p>{t('Explorează harta corpului, descoperă cele mai frecvente nevoi și vezi recomandările ORTOMED pentru fiecare zonă.','Исследуйте карту тела и узнайте о видах изделий для каждой области.')}</p>
      <ul><li><Check/>{t('Orteze și suporturi de susținere','Ортезы и поддерживающие изделия')}</li><li><Check/>{t('Produse pentru recuperare','Изделия для восстановления')}</li><li><Check/>{t('Protecție și prevenție','Защита и профилактика')}</li><li><Check/>{t('Soluții pentru confort zilnic','Комфорт на каждый день')}</li></ul></div>
      <div className="opg24-map-left">{[zones[4],zones[2],zones[0],zones[1]].map(z=><button className={'opg24-map-card '+(selected===z.id?'active':'')} onClick={()=>select(z.id)} key={z.id}><img src={z.img} alt=""/><span><b>{guideName(z)}</b><small>{ru?z.detailRu:z.detailRo}</small></span><ChevronRight size={18}/></button>)}</div>
      <div className="opg24-body" aria-label={t('Harta corpului','Схема тела')}><img src="/ortomed/guide/body-anatomy-reference.webp" alt=""/><button className="opg24-point point-neck" onClick={()=>select('cap-gat')} aria-label={t('Gât','Шея')}/><button className="opg24-point point-hand" onClick={()=>select('hand')} aria-label={t('Mână','Кисть')}/><button className="opg24-point point-back" onClick={()=>select('back')} aria-label={t('Spate','Спина')}/><button className="opg24-point point-knee" onClick={()=>select('knee')} aria-label={t('Genunchi','Колено')}/><button className="opg24-point point-ankle" onClick={()=>select('ankle')} aria-label={t('Gleznă','Голеностоп')}/></div>
      <div className="opg24-map-right">{[zones[3],zones[5],zones[7]].map(z=><button className={'opg24-map-card '+(selected===z.id?'active':'')} onClick={()=>select(z.id)} key={z.id}><img src={z.img} alt=""/><span><b>{guideName(z)}</b><small>{ru?z.detailRu:z.detailRo}</small></span><ChevronRight size={18}/></button>)}</div>
      <div className="opg24-map-bottom"><span>{t('Zona selectată:','Выбрана область:')} <strong>{guideName(c)}</strong></span><Link to={route(c.id)}>{t('Vezi ghidul','Открыть руководство')} <ArrowRight size={17}/></Link></div>
    </section>
    <section className="opg24-section"><div className="opg24-heading"><h2>{t('Alege după problemă','Выбор по задаче')}</h2><a href="#opg-guides">{t('Vezi toate situațiile','Все руководства')} <ArrowRight size={16}/></a></div><div className="opg24-problems">{problems.map(p=><Link key={p.id} to={route(p.id)} className="opg24-problem"><img src={p.pic} alt=""/><div><b>{ru?p.ru:p.ro}</b><p>{ru?p.detailRu:p.detailRo}</p></div><span className="opg24-circ"><ArrowRight size={16}/></span></Link>)}</div></section>
    <section className="opg24-section opg24-steps"><h2>{t('Cum alegi corect','Как выбрать правильно')}</h2><div className="opg24-steps-row">{[
      {i:<PersonStanding/>,num:'1',ro:'Identifică zona',ru:'Определите область',dro:'Alege zona corpului care te preocupă.',dru:'Выберите область тела.'},
      {i:<Ruler/>,num:'2',ro:'Măsoară corect',ru:'Измерьте правильно',dro:'Urmează ghidul de măsurare pentru model.',dru:'Следуйте схеме конкретной модели.'},
      {i:<ClipboardList/>,num:'3',ro:'Compară nivelul de susținere',ru:'Сравните уровень поддержки',dro:'Alege gradul de fixare indicat de specialist.',dru:'Сравните изделия по назначению.'},
      {i:<Headphones/>,num:'4',ro:'Cere sfatul consultantului',ru:'Уточните у консультанта',dro:'Verifică alegerea cu echipa ORTOMED.',dru:'Уточните характеристики у ORTOMED.'}
    ].map((s,i)=><div className="opg24-step" key={s.num}><span className="opg24-step-icon">{s.i}</span><div><strong>{s.num} <span>{ru?s.ru:s.ro}</span></strong><p>{ru?s.dru:s.dro}</p></div>{i!==3&&<ChevronRight className="opg24-step-next"/>}</div>)}</div></section>
    <section className="opg24-section" id="opg-guides"><div className="opg24-heading"><h2>{t('Ghiduri recomandate','Рекомендуемые руководства')}</h2><a href="#opg-zones">{t('Vezi toate ghidurile','Все руководства')} <ArrowRight size={16}/></a></div><div className="opg24-guide-grid">{[zones[0],zones[1],zones[3],zones[5]].map(z=><article className="opg24-guide" key={z.id}><Link to={route(z.id)}><img src={z.img} alt={guideName(z)}/></Link><div><h3>{t('Ghid pentru ','Руководство: ')}{guideName(z).toLowerCase()}</h3><p>{ru?z.detailRu:z.detailRo}</p><Link to={route(z.id)} className="opg24-small-btn">{t('Vezi ghidul','Читать гид')} <ArrowRight size={15}/></Link></div></article>)}</div></section>
    <section className="opg24-measure"><div className="opg24-measure-illustration"><Ruler size={57}/></div><div><h2>{t('Nu ești sigur ce mărime alegi?','Не уверены в размере?')}</h2><p>{t('Te ajutăm să măsori corect și să găsești produsul potrivit pentru nevoile tale.','Поможем проверить размер и подобрать изделие.')}</p></div><Link to="/solicita-consultatie" className="opg24-cta"><Headphones size={17}/>{t('Consultanță gratuită','Консультация')}</Link><a href="#opg-zones" className="opg24-outline"><Ruler size={16}/>{t('Ghid de măsurare','Подбор размера')}</a></section>
    <section className="opg24-section"><div className="opg24-heading"><h2>{t('Produse recomandate','Рекомендуемые товары')}</h2><Link to="/produse">{t('Vezi toate produsele','Все товары')} <ArrowRight size={16}/></Link></div><div className="opg24-products">{availableProducts.map(p=><Link className="opg24-product" to={`/produs/${encodeURIComponent(p.id)}`} key={p.id}><div className="opg24-prod-img"><img src={p.image} alt={ru?p.nameRu:p.nameRo}/></div><div className="opg24-prod-info"><b>{ru?p.nameRu:p.nameRo}</b><span>{t('Cod produs','Код товара')}: <strong>{p.id}</strong></span><span className="opg24-stars">★★★★★</span><strong className="opg24-price">{formatPrice(p.price)}</strong><span className="opg24-cart"><ShoppingCart size={16}/>{t('Vezi produsul','Открыть товар')}</span></div></Link>)}</div></section>
    <section className="opg24-section opg24-faq"><div className="opg24-faq-intro"><CircleHelp size={50}/><div><h2>{t('Întrebări frecvente','Частые вопросы')}</h2><p>{t('Ai întrebări despre alegerea sau utilizarea produselor ortopedice?','Вопросы о выборе или использовании изделий?')}</p></div></div><div className="opg24-faq-items">{faq.map((f,i)=><div key={i}><button aria-expanded={faqOpen===i} onClick={()=>setFaqOpen(faqOpen===i?null:i)}>{ru?f.r:f.q}<ChevronDown size={18} className={faqOpen===i?'turned':''}/></button>{faqOpen===i&&<p>{ru?f.b:f.a}</p>}</div>)}</div></section>
    <section className="opg24-search"><div><h2>{t('Ai primit un cod de produs de la medic?','Врач дал код товара?')}</h2><p>{t('Caută produsul după cod (SKU) sau denumire.','Найдите изделие по коду SKU или названию.')}</p></div><div className="opg24-search-wrap"><label><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Ex.: ORT-001 sau HL52069','Например, HL52069')}/>{query&&<button aria-label={t('Șterge','Очистить')} onClick={()=>setQuery('')}><X size={16}/></button>}</label>{query.trim()&&<div className="opg24-results">{found.length?found.map(p=><Link to={`/produs/${encodeURIComponent(p.id)}`} key={p.id}><strong>{p.id}</strong> {ru?p.nameRu:p.nameRo}<ArrowRight size={15}/></Link>):<p>{t('Nu am găsit produse.','Товары не найдены.')}</p>}</div>}</div></section>
    <section className="opg24-contact"><div className="opg24-doctor"><Stethoscope size={62}/></div><h2>{t('Contactează ORTOMED pentru sfaturi personalizate','Свяжитесь с ORTOMED за консультацией')}</h2><p>{t('Specialiștii noștri te ajută să verifici caracteristicile produsului și alegerea mărimii.','Поможем уточнить характеристики изделия и выбрать размер.')}</p><Link to="/solicita-consultatie">{t('Solicită consultație','Получить консультацию')} <ArrowRight size={17}/></Link></section>
    <div className="opg24-extra"><Info size={15}/><span>{t('Informațiile sunt orientative și nu înlocuiesc consultația medicală sau instrucțiunile producătorului.','Информация справочная и не заменяет консультацию врача или инструкцию производителя.')}</span></div>
    <div className="opg24-other"><span>{t('Categorii suplimentare','Дополнительные категории')}</span>{availableCategories.filter(cat=>!zones.some(z=>z.id===cat.id)).map(cat=><Link key={cat.id} to={route(cat.id)}>{ru?cat.ru:cat.ro}<ArrowRight size={13}/></Link>)}</div>
    </div>
    <div className="opg24-usps"><div className="opg24-container"><span><Shield/> {t('Produse originale și certificate','Оригинальные изделия')}</span><span><Truck/> {t('Livrare în Moldova','Доставка по Молдове')}</span><span><PackageCheck/> {t('Retur conform condițiilor','Возврат по правилам')}</span><span><BadgeCheck/> {t('Consultanță pentru alegere','Помощь с выбором')}</span></div></div>
  </main>
}
