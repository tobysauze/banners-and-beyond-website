import { $, gbp } from './utils.js';
import { prodById } from './data.js';

const state = {
  CART: [],
  cartUid: 1,
  REVIEWS: {},
  RECENT: [],
  LAST_DESIGN: null,
  CARRY: null,
  DRAFTS: {},        // in-progress customiser state, keyed by product id
  PAGE_CLEANUP: []
};
export { state };

/* Persistence is localStorage-backed. The original build used a `window.storage`
   sandbox API that does not exist in real browsers, so nothing persisted on the
   deployed site (the basket emptied on every refresh). */
function lsSet(k, v){ try{ localStorage.setItem(k, v); return true; }catch(e){ return false; } }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsRemove(k){ try{ localStorage.removeItem(k); }catch(e){} }

async function saveKV(k, v, guard){
  try{
    const j = JSON.stringify(v);
    if(guard && j.length > guard) return; // too big to persist — skip
    lsSet(k, j);
  }catch(e){}
}
export async function loadKV(k){
  try{
    const r = lsGet(k);
    return r ? JSON.parse(r) : null;
  }catch(e){ return null; }
}

export const saveLast    = () => saveKV('bb_last_v1', state.LAST_DESIGN, 3500000);
export const saveRecent  = () => saveKV('bb_recent_v1', state.RECENT);
export const saveReviews = () => saveKV('bb_reviews_v1', state.REVIEWS);

/* strip the heavy base64 artwork out of a per-location designs object (keeps text + placement) */
function stripArt(designs){
  const c = JSON.parse(JSON.stringify(designs || {}));
  for(const k of Object.keys(c)){ if(c[k] && c[k].img) c[k].img.src = null; }
  return c;
}

export async function saveCart(){
  try{
    const full = JSON.stringify(state.CART);
    if(full.length < 4500000 && lsSet('bb_cart_v1', full)) return;
    // Cart too big for localStorage (base64 artwork). Persist a skeleton without
    // image data so the basket still survives a reload; flag the affected lines.
    const skeleton = state.CART.map(l => ({ ...l, designs: stripArt(l.designs), artStripped: true }));
    lsSet('bb_cart_v1', JSON.stringify(skeleton));
  }catch(e){}
}

export async function loadCart(){
  try{
    const r = lsGet('bb_cart_v1');
    if(r){
      state.CART = JSON.parse(r);
      state.cartUid = state.CART.length ? Math.max(1, ...state.CART.map(l=>l.uid+1)) : 1;
      updateBadge();
    }
  }catch(e){}
}

export function updateBadge(){
  const el = $('#basketCount');
  if(el) el.textContent = state.CART.reduce((n,l)=>n+l.qty,0);
}

export function snapSide(s){ return JSON.parse(JSON.stringify({img:s.img, text:s.text})); }
