export const $ = (s, el=document) => el.querySelector(s);
export const $$ = (s, el=document) => [...el.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const gbp = n => '£' + n.toFixed(2);

export function setupReveals(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
