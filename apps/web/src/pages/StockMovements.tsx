import {useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowDownToLine, ArrowUpFromLine, ClipboardList, Download, PackageCheck, RotateCcw, ShieldAlert} from 'lucide-react';
import {products} from '../data/products';
import './StockMovements.css';

export type StockItem={id:string;cost:number;stock:number;stockBySize?:Record<string,number>;active:boolean};
export type StockMovement={id:string;date:string;type:'receipt'|'writeoff'|'return'|'correction';sku:string;size:string;quantity:number;before:number;after:number;costAtTime:number;reference:string;note:string};

type Props={items:StockItem[];movements:StockMovement[];onCommit:(nextItems:StockItem[],movement:StockMovement)=>void;selectedSku:string;onSelectSku:(sku:string)=>void};
const fmt=(value:number)=>new Intl.NumberFormat('ro-MD',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value)+' MDL';
const labels={receipt:'Recepție marfă',writeoff:'Ieșire / consum',return:'Retur în stoc',correction:'Corecție inventar'};
const safeNumber=(v:string)=>/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)>0&&Number(v)<=999999;
function csv(name:string,records:string[][]){const text='\ufeff'+records.map(row=>row.map(v=>'"'+v.replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export default function StockMovements({items,movements,onCommit,selectedSku,onSelectSku}:Props){
 const [kind,setKind]=useState<StockMovement['type']>('receipt');
 const [size,setSize]=useState('');
 const [quantity,setQuantity]=useState('1');
 const [unitCost,setUnitCost]=useState('');
 const [reference,setReference]=useState('');
 const [note,setNote]=useState('');
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const product=products.find(p=>p.id===selectedSku)??products[0];
 const current=items.find(i=>i.id===product?.id);
 const selectedSize=product?.sizes.includes(size)?size:(product?.sizes[0]??'Universal');
 const currentQty=current?.stockBySize?.[selectedSize]??0;
 const legacy=!!current&&!current.stockBySize&&current.stock>0;
 const latest=useMemo(()=>[...movements].reverse(),[movements]);
 const process=(event:FormEvent)=>{
  event.preventDefault();setError('');setSuccess('');
  if(!product){setError('Nu există produse în catalog.');return}
  if(legacy){setError('Stocul acestui produs nu este distribuit pe mărimi. Distribuiți-l mai întâi în „Produse și stocuri”, fără a inventa cantități.');return}
  if(!safeNumber(quantity)){setError('Cantitatea trebuie să fie un număr întreg între 1 și 999999.');return}
  if(!reference.trim()){setError('Introduceți numărul documentului sau referința operațiunii.');return}
  if(kind==='correction'&&!note.trim()){setError('Pentru corecție este obligatorie explicația.');return}
  if(kind==='return'&&!note.trim()){setError('Precizați motivul returului.');return}
  const q=Number(quantity);
  const delta=kind==='writeoff'||kind==='correction'?-q:q;
  if(currentQty+delta<0){setError(`Stoc insuficient pentru mărimea ${selectedSize}: disponibil ${currentQty} buc.`);return}
  if(currentQty+delta>999999){setError('Stocul maxim per mărime este 999999 buc.');return}
  const costValue=unitCost.trim()?Number(unitCost.replace(',','.')):(current?.cost??0);
  if(!Number.isFinite(costValue)||costValue<0||costValue>100000000){setError('Costul unitar trebuie să fie un număr pozitiv valid.');return}
  const existing=current??{id:product.id,cost:0,stock:0,active:true};
  const sizes={...existing.stockBySize,[selectedSize]:currentQty+delta};
  const nextItem={...existing,stockBySize:sizes,stock:Object.values(sizes).reduce((acc,v)=>acc+v,0),cost:kind==='receipt'?costValue:existing.cost};
  const nextItems=[...items.filter(i=>i.id!==product.id),nextItem];
  const movement:StockMovement={id:crypto.randomUUID(),date:new Date().toISOString(),type:kind,sku:product.id,size:selectedSize,quantity:delta,before:currentQty,after:currentQty+delta,costAtTime:costValue,reference:reference.trim().slice(0,100),note:note.trim().slice(0,500)};
  onCommit(nextItems,movement);setSuccess(`Înregistrat: ${kind==='writeoff'||kind==='correction'?'−':'+'}${q} buc. / ${product.id} / ${selectedSize}. Stoc nou: ${nextItem.stockBySize[selectedSize]} buc.`);
  setQuantity('1');setReference('');setNote('');setUnitCost('');
 };
 return <section className="osm-panel">
  <div className="osm-heading"><div><h2>Mișcări de stoc pe mărimi</h2><p>Recepții, ieșiri, retururi și ajustări cu istoric. Operațiunile sunt exclusiv demonstrative și nu sunt legate de comenzi reale.</p></div><button type="button" className="osm-secondary" onClick={()=>csv('ortomed_miscari_stoc_demo.csv',[['Data','Tip','SKU','Mărime','Diferență','Înainte','După','Cost MDL','Document','Notă'],...movements.map(m=>[m.date,labels[m.type],m.sku,m.size,String(m.quantity),String(m.before),String(m.after),String(m.costAtTime),m.reference,m.note])])}><Download size={17}/> Export CSV</button></div>
  <div className="osm-warning"><ShieldAlert size={20}/><span><b>DEMO, nu contabilitate.</b> Nu sunt create partide FIFO, documente fiscale sau livrări reale. Operațiunile modifică numai stocurile locale din acest browser. Costul înregistrat aici este orientativ, nu o evaluare contabilă pe loturi.</span></div>
  <div className="osm-columns"><form className="osm-form" onSubmit={process}><h3>Înregistrează mișcare</h3>
   <label>Tip operațiune<select value={kind} onChange={e=>{setKind(e.target.value as StockMovement['type']);setSuccess('');setError('')}}><option value="receipt">Recepție (+)</option><option value="writeoff">Ieșire / consum (−)</option><option value="return">Retur în stoc (+)</option><option value="correction">Corecție minus (−)</option></select></label>
   <label>Produs / SKU<select value={product?.id??''} onChange={e=>{onSelectSku(e.target.value);setSize('');setSuccess('');setError('')}}>{products.map(p=><option key={p.id} value={p.id}>{p.id} · {p.nameRo}</option>)}</select></label>
   <div className="osm-two"><label>Mărime<select value={selectedSize} onChange={e=>{setSize(e.target.value);setError('')}}>{(product?.sizes??[]).map(v=><option key={v} value={v}>{v}</option>)}</select></label><label>Cantitate<input type="number" inputMode="numeric" step="1" min="1" max="999999" value={quantity} onChange={e=>setQuantity(e.target.value)} required/></label></div>
   <div className="osm-stock-summary"><span>Stoc actual — {selectedSize}</span><strong>{legacy?'Nerepartizat':currentQty+' buc.'}</strong></div>
   {kind==='receipt'&&<label>Cost unitar orientativ, MDL<input type="number" min="0" step="0.01" placeholder={String(current?.cost??0)} value={unitCost} onChange={e=>setUnitCost(e.target.value)}/><small>În această versiune se actualizează doar costul de referință al produsului, nu costul istoric al loturilor.</small></label>}
   <label>Document / referință *<input required maxLength={100} value={reference} placeholder="Ex.: AVIZ-2026-001" onChange={e=>setReference(e.target.value)}/></label>
   <label>Notă / motiv {kind==='return'||kind==='correction'?'*':''}<textarea rows={3} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Furnizor, motiv, observații..."/></label>
   {error&&<p role="alert" className="osm-error">{error}</p>}{success&&<p role="status" className="osm-success">{success}</p>}
   <button className="osm-submit" type="submit" disabled={legacy||!product}>{kind==='receipt'?<ArrowDownToLine size={18}/>:kind==='return'?<RotateCcw size={18}/>:<ArrowUpFromLine size={18}/>} Înregistrează operațiunea</button>
  </form>
  <div className="osm-side"><h3>Stoc disponibil pe mărimi</h3><p className="osm-name">{product?.nameRo} · {product?.id}</p>{legacy?<p className="osm-error">Există {current?.stock} buc. nerepartizate. Repartizați manual în fișa de stoc înainte de înregistrarea mișcărilor.</p>:<div className="osm-sizes">{(product?.sizes??[]).map(s=><div key={s}><b>{s}</b><strong>{current?.stockBySize?.[s]??0} buc.</strong><span className={(current?.stockBySize?.[s]??0)===0?'osm-out':''}>{(current?.stockBySize?.[s]??0)===0?'Stoc epuizat':'Disponibil'}</span></div>)}</div>}<div className="osm-total"><PackageCheck size={21}/> Total: <strong>{legacy?current?.stock??0:Object.values(current?.stockBySize??{}).reduce((a,b)=>a+b,0)} buc.</strong></div></div></div>
  <div className="osm-history"><h3><ClipboardList size={19}/> Istoric mișcări (demo)</h3><div className="osm-scroll"><table><thead><tr><th>Data</th><th>Operațiune</th><th>SKU / mărime</th><th>Document</th><th>Diferență</th><th>Înainte → după</th><th>Cost orientativ</th></tr></thead><tbody>{latest.length?latest.map(m=><tr key={m.id}><td>{new Date(m.date).toLocaleString('ro-MD')}</td><td>{labels[m.type]}{m.note&&<small title={m.note}> · {m.note}</small>}</td><td><b>{m.sku}</b> / {m.size}</td><td>{m.reference}</td><td className={m.quantity>=0?'osm-positive':'osm-negative'}>{m.quantity>0?'+':''}{m.quantity}</td><td>{m.before} → {m.after}</td><td>{fmt(m.costAtTime)}</td></tr>):<tr><td colSpan={7} className="osm-empty">Nu există mișcări înregistrate încă.</td></tr>}</tbody></table></div></div>
 </section>;
}
