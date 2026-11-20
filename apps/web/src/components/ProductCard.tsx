import {useEffect, useRef, useState} from 'react';
import {CheckCircle2, Heart, ShoppingCart, Star} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import type {Product} from '../data/products';
import {formatPrice} from '../data/products';
import {useShopStore} from '../store/useShopStore';
import '../styles/cart-feedback.css';
import '../styles/product-sku.css';

export default function ProductCard({product}:{product:Product}) {
  const {t,i18n}=useTranslation();
  const add=useShopStore(s=>s.addToCart);
  const toggle=useShopStore(s=>s.toggleFavorite);
  const fav=useShopStore(s=>s.favorites.includes(product.id));
  const [added,setAdded]=useState(false);
  const lock=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current) clearTimeout(timer.current);},[]);
  const ru=i18n.language.startsWith('ru');
  const handleAdd=()=>{
    if(lock.current) return;
    lock.current=true;
    add(product.id,product.sizes[0]);
    setAdded(true);
    if(timer.current) clearTimeout(timer.current);
    timer.current=setTimeout(()=>{setAdded(false);lock.current=false;timer.current=null;},1800);
  };
  return <article className="product-card">
    <div className="product-image">
      <Link to={`/produs/${product.id}`}><img loading="lazy" src={product.image} alt={ru?product.nameRu:product.nameRo}/></Link>
      {product.badge&&<span className={`product-badge badge-${product.badge}`}>{product.badge==='best'?'Bestseller':product.badge==='new'?'Nou':'−15%'}</span>}
      <button type="button" className={`heart-button ${fav?'is-favorite':''}`} onClick={()=>toggle(product.id)} aria-label={ru?'Избранное':'Favorite'}><Heart size={20} fill={fav?'currentColor':'none'}/></button>
    </div>
    <div className="product-content">
      <Link to={`/produs/${product.id}`} className="product-name">{ru?product.nameRu:product.nameRo}</Link>
      <div className="ort-product-sku" aria-label={ru ? `Код товара: ${product.id}` : `Cod produs: ${product.id}`}>
        <span className="ort-product-sku__label">{ru ? 'Код товара' : 'Cod produs'}</span>
        <strong className="ort-product-sku__value">{product.id}</strong>
      </div>
      <div className="stars" aria-label="5 stars"><Star/><Star/><Star/><Star/><Star/></div>
      <div className="product-price">{product.oldPrice&&<s>{formatPrice(product.oldPrice)}</s>}{formatPrice(product.price)}</div>
      <button type="button" className={`button button-primary card-add ort-cart-feedback ${added?'ort-cart-feedback--added':''}`} onClick={handleAdd} disabled={added} aria-label={added?(ru?'Добавлено в корзину':'Adăugat în coș'):t('add')}>
        {added?<CheckCircle2 size={17}/>:<ShoppingCart size={17}/>}
        <span>{added?(ru?'Добавлено ✓':'Adăugat ✓'):t('add')}</span>
      </button>
    </div>
  </article>;
}
