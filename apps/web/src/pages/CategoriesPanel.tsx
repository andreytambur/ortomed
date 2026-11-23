import {useState} from 'react';
import type {FormEvent,ChangeEvent} from 'react';
import {ArrowDown,ArrowUp,FolderPlus,ImagePlus,Pencil,Save,Trash2,X} from 'lucide-react';
import {categories,products,saveDemoCategories} from '../data/products';
import type {ProductCategory} from '../data/products';
import './CategoriesPanel.css';
import {prepareDemoImage} from '../utils/imageUpload';

type Draft={id:string;ro:string;ru:string;image:string};
const emptyDraft=():Draft=>({id:'',ro:'',ru:'',image:''});
const slug=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
export default function CategoriesPanel({onChange}:{onChange?:(action:string,detail:string)=>void}) {
 const [version,setVersion]=useState(0);
 const [draft,setDraft]=useState<Draft|null>(null);
 const [editing,setEditing]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [uploading,setUploading]=useState(false);
 const onUpload=async(e:ChangeEvent<HTMLInputElement>)=>{
  const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file)return;
  setError('');setUploading(true);
  try {const image=await prepareDemoImage(file,1000);setDraft(old=>old?{...old,image}:old);setNotice('Fotografia categoriei este pregătită. Apăsați Salvează categoria.');}
  catch(ex){setError(ex instanceof Error?ex.message:'Nu s-a putut încărca fotografia.')}
  finally{setUploading(false)}
 }; 
 const current=[...categories];
 const count=(id:string)=>products.filter(p=>p.category===id).length;
 const save=(e:FormEvent)=>{
  e.preventDefault();if(!draft)return;
  const id=editing?draft.id:slug(draft.id||draft.ro);
  if(!/^[a-z0-9-]{2,40}$/.test(id)){setError('Introduceți un ID cu 2–40 litere latine mici, cifre sau - (ex.: reabilitare).');return;}
  if(!draft.ro.trim()||!draft.ru.trim()){setError('Completați denumirea în română și în rusă.');return;}
  if(!editing&&categories.some(c=>c.id===id)){setError('O categorie cu acest ID există deja.');return;}
  const item:ProductCategory={id,ro:draft.ro.trim(),ru:draft.ru.trim(),image:draft.image.trim()||'/ortomed/images/product-1.webp'};
  try {
   saveDemoCategories(editing?categories.map(c=>c.id===id?item:c):[...categories,item]);
   setVersion(v=>v+1);setDraft(null);setNotice('Categoria a fost salvată. Apare în magazin și la adăugarea produselor.');setError('');
   onChange?.(editing?'CATEGORY_EDIT':'CATEGORY_CREATE',id+' · '+item.ro);
  } catch(ex) {setError(ex instanceof Error?ex.message:'Salvarea a eșuat.');}
 };
 const remove=(c:ProductCategory)=>{
  const n=count(c.id);
  if(n>0){setError('Categoria „'+c.ro+'” conține '+n+' produse. Mutați produsele în altă categorie înainte de ștergere.');return;}
  if(!window.confirm('Ștergeți categoria „'+c.ro+'”?'))return;
  try{saveDemoCategories(categories.filter(row=>row.id!==c.id));setVersion(v=>v+1);setNotice('Categoria a fost ștearsă.');setError('');onChange?.('CATEGORY_DELETE',c.id+' · '+c.ro);}catch(ex){setError(ex instanceof Error?ex.message:'Nu s-a putut șterge categoria.');}
 };
 const move=(index:number,step:number)=>{
  const next=[...categories];const target=index+step;if(target<0||target>=next.length)return;
  [next[index],next[target]]=[next[target],next[index]];
  try{saveDemoCategories(next);setVersion(v=>v+1);onChange?.('CATEGORY_ORDER',next.map(x=>x.id).join(', '));}catch{setError('Ordinea nu a putut fi salvată.');}
 };
 return <section className="ocm-panel" data-version={version}>
  <div className="ocm-heading"><div><h2>Categorii de produse</h2><p>Organizați categoriile afișate în magazin și disponibile în formularul de produs. Date DEMO în acest browser.</p></div><button type="button" className="ocm-primary" onClick={()=>{setDraft(emptyDraft());setEditing(false);setError('')}}><FolderPlus size={18}/> Adaugă categorie</button></div>
  {notice&&<p className="ocm-success" role="status">{notice}</p>}{error&&<p className="ocm-error" role="alert">{error}</p>}
  <div className="ocm-table-wrap"><table><thead><tr><th>Imagine</th><th>Categorie RO / RU</th><th>ID / cod categorie</th><th>Produse</th><th>Ordine</th><th>Acțiuni</th></tr></thead><tbody>{current.map((c,i)=><tr key={c.id}><td><img className="ocm-photo" src={c.image} alt=""/></td><td><strong>{c.ro}</strong><small>{c.ru}</small></td><td><code>{c.id}</code></td><td>{count(c.id)}</td><td><div className="ocm-actions"><button type="button" disabled={i===0} onClick={()=>move(i,-1)} aria-label="Mută în sus"><ArrowUp size={16}/></button><button type="button" disabled={i===current.length-1} onClick={()=>move(i,1)} aria-label="Mută în jos"><ArrowDown size={16}/></button></div></td><td><div className="ocm-actions"><button type="button" onClick={()=>{setDraft({...c});setEditing(true);setError('')}}><Pencil size={16}/> Editează</button><button type="button" onClick={()=>remove(c)}><Trash2 size={16}/> Șterge</button></div></td></tr>)}</tbody></table></div>
  <p className="ocm-help">O categorie cu produse nu poate fi ștearsă. Codul intern (ID) nu se modifică la editare, pentru a păstra legătura cu produsele și filtrele.</p>
  {draft&&<div className="ocm-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDraft(null)}}><form className="ocm-modal" onSubmit={save}><header><h2>{editing?'Editează categoria':'Categorie nouă'}</h2><button type="button" onClick={()=>setDraft(null)} aria-label="Închide"><X size={20}/></button></header>
   <label>ID categorie *<input value={draft.id} readOnly={editing} onChange={e=>setDraft(v=>v?{...v,id:e.target.value}:v)} placeholder="ex.: reabilitare"/><small>Linkul va folosi /produse?category=ID. Nu modificați ID-ul ulterior.</small></label>
   <label>Denumire în română *<input required value={draft.ro} onChange={e=>setDraft(v=>v?{...v,ro:e.target.value}:v)} placeholder="Reabilitare"/></label>
   <label>Название на русском *<input required value={draft.ru} onChange={e=>setDraft(v=>v?{...v,ru:e.target.value}:v)} placeholder="Реабилитация"/></label>
   <label><span><ImagePlus size={16}/> Imagine categorie — adresă URL sau /public</span><input value={draft.image} onChange={e=>setDraft(v=>v?{...v,image:e.target.value}:v)} placeholder="/ortomed/images/category-rehab.webp"/></label>
   <label className="ocm-upload"><span><ImagePlus size={16}/> Încarcă fotografie din calculator (JPG, PNG, WebP, max. 2 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={onUpload}/><small>Imaginea este optimizată automat pentru această versiune DEMO.</small></label>
   {draft.image&&<button className="ocm-remove-photo" type="button" onClick={()=>setDraft(old=>old?{...old,image:''}:old)}>Șterge fotografia selectată</button>}
   {draft.image&&<img className="ocm-preview" src={draft.image} alt="Previzualizare categorie"/>}
   {error&&<p className="ocm-error">{error}</p>}
   <footer><button type="button" onClick={()=>setDraft(null)}>Anulează</button><button type="submit" className="ocm-primary" disabled={uploading}><Save size={17}/> {uploading?'Se încarcă...':'Salvează categoria'}</button></footer>
  </form></div>}
 </section>;
}
