import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Grid2X2,
  List as ListIcon, RotateCcw, SlidersHorizontal, X, ShieldCheck,
  HeartPulse, Truck, Search, Check
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories, products } from '../data/products';
import type { Product } from '../data/products';
import './Catalog.css';

type SortOrder = 'popular' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'new';
type CatalogView = 'grid' | 'list';
const PAGE_SIZE = 8;
const MAX_PRICE = Math.ceil(Math.max(...products.map(p => p.price), 3000) / 500) * 500;
const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function Catalog() {
  const { i18n } = useTranslation();
  const ru = i18n.language.startsWith('ru');
  const [urlParams, setUrlParams] = useSearchParams();
  const category = urlParams.get('category') || 'all';
  const query = (urlParams.get('q') || '').trim();
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sizes, setSizes] = useState<string[]>([]);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>('popular');
  const [view, setView] = useState<CatalogView>('grid');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dataVersion,setDataVersion] = useState(0);
  useEffect(()=>{
    const refresh=()=>setDataVersion(n=>n+1);
    window.addEventListener('ortomed-categories-updated',refresh);
    window.addEventListener('ortomed-catalog-updated',refresh);
    return ()=>{window.removeEventListener('ortomed-categories-updated',refresh);window.removeEventListener('ortomed-catalog-updated',refresh)};
  },[]);

  const label = (ro: string, russian: string) => ru ? russian : ro;
  const setCategory = (next: string) => {
    const params = new URLSearchParams(urlParams);
    if (next === 'all') params.delete('category'); else params.set('category', next);
    setUrlParams(params);
    setPage(1);
    setFiltersOpen(false);
  };
  const reset = () => {
    setUrlParams(new URLSearchParams());
    setMinPrice(0); setMaxPrice(MAX_PRICE); setSizes([]);
    setDiscountOnly(false); setSort('popular'); setPage(1);
    setFiltersOpen(false);
  };
  const flipSize = (size: string) => {
    setSizes(old => old.includes(size) ? old.filter(s => s !== size) : [...old, size]);
    setPage(1);
  };
  const filtered = useMemo(() => {
    const search = query.toLocaleLowerCase();
    const matches = products.filter(p => {
      const name = `${p.nameRo} ${p.nameRu} ${p.id}`.toLocaleLowerCase();
      return (category === 'all' || p.category === category)
        && (!search || name.includes(search))
        && p.price >= minPrice && p.price <= maxPrice
        && (!sizes.length || sizes.some(s => p.sizes.includes(s)))
        && (!discountOnly || Boolean(p.oldPrice && p.oldPrice > p.price));
    });
    if (sort === 'priceAsc') matches.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') matches.sort((a, b) => b.price - a.price);
    if (sort === 'nameAsc') matches.sort((a, b) => (ru ? a.nameRu : a.nameRo).localeCompare(ru ? b.nameRu : b.nameRo));
    if (sort === 'new') matches.sort((a, b) => Number(b.badge === 'new') - Number(a.badge === 'new'));
    return matches;
  }, [category, query, minPrice, maxPrice, sizes, discountOnly, sort, ru, dataVersion]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [category, query]);
  const safePage = Math.min(page, maxPage);
  const pageProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const formatNumber = (n: number) => new Intl.NumberFormat(ru ? 'ru-RU' : 'ro-MD').format(n);
  const stockLabel = label('În stoc', 'В наличии');

  return <main className="ort-catalog">
    <section className="ort-catalog-hero">
      <div className="container ort-catalog-hero-content">
        <div className="ort-catalog-hero-copy">
          <div className="ort-catalog-breadcrumb"><Link to="/">{label('Acasă', 'Главная')}</Link><span>/</span><span>{label('Produse', 'Товары')}</span></div>
          <h1>{query ? label('Rezultatele căutării', 'Результаты поиска') : label('Produse ortopedice', 'Ортопедические товары')}</h1>
          <p>{query ? `«${query}»` : label('Descoperă gama noastră de produse ortopedice, create pentru sănătatea, confortul și mobilitatea ta.', 'Откройте наш ассортимент ортопедических товаров для здоровья, комфорта и свободы движения.')}</p>
        </div>
        <div className="ort-catalog-hero-visual" aria-hidden="true"><img src="/ortomed/images/hero-athlete.webp" alt=""/></div>
        <div className="ort-catalog-hero-points">
          <span><ShieldCheck size={19}/>{label('Calitate certificată', 'Сертифицированное качество')}</span>
          <span><HeartPulse size={19}/>{label('Confort în fiecare zi', 'Комфорт каждый день')}</span>
        </div>
      </div>
    </section>

    <div className="container">
      <div className="ort-catalog-category-strip" aria-label={label('Categorii', 'Категории')}>
        {categories.map(c => <button type="button" key={c.id} className={`ort-catalog-category-chip ${category === c.id ? 'is-active' : ''}`} onClick={() => setCategory(c.id)}>
          <img src={c.image} alt=""/><span>{ru ? c.ru : c.ro}</span>
        </button>)}
        <button type="button" className={`ort-catalog-category-chip ort-catalog-category-all ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>
          <span>{label('Toate categoriile', 'Все категории')}</span><ArrowRight size={16}/>
        </button>
      </div>

      <div className="ort-catalog-mobile-control"><button type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18}/>{label('Filtrează produsele', 'Фильтры товаров')}</button><span>{filtered.length} {label('produse', 'товаров')}</span></div>
      <div className="ort-catalog-layout">
        {filtersOpen && <button className="ort-catalog-backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}/>}
        <aside className={`ort-catalog-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label={label('Filtre', 'Фильтры')}>
          <div className="ort-catalog-sidebar-head"><h2>{label('Filtrează produsele', 'Фильтры товаров')} <SlidersHorizontal size={17}/></h2><button type="button" className="ort-catalog-close" onClick={() => setFiltersOpen(false)} aria-label="Close"><X size={20}/></button></div>
          <button type="button" className="ort-catalog-reset" onClick={reset}><RotateCcw size={14}/>{label('Resetează filtrele', 'Сбросить фильтры')}</button>

          <fieldset className="ort-catalog-filter-group"><legend>{label('Categorii', 'Категории')} <ChevronDown size={16}/></legend>
            {categories.map(c => <label key={c.id} className="ort-catalog-check"><input type="checkbox" checked={category === c.id} onChange={() => setCategory(category === c.id ? 'all' : c.id)}/><span>{ru ? c.ru : c.ro}</span><small>({products.filter(p => p.category === c.id).length})</small></label>)}
          </fieldset>

          <fieldset className="ort-catalog-filter-group"><legend>{label('Preț (MDL)', 'Цена (MDL)')} <ChevronDown size={16}/></legend>
            <div className="ort-catalog-price-meter"><span style={{left: `${Math.min(minPrice / MAX_PRICE, 1) * 100}%`, right: `${100 - Math.min(maxPrice / MAX_PRICE, 1) * 100}%`}}/></div>
            <div className="ort-catalog-price-fields"><label>{label('De la', 'От')}<input type="number" min="0" max={maxPrice} value={minPrice} onChange={e => {setMinPrice(Math.min(Math.max(0, Number(e.target.value) || 0), maxPrice));setPage(1);}}/></label><span>—</span><label>{label('Până la', 'До')}<input type="number" min={minPrice} value={maxPrice} onChange={e => {setMaxPrice(Math.max(minPrice, Number(e.target.value) || 0));setPage(1);}}/></label></div>
          </fieldset>

          <fieldset className="ort-catalog-filter-group"><legend>{label('Mărime', 'Размер')} <ChevronDown size={16}/></legend>
            {ALL_SIZES.map(s => <label key={s} className="ort-catalog-check"><input type="checkbox" checked={sizes.includes(s)} onChange={() => flipSize(s)}/><span>{s}</span><small>({products.filter(p => p.sizes.includes(s)).length})</small></label>)}
          </fieldset>

          <fieldset className="ort-catalog-filter-group"><legend>{label('Oferte speciale', 'Спецпредложения')} <ChevronDown size={16}/></legend>
            <label className="ort-catalog-check"><input type="checkbox" checked={discountOnly} onChange={e => {setDiscountOnly(e.target.checked);setPage(1);}}/><span>{label('Produse reduse', 'Товары со скидкой')}</span></label>
          </fieldset>
          <div className="ort-catalog-sidebar-notice"><ShieldCheck size={25}/><span>{label('Produse selectate pentru confortul tău.', 'Товары, выбранные для вашего комфорта.')}</span></div>
          <button type="button" className="ort-catalog-apply" onClick={() => setFiltersOpen(false)}>{label('Vezi produsele', 'Показать товары')} ({filtered.length})</button>
        </aside>

        <div className="ort-catalog-results">
          <div className="ort-catalog-toolbar">
            <span className="ort-catalog-count"><b>{filtered.length}</b> {label('produse', 'товаров')}{query && <span className="ort-catalog-query"> · «{query}»</span>}</span>
            <div className="ort-catalog-toolbar-right"><label htmlFor="ort-catalog-sort">{label('Sortează după:', 'Сортировать:')}</label><select id="ort-catalog-sort" value={sort} onChange={e => {setSort(e.target.value as SortOrder);setPage(1);}}><option value="popular">{label('Cele mai populare', 'Популярные')}</option><option value="priceAsc">{label('Preț crescător', 'Цена по возрастанию')}</option><option value="priceDesc">{label('Preț descrescător', 'Цена по убыванию')}</option><option value="nameAsc">{label('Nume A–Z', 'Название А–Я')}</option><option value="new">{label('Noutăți', 'Новинки')}</option></select>
            <div className="ort-catalog-view-toggle"><button type="button" aria-label="Grid" aria-pressed={view === 'grid'} className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><Grid2X2 size={18}/></button><button type="button" aria-label="List" aria-pressed={view === 'list'} className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><ListIcon size={18}/></button></div></div>
          </div>
          {(category !== 'all' || query || sizes.length > 0 || discountOnly || minPrice > 0 || maxPrice < MAX_PRICE) && <div className="ort-catalog-active-filters">
            {category !== 'all' && <button type="button" onClick={() => setCategory('all')}>{ru ? categories.find(c => c.id === category)?.ru : categories.find(c => c.id === category)?.ro}<X size={13}/></button>}
            {sizes.map(s => <button type="button" key={s} onClick={() => flipSize(s)}>{s}<X size={13}/></button>)}
            {discountOnly && <button type="button" onClick={() => setDiscountOnly(false)}>{label('Reduceri', 'Скидки')}<X size={13}/></button>}
            {query && <button type="button" onClick={() => {const params = new URLSearchParams(urlParams);params.delete('q');setUrlParams(params);}}>{query}<X size={13}/></button>}
            {(minPrice > 0 || maxPrice < MAX_PRICE) && <button type="button" onClick={() => {setMinPrice(0);setMaxPrice(MAX_PRICE);}}>{formatNumber(minPrice)}–{formatNumber(maxPrice)} MDL<X size={13}/></button>}
          </div>}
          {pageProducts.length > 0 ? <>
            <div className={`ort-catalog-products ${view === 'list' ? 'is-list' : ''}`}>{pageProducts.map((p: Product) => <div className="ort-catalog-product-wrap" key={p.id}><ProductCard product={p}/><span className="ort-catalog-stock"><Check size={12}/>{stockLabel} <span className="ort-catalog-demo">· demo</span></span></div>)}</div>
            <div className="ort-catalog-pagination" aria-label="Pagination"><button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page"><ChevronLeft size={19}/></button>{Array.from({length:maxPage},(_,i)=>i+1).map(n=><button type="button" key={n} className={safePage === n ? 'current' : ''} onClick={()=>setPage(n)} aria-current={safePage === n ? 'page' : undefined}>{n}</button>)}<button type="button" disabled={safePage === maxPage} onClick={() => setPage(safePage + 1)} aria-label="Next page"><ChevronRight size={19}/></button></div>
          </> : <div className="ort-catalog-empty"><Search size={36}/><h2>{label('Nu am găsit produse', 'Товары не найдены')}</h2><p>{label('Încearcă să schimbi filtrele sau termenul de căutare.', 'Попробуйте изменить фильтры или поисковый запрос.')}</p><button type="button" onClick={reset}>{label('Resetează filtrele', 'Сбросить фильтры')}</button></div>}
          <section className="ort-catalog-promo"><div><small>{label('Calitate. Mobilitate. O viață mai activă.', 'Качество. Движение. Активная жизнь.')}</small><h2>{label('Echipamentul potrivit pentru recuperarea ta!', 'Подходящие товары для вашего восстановления!')}</h2><Link to="/solicita-consultatie">{label('Solicită consultația', 'Получить консультацию')} <ArrowRight size={16}/></Link></div><img src="/ortomed/images/hero-athlete.webp" alt=""/></section>
        </div>
      </div>
      <div className="ort-catalog-service-strip"><span><ShieldCheck/>{label('Produse originale și certificate', 'Оригинальные и сертифицированные товары')}</span><span><Truck/>{label('Livrare în toată Moldova', 'Доставка по всей Молдове')}</span><span><HeartPulse/>{label('Consultanță gratuită', 'Бесплатная консультация')}</span></div>
      <p className="ort-catalog-demonote">{label('Catalog demonstrativ: prețurile și disponibilitatea nu sunt încă sincronizate cu stocul.', 'Демонстрационный каталог: цены и наличие пока не синхронизированы со складом.')}</p>
    </div>
  </main>;
}
