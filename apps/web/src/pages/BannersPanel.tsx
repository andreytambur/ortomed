import {useState} from 'react';
import type {ChangeEvent,FormEvent} from 'react';
import {ArrowDown,ArrowUp,ImagePlus,Plus,Save,Trash2,ExternalLink} from 'lucide-react';
import {defaultHomeBanners,loadHomeBanners,saveHomeBanners,safeBannerUrl} from '../data/homeBanners';
import type {HomeBanner,HomeBannersConfig} from '../data/homeBanners';
import {MAX_UPLOAD_IMAGE_BYTES,prepareDemoImage} from '../utils/imageUpload';
import './BannersPanel.css';

type Props={onChange?:(action:string,description:string)=>void};
const emptySlide=():HomeBanner=>({id:`banner-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,enabled:true,image:'',titleRo:'',titleRu:'',subtitleRo:'',subtitleRu:'',buttonRo:'Vezi detalii',buttonRu:'Подробнее',url:'/produse',textPosition:'left',textColor:'dark'});
export default function BannersPanel({onChange}:Props){
 const [config,setConfig]=useState<HomeBannersConfig>(()=>loadHomeBanners());
 const [activeId,setActiveId]=useState<string>(()=>loadHomeBanners().slides[0]?.id??'');
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [dirty,setDirty]=useState(false);
 const selected=config.slides.find(x=>x.id===activeId)??config.slides[0];
 const touch=(next:HomeBannersConfig)=>{setConfig(next);setDirty(true);setError('');setSuccess('')};
 const update=(patch:Partial<HomeBanner>)=>{if(!selected)return;touch({...config,slides:config.slides.map(s=>s.id===selected.id?{...s,...patch}:s)})};
 const add=()=>{if(config.slides.length>=12){setError('Maximum 12 slide-uri.');return}const s=emptySlide();touch({...config,slides:[...config.slides,s]});setActiveId(s.id)};
 const remove=()=>{if(!selected||!window.confirm('Eliminați acest slide?'))return;const next=config.slides.filter(x=>x.id!==selected.id);touch({...config,slides:next});setActiveId(next[0]?.id??'')};
 const move=(delta:number)=>{if(!selected)return;const i=config.slides.findIndex(s=>s.id===selected.id);const j=i+delta;if(j<0||j>=config.slides.length)return;const next=[...config.slides];[next[i],next[j]]=[next[j],next[i]];touch({...config,slides:next})};
 const upload=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>MAX_UPLOAD_IMAGE_BYTES){
   setError('Acceptăm JPG, PNG sau WebP de până la 2 MB.');return;
  }
  const selectedId=selected?.id;
  if(!selectedId)return;
  try{
   // Shared image helper from 08.20: compressed preview keeps localStorage smaller.
   const prepared=await prepareDemoImage(file,1600);
   setConfig(current=>({...current,slides:current.slides.map(slide=>slide.id===selectedId?{...slide,image:prepared}:slide)}));
   setDirty(true);setError('');setSuccess('');
  }catch(err){setError(err instanceof Error?err.message:'Fotografia nu a putut fi procesată.');}
 };
 const submit=(event:FormEvent)=>{event.preventDefault();setError('');setSuccess('');if(config.slides.some(s=>!s.titleRo.trim()||!s.image.trim())){setError('Fiecare slide trebuie să aibă un titlu în română și o imagine.');return}if(config.slides.some(s=>s.url.trim()&&safeBannerUrl(s.url)!==s.url.trim())){setError('Linkurile trebuie să înceapă cu /, https:// sau http://.');return}if(config.slides.length>0&&!config.slides.some(s=>s.enabled)){setError('Activați cel puțin un slide sau eliminați toate slide-urile.');return}
  try{saveHomeBanners(config);setDirty(false);setSuccess('Slide-urile au fost salvate. Reîncărcați pagina principală pentru verificare.');onChange?.('BANNERS_SAVE',`${config.slides.length} slide-uri; interval ${config.intervalSeconds}s`)}catch{setError('Nu se poate salva: spațiul localStorage este insuficient. Încercați imagini mai mici sau căi /public.')}};
 const reset=()=>{if(!window.confirm('Restabiliți bannerul inițial? Modificările curente vor fi pierdute.'))return;touch(defaultHomeBanners);setActiveId(defaultHomeBanners.slides[0].id)};
 return <section className="obm-panel">
  <div className="obm-heading"><div><h2>Banner principal — slide-uri</h2><p>Gestionați imaginile și textele afișate pe prima pagină, în română și rusă.</p></div><button className="obm-primary" type="button" onClick={add}><Plus size={17}/> Adaugă slide</button></div>
  <div className="obm-bar"><label>Schimbă automat la fiecare <select value={config.intervalSeconds} onChange={e=>touch({...config,intervalSeconds:Number(e.target.value)})}>{[3,4,5,6,7,8,10,12,15,20].map(n=><option key={n} value={n}>{n} sec.</option>)}</select></label><span>Ordinea din listă este ordinea de afișare. Slide-urile inactive nu apar pe site.</span></div>
  <div className="obm-layout"><aside className="obm-slides" aria-label="Lista slide-uri">{config.slides.map((s,i)=><button type="button" onClick={()=>setActiveId(s.id)} key={s.id} className={'obm-slide-option '+(selected?.id===s.id?'selected':'')}><span className="obm-thumb">{s.image?<img src={s.image} alt=""/>:<ImagePlus/>}</span><span><strong>{i+1}. {s.titleRo||'Slide nou'}</strong><small>{s.enabled?'Activ':'Inactiv'}</small></span></button>)}{!config.slides.length&&<p>Nu există slide-uri. Adăugați unul pentru a afișa un banner.</p>}</aside>
  <div className="obm-editor">{selected?<>
   <div className="obm-editor-bar"><strong>Editează slide</strong><div className="obm-actions"><button type="button" onClick={()=>move(-1)} title="Mută sus"><ArrowUp size={17}/></button><button type="button" onClick={()=>move(1)} title="Mută jos"><ArrowDown size={17}/></button><button type="button" className="obm-danger" onClick={remove} title="Elimină"><Trash2 size={17}/></button></div></div>
   <div className="obm-form-grid">
    <label className="obm-full obm-check"><input type="checkbox" checked={selected.enabled} onChange={e=>update({enabled:e.target.checked})}/> Slide activ (vizibil pe site)</label>
    <label className="obm-full">Imagine — URL sau cale din /public<input type="text" value={selected.image.startsWith('data:')?'':selected.image} placeholder="/ortomed/images/banner-promo.webp" onChange={e=>update({image:e.target.value})}/>{selected.image.startsWith('data:')&&<small>Imagine încărcată local; pentru a o înlocui, selectați alt fișier.</small>}</label>
    <label className="obm-full obm-upload"><ImagePlus size={19}/> Încarcă imagine JPG / PNG / WebP (max. 2 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload}/></label>
    <label>Titlu (RO) *<textarea rows={2} value={selected.titleRo} onChange={e=>update({titleRo:e.target.value})}/></label>
    <label>Заголовок (RU)<textarea rows={2} value={selected.titleRu} onChange={e=>update({titleRu:e.target.value})}/></label>
    <label>Subtitlu (RO)<textarea rows={2} value={selected.subtitleRo} onChange={e=>update({subtitleRo:e.target.value})}/></label>
    <label>Подзаголовок (RU)<textarea rows={2} value={selected.subtitleRu} onChange={e=>update({subtitleRu:e.target.value})}/></label>
    <label>Buton (RO)<input type="text" value={selected.buttonRo} onChange={e=>update({buttonRo:e.target.value})}/></label>
    <label>Кнопка (RU)<input type="text" value={selected.buttonRu} onChange={e=>update({buttonRu:e.target.value})}/></label>
    <label className="obm-full">Link la buton / text<input type="text" value={selected.url} placeholder="/produse sau https://..." onChange={e=>update({url:e.target.value})}/><small>Ex.: /produse, /oferte, /solicita-consultatie sau https://...</small></label>
    <label>Poziția textului<select value={selected.textPosition} onChange={e=>update({textPosition:e.target.value as HomeBanner['textPosition']})}><option value="left">Stânga</option><option value="center">Centru</option><option value="right">Dreapta</option></select></label>
    <label>Culoarea textului<select value={selected.textColor} onChange={e=>update({textColor:e.target.value as HomeBanner['textColor']})}><option value="dark">Albastru închis</option><option value="light">Alb</option></select></label>
   </div>
   <div className="obm-preview-label">Previzualizare aproximativă</div>
   <div className={`obm-preview obm-preview-${selected.textPosition} obm-preview-${selected.textColor}`} style={{backgroundImage:selected.image?`linear-gradient(90deg,#e7f6fcaf,#c0e5f255),url(${JSON.stringify(selected.image)})`:undefined}}><div><strong>{selected.titleRo||'Titlul slide-ului'}</strong><p>{selected.subtitleRo}</p>{selected.buttonRo&&<span>{selected.buttonRo} <ExternalLink size={13}/></span>}</div></div>
  </>:<div className="obm-empty">Apăsați „Adaugă slide” pentru a crea primul banner.</div>}</div></div>
  {error&&<p className="obm-error" role="alert">{error}</p>}{success&&<p className="obm-success" role="status">{success}</p>}
  <footer className="obm-footer"><p>DEMO: toate slide-urile sunt stocate doar în acest browser. Alte calculatoare nu le văd. Actualizarea reală necesită backend și stocare media.</p><div><button type="button" onClick={reset}>Restabilește inițial</button><button type="button" className="obm-primary" onClick={submit}><Save size={17}/> Salvează modificările {dirty?'•':''}</button></div></footer>
 </section>;
}
