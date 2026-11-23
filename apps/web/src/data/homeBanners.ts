/** ORTOMED demo home-banner data. Browser-only until the backend is connected. */
export const HOME_BANNERS_KEY = 'ortomed_home_banners_demo_v1';
export const HOME_BANNERS_EVENT = 'ortomed:home-banners-updated';
export type HomeBanner = {
 id: string;
 enabled: boolean;
 image: string;
 titleRo: string;
 titleRu: string;
 subtitleRo: string;
 subtitleRu: string;
 buttonRo: string;
 buttonRu: string;
 url: string;
 textPosition: 'left' | 'center' | 'right';
 textColor: 'dark' | 'light';
};
export type HomeBannersConfig = { intervalSeconds: number; slides: HomeBanner[] };
export const defaultHomeBanners: HomeBannersConfig = {
 intervalSeconds: 6,
 slides: [{
  id: 'ortomed-default', enabled: true,
  image: '/ortomed/images/hero-athlete.webp',
  titleRo: 'Produse ortopedice pentru o viață mai activă!',
  titleRu: 'Ортопедические товары для активной жизни!',
  subtitleRo: 'Recuperare, mobilitate și confort în fiecare zi.',
  subtitleRu: 'Восстановление, мобильность и комфорт каждый день.',
  buttonRo: 'Vezi produsele', buttonRu: 'Смотреть товары', url: '/produse',
  textPosition: 'left', textColor: 'dark',
 }],
};
const isBanner = (v: unknown): v is HomeBanner => {
 if (!v || typeof v !== 'object') return false;
 const x=v as Record<string, unknown>;
 return typeof x.id==='string' && typeof x.image==='string' && typeof x.enabled==='boolean' && typeof x.titleRo==='string' && typeof x.titleRu==='string' && typeof x.url==='string';
};
export function loadHomeBanners(): HomeBannersConfig {
 try {
  const raw=window.localStorage.getItem(HOME_BANNERS_KEY);
  if (!raw) return defaultHomeBanners;
  const parsed: unknown=JSON.parse(raw);
  if(!parsed || typeof parsed!=='object') return defaultHomeBanners;
  const data=parsed as Partial<HomeBannersConfig>;
  if(!Array.isArray(data.slides)) return defaultHomeBanners;
  return {intervalSeconds:Math.min(20,Math.max(3,Number(data.intervalSeconds)||6)),slides:data.slides.filter(isBanner).slice(0,12)};
 } catch {return defaultHomeBanners;}
}
export function saveHomeBanners(data: HomeBannersConfig): void {
 window.localStorage.setItem(HOME_BANNERS_KEY,JSON.stringify(data));
 window.dispatchEvent(new Event(HOME_BANNERS_EVENT));
}
export function safeBannerUrl(value: string): string {
 const url=value.trim();
 if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
 try {const parsed=new URL(url);if(parsed.protocol==='https:' || parsed.protocol==='http:')return parsed.toString();}catch{/* invalid */}
 return '/produse';
}
