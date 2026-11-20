import {useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {AlertTriangle, ArrowLeft, Printer, FileText, Download, LoaderCircle} from 'lucide-react';
import './InvoicePreview.css';

export type InvoiceData = {
 demo:true; buyerType:'person'|'company'; origin?:'b2b';
 customer:{lastName:string;firstName:string;phone:string;email:string;companyName:string;companyIdno:string;companyAddress:string};
 lines:{code:string;name:string;size:string;quantity:number;unitPrice:number}[];
 subtotal:number;discount:number;total:number;delivery:string;payment:string;createdAt:string;
};
const lei=(num:number)=>new Intl.NumberFormat('ro-MD',{minimumFractionDigits:2,maximumFractionDigits:2}).format(num)+' MDL';
export default function InvoicePreview(){
 const {i18n}=useTranslation();
 const ru=i18n.language==='ru';
 const loc=useLocation();
 const data=(loc.state as {invoice?:InvoiceData}|null)?.invoice;
 const paperRef=useRef<HTMLDivElement>(null);
 const [saving,setSaving]=useState(false);
 const [saveError,setSaveError]=useState('');
 const handleSavePdf=async()=>{
  if(!paperRef.current||saving)return;
  setSaving(true);setSaveError('');
  try{
   // Both libraries are loaded only after the customer clicks Save.
   const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas-pro'),import('jspdf')]);
   const original=paperRef.current;
   // Render A4 portrait without relying on the browser print dialogue.
   const canvas=await html2canvas(original,{backgroundColor:'#ffffff',scale:2,useCORS:true,logging:false,windowWidth:Math.max(original.scrollWidth,900),onclone:doc=>{
    const el=doc.querySelector('.ort-invoice-paper') as HTMLElement|null;
    if(el){el.style.width='900px';el.style.maxWidth='none';el.style.minHeight='0';el.style.boxShadow='none';el.style.margin='0';el.style.border='0';}
   }});
   const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
   const pageWidth=210,pageHeight=297,margin=12;
   const contentWidth=pageWidth-2*margin,contentHeight=pageHeight-2*margin;
   const sliceHeight=Math.floor(canvas.width*contentHeight/contentWidth);
   let top=0,page=0;
   while(top<canvas.height){
    const height=Math.min(sliceHeight,canvas.height-top);
    const part=document.createElement('canvas');part.width=canvas.width;part.height=height;
    const ctx=part.getContext('2d');if(!ctx)throw new Error('Canvas context unavailable');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,part.width,part.height);
    ctx.drawImage(canvas,0,top,canvas.width,height,0,0,canvas.width,height);
    if(page>0)pdf.addPage();
    pdf.addImage(part.toDataURL('image/jpeg',0.94),'JPEG',margin,margin,contentWidth,height*contentWidth/canvas.width,undefined,'FAST');
    top+=height;page++;
   }
   const stamp=new Date(data?.createdAt||Date.now()).toISOString().slice(0,10);
   pdf.save(`ORTOMED_Cont_de_plata_DEMO_${stamp}.pdf`);
  }catch(err){console.error('PDF generation failed:',err);setSaveError(ru?'Не удалось создать PDF. Попробуйте ещё раз.':'Nu am putut genera PDF-ul. Încearcă din nou.');}
  finally{setSaving(false);}
 };
 const handlePrint=()=>window.print();
 const actions=(where:'floating'|'bottom')=><div className={`ort-invoice-actions ort-invoice-actions--${where}`} aria-label={ru?'Действия со счётом':'Acțiuni pentru contul de plată'}>
  <button type="button" className="ort-invoice-action ort-invoice-action--save" disabled={saving} onClick={handleSavePdf}>
   {saving?<LoaderCircle size={19} className="ort-invoice-spinner"/>:<Download size={19}/>}
   {saving?(ru?'Создаём PDF…':'Se generează PDF…'):(ru?'Сохранить счёт (PDF)':'Salvează contul (PDF)')}
  </button>
  <button type="button" className="ort-invoice-action ort-invoice-action--print" onClick={handlePrint}><Printer size={19}/>{ru?'Распечатать счёт':'Imprimă contul'}</button>
 </div>;

 if(!data||!data.demo||data.buyerType!=='company')return <main className="container ort-invoice-empty"><AlertTriangle size={36}/><h1>{ru?'Данные счёта отсутствуют':'Datele contului lipsesc'}</h1><p>{ru?'Вернитесь к оформлению заказа как юридическое лицо.':'Revino la finalizarea comenzii ca persoană juridică.'}</p><Link to="/finalizare-comanda" className="button button-primary">{ru?'К оформлению':'La finalizare'}</Link></main>;
 const date=new Date(data.createdAt);const dateText=Number.isNaN(date.getTime())?'—':date.toLocaleDateString('ro-MD');
 return <main className="ort-invoice-page"><div className="container ort-invoice-toolbar">{data.origin==='b2b'?<Link className="ort-invoice-back" to="/partener"><ArrowLeft size={17}/>{ru?'В кабинет партнёра':'În cabinetul partenerului'}</Link>:<Link className="ort-invoice-back" to="/confirmare" state={{...data,count:data.lines.reduce((a,l)=>a+l.quantity,0)}}><ArrowLeft size={17}/>{ru?'Назад к подтверждению':'Înapoi la confirmare'}</Link>}</div>
 <div ref={paperRef} className="ort-invoice-paper"><div className="ort-invoice-watermark">DEMO · NU ACHITAȚI</div><header className="ort-invoice-head"><div><div className="ort-invoice-mark">ORTO<span>MED</span></div><small>ORTOPEDIE · RECUPERARE · MOBILITATE</small></div><div className="ort-invoice-title"><FileText size={23}/><h1>CONT DE PLATĂ</h1><strong>PROFORMĂ · DEMONSTRAȚIE</strong><div>Data: {dateText}</div><div>Nr.: DEMO — fără număr fiscal</div></div></header>
 <div className="ort-invoice-warning"><AlertTriangle size={17}/> Document demonstrativ. Nu reprezintă factură fiscală, e-Factura sau o cerere reală de plată. Nu efectuați transferuri pe baza acestui document.</div>
 <div className="ort-invoice-parties"><section><h2>FURNIZOR / VÂNZĂTOR</h2><strong>ORTOMED PLUS S.R.L.</strong><p>IDNO: <b>[de configurat]</b></p><p>Adresa juridică: <b>[de configurat]</b></p><p>IBAN: <b>[de configurat]</b></p><p>Banca / SWIFT: <b>[de configurat]</b></p><p>Statut TVA: <b>[de verificat]</b></p></section><section><h2>CUMPĂRĂTOR / BENEFICIAR</h2><strong>{data.customer.companyName}</strong><p>IDNO: {data.customer.companyIdno}</p><p>Adresa: {data.customer.companyAddress}</p><p>Contact: {data.customer.firstName} {data.customer.lastName}</p><p>Telefon: {data.customer.phone}</p><p>Email: {data.customer.email}</p></section></div>
 <h2 className="ort-invoice-lines-title">SPECIFICAȚIA PRODUSELOR</h2><div className="ort-invoice-table-wrap"><table className="ort-invoice-table"><thead><tr><th>Nr.</th><th>Produs / cod / mărime</th><th>Cant.</th><th>Preț unitar, MDL</th><th>Total, MDL</th></tr></thead><tbody>{data.lines.map((line,i)=><tr key={`${line.code}-${line.size}-${i}`}><td>{i+1}</td><td><strong>{line.name}</strong><small>{line.code} · {line.size}</small></td><td>{line.quantity}</td><td>{lei(line.unitPrice)}</td><td>{lei(line.quantity*line.unitPrice)}</td></tr>)}</tbody></table></div>
 <div className="ort-invoice-totals"><p><span>Subtotal</span><strong>{lei(data.subtotal)}</strong></p><p><span>Reducere</span><strong>− {lei(data.discount)}</strong></p><p><span>Livrare</span><strong>Se confirmă</strong></p><div><span>TOTAL PRODUSE</span><strong>{lei(data.total)}</strong></div><small>Costul livrării nu este inclus. Prețurile sunt numai demonstrative; nu reprezintă o ofertă comercială confirmată.</small></div>
 <div className="ort-invoice-payment"><h2>DETALII PRIVIND PLATA</h2><p>Metoda propusă: transfer bancar după emiterea și confirmarea unui cont de plată real de către ORTOMED.</p><p>Referința plății: [numărul real al comenzii / contului, generat de server]</p><p>Documentul va deveni disponibil pentru plată doar după completarea și validarea datelor furnizorului, înregistrarea comenzii și emiterea lui de sistem.</p></div>
 <footer className="ort-invoice-foot">Generat exclusiv pentru demonstrarea funcției ORTOMED.md · Fără valoare de plată / fiscală</footer></div>
 <div className="container ort-invoice-bottom-area"><p>{ru?'Проверьте данные выше, затем сохраните PDF или отправьте счёт на печать.':'Verifică datele de mai sus, apoi salvează PDF-ul sau imprimă documentul.'}</p>{actions('bottom')}{saveError&&<p className="ort-invoice-error" role="alert">{saveError}</p>}</div>
 <div className="ort-invoice-floating-bar">{actions('floating')}</div>
 </main>;
}
