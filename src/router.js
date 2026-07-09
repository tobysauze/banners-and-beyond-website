import { state, snapSide } from './state.js';
import { prodById, COLLECTIONS } from './data.js';
import { $, $$, setupReveals } from './utils.js';
import { tplHome, tplShop, tplProduct, tplCart, tplContact, tplRecent, tplPrivacy, tplDelivery, initCart, initContact } from './templates.js';
import { initProduct } from './customizer.js';
import { setSeo } from './seo.js';

const router = { path: '/' };
export { router };

export function navigate(p){
  const path = p.startsWith('/') ? p : '/' + p;
  if(path === location.pathname + location.search){ router.path = path; route(); return; }
  try{ history.pushState({}, '', path); }catch(e){ /* file:// or sandbox — route in place */ }
  router.path = path;
  route();
}

export function route(){
  while(state.PAGE_CLEANUP.length){ try{ state.PAGE_CLEANUP.pop()(); }catch(e){} }
  const raw = router.path || '/';
  const qIdx = raw.indexOf('?');
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = qIdx === -1 ? '' : raw.slice(qIdx + 1);
  const seg = path.split('/').filter(Boolean).map(s => { try{ return decodeURIComponent(s); }catch(e){ return s; } });
  let html = '', init = null, navKey = '', scrollTarget = null;
  const seo = { path };

  if(path === '/' || path === ''){ html = tplHome(); }
  else if(path === '/deals'){ html = tplHome(); navKey = 'deals'; scrollTarget = '#deals'; seo.name = 'Workwear deals'; }
  else if(path === '/bundle'){ html = tplHome(); navKey = 'deals'; scrollTarget = '#bundle'; seo.name = 'Start-up bundle'; }
  else if(path === '/shop'){ html = tplShop(null); navKey = 'shop'; seo.name = 'Shop all'; seo.desc = 'Every product, fully customisable in the browser.'; }
  else if(path === '/search'){
    const q = new URLSearchParams(query).get('q') || '';
    html = tplShop(null, q); navKey = 'shop'; seo.name = q ? `Search: ${q}` : 'Search';
  }
  else if(seg[0] === 'collection'){
    const id = COLLECTIONS[seg[1]] ? seg[1] : null;
    html = tplShop(id);
    navKey = id === 'workwear' ? 'workwear' : id === 'gifting' ? 'gifting' : 'shop';
    if(id) seo.collection = COLLECTIONS[id];
  }
  else if(seg[0] === 'product'){
    const p = prodById(seg[1]);
    if(p){ html = tplProduct(p); init = () => initProduct(p); navKey = 'shop'; seo.product = p; }
    else { html = tplShop(null); navKey = 'shop'; seo.name = 'Shop all'; }
  }
  else if(path === '/cart'){ html = tplCart(); init = initCart; seo.name = 'Your basket'; }
  else if(path === '/contact'){
    const msg = new URLSearchParams(query).get('msg') || '';
    html = tplContact(msg); init = initContact; navKey = 'contact'; seo.name = 'Contact'; seo.desc = 'Get a quote for custom print, embroidery or signage in Cornwall.';
  }
  else if(path === '/privacy'){ html = tplPrivacy(); seo.name = 'Privacy notice'; }
  else if(path === '/delivery' || path === '/returns'){ html = tplDelivery(); seo.name = 'Delivery, turnaround & returns'; }
  else { html = tplHome(); }

  const showRecent = state.RECENT.length && (path === '/' || path === '/shop' || path === '/search' || seg[0] === 'collection' || seg[0] === 'product');
  const exclude = seg[0] === 'product' ? seg[1] : null;
  $('#app').innerHTML = `<div class="page">${html}${showRecent ? tplRecent(exclude) : ''}</div>`;
  $$('.nav-links a').forEach(a => a.classList.toggle('active', !!navKey && a.dataset.nav === navKey));
  $('#navlinks').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  if(init) init();
  setSeo(seo);
  setupReveals();
  if(scrollTarget){
    requestAnimationFrame(() => { const el = $(scrollTarget); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); });
  } else {
    window.scrollTo({top:0});
  }
}
