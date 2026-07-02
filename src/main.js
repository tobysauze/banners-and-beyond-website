import { $, esc, gbp } from './utils.js';
import { state, loadCart, updateBadge, loadKV, saveCart } from './state.js';
import { prodById } from './data.js';
import { router, navigate, route } from './router.js';

window.addEventListener('error', (e) => {
  const app = document.getElementById('app');
  if(app){
    app.innerHTML = `<div style="padding:3rem;text-align:center;font-family:system-ui,sans-serif">
      <h2>Something went wrong</h2>
      <p style="color:#75736C;margin-top:1rem">Please try refreshing the page. If the problem persists, contact us.</p>
      <button onclick="location.reload()" style="margin-top:1.5rem;padding:.8em 1.6em;border:2px solid #111013;background:#FAFAF7;cursor:pointer;font-family:monospace;font-weight:600">Refresh page</button>
    </div>`;
  }
  console.error('App error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

(async function boot(){
  try{
    state.REVIEWS = (await loadKV('bb_reviews_v1')) || {};
    state.RECENT = (await loadKV('bb_recent_v1')) || [];
    state.LAST_DESIGN = await loadKV('bb_last_v1');

    document.getElementById('year').textContent = new Date().getFullYear();

    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', () => {
      const nl = document.getElementById('navlinks');
      const open = nl.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    document.getElementById('navlinks').addEventListener('click', e => {
      if(e.target.closest('a')) document.getElementById('navlinks').classList.remove('open');
    });

    document.getElementById('newsForm').addEventListener('submit', e => {
      e.preventDefault();
      const em = document.getElementById('n-email');
      if(!em.value || !em.checkValidity()){ em.focus(); em.reportValidity && em.reportValidity(); return; }
      document.getElementById('newsForm').style.display = 'none';
      document.getElementById('newsOk').style.display = 'block';
    });

    document.getElementById('modalBack').addEventListener('click', e => {
      if(e.target.id === 'modalBack') closeModal();
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && document.getElementById('modalBack').classList.contains('open')) closeModal();
    });

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#/"]');
      if(!a) return;
      e.preventDefault();
      navigate(a.getAttribute('href').slice(1));
    });

    window.addEventListener('hashchange', () => {
      const h = location.hash.slice(1) || '/';
      if(h !== router.path){ router.path = h; route(); }
    });

    await loadCart();
    updateBadge();
    const h = (location.hash || '').slice(1);
    if(h && h[0] === '/') router.path = h;
    route();
  } catch(err){
    console.error('Boot error:', err);
    const app = document.getElementById('app');
    if(app){
      app.innerHTML = `<div style="padding:3rem;text-align:center;font-family:system-ui,sans-serif">
        <h2>Couldn't load the shop</h2>
        <p style="color:#75736C;margin-top:1rem">Please try refreshing the page.</p>
        <button onclick="location.reload()" style="margin-top:1.5rem;padding:.8em 1.6em;border:2px solid #111013;background:#FAFAF7;cursor:pointer;font-family:monospace;font-weight:600">Refresh</button>
      </div>`;
    }
  }
})();

let toastT;
export function showToast(msg){
  const el = document.getElementById('toast');
  el.innerHTML = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 3800);
}

export function openModal(html){
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBack').classList.add('open');
  bindModalClose();
}

export function closeModal(){
  document.getElementById('modalBack').classList.remove('open');
  if(router.path === '/cart') route();
}

export function bindModalClose(){
  document.querySelectorAll('#modalBody .modal-x').forEach(b => b.onclick = closeModal);
}

export function openCheckout(){
  const sub = state.CART.reduce((n,l) => n + l.unit * l.qty, 0);
  const rows = state.CART.map(l => {
    const p = prodById(l.pid);
    return `<div class="sumline"><span>${l.qty} × ${esc(p.name)}${l.size ? ' · ' + esc(l.size) : ''}</span><span>${gbp(l.unit * l.qty)}</span></div>`;
  }).join('');
  openModal(`
    <button class="modal-x" aria-label="Close">×</button>
    <h2 id="modalTitle">Checkout</h2>
    ${rows}
    <div class="sumline total"><span>Total</span><span>${gbp(sub)}</span></div>
    <p class="mono-note">Demo build — this is where the live site hands off to Shopify checkout or a Stripe payment link. No payment is taken.</p>
    <button class="btn btn--solid" id="placeOrder">Place demo order</button>
  `);
  document.getElementById('placeOrder').addEventListener('click', () => {
    const ref = 'BB-' + Math.floor(1000 + Math.random() * 9000);
    state.CART = []; saveCart(); updateBadge();
    document.getElementById('modalBody').innerHTML = `
      <button class="modal-x" aria-label="Close">×</button>
      <h2>Nice one.</h2>
      <div class="order-stamp">Order approved</div>
      <p>Job reference <strong>${ref}</strong>. On the live site you'd get a confirmation email and a free proof to approve before anything prints.</p>
      <button class="btn" id="doneBtn" style="width:100%;margin-top:1.5rem">Back to the shop</button>
    `;
    bindModalClose();
    document.getElementById('doneBtn').addEventListener('click', () => { closeModal(); navigate('/shop'); });
  });
}
