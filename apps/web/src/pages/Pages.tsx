import {Link} from 'react-router-dom';
import {ArrowLeft,Heart,PackageSearch,UserRound} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import ProductCard from '../components/ProductCard';
export {default as ProductsPage} from './Catalog';
export {default as ProductDetailPage} from './ProductDetail';
import {products} from '../data/products';
import {useShopStore} from '../store/useShopStore';
export {default as CartPage} from './Cart';
export function FavoritesPage(){const {t}=useTranslation();const fav=useShopStore(s=>s.favorites);const list=products.filter(p=>fav.includes(p.id));return <main className="container page-content"><div className="page-heading"><h1>{t('favorites')}</h1></div>{list.length?<div className="products-grid catalog-products">{list.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state"><Heart size={38}/><h2>{t('emptyFav')}</h2><Link className="button button-primary" to="/produse">{t('viewProducts')}</Link></div>}</main>}
export function PlaceholderPage({title}:{title:string}){const {t}=useTranslation();return <main className="container page-content"><div className="placeholder-page"><PackageSearch size={56}/><h1>{title}</h1><p>{t('placeholder')}</p><Link className="button button-primary" to="/"><ArrowLeft size={17}/>{t('backHome')}</Link></div></main>}
export function PartnerPage(){const {t}=useTranslation();return <main className="container page-content"><div className="placeholder-page"><UserRound size={56}/><h1>{t('partner')} B2B</h1><p>{t('partnerNotice')}</p><Link className="button button-primary" to="/"><ArrowLeft size={17}/>{t('backHome')}</Link></div></main>}
