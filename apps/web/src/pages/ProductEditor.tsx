import {useEffect, useState} from 'react';
import type {FormEvent, ChangeEvent} from 'react';
import {ImagePlus, Save, X, AlertTriangle} from 'lucide-react';
import {categories, products, saveDemoProduct} from '../data/products';
import type {Product} from '../data/products';
import './ProductEditor.css';
import {prepareDemoImage} from '../utils/imageUpload';

type Values={id:string;nameRo:string;nameRu:string;descriptionRo:string;descriptionRu:string;specificationsRo:string;specificationsRu:string;category:string;retail:string;cost:string;discount:string;sizes:string;image:string;active:boolean};
export type ProductSave={product:Product;cost:number;stock:number;stockBySize:Record<string,number>;active:boolean};
const numbers=(value:string)=>Number(value.replace(',','.'));
export default function ProductEditor({product,onClose,onSave,initialCost=0,initialStock=0,initialActive=true,initialStockBySize}:{product?:Product|null;onClose:()=>void;onSave:(data:ProductSave)=>void;initialCost?:number;initialStock?:number;initialStockBySize?:Record<string,number>;initialActive?:boolean}){
 const existing=!!product;
 const [v,setV]=useState<Values>(()=>({id:product?.id??'',nameRo:product?.nameRo??'',nameRu:product?.nameRu??'',descriptionRo:product?.descriptionRo??'',descriptionRu:product?.descriptionRu??'',specificationsRo:product?.specificationsRo??'',specificationsRu:product?.specificationsRu??'',category:product?.category??'knee',retail:String(product?.retailPrice??product?.oldPrice??product?.price??''),cost:String(initialCost),discount:String(product?.promoPercent??(product?.oldPrice?Math.round((1-product.price/product.oldPrice)*100):0)),sizes:(product?.sizes??['S','M','L','XL']).join(', '),image:product?.image??'',active:initialActive}));
 const [gallery,setGallery]=useState<string[]>(()=>product?.gallery?.length?product.gallery:[product?.image??''].filter(Boolean));
 const [stockBySize,setStockBySize]=useState<Record<string,string>>(()=>Object.fromEntries((product?.sizes??['S','M','L','XL']).map(size=>[size,String(initialStockBySize?.[size]??0)])));
 const sizesForStock=[...new Set(v.sizes.split(/[,;\n]+/).map(size=>size.trim()).filter(Boolean))];
 const updateSizeStock=(size:string,numberText:string)=>setStockBySize(prev=>({...prev,[size]:numberText}));
 const totalStock=sizesForStock.reduce((sum,size)=>sum+(Number(stockBySize[size])||0),0);
 const legacyStock=!!product && !initialStockBySize && initialStock>0;
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const update=<K extends keyof Values>(key:K,value:Values[K])=>setV(old=>({...old,[key]:value}));
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
 const retail=numbers(v.retail);const cost=numbers(v.cost);const discount=numbers(v.discount);const finalPrice=Math.round(retail*(1-discount/100)*100)/100;
 const margin=finalPrice>0?(finalPrice-cost)/finalPrice*100:0;
 const loadGallery=async(e:ChangeEvent<HTMLInputElement>)=>{
  const files=Array.from(e.currentTarget.files??[]);
  e.currentTarget.value='';
  if(!files.length)return;
  if(gallery.length+files.length>6){setError('Maximum 6 fotografii pentru un produs.');return;}
  setBusy(true);setError('');
  try {
   const images=await Promise.all(files.map(file=>prepareDemoImage(file,1200)));
   setGallery(old=>[...old,...images].slice(0,6));
  } catch(ex) {
   setError(ex instanceof Error?ex.message:'Nu au putut fi citite fotografiile.');
  } finally {setBusy(false);}
 };
 const addImageUrl=()=>{
  const url=v.image.trim();if(!url)return;
  if(gallery.length>=6){setError('Maximum 6 fotografii.');return}
  setGallery(old=>[...old,url]);setError('');
 };
 const submit=(e:FormEvent)=>{e.preventDefault();if(busy)return;
  const id=v.id.trim().toUpperCase();const category=v.category;
  if(!/^[A-Z0-9][A-Z0-9_.-]{1,39}$/.test(id)){setError('Codul SKU trebuie să conțină 2–40 caractere: litere, cifre, -, _ sau .');return}
  if(!existing&&products.some(p=>p.id.toUpperCase()===id)){setError('Acest SKU există deja. Introduceți un cod unic.');return}
  if(!v.nameRo.trim()){setError('Introduceți denumirea în română.');return}
  if(!Number.isFinite(retail)||retail<=0||!Number.isFinite(cost)||cost<0||!Number.isFinite(discount)||discount<0||discount>90){setError('Verificați prețurile și reducerea (0–90%).');return}

  const sizes=v.sizes.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
  if(!sizes.length){setError('Introduceți cel puțin o mărime sau varianta Universal.');return}
  const normalizedStock:Record<string,number>={};
  for(const size of sizes){
   const raw=stockBySize[size]??'0';
   if(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)>999999){setError('Stocul pentru '+size+' trebuie să fie un număr întreg între 0 și 999999.');return}
   normalizedStock[size]=Number(raw);
  }
  if(legacyStock&&Object.values(normalizedStock).every(q=>q===0)&&!window.confirm('Stocul vechi '+initialStock+' buc. nu este repartizat pe mărimi. Salvați toate mărimile cu 0?'))return;
  const images=gallery.filter(Boolean);
  const primaryImage=images[0]??v.image.trim()??'';
  const productSaved:Product={id,descriptionRo:v.descriptionRo.trim(),descriptionRu:v.descriptionRu.trim(),specificationsRo:v.specificationsRo.trim(),specificationsRu:v.specificationsRu.trim(),gallery:images.length?images:undefined,nameRo:v.nameRo.trim(),nameRu:v.nameRu.trim()||v.nameRo.trim(),category,price:finalPrice,retailPrice:retail,promoPercent:discount,oldPrice:discount>0?retail:undefined,badge:discount>0?'sale':undefined,image:primaryImage||'/ortomed/images/product-1.webp',sizes:[...new Set(sizes)],demoCustom:true};
  try{setBusy(true);saveDemoProduct(productSaved);onSave({product:productSaved,cost,stock:totalStock,stockBySize:normalizedStock,active:v.active})}catch{setError('Nu s-a putut salva în browser. Verificați spațiul localStorage (folosiți o fotografie mai mică).');setBusy(false)}
 };
 return <div className="opd-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form className="opd-modal" onSubmit={submit} aria-label="Formular produs" noValidate>
  <header className="opd-header"><div><small>ORTOMED · CATALOG</small><h2>{existing?'Editează produsul':'Adaugă produs nou'}</h2><p>Prețuri, promoții și date de bază pentru catalogul online.</p></div><button type="button" className="opd-close" onClick={onClose} aria-label="Închide"><X size={22}/></button></header>
  <div className="opd-body"><div className="opd-grid">
   <label>Cod produs / SKU *<input value={v.id} onChange={e=>update('id',e.target.value)} placeholder="HL048" readOnly={existing} required/></label>
   <label>Categorie *<select value={v.category} onChange={e=>update('category',e.target.value)}>{categories.map(c=><option key={c.id} value={c.id}>{c.ro}</option>)}</select></label>
   <label className="opd-span">Denumire în română *<input required value={v.nameRo} onChange={e=>update('nameRo',e.target.value)} placeholder="Orteză pentru gleznă"/></label>
   <label className="opd-span">Название на русском<input value={v.nameRu} onChange={e=>update('nameRu',e.target.value)} placeholder="Ортез голеностопного сустава"/></label>
   <label className="opd-span">Descriere produs (română)<textarea rows={5} value={v.descriptionRo} onChange={e=>update('descriptionRo',e.target.value)} placeholder="Descriere, destinație și caracteristici verificate ale produsului"/></label>
   <label className="opd-span">Описание товара (русский)<textarea rows={5} value={v.descriptionRu} onChange={e=>update('descriptionRu',e.target.value)} placeholder="Описание, назначение и подтверждённые характеристики"/></label>
   <label className="opd-span">Specificații suplimentare (română, o caracteristică pe rând)<textarea rows={3} value={v.specificationsRo} onChange={e=>update('specificationsRo',e.target.value)} placeholder={'Material: ...\nCuloare: ...'}/></label>
   <label className="opd-span">Дополнительные характеристики (русский, одна на строку)<textarea rows={3} value={v.specificationsRu} onChange={e=>update('specificationsRu',e.target.value)} placeholder={'Материал: ...\nЦвет: ...'}/></label>
   <label>Cost de achiziție, MDL *<input type="number" min="0" step="0.01" value={v.cost} onChange={e=>update('cost',e.target.value)}/></label>
   <label>Preț retail, MDL *<input type="number" min="0.01" step="0.01" value={v.retail} onChange={e=>update('retail',e.target.value)} required/></label>
   <label>Reducere promoțională (%)<input type="number" min="0" max="90" step="0.5" value={v.discount} onChange={e=>update('discount',e.target.value)}/></label>

   <label className="opd-span">Mărimi disponibile (separate prin virgulă)<input value={v.sizes} onChange={e=>update('sizes',e.target.value)} placeholder="S, M, L, XL"/></label>
   <div className="opd-span opd-size-stock"><div className="opd-size-stock-header"><div><strong>Stoc pe fiecare mărime</strong><small>Introduceți cantitatea pentru fiecare mărime disponibilă.</small></div><strong>Total: {totalStock} buc.</strong></div>
     {legacyStock&&<div className="opd-legacy">Stocul vechi: {initialStock} buc. fără mărimi. Repartizați-l manual pentru a înlocui evidența veche; nimic nu este alocat automat.</div>}
     <div className="opd-stock-grid">{sizesForStock.map(size=><label key={size}>Mărime {size}<input type="number" inputMode="numeric" min="0" step="1" max="999999" value={stockBySize[size]??'0'} onChange={e=>updateSizeStock(size,e.target.value)}/>{(Number(stockBySize[size])||0)===0&&<small>Stoc epuizat</small>}</label>)}</div>
   </div>
   <label className="opd-span">Imagine produs: adresă URL sau cale /public<input value={v.image.startsWith('data:')?'(fotografie încărcată)':v.image} readOnly={v.image.startsWith('data:')} onChange={e=>update('image',e.target.value)} placeholder="/ortomed/images/HL048.webp"/></label>
   <div className="opd-span opd-gallery-editor">
     <div><strong>Galerie foto (până la 6 imagini)</strong><p>Prima imagine este fotografia principală afișată în catalog. Puteți schimba ordinea și elimina fotografii.</p></div>
     <div className="opd-gallery-actions"><label><ImagePlus size={17}/> Adaugă fotografii (max. 2 MB fiecare; optimizare automată)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={loadGallery}/></label><button type="button" onClick={addImageUrl}>Adaugă URL / cale</button></div>
     <div className="opd-gallery-list">{gallery.map((src,index)=><div key={index} className="opd-gallery-item"><img src={src} alt={'Foto '+(index+1)}/><small>{index===0?'Principală':'Foto '+(index+1)}</small><div><button type="button" disabled={index===0} title="Setează ca foto principală" onClick={()=>setGallery(prev=>[src,...prev.filter((_,i)=>i!==index)])}>★</button><button type="button" disabled={index===gallery.length-1} onClick={()=>setGallery(prev=>{const next=[...prev];[next[index],next[index+1]]=[next[index+1],next[index]];return next})}>→</button><button type="button" aria-label="Elimină fotografia" onClick={()=>setGallery(prev=>prev.filter((_,i)=>i!==index))}>×</button></div></div>)}</div>
   </div>
  </div>
  <section className="opd-summary"><div><span>Preț obișnuit</span><strong>{Number.isFinite(retail)?retail.toFixed(2):'—'} MDL</strong></div><div><span>Preț promoțional</span><strong>{Number.isFinite(finalPrice)?finalPrice.toFixed(2):'—'} MDL</strong></div><div><span>Marjă estimată</span><strong className={margin<0?'opd-negative':''}>{Number.isFinite(margin)?margin.toFixed(1):'—'}%</strong></div></section>
  {error&&<p className="opd-error" role="alert"><AlertTriangle size={16}/>{error}</p>}
  <p className="opd-notice">DEMO: descrierile și fotografiile se salvează local în browser. Produsele publice sunt salvate în acest browser; costul intern este salvat separat în admin. Datele nu ajung pe server. După salvare reîncărcați pagina magazinului ca să vedeți produsul nou.</p></div>
  <footer className="opd-actions"><button type="button" className="opd-cancel" onClick={onClose}>Anulează</button><button type="submit" className="opd-save" disabled={busy}><Save size={17}/> Salvează produsul</button></footer>
 </form></div>;
}
