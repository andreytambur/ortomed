export type GuideCopy = {ro:string;ru:string};
export type GuideFaq = [GuideCopy,GuideCopy];
export type GuideOverride = {
  title: GuideCopy;
  intro: GuideCopy;
  heroImage: string;
  types: GuideCopy[];
  measure: GuideCopy[];
  use: GuideCopy[];
  faq: GuideFaq[];
  updatedAt: string;
};
export type GuideHomeSettings={title:GuideCopy;intro:GuideCopy;eyebrow:GuideCopy;heroImage:string};
const KEY='ortomed-guide-content-demo-v1';
const HOME='ortomed-guide-home-demo-v1';
export const GUIDE_EVENT='ortomed-guide-updated';
function read<T>(key:string,fallback:T):T{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
export function readGuide(id:string):GuideOverride|undefined{return read<Record<string,GuideOverride>>(KEY,{})[id]}
export function saveGuide(id:string,guide:GuideOverride):boolean{try{const all=read<Record<string,GuideOverride>>(KEY,{});all[id]=guide;localStorage.setItem(KEY,JSON.stringify(all));window.dispatchEvent(new Event(GUIDE_EVENT));return true}catch{return false}}
export function resetGuide(id:string):boolean{try{const all=read<Record<string,GuideOverride>>(KEY,{});delete all[id];localStorage.setItem(KEY,JSON.stringify(all));window.dispatchEvent(new Event(GUIDE_EVENT));return true}catch{return false}}
export function readGuideHome():GuideHomeSettings|undefined{return read<GuideHomeSettings|undefined>(HOME,undefined)}
export function saveGuideHome(data:GuideHomeSettings):boolean{try{localStorage.setItem(HOME,JSON.stringify(data));window.dispatchEvent(new Event(GUIDE_EVENT));return true}catch{return false}}
export function resetGuideHome():boolean{try{localStorage.removeItem(HOME);window.dispatchEvent(new Event(GUIDE_EVENT));return true}catch{return false}}
