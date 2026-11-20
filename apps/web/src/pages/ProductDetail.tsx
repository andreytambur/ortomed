import {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Headphones, Heart, Info, Minus, Package, Plus, Ruler, ShieldCheck, ShoppingCart, Star, Truck} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import {categories, formatPrice, products} from '../data/products';
import type {Product} from '../data/products';
import {useShopStore} from '../store/useShopStore';
import './ProductDetail.css';
import '../styles/cart-feedback.css';

type Tab = 'description'|'specifications'|'sizes'|'delivery'|'reviews';
const MAX_QTY = 20;

function Detail({product}:{product:Product}) {
  const {i18n,t} = useTranslation();
  const ru = i18n.language.startsWith('ru');
  const txt = (ro:string, russian:string) => ru ? russian : ro;
  const productName = ru ? product.nameRu : product.nameRo;
  const [size,setSize] = useState(product.sizes.includes('M') ? 'M' : product.sizes[0]);
  const [side,setSide] = useState<'Universal'|'Stâng'|'Drept'>('Universal');
  const [qty,setQty] = useState(1);
  const [photo,setPhoto] = useState(0);
  const [tab,setTab] = useState<Tab>('description');
  const [added,setAdded] = useState(false);
  const addLock = useRef(false);
  const addToCart = useShopStore(s=>s.addToCart);
  const toggleFavorite = useShopStore(s=>s.toggleFavorite);
  const favorite = useShopStore(s=>s.favorites.includes(product.id));
  const category = categories.find(c=>c.id===product.category);
  const related = products.filter(p=>p.id!==product.id && p.category===product.category).concat(products.filter(p=>p.id!==product.id && p.category!==product.category)).slice(0,4);
  // Temporary demo gallery: cropped views of the supplied product photo until the product DB stores real photo sets.
  const views = [
    {label:txt('Vedere principală','Основной вид'),position:'center center',scale:1},
    {label:txt('Detaliu produs','Детали изделия'),position:'center 30%',scale:1.65},
    {label:txt('Vedere apropiată','Крупный план'),position:'55% 70%',scale:1.28},
    {label:txt('Material și fixare','Материал и фиксация'),position:'40% 45%',scale:1.9},
  ];
  const [notice,setNotice] = useState(false);
  useEffect(()=>{if (!added) return; const tm=setTimeout(()=>{setAdded(false);addLock.current=false;},1800); return ()=>clearTimeout(tm);},[added]);
  const add = () => {
    if (addLock.current) return;
    addLock.current=true;
    // Existing demo cart key contains the side when relevant; the cart store is unchanged.
    const cartSize = side==='Universal' ? size : `${size} / ${side==='Stâng' ? txt('Stâng','Левый') : txt('Drept','Правый')}`;
    for (let i=0;i<qty;i++) addToCart(product.id,cartSize);
    setAdded(true);
    setNotice(true);
  };
  const tabs:{id:Tab;ro:string;ru:string}[]=[
    {id:'description',ro:'Descriere',ru:'Описание'},
    {id:'specifications',ro:'Specificații',ru:'Характеристики'},
    {id:'sizes',ro:'Mărimi',ru:'Размеры'},
    {id:'delivery',ro:'Livrare și retur',ru:'Доставка и возврат'},
    {id:'reviews',ro:'Recenzii',ru:'Отзывы'},
  ];
  return <main className="ort-detail-page">
    <div className="container ort-detail-crumb"><Link to="/">{t('home')}</Link><ChevronRight size={13}/><Link to="/produse">{t('products')}</Link><ChevronRight size={13}/><span>{productName}</span></div>
    <div className="container ort-detail-primary">
      <section className="ort-detail-gallery" aria-label={txt('Galerie foto produs','Фотографии товара')}>
        <div className="ort-detail-mainphoto">
          {product.badge && <span className="ort-detail-badge">{product.badge==='best'?'Bestseller':product.badge==='new'?txt('Nou','Новинка'):txt('Ofertă','Скидка')}</span>}
          <button type="button" className={`ort-detail-heart ${favorite?'selected':''}`} onClick={()=>toggleFavorite(product.id)} aria-label={txt('Favorite','В избранное')} aria-pressed={favorite}><Heart size={23} fill={favorite?'currentColor':'none'}/></button>
          <div className="ort-detail-photo-frame"><img src={product.image} alt={`${productName} — ${views[photo].label}`} style={{objectPosition:views[photo].position,transform:`scale(${views[photo].scale})`}}/></div>
          <button type="button" className="ort-detail-photo-arrow left" aria-label={txt('Fotografia precedentă','Предыдущее фото')} onClick={()=>setPhoto((p)=>(p+views.length-1)%views.length)}><ChevronLeft/></button>
          <button type="button" className="ort-detail-photo-arrow right" aria-label={txt('Fotografia următoare','Следующее фото')} onClick={()=>setPhoto((p)=>(p+1)%views.length)}><ChevronRight/></button>
        </div>
        <div className="ort-detail-thumbnails">{views.map((v,i)=><button type="button" key={i} className={i===photo?'active':''} onClick={()=>setPhoto(i)} aria-label={v.label} aria-pressed={photo===i}><img src={product.image} alt="" style={{objectPosition:v.position,transform:`scale(${v.scale})`}}/></button>)}</div>
        <p className="ort-detail-demo-caption">{txt('Fotografiile sunt ilustrative; unghiurile suplimentare sunt decupaje de test.', 'Фотографии демонстрационные; дополнительные ракурсы пока показаны как фрагменты основного фото.')}</p>
      </section>
      <section className="ort-detail-purchase">
        <h1>{productName}</h1>
        <div className="ort-detail-meta"><span className="ort-detail-rating" aria-label={txt('Evaluare demonstrativă','Демонстрационный рейтинг')}><Star/><Star/><Star/><Star/><Star/></span><span className="ort-detail-reviews">{txt('Recenzii indisponibile','Отзывы пока недоступны')}</span><span className="ort-detail-code">{txt('Cod produs','Код товара')}: {product.id}</span></div>
        <div className="ort-detail-pricebar"><span className="ort-detail-stock"><CheckCircle2 size={16}/>{txt('Disponibilitate de confirmat','Наличие уточняется')}</span><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}</div>
        <p className="ort-detail-lead">{txt('Produs ortopedic selectat pentru susținere, confort și mobilitate. Consultă un specialist pentru alegerea corectă a mărimii și a modului de utilizare.', 'Ортопедическое изделие для поддержки, комфорта и свободы движения. Для правильного выбора размера и режима применения проконсультируйтесь со специалистом.')}</p>
        <ul className="ort-detail-benefits"><li><CheckCircle2/>{txt('Suport adaptat activităților zilnice','Поддержка при повседневной активности')}</li><li><CheckCircle2/>{txt('Alegere individuală a mărimii','Индивидуальный выбор размера')}</li><li><CheckCircle2/>{txt('Consultanță pentru utilizare corectă','Консультация по правильному применению')}</li><li><CheckCircle2/>{txt('Livrare disponibilă în Moldova','Доставка по Молдове')}</li></ul>
        <div className="ort-detail-controls"><div className="ort-detail-control-label"><strong>{txt('Mărime','Размер')}</strong><button type="button" onClick={()=>{setTab('sizes');document.getElementById('ort-product-details')?.scrollIntoView({behavior:'smooth',block:'start'});}}><Ruler size={15}/>{txt('Ghid de mărimi','Подбор размера')}</button></div><div className="ort-detail-options">{product.sizes.map(s=><button key={s} type="button" className={size===s?'selected':''} onClick={()=>setSize(s)} aria-pressed={size===s}>{s}</button>)}</div></div>
        {(product.category==='knee'||product.category==='ankle'||product.category==='hand')&&<div className="ort-detail-controls"><div className="ort-detail-control-label"><strong>{txt('Pentru picior / mână','Сторона изделия')}</strong><Info size={15} aria-label={txt('Verifică disponibilitatea fiecărui model cu consultantul','Доступность варианта уточняйте у консультанта')}/></div><div className="ort-detail-options ort-detail-side">{(['Universal','Stâng','Drept'] as const).map(v=><button type="button" key={v} className={side===v?'selected':''} onClick={()=>setSide(v)} aria-pressed={side===v}>{v==='Universal'?txt('Universal','Универсальный'):v==='Stâng'?txt('Stâng','Левый'):txt('Drept','Правый')}</button>)}</div><small className="ort-detail-side-note">{txt('Opțiunile sunt demonstrative și vor fi verificate cu stocul real.', 'Варианты демонстрационные, позднее они будут проверяться по реальному складу.')}</small></div>}
        <div className="ort-detail-controls"><div className="ort-detail-control-label"><strong>{txt('Cantitate','Количество')}</strong></div><div className="ort-detail-quantity"><button type="button" aria-label="Minus" disabled={qty<=1} onClick={()=>setQty(n=>Math.max(1,n-1))}><Minus size={17}/></button><output>{qty}</output><button type="button" aria-label="Plus" disabled={qty>=MAX_QTY} onClick={()=>setQty(n=>Math.min(MAX_QTY,n+1))}><Plus size={17}/></button></div></div>
        <button type="button" className={`ort-detail-add button button-primary ort-cart-feedback ${added?'ort-cart-feedback--added':''}`} onClick={add} disabled={added}>{added?<CheckCircle2 size={21}/>:<ShoppingCart size={21}/> }{added?txt('Adăugat în coș!','Добавлено в корзину!'):txt('Adaugă în coș','Добавить в корзину')}</button>
        {notice && <div className="ort-detail-added" role="status"><CheckCircle2 size={17}/>{txt('Produs adăugat în coș.','Товар добавлен в корзину.')} <Link to="/cos">{txt('Vezi coșul','Перейти в корзину')} <ArrowRight size={14}/></Link><button type="button" onClick={()=>setNotice(false)} aria-label="Close">×</button></div>}
        <div className="ort-detail-actions"><button type="button" className={`ort-detail-outline ${favorite?'selected':''}`} onClick={()=>toggleFavorite(product.id)}><Heart size={18} fill={favorite?'currentColor':'none'}/>{favorite?txt('Elimină din favorite','Убрать из избранного'):txt('Adaugă la favorite','Добавить в избранное')}</button><Link className="ort-detail-outline" to="/solicita-consultatie"><Headphones size={18}/>{txt('Solicită consultație','Запросить консультацию')}</Link></div>
      </section>
    </div>
    <div className="container ort-detail-perks"><span><Truck/>{txt('Livrare în toată Moldova','Доставка по Молдове')}</span><span><ShieldCheck/>{txt('Plată în siguranță','Безопасная оплата')}</span><span><Package/>{txt('Retur conform condițiilor','Возврат по условиям магазина')}</span><span><Headphones/>{txt('Consultanță gratuită','Бесплатная консультация')}</span></div>
    <div className="container ort-detail-secondary" id="ort-product-details"><div className="ort-detail-info"><div className="ort-detail-tabs" role="tablist">{tabs.map(item=><button key={item.id} type="button" role="tab" aria-selected={tab===item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}>{ru?item.ru:item.ro}</button>)}</div><div className="ort-detail-tabpanel" role="tabpanel">
      {tab==='description'&&<><h2>{txt('Suport și confort pentru o viață activă','Поддержка и комфорт для активной жизни')}</h2><p>{txt('Aceasta este o fișă demonstrativă ORTOMED. Descrierea medicală, indicațiile, materialele și certificările fiecărui produs vor fi completate numai după verificarea documentelor furnizorului.', 'Это демонстрационная карточка ORTOMED. Медицинские показания, материалы, характеристики и сертификаты будут заполнены после проверки документов поставщика.')}</p><ul className="ort-detail-checklist"><li><Check/>{txt('Alege mărimea potrivită','Подберите подходящий размер')}</li><li><Check/>{txt('Verifică instrucțiunile producătorului','Проверьте инструкцию производителя')}</li><li><Check/>{txt('Solicită recomandarea specialistului','Получите рекомендацию специалиста')}</li></ul></>}
      {tab==='specifications'&&<><h2>{txt('Specificații produs','Характеристики товара')}</h2><dl className="ort-detail-specs"><div><dt>{txt('Cod produs','Код товара')}</dt><dd>{product.id}</dd></div><div><dt>{txt('Categorie','Категория')}</dt><dd>{category?(ru?category.ru:category.ro):'—'}</dd></div><div><dt>{txt('Mărimi disponibile în catalog','Размеры в каталоге')}</dt><dd>{product.sizes.join(', ')}</dd></div><div><dt>{txt('Material','Материал')}</dt><dd>{txt('În curs de verificare','Уточняется')}</dd></div><div><dt>{txt('Producător','Производитель')}</dt><dd>{txt('În curs de verificare','Уточняется')}</dd></div><div><dt>{txt('Garanție','Гарантия')}</dt><dd>{txt('Conform documentelor produsului','Согласно документам на изделие')}</dd></div></dl></>}
      {tab==='sizes'&&<><h2>{txt('Cum alegi mărimea potrivită?','Как подобрать размер?')}</h2><p>{txt('Măsoară zona indicată în instrucțiunile modelului și compară cu tabelul oficial al producătorului. Tabelul exact nu este încă încărcat pentru acest produs.', 'Измерьте область согласно инструкции к конкретной модели и сравните с официальной размерной таблицей производителя. Точная таблица для этого товара пока не загружена.')}</p><div className="ort-detail-sizes-table"><span>{txt('Mărimi afișate','Доступные обозначения размеров')}</span><strong>{product.sizes.join(' · ')}</strong></div><Link to="/solicita-consultatie">{txt('Cere ajutor la alegerea mărimii','Получить помощь с размером')} <ArrowRight size={15}/></Link></>}
      {tab==='delivery'&&<><h2>{txt('Livrare și retur','Доставка и возврат')}</h2><p>{txt('Livrarea poate fi solicitată pe teritoriul Republicii Moldova. Costul, termenul și condițiile exacte se vor confirma înaintea finalizării comenzii.', 'Доставка возможна по территории Республики Молдова. Стоимость, сроки и точные условия подтверждаются перед оформлением заказа.')}</p><Link to="/livrare-si-plata">{txt('Detalii despre livrare','Подробнее о доставке')} <ArrowRight size={15}/></Link></>}
      {tab==='reviews'&&<><h2>{txt('Recenzii clienți','Отзывы покупателей')}</h2><p>{txt('Recenziile reale vor fi disponibile după activarea sistemului de verificare a comenzilor. Stelele afișate în prezent sunt elemente demonstrative ale designului.', 'Реальные отзывы появятся после запуска системы подтверждения покупок. Звёзды в текущем дизайне носят демонстрационный характер.')}</p></>}
    </div></div><aside className="ort-detail-aside"><div className="ort-detail-help"><div className="ort-detail-help-icon"><Headphones size={35}/></div><h3>{txt('Nu ești sigur ce ți se potrivește?','Не уверены, что вам подходит?')}</h3><p>{txt('Te ajutăm să alegi produsul și mărimea potrivită.', 'Поможем подобрать изделие и нужный размер.')}</p><Link className="button button-primary" to="/solicita-consultatie">{txt('Solicită consultație','Запросить консультацию')} <ArrowRight size={16}/></Link></div><div className="ort-detail-aside-service"><ShieldCheck size={19}/>{txt('Calitate și informații verificate înainte de publicare','Проверка информации перед публикацией')}</div><div className="ort-detail-aside-service"><Clock3 size={19}/>{txt('Program: luni–vineri 09:00–18:00','График: пн–пт 09:00–18:00')}</div></aside></div>
    <section className="container ort-detail-recommended"><div className="ort-detail-section-title"><h2>{txt('Produse recomandate','Рекомендуемые товары')}</h2><Link to="/produse">{txt('Vezi toate produsele','Все товары')} <ArrowRight size={17}/></Link></div><div className="ort-detail-related-grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>
    <div className="container ort-detail-demo-footer">{txt('Versiune demonstrativă: prețurile și disponibilitatea nu sunt conectate încă la baza de date.', 'Демонстрационная версия: цены и наличие пока не связаны с базой данных.')}</div>
  </main>;
}
export default function ProductDetailPage(){const {id}=useParams();const {t}=useTranslation();const product=products.find(p=>p.id===id);useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
}, [id]);if(!product)return <main className="container ort-detail-missing"><h1>404 — {t('notFound')}</h1><Link to="/produse"><ArrowLeft size={18}/>{t('viewProducts')}</Link></main>;return <Detail key={product.id} product={product}/>;}
