/* ─────────────────────────────────────────────────────────────
   Shared geometry & rendering helpers for the customiser, cart
   thumbnails and proof sheets. Pure functions — no DOM side effects,
   no app state. Imports only static data.
   ───────────────────────────────────────────────────────────── */
import { esc } from './utils.js';
import { MOCKS, FONTS, BIGAREA, GARMENT_MOCKS, LOCATION_DEFS, LOCATION_FEES, PRINT_LAYOUTS } from './data.js';

export function newDesign(){
  return {
    img:{src:null, ow:0, oh:0, vec:false, x:0, y:0, scale:1, rot:0},
    text:{value:'', font:'anton', color:'#111013', curve:0, x:0, y:28, scale:1, rot:0}
  };
}

export function designHasContent(d){
  return !!(d && ((d.img && d.img.src) || (d.text && d.text.value && d.text.value.trim())));
}
export function lineHasContent(line){
  if(!line || !line.designs) return false;
  return Object.values(line.designs).some(designHasContent);
}

/* ---- the full printable area for a side of a product (v2 fallback / base) ---- */
export function getArea(p, side){
  const o = p.mockOpts || {};
  if(p.mock === 'slate'){
    if(o.slateShape === 'wide')  return {x:56,y:130,w:288,h:150};
    if(o.slateShape === 'heart') return {x:96,y:104,w:208,h:190, clip:'heart'};
    return {x:96,y:92,w:208,h:208};
  }
  const m = MOCKS[p.mock];
  return (m.area[side] || m.area.front);
}

export const isGarment = p => GARMENT_MOCKS.includes(p.mock);

function clampArea(a){
  let {x, y, w, h} = a;
  w = Math.max(30, Math.min(w, 400));
  h = Math.max(30, Math.min(h, 400));
  x = Math.max(0, Math.min(x, 400 - w));
  y = Math.max(0, Math.min(y, 400 - h));
  return {x, y, w, h, ...(a.clip ? {clip:a.clip} : {})};
}

/* Default area for a named location, derived from the side's full print area. */
export function deriveLocArea(base, locId){
  const {x, y, w, h} = base;
  const box = (fx, fy, fw, fh) => clampArea({x:x + fx*w, y:y + fy*h, w:fw*w, h:fh*h, ...(base.clip?{clip:base.clip}:{})});
  switch(locId){
    case 'centre-front': return box(0.12, 0.08, 0.76, 0.86);
    case 'left-chest':   return box(0.52, 0.05, 0.34, 0.30); // wearer's left = viewer's right
    case 'right-chest':  return box(0.14, 0.05, 0.34, 0.30);
    case 'left-sleeve':  return box(0.86, 0.30, 0.22, 0.26);
    case 'right-sleeve': return box(-0.08, 0.30, 0.22, 0.26);
    case 'full-back':
    case 'main':
    default:             return {...base};
  }
}

/* Resolve the print locations for a product: id, label, side, fixed area,
   surcharge. Admin overrides in PRINT_LAYOUTS win over derived defaults. */
export function productLocations(p){
  const set = isGarment(p) ? LOCATION_DEFS.garment : LOCATION_DEFS.single;
  const sides = MOCKS[p.mock].sides;
  const overrides = PRINT_LAYOUTS[p.id] || {};
  return set.filter(l => sides.includes(l.side)).map(l => ({
    id: l.id, label: l.label, side: l.side, primary: !!l.primary,
    surcharge: LOCATION_FEES[l.id] ?? 0,
    area: overrides[l.id] ? {...overrides[l.id]} : deriveLocArea(getArea(p, l.side), l.id)
  }));
}

export function windowStyle(area){
  return `left:${area.x/4}%;top:${area.y/4}%;width:${area.w/4}%;height:${area.h/4}%;`;
}
export function clipStyle(area){
  return area.clip === 'heart' ? 'clip-path:url(#heartClip);' : '';
}

export function layerTransform(l){
  return `translate(-50%,-50%) translate(${l.x}cqw, ${l.y}cqh) rotate(${l.rot}deg) scale(${l.scale})`;
}

/* Build the img + text layers for a single design inside its print window.
   imgW is a % of the container (the print window), so designs scale to their area. */
export function buildLayersHTML(design, p){
  if(!design) return '';
  let html = '';
  const imgW = BIGAREA.includes(p.mock) ? 90 : 82;
  const i = design.img;
  if(i && i.src){
    html += `<div class="layer layer-img" data-layer="img" style="width:${imgW}cqw;transform:${layerTransform(i)}"><img src="${i.src}" alt="Your uploaded design" draggable="false"></div>`;
  }
  const t = design.text;
  if(t && t.value.trim()){
    const curve = t.curve || 0;
    if(Math.abs(curve) < 3){
      const stroke = t.color === '#FAFAF7' ? '-webkit-text-stroke:1.2px rgba(17,16,19,.45);' : '';
      html += `<div class="layer layer-text" data-layer="text" style="font-family:${FONTS[t.font]};color:${t.color};font-size:20cqw;${stroke}transform:${layerTransform(t)}">${esc(t.value)}</div>`;
    } else {
      const uid = 'tp' + Math.random().toString(36).slice(2, 9);
      const s = Math.abs(curve) / 100 * 60, half = 180;
      const R = (half * half + s * s) / (2 * s);
      const sweep = curve > 0 ? 0 : 1;
      const paint = t.color === '#FAFAF7' ? 'stroke="#111013" stroke-width="2.5" paint-order="stroke"' : '';
      html += `<div class="layer layer-text" data-layer="text" style="width:100cqw;transform:${layerTransform(t)}">
        <svg viewBox="0 0 400 160" style="display:block;width:100%;overflow:visible" aria-hidden="true">
          <path id="${uid}" d="M 20 80 A ${R} ${R} 0 0 ${sweep} 380 80" fill="none"/>
          <text font-size="50" font-weight="600" fill="${t.color}" ${paint} style="font-family:${FONTS[t.font]}"><textPath href="#${uid}" startOffset="50%" text-anchor="middle">${esc(t.value)}</textPath></text>
        </svg></div>`;
    }
  }
  return html;
}

export function mockSVG(p, colorHex, side){
  const m = MOCKS[p.mock];
  return m.draw(colorHex || (p.colors ? p.colors[0].hex : '#F4F3EE'), side, p.mockOpts || {});
}

/* Static (non-interactive) print windows for every enabled location with
   content on a side — used by cart thumbnails and the proof preview. */
export function sideWindowsHTML(p, line, side){
  return productLocations(p)
    .filter(l => l.side === side && (!line.on || line.on[l.id]) && designHasContent((line.designs || {})[l.id]))
    .map(l => `<div class="print-window${l.area.clip === 'heart' ? '' : ''}" style="${windowStyle(l.area)}${clipStyle(l.area)}">${buildLayersHTML(line.designs[l.id], p)}</div>`)
    .join('');
}

/* Cart / card thumbnail: front of the garment with all its front designs. */
export function previewHTML(p, colorHex, line){
  const l = line || {};
  return `<div class="mini-stage" style="pointer-events:none">
    ${mockSVG(p, colorHex, 'front')}
    ${sideWindowsHTML(p, l, 'front')}
  </div>`;
}

export function physFor(p, size, side){
  const M = {tee:{f:[28,32],b:[30,38]}, crew:{f:[28,32],b:[30,38]}, polo:{f:[24,26],b:[30,38]},
    hoodie:{f:[26,22],b:[30,38]}, softshell:{f:[10,11],b:[30,35]}, hivis:{f:[20,12],b:[30,22]},
    cap:{f:[12,8]}, beanie:{f:[12,6]}, bucket:{f:[10,7]}, mug:{f:[20,9]}, pint:{f:[8,10]},
    stem:{f:[7,6]}, teddy:{f:[9,8]}, tote:{f:[30,28]}, cushion:{f:[42,42]}, coaster:{f:[9,9]},
    sticker:{f:[18,18]}, slate:{f:[14,14]}, banner:{f:[100,47]}, sign:{f:[59.4,42]}};
  const d = M[p.mock] || {f:[20,20]};
  const a = (side === 'back' && d.b) ? d.b : d.f;
  let w = a[0], h = a[1];
  if(p.id === 'slate-wide'){ w = 30; h = 20; }
  else if(p.id === 'slate-heart'){ w = 14; h = 13; }
  if(p.mock === 'banner' && size){ w = (parseFloat(size) || 1) * 100; h = w * 128 / 272; }
  if(p.mock === 'sign' && size === 'A1'){ w = 84.1; h = 59.4; }
  if(p.id === 'magnet'){ w = 60; h = 30; }
  return {w, h};
}
