import {useEffect,useMemo,useState} from 'react';
import type {ChangeEvent,FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {Activity,ArrowLeft,BarChart3,Building2,Check,ChevronDown,ClipboardList,Download,Edit3,FileText,LayoutDashboard,Package,Plus,Save,Search,Settings,ShieldAlert,ShoppingBag,Trash2,TrendingUp,Truck,Users,Wallet,X,History,UserCog,Warehouse,ImagePlus} from 'lucide-react';
import {products, categories} from '../data/products';
import CategoriesPanel from './CategoriesPanel';
import BannersPanel from './BannersPanel';
import GuideEditor from './GuideEditor';
import BlogEditor from './BlogEditor';
import './AdminDashboard.css';
import CustomersPanel from './CustomersPanel';
import ProductEditor from './ProductEditor';
import type {ProductSave} from './ProductEditor';
import StockMovements from './StockMovements';
import EmployeesPanel from './EmployeesPanel';
import WarehousesPanel from './WarehousesPanel';
import BranchOperationsPanel from './BranchOperationsPanel';
import type {BranchSale} from './BranchOperationsPanel';
import type {BranchWarehouse,WarehouseTransfer} from './WarehousesPanel';
import type {Employee} from './EmployeesPanel';
import type {StockMovement} from './StockMovements';

type Partner={id:string;name:string;idno:string;discount:number;status:'active'|'paused';contact:string;email:string};
type ItemConfig={id:string;cost:number;stock:number;stockBySize?:Record<string,number>;active:boolean};
type Order={id:string;partner:string;created:string;status:'new'|'processing'|'shipped'|'completed';lines:{id:string;qty:number;unit:number}[];assignedWarehouseId?:string;fulfillmentLines?:{id:string;size:string;qty:number}[];fulfillmentStatus?:'assigned'|'preparing'|'delivered';fulfilledAt?:string};
type Tab='blogeditor'|'guideeditor'|'banners'|'branchops'|'overview'|'customers'|'partners'|'products'|'categories'|'movements'|'warehouses'|'orders'|'finance'|'settings'|'audit';
type AdminRole='admin'|'sales'|'branch';
type AuditRecord={id:string;at:string;actor:string;role:AdminRole;action:string;target:string;details:string};
const salesTabs:Tab[]=['overview','customers','orders'];
const employeeSeed:Employee[]=[
 {id:'employee-admin-demo',name:'Administrator demo',email:'admin@demo.invalid',role:'admin',status:'active',createdAt:'2026-11-20T09:00:00.000Z'},
 {id:'employee-sales-demo',name:'Manager vânzări demo',email:'sales@demo.invalid',role:'sales',status:'active',createdAt:'2026-11-20T09:00:00.000Z'}
];
const partnersSeed:Partner[]=[
 {id:'p1',name:'DIRIPIO-FARM (DEMO)',idno:'',discount:25,status:'active',contact:'',email:''},
 {id:'p2',name:'Farmacie Partener A (DEMO)',idno:'',discount:20,status:'active',contact:'',email:''},
 {id:'p3',name:'Clinică Partener B (DEMO)',idno:'',discount:15,status:'paused',contact:'',email:''},
];
type DemoContact={client:string;company:string;idno:string;contactName:string;phone:string;email:string;address:string;city:string;postal:string;delivery:string;payment:string;paymentState:string;comment:string};
// Demonstration data only. The active backend will supply real buyer details after authentication.
const demoContactByOrder:Record<string,DemoContact>={
 'DEMO-1001':{client:'DIRIPIO-FARM (DEMO)',company:'DIRIPIO-FARM (DEMO)',idno:'Nu este completat',contactName:'Contact demonstrativ',phone:'Nu este completat',email:'Nu este completat',address:'Adresă de livrare necompletată',city:'Sîngerei',postal:'—',delivery:'Livrare la partener (demo)',payment:'Transfer bancar',paymentState:'În așteptarea plății',comment:'Exemplu: confirmați disponibilitatea mărimilor înainte de expediere.'},
 'DEMO-1002':{client:'Client retail (DEMO)',company:'Persoană fizică',idno:'—',contactName:'Client demonstrativ',phone:'Nu este completat',email:'Nu este completat',address:'Adresă de livrare necompletată',city:'Bălți',postal:'—',delivery:'Livrare la adresă (demo)',payment:'Numerar la livrare',paymentState:'Neîncasată',comment:'Nu există observații pentru această comandă.'},
 'DEMO-1003':{client:'Farmacie Partener A (DEMO)',company:'Farmacie Partener A (DEMO)',idno:'Nu este completat',contactName:'Contact demonstrativ',phone:'Nu este completat',email:'Nu este completat',address:'Adresă de livrare necompletată',city:'Chișinău',postal:'—',delivery:'Curier (demo)',payment:'Transfer bancar',paymentState:'Stare plată neconfirmată',comment:'Exemplu: contactați cumpărătorul înainte de livrare.'},
};
const costSeeds:Record<string,number>={'ORT-001':730,'ORT-002':530,'ORT-003':310,'ORT-004':390,'ORT-005':230,'ORT-006':1050,'ORT-007':190,'ORT-008':150,'ORT-009':410,'ORT-010':160,'ORT-011':210,'ORT-012':170};
const itemSeeds:ItemConfig[]=products.map(p=>({id:p.id,cost:costSeeds[p.id]??0,stock:20,active:true}));
const orderSeeds:Order[]=[
 {id:'DEMO-1001',partner:'p1',created:'2026-11-16',status:'processing',lines:[{id:'ORT-001',qty:2,unit:1012.5},{id:'ORT-004',qty:5,unit:487.5}]},
 {id:'DEMO-1002',partner:'retail',created:'2026-11-18',status:'new',lines:[{id:'ORT-002',qty:1,unit:980},{id:'ORT-003',qty:2,unit:520}]},
 {id:'DEMO-1003',partner:'p2',created:'2026-11-19',status:'shipped',lines:[{id:'ORT-006',qty:3,unit:1480},{id:'ORT-008',qty:4,unit:232}]},
];
const copy = <T,>(v:T):T=>JSON.parse(JSON.stringify(v)) as T;
function useDemoStorage<T>(key:string,initial:T){
 const [value,setValue]=useState<T>(()=>{try{const saved=localStorage.getItem(key);return saved?JSON.parse(saved) as T:copy(initial)}catch{return copy(initial)}});
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{/* storage disabled */}},[key,value]);
 return [value,setValue] as const;
}
const mdl=(n:number)=>new Intl.NumberFormat('ro-MD',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' MDL';
const percent=(n:number)=>new Intl.NumberFormat('ro-MD',{maximumFractionDigits:1}).format(n)+'%';
const emptyPartner=():Partner=>({id:'p'+Date.now(),name:'',idno:'',discount:0,status:'active',contact:'',email:''});
function downloadCsv(filename:string,rows:string[][]){const csv='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
export default function AdminDashboard(){
 const [tab,setTab]=useState<Tab>('overview');
 const [employees,setEmployees]=useDemoStorage<Employee[]>('ortomed_admin_demo_employees_v1',employeeSeed);
 const [actingEmployeeId,setActingEmployeeId]=useState('employee-admin-demo');
 const actingEmployee=employees.find(e=>e.id===actingEmployeeId&&e.status==='active')??employees.find(e=>e.status==='active'&&e.role==='admin')??employees.find(e=>e.status==='active');
 const role:AdminRole=actingEmployee?.role??'sales';
 const assignedToBranch=role!=='admin'&&Boolean(actingEmployee?.warehouseId);
 useEffect(()=>{if((role==='branch'||assignedToBranch)&&tab!=='branchops')setTab('branchops');},[role,assignedToBranch,tab]);
 const [audit,setAudit]=useDemoStorage<AuditRecord[]>('ortomed_admin_demo_audit_v1',[]);
 const logAction=(action:string,target:string,details:string)=>setAudit(old=>[{id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),at:new Date().toISOString(),actor:actingEmployee?.name??'Operator neidentificat',role,action,target,details},...old].slice(0,2000));
 const adminOnly=()=>role==='admin';
 const switchEmployee=(id:string)=>{const next=employees.find(e=>e.id===id&&e.status==='active');if(!next||id===actingEmployee?.id)return;logAction('OPERATOR_SWITCH',next.id,'Simulare trecere la operator '+next.name+' ('+(next.role==='admin'?'Admin':next.role==='branch'?'Vânzător filială':'Manager vânzări')+')');setActingEmployeeId(id);setTab((next.role==='branch'||(next.role==='sales'&&Boolean(next.warehouseId)))?'branchops':'overview');setSelectedOrderId(null);setEditPartner(null);setEditingItem(null);setEditingProduct(null);setSaved('Operator demonstrativ: '+next.name+'. Nu este autentificare reală.');};
 const saveEmployee=(employee:Employee,action:string)=>{if(!adminOnly())return;setEmployees(prev=>[...prev.filter(e=>e.id!==employee.id),employee]);logAction(action,employee.id,'Angajat: '+employee.name+'; rol: '+employee.role+'; filială: '+(employee.warehouseId??'biroul central')+'; stare: '+employee.status);setSaved('Angajatul a fost salvat local (DEMO).');};
 const [selectedOrderId,setSelectedOrderId]=useState<string|null>(null);
 const [partners,setPartners]=useDemoStorage('ortomed_admin_demo_partners_v1',partnersSeed);
 const [items,setItems]=useDemoStorage('ortomed_admin_demo_items_v1',itemSeeds);
 const [orders,setOrders]=useDemoStorage<Order[]>('ortomed_admin_demo_orders_v1',orderSeeds);
 const [routingBranch,setRoutingBranch]=useState('');
 const [routingSizes,setRoutingSizes]=useState<Record<number,string>>({});
 const [routingError,setRoutingError]=useState('');
 const [movements,setMovements]=useDemoStorage<StockMovement[]>('ortomed_admin_demo_movements_v1',[]);
 const [warehouses,setWarehouses]=useDemoStorage<BranchWarehouse[]>('ortomed_admin_demo_warehouses_v1',[]);
 const [transfers,setTransfers]=useDemoStorage<WarehouseTransfer[]>('ortomed_admin_demo_transfers_v1',[]);
 const [branchSales,setBranchSales]=useDemoStorage<BranchSale[]>('ortomed_admin_demo_branch_sales_v1',[]);
 const [activeBranchId,setActiveBranchId]=useState('');
 const [movementSku,setMovementSku]=useState('ORT-001');
 const [search,setSearch]=useState('');
 const [editPartner,setEditPartner]=useState<Partner|null>(null);
 const [editingItem,setEditingItem]=useState<string|null>(null);
 const [editingProduct,setEditingProduct]=useState<string|null>(null);
 const [productVersion,setProductVersion]=useState(0);
 const [draftItem,setDraftItem]=useState<ItemConfig|null>(null);
 const [saved,setSaved]=useState('');
 const selectedOrder=orders.find(o=>o.id===selectedOrderId)??null;
 const totalQuantity=(item:ItemConfig|undefined)=>item?.stockBySize?Object.values(item.stockBySize).reduce((sum,q)=>sum+q,0):item?.stock??0;
 const hasSizeStock=(item:ItemConfig|undefined)=>!!item?.stockBySize;
 const itemById=useMemo(()=>new Map(items.map(x=>[x.id,x])),[items]);
 const partnerById=useMemo(()=>new Map(partners.map(x=>[x.id,x])),[partners]);
 const stats=useMemo(()=>{
  const revenue=orders.reduce((sum,o)=>sum+o.lines.reduce((s,l)=>s+l.qty*l.unit,0),0)+branchSales.reduce((n,s)=>n+s.qty*s.unitPrice,0);
  const cogs=orders.reduce((sum,o)=>sum+o.lines.reduce((s,l)=>s+l.qty*(itemById.get(l.id)?.cost??0),0),0)+branchSales.reduce((n,s)=>n+s.qty*(itemById.get(s.sku)?.cost??0),0);
  const inv=products.reduce((sum,p)=>sum+totalQuantity(itemById.get(p.id))*(itemById.get(p.id)?.cost??0),0);
  return {revenue,cogs,profit:revenue-cogs,margin:revenue>0?(revenue-cogs)/revenue*100:0,inventory:inv,orders:orders.length};
 },[orders,branchSales,itemById]);
 const tabs:{id:Tab;label:string;icon:typeof LayoutDashboard}[]=[
  {id:'overview',label:'Panou general',icon:LayoutDashboard},{id:'customers',label:'Clienți B2C / B2B',icon:Users},{id:'partners',label:'Parteneri B2B',icon:Users},{id:'products',label:'Produse și stocuri',icon:Package},{id:'categories',label:'Categorii produse',icon:Package},{id:'banners',label:'Banner principal',icon:ImagePlus},{id:'guideeditor',label:'Ghidul pacientului',icon:FileText},{id:'blogeditor',label:'Blog — articole',icon:FileText},
  {id:'branchops',label:'Operațiuni filială',icon:ShoppingBag},{id:'movements',label:'Mișcări de stoc',icon:Truck},{id:'warehouses',label:'Filiale și transferuri',icon:Warehouse},{id:'orders',label:'Comenzi',icon:ClipboardList},{id:'finance',label:'Finanțe și profit',icon:TrendingUp},{id:'audit',label:'Jurnal de activitate',icon:History},{id:'settings',label:'Setări',icon:Settings}
 ];
 const savePartner=(e:FormEvent)=>{e.preventDefault();if(!adminOnly())return;if(!editPartner?.name.trim())return;setPartners(prev=>[...prev.filter(p=>p.id!==editPartner.id),{...editPartner,name:editPartner.name.trim()}]);logAction('PARTNER_SAVE',editPartner.id,'Partener: '+editPartner.name+'; reducere: '+editPartner.discount+'%; status: '+editPartner.status);setEditPartner(null);setSaved('Condițiile partenerului au fost salvate în acest browser.');};
 const setPartnerField=<K extends keyof Partner>(k:K,v:Partner[K])=>setEditPartner(p=>p?{...p,[k]:v}:p);
 const saveProduct=(data:ProductSave)=>{if(!adminOnly())return;logAction('PRODUCT_SAVE',data.product.id,'Salvare produs; cost: '+data.cost+' MDL; stoc total: '+data.stock);setItems(old=>[...old.filter(i=>i.id!==data.product.id),{id:data.product.id,cost:data.cost,stock:data.stock,stockBySize:data.stockBySize,active:data.active}]);setEditingProduct(null);setProductVersion(x=>x+1);setSaved('Produsul a fost salvat. Actualizați magazinul pentru a vedea produsul sau promoția.');};
 const saveItem=(e:FormEvent)=>{e.preventDefault();if(!adminOnly())return;if(!draftItem)return;
 const p=products.find(p=>p.id===draftItem.id);
 const sizes=p?.sizes??[];
 if(!draftItem.stockBySize || sizes.some(size=>!Number.isSafeInteger(Number(draftItem.stockBySize?.[size])) || (draftItem.stockBySize?.[size]??0)<0 || (draftItem.stockBySize?.[size]??0)>999999)){setSaved('Verificați stocul pe mărimi.');return}
 const normalized={...draftItem,stock:totalQuantity(draftItem)};
 logAction('STOCK_EDIT',draftItem.id,'Modificare manuală stoc / cost. Total: '+normalized.stock+'; cost: '+normalized.cost);setItems(prev=>[...prev.filter(p=>p.id!==draftItem.id),normalized]);setEditingItem(null);setDraftItem(null);setSaved('Prețul de achiziție și stocul au fost salvate local.');};
 // Availability for online fulfillment is calculated from physical receipts, shipments,
 // counter sales and reserved/fulfilled online orders. Branches never see unassigned orders.
 const branchPhysical=(warehouseId:string,sku:string,size:string)=>{
  const received=transfers.reduce((n,t)=>n+(t.to===warehouseId&&t.sku===sku&&t.size===size&&t.status==='received'?t.qty:0),0);
  const dispatched=transfers.reduce((n,t)=>n+(t.from===warehouseId&&t.sku===sku&&t.size===size?t.qty:0),0);
  const sold=branchSales.reduce((n,t)=>n+(t.warehouseId===warehouseId&&t.sku===sku&&t.size===size?t.qty:0),0);
  return Math.max(0,received-dispatched-sold);
 };
 const onlineCommitted=(warehouseId:string,sku:string,size:string,excludeId?:string)=>orders.reduce((n,o)=>{
  if(o.id===excludeId||o.assignedWarehouseId!==warehouseId||!o.fulfillmentLines||!o.fulfillmentStatus)return n;
  return n+o.fulfillmentLines.reduce((v,line)=>v+(line.id===sku&&line.size===size?line.qty:0),0);
 },0);
 const branchAvailable=(warehouseId:string,sku:string,size:string,excludeId?:string)=>Math.max(0,branchPhysical(warehouseId,sku,size)-onlineCommitted(warehouseId,sku,size,excludeId));
 const openOrder=(id:string)=>{setSelectedOrderId(id);const o=orders.find(x=>x.id===id);setRoutingBranch(o?.assignedWarehouseId??'');setRoutingSizes(Object.fromEntries((o?.fulfillmentLines??[]).map((x,i)=>[i,x.size])));setRoutingError('');};
 const routeOrder=(o:Order)=>{
  if(!adminOnly())return;
  if(o.fulfillmentStatus==='delivered'){setRoutingError('Comanda a fost deja predată; nu poate fi redirecționată.');return;}
  if(!routingBranch){setRoutingError('Selectați filiala.');return;}
  if(!warehouses.some(w=>w.id===routingBranch&&w.active)){setRoutingError('Filiala nu este activă.');return;}
  const lines=o.lines.map((line,i)=>({...line,size:routingSizes[i]??''}));
  if(lines.some(l=>!l.size||!(products.find(p=>p.id===l.id)?.sizes??[]).includes(l.size))){setRoutingError('Selectați mărimea fiecărui produs.');return;}
  const required=new Map<string,number>();for(const l of lines){const k=l.id+'|'+l.size;required.set(k,(required.get(k)??0)+l.qty);}
  for(const [k,qty] of required){const [sku,size]=k.split('|');if(branchAvailable(routingBranch,sku,size,o.id)<qty){setRoutingError('Stoc insuficient pentru '+sku+' / '+size+'. Disponibil: '+branchAvailable(routingBranch,sku,size,o.id)+'; necesar: '+qty+'.');return;}}
  setOrders(prev=>prev.map(row=>row.id===o.id?{...row,assignedWarehouseId:routingBranch,fulfillmentLines:lines.map(l=>({id:l.id,size:l.size,qty:l.qty})),fulfillmentStatus:'assigned',status:'processing'}:row));
  logAction('ORDER_ROUTE',o.id,'Alocare către '+(warehouses.find(w=>w.id===routingBranch)?.name??routingBranch)+'; '+lines.map(l=>l.id+'/'+l.size+' × '+l.qty).join('; '));
  setSaved('Comanda '+o.id+' a fost atribuită filialei.');setRoutingError('');
 };
 const cancelRouting=(o:Order)=>{
  if(!adminOnly()||o.fulfillmentStatus==='delivered')return;
  setOrders(prev=>prev.map(row=>row.id===o.id?{...row,assignedWarehouseId:undefined,fulfillmentLines:undefined,fulfillmentStatus:undefined}:row));
  logAction('ORDER_UNASSIGN',o.id,'Comanda revine la depozitul central.');setRoutingBranch('');setRoutingSizes({});setRoutingError('');
 };
 const changeBranchOrder=(id:string,next:'preparing'|'delivered'):string|null=>{
  const o=orders.find(x=>x.id===id);
  if(!o||!o.assignedWarehouseId||!o.fulfillmentLines||!o.fulfillmentStatus)return 'Comanda nu este atribuită.';
  if(role!=='admin'&&o.assignedWarehouseId!==actingEmployee?.warehouseId)return 'Acces interzis pentru această filială.';
  if(o.fulfillmentStatus==='delivered')return 'Comanda a fost deja finalizată.';
  if(next==='delivered'){
   for(const line of o.fulfillmentLines){const stock=branchPhysical(o.assignedWarehouseId,line.id,line.size);const reservedOther=onlineCommitted(o.assignedWarehouseId,line.id,line.size,o.id);if(stock-reservedOther<line.qty)return 'Stoc insuficient la predare: '+line.id+' / '+line.size;}
  }
  const at=next==='delivered'?new Date().toISOString():undefined;
  setOrders(prev=>prev.map(x=>x.id===id?{...x,fulfillmentStatus:next,status:next==='delivered'?'completed':'processing',fulfilledAt:at}:x));
  logAction(next==='delivered'?'ORDER_BRANCH_DELIVERED':'ORDER_BRANCH_PREPARING',id,'Filiala '+o.assignedWarehouseId+'; status '+next);
  return null;
 };
 const changeOrder=(id:string,status:Order['status'])=>{const previous=orders.find(o=>o.id===id)?.status??'necunoscut';logAction('ORDER_STATUS',id,previous+' → '+status);setOrders(old=>old.map(o=>o.id===id?{...o,status}:o));setSaved('Statusul comenzii demonstrative a fost modificat.');};
 const commitMovement=(nextItems:ItemConfig[],movement:StockMovement)=>{if(!adminOnly())return;logAction('STOCK_MOVEMENT',JSON.stringify(movement).slice(0,130),JSON.stringify(movement).slice(0,450));setItems(nextItems);setMovements(prev=>[...prev,movement]);setSaved('Mișcarea de stoc a fost înregistrată local.');};
 const createBranch=(branch:BranchWarehouse)=>{if(!adminOnly())return;setWarehouses(old=>[...old,branch]);logAction('BRANCH_CREATE',branch.id,branch.name+' · '+branch.city);setSaved('Filiala a fost creată în acest browser.');};
 const dispatchBranchBatch=(lines:WarehouseTransfer[]):string|null=>{
   if(!adminOnly())return 'Acces interzis.';
   if(lines.length===0)return 'Nu există mărimi selectate.';
   const first=lines[0];
   const validLocation=(id:string)=>id==='central'||warehouses.some(w=>w.id===id&&w.active);
   if(!validLocation(first.from)||!validLocation(first.to)||first.from===first.to)return 'Selectați două depozite active diferite.';
   if(lines.some(t=>t.sku!==first.sku||t.to!==first.to||t.from!==first.from||t.status!=='in_transit'))return 'Documentul trebuie să conțină un singur produs și aceeași rută.';
   const sums:Record<string,number>={};
   for(const line of lines){if(!Number.isSafeInteger(line.qty)||line.qty<1)return 'Cantitate invalidă.';sums[line.size]=(sums[line.size]??0)+line.qty;}
   const current=items.find(i=>i.id===first.sku);
   const sourceQuantity=(size:string)=>first.from==='central'?(current?.stockBySize?.[size]??0):transfers.reduce((n,t)=>t.sku===first.sku&&t.size===size?n+(t.status==='received'&&t.to===first.from?t.qty:0)-(t.from===first.from?t.qty:0):n,0)-branchSales.reduce((n,s)=>n+(s.warehouseId===first.from&&s.sku===first.sku&&s.size===size?s.qty:0),0);
   if(first.from==='central'&&!current?.stockBySize)return 'Stocul central nu a fost repartizat pe mărimi.';
   // The UI checks central reserve; validate the physical stock again here.
   for(const [size,amount] of Object.entries(sums)){if(sourceQuantity(size)<amount)return 'Stoc insuficient la depozitul expeditor, mărimea '+size+'.';}
   if(first.from==='central')setItems(old=>old.map(item=>{
     if(item.id!==first.sku)return item;
     const updatedBySize={...(item.stockBySize??{})};
     for(const [size,amount] of Object.entries(sums))updatedBySize[size]=(updatedBySize[size]??0)-amount;
     return {...item,stockBySize:updatedBySize,stock:Object.values(updatedBySize).reduce((n,v)=>n+v,0)};
   }));
   // For a branch, dispatch is registered in transfers and deducted by the stock formula.
   setTransfers(old=>[...old,...lines]);
   const sourceName=first.from==='central'?'ORTOMED Bălți':(warehouses.find(w=>w.id===first.from)?.name??first.from);
   const targetName=first.to==='central'?'ORTOMED Bălți':(warehouses.find(w=>w.id===first.to)?.name??first.to);
   logAction('TRANSFER_DISPATCH',first.documentId??first.id,sourceName+' → '+targetName+'; '+first.sku+' / '+lines.map(t=>t.size+' × '+t.qty).join(', '));
   return null;
 };
 const receiveBranchBatch=(ids:string[])=>{
   if(role!=='admin'&&role!=='branch'&&role!=='sales')return;
   if(assignedToBranch&&ids.some(id=>!transfers.some(t=>t.id===id&&t.to===actingEmployee?.warehouseId)))return;
   if(ids.length===0)return;
   const pending=transfers.filter(t=>ids.includes(t.id)&&t.status==='in_transit');
   if(!pending.length)return;
   const receivedAt=new Date().toISOString();
   setTransfers(old=>old.map(t=>ids.includes(t.id)&&t.status==='in_transit'?{...t,status:'received',receivedAt}:t));
   // Incoming receipts to the central location update its persisted physical stock.
   const incomingCentral=pending.filter(t=>t.to==='central');
   if(incomingCentral.length)setItems(old=>old.map(item=>{
     const relevant=incomingCentral.filter(t=>t.sku===item.id);
     if(!relevant.length)return item;
     const bySize={...(item.stockBySize??{})};
     for(const t of relevant)bySize[t.size]=(bySize[t.size]??0)+t.qty;
     return {...item,stockBySize:bySize,stock:Object.values(bySize).reduce((n,v)=>n+v,0)};
   }));
   logAction('TRANSFER_RECEIVED',pending[0].documentId??pending[0].id,pending.map(t=>t.size+' × '+t.qty).join(', '));
   setSaved('Recepția tuturor mărimilor a fost confirmată.');
 };
 const recordBranchSale=(sale:BranchSale):string|null=>{
   if(assignedToBranch&&sale.warehouseId!==actingEmployee?.warehouseId)return 'Filiala nu corespunde contului angajatului.';
   if(role==='sales'&&!assignedToBranch)return 'Managerul central nu este atribuit unei filiale pentru operațiuni de casă.';
   if(!warehouses.some(w=>w.id===sale.warehouseId&&w.active))return 'Filiala este indisponibilă.';
   if(!Number.isSafeInteger(sale.qty)||sale.qty<=0)return 'Cantitate invalidă.';
   const incoming=transfers.reduce((n,t)=>n+(t.to===sale.warehouseId&&t.sku===sale.sku&&t.size===sale.size&&t.status==='received'?t.qty:0),0);
   const outgoing=transfers.reduce((n,t)=>n+(t.from===sale.warehouseId&&t.sku===sale.sku&&t.size===sale.size?t.qty:0),0);
   const sold=branchSales.reduce((n,s)=>n+(s.warehouseId===sale.warehouseId&&s.sku===sale.sku&&s.size===sale.size?s.qty:0),0);
   const reserved=onlineCommitted(sale.warehouseId,sale.sku,sale.size);
   if(incoming-outgoing-sold-reserved<sale.qty)return 'Stoc insuficient: produsele rezervate comenzilor online nu pot fi vândute la ghișeu.';
   setBranchSales(old=>[...old,sale]);
   logAction('BRANCH_RETAIL_SALE',sale.id,sale.warehouseId+' · '+sale.sku+'/'+sale.size+' × '+sale.qty+' · '+sale.payment+' · '+sale.qty*sale.unitPrice+' MDL');
   return null;
 };
 const reset=()=>{if(!adminOnly())return;if(!window.confirm('Resetați toate datele demonstrative ale panoului?'))return;setPartners(copy(partnersSeed));setItems(copy(itemSeeds));setOrders(copy(orderSeeds));setMovements([]);setWarehouses([]);setTransfers([]);setBranchSales([]);logAction('DEMO_RESET','Date demo','Resetare parteneri, stocuri, comenzi și mișcări. Jurnalul este păstrat.');setSaved('Datele demonstrative au fost resetate.');};
 const filtered=products.filter(p=>(p.nameRo+' '+p.id+' '+p.nameRu).toLowerCase().includes(search.toLowerCase()));
 void productVersion;
 const revenueByType={retail:orders.filter(o=>o.partner==='retail').reduce((s,o)=>s+o.lines.reduce((a,l)=>a+l.unit*l.qty,0),0)+branchSales.reduce((n,s)=>n+s.qty*s.unitPrice,0),b2b:orders.filter(o=>o.partner!=='retail').reduce((s,o)=>s+o.lines.reduce((a,l)=>a+l.unit*l.qty,0),0)};
 return <div className="oa-root">
  <aside className="oa-sidebar">
   <div className="oa-brand"><span className="oa-brand-icon"><Activity size={26}/></span><span><strong>ORTO<span>MED</span></strong><small>ADMINISTRATION</small></span></div>
   <span className="oa-side-title">MANAGEMENT</span>
   <nav aria-label="Administrare">{tabs.filter(t=>role==='admin'||(assignedToBranch&&t.id==='branchops')||(role==='sales'&&!assignedToBranch&&salesTabs.includes(t.id))).map(t=>{const I=t.icon;return <button type="button" key={t.id} className={'oa-menu-item '+(tab===t.id?'selected':'')} onClick={()=>{setTab(t.id);setSaved('')}}><I size={19}/>{t.label}</button>})}</nav>
   <div className="oa-side-foot"><ShieldAlert size={18}/><div><b>Mod demonstrativ</b><span>Fără acces securizat sau conexiune la baza de date.</span></div></div>
   <Link className="oa-return" to="/"><ArrowLeft size={17}/> Înapoi la magazin</Link>
  </aside>
  <main className="oa-main">
   <header className="oa-top"><div><span className="oa-kicker">ORTOMED PLUS S.R.L.</span><h1>{tabs.find(t=>t.id===tab)?.label}</h1></div><div className="oa-top-right"><span className="oa-demo">DEMO · date fictive</span><label className="oa-role-selector"><UserCog size={18}/><span>Angajat (simulare)</span><select aria-label="Angajat demonstrativ" value={actingEmployee?.id??''} onChange={e=>switchEmployee(e.target.value)}>{employees.filter(e=>e.status==='active').map(e=><option key={e.id} value={e.id}>{e.name} — {e.role==='admin'?'Admin':e.role==='branch'?'Vânzător filială':'Manager vânzări'}</option>)}</select></label><div className="oa-avatar">{(actingEmployee?.name??'??').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div></div></header>
   <div className="oa-demo-access"><ShieldAlert size={18}/> Angajații, rolurile și jurnalul sunt simulate local. Nu există autentificare, permisiuni securizate sau jurnal rezistent la modificări; acestea vor fi implementate în backend.</div>
   {saved&&<div className="oa-notice" role="status"><Check size={17}/>{saved}<button aria-label="Close" onClick={()=>setSaved('')}><X size={16}/></button></div>}
   {tab==='overview'&&role==='admin'&&<><p className="oa-intro">Indicatori calculați din comenzile demonstrative ale panoului. Nu reprezintă vânzările reale ORTOMED.</p>
    <section className="oa-metrics"><Metric icon={Wallet} label="Vânzări simulate" value={mdl(stats.revenue)}/><Metric icon={TrendingUp} label="Profit brut estimat" value={mdl(stats.profit)}/><Metric icon={BarChart3} label="Marjă brută" value={percent(stats.margin)}/><Metric icon={Package} label="Valoarea stocului" value={mdl(stats.inventory)}/></section>
    <div className="oa-two"><section className="oa-panel"><div className="oa-section-heading"><h2>Comenzi recente</h2><button onClick={()=>setTab('orders')}>Vezi toate →</button></div><div className="oa-table-scroll"><table><thead><tr><th>Număr</th><th>Client</th><th>Valoare</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><button type="button" className="oa-order-link" onClick={()=>openOrder(o.id)}>{o.id}</button></td><td>{o.partner==='retail'?'Client retail':partnerById.get(o.partner)?.name||'Partener'}</td><td>{mdl(o.lines.reduce((s,l)=>s+l.unit*l.qty,0))}</td><td><Status status={o.status}/></td></tr>)}</tbody></table></div></section>
    <section className="oa-panel"><h2>Structura vânzărilor demo</h2><div className="oa-progress-list"><div><span>B2B</span><strong>{mdl(revenueByType.b2b)}</strong></div><div className="oa-progress"><span style={{width:`${stats.revenue?revenueByType.b2b/stats.revenue*100:0}%`}}/></div><div><span>Retail</span><strong>{mdl(revenueByType.retail)}</strong></div><div className="oa-progress retail"><span style={{width:`${stats.revenue?revenueByType.retail/stats.revenue*100:0}%`}}/></div></div><p className="oa-note">Marja = (venituri − costul mărfurilor) / venituri. Nu include chiria, salariile și taxele.</p></section></div>
   </>}
   {tab==='overview'&&role==='sales'&&<><section className="oa-metrics"><Metric icon={ClipboardList} label="Comenzi demo" value={String(orders.length)}/><Metric icon={ShoppingBag} label="Produse comandate" value={String(orders.reduce((s,o)=>s+o.lines.reduce((a,l)=>a+l.qty,0),0))}/></section><section className="oa-panel"><h2>Comenzi de procesat</h2><p>Managerul vânzări poate consulta clienții și procesa comenzile. Costurile, marjele și prețurile de achiziție nu sunt afișate.</p><button className="oa-primary" onClick={()=>setTab('orders')}>Deschide comenzile</button></section></>}
   {tab==='customers'&&<CustomersPanel readOnly={role==='sales'} onAudit={(action,target,details)=>logAction(action,target,details)} partners={partners} orders={orders} onPartnerStatusChange={(id,status)=>{if(!adminOnly())return;logAction('PARTNER_STATUS',id,'Status: '+status);setPartners(old=>old.map(p=>p.id===id?{...p,status}:p))}} onOpenOrder={(id)=>{openOrder(id);}} onAddB2B={()=>{if(adminOnly())setEditPartner(emptyPartner())}}/>}
   {tab==='blogeditor'&&role==='admin'&&<BlogEditor onChange={(action,detail)=>{logAction(action,'Blog',detail);setSaved('Articolul a fost actualizat în acest browser (DEMO).')}}/>}
    {tab==='guideeditor'&&role==='admin'&&<GuideEditor onChange={(action,detail)=>{logAction(action,'Ghidul pacientului',detail);setSaved('Ghidul pacientului a fost actualizat în acest browser (DEMO).')}}/>}
   {tab==='banners'&&role==='admin'&&<BannersPanel onChange={(action,detail)=>{logAction(action,'banner principal',detail);setSaved('Slide-urile au fost actualizate (DEMO).')}}/>}
   {tab==='categories'&&role==='admin'&&<CategoriesPanel onChange={(action,detail)=>{logAction(action,'categorii',detail);setSaved('Categoriile au fost actualizate (DEMO).')}}/>}
   {tab==='partners'&&<section className="oa-panel"><div className="oa-section-heading"><div><h2>Parteneri și reduceri individuale</h2><p>Reducerea se aplică prețului retail. Modificările sunt locale, nu sunt afișate partenerilor reali.</p></div><button className="oa-primary" onClick={()=>setEditPartner(emptyPartner())}><Plus size={17}/> Adaugă partener</button></div><div className="oa-table-scroll"><table><thead><tr><th>Companie</th><th>IDNO</th><th>Reducere</th><th>Preț din 1.000 MDL</th><th>Status</th><th>Acțiuni</th></tr></thead><tbody>{partners.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.idno||'—'}</td><td><b className="oa-blue">−{p.discount}%</b></td><td>{mdl(1000*(1-p.discount/100))}</td><td><span className={'oa-chip '+(p.status==='active'?'good':'neutral')}>{p.status==='active'?'Activ':'Suspendat'}</span></td><td><button className="oa-outline" onClick={()=>setEditPartner({...p})}><Edit3 size={15}/> Editează</button></td></tr>)}</tbody></table></div><p className="oa-note">Exemplu: DIRIPIO-FARM are reducere demo de 25%. Pentru prețuri reale este necesar API-ul de pricing cu controlul marjei.</p></section>}
   {tab==='products'&&<section className="oa-panel"><div className="oa-section-heading"><div><h2>Produse, costuri și stocuri pe mărimi</h2><p>Fiecare mărime are stoc separat. Totalul este calculat automat. Date demonstrative salvate în acest browser.</p></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="oa-outline" onClick={()=>setTab('categories')}><Plus size={16}/> Categorii</button><button className="oa-primary" onClick={()=>setEditingProduct('__new__')}><Plus size={16}/> Adaugă produs</button><button className="oa-outline" onClick={()=>{setTab('movements');setMovementSku(products[0]?.id??'')}}><Truck size={16}/> Mișcări de stoc</button><button className="oa-outline" onClick={()=>downloadCsv('ortomed_stoc_pe_marimi_demo.csv',[['Cod','Produs','Mărime','Cantitate','Preț retail MDL','Cost MDL'],...products.flatMap(p=>{const item=itemById.get(p.id);return p.sizes.map(size=>[p.id,p.nameRo,size,hasSizeStock(item)?String(item?.stockBySize?.[size]??0):'NEALOCAT',String(p.price),String(item?.cost??0)])})])}><Download size={16}/> Export CSV pe mărimi</button></div></div>
<div className="oa-toolbar"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută după denumire sau cod SKU" aria-label="Caută produse"/></div>
<div className="oa-table-scroll"><table><thead><tr><th>Produs</th><th>Preț retail</th><th>Cost de achiziție</th><th>Marjă</th><th>Stoc total</th><th>Stoc pe mărimi</th><th>Acțiuni</th></tr></thead><tbody>{filtered.map(p=>{const i=itemById.get(p.id);const cost=i?.cost??0;const margin=p.price?(p.price-cost)/p.price*100:0;return <tr key={p.id}><td><div className="oa-product"><img src={p.image} alt=""/><span><strong>{p.nameRo}</strong><small>{p.id} · {categories.find(x=>x.id===p.category)?.ro??p.category}</small></span></div></td><td>{mdl(p.price)}{p.oldPrice&&p.oldPrice>p.price&&<small className="oa-block oa-red">Promo −{p.promoPercent??Math.round((1-p.price/p.oldPrice)*100)}%</small>}</td><td>{mdl(cost)}</td><td><span className={margin<15?'oa-red':'oa-green'}>{percent(margin)}</span></td><td><strong>{totalQuantity(i)} buc.</strong>{!hasSizeStock(i)&&<small className="oa-block oa-red">Nerepartizat pe mărimi</small>}</td><td><div className="oa-size-list">{p.sizes.map(size=><span className={'oa-size-pill '+(hasSizeStock(i)&&(i?.stockBySize?.[size]??0)===0?'oa-size-zero':'')} key={size}><b>{size}</b> {hasSizeStock(i)?i?.stockBySize?.[size]??0:'—'}</span>)}</div></td><td><div className="oa-stock-actions"><button className="oa-outline" onClick={()=>setEditingProduct(p.id)}><Edit3 size={15}/> Produs / promo</button><button className="oa-outline" onClick={()=>{setMovementSku(p.id);setTab('movements')}}><Truck size={15}/> Mișcări</button><button className="oa-outline" onClick={()=>{const original=i??{id:p.id,cost:0,stock:0,active:true};setEditingItem(p.id);setDraftItem({...original,stockBySize:original.stockBySize?{...original.stockBySize}:Object.fromEntries(p.sizes.map(size=>[size,0]))})}}><Edit3 size={15}/> Stoc pe mărimi / cost</button></div></td></tr>})}</tbody></table></div><p className="oa-note">Dacă apare „Nerepartizat pe mărimi”, stocul vechi nu poate fi asociat automat unei mărimi. Deschideți „Stoc pe mărimi / cost” și completați cantitățile reale. Un stoc 0 este marcat distinct.</p></section>}
   {tab==='movements'&&<StockMovements items={items} movements={movements} onCommit={commitMovement} selectedSku={movementSku} onSelectSku={setMovementSku}/>}
   {tab==='branchops'&&<BranchOperationsPanel warehouses={warehouses} transfers={transfers} items={items} sales={branchSales} warehouseId={assignedToBranch?(actingEmployee?.warehouseId??''):activeBranchId} employeeId={actingEmployee?.id??'demo'} employeeName={actingEmployee?.name??'Demo'} canChooseWarehouse={role==='admin'} onWarehouseChange={setActiveBranchId} onReceiveBatch={receiveBranchBatch} onRecordSale={recordBranchSale} onlineOrders={orders.filter(o=>o.assignedWarehouseId===(assignedToBranch?actingEmployee?.warehouseId:activeBranchId)).map(o=>({...o,buyer:demoContactByOrder[o.id]}))} onOnlineOrderStatus={changeBranchOrder}/>}
   {tab==='warehouses'&&<WarehousesPanel warehouses={warehouses} transfers={transfers} items={items} onCreateBranch={createBranch} onDispatchBatch={dispatchBranchBatch} onReceiveBatch={receiveBranchBatch} sales={branchSales}/>}

   {tab==='orders'&&<section className="oa-panel"><div className="oa-section-heading"><div><h2>Comenzi demonstrative</h2><p>Apasă pe numărul comenzii sau pe „Detalii” pentru datele cumpărătorului, livrare, produse și observații.</p></div><span className="oa-counter">{orders.length} comenzi demo</span></div><div className="oa-table-scroll"><table><thead><tr><th>Comandă</th><th>Client</th><th>Produse</th><th>Valoare</th>{role==='admin'&&<><th>Cost</th><th>Profit brut</th></>}<th>Depozit responsabil</th><th>Status</th><th>Detalii</th></tr></thead><tbody>{orders.map(o=>{const value=o.lines.reduce((s,l)=>s+l.unit*l.qty,0);const cost=o.lines.reduce((s,l)=>s+(itemById.get(l.id)?.cost??0)*l.qty,0);return <tr key={o.id}><td><button type="button" className="oa-order-link" onClick={()=>openOrder(o.id)}>{o.id}</button><small className="oa-block">{o.created}</small></td><td>{o.partner==='retail'?'Retail':partnerById.get(o.partner)?.name??'Partener B2B'}</td><td>{o.lines.reduce((s,l)=>s+l.qty,0)} buc.</td><td>{mdl(value)}</td>{role==='admin'&&<><td>{mdl(cost)}</td><td className={value-cost<0?'oa-red':'oa-green'}>{mdl(value-cost)}</td></>}<td>{o.assignedWarehouseId?(warehouses.find(w=>w.id===o.assignedWarehouseId)?.name??'Filială'):'Bălți · central'}</td><td><select className="oa-status-select" disabled={Boolean(o.assignedWarehouseId)} value={o.status} aria-label={'Status '+o.id} onChange={(e:ChangeEvent<HTMLSelectElement>)=>changeOrder(o.id,e.target.value as Order['status'])}><option value="new">Nouă</option><option value="processing">În procesare</option><option value="shipped">Expediată</option><option value="completed">Finalizată</option></select></td><td><button className="oa-outline" type="button" onClick={()=>openOrder(o.id)}><FileText size={16}/> Detalii</button></td></tr>})}</tbody></table></div><p className="oa-note">Numerele, detaliile de contact și comenzile de mai sus sunt fictive. Modificările de status nu declanșează notificări reale.</p></section>}
   {tab==='finance'&&<><section className="oa-metrics"><Metric icon={Wallet} label="Venituri" value={mdl(stats.revenue)}/><Metric icon={ShoppingBag} label="Cost mărfuri" value={mdl(stats.cogs)}/><Metric icon={TrendingUp} label="Profit brut" value={mdl(stats.profit)}/><Metric icon={BarChart3} label="Marjă brută" value={percent(stats.margin)}/></section><div className="oa-two"><section className="oa-panel"><h2>Profitabilitate pe produs (demo)</h2><div className="oa-table-scroll"><table><thead><tr><th>Cod</th><th>Retail</th><th>Cost</th><th>Profit/unitate</th><th>Marjă</th></tr></thead><tbody>{products.map(p=>{const cost=itemById.get(p.id)?.cost??0;return <tr key={p.id}><td>{p.id}</td><td>{mdl(p.price)}</td><td>{mdl(cost)}</td><td className={p.price-cost<0?'oa-red':'oa-green'}>{mdl(p.price-cost)}</td><td>{percent(p.price?(p.price-cost)/p.price*100:0)}</td></tr>})}</tbody></table></div></section><section className="oa-panel"><h2>Control reducere B2B</h2><p className="oa-note">Exemplu pentru un produs la preț retail 1.000 MDL, cost 700 MDL și marja minimă dorită de 15%.</p><div className="oa-finance-row"><span>Preț retail</span><strong>1.000,00 MDL</strong></div><div className="oa-finance-row"><span>Cost</span><strong>700,00 MDL</strong></div><div className="oa-finance-row"><span>Preț minim cu marjă 15%</span><strong>{mdl(700/(1-.15))}</strong></div><div className="oa-finance-row"><span>Reducere maximă</span><strong>{percent((1-(700/(1-.15))/1000)*100)}</strong></div><div className="oa-warning"><ShieldAlert size={19}/> În etapa următoare acest control va fi calculat pe fiecare produs și partener, pe server.</div></section></div></>}
   {tab==='audit'&&role==='admin'&&<section className="oa-panel"><div className="oa-section-heading"><div><h2>Jurnal de activitate · DEMO</h2><p>Data, ora, rolul și acțiunea. Ultimele 2.000 de evenimente, doar în acest browser. Ora afișată este locală.</p></div><button type="button" className="oa-outline" onClick={()=>downloadCsv('ortomed_jurnal_demo.csv',[['Data și ora (ISO)','Operator','Rol','Acțiune','Obiect','Detalii'],...audit.map(a=>[a.at,a.actor,a.role,a.action,a.target,a.details])])}><Download size={16}/> Export CSV</button></div><div className="oa-table-scroll"><table><thead><tr><th>Data și ora</th><th>Operator</th><th>Acțiune</th><th>Obiect</th><th>Detalii</th></tr></thead><tbody>{audit.map(a=><tr key={a.id}><td>{new Date(a.at).toLocaleString('ro-MD')}</td><td>{a.actor}</td><td><strong>{a.action}</strong></td><td>{a.target}</td><td>{a.details}</td></tr>)}{audit.length===0&&<tr><td colSpan={5}>Nu există evenimente demo. Modificați statusul unei comenzi pentru primul exemplu.</td></tr>}</tbody></table></div><p className="oa-note">Jurnalul local poate fi modificat sau șters de utilizator și nu constituie o urmă de audit juridică. Nu stocați date sensibile în el.</p></section>}
   {tab==='settings'&&role==='admin'&&<><EmployeesPanel warehouses={warehouses} employees={employees} actingEmployeeId={actingEmployee?.id??''} onSave={saveEmployee}/><section className="oa-panel oa-settings"><h2>Alte setări demonstrative</h2><p>Nu există încă parole, autentificare, invitații prin email sau control al accesului pe server.</p><div className="oa-settings-cards"><div><Building2 size={23}/><strong>Companie</strong><span>ORTOMED PLUS S.R.L.</span></div><div><Truck size={23}/><strong>Livrare</strong><span>De configurat după integrarea backend-ului</span></div><div><FileText size={23}/><strong>Facturi și documente</strong><span>Conturile reale vor fi stocate pe server</span></div></div><button className="oa-danger" onClick={reset}><Trash2 size={17}/> Resetează datele demo</button></section></>}
  </main>
  {selectedOrder&&<div className="oa-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedOrderId(null)}}>
   <section className="oa-order-modal" role="dialog" aria-modal="true" aria-label={'Detalii comandă '+selectedOrder.id}>
    <div className="oa-order-modal-header"><div><span className="oa-demo">DEMO · date fictive</span><h2>Comanda {selectedOrder.id}</h2><small>Data: {selectedOrder.created} · {selectedOrder.partner==='retail'?'Client retail':'Partener B2B'}</small></div><button type="button" className="oa-close-detail" onClick={()=>setSelectedOrderId(null)} aria-label="Închide detaliile"><X size={23}/></button></div>
    <div className="oa-order-modal-body">
     <div className="oa-order-note"><ShieldAlert size={18}/>Date demonstrative: adresele, telefoanele și comentariile reale vor fi preluate din comenzi după conectarea backend-ului.</div>
     <div className="oa-detail-grid">
      <section className="oa-detail-card"><h3><Users size={18}/> Date client</h3><DetailRow label="Client / companie" value={demoContactByOrder[selectedOrder.id]?.company??(partnerById.get(selectedOrder.partner)?.name??'Client neidentificat')}/><DetailRow label="IDNO" value={demoContactByOrder[selectedOrder.id]?.idno??'Nu este disponibil'}/><DetailRow label="Persoană de contact" value={demoContactByOrder[selectedOrder.id]?.contactName??'Nu este completat'}/><DetailRow label="Telefon" value={demoContactByOrder[selectedOrder.id]?.phone??'Nu este completat'}/><DetailRow label="Email" value={demoContactByOrder[selectedOrder.id]?.email??'Nu este completat'}/></section>
      <section className="oa-detail-card"><h3><Truck size={18}/> Livrare și plată</h3><DetailRow label="Metodă de livrare" value={demoContactByOrder[selectedOrder.id]?.delivery??'Nespecificată'}/><DetailRow label="Localitate" value={demoContactByOrder[selectedOrder.id]?.city??'Nespecificată'}/><DetailRow label="Adresa de livrare" value={demoContactByOrder[selectedOrder.id]?.address??'Nespecificată'}/><DetailRow label="Cod poștal" value={demoContactByOrder[selectedOrder.id]?.postal??'—'}/><DetailRow label="Metodă de plată" value={demoContactByOrder[selectedOrder.id]?.payment??'Nespecificată'}/><DetailRow label="Starea plății" value={demoContactByOrder[selectedOrder.id]?.paymentState??'Necunoscută'}/></section>
     </div>
     <section className="oa-detail-card"><h3><ClipboardList size={18}/> Produse comandate</h3><div className="oa-table-scroll"><table><thead><tr><th>Produs</th><th>Cod</th><th>Cantitate</th><th>Preț / buc.</th><th>Total</th></tr></thead><tbody>{selectedOrder.lines.map((l,index)=>{const p=products.find(x=>x.id===l.id);return <tr key={l.id+'-'+index}><td><div className="oa-product">{p&&<img src={p.image} alt=""/>}<span><strong>{p?.nameRo??'Produs necunoscut'}</strong><small>Mărime: neînregistrată în datele demo</small></span></div></td><td>{l.id}</td><td>{l.qty}</td><td>{mdl(l.unit)}</td><td><strong>{mdl(l.qty*l.unit)}</strong></td></tr>})}</tbody></table></div><div className="oa-order-total"><span>Total comandă (demo)</span><strong>{mdl(selectedOrder.lines.reduce((s,l)=>s+l.qty*l.unit,0))}</strong></div></section>
     <section className="oa-detail-card"><h3><FileText size={18}/> Observații la comandă</h3><p className="oa-order-comment">{demoContactByOrder[selectedOrder.id]?.comment??'Nu sunt disponibile comentarii pentru această înregistrare.'}</p></section>
     <section className="oa-detail-card"><h3><Truck size={18}/> Depozitul care procesează comanda</h3>
       <p className="oa-note">Toate comenzile online intră inițial la depozitul central Bălți. Numai Administrator poate atribui o comandă unei filiale. Angajații filialei văd numai comenzile alocate lor.</p>
       <p><strong>Responsabil actual: {selectedOrder.assignedWarehouseId?(warehouses.find(w=>w.id===selectedOrder.assignedWarehouseId)?.name??selectedOrder.assignedWarehouseId):'ORTOMED Bălți — depozit central'}</strong></p>
       {selectedOrder.fulfillmentStatus&&<p>Etapa filialei: <strong>{selectedOrder.fulfillmentStatus==='assigned'?'Alocată':selectedOrder.fulfillmentStatus==='preparing'?'În pregătire':'Predată clientului'}</strong></p>}
       {role==='admin'&&selectedOrder.fulfillmentStatus!=='delivered'&&<div className="oa-route-form"><label>Redirecționează către filială<select value={routingBranch} onChange={e=>{setRoutingBranch(e.target.value);setRoutingError('')}}><option value="">— Alege filiala —</option>{warehouses.filter(w=>w.active).map(w=><option key={w.id} value={w.id}>{w.name} · {w.city}</option>)}</select></label>
       {selectedOrder.lines.map((l,i)=><div key={i} className="oa-route-line"><span><b>{l.id}</b> · {products.find(p=>p.id===l.id)?.nameRo??'Produs'} · {l.qty} buc.</span><label>Mărime<select value={routingSizes[i]??selectedOrder.fulfillmentLines?.[i]?.size??''} onChange={e=>{setRoutingSizes(prev=>({...prev,[i]:e.target.value}));setRoutingError('')}}><option value="">Alege mărimea</option>{(products.find(p=>p.id===l.id)?.sizes??[]).map(size=><option key={size} value={size}>{size} · disponibil {routingBranch?branchAvailable(routingBranch,l.id,size,selectedOrder.id):'—'}</option>)}</select></label></div>)}
       {routingError&&<p role="alert" className="oa-route-error">{routingError}</p>}
       <div className="oa-route-actions"><button type="button" className="oa-primary" onClick={()=>routeOrder(selectedOrder)}>Atribuie comanda filialei</button>{selectedOrder.assignedWarehouseId&&<button type="button" className="oa-outline" onClick={()=>cancelRouting(selectedOrder)}>Retrage alocarea către filială</button>}</div>
       </div>}</section>
     <section className="oa-detail-card"><h3><ClipboardList size={18}/> Procesarea comenzii</h3><div className="oa-order-status-control"><label htmlFor="oa-detail-status">Statusul comenzii</label><select id="oa-detail-status" className="oa-status-select" disabled={Boolean(selectedOrder.assignedWarehouseId)} value={selectedOrder.status} onChange={e=>changeOrder(selectedOrder.id,e.target.value as Order['status'])}><option value="new">Nouă</option><option value="processing">În procesare</option><option value="shipped">Expediată</option><option value="completed">Finalizată</option></select></div><p className="oa-note">Istoricul complet al modificărilor, AWB-ul, factura și comentariile interne vor fi conectate la baza de date în etapa backend.</p></section>
    </div>
    <div className="oa-order-modal-footer"><button type="button" className="oa-primary" onClick={()=>setSelectedOrderId(null)}>Închide detaliile</button></div>
   </section>
  </div>}
  {editingProduct&&<ProductEditor key={editingProduct} product={editingProduct==='__new__'?null:products.find(p=>p.id===editingProduct)} initialCost={itemById.get(editingProduct)?.cost??0} initialStock={itemById.get(editingProduct)?.stock??0} initialStockBySize={itemById.get(editingProduct)?.stockBySize} initialActive={itemById.get(editingProduct)?.active??true} onClose={()=>setEditingProduct(null)} onSave={saveProduct}/>}
  {editPartner&&<div className="oa-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setEditPartner(null)}}><form className="oa-modal" onSubmit={savePartner} aria-label="Editare partener"><div className="oa-modal-head"><h2>{partners.some(p=>p.id===editPartner.id)?'Editare partener':'Partener nou'}</h2><button type="button" onClick={()=>setEditPartner(null)} aria-label="Închide"><X size={21}/></button></div><label>Denumirea companiei *<input required value={editPartner.name} onChange={e=>setPartnerField('name',e.target.value)} placeholder="Numele companiei"/></label><label>IDNO<input value={editPartner.idno} onChange={e=>setPartnerField('idno',e.target.value)} placeholder="IDNO"/></label><div className="oa-fields-two"><label>Reducere (%)<input type="number" min="0" max="90" step="0.5" value={editPartner.discount} onChange={e=>setPartnerField('discount',Math.min(90,Math.max(0,Number(e.target.value)||0)))}/></label><label>Status<div className="oa-select-wrap"><select value={editPartner.status} onChange={e=>setPartnerField('status',e.target.value as Partner['status'])}><option value="active">Activ</option><option value="paused">Suspendat</option></select><ChevronDown size={14}/></div></label></div><label>Persoană de contact<input value={editPartner.contact} onChange={e=>setPartnerField('contact',e.target.value)}/></label><label>Email<input type="email" value={editPartner.email} onChange={e=>setPartnerField('email',e.target.value)}/></label><div className="oa-mini-summary">La un preț retail de 1.000 MDL, partenerul plătește <strong>{mdl(1000*(1-editPartner.discount/100))}</strong>.</div><div className="oa-modal-actions"><button type="button" className="oa-outline" onClick={()=>setEditPartner(null)}>Anulează</button><button className="oa-primary" type="submit"><Save size={16}/> Salvează</button></div></form></div>}
  {editingItem&&draftItem&&<div className="oa-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setEditingItem(null);setDraftItem(null)}}}><form className="oa-modal" onSubmit={saveItem}><div className="oa-modal-head"><h2>Stoc pe mărimi · {editingItem}</h2><button type="button" onClick={()=>{setEditingItem(null);setDraftItem(null)}} aria-label="Închide"><X size={21}/></button></div><p>{products.find(p=>p.id===editingItem)?.nameRo}</p><label>Cost de achiziție / buc. (MDL)<input required type="number" min="0" step="0.01" value={draftItem.cost} onChange={e=>setDraftItem(p=>p?{...p,cost:Math.max(0,Number(e.target.value)||0)}:p)}/></label>
 {(!hasSizeStock(itemById.get(editingItem))&&totalQuantity(itemById.get(editingItem))>0)&&<div className="oa-warning"><ShieldAlert size={17}/> Stocul anterior: {totalQuantity(itemById.get(editingItem))} buc., fără repartizare pe mărimi. Introduceți cantitățile efective înainte de salvare; datele vechi nu sunt repartizate automat.</div>}
 <div className="oa-stock-modal-grid">{(products.find(p=>p.id===editingItem)?.sizes??[]).map(size=><label key={size}>Mărime {size}<input type="number" inputMode="numeric" required min="0" max="999999" step="1" value={draftItem.stockBySize?.[size]??0} onChange={e=>setDraftItem(prev=>prev?{...prev,stockBySize:{...prev.stockBySize,[size]:e.target.value===''?NaN:Number(e.target.value)}}:prev)}/>{(draftItem.stockBySize?.[size]??0)===0&&<small style={{color:'#bd4550'}}>Stoc epuizat</small>}</label>)}</div>
 <div className="oa-mini-summary">Total pe mărimi: <strong>{Number.isFinite(totalQuantity(draftItem))?totalQuantity(draftItem):'—'} buc.</strong><p>Valoarea stocului: <strong>{Number.isFinite(totalQuantity(draftItem))?mdl(totalQuantity(draftItem)*draftItem.cost):'—'}</strong></p></div>
 <div className="oa-warning"><ShieldAlert size={17}/> DEMO: evidența stocului pe mărimi se salvează local. În producție mișcările de stoc vor fi înregistrate pe loturi și documente, nu prin suprascrierea cantității.</div><div className="oa-modal-actions"><button type="button" className="oa-outline" onClick={()=>{setEditingItem(null);setDraftItem(null)}}>Anulează</button><button className="oa-primary" type="submit"><Save size={16}/> Salvează stocurile</button></div></form></div>}
 </div>;
}
function Metric({icon:Icon,label,value}:{icon:typeof Wallet;label:string;value:string}){return <div className="oa-metric"><div className="oa-metric-top"><span>{label}</span><span className="oa-metric-icon"><Icon size={22}/></span></div><strong>{value}</strong><small>Date demonstrative</small></div>}
function Status({status}:{status:Order['status']}){const map={new:'Nouă',processing:'În procesare',shipped:'Expediată',completed:'Finalizată'};return <span className={'oa-chip '+(status==='completed'?'good':status==='new'?'neutral':'blue')}>{map[status]}</span>}

function DetailRow({label,value}:{label:string;value:string}){return <div className="oa-detail-row"><span>{label}</span><strong>{value}</strong></div>}
