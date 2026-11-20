import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {Archive, Ban, CheckCircle2, ChevronDown, Eye, FileText, Mail, MapPin, Phone, Plus, RotateCcw, Search, ShieldAlert, Trash2, UserRound, X} from 'lucide-react';
import './CustomersPanel.css';

type Partner = {id:string; name:string; idno:string; discount:number; status:'active'|'paused'; contact:string; email:string};
type Order = {id:string; partner:string; created:string; status:string; lines:{id:string;qty:number;unit:number}[]};
type ClientType='b2c'|'b2b';
type ClientState='active'|'blocked'|'archived';
type Customer={id:string;type:ClientType;name:string;company:string;idno:string;phone:string;email:string;city:string;address:string;notes:string;status:ClientState;blockReason:string;created:string;};
type Props={partners:Partner[]; orders:Order[]; onPartnerStatusChange:(id:string,status:'active'|'paused')=>void; onOpenOrder:(id:string)=>void; onAddB2B:()=>void; readOnly?:boolean; onAudit?:(action:string,target:string,details:string)=>void;};
const initialRetail:Customer[]=[
 {id:'retail',type:'b2c',name:'Client retail (DEMO)',company:'',idno:'',phone:'',email:'',city:'Bălți',address:'',notes:'Înregistrare demonstrativă asociată comenzii DEMO-1002.',status:'active',blockReason:'',created:'2026-11-18'},
 {id:'b2c-demo-2',type:'b2c',name:'Client exemplu B2C (DEMO)',company:'',idno:'',phone:'',email:'',city:'Chișinău',address:'',notes:'Client fictiv fără comenzi.',status:'active',blockReason:'',created:'2026-11-19'}
];
const storageKey='ortomed_admin_demo_clients_v2';
const currency=(amount:number)=>new Intl.NumberFormat('ro-MD',{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)+' MDL';
const copy=<T,>(value:T):T=>JSON.parse(JSON.stringify(value)) as T;
function useCustomers(){
 const [records,setRecords]=useState<Customer[]>(()=>{try{const raw=localStorage.getItem(storageKey);return raw?JSON.parse(raw) as Customer[]:copy(initialRetail)}catch{return copy(initialRetail)}});
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(records))}catch{/* Local browser storage unavailable */}},[records]);
 return [records,setRecords] as const;
}
const blank=():Customer=>({id:'b2c-'+Date.now(),type:'b2c',name:'',company:'',idno:'',phone:'',email:'',city:'',address:'',notes:'',status:'active',blockReason:'',created:new Date().toISOString().slice(0,10)});
const statusLabel:Record<ClientState,string>={active:'Activ',blocked:'Blocat',archived:'Arhivat'};
const safe=(v:string)=>v.trim()||'Necompletat';
export default function CustomersPanel({partners,orders,onPartnerStatusChange,onOpenOrder,onAddB2B,readOnly=false,onAudit}:Props){
 const [retail,setRetail]=useCustomers();
 const [partnerProfiles,setPartnerProfiles]=useState<Record<string,Partial<Customer>>>(()=>{try{return JSON.parse(localStorage.getItem('ortomed_admin_b2b_profiles_v2')||'{}') as Record<string,Partial<Customer>>}catch{return {}}});
 useEffect(()=>{try{localStorage.setItem('ortomed_admin_b2b_profiles_v2',JSON.stringify(partnerProfiles))}catch{/* noop */}},[partnerProfiles]);
 const [type,setType]=useState<'all'|ClientType>('all');
 const [filter,setFilter]=useState<'visible'|ClientState>('visible');
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<string|null>(null);
 const [editing,setEditing]=useState<Customer|null>(null);
 const [blockTarget,setBlockTarget]=useState<Customer|null>(null);
 const [reason,setReason]=useState('');
 const [notice,setNotice]=useState('');
 const b2b=useMemo<Customer[]>(()=>partners.map(p=>{
  const overrides=partnerProfiles[p.id]||{};
  return {id:p.id,type:'b2b',name:overrides.name || p.contact || p.name,company:p.name,idno:p.idno,phone:overrides.phone??'',email:overrides.email??p.email,city:overrides.city??'',address:overrides.address??'',notes:overrides.notes??'',status:overrides.status??(p.status==='paused'?'blocked':'active'),blockReason:overrides.blockReason??'',created:overrides.created??'—'};
 }),[partners,partnerProfiles]);
 const all=useMemo(()=>[...retail,...b2b],[retail,b2b]);
 const filtered=all.filter(c=>(type==='all'||c.type===type)&&(filter==='visible'?c.status!=='archived':c.status===filter)&&[c.name,c.company,c.phone,c.email,c.idno,c.city].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
 const current=all.find(c=>c.id===selected)||null;
 const getOrders=(c:Customer)=>orders.filter(o=>c.type==='b2b'?o.partner===c.id:o.partner===c.id);
 const updateClient=(c:Customer)=>{
  if(c.type==='b2c'){setRetail(old=>old.map(item=>item.id===c.id?c:item));return;}
  setPartnerProfiles(old=>({...old,[c.id]:{...old[c.id],name:c.name,phone:c.phone,email:c.email,city:c.city,address:c.address,notes:c.notes,status:c.status,blockReason:c.blockReason}}));
 };
 const save=(e:FormEvent)=>{
  e.preventDefault();if(readOnly)return;if(!editing?.name.trim())return;
  if(editing.type==='b2c'&&!retail.some(c=>c.id===editing.id))setRetail(old=>[...old,{...editing,name:editing.name.trim()}]);
  else updateClient({...editing,name:editing.name.trim()});
  onAudit?.('CUSTOMER_SAVE',editing.id,'Date client actualizate (fără date personale în jurnal).');setEditing(null);setNotice('Datele clientului au fost salvate în acest browser (DEMO).');
 };
 const block=()=>{
  if(readOnly||!blockTarget||!reason.trim())return;
  onAudit?.('CUSTOMER_BLOCK',blockTarget.id,'Client blocat, motiv: '+reason.trim().slice(0,180));updateClient({...blockTarget,status:'blocked',blockReason:reason.trim()});
  if(blockTarget.type==='b2b')onPartnerStatusChange(blockTarget.id,'paused');
  setNotice('Client blocat în modul demonstrativ. Pentru blocarea reală este necesar backend.');setBlockTarget(null);setReason('');
 };
 const unblock=(c:Customer)=>{if(readOnly)return;onAudit?.('CUSTOMER_UNBLOCK',c.id,'Client reactivat');
  updateClient({...c,status:'active',blockReason:''});
  if(c.type==='b2b')onPartnerStatusChange(c.id,'active');
  setNotice('Client reactivat în datele demonstrative.');
 };
 const archive=(c:Customer)=>{if(readOnly)return;onAudit?.('CUSTOMER_ARCHIVE_REQUEST',c.id,'Solicitare arhivare');
  if(!window.confirm('Arhivați acest client? Comenzile istorice vor fi păstrate.'))return;
  updateClient({...c,status:'archived'});if(c.type==='b2b')onPartnerStatusChange(c.id,'paused');
  setSelected(null);setNotice('Client arhivat. Comenzile sale au rămas disponibile.');
 };
 const restore=(c:Customer)=>{if(readOnly)return;onAudit?.('CUSTOMER_RESTORE',c.id,'Client restaurat');updateClient({...c,status:'active',blockReason:''});if(c.type==='b2b')onPartnerStatusChange(c.id,'active');setNotice('Client restaurat.');};
 const erase=(c:Customer)=>{if(readOnly)return;onAudit?.('CUSTOMER_DELETE_REQUEST',c.id,'Solicitare ștergere client demo');
  if(c.type==='b2b'){setNotice('Partenerii B2B se gestionează în „Parteneri B2B”. Folosiți arhivarea aici.');return;}
  if(getOrders(c).length){setNotice('Clientul are comenzi istorice. Arhivați-l în loc să-l ștergeți.');return;}
  if(!window.confirm('Ștergeți DEFINITIV profilul demonstrativ? Această acțiune nu poate fi anulată.'))return;
  setRetail(old=>old.filter(x=>x.id!==c.id));setSelected(null);setNotice('Profil demonstrativ șters.');
 };
 return <section className="oc-section">
  <div className="oc-header"><div><h2>Clienți B2C și B2B</h2><p>Dosarele clienților, istoricul comenzilor și controlul accesului. În această etapă datele sunt demonstrative.</p></div>{!readOnly&&<div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'flex-end'}}><button type="button" className="oc-primary" onClick={()=>{setType('b2c');setEditing(blank())}}><Plus size={17}/> Client B2C nou</button><button type="button" className="oc-primary" onClick={()=>{setType('b2b');onAddB2B()}}><Plus size={17}/> Client B2B nou</button></div>}</div>
  <div className="oc-stats"><div><strong>{all.length}</strong><span>Total clienți demo</span></div><div><strong>{all.filter(c=>c.type==='b2c').length}</strong><span>B2C</span></div><div><strong>{all.filter(c=>c.type==='b2b').length}</strong><span>B2B</span></div><div><strong>{all.filter(c=>c.status==='blocked').length}</strong><span>Blocați</span></div></div>
  {notice&&<div className="oc-notice" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')} aria-label="Închide"><X size={16}/></button></div>}
  <div className="oc-toolbar">
   <div className="oc-tabs" aria-label="Tip client"><button className={type==='all'?'active':''} onClick={()=>setType('all')}>Toți</button><button className={type==='b2c'?'active':''} onClick={()=>setType('b2c')}>Persoane fizice B2C</button><button className={type==='b2b'?'active':''} onClick={()=>setType('b2b')}>Parteneri B2B</button></div>
   <label className="oc-search"><Search size={17}/><input aria-label="Caută client" placeholder="Caută nume, telefon, IDNO…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <label className="oc-state"><span>Stare</span><select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="visible">Toți activi și blocați</option><option value="active">Activi</option><option value="blocked">Blocați</option><option value="archived">Arhivați</option></select><ChevronDown size={15}/></label>
  </div>
  <div className="oc-table-wrap"><table className="oc-table"><thead><tr><th>Client</th><th>Tip</th><th>Contact</th><th>Localitate</th><th>Comenzi</th><th>Statut</th><th>Acțiuni</th></tr></thead><tbody>{filtered.map(c=>{const count=getOrders(c).length;return <tr key={c.id}><td><strong>{c.type==='b2b'?c.company:c.name}</strong><small>{c.type==='b2b'?(c.idno?'IDNO: '+c.idno:'IDNO necompletat'):(c.created==='—'?'':'Din '+c.created)}</small></td><td><span className={'oc-type '+c.type}>{c.type.toUpperCase()}</span></td><td>{safe(c.phone)}<small>{safe(c.email)}</small></td><td>{safe(c.city)}</td><td>{count}</td><td><span className={'oc-status '+c.status}>{statusLabel[c.status]}</span></td><td><div className="oc-actions"><button title="Deschide fișa" aria-label={'Detalii '+c.name} onClick={()=>setSelected(c.id)}><Eye size={17}/></button>{!readOnly&&(c.status==='blocked'?<button title="Deblochează" aria-label={'Deblochează '+c.name} onClick={()=>unblock(c)}><RotateCcw size={17}/></button>:c.status==='active'?<button title="Blochează" aria-label={'Blochează '+c.name} onClick={()=>{setReason('');setBlockTarget(c)}}><Ban size={17}/></button>:<button title="Restaurează" onClick={()=>restore(c)}><RotateCcw size={17}/></button>)}</div></td></tr>})}{filtered.length===0&&<tr><td className="oc-empty" colSpan={7}>Nu au fost găsiți clienți pentru filtrele selectate.</td></tr>}</tbody></table></div>
  <p className="oc-footnote"><ShieldAlert size={16}/> Blocarea unui client B2C fără cont necesită verificare pe server (telefon/email și alte semnale). Acest ecran nu poate opri comenzi reale.</p>
  {current&&<div className="oc-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="oc-modal" role="dialog" aria-modal="true" aria-label={'Fișa clientului '+current.name}>
   <div className="oc-modal-head"><div><span className="oc-type">{current.type.toUpperCase()}</span><h2>{current.type==='b2b'?current.company:current.name}</h2><span className={'oc-status '+current.status}>{statusLabel[current.status]}</span></div><button className="oc-icon" onClick={()=>setSelected(null)} aria-label="Închide"><X size={21}/></button></div>
   <div className="oc-modal-body"><div className="oc-info-grid"><div className="oc-info-card"><h3><UserRound size={18}/> Informații client</h3><dl><dt>Nume / contact</dt><dd>{safe(current.name)}</dd><dt>Companie</dt><dd>{safe(current.company)}</dd><dt>IDNO</dt><dd>{safe(current.idno)}</dd><dt><Phone size={14}/> Telefon</dt><dd>{safe(current.phone)}</dd><dt><Mail size={14}/> Email</dt><dd>{safe(current.email)}</dd></dl></div><div className="oc-info-card"><h3><MapPin size={18}/> Adresă și situație</h3><dl><dt>Localitate</dt><dd>{safe(current.city)}</dd><dt>Adresă</dt><dd>{safe(current.address)}</dd><dt>Înregistrat</dt><dd>{current.created}</dd><dt>Motiv blocare</dt><dd>{current.blockReason||'—'}</dd><dt>Notițe interne</dt><dd>{current.notes||'—'}</dd></dl></div></div>
   <div className="oc-info-card"><h3><FileText size={18}/> Istoricul comenzilor ({getOrders(current).length})</h3>{getOrders(current).length?<div className="oc-order-list">{getOrders(current).map(o=><button key={o.id} onClick={()=>{setSelected(null);onOpenOrder(o.id)}}><span>{o.id}<small>{o.created}</small></span><strong>{currency(o.lines.reduce((s,l)=>s+l.qty*l.unit,0))}</strong><Eye size={17}/></button>)}</div>:<p>Nicio comandă asociată în datele demonstrative.</p>}</div></div>
   <div className="oc-modal-foot">{!readOnly&&<><button className="oc-outline" onClick={()=>setEditing(current)}>Editează</button>{current.status==='active'?<button className="oc-warning" onClick={()=>{setReason('');setBlockTarget(current)}}><Ban size={16}/> Blochează</button>:current.status==='blocked'?<button className="oc-outline" onClick={()=>unblock(current)}><RotateCcw size={16}/> Deblochează</button>:<button className="oc-outline" onClick={()=>restore(current)}>Restaurează</button>}{current.status!=='archived'&&<button className="oc-outline" onClick={()=>archive(current)}><Archive size={16}/> Arhivează</button>}{current.type==='b2c'&&<button className="oc-danger" title={getOrders(current).length?'Clientul cu istoric de comenzi nu poate fi șters definitiv':''} onClick={()=>erase(current)}><Trash2 size={16}/> Șterge</button>}</>}</div>
  </section></div>}
  {editing&&<div className="oc-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><form className="oc-form" onSubmit={save} role="dialog" aria-modal="true" aria-label="Editare date client"><div className="oc-modal-head"><h2>{editing.type==='b2b'?'Actualizare contact partener':'Fișă client B2C'}</h2><button type="button" className="oc-icon" onClick={()=>setEditing(null)}><X size={20}/></button></div><div className="oc-form-grid"><label>Nume / persoană de contact *<input required value={editing.name} onChange={e=>setEditing(p=>p?{...p,name:e.target.value}:p)}/></label><label>Telefon<input value={editing.phone} onChange={e=>setEditing(p=>p?{...p,phone:e.target.value}:p)}/></label><label>Email<input type="email" value={editing.email} onChange={e=>setEditing(p=>p?{...p,email:e.target.value}:p)}/></label><label>Localitate<input value={editing.city} onChange={e=>setEditing(p=>p?{...p,city:e.target.value}:p)}/></label><label className="oc-wide">Adresă<input value={editing.address} onChange={e=>setEditing(p=>p?{...p,address:e.target.value}:p)}/></label><label className="oc-wide">Notițe interne<textarea rows={3} value={editing.notes} onChange={e=>setEditing(p=>p?{...p,notes:e.target.value}:p)}/></label></div><p className="oc-footnote">Datele se salvează doar local. Datele juridice ale partenerilor se modifică separat în „Parteneri B2B”.</p><div className="oc-modal-foot"><button type="button" className="oc-outline" onClick={()=>setEditing(null)}>Anulează</button><button type="submit" className="oc-primary"><CheckCircle2 size={16}/> Salvează</button></div></form></div>}
  {blockTarget&&<div className="oc-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setBlockTarget(null)}}><section className="oc-form" role="dialog" aria-modal="true" aria-label="Blocare client"><div className="oc-modal-head"><div><h2><ShieldAlert size={21}/> Blocare client</h2><p>{blockTarget.type==='b2b'?blockTarget.company:blockTarget.name}</p></div><button type="button" className="oc-icon" onClick={()=>setBlockTarget(null)}><X size={20}/></button></div><p>Indică motivul pentru audit. Blocarea din această versiune este doar demonstrativă.</p><label>Motivul blocării *<textarea rows={4} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ex.: tentative repetate de comenzi false"/></label><div className="oc-modal-foot"><button className="oc-outline" onClick={()=>setBlockTarget(null)}>Anulează</button><button className="oc-danger" disabled={!reason.trim()} onClick={block}><Ban size={16}/> Confirmă blocarea</button></div></section></div>}
 </section>;
}
