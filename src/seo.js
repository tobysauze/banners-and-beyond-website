/* ─────────────────────────────────────────────────────────────
   Per-route SEO: title, meta description, canonical, Open Graph /
   Twitter cards, and Product structured data. Called from the router
   on every navigation so each real URL gets its own metadata.
   ───────────────────────────────────────────────────────────── */
import { SITE_URL } from './config.js';
import { PRODUCTS } from './data.js';

const plain = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

const NAME = 'Banners & Beyond';
const DEF_TITLE = 'Banners & Beyond — Custom Print & Embroidery, Cornwall';
const DEF_DESC = 'Custom print and embroidery in Cornwall. Design your own t-shirts, hoodies, workwear, caps, mugs, slates, banners and gifts in the browser — with a free proof on every order.';
const DEF_IMAGE = (PRODUCTS.find(p => p.img) || {}).img || '';

function metaByName(name, content){
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if(!el){ el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function metaByProp(prop, content){
  let el = document.head.querySelector(`meta[property="${prop}"]`);
  if(!el){ el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setCanonical(href){
  let el = document.head.querySelector('link[rel="canonical"]');
  if(!el){ el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', href);
}
function setJsonLd(obj){
  let el = document.getElementById('ld-route');
  if(!obj){ if(el) el.remove(); return; }
  if(!el){ el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ld-route'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(obj);
}

export function setSeo(ctx = {}){
  const path = ctx.path === '/' || !ctx.path ? '/' : ctx.path.replace(/\?.*$/, '');
  const url = SITE_URL + (path === '/' ? '/' : path);
  let title = DEF_TITLE, desc = DEF_DESC, image = DEF_IMAGE, type = 'website', ld = null;
  const p = ctx.product;

  if(p){
    title = `${p.name} — customise & print | ${NAME}`;
    desc = clip(plain(p.desc) || DEF_DESC, 155);
    if(p.img) image = p.img;
    type = 'product';
    const price = (p.sizePrices ? Math.min(...Object.values(p.sizePrices)) : (p.sale ?? p.price));
    ld = {
      '@context': 'https://schema.org', '@type': 'Product',
      name: p.name,
      image: (p.imgs && p.imgs.length) ? p.imgs : (p.img ? [p.img] : []),
      description: clip(plain(p.desc), 300),
      brand: { '@type': 'Brand', name: NAME },
      offers: {
        '@type': 'Offer', priceCurrency: 'GBP', price: Number(price).toFixed(2),
        availability: 'https://schema.org/InStock', url
      }
    };
  } else if(ctx.collection){
    title = `${ctx.collection.name} — custom print | ${NAME}`;
    desc = clip(ctx.collection.blurb || DEF_DESC, 155);
  } else if(ctx.name){
    title = `${ctx.name} | ${NAME}`;
    if(ctx.desc) desc = clip(ctx.desc, 155);
  }

  document.title = title;
  metaByName('description', desc);
  setCanonical(url);
  metaByProp('og:site_name', NAME);
  metaByProp('og:type', type);
  metaByProp('og:title', title);
  metaByProp('og:description', desc);
  metaByProp('og:url', url);
  if(image) metaByProp('og:image', image);
  metaByName('twitter:card', 'summary_large_image');
  metaByName('twitter:title', title);
  metaByName('twitter:description', desc);
  if(image) metaByName('twitter:image', image);
  setJsonLd(ld);
}
