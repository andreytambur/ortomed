import {create} from 'zustand';
import {persist} from 'zustand/middleware';

type CartLine = {id: string; size: string; quantity: number};
type ShopStore = {
  cart: CartLine[];
  favorites: string[];
  promoApplied: boolean;
  setPromoApplied: (applied:boolean)=>void;
  addToCart: (id: string, size?:string) => void;
  removeFromCart: (id: string, size:string) => void;
  updateQuantity: (id:string,size:string,quantity:number) => void;
  toggleFavorite: (id:string) => void;
};
export const useShopStore = create<ShopStore>()(persist((set)=>({
  cart:[], favorites:[], promoApplied:false,
  setPromoApplied:(applied)=>set({promoApplied:applied}),
  addToCart:(id,size='M')=>set(state=>{
    const exists=state.cart.some(x=>x.id===id&&x.size===size);
    return {cart: exists ? state.cart.map(x=>x.id===id&&x.size===size?{...x,quantity:x.quantity+1}:x):[...state.cart,{id,size,quantity:1}]};
  }),
  removeFromCart:(id,size)=>set(s=>({cart:s.cart.filter(x=>!(x.id===id&&x.size===size))})),
  updateQuantity:(id,size,quantity)=>set(s=>({cart:s.cart.map(x=>x.id===id&&x.size===size?{...x,quantity:Math.max(1,quantity)}:x)})),
  toggleFavorite:id=>set(s=>({favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]})),
}),{name:'ortomed-shop-demo-v1'}));
