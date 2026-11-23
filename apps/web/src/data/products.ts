export type Product = {
  id: string;
  nameRo: string;
  nameRu: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: 'new' | 'best' | 'sale';
  sizes: string[];
  retailPrice?: number;
  promoPercent?: number;
  demoCustom?: boolean;
  descriptionRo?: string;
  descriptionRu?: string;
  specificationsRo?: string;
  specificationsRu?: string;
  gallery?: string[];
};

// Демо-товары из утверждённых дизайн-макетов. Не подключены к реальным остаткам/складу.
export const products: Product[] = [
  {id:'ORT-001',nameRo:'Orteză pentru genunchi cu stabilizare laterală',nameRu:'Ортез коленного сустава с боковой стабилизацией',category:'knee',price:1350,image:'/ortomed/images/product-1.webp',badge:'best',sizes:['S','M','L','XL']},
  {id:'ORT-004',nameRo:'Orteză pentru gleznă reglabilă',nameRu:'Регулируемый голеностопный ортез',category:'ankle',price:650,image:'/ortomed/images/product-2.webp',sizes:['S','M','L','XL']},
  {id:'ORT-002',nameRo:'Corset lombar cu întărire',nameRu:'Поясничный корсет с усилением',category:'back',price:980,oldPrice:1150,image:'/ortomed/images/product-3.webp',badge:'sale',sizes:['S','M','L','XL']},
  {id:'ORT-003',nameRo:'Ciorapi compresivi Clasa II',nameRu:'Компрессионные чулки класса II',category:'compression',price:520,image:'/ortomed/images/product-4.webp',sizes:['S','M','L','XL']},
  {id:'ORT-005',nameRo:'Orteză pentru încheietura mâinii',nameRu:'Ортез лучезапястного сустава',category:'hand',price:420,image:'/ortomed/images/product-5.webp',sizes:['S','M','L']},
  {id:'ORT-006',nameRo:'Walking boot (imobilizator)',nameRu:'Ортопедический иммобилизирующий ботинок',category:'ankle',price:1850,image:'/ortomed/images/product-6.webp',badge:'new',sizes:['S','M','L','XL']},
  {id:'ORT-007',nameRo:'Bandaj pentru cot cu compresie',nameRu:'Компрессионный бандаж на локоть',category:'hand',price:380,image:'/ortomed/images/product-7.webp',sizes:['S','M','L']},
  {id:'ORT-008',nameRo:'Bandaj rotulian de neopren',nameRu:'Неопреновый наколенник',category:'knee',price:290,image:'/ortomed/images/product-8.webp',sizes:['S','M','L']},
  {id:'ORT-009',nameRo:'Corector de postură',nameRu:'Корректор осанки',category:'back',price:750,image:'/ortomed/images/product-9.webp',sizes:['S','M','L','XL']},
  {id:'ORT-010',nameRo:'Branțuri ortopedice cu suport plantar',nameRu:'Ортопедические стельки с поддержкой свода',category:'insoles',price:320,image:'/ortomed/images/product-10.webp',sizes:['36','38','40','42','44']},
  {id:'ORT-011',nameRo:'Orteză pentru degetul mare',nameRu:'Ортез большого пальца',category:'hand',price:380,image:'/ortomed/images/product-11.webp',sizes:['S','M','L']},
  {id:'ORT-012',nameRo:'Orteză elastică pentru gleznă',nameRu:'Эластичный голеностопный бандаж',category:'ankle',price:290,image:'/ortomed/images/product-12.webp',sizes:['S','M','L']},
];
export type ProductCategory = {id:string;ro:string;ru:string;image:string};
export const categories: ProductCategory[] = [
  {id:'knee',ro:'Orteze genunchi',ru:'Ортезы колена',image:'/ortomed/images/product-1.webp'},
  {id:'ankle',ro:'Orteze gleznă',ru:'Ортезы голеностопа',image:'/ortomed/images/product-2.webp'},
  {id:'hand',ro:'Orteze mână',ru:'Ортезы кисти',image:'/ortomed/images/product-5.webp'},
  {id:'back',ro:'Corsete și bandaje',ru:'Корсеты и бандажи',image:'/ortomed/images/product-3.webp'},
  {id:'compression',ro:'Tricotaj compresiv',ru:'Компрессионный трикотаж',image:'/ortomed/images/product-4.webp'},
  {id:'insoles',ro:'Branțuri ortopedice',ru:'Ортопедические стельки',image:'/ortomed/images/product-10.webp'},
];
// Shared DEMO category registry. IDs remain stable so product links do not break.
export const DEMO_CATEGORIES_KEY = 'ortomed_demo_categories_v1';
export function readDemoCategories(): ProductCategory[] {
  if (typeof window === 'undefined') return categories;
  try {
    const saved = window.localStorage.getItem(DEMO_CATEGORIES_KEY);
    if (!saved) return categories;
    const rows: unknown = JSON.parse(saved);
    if (!Array.isArray(rows) || !rows.length) return categories;
    const valid = rows.filter((row): row is ProductCategory => Boolean(row) && typeof row === 'object' &&
      typeof row.id === 'string' && /^[a-z0-9-]{2,40}$/.test(row.id) &&
      typeof row.ro === 'string' && row.ro.trim().length > 0 &&
      typeof row.ru === 'string' && row.ru.trim().length > 0 &&
      typeof row.image === 'string');
    return valid.length ? valid : categories;
  } catch { return categories; }
}
export function saveDemoCategories(next: ProductCategory[]) {
  if (typeof window === 'undefined') return;
  const unique = new Set<string>();
  for (const c of next) {
    if (!/^[a-z0-9-]{2,40}$/.test(c.id) || !c.ro.trim() || !c.ru.trim() || unique.has(c.id))
      throw new Error('Date categorie incorecte sau ID duplicat.');
    unique.add(c.id);
  }
  if (!next.length) throw new Error('Trebuie să existe cel puțin o categorie.');
  window.localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(next));
  categories.splice(0, categories.length, ...next);
  window.dispatchEvent(new Event('ortomed-categories-updated'));
}
if (typeof window !== 'undefined') {
  const saved = readDemoCategories();
  if (saved !== categories) categories.splice(0,categories.length,...saved);
}

export const formatPrice = (value:number) => `${new Intl.NumberFormat('ro-MD',{maximumFractionDigits:0}).format(value)} MDL`;


// Catalog shared across demo storefront and demo administration.
// Only PUBLIC catalog data is saved here. Internal procurement cost remains in admin storage.
export const DEMO_CATALOG_KEY = 'ortomed_demo_catalog_v1';
export function readDemoCatalog(): Product[] {
  try {
    const raw = window.localStorage.getItem(DEMO_CATALOG_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Product =>
      !!x && typeof x === 'object' && typeof x.id === 'string' &&
      typeof x.nameRo === 'string' && typeof x.nameRu === 'string' &&
      typeof x.price === 'number' && Number.isFinite(x.price) && x.price >= 0 &&
      typeof x.category === 'string' && typeof x.image === 'string' &&
      Array.isArray(x.sizes) && x.sizes.every((z: unknown) => typeof z === 'string'));
  } catch { return []; }
}
export function saveDemoProduct(product: Product) {
  const next = readDemoCatalog().filter(p => p.id !== product.id);
  next.push(product);
  window.localStorage.setItem(DEMO_CATALOG_KEY, JSON.stringify(next));
  const index = products.findIndex(p => p.id === product.id);
  if (index === -1) products.push(product);
  else products[index] = product;
  window.dispatchEvent(new Event('ortomed-catalog-updated'));
}
// Apply demo products on page load; a reload also makes changes visible in the catalog.
if (typeof window !== 'undefined') {
  for (const custom of readDemoCatalog()) {
    const index = products.findIndex(p => p.id === custom.id);
    if (index < 0) products.push(custom);
    else products[index] = custom;
  }
}
