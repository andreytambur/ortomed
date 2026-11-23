import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,Truck,ChevronLeft,ChevronRight,CheckCircle2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {categories,products} from '../data/products';
import ProductCard from '../components/ProductCard';
import HomeBannerSlider from '../components/HomeBannerSlider';

type Tab='best'|'new'|'sale';

export default function Home(){
  const {t,i18n}=useTranslation();
  const isRu=i18n.language==='ru';
  const [tab,setTab]=useState<Tab>('best');
  const [categoryOffset,setCategoryOffset]=useState(0);
  const [productOffset,setProductOffset]=useState(0);
  const sorted=tab==='new'?[...products].sort((a,b)=>Number(b.badge==='new')-Number(a.badge==='new')):tab==='sale'?[...products].sort((a,b)=>Number(Boolean(b.oldPrice))-Number(Boolean(a.oldPrice))):products;
  const visible=Array.from({length:6},(_,i)=>sorted[(i+productOffset)%sorted.length]);
  const displayedCategories=Array.from({length:6},(_,i)=>categories[(i+categoryOffset)%categories.length]);
  return <main className="ortomed-home">
    <HomeBannerSlider/>

    <section className="container home-section categories-section">
      <div className="section-header"><h2>{t('categories')}</h2><Link to="/produse">{t('allCategories')} <ArrowRight size={18}/></Link></div>
      <div className="carousel-area"><button type="button" className="slide-arrow previous" aria-label="Previous category" onClick={()=>setCategoryOffset(x=>(x+categories.length-1)%categories.length)}><ChevronLeft/></button>
        <div className="category-grid">{displayedCategories.map((c,i)=><Link className="category-tile" to={`/produse?category=${c.id}`} key={`${c.id}-${i}`}><img src={c.image} alt=""/><strong>{isRu?c.ru:c.ro}</strong></Link>)}</div>
        <button type="button" className="slide-arrow next" aria-label="Next category" onClick={()=>setCategoryOffset(x=>(x+1)%categories.length)}><ChevronRight/></button>
      </div>
      <div className="carousel-dots" aria-hidden="true"><span className="active"/><span/><span/></div>
    </section>

    <section className="container home-section products-section">
      <div className="section-header product-section-heading"><h2>{t('recommended')}</h2><div className="product-tabs" role="group" aria-label="Product selection"><button className={tab==='best'?'active':''} onClick={()=>{setTab('best');setProductOffset(0)}}>{isRu?'Хиты продаж':'Bestsellere'}</button><button className={tab==='new'?'active':''} onClick={()=>{setTab('new');setProductOffset(0)}}>{isRu?'Новинки':'Noutăți'}</button><button className={tab==='sale'?'active':''} onClick={()=>{setTab('sale');setProductOffset(0)}}>{isRu?'Акции':'Oferte speciale'}</button></div><Link to="/produse">{t('allProducts')} <ArrowRight size={18}/></Link></div>
      <div className="carousel-area"><button className="slide-arrow previous" type="button" aria-label="Previous products" onClick={()=>setProductOffset(x=>(x+sorted.length-1)%sorted.length)}><ChevronLeft/></button><div className="products-grid homepage-products">{visible.map((p,i)=><ProductCard product={p} key={`${tab}-${p.id}-${i}`}/>)}</div><button className="slide-arrow next" type="button" aria-label="Next products" onClick={()=>setProductOffset(x=>(x+1)%sorted.length)}><ChevronRight/></button></div>
    </section>

    <section className="container promos">
      <Link className="promo promo-athlete" to="/produse"><img src="/ortomed/images/promo-runner.webp" alt=""/><div><h3>{isRu?'Подходящие товары для вашего восстановления!':'Echipamentul potrivit pentru recuperarea ta!'}</h3><span>{isRu?'Смотреть товары':'Descoperă acum'}<ArrowRight size={16}/></span></div></Link>
      <Link className="promo promo-sale" to="/oferte"><div><small>{isRu?'СКИДКИ ДО':'PÂNĂ LA'}</small><strong>−20%</strong><h3>{isRu?'СПЕЦИАЛЬНЫЕ ПРЕДЛОЖЕНИЯ':'OFERTE SPECIALE'}</h3><p>{isRu?'на отдельные товары':'la produsele selectate'}</p><span>{isRu?'Посмотреть акции':'Vezi ofertele'}<ArrowRight size={16}/></span></div><img src="/ortomed/images/promo-brace.webp" alt=""/></Link>
      <Link className="promo promo-consult" to="/solicita-consultatie"><img src="/ortomed/images/promo-doctor.webp" alt=""/><div><h3>{isRu?'Не знаете, какой товар выбрать?':'Nu ești sigur ce ți se potrivește?'}</h3><p><CheckCircle2/>{isRu?'Бесплатная консультация':'Consultanță gratuită'}</p><p><CheckCircle2/>{isRu?'Персональные рекомендации':'Recomandări personalizate'}</p><p><CheckCircle2/>{isRu?'Помощь с размером':'Ajutor în alegerea mărimii'}</p><span>{t('consultation')}<ArrowRight size={16}/></span></div></Link>
    </section>
    <div className="container under-construction-note"><Truck size={15}/><span>{isRu?'Демонстрационная версия: заказы пока не передаются на сервер.':'Versiune demonstrativă: comenzile nu sunt încă trimise către server.'}</span></div>
  </main>;
}
