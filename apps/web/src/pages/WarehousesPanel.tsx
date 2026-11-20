import {useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowRightLeft,Building2,CheckCircle2,MapPin,PackageCheck,Plus,Send,Truck,ShieldAlert} from 'lucide-react';
import {products} from '../data/products';
import './WarehousesPanel.css';

export type BranchWarehouse={id:string;name:string;city:string;address:string;active:boolean;createdAt:string};
export type WarehouseTransfer={id:string;documentId?:string;from:string;to:string;sku:string;size:string;qty:number;status:'in_transit'|'received';sentAt:string;receivedAt?:string;note:string;recipient?:string};
export type WarehouseStockItem={id:string;stock:number;stockBySize?:Record<string,number>};
type Props={warehouses:BranchWarehouse[];transfers:WarehouseTransfer[];items:WarehouseStockItem[];onCreateBranch:(branch:BranchWarehouse)=>void;onDispatchBatch:(lines:WarehouseTransfer[])=>string|null;onReceiveBatch:(ids:string[])=>void};
const central={id:'central',name:'ORTOMED Bălți — Depozit central',city:'Bălți'};
const fmt=(n:number)=>new Intl.NumberFormat('ro-MD').format(n);
export default function WarehousesPanel({warehouses,transfers,items,onCreateBranch,onDispatchBatch,onReceiveBatch}:Props){
 const [view,setView]=useState<'stock'|'transfer'|'history'>('stock');
 const [warehouseId,setWarehouseId]=useState('central');
 const [showBranch,setShowBranch]=useState(false);
 const [branchName,setBranchName]=useState('');const [branchCity,setBranchCity]=useState('');const [branchAddress,setBranchAddress]=useState('');
 const [sku,setSku]=useState(products[0]?.id??'');const [amounts,setAmounts]=useState<Record<string,string>>({});const [to,setTo]=useState('');const [note,setNote]=useState('');
 const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [reserveBySkuSize,setReserveBySkuSize]=useState<Record<string,number>>(()=>{
   try {const data=localStorage.getItem('ortomed_demo_central_reserve_v1');return data?JSON.parse(data) as Record<string,number>:{};}catch{return {};}
 });
 const reserveKey=(p:string,s:string)=>`${p}::${s}`;
 const minReserve=(p:string,s:string)=>reserveBySkuSize[reserveKey(p,s)]??1;
 const updateReserve=(p:string,s:string,raw:string)=>{
   const parsed=Number(raw);const next=Number.isFinite(parsed)?Math.max(0,Math.min(999999,Math.trunc(parsed))):0;
   setReserveBySkuSize(previous=>{const updated={...previous,[reserveKey(p,s)]:next};try{localStorage.setItem('ortomed_demo_central_reserve_v1',JSON.stringify(updated));}catch{}return updated;});
   setError('');
 };

 const selectedProduct=products.find(p=>p.id===sku);
 const getQty=(s:string)=>amounts[s]??'';
 const setSizeQty=(s:string,raw:string)=>{setAmounts(old=>({...old,[s]:raw}));setError('');};
 const candidateLines=(selectedProduct?.sizes??[]).filter(s=>getQty(s).trim()!=='' && Number(getQty(s))>0);
 const invalidQuantity=(selectedProduct?.sizes??[]).some(s=>getQty(s).trim()!=='' && (!/^\d+$/.test(getQty(s)) || !Number.isSafeInteger(Number(getQty(s))) || Number(getQty(s))<1 || Number(getQty(s))>999999));
 const invalidStock=candidateLines.some(s=>Number(getQty(s))>Math.max(0,(items.find(i=>i.id===sku)?.stockBySize?.[s]??0)-minReserve(sku,s)));
 const selectedTotal=candidateLines.reduce((n,s)=>n+Number(getQty(s)),0);
 const canSend=!!to && candidateLines.length>0 && !invalidQuantity && !invalidStock;
 const getCentral=(productId:string,s:string)=>{const item=items.find(i=>i.id===productId);return item?.stockBySize?.[s]??0};
 const getBranch=(branchId:string,productId:string,s:string)=>transfers.filter(t=>t.status==='received'&&t.to===branchId&&t.sku===productId&&t.size===s).reduce((n,t)=>n+t.qty,0);
 const stock=(warehouse:string,productId:string,s:string)=>warehouse==='central'?getCentral(productId,s):getBranch(warehouse,productId,s);
 const filteredStocks=useMemo(()=>products.flatMap(p=>p.sizes.map(s=>({sku:p.id,name:p.nameRo,size:s,qty:stock(warehouseId,p.id,s)}))).filter(x=>x.qty>0),[warehouseId,items,transfers]);
 const total=filteredStocks.reduce((s,r)=>s+r.qty,0);
 const createBranch=(e:FormEvent)=>{e.preventDefault();if(!branchName.trim()||!branchCity.trim())return;const id='branch-'+Date.now();onCreateBranch({id,name:branchName.trim(),city:branchCity.trim(),address:branchAddress.trim(),active:true,createdAt:new Date().toISOString()});setWarehouseId(id);setBranchName('');setBranchCity('');setBranchAddress('');setShowBranch(false);setNotice('Filiala a fost creată (DEMO).');setError('')};
 const dispatch=(e:FormEvent)=>{
   e.preventDefault();setError('');setNotice('');
   if(!to||!warehouses.some(w=>w.id===to&&w.active)){setError('Alegeți filiala de destinație.');return;}
   if(candidateLines.length===0 || invalidQuantity){setError('Introduceți cel puțin o cantitate validă, întreagă și pozitivă.');return;}
   if(invalidStock){setError('Unele mărimi depășesc cantitatea transferabilă cu rezerva minimă.');return;}
   const documentId='TR-'+Date.now();const sentAt=new Date().toISOString();
   const lines:WarehouseTransfer[]=candidateLines.map((s,i)=>({id:documentId+'-'+String(i+1).padStart(2,'0'),documentId,from:'central',to,sku,size:s,qty:Number(getQty(s)),status:'in_transit',sentAt,note:note.trim()}));
   const problem=onDispatchBatch(lines);
   if(problem){setError(problem);return;}
   setAmounts({});setNote('');setNotice('Transfer '+documentId+' expediat: '+selectedTotal+' buc. în '+candidateLines.length+' mărimi. Toate sunt în tranzit până la confirmarea recepției.');setView('history');
 };
 const transferGroups=useMemo(()=>{
  const groups=new Map<string,WarehouseTransfer[]>();
  for(const transfer of transfers){const key=transfer.documentId??transfer.id;groups.set(key,[...(groups.get(key)??[]),transfer]);}
  return Array.from(groups.entries()).reverse();
 },[transfers]);
 return <div className="ow-root">
  <div className="ow-heading"><div><h2>Filiale și transferuri între depozite</h2><p>Magazinul ORTOMED Bălți este depozitul central. Fiecare filială are stoc propriu pe SKU și mărime.</p></div><button className="ow-primary" onClick={()=>setShowBranch(true)}><Plus size={17}/> Adaugă filială</button></div>
  <div className="ow-disclaimer">DEMO: evidența este locală în acest browser. Filialele și disponibilitatea nu sunt încă publicate pe site; nu există transport real, rezervări sau documente fiscale.</div>
  <div className="ow-locations"><button className={'ow-location '+(warehouseId==='central'?'active':'')} onClick={()=>{setWarehouseId('central');setView('stock')}}><Building2 size={19}/><strong>{central.name}</strong><small>Bălți · depozit principal</small></button>{warehouses.map(w=><button key={w.id} className={'ow-location '+(warehouseId===w.id?'active':'')} onClick={()=>{setWarehouseId(w.id);setView('stock')}}><MapPin size={19}/><strong>{w.name}</strong><small>{w.city}{w.address?' · '+w.address:''}</small></button>)}</div>
  <div className="ow-tabs"><button className={view==='stock'?'active':''} onClick={()=>setView('stock')}>Stoc pe filială</button><button className={view==='transfer'?'active':''} onClick={()=>setView('transfer')}>Transfer nou</button><button className={view==='history'?'active':''} onClick={()=>setView('history')}>Transferuri / recepții <span>{transfers.filter(t=>t.status==='in_transit').length}</span></button></div>
  {error&&<div className="ow-error" role="alert">{error}</div>}{notice&&<div className="ow-notice" role="status">{notice}</div>}
  {view==='stock'&&<section className="ow-card"><div className="ow-card-heading"><h3>{warehouseId==='central'?central.name:warehouses.find(w=>w.id===warehouseId)?.name} — stoc disponibil</h3><strong>{fmt(total)} buc.</strong></div><div className="ow-tablewrap"><table><thead><tr><th>Cod / SKU</th><th>Produs</th><th>Mărime</th><th>Cantitate</th></tr></thead><tbody>{filteredStocks.map(x=><tr key={x.sku+'-'+x.size}><td><b>{x.sku}</b></td><td>{x.name}</td><td>{x.size}</td><td><b>{fmt(x.qty)} buc.</b></td></tr>)}</tbody></table>{filteredStocks.length===0&&<p className="ow-empty">Nu există stoc recepționat pentru această locație. Pentru depozitul central, repartizați mai întâi stocul pe mărimi.</p>}</div><p className="ow-hint">Stocul „în tranzit” nu este inclus nici în stocul central, nici în cel recepționat la filială.</p></section>}
  {view==='transfer'&&<section className="ow-card"><h3><ArrowRightLeft size={19}/> Transfer cu mai multe mărimi — o singură expediere</h3>
  <form onSubmit={dispatch} className="ow-form">
   <label>De la<input readOnly value={central.name}/></label>
   <label>Către filială<select required value={to} onChange={e=>setTo(e.target.value)}><option value="">Selectează filiala</option>{warehouses.filter(w=>w.active).map(w=><option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}</select></label>
   <label className="ow-wide">Produs / SKU<select value={sku} onChange={e=>{setSku(e.target.value);setAmounts({});setError('')}}>{products.map(p=><option key={p.id} value={p.id}>{p.id} · {p.nameRo}</option>)}</select></label>
   <div className="ow-wide ow-stock-preview">
    <div className="ow-preview-title"><div><h4>Introduceți cantitatea pentru fiecare mărime</h4><p>Completați doar mărimile care trebuie expediate. Celelalte rămân pe stocul central.</p></div><ShieldAlert size={21}/></div>
    <div className="ow-batch-tablewrap"><table className="ow-batch-table"><thead><tr><th>Mărime</th><th>Stoc Bălți</th><th>Rezervă minimă</th><th>Transferabil</th><th>Cantitate de expediat</th><th>Rămâne în Bălți</th></tr></thead><tbody>
    {selectedProduct?.sizes.map(s=>{const available=getCentral(sku,s);const reserve=minReserve(sku,s);const transferable=Math.max(0,available-reserve);const entered=getQty(s);const amount=Number(entered)||0;const invalid=entered.trim()!==''&&(!/^\d+$/.test(entered)||amount>transferable||amount>999999);return <tr key={s} className={invalid?'ow-batch-invalid':''}>
     <td><strong>{s}</strong></td><td>{available} buc.</td>
     <td><input className="ow-batch-reserve" aria-label={'Rezerva '+s} type="number" min="0" max="999999" step="1" value={reserve} onChange={e=>updateReserve(sku,s,e.target.value)}/></td>
     <td className={transferable>0?'ow-can':'ow-cannot'}><strong>{transferable} buc.</strong></td>
     <td><div className="ow-batch-qty"><button type="button" aria-label={'Scade '+s} onClick={()=>setSizeQty(s,String(Math.max(0,amount-1)))} disabled={amount<=0}>−</button><input aria-label={'Cantitate mărimea '+s} inputMode="numeric" type="number" min="0" step="1" max={transferable} placeholder="0" value={entered} onChange={e=>setSizeQty(s,e.target.value)}/><button type="button" aria-label={'Adaugă '+s} onClick={()=>setSizeQty(s,String(Math.min(transferable,amount+1)))} disabled={amount>=transferable}>+</button></div></td>
     <td><strong className={invalid?'ow-cannot':''}>{Math.max(0,available-amount)} buc.</strong></td>
    </tr>})}</tbody></table></div>
    <p className="ow-hint">Rezerva implicită este 1 bucată pe mărime; administratorul o poate ajusta, inclusiv la 0. Zero în câmpul de expediere înseamnă că mărimea nu intră în transfer.</p>
   </div>
   <div className="ow-wide ow-batch-summary"><span>Mărimi selectate: <strong>{candidateLines.length}</strong></span><span>Total de expediat: <strong>{fmt(selectedTotal)} buc.</strong></span><span className={invalidQuantity||invalidStock?'ow-cannot':'ow-can'}>{invalidQuantity||invalidStock?'Corectați cantitățile marcate.':'Verificat față de stoc și rezervă.'}</span></div>
   <label className="ow-wide">Observații / curier (opțional)<textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex. curier, număr colet, instrucțiuni..."/></label>
   <div className="ow-wide"><button type="submit" className="ow-primary" disabled={!canSend}><Send size={17}/> Expediere {selectedTotal>0?'('+fmt(selectedTotal)+' buc.)':''} către filială</button></div>
  </form></section>}
  {view==='history'&&<section className="ow-card"><h3><Truck size={19}/> Transferuri și recepții — pe document</h3><div className="ow-tablewrap"><table><thead><tr><th>Document</th><th>Destinație</th><th>Produs / mărimi</th><th>Total</th><th>Status</th><th>Acțiune</th></tr></thead><tbody>{transferGroups.map(([documentId,lines])=>{const first=lines[0];const pending=lines.filter(t=>t.status==='in_transit');return <tr key={documentId}><td><b>{documentId}</b><small>{new Date(first.sentAt).toLocaleString('ro-MD')}</small></td><td>{warehouses.find(w=>w.id===first.to)?.name??first.to}</td><td><b>{first.sku}</b>{lines.map(t=><small key={t.id}>Mărime {t.size}: {t.qty} buc.</small>)}</td><td><b>{fmt(lines.reduce((n,t)=>n+t.qty,0))} buc.</b></td><td><span className={'ow-status '+(pending.length===0?'received':'transit')}>{pending.length===0?'Recepționat':pending.length===lines.length?'În tranzit':'Parțial recepționat'}</span></td><td>{pending.length>0?<button className="ow-outline" onClick={()=>{if(window.confirm('Confirmați recepția fizică a tuturor celor '+pending.reduce((n,t)=>n+t.qty,0)+' bucăți din documentul '+documentId+'?')){onReceiveBatch(pending.map(t=>t.id));setNotice('Recepția integrală pentru '+documentId+' a fost confirmată (DEMO).')}}}><PackageCheck size={16}/> Confirmă tot</button>:<span className="ow-done"><CheckCircle2 size={16}/> Finalizat</span>}</td></tr>})}</tbody></table>{transfers.length===0&&<p className="ow-empty">Niciun transfer înregistrat.</p>}</div></section>}
  {showBranch&&<div className="ow-backdrop" onClick={()=>setShowBranch(false)}><form className="ow-modal" onSubmit={createBranch} onClick={e=>e.stopPropagation()}><h3>Adaugă filială ORTOMED</h3><label>Denumire filială *<input required maxLength={90} value={branchName} onChange={e=>setBranchName(e.target.value)} placeholder="ORTOMED Sîngerei"/></label><label>Oraș *<input required maxLength={70} value={branchCity} onChange={e=>setBranchCity(e.target.value)} placeholder="Sîngerei"/></label><label>Adresă filială<input maxLength={180} value={branchAddress} onChange={e=>setBranchAddress(e.target.value)} placeholder="Stradă, număr"/></label><div className="ow-modal-actions"><button className="ow-outline" type="button" onClick={()=>setShowBranch(false)}>Anulează</button><button className="ow-primary" type="submit"><Plus size={16}/> Creează filiala</button></div></form></div>}
 </div>;
}
