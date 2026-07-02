import { state, snapSide } from './state.js';
import { prodById, COLLECTIONS } from './data.js';
import { $, $$, setupReveals } from './utils.js';
import { tplHome, tplShop, tplProduct, tplCart, tplContact, tplRecent, initCart, initContact } from './templates.js';
import { initProduct } from './customizer.js';

const router = { path: '/' };
export { router };

export function navigate(p){
  router.path = p.startsWith('/') ? p : '/' + p;
  location.hash = '#/' + (router.path.startsWith('/') ? router.path.slice(1) : router.path);
}

export function route(){
  while(state.PAGE_CLEANUP.length){ try{ state.PAGE_CLEANUP.pop()(); }catch(e){} }
  const raw = router.path || '/';
  const qIdx = raw.indexOf('?');
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = qIdx === -1 ? '' : raw.slice(qIdx + 1);
  const seg = path.split('/').filter(Boolean);
  let html = '', init = null, navKey = '', scrollTarget = null;

  if(path === '/' || path === ''){ html = tplHome(); }
  else if(path === '/deals'){ html = tplHome(); navKey = 'deals'; scrollTarget = '#deals'; }
  else if(path === '/bundle'){ html = tplHome(); navKey = 'deals'; scrollTarget = '#bundle'; }
  else if(path === '/shop'){ html = tplShop(null); navKey = 'shop'; }
  else if(path === '/search'){
    const q = new URLSearchParams(query).get('q') || '';
    html = tplShop(null, q); navKey = 'shop';
  }
  else if(seg[0] === 'collection'){
    const id = COLLECTIONS[seg[1]] ? seg[1] : null;
    html = tplShop(id);
    navKey = id === 'workwear' ? 'workwear' : id === 'gifting' ? 'gifting' : 'shop';
  }
  else if(seg[0] === 'product'){
    const p = prodById(seg[1]);
    if(p){ html = tplProduct(p); init = () => initProduct(p); navKey = 'shop'; }
    else { html = tplShop(null); navKey = 'shop'; }
  }
  else if(path === '/cart'){ html = tplCart(); init = initCart; }
  else if(path === '/contact'){
    const msg = new URLSearchParams(query).get('msg') || '';
    html = tplContact(msg); init = initContact; navKey = 'contact';
  }
  else { html = tplHome(); }

  const showRecent = state.RECENT.length && (path === '/' || path === '/shop' || path === '/search' || seg[0] === 'collection' || seg[0] === 'product');
  const exclude = seg[0] === 'product' ? seg[1] : null;
  $('#app').innerHTML = `<div class="page">${html}${showRecent ? tplRecent(exclude) : ''}</div>`;
  $$('.nav-links a').forEach(a => a.classList.toggle('active', !!navKey && a.dataset.nav === navKey));
  $('#navlinks').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  if(init) init();
  setupReveals();
  if(scrollTarget){
    requestAnimationFrame(() => { const el = $(scrollTarget); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); });
  } else {
    window.scrollTo({top:0});
  }
}
