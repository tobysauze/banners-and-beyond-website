import { $, $$, esc, gbp } from './utils.js';
import { MOCKS, COLLECTIONS, PRODUCTS, prodById, ICONS, FLOODS, FONTS, TEXTINKS, BIGAREA, PRINT_TYPES, ratingFor, starsHTML, SEEDREV } from './data.js';
import { state, saveCart, saveReviews, updateBadge } from './state.js';
import { openCheckout } from './main.js';
import { route } from './router.js';
import { submitNetlifyForm } from './forms.js';
import { BUSINESS, DELIVERY, priceNote } from './config.js';
import { mockSVG, previewHTML, productLocations, designHasContent, lineHasContent, isGarment } from './geometry.js';

/* real product photo (from the live catalogue) with the SVG mock as fallback */
function productThumb(p){
  return p.img
    ? `<img class="pcard-photo" src="${p.img}" loading="lazy" alt="${esc(p.name)}">`
    : mockSVG(p, null, 'front');
}

/* ---- templates ---- */

export function tplHome(){
  const gotm = prodById('square-slate-14x14') || prodById('square-slate-19x19');
  const tiles = Object.entries(COLLECTIONS).map(([id,c],i)=>`
    <a class="tile reveal" style="--flood:${FLOODS[i%3]}" href="#/collection/${id}">
      <span class="tile-ref">REF ${id.slice(0,2).toUpperCase()}-0${i+1}</span>
      <span class="tile-icon" aria-hidden="true">${ICONS[id]}</span>
      <h3>${c.name}</h3><p>${c.blurb}</p>
      <span class="tile-go">Browse <span class="arr">→</span></span>
    </a>`).join('');

  return `
  <section class="hero">
    <svg class="hero-reg" viewBox="0 0 32 32" style="color:var(--ink)" aria-hidden="true"><use href="#regmark"/></svg>
    <div class="wrap">
      <p class="eyebrow">Cornwall, UK — Print · Embroidery · Signage</p>
      <h1>
        <span class="plate" data-text="Designed by you,">Designed by <em class="u-c">you</em>,</span>
        <span class="plate" data-text="made by us.">made by <em class="u-m">us</em>.</span>
      </h1>
      <p class="hero-sub">Custom print and embroidery for workwear, gifts and everything in between. Upload your own design onto any product in the shop — every job set, proofed and checked by hand.</p>
      <div class="hero-ctas">
        <a class="btn btn--solid" href="#/shop">Start customising <span class="arr">→</span></a>
        <a class="btn" href="#/deals">Workwear deals <span class="arr">→</span></a>
      </div>
    </div>
    <div class="hero-specrow">
      <div class="wrap hero-spec">
        <span>Sheet 01 / A</span><span>4/0 CMYK · 1440 dpi</span><span>Gloss OK</span><span>B&amp;B Press · Cornwall</span>
      </div>
      <div class="colorbar" aria-hidden="true"><span class="c"></span><span class="m"></span><span class="y"></span><span class="k"></span><span class="c50"></span><span class="m50"></span><span class="y50"></span><span class="k50"></span></div>
    </div>
  </section>

  <section class="section">
    <div class="cropmarks" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">The catalogue</p>
        <h2 class="display">Fresh off the press</h2>
        <p class="lede">Every piece printed or stitched to order — and every single one customisable in the browser. Pick a category, upload your artwork, drag it into place.</p>
      </div>
      <div class="tiles">${tiles}</div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">The job docket</p>
        <h2 class="display">What we can print</h2>
      </div>
      <div class="docket reveal">
        <a class="job" style="--flood:var(--tint-c)" href="#/collection/gifting"><span class="job-no">JOB 01</span><div><h3>Custom gifting</h3><p>Mugs, slates, glassware and soft toys — printed or embroidered. One-offs welcome; no minimum order.</p></div><span class="job-arr" aria-hidden="true">→</span></a>
        <a class="job" style="--flood:var(--tint-m)" href="#/collection/workwear"><span class="job-no">JOB 02</span><div><h3>Workwear &amp; uniform</h3><p>Polos, tees, hoodies, softshells and hi-vis with your logo — front chest, full back, or both.</p></div><span class="job-arr" aria-hidden="true">→</span></a>
        <a class="job" style="--flood:var(--tint-y)" href="#/collection/slates"><span class="job-no">JOB 03</span><div><h3>Photo prints &amp; slate</h3><p>Your favourite shots made permanent — printed straight onto real stone.</p></div><span class="job-arr" aria-hidden="true">→</span></a>
        <a class="job" style="--flood:var(--tint-c)" href="#/shop"><span class="job-no">JOB 04</span><div><h3>Personalised apparel</h3><p>Your design, your wardrobe. Pet portraits actively encouraged.</p></div><span class="job-arr" aria-hidden="true">→</span></a>
        <a class="job" style="--flood:var(--tint-m)" href="#/collection/banners"><span class="job-no">JOB 05</span><div><h3>Banners, signs &amp; vehicles</h3><p>PVC banners, ACM signs, magnetic panels, vinyl decals and stickers by the metre.</p></div><span class="job-arr" aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="gotm section">
    <div class="wrap gotm-grid">
      <div class="proof-card reveal">
        <div class="cropmarks" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
        <div class="gotm-photo" style="width:min(360px,86%)">${gotm ? (gotm.img ? `<img src="${gotm.img}" alt="${esc(gotm.name)}">` : mockSVG(gotm, null, 'front')) : ''}</div>
        <span class="stamp">Gift of the month</span>
      </div>
      <div class="reveal">
        <p class="eyebrow">Gift of the month</p>
        <h2 class="display">${gotm ? esc(gotm.name) : 'Medium Square Slate'}</h2>
        <p class="lede">A photo you love, printed edge-to-edge onto smooth, gloss-finished slate. Upload the photo right on the product page and see it before you buy.</p>
        <div class="price-row"><span class="price-now">${gotm ? gbp(gotm.price) : '£15.00'}</span></div>
        <a class="btn btn--solid" href="#/product/${gotm ? gotm.id : 'square-slate-14x14'}">Personalise yours <span class="arr">→</span></a>
      </div>
    </div>
  </section>

  <section class="section" id="deals">
    <div class="cropmarks" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">Limited time</p>
        <h2 class="display">Workwear deals</h2>
        <p class="lede">Kit out the whole crew in one go. Four ready-made bundles, all printed front chest — bigger deals add back prints, banners, posters and vehicle magnets.</p>
      </div>
      <div class="deals-grid">
        ${dealTicket(1,'var(--magenta)',true,['3 polos or 4 t-shirts','2 hoodies or sweatshirts','1 softshell jacket or gilet','Front chest &amp; back print','2 medium printed banners','2 A1 posters','Car magnets, 60 × 30 cm'])}
        ${dealTicket(2,'var(--cyan)',false,['3 polos or 4 t-shirts','2 hoodies or sweatshirts','1 softshell jacket or gilet','Front chest &amp; back print','2 medium printed banners'])}
        ${dealTicket(3,'var(--yellow)',false,['3 polos or 4 t-shirts','2 hoodies or sweatshirts','1 softshell jacket or gilet','Front chest &amp; back print'])}
        ${dealTicket(4,'var(--cyan)',false,['3 polos or 4 t-shirts','2 hoodies or sweatshirts','1 softshell jacket or gilet','Front chest print'])}
      </div>
      <p class="deals-note reveal">Priced on enquiry — message us with your logo and sizes for a same-week quote.</p>
    </div>
  </section>

  <section class="bundle section" id="bundle">
    <div class="wrap">
      <div class="bundle-grid">
        <div class="reveal">
          <p class="eyebrow">The K plate — our biggest job</p>
          <h2 class="display">The full<br>business deal</h2>
          <p class="lede">Launching a business? One box, everything branded — boots to business cards — ready for day one. Fully customisable: swap anything on the list for something that fits your trade.</p>
          <div class="bundle-price">
            <div class="amount">£1,200</div>
            <div class="per">All-in · Fully branded · One workshop</div>
            <a class="btn btn--yellow" href="#/contact?msg=${encodeURIComponent("Hi — I'd like to talk about the £1,200 Start-Up Bundle.")}">Start your bundle <span class="arr">→</span></a>
          </div>
        </div>
        <div class="reveal">
          <ul class="checklist">
            <li>Pair of safety boots</li><li>3 × Regatta work trousers</li><li>3 polos or 4 t-shirts</li><li>2 hoodies or sweatshirts</li><li>Softshell jacket or gilet</li><li>Beanie or cap</li><li>2 × A3 door magnets</li><li>Vehicle vinyl decals</li><li>1 m printed banner</li><li>1 m of stickers</li><li>1 m tool &amp; equipment stickers</li><li>Printed mug</li><li>Digital business card</li><li>500 business cards</li><li>500 flyers</li><li>ACM sign</li>
          </ul>
          <p class="bundle-note">Know someone starting out? This is the head start you wish you'd had.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal"><p class="eyebrow">How a job runs</p><h2 class="display">From idea to ink</h2></div>
      <div class="steps reveal">
        <div class="step"><span class="step-no">Step 01</span><h3>Design it here</h3><p>Upload artwork or a photo on any product page, drag it into place, add text.</p></div>
        <div class="step"><span class="step-no">Step 02</span><h3>Free proof</h3><p>You get a proof to approve before anything prints. No surprises, no wasted garments.</p></div>
        <div class="step"><span class="step-no">Step 03</span><h3>Press &amp; stitch</h3><p>Printed and embroidered in-house in Cornwall, checked by hand as it comes off the press.</p></div>
        <div class="step"><span class="step-no">Step 04</span><h3>Collect or ship</h3><p>Pick up from the workshop or have it delivered anywhere in the UK.</p></div>
      </div>
    </div>
  </section>`;
}

export function dealTicket(n, tik, feature, items){
  return `<div class="ticket ${feature?'ticket--feature':''} reveal" style="--tik:${tik}">
    ${feature?'<span class="ticket-flag">Most complete</span>':''}
    <div class="ticket-head"><span class="kicker">Ticket № ${n}</span><h3>Deal 0${n}</h3></div>
    <ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>
    <div class="ticket-foot"><a class="btn ${feature?'btn--solid':''}" href="#/contact?msg=${encodeURIComponent(`Hi — I'd like a quote for workwear Deal 0${n}.`)}">Get this deal</a></div>
  </div>`;
}

export function tplShop(tag, q){
  let list = tag ? PRODUCTS.filter(p => p.tags.includes(tag)) : PRODUCTS;
  if(q){
    const s = q.toLowerCase();
    list = list.filter(p => (p.name + ' ' + p.tags.join(' ') + ' ' + p.desc).toLowerCase().includes(s));
  }
  const c = tag ? COLLECTIONS[tag] : null;
  const chips = ['<a class="chip ' + (!tag && !q ? 'active' : '') + '" href="#/shop">All</a>']
    .concat(Object.entries(COLLECTIONS).map(([id, cc]) => `<a class="chip ${tag === id ? 'active' : ''}" href="#/collection/${id}">${cc.name}</a>`)).join('');
  const cards = list.map((p, i) => {
    const price = p.sale
      ? `<span>${gbp(p.sale)}</span><del>${gbp(p.price)}</del>`
      : (p.sizePrices ? `<span>from ${gbp(Math.min(...Object.values(p.sizePrices)))}</span>` : `<span>${gbp(p.price)}</span>`);
    const r = ratingFor(p.id);
    return `<a class="pcard reveal" href="#/product/${p.id}" style="--pbg:${FLOODS[i % 3]}">
      <span class="pcard-art${p.img ? ' pcard-art--photo' : ''}">${p.sale ? '<span class="pcard-sale">Sale</span>' : ''}${productThumb(p)}</span>
      <span class="pcard-body">
        <h3>${p.name}</h3>
        <span class="pcard-meta">${MOCKS[p.mock].label} · Customisable</span>
        ${r ? `<span class="pcard-rate"><span class="stars">${starsHTML(r.avg)}</span> ${r.avg.toFixed(1)} (${r.count})</span>` : ''}
        <span class="pcard-price">${price}</span>
        <span class="pcard-cta">Customise <span class="arr">→</span></span>
      </span>
    </a>`;
  }).join('');
  const head = q ? 'Search' : (c ? c.name : 'Shop everything');
  const lede = q
    ? `${list.length} match${list.length === 1 ? '' : 'es'} for \u201C${esc(q)}\u201D.${list.length ? '' : ' Try a broader word, or browse a collection below.'}`
    : (c ? c.blurb : 'Every product below opens in the customiser — upload your own design, drag it into position, add text, and see exactly what we\u2019ll print.');
  return `
  <div class="wrap pagehead">
    <p class="eyebrow">${q ? 'Results' : c ? 'Collection' : 'Full catalogue'}</p>
    <h1 class="display">${head}</h1>
    <p class="lede">${lede}</p>
    <div class="chipbar">${chips}</div>
    <div class="pgrid" style="padding-bottom:clamp(3rem,7vw,5rem)">${cards}</div>
  </div>`;
}

export function tplRecent(exclude){
  const list = state.RECENT.filter(id => id !== exclude).map(prodById).filter(Boolean).slice(0, 6);
  if(!list.length) return '';
  const cards = list.map((p, i) => `<a class="pcard" href="#/product/${p.id}" style="--pbg:${FLOODS[i % 3]}"><span class="pcard-art${p.img ? ' pcard-art--photo' : ''}">${productThumb(p)}</span><span class="pcard-body"><h3>${p.name}</h3><span class="pcard-price"><span>${p.sizePrices ? 'from ' + gbp(Math.min(...Object.values(p.sizePrices))) : gbp(p.sale ?? p.price)}</span></span></span></a>`).join('');
  return `<section class="recent-strip section" style="padding-top:2.5rem;padding-bottom:3rem"><div class="wrap"><p class="eyebrow">Recently viewed</p><div class="pgrid pgrid--mini" style="margin-top:1.25rem">${cards}</div></div></section>`;
}

export function tplCart(){
  if(!state.CART.length){
    return `<div class="wrap pagehead"><p class="eyebrow">Basket</p><h1 class="display">Your basket</h1>
      <div class="empty-cart" style="margin:2.5rem 0 4rem"><p>Nothing on the press yet</p><a class="btn btn--solid" href="#/shop">Start customising <span class="arr">→</span></a></div></div>`;
  }
  const lines = state.CART.map(l => {
    const p = prodById(l.pid);
    const hasDesign = lineHasContent(l);
    const design = hasDesign ? 'Custom design' : 'No design (plain)';
    const locLabels = (l.locs && l.locs.length)
      ? productLocations(p).filter(loc => l.locs.includes(loc.id)).map(loc => loc.label)
      : [];
    const locStr = locLabels.length ? `<span>${locLabels.join(' + ')}</span>` : '';
    const ptStr = l.printType && l.printType !== 'digital' && hasDesign
      ? `<span>${(PRINT_TYPES.find(t=>t.id===l.printType)||{}).label||'Embroidery'}</span>` : '';
    return `<div class="cartline" data-uid="${l.uid}">
      <div class="cl-thumb">${previewHTML(p, l.color ? l.color.hex : null, l)}</div>
      <div class="cl-body">
        <h3>${p.name}</h3>
        <div class="cl-meta">${l.color ? `<span>${l.color.name}</span>` : ''}${l.size ? `<span>Size ${l.size}</span>` : ''}<span>${design}</span>${locStr}${ptStr}${l.disc ? `<span style="color:var(--magenta)">Bulk −${Math.round(l.disc * 100)}%</span>` : ''}</div>
        <div class="cl-actions">
          <div class="qty"><button data-act="minus" aria-label="Decrease">−</button><input value="${l.qty}" readonly aria-label="Quantity"><button data-act="plus" aria-label="Increase">+</button></div>
          <button class="removebtn" data-act="remove">Remove</button>
        </div>
      </div>
      <div class="cl-price">${gbp(l.unit * l.qty)}<br><small style="color:var(--grey);font-weight:400">${gbp(l.unit)} each</small></div>
    </div>`;
  }).join('');
  const sub = state.CART.reduce((n, l) => n + l.unit * l.qty, 0);
  return `<div class="wrap pagehead"><p class="eyebrow">Basket</p><h1 class="display">Your basket</h1>
  <div class="cart-grid" style="padding-bottom:clamp(3rem,7vw,5rem)">
    <div id="cartLines">${lines}</div>
    <aside class="summary">
      <h2>Job summary</h2>
      <div class="sumline"><span>Items</span><span>${state.CART.reduce((n, l) => n + l.qty, 0)}</span></div>
      <div class="sumline"><span>Subtotal</span><span>${gbp(sub)}</span></div>
      <div class="sumline"><span>Delivery</span><span>Quoted with order</span></div>
      <div class="sumline total"><span>Total</span><span>${gbp(sub)}</span></div>
      <button class="btn btn--solid" id="checkoutBtn">Request order <span class="arr">→</span></button>
      <p class="stage-hint" style="margin-top:1rem">${priceNote}. Free artwork check &amp; proof on every line. <a href="#/delivery">Delivery &amp; returns</a></p>
    </aside>
  </div></div>`;
}

export function tplProduct(p){
  const sides = MOCKS[p.mock].sides;
  const locs = productLocations(p);
  const multiLoc = locs.length > 1;
  const garment = isGarment(p);
  const unit = p.sale ?? (p.sizePrices ? p.sizePrices[p.sizes[0]] : p.price);
  const colorOpts = p.colors ? `
    <div class="optrow"><span class="optlabel">Colour — <small id="colName">${p.colors[0].name}</small></span>
      <div class="swatches" id="swatches">${p.colors.map((c,i)=>`<button class="swatch ${i===0?'on':''}" style="--sw:${c.hex}" data-i="${i}" aria-label="${c.name}"></button>`).join('')}</div>
    </div>` : '';
  const sizeOpts = p.sizes ? `
    <div class="optrow"><span class="optlabel">Size</span>
      <div class="sizechips" id="sizechips">${p.sizes.map((s,i)=>`<button class="sizechip ${i===0?'on':''}" data-s="${s}">${s}${p.sizePrices?` · ${gbp(p.sizePrices[s])}`:''}</button>`).join('')}</div>
    </div>` : '';
  const crumbTag = p.tags[0];
  const r = ratingFor(p.id);
  return `
  <div class="wrap">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/collection/${crumbTag}">${COLLECTIONS[crumbTag].name}</a><span>/</span><span>${p.name}</span></nav>
    <div class="pp-grid">
      <div class="pp-preview">
        <div class="proofbox">
          <div class="cropmarks" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
          ${sides.length>1?`<div class="side-toggle" id="sideToggle"><button class="on" data-side="front">Front</button><button data-side="back">Back</button></div>`:''}
          <div class="mock-stage" id="stage">
            <div class="mock-svg" id="mockSvg"></div>
            <div class="other-wins" id="otherWins"></div>
            <div class="print-window show-guide" id="printWin"></div>
            <div class="handle-layer" id="handleLayer"></div>
            <div class="area-handles" id="areaHandles"></div>
          </div>
          <div class="guide-row">
            <button class="minibtn mode-toggle" id="previewBtn" aria-pressed="false">👁 Preview</button>
            <button class="guide-toggle" id="guideToggle" aria-pressed="true">▣ Print area: on</button>
          </div>
          <div class="admin-bar" id="adminBar" style="display:none">
            <span class="admin-tag">ADMIN</span>
            <span class="admin-hint">Drag the cyan corners/✥ to set the <strong id="activeLocLabelAdmin">print</strong> area. Switch locations above.</span>
            <button class="minibtn" id="adminExportBtn">⧉ Copy layout for deploy</button>
          </div>
        </div>
        <p class="stage-hint">${multiLoc ? 'Pick print spots below, then drop a design into each.' : 'Upload your design, then drag it to position.'} Pink handles resize/rotate · Ctrl/⌘ + scroll to resize.</p>
        <div class="proofbtn-row"><button class="minibtn" id="proofBtn">⬇ Download proof sheet</button></div>
        ${p.imgs && p.imgs.length ? `<div class="real-photos"><p class="optlabel" style="margin-top:1.25rem">The actual product</p><div class="real-photos-row">${p.imgs.map(src => `<img src="${src}" loading="lazy" alt="${esc(p.name)}">`).join('')}</div></div>` : ''}
      </div>
      <div class="pp-info">
        <p class="eyebrow">Customisable ${MOCKS[p.mock].label}</p>
        <h1 class="display">${p.name}</h1>
        <div class="pp-meta"><span>REF ${p.id.toUpperCase()}</span>${r?`<span class="stars">${starsHTML(r.avg)}</span><span>${r.avg.toFixed(1)} · ${r.count} review${r.count>1?'s':''}</span>`:''}<span>Made in Cornwall</span></div>
        <div class="pp-price">
          <span class="now" id="ppPrice">${gbp(unit)}</span>
          ${p.sale?`<del>${gbp(p.price)}</del><span class="save">On sale</span>`:''}
        </div>
        <p class="pp-desc">${p.desc}</p>

        ${(colorOpts||sizeOpts)?`<div class="panel"><div class="panel-h" style="--phead:var(--tint-y)">Options</div><div class="panel-b">${colorOpts}${sizeOpts}</div></div>`:''}

        <div class="panel">
          <div class="panel-h" style="--phead:var(--tint-c)">Your design <span id="sideLabel">${sides.length>1?'· Front':''}</span></div>
          <div class="panel-b">
            ${multiLoc ? `<div class="locrow"><span class="optlabel">Print spots — <small id="activeLocLabel"></small></span><div class="locchips" id="locChips"></div><p class="loc-hint">Tap a spot to add a design there — you can put different artwork on each.</p></div>` : ''}
            <div class="dropzone" id="dropzone">
              <p>Upload your design or photo</p>
              <small>Click, or drag &amp; drop · PNG / JPG / SVG</small>
              <input type="file" id="fileInput" accept="image/*" class="sr-only">
            </div>
            <div class="dpi-badge" id="dpiBadge"><i></i><span></span></div>
            <button class="minibtn" id="lastBtn" style="display:none;margin-top:.9rem">↺ Use my last design</button>
${garment?`            <div class="locrow" id="typeRow"><span class="optlabel" style="margin-top:.9rem">Print type</span><div class="sizechips" id="typeChips">${PRINT_TYPES.map(t=>`<button class="sizechip${t.id==='digital'?' on':''}" data-pt="${t.id}">${t.label}</button>`).join('')}</div></div>`:''}
            <div class="gallery-head">
              <span class="optlabel" style="margin-top:1.2rem">Or choose from our design library</span>
              <button class="minibtn" id="galleryAddBtn" style="display:none">＋ Add design</button>
            </div>
            <div class="gallery-cats" id="galleryCats"></div>
            <div class="gallery-grid" id="galleryGrid"></div>
            <input type="file" id="galleryFile" accept="image/*" class="sr-only">
            <button class="minibtn" id="galleryExportBtn" style="display:none;margin-top:.6rem">⧉ Export library for deploy</button>
            <div class="layer-tabs" style="margin-top:1.25rem">
              <button class="on" data-tab="img" id="tabImg">Image layer</button>
              <button data-tab="text" id="tabText">Text layer</button>
            </div>
            <div id="textTools" style="display:none">
              <input class="textinput" id="textInput" type="text" maxlength="40" placeholder="Type your text — a name, a date, a slogan…">
              <div class="fontpick" id="fontPick">
                <button data-f="anton" class="on" style="font-family:'Anton'">POSTER</button>
                <button data-f="archivo" style="font-family:'Archivo';font-weight:700">Clean</button>
                <button data-f="mono" style="font-family:'IBM Plex Mono'">Mono</button>
                <button data-f="script" style="font-family:'Caveat';font-size:1.15rem">Handwritten</button>
              </div>
              <span class="optlabel">Ink colour</span>
              <div class="inkdots" id="inkDots">${TEXTINKS.map((c,i)=>`<button class="inkdot ${i===0?'on':''}" style="--sw:${c}" data-c="${c}" aria-label="Text colour"></button>`).join('')}</div>
              <div class="toolrow"><label for="curveR">Curve</label><input type="range" id="curveR" min="-100" max="100" value="0"><output id="curveO">0</output></div>
            </div>
            <div class="toolrow"><label for="scaleR">Size</label><input type="range" id="scaleR" min="20" max="250" value="100"><output id="scaleO">100%</output></div>
            <div class="toolrow"><label for="rotR">Rotate</label><input type="range" id="rotR" min="-180" max="180" value="0"><output id="rotO">0°</output></div>
            <div class="toolbtns">
              <button class="minibtn" id="centreBtn">Centre</button>
              <button class="minibtn" id="resetBtn">Reset layer</button>
              <button class="minibtn" id="removeBtn">Remove layer</button>
              <button class="minibtn" id="undoBtn">↩ Undo</button>
            </div>
            <div class="applystrip" id="applyStrip" style="display:none">
              <span class="optlabel">Reuse this design on…</span>
              <div class="applyminis" id="applyMinis"></div>
            </div>
          </div>
        </div>

        ${p.sizes?`<div class="layer-tabs" id="buyTabs" style="margin-top:1.5rem"><button class="on" data-m="single">Single item</button><button data-m="bulk">Bulk sizes</button></div>`:''}
        <div class="buyrow" id="singleBox">
          <div class="qty"><button id="qMinus" aria-label="Decrease quantity">−</button><input id="qtyIn" value="1" inputmode="numeric" aria-label="Quantity"><button id="qPlus" aria-label="Increase quantity">+</button></div>
          <button class="btn btn--solid" id="addBtn">Add to basket — <span id="addPrice">${gbp(unit)}</span></button>
        </div>
        ${p.sizes?`<div id="bulkBox" style="display:none">
          <div class="bulkgrid">${p.sizes.map(s=>`<div><label>${s}</label><input type="number" min="0" max="99" value="0" data-bs="${s}" inputmode="numeric" aria-label="Quantity size ${s}"></div>`).join('')}</div>
          <p class="bulkinfo" id="bulkInfo">0 items — enter quantities above</p>
          <p class="breakshint">5+ save 5% · 10+ save 10% · 25+ save 15%</p>
          <div class="buyrow" style="margin-top:1rem"><button class="btn btn--solid" id="bulkAddBtn" disabled>Add bulk order</button></div>
        </div>`:''}
        <ul class="deliver-strip">
          <li><strong>Free proof</strong> — artwork checked by hand, proof in ${DELIVERY.proofDays}</li>
          <li><strong>Turnaround</strong> — ${DELIVERY.turnaround}</li>
          <li><strong>Delivery</strong> — collect free from Bodmin, or UK delivery quoted at checkout</li>
          <li>${priceNote} · <a href="#/delivery">Delivery &amp; returns</a></li>
        </ul>
      </div>
    </div>

    <section class="section" style="padding-top:3.5rem;padding-bottom:clamp(3rem,6vw,4.5rem)">
      <p class="eyebrow">Reviews</p>
      <h2 class="display" style="font-size:clamp(1.6rem,3vw,2.2rem)">What customers say</h2>
      <div class="rev-summary" id="revSummary"></div>
      <div id="revList" style="max-width:720px"></div>
      <form class="rev-form" id="revForm" novalidate>
        <div class="form-grid">
          <div><label class="flabel" for="rv-name">Name</label><input class="finput" id="rv-name" maxlength="30"></div>
          <div><label class="flabel" for="rv-stars">Rating</label><select id="rv-stars"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></div>
        </div>
        <div><label class="flabel" for="rv-text">Your review</label><textarea class="finput" id="rv-text" style="min-height:90px" maxlength="280"></textarea></div>
        <div><button class="btn" type="submit">Post review (demo)</button></div>
      </form>
    </section>
  </div>`;
}

export function tplContact(msg){
  return `<div class="wrap pagehead">
    <p class="eyebrow">Get in touch</p>
    <h1 class="display">Tell us the job</h1>
    <p class="lede">Quotes, questions, odd requests — send it over and we'll get back to you as soon as we can.</p>
    <div class="contact-grid" style="padding-bottom:clamp(3rem,7vw,5rem)">
      <div>
        <form class="form-grid" id="contactForm" novalidate>
          <div><label class="flabel" for="f-name">Name</label><input class="finput" id="f-name" type="text" autocomplete="name"></div>
          <div><label class="flabel" for="f-phone">Phone</label><input class="finput" id="f-phone" type="tel" autocomplete="tel"></div>
          <div class="full"><label class="flabel" for="f-email">Email <span class="req">*</span></label><input class="finput" id="f-email" type="email" required autocomplete="email"></div>
          <div class="full"><label class="flabel" for="f-msg">What do you need printed?</label><textarea class="finput" id="f-msg" placeholder="e.g. 6 polos with our logo, front chest — plus a 2 m banner for the van…">${esc(msg||'')}</textarea></div>
          <div class="full"><label class="radline" style="align-items:flex-start"><input type="checkbox" id="f-consent" required> <span>I agree to Banners &amp; Beyond storing these details to reply to my enquiry (see our <a href="#/privacy">Privacy notice</a>).</span></label></div>
          <div class="full"><button class="btn btn--solid" type="submit">Send to the workshop <span class="arr">→</span></button></div>
        </form>
        <div class="form-ok" id="formOk" role="status"><strong>Sent to the workshop ✓</strong>Thanks — we'll get back to you as soon as we can.</div>
      </div>
      <aside class="contact-aside">
        <h3>Find us</h3>
        <p><strong>Banners &amp; Beyond Ltd</strong><br>14 Fore Street<br>Bodmin, Cornwall<br>PL31 2HQ</p>
        <p><a href="${BUSINESS.phoneHref}">${BUSINESS.phone}</a><br><a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a></p>
        <p>Follow the press for new drops, deals and behind-the-scenes:</p>
        <ul class="social-list">
          <li><a href="${BUSINESS.social.facebook}" target="_blank" rel="noopener"><span>Facebook</span><span>→</span></a></li>
          <li><a href="${BUSINESS.social.instagram}" target="_blank" rel="noopener"><span>Instagram</span><span>→</span></a></li>
          <li><a href="${BUSINESS.social.tiktok}" target="_blank" rel="noopener"><span>TikTok</span><span>→</span></a></li>
        </ul>
      </aside>
    </div>
  </div>`;
}

function legalPage(title, eyebrow, bodyHTML){
  return `<div class="wrap pagehead legal">
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="display">${title}</h1>
    <div class="legal-body" style="max-width:60ch;padding-bottom:clamp(3rem,7vw,5rem)">${bodyHTML}</div>
  </div>`;
}

export function tplPrivacy(){
  const a = BUSINESS.addressLines.join(', ');
  return legalPage('Privacy notice', 'Your data', `
    <p>${BUSINESS.name} (“we”) respects your privacy. This notice explains what we collect and why. Questions? Email <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.</p>
    <h3>What we collect</h3>
    <p>When you contact us, sign up to our newsletter, or place an order we collect the details you give us: your name, email, phone number, delivery address, order details and any artwork or photos you upload.</p>
    <h3>Why we use it</h3>
    <p>To reply to enquiries, prepare proofs, fulfil and deliver your order, and (only if you opt in) to send occasional updates. Our legal bases are performing our contract with you, our legitimate interest in running the business, and your consent for marketing.</p>
    <h3>Who we share it with</h3>
    <p>We don't sell your data. We use trusted providers to run the site and receive form submissions (our website host) and to communicate with you (email). Your artwork is used only to produce your order.</p>
    <h3>How long we keep it</h3>
    <p>Order records are kept as long as needed for the order and our legal/accounting obligations. You can ask us to delete data we no longer need.</p>
    <h3>Your rights</h3>
    <p>You can ask to see, correct or delete your data, or unsubscribe from marketing at any time, by emailing <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>. You can also complain to the ICO (ico.org.uk).</p>
    <h3>Cookies &amp; storage</h3>
    <p>We use your browser's local storage to remember your basket and designs on this device. We don't use advertising or tracking cookies.</p>
    <p style="color:var(--grey);font-size:.85em;margin-top:1.5rem">${BUSINESS.name}, ${a}.</p>`);
}

export function tplDelivery(){
  return legalPage('Delivery, turnaround &amp; returns', 'The details', `
    <h3>Turnaround</h3>
    <p>Every order gets a free artwork check and a proof for you to approve before we print. Proofs usually go out within ${DELIVERY.proofDays}. Once you approve, most orders are ready in ${DELIVERY.turnaround}. Larger or trade jobs may take longer — we'll always tell you.</p>
    <h3>Collection &amp; delivery</h3>
    <p>${DELIVERY.collect}. ${DELIVERY.ukPostage} — we'll confirm the postage cost with your order total before payment.</p>
    <h3>Approval &amp; artwork</h3>
    <p>Because everything is made to your design, please check your proof carefully — spelling, colours and placement. We print exactly what's approved. By uploading artwork you confirm you have the right to use it.</p>
    <h3>Returns</h3>
    <p>Personalised and made-to-order items can't be returned for a change of mind (your statutory right to cancel doesn't apply to bespoke goods). This doesn't affect your rights if an item is faulty, damaged or not what you approved — if something's wrong with your order, contact us within 14 days of receiving it and we'll put it right with a reprint or refund.</p>
    <h3>Pricing</h3>
    <p>${priceNote}. Prices for bespoke and trade work are confirmed by quote.</p>
    <p style="margin-top:1.5rem">Questions before you order? Call <a href="${BUSINESS.phoneHref}">${BUSINESS.phone}</a> or email <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.</p>`);
}

/* ---- init functions ---- */

export function initCart(){
  const wrap = $('#cartLines');
  if(wrap) wrap.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const uid = +btn.closest('.cartline').dataset.uid;
    const line = state.CART.find(l => l.uid === uid);
    if(!line) return;
    const act = btn.dataset.act;
    if(act === 'plus') line.qty = Math.min(99, line.qty + 1);
    if(act === 'minus') line.qty = Math.max(1, line.qty - 1);
    if(act === 'remove') state.CART = state.CART.filter(l => l.uid !== uid);
    saveCart(); updateBadge(); route();
  });
  const co = $('#checkoutBtn');
  if(co) co.addEventListener('click', openCheckout);
}

export function initContact(){
  const f = $('#contactForm');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const em = $('#f-email');
    const consent = $('#f-consent');
    if(!em.value || !em.checkValidity()){ em.focus(); em.reportValidity && em.reportValidity(); return; }
    if(!consent.checked){ consent.focus(); return; }
    const btn = f.querySelector('button[type="submit"]');
    if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }
    try{
      await submitNetlifyForm('contact', {
        name: $('#f-name').value, email: em.value, phone: $('#f-phone').value, message: $('#f-msg').value
      });
    }catch(err){
      console.warn('Contact submit failed (works once deployed to Netlify):', err.message);
      $('#formOk').innerHTML = `<strong>Couldn't send automatically</strong>Please email us directly at <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>.`;
    }
    f.style.display = 'none';
    $('#formOk').style.display = 'block';
  });
}
