import { $, esc, gbp } from './utils.js';
import { state, loadCart, updateBadge, loadKV, saveCart } from './state.js';
import { prodById } from './data.js';
import { router, navigate, route } from './router.js';
import { submitNetlifyForm } from './forms.js';
import { BUSINESS, DELIVERY, priceNote, stripeLinkFor } from './config.js';

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
    const fc = document.getElementById('footCompany');
    if(fc && BUSINESS.companyNo) fc.textContent = ` · Company no. ${BUSINESS.companyNo}` + (BUSINESS.vatNo ? ` · VAT ${BUSINESS.vatNo}` : '');

    // Header search (desktop + mobile menu share one delegated handler)
    document.addEventListener('submit', e => {
      const sf = e.target.closest('.searchbar');
      if(!sf) return;
      e.preventDefault();
      const input = sf.querySelector('input');
      const q = (input.value || '').trim();
      navigate(q ? '/search?q=' + encodeURIComponent(q) : '/shop');
      document.getElementById('navlinks').classList.remove('open');
      input.blur();
    });

    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', () => {
      const nl = document.getElementById('navlinks');
      const open = nl.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    document.getElementById('navlinks').addEventListener('click', e => {
      if(e.target.closest('a')) document.getElementById('navlinks').classList.remove('open');
    });

    document.getElementById('newsForm').addEventListener('submit', async e => {
      e.preventDefault();
      const em = document.getElementById('n-email');
      if(!em.value || !em.checkValidity()){ em.focus(); em.reportValidity && em.reportValidity(); return; }
      const btn = document.getElementById('newsForm').querySelector('button');
      if(btn){ btn.disabled = true; btn.textContent = 'Signing up…'; }
      try{ await submitNetlifyForm('newsletter', { email: em.value }); }
      catch(err){ console.warn('Newsletter submit failed (works once deployed to Netlify):', err.message); }
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
  const anyDesign = state.CART.some(l => hasCartDesign(l));
  openModal(`
    <button class="modal-x" aria-label="Close">×</button>
    <h2 id="modalTitle">Request your order</h2>
    <div class="co-summary">${rows}<div class="sumline total"><span>Total</span><span>${gbp(sub)}</span></div></div>
    <p class="mono-note">${priceNote}. Delivery is quoted once your order is confirmed.</p>
    <form class="form-grid" id="orderForm" novalidate>
      <div><label class="flabel" for="o-name">Name <span class="req">*</span></label><input class="finput" id="o-name" required autocomplete="name"></div>
      <div><label class="flabel" for="o-phone">Phone</label><input class="finput" id="o-phone" type="tel" autocomplete="tel"></div>
      <div class="full"><label class="flabel" for="o-email">Email <span class="req">*</span></label><input class="finput" id="o-email" type="email" required autocomplete="email"></div>
      <div class="full"><span class="flabel">Delivery</span>
        <label class="radline"><input type="radio" name="fulfil" value="collect" checked> Collect from Bodmin workshop (free)</label>
        <label class="radline"><input type="radio" name="fulfil" value="deliver"> Deliver in the UK (postage quoted)</label>
      </div>
      <div class="full" id="addrWrap" style="display:none"><label class="flabel" for="o-addr">Delivery address</label><textarea class="finput" id="o-addr" autocomplete="street-address"></textarea></div>
      <div class="full"><label class="flabel" for="o-notes">Notes (sizes, colours, deadline…)</label><textarea class="finput" id="o-notes"></textarea></div>
      ${anyDesign ? `<div class="full mono-note" style="margin:0">You've designed artwork on ${state.CART.filter(hasCartDesign).length} item(s). We'll match it to your order and send a free proof to approve before printing.</div>` : ''}
      <div class="full"><label class="radline" style="align-items:flex-start"><input type="checkbox" id="o-consent" required> <span>I agree to Banners &amp; Beyond storing these details to process my order (see our <a href="#/privacy">Privacy notice</a>).</span></label></div>
      <div class="full"><button class="btn btn--solid" type="submit" id="orderSubmit">Send order request <span class="arr">→</span></button></div>
    </form>
    <p class="mono-note">Prefer to talk it through? Call <a href="${BUSINESS.phoneHref}">${BUSINESS.phone}</a> or email <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.</p>
  `);
  const form = document.getElementById('orderForm');
  const addrWrap = document.getElementById('addrWrap');
  form.querySelectorAll('input[name="fulfil"]').forEach(r => r.addEventListener('change', () => {
    addrWrap.style.display = form.querySelector('input[name="fulfil"]:checked').value === 'deliver' ? 'block' : 'none';
  }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('o-email');
    const name = document.getElementById('o-name');
    const consent = document.getElementById('o-consent');
    if(!name.value.trim()){ name.focus(); return; }
    if(!email.value || !email.checkValidity()){ email.focus(); email.reportValidity && email.reportValidity(); return; }
    if(!consent.checked){ consent.focus(); return; }
    const ref = 'BB-' + Math.floor(1000 + Math.random() * 9000);
    const fulfil = form.querySelector('input[name="fulfil"]:checked').value;
    const summary = state.CART.map(l => {
      const p = prodById(l.pid);
      const bits = [`${l.qty} × ${p.name}`];
      if(l.color) bits.push(l.color.name);
      if(l.size) bits.push('size ' + l.size);
      if(hasCartDesign(l)) bits.push('custom design');
      bits.push(gbp(l.unit * l.qty));
      return '• ' + bits.join(' · ');
    }).join('\n');
    const orderJson = state.CART.map(l => {
      const p = prodById(l.pid);
      return { product: p.name, id: l.pid, colour: l.color ? l.color.name : null, size: l.size || null, qty: l.qty, unit: l.unit, printType: l.printType || 'digital', hasDesign: hasCartDesign(l) };
    });
    const btn = document.getElementById('orderSubmit');
    btn.disabled = true; btn.textContent = 'Sending…';
    let sent = true;
    try{
      await submitNetlifyForm('order', {
        name: name.value, email: email.value, phone: document.getElementById('o-phone').value,
        fulfilment: fulfil, address: fulfil === 'deliver' ? document.getElementById('o-addr').value : 'Collection',
        notes: document.getElementById('o-notes').value, order_ref: ref,
        order_summary: `${summary}\n\nTotal: ${gbp(sub)}`, order_json: orderJson
      });
    }catch(err){ sent = false; console.warn('Order submit failed (works once deployed to Netlify):', err.message); }

    const single = state.CART.length === 1 ? stripeLinkFor(state.CART[0].pid) : null;
    const payBlock = single
      ? `<a class="btn btn--solid" href="${single}" target="_blank" rel="noopener" style="width:100%;margin-top:1rem">Pay now by card (Stripe) <span class="arr">→</span></a>
         <p class="mono-note">Secure card payment via Stripe. We'll still send a free proof to approve first.</p>`
      : `<p class="mono-note">Next: we'll check your artwork, send a free proof to approve, then a secure Stripe payment link for the total. ${DELIVERY.turnaround}.</p>`;
    const failNote = sent ? '' : `<p class="mono-note" style="color:var(--magenta)">We couldn't send automatically — please email your order to <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a> quoting ${ref}.</p>`;

    state.CART = []; saveCart(); updateBadge();
    document.getElementById('modalBody').innerHTML = `
      <button class="modal-x" aria-label="Close">×</button>
      <h2>Order request received.</h2>
      <div class="order-stamp">Ref ${ref}</div>
      <p>Thanks ${esc(name.value.split(' ')[0] || '')} — your request is with the workshop. ${sent ? `A copy has gone to us at ${BUSINESS.email}.` : ''}</p>
      ${failNote}
      ${payBlock}
      <button class="btn" id="doneBtn" style="width:100%;margin-top:1.25rem">Back to the shop</button>
    `;
    bindModalClose();
    document.getElementById('doneBtn').addEventListener('click', () => { closeModal(); navigate('/shop'); });
  });
}

function hasCartDesign(l){
  if(l.artStripped) return true;
  const designs = l.designs || {};
  const has = d => !!(d && ((d.img && d.img.src) || (d.text && d.text.value && d.text.value.trim())));
  return Object.values(designs).some(has);
}
