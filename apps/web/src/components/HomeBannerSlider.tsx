import {useEffect,useMemo,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronLeft,ChevronRight,ArrowRight} from 'lucide-react';
import {HOME_BANNERS_EVENT,HOME_BANNERS_KEY,loadHomeBanners,safeBannerUrl} from '../data/homeBanners';
import type {HomeBannersConfig} from '../data/homeBanners';
import './HomeBannerSlider.css';

export default function HomeBannerSlider(){
 const {i18n}=useTranslation();
 const isRu=i18n.language.toLowerCase().startsWith('ru');
 const [config,setConfig]=useState<HomeBannersConfig>(()=>loadHomeBanners());
 const [index,setIndex]=useState(0);
 const [paused,setPaused]=useState(false);
 const visible=useMemo(()=>config.slides.filter(s=>s.enabled),[config.slides]);
 useEffect(()=>{
  const update=()=>setConfig(loadHomeBanners());
  const onStorage=(event:StorageEvent)=>{if(event.key===HOME_BANNERS_KEY)update()};
  window.addEventListener(HOME_BANNERS_EVENT,update);
  window.addEventListener('storage',onStorage);
  return ()=>{window.removeEventListener(HOME_BANNERS_EVENT,update);window.removeEventListener('storage',onStorage)};
 },[]);
 useEffect(()=>{setIndex(current=>visible.length?current%visible.length:0)},[visible.length]);
 useEffect(()=>{
  if(visible.length<2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const timer=window.setInterval(()=>setIndex(current=>(current+1)%visible.length),config.intervalSeconds*1000);
  return ()=>window.clearInterval(timer);
 },[visible.length,config.intervalSeconds,paused]);
 if(!visible.length)return null;
 const active=visible[index%visible.length];
 const title=isRu?active.titleRu||active.titleRo:active.titleRo;
 const subtitle=isRu?active.subtitleRu||active.subtitleRo:active.subtitleRo;
 const button=isRu?active.buttonRu||active.buttonRo:active.buttonRo;
 const go=(direction:number)=>setIndex(current=>(current+direction+visible.length)%visible.length);
 const href=safeBannerUrl(active.url);
 return <section className="ohb-slider" aria-label={isRu?'Главный баннер ORTOMED':'Banner principal ORTOMED'} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}}>
   <div className="ohb-backdrop" style={{backgroundImage:`url(${JSON.stringify(active.image)})`}} role="img" aria-label={title} key={active.id}/>
   <div className={`ohb-shade ohb-shade-${active.textPosition}`}/>
   <div className={`container ohb-content ohb-pos-${active.textPosition} ohb-${active.textColor}`} key={active.id+'-content'}>
    <div className="ohb-copy">
     <h1>{title}</h1>
     {subtitle&&<p>{subtitle}</p>}
     {button&&<a className="ohb-button" href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined}>{button}<ArrowRight size={20}/></a>}
    </div>
   </div>
   {visible.length>1&&<>
    <button className="ohb-control ohb-prev" type="button" onClick={()=>go(-1)} aria-label={isRu?'Предыдущий слайд':'Slide anterior'}><ChevronLeft size={22}/></button>
    <button className="ohb-control ohb-next" type="button" onClick={()=>go(1)} aria-label={isRu?'Следующий слайд':'Slide următor'}><ChevronRight size={22}/></button>
    <nav className="ohb-dots" aria-label="Slide-uri">{visible.map((slide,i)=><button key={slide.id} type="button" className={index===i?'active':''} onClick={()=>setIndex(i)} aria-label={`${isRu?'Слайд':'Slide'} ${i+1}`} aria-current={i===index?'true':undefined}/>)}</nav>
   </>}
  </section>;
}
