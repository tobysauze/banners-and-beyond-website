import { $, gbp } from './utils.js';
import { prodById } from './data.js';

const state = {
  CART: [],
  cartUid: 1,
  REVIEWS: {},
  RECENT: [],
  LAST_DESIGN: null,
  CARRY: null,
  PAGE_CLEANUP: []
};
export { state };

async function saveKV(k, v, guard){
  try{
    if(!window.storage) return;
    const j = JSON.stringify(v);
    if(guard && j.length > guard) return;
    await window.storage.set(k, j);
  }catch(e){}
}
export async function loadKV(k){
  try{
    if(!window.storage) return null;
    const r = await window.storage.get(k);
    return r && r.value ? JSON.parse(r.value) : null;
  }catch(e){ return null; }
}

export const saveLast    = () => saveKV('bb_last_v1', state.LAST_DESIGN, 3500000);
export const saveRecent  = () => saveKV('bb_recent_v1', state.RECENT);
export const saveReviews = () => saveKV('bb_reviews_v1', state.REVIEWS);

export async function saveCart(){
  try{
    if(!window.storage) return;
    const json = JSON.stringify(state.CART);
    if(json.length > 4500000) return;
    await window.storage.set('bb_cart_v1', json);
  }catch(e){}
}

export async function loadCart(){
  try{
    if(window.storage){
      const r = await window.storage.get('bb_cart_v1');
      if(r && r.value){
        state.CART = JSON.parse(r.value);
        state.cartUid = Math.max(1, ...state.CART.map(l=>l.uid+1));
        updateBadge();
      }
    }
  }catch(e){}
}

export function updateBadge(){
  const el = $('#basketCount');
  if(el) el.textContent = state.CART.reduce((n,l)=>n+l.qty,0);
}

export function snapSide(s){ return JSON.parse(JSON.stringify({img:s.img, text:s.text})); }
