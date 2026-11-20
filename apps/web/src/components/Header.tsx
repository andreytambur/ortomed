import {useState} from 'react';
import {Link,NavLink,useNavigate} from 'react-router-dom';
import {MapPin,Phone,Search,Headset,Truck,ShieldCheck,Heart,ShoppingCart,Menu,X,UserRound,Clock} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useShopStore} from '../store/useShopStore';
import {categories} from '../data/products';

const nav=[['/','home'],['/produse','products'],['/oferte','offers'],['/despre-noi','about'],['/ghid-pacient','guide'],['/blog','blog'],['/contact','contact']] as const;
export default function Header(){
 const {t,i18n}=useTranslation(); const navigate=useNavigate();
 const [open,setOpen]=useState(false); const [catOpen,setCatOpen]=useState(false);const [query,setQuery]=useState('');
 const count=useShopStore(s=>s.cart.reduce((n,x)=>n+x.quantity,0));const fav=useShopStore(s=>s.favorites.length);
 const changeLanguage=(lng:string)=>{void i18n.changeLanguage(lng);localStorage.setItem('ortomed-language',lng)};
 const search=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();navigate(`/produse?q=${encodeURIComponent(query.trim())}`);setOpen(false)};
 const renderNav=()=>nav.map(([path,key])=><NavLink key={key} onClick={()=>setOpen(false)} to={path} className={({isActive})=>isActive?'nav-link active':'nav-link'}>{t(key)}</NavLink>);
 return <header className="site-header">
  <div className="topbar"><div className="container topbar-inner">
   <span className="topbar-address"><MapPin size={15}/> Bălți, str. Decebal 126/4, etajul 2, biroul 5</span>
   <span className="topbar-hours"><Clock size={14}/> Luni – Vineri: 09:00 – 18:00</span>
   <a href="tel:+37369123456"><Phone size={14}/> +373 69 123 456</a>
   <div className="topbar-right"><div className="lang-control" aria-label="Language"><button className={i18n.language==='ro'?'selected':''} onClick={()=>changeLanguage('ro')}>RO</button><span>|</span><button className={i18n.language==='ru'?'selected':''} onClick={()=>changeLanguage('ru')}>RU</button></div><Link to="/partener"><UserRound size={16}/> <span>{t('partner')}</span></Link><Link to="/favorite"><Heart size={17}/> <span>{t('favorites')}</span><b className="small-bubble">{fav}</b></Link><Link to="/cos"><ShoppingCart size={19}/><b className="small-bubble">{count}</b></Link></div>
  </div></div>
  <div className="container main-header-row">
   <Link to="/" className="brand" aria-label="ORTOMED"><img src="/ortomed/images/brand-symbol.webp" alt=""/><span className="brand-text"><strong>ORTO<span>MED</span></strong><small>ORTOPEDIE · RECUPERARE · MOBILITATE</small></span></Link>
   <form className="search-form" onSubmit={search}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')}/><button type="submit">{t('search')} <Search size={18}/></button></form>
   <div className="support-blurb"><Headset size={28}/><div><strong>{t('freeConsult')}</strong><small>{t('freeConsultSub')}</small></div></div>
   <Link className="button button-primary header-consult" to="/solicita-consultatie">{t('consultation')}</Link>
   <button className="mobile-menu-button" aria-label="Menu" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
  </div>
  <div className="nav-band"><div className="container nav-band-inner">
   <div className="catalog-wrap"><button className="catalog-toggle" aria-expanded={catOpen} onClick={()=>setCatOpen(v=>!v)}><Menu size={20}/>{t('catalog')}</button>{catOpen&&<div className="catalog-dropdown">{categories.map(c=><Link key={c.id} to={`/produse?category=${c.id}`} onClick={()=>{setCatOpen(false);setOpen(false)}}>{i18n.language==='ru'?c.ru:c.ro}</Link>)}</div>}</div>
   <nav className={open?'primary-nav opened':'primary-nav'}>{renderNav()}<Link onClick={()=>setOpen(false)} className="mobile-only nav-link" to="/urmareste-comanda">{t('track')}</Link><Link onClick={()=>setOpen(false)} className="mobile-only nav-link" to="/partener">{t('partner')}</Link></nav>
   <div className="header-perks"><span><Truck/><span><b>{t('delivery')}</b><small>{t('deliverySub')}</small></span></span><span><ShieldCheck/><span><b>{t('safePay')}</b><small>{t('safePaySub')}</small></span></span></div>
  </div></div>
 </header>
}
