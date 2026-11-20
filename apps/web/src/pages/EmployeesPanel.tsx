import {useMemo,useState} from 'react';
import type {FormEvent} from 'react';
import {Check,Edit3,Plus,RotateCcw,ShieldAlert,Trash2,UserMinus,Users,X} from 'lucide-react';
import './EmployeesPanel.css';

export type Employee={id:string;name:string;email:string;role:'admin'|'sales';status:'active'|'blocked'|'archived';createdAt:string};
type Props={employees:Employee[];actingEmployeeId:string;onSave:(employee:Employee,action:string)=>void};
const emptyEmployee=():Employee=>({id:'emp-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:'',email:'',role:'sales',status:'active',createdAt:new Date().toISOString()});
export default function EmployeesPanel({employees,actingEmployeeId,onSave}:Props){
 const [draft,setDraft]=useState<Employee|null>(null);
 const [error,setError]=useState('');
 const [search,setSearch]=useState('');
 const filtered=useMemo(()=>employees.filter(e=>(e.name+' '+e.email).toLowerCase().includes(search.toLowerCase())),[employees,search]);
 const activeAdmins=employees.filter(e=>e.role==='admin'&&e.status==='active');
 const isLastActiveAdmin=(e:Employee)=>e.role==='admin'&&e.status==='active'&&activeAdmins.length<=1;
 const openEdit=(e:Employee)=>{setDraft({...e});setError('')};
 const submit=(event:FormEvent)=>{event.preventDefault();if(!draft)return;
  const name=draft.name.trim();const email=draft.email.trim().toLowerCase();
  if(name.length<2){setError('Introduceți un nume de cel puțin 2 caractere.');return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Introduceți un email valid.');return}
  if(employees.some(e=>e.id!==draft.id&&e.email.toLowerCase()===email)){setError('Acest email aparține deja altui angajat.');return}
  const previous=employees.find(e=>e.id===draft.id);
  if(previous&&isLastActiveAdmin(previous)&&(draft.role!=='admin'||draft.status!=='active')){setError('Ultimul administrator activ nu poate pierde accesul.');return}
  if(previous?.id===actingEmployeeId&&(draft.status!=='active'||draft.role!=='admin')){setError('Nu puteți bloca sau retrograda operatorul Admin selectat.');return}
  onSave({...draft,name,email},previous?'EMPLOYEE_UPDATE':'EMPLOYEE_CREATE');setDraft(null);setError('');
 };
 const changeStatus=(e:Employee,status:Employee['status'])=>{
  if(status!=='active'&&(isLastActiveAdmin(e)||e.id===actingEmployeeId)){setError('Nu puteți dezactiva ultimul administrator sau operatorul selectat.');return}
  if(status==='archived'&&!window.confirm('Arhivați angajatul '+e.name+'? Istoricul de audit rămâne păstrat.'))return;
  onSave({...e,status},status==='archived'?'EMPLOYEE_ARCHIVE':status==='blocked'?'EMPLOYEE_BLOCK':'EMPLOYEE_RESTORE');setError('');
 };
 return <section className="oa-panel oa-employees">
  <div className="oa-section-heading"><div><h2><Users size={21}/> Angajați și roluri</h2><p>Admin / Manager vânzări. Creați, editați, blocați sau arhivați angajați demonstrativi.</p></div><button className="oa-primary" onClick={()=>{setDraft(emptyEmployee());setError('')}} type="button"><Plus size={17}/> Adaugă angajat</button></div>
  <div className="oa-warning"><ShieldAlert size={18}/> DEMO: niciun angajat nu are cont de autentificare sau parolă. Selectarea operatorului din antet este o simulare, nu o autentificare securizată.</div>
  {error&&<div className="oa-employee-error" role="alert">{error}</div>}
  <div className="oa-employees-stats"><div><strong>{employees.filter(e=>e.status==='active').length}</strong><small>Activi</small></div><div><strong>{employees.filter(e=>e.role==='admin'&&e.status==='active').length}</strong><small>Administratori activi</small></div><div><strong>{employees.filter(e=>e.role==='sales'&&e.status==='active').length}</strong><small>Manageri vânzări</small></div></div>
  <div className="oa-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută angajat după nume sau email..." aria-label="Căutare angajat" /></div>
  <div className="oa-table-scroll"><table><thead><tr><th>Angajat</th><th>Rol</th><th>Stare</th><th>Creat</th><th>Acțiuni</th></tr></thead><tbody>
   {filtered.map(e=><tr key={e.id}><td><strong>{e.name}</strong><small className="oa-block">{e.email}{e.id===actingEmployeeId?' · operator selectat':''}</small></td><td>{e.role==='admin'?'Administrator':'Manager vânzări'}</td><td><span className={'oa-chip '+(e.status==='active'?'good':'neutral')}>{e.status==='active'?'Activ':e.status==='blocked'?'Blocat':'Arhivat'}</span></td><td>{new Date(e.createdAt).toLocaleDateString('ro-MD')}</td><td><div className="oa-employee-actions"><button className="oa-outline" type="button" onClick={()=>openEdit(e)}><Edit3 size={15}/> Editează</button>{e.status==='active'?<button className="oa-outline" type="button" disabled={isLastActiveAdmin(e)||e.id===actingEmployeeId} title="Blochează accesul (simulat)" onClick={()=>changeStatus(e,'blocked')}><UserMinus size={15}/> Blochează</button>:<button className="oa-outline" type="button" onClick={()=>changeStatus(e,'active')}><RotateCcw size={15}/> Reactivează</button>}{e.status!=='archived'&&<button className="oa-danger" type="button" disabled={isLastActiveAdmin(e)||e.id===actingEmployeeId} title="Arhivează profilul fără a șterge jurnalul" onClick={()=>changeStatus(e,'archived')}><Trash2 size={15}/> Arhivează</button>}</div></td></tr>)}
   {filtered.length===0&&<tr><td colSpan={5}>Niciun angajat găsit.</td></tr>}
  </tbody></table></div><p className="oa-note">„Ștergere” este realizată prin arhivare, pentru a păstra istoricul acțiunilor. Conturile reale și parolele vor fi gestionate ulterior exclusiv prin backend.</p>
  {draft&&<div className="oa-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDraft(null)}}><form className="oa-modal" onSubmit={submit} aria-label="Formular angajat"><div className="oa-modal-head"><h2>{employees.some(e=>e.id===draft.id)?'Editează angajat':'Angajat nou'}</h2><button type="button" onClick={()=>setDraft(null)} aria-label="Închide"><X size={21}/></button></div>
   <label>Nume și prenume *<input autoFocus required maxLength={100} value={draft.name} onChange={e=>setDraft(d=>d?{...d,name:e.target.value}:d)} placeholder="Nume angajat"/></label>
   <label>Email de serviciu *<input required type="email" maxLength={160} value={draft.email} onChange={e=>setDraft(d=>d?{...d,email:e.target.value}:d)} placeholder="angajat@companie.md"/></label>
   <div className="oa-fields-two"><label>Rol<select value={draft.role} onChange={e=>setDraft(d=>d?{...d,role:e.target.value as Employee['role']}:d)}><option value="sales">Manager vânzări</option><option value="admin">Administrator</option></select></label><label>Stare<select value={draft.status} onChange={e=>setDraft(d=>d?{...d,status:e.target.value as Employee['status']}:d)}><option value="active">Activ</option><option value="blocked">Blocat</option><option value="archived">Arhivat</option></select></label></div>
   <div className="oa-mini-summary">Administrator: produse, stocuri, parteneri, reduceri, finanțe, setări. Manager vânzări: vizualizare clienți și procesare comenzi.</div>
   {error&&<div className="oa-employee-error" role="alert">{error}</div>}
   <div className="oa-modal-actions"><button className="oa-outline" type="button" onClick={()=>setDraft(null)}>Anulează</button><button className="oa-primary" type="submit"><Check size={16}/> Salvează angajat</button></div></form></div>}
 </section>;
}
