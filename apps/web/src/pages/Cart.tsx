import {useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ArrowLeft,ArrowRight,Check,Headset,LockKeyhole,Package,ShoppingCart,Trash2,Truck,Tag,ShieldCheck,Minus,Plus} from 'lucide-react';
import {formatPrice,products} from '../data/products';
import ProductCard from '../components/ProductCard';
import {useShopStore} from '../store/useShopStore';
import './Cart.css';

const FREE_SHIPPING_THRESHOLD=1500; // Демонстрационное условие — подтвердить перед запуском.
const DEMO_CODE='ORTOMED-DEMO'; // Только локальная демонстрация, не реальный купон.
const ro={
 breadcrumb:'Acasă',title:'Coșul meu',subtitle:'Verifică produsele selectate și finalizează comanda în câțiva pași simpli.',products:'Produse în coș',items:'produse',clear:'Șterge toate',unitPrice:'Preț unitar',qty:'Cantitate',total:'Total',size:'Mărime',code:'Cod produs',stock:'Disponibilitate de confirmat',continue:'Continuă cumpărăturile',summary:'Sumarul comenzii',subtotal:'Subtotal',delivery:'Livrare',discount:'Reducere',free:'Gratuită*',pending:'Se confirmă la finalizarea comenzii',grand:'Total produse după reducere',promo:'Cod promoțional',promoPlaceholder:'Introdu codul promoțional',apply:'Aplică',removeCode:'Elimină codul',codeInvalid:'Codul nu este recunoscut în modul demonstrativ.',codeApplied:'Cod demonstrativ aplicat (nu este o ofertă reală).',demoCode:'Cod pentru test: ORTOMED-DEMO',checkout:'Finalizează comanda',consult:'Solicită consultația',safe:'Plată în siguranță',safeSub:'Datele tale sunt protejate',fast:'Livrare rapidă',fastSub:'în toată Moldova',returns:'Retur în 14 zile',returnsSub:'Conform condițiilor de retur',suggest:'S-ar putea să te intereseze',all:'Vezi toate produsele',empty:'Coșul tău este gol',emptyDesc:'Alege produsele care ți se potrivesc din catalogul ORTOMED.',shop:'Vezi produsele',orderNote:'Comenzile reale nu sunt încă activate. Urmează implementarea backend-ului și a finalizării comenzii.', shippingNote:'Transportul gratuit peste 1 500 MDL este o condiție demonstrativă și trebuie confirmată.',freeMessage:'Transport gratuit pentru comenzi de peste 1 500 MDL (condiție demonstrativă).',remaining:'Până la pragul demonstrativ de livrare gratuită mai sunt',allClear:'Dorești să elimini toate produsele din coș?',removeItem:'Elimină produsul',stockHint:'Stocul real va fi verificat la conectarea bazei de date.',paySub:'online sau la magazin',help:'Consultanță gratuită',helpSub:'Te ajutăm să alegi produsul potrivit.'
};
const ru={
 breadcrumb:'Главная',title:'Моя корзина',subtitle:'Проверьте выбранные товары перед оформлением заказа.',products:'Товары в корзине',items:'товаров',clear:'Удалить всё',unitPrice:'Цена за шт.',qty:'Количество',total:'Сумма',size:'Размер',code:'Код товара',stock:'Наличие уточняется',continue:'Продолжить покупки',summary:'Сумма заказа',subtotal:'Подытог',delivery:'Доставка',discount:'Скидка',free:'Бесплатно*',pending:'Стоимость уточняется при оформлении',grand:'Итого за товары со скидкой',promo:'Промокод',promoPlaceholder:'Введите промокод',apply:'Применить',removeCode:'Удалить промокод',codeInvalid:'Код не найден в демонстрационном режиме.',codeApplied:'Демонстрационный промокод применён (не реальная акция).',demoCode:'Тестовый код: ORTOMED-DEMO',checkout:'Оформить заказ',consult:'Запросить консультацию',safe:'Безопасная оплата',safeSub:'Ваши данные защищены',fast:'Быстрая доставка',fastSub:'по всей Молдове',returns:'Возврат в течение 14 дней',returnsSub:'Согласно правилам возврата',suggest:'Вас также может заинтересовать',all:'Все товары',empty:'Корзина пуста',emptyDesc:'Подберите подходящие ортопедические товары в каталоге ORTOMED.',shop:'Перейти в каталог',orderNote:'Реальные заказы пока не принимаются. Оформление будет подключено после разработки сервера.',shippingNote:'Условие бесплатной доставки свыше 1 500 MDL демонстрационное и требует подтверждения.',freeMessage:'Бесплатная доставка свыше 1 500 MDL (демонстрационное условие).',remaining:'До демонстрационного порога бесплатной доставки осталось',allClear:'Удалить все товары из корзины?',removeItem:'Удалить товар',stockHint:'Реальные остатки будут проверяться после подключения базы данных.',paySub:'онлайн или в магазине',help:'Бесплатная консультация',helpSub:'Поможем выбрать подходящий товар.'
};

export default function CartPage(){
 const {i18n}=useTranslation();
 const tr=i18n.language==='ru'?ru:ro;
 const cart=useShopStore(s=>s.cart);
 const remove=useShopStore(s=>s.removeFromCart);
 const update=useShopStore(s=>s.updateQuantity);
 const [promo,setPromo]=useState('');
 const applied=useShopStore(s=>s.promoApplied);
 const setApplied=useShopStore(s=>s.setPromoApplied);
 const [promoMessage,setPromoMessage]=useState('');
 const lines=useMemo(()=>cart.map(line=>({...line,product:products.find(p=>p.id===line.id)})).filter((item): item is typeof item & {product:(typeof products)[number]}=>item.product!==undefined),[cart]);
 const quantity=lines.reduce((n,line)=>n+line.quantity,0);
 const subtotal=lines.reduce((n,line)=>n+line.quantity*line.product.price,0);
 const discount=applied?Math.min(200,subtotal):0;
 const total=subtotal-discount;
 const recommendations=products.filter(p=>!lines.some(line=>line.id===p.id)).slice(0,4);
 const applyCode=(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(promo.trim().toUpperCase()===DEMO_CODE){setApplied(true);setPromoMessage(tr.codeApplied)}
  else {setApplied(false);setPromoMessage(tr.codeInvalid)}
 };
 const clearCart=()=>{if(window.confirm(tr.allClear)){for(const line of lines)remove(line.id,line.size);setApplied(false);setPromo('');setPromoMessage('')}};
 return <main className="ort-cart-page">
  <section className="ort-cart-hero"><div className="container ort-cart-hero-inner"><div><div className="ort-cart-crumbs"><Link to="/">{tr.breadcrumb}</Link><span>/</span><strong>{tr.title}</strong></div><h1>{tr.title}</h1><p>{tr.subtitle}</p><span className="ort-cart-count"><ShoppingCart size={17}/>{quantity} {tr.items}</span></div><div className="ort-cart-hero-motto">Sănătate<br/>Mișcare<br/>Încredere</div></div></section>
  <div className="container ort-cart-body">
  {lines.length>0?<>
   <div className="ort-cart-layout">
    <section className="ort-cart-products" aria-label={tr.products}>
     <div className="ort-cart-section-heading"><h2>{tr.products} <small>({quantity} {tr.items})</small></h2><button type="button" onClick={clearCart} className="ort-cart-link danger"><Trash2 size={16}/>{tr.clear}</button></div>
     <div className="ort-cart-product-list">{lines.map(line=><article className="ort-cart-item" key={`${line.id}::${line.size}`}>
      <Link to={`/produs/${line.id}`} className="ort-cart-photo"><img src={line.product.image} alt={i18n.language==='ru'?line.product.nameRu:line.product.nameRo}/></Link>
      <div className="ort-cart-product-info"><Link to={`/produs/${line.id}`} className="ort-cart-product-name">{i18n.language==='ru'?line.product.nameRu:line.product.nameRo}</Link><span>{tr.size}: {line.size} <span className="ort-cart-info-separator">|</span> {tr.code}: {line.id}</span><span className="ort-cart-stock"><Check size={12}/>{tr.stock}</span></div>
      <div className="ort-cart-product-price"><small>{tr.unitPrice}</small><strong>{formatPrice(line.product.price)}</strong></div>
      <div className="ort-cart-product-qty"><small>{tr.qty}</small><div className="ort-cart-stepper"><button type="button" onClick={()=>line.quantity===1?remove(line.id,line.size):update(line.id,line.size,line.quantity-1)} aria-label="Minus"><Minus size={15}/></button><b>{line.quantity}</b><button type="button" onClick={()=>update(line.id,line.size,Math.min(99,line.quantity+1))} disabled={line.quantity>=99} aria-label="Plus"><Plus size={15}/></button></div></div>
      <div className="ort-cart-line-total"><small>{tr.total}</small><strong>{formatPrice(line.product.price*line.quantity)}</strong></div>
      <button type="button" onClick={()=>remove(line.id,line.size)} className="ort-cart-remove" aria-label={tr.removeItem} title={tr.removeItem}><Trash2 size={17}/></button>
     </article>)}</div>
     <div className="ort-cart-after-items"><Link className="ort-cart-back" to="/produse"><ArrowLeft size={18}/>{tr.continue}</Link><p><Truck size={23}/>{subtotal>=FREE_SHIPPING_THRESHOLD?tr.freeMessage:`${tr.remaining} ${formatPrice(FREE_SHIPPING_THRESHOLD-subtotal)}`}</p></div>
    </section>
    <aside className="ort-cart-summary" aria-label={tr.summary}><h2>{tr.summary}</h2>
     <div className="ort-cart-totals"><div><span>{tr.subtotal} ({quantity} {tr.items})</span><strong>{formatPrice(subtotal)}</strong></div><div><span>{tr.delivery}</span><strong className="ort-cart-green">{subtotal>=FREE_SHIPPING_THRESHOLD?tr.free:tr.pending}</strong></div><div><span>{tr.discount}</span><strong className="ort-cart-green">− {formatPrice(discount)}</strong></div></div>
     <div className="ort-cart-grand"><span>{tr.grand}</span><strong>{formatPrice(total)}</strong></div>
     <form className="ort-cart-promo" onSubmit={applyCode}><label htmlFor="ort-cart-promo-input">{tr.promo}</label><div><input id="ort-cart-promo-input" value={promo} onChange={e=>setPromo(e.target.value)} placeholder={tr.promoPlaceholder}/><button className="button button-primary" type="submit">{tr.apply}</button></div><small>{tr.demoCode}</small>{promoMessage&&<p role="status" className={applied?'ort-cart-valid':'ort-cart-error'}>{promoMessage}</p>}{applied&&<button type="button" className="ort-cart-link" onClick={()=>{setApplied(false);setPromo('');setPromoMessage('')}}>{tr.removeCode}</button>}</form>
     <Link to="/finalizare-comanda" className="button button-primary ort-cart-checkout">{tr.checkout}<ArrowRight size={19}/></Link>
     <Link to="/solicita-consultatie" className="ort-cart-consult"><Headset size={20}/>{tr.consult}</Link>
     <div className="ort-cart-assurances"><div><LockKeyhole/><span><b>{tr.safe}</b><small>{tr.safeSub}</small></span></div><div><Truck/><span><b>{tr.fast}</b><small>{tr.fastSub}</small></span></div><div><Package/><span><b>{tr.returns}</b><small>{tr.returnsSub}</small></span></div></div>
     <p className="ort-cart-disclaimer">{tr.orderNote} {tr.shippingNote}</p>
    </aside>
   </div>
   <div className="ort-cart-promises"><span><ShieldCheck/>{tr.safe}</span><span><Truck/>{tr.fast}</span><span><Package/>{tr.returns}</span><span><Headset/>{tr.help}</span></div>
  </>:<div className="ort-cart-empty"><ShoppingCart size={52}/><h2>{tr.empty}</h2><p>{tr.emptyDesc}</p><Link to="/produse" className="button button-primary"><ArrowRight size={18}/>{tr.shop}</Link></div>}
  <section className="ort-cart-recommendations"><div className="ort-cart-recommend-head"><h2>{tr.suggest}</h2><Link to="/produse">{tr.all}<ArrowRight size={17}/></Link></div><div className="ort-cart-recommend-grid">{recommendations.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>
  <p className="ort-cart-demo-notice"><Tag size={14}/>{tr.stockHint}</p>
  </div>
 </main>;
}
