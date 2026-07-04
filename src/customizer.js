import { $, $$, esc, gbp } from './utils.js';
import { MOCKS, FONTS, TEXTINKS, BIGAREA, PRINT_LOCS, PRINT_TYPES, locById, CLIPARTS, prodById, SEEDREV, ratingFor, starsHTML } from './data.js';
import { state, saveCart, updateBadge, saveLast, saveRecent, saveReviews, snapSide } from './state.js';
import { navigate } from './router.js';
import { showToast, openModal } from './main.js';

export function newSide(){
  return {
    img:{src:null, ow:0, oh:0, vec:false, x:0, y:0, scale:1, rot:0},
    text:{value:'', font:'anton', color:'#111013', curve:0, x:0, y:28, scale:1, rot:0}
  };
}

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

export function sideHasContent(s){ return !!(s && ((s.img && s.img.src) || (s.text && s.text.value.trim()))); }

export function layerTransform(l){
  return `translate(-50%,-50%) translate(${l.x}cqw, ${l.y}cqh) rotate(${l.rot}deg) scale(${l.scale})`;
}

export function buildLayersHTML(sideState, p, interactive){
  if(!sideState) return '';
  let html = '';
  const imgW = BIGAREA.includes(p.mock) ? 90 : 75;
  const i = sideState.img;
  if(i && i.src){
    html += `<div class="layer layer-img" data-layer="img" style="width:${imgW}cqw;transform:${layerTransform(i)}"><img src="${i.src}" alt="Your uploaded design" draggable="false"></div>`;
  }
  const t = sideState.text;
  if(t && t.value.trim()){
    const curve = t.curve || 0;
    if(Math.abs(curve) < 3){
      const stroke = t.color === '#FAFAF7' ? '-webkit-text-stroke:1.2px rgba(17,16,19,.45);' : '';
      html += `<div class="layer layer-text" data-layer="text" style="font-family:${FONTS[t.font]};color:${t.color};font-size:16cqw;${stroke}transform:${layerTransform(t)}">${esc(t.value)}</div>`;
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

export function windowStyle(area){
  return `left:${area.x/4}%;top:${area.y/4}%;width:${area.w/4}%;height:${area.h/4}%;`;
}

export function clipStyle(area){
  if(area.clip === 'heart') return 'clip-path:url(#heartClip);';
  return '';
}

export function mockSVG(p, colorHex, side){
  const m = MOCKS[p.mock];
  return m.draw(colorHex || (p.colors ? p.colors[0].hex : '#F4F3EE'), side, p.mockOpts || {});
}

export function previewHTML(p, colorHex, sides, areas){
  const side = 'front';
  const area = (areas && areas[side]) || getArea(p, side);
  const clipCls = area.clip === 'circle' ? ' clip-circle' : '';
  return `<div class="mini-stage" style="pointer-events:none">
    ${mockSVG(p, colorHex, side)}
    <div class="print-window${clipCls}" style="${windowStyle(area)}${clipStyle(area)}">${buildLayersHTML(sides && sides[side], p, false)}</div>
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

export const BREAKS = [{min:25, off:.15}, {min:10, off:.10}, {min:5, off:.05}];
export const breakFor = q => { for(const b of BREAKS) if(q >= b.min) return b.off; return 0; };

export function priceFor(p, size){
  return (p.sizePrices && size != null && p.sizePrices[size] != null)
    ? p.sizePrices[size]
    : (p.sale ?? p.price);
}

export function initProduct(p){
  const CUST = {
    side:'front',
    sides:{front:newSide(), back:newSide()},
    areas:{front:null, back:null},
    sel:'img',
    colorIdx:0,
    size: p.sizes ? p.sizes[0] : null,
    qty:1,
    guide:true,
    areaMode:false,
    previewing:false,
    locs:{front:'centre-front', back:'large-back'}
  };
  state.RECENT = [p.id, ...state.RECENT.filter(x => x !== p.id)].slice(0, 8); saveRecent();

  const stage = $('#stage'), win = $('#printWin'), mock = $('#mockSvg'), handleLayer = $('#handleLayer'), areaHandles = $('#areaHandles');
  const scaleR = $('#scaleR'), scaleO = $('#scaleO'), rotR = $('#rotR'), rotO = $('#rotO');
  const fileInput = $('#fileInput'), dropzone = $('#dropzone');

  let HISTARR = [], histT = null;
  const pushHist = () => { HISTARR.push(JSON.stringify(CUST.sides)); if(HISTARR.length > 40) HISTARR.shift(); };
  const debHist = () => { clearTimeout(histT); histT = setTimeout(() => { pushHist(); updateLast(); }, 500); };
  function undo(){
    if(HISTARR.length < 2){ showToast('Nothing to undo'); return; }
    HISTARR.pop();
    CUST.sides = JSON.parse(HISTARR[HISTARR.length - 1]);
    renderLayers(); syncTextUI(); updateDpi(); updateLast();
  }

  function curColor(){ return p.colors ? p.colors[CUST.colorIdx].hex : null; }
  function curLayer(){ return CUST.sides[CUST.side][CUST.sel]; }
  function layerHas(l, key){ return key === 'img' ? !!l.src : !!(l.value && l.value.trim()); }
  function positionHandles(){
    if(!handleLayer) return;
    if(CUST.areaMode || CUST.previewing){ handleLayer.innerHTML = ''; return; }
    const l = curLayer();
    const el = win.querySelector(`[data-layer="${CUST.sel}"]`);
    if(!layerHas(l, CUST.sel) || !el){ handleLayer.innerHTML = ''; return; }
    const sRect = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - sRect.left, cy = r.top + r.height / 2 - sRect.top;
    const hw = el.offsetWidth * l.scale / 2, hh = el.offsetHeight * l.scale / 2;
    const rad = l.rot * Math.PI / 180;
    const rot = (lx, ly) => ({x: lx * Math.cos(rad) - ly * Math.sin(rad), y: lx * Math.sin(rad) + ly * Math.cos(rad)});
    const rp = rot(0, -(hh + 24)), sp = rot(hw + 8, hh + 8);
    const rx = cx + rp.x, ry = cy + rp.y, sx = cx + sp.x, sy = cy + sp.y;
    handleLayer.innerHTML = `<svg style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><line class="handle-line" x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}"/></svg>
      <span class="layer-handle handle-rotate" data-h="rotate" title="Drag to rotate" style="left:${rx}px;top:${ry}px"></span>
      <span class="layer-handle handle-resize" data-h="resize" title="Drag to resize" style="left:${sx}px;top:${sy}px"></span>`;
  }
  function renderMock(){ mock.innerHTML = mockSVG(p, curColor(), CUST.side); }
  function curArea(){ return CUST.areas[CUST.side] || getArea(p, CUST.side); }
  function clampArea(a){
    let {x, y, w, h} = a;
    w = Math.max(60, Math.min(w, 400));
    h = Math.max(60, Math.min(h, 400));
    x = Math.max(0, Math.min(x, 400 - w));
    y = Math.max(0, Math.min(y, 400 - h));
    return {x, y, w, h};
  }
  function resizeFromCorner(corner, start, dx, dy){
    let {x, y, w, h} = start;
    if(corner === 'br'){ w += dx; h += dy; }
    else if(corner === 'tr'){ y += dy; w += dx; h -= dy; }
    else if(corner === 'bl'){ x += dx; w -= dx; h += dy; }
    else { x += dx; y += dy; w -= dx; h -= dy; }
    return clampArea({x, y, w, h});
  }
  function positionWindow(){
    const area = curArea();
    win.setAttribute('style', windowStyle(area) + clipStyle(area));
    win.classList.toggle('clip-circle', area.clip === 'circle');
    win.classList.toggle('show-guide', CUST.guide);
    positionAreaHandles();
  }
  function positionAreaHandles(){
    if(!areaHandles) return;
    if(!CUST.guide || !CUST.areaMode || CUST.previewing){ areaHandles.innerHTML = ''; return; }
    const sRect = stage.getBoundingClientRect(), r = win.getBoundingClientRect();
    const L = r.left - sRect.left, T = r.top - sRect.top, W = r.width, H = r.height;
    const corners = [['tl', L, T], ['tr', L + W, T], ['bl', L, T + H], ['br', L + W, T + H]];
    const cornersHTML = corners.map(([c, x, y]) => `<span class="area-handle area-corner ac-${c}" data-c="${c}" style="left:${x}px;top:${y}px" title="Drag to resize print area"></span>`).join('');
    areaHandles.innerHTML = cornersHTML + `<span class="area-handle area-move" data-c="move" style="left:${L + W / 2}px;top:${T - 18}px" title="Drag to move print area">✥</span>`;
  }
  function renderLayers(){
    win.innerHTML = buildLayersHTML(CUST.sides[CUST.side], p, true);
    selectLayer(CUST.sel);
    updateApplyVis();
  }
  function selectLayer(key){
    CUST.sel = key;
    $('#tabImg').classList.toggle('on', key === 'img');
    $('#tabText').classList.toggle('on', key === 'text');
    $('#textTools').style.display = key === 'text' ? 'block' : 'none';
    $$('.layer', win).forEach(el => el.classList.toggle('selected', el.dataset.layer === key));
    syncSliders();
    positionHandles();
  }
  function syncSliders(){
    const l = curLayer();
    scaleR.value = Math.round(l.scale * 100);
    rotR.value = Math.round(l.rot);
    scaleO.textContent = Math.round(l.scale * 100) + '%';
    rotO.textContent = Math.round(l.rot) + '°';
  }
  function syncTextUI(){
    const t = CUST.sides[CUST.side].text;
    $('#textInput').value = t.value;
    $$('#fontPick button').forEach(b => b.classList.toggle('on', b.dataset.f === t.font));
    $$('#inkDots .inkdot').forEach(b => b.classList.toggle('on', b.dataset.c === t.color));
    $('#curveR').value = t.curve || 0;
    $('#curveO').textContent = t.curve || 0;
  }
  function applyTransformLive(){
    const el = win.querySelector(`[data-layer="${CUST.sel}"]`);
    if(el) el.style.transform = layerTransform(curLayer());
    positionHandles();
  }
  function updatePrice(){
    const unit = priceFor(p, CUST.size) + printSurcharge();
    $('#ppPrice').textContent = gbp(unit);
    $('#addPrice').textContent = gbp(unit * CUST.qty);
  }
  function updateLast(){
    const s = CUST.sides[CUST.side];
    if(sideHasContent(s)){ state.LAST_DESIGN = snapSide(s); saveLast(); }
    updateApplyVis();
  }
  function updateApplyVis(){
    const has = sideHasContent(CUST.sides[CUST.side]);
    $('#applyStrip').style.display = has ? 'block' : 'none';
    $('#lastBtn').style.display = (!has && state.LAST_DESIGN) ? 'inline-block' : 'none';
  }
  function renderLocChips(){
    const wrap = $('#locChips'); if(!wrap) return;
    const locs = PRINT_LOCS.filter(l => l.side === CUST.side);
    const cur = CUST.locs[CUST.side];
    wrap.innerHTML = locs.map(l =>
      `<button class="sizechip${l.id===cur?' on':''}" data-loc="${l.id}" title="${l.label} — ${l.mm}mm · +${gbp(l.surcharge)}">${l.label} · +${gbp(l.surcharge)}</button>`
    ).join('');
  }
  function printSurcharge(){
    const sides = MOCKS[p.mock].sides;
    if(sides.length < 2) return 0;
    let s = 0;
    for(const side of sides){
      if(!sideHasContent(CUST.sides[side])) continue;
      const loc = locById(CUST.locs[side]);
      s += loc.surcharge;
    }
    return s;
  }
  function updateDpi(){
    const b = $('#dpiBadge'); if(!b) return;
    const s = CUST.sides[CUST.side].img;
    if(!s.src){ b.style.display = 'none'; return; }
    b.style.display = 'inline-flex';
    const lbl = b.querySelector('span'), dot = b.querySelector('i');
    if(s.vec){ lbl.textContent = 'Vector artwork — sharp at any print size'; dot.style.background = 'var(--cyan)'; return; }
    const phys = physFor(p, CUST.size, CUST.side);
    const base = BIGAREA.includes(p.mock) ? 90 : 75;
    const defArea = getArea(p, CUST.side), areaScale = defArea.w ? (curArea().w / defArea.w) : 1;
    const wcm = (base / 100) * s.scale * phys.w * areaScale;
    const ppi = s.ow / ((wcm / 2.54) || 1);
    let txt, col;
    if(ppi >= 150){ txt = `Sharp print — ${Math.round(ppi)} dpi at this size`; col = 'var(--cyan)'; }
    else if(ppi >= 90){ txt = `Good — ${Math.round(ppi)} dpi at this size`; col = 'var(--cyan)'; }
    else if(ppi >= 60){ txt = `Borderline — ${Math.round(ppi)} dpi, consider printing smaller`; col = 'var(--yellow)'; }
    else { txt = `Low res — ${Math.round(ppi)} dpi, may print blurry`; col = 'var(--magenta)'; }
    lbl.textContent = txt; dot.style.background = col;
  }

  const PTS = new Map();
  let drag = null, gest = null, wheelT = null;
  win.addEventListener('pointerdown', e => {
    win.setPointerCapture(e.pointerId);
    PTS.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(PTS.size === 1){
      const el = e.target.closest('.layer');
      if(el){
        selectLayer(el.dataset.layer);
        const l = curLayer();
        drag = {el, r: win.getBoundingClientRect(), sx:e.clientX, sy:e.clientY, ox:l.x, oy:l.y};
      }
    } else if(PTS.size === 2){
      drag = null;
      const l = curLayer();
      if(layerHas(l, CUST.sel)){
        const [a, b] = [...PTS.values()];
        gest = {d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), s0: l.scale, r0: l.rot};
      }
    }
    e.preventDefault();
  });
  win.addEventListener('pointermove', e => {
    if(!PTS.has(e.pointerId)) return;
    PTS.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(gest && PTS.size >= 2){
      const [a, b] = [...PTS.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const an = Math.atan2(b.y - a.y, b.x - a.x);
      const l = curLayer();
      l.scale = Math.min(2.5, Math.max(0.2, gest.s0 * d / gest.d0));
      l.rot = Math.round(gest.r0 + (an - gest.a0) * 180 / Math.PI);
      applyTransformLive(); syncSliders();
    } else if(drag){
      const l = curLayer();
      l.x = drag.ox + (e.clientX - drag.sx) / drag.r.width * 100;
      l.y = drag.oy + (e.clientY - drag.sy) / drag.r.height * 100;
      drag.el.style.transform = layerTransform(l);
      positionHandles();
    }
  });
  function endPt(e){
    PTS.delete(e.pointerId);
    if(gest && PTS.size < 2){ gest = null; pushHist(); updateDpi(); updateLast(); syncSliders(); }
    if(drag && PTS.size === 0){ drag = null; pushHist(); updateLast(); }
  }
  ['pointerup','pointercancel'].forEach(ev => win.addEventListener(ev, endPt));

  let handleDrag = null, areaDrag = null;
  stage.addEventListener('pointerdown', e => {
    const h = e.target.closest('.layer-handle');
    if(h){
      stage.setPointerCapture(e.pointerId);
      const l = curLayer();
      const el = win.querySelector(`[data-layer="${CUST.sel}"]`);
      if(!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if(h.dataset.h === 'resize'){
        handleDrag = {mode:'resize', cx, cy, d0: Math.hypot(e.clientX - cx, e.clientY - cy) || 1, s0: l.scale};
      } else {
        handleDrag = {mode:'rotate', cx, cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), r0: l.rot};
      }
      e.preventDefault(); e.stopPropagation();
      return;
    }
    const a = e.target.closest('.area-handle');
    if(a){
      stage.setPointerCapture(e.pointerId);
      const sRect = stage.getBoundingClientRect();
      areaDrag = {corner: a.dataset.c, start: {...curArea()}, sx: e.clientX, sy: e.clientY, k: 400 / sRect.width};
      e.preventDefault(); e.stopPropagation();
    }
  });
  stage.addEventListener('pointermove', e => {
    if(handleDrag){
      const l = curLayer();
      if(handleDrag.mode === 'resize'){
        const d = Math.hypot(e.clientX - handleDrag.cx, e.clientY - handleDrag.cy) || 1;
        l.scale = Math.min(2.5, Math.max(0.2, handleDrag.s0 * d / handleDrag.d0));
        updateDpi();
      } else {
        const ang = Math.atan2(e.clientY - handleDrag.cy, e.clientX - handleDrag.cx);
        l.rot = Math.round(handleDrag.r0 + (ang - handleDrag.a0) * 180 / Math.PI);
      }
      applyTransformLive(); syncSliders();
      return;
    }
    if(areaDrag){
      const dx = (e.clientX - areaDrag.sx) * areaDrag.k, dy = (e.clientY - areaDrag.sy) * areaDrag.k;
      const next = areaDrag.corner === 'move'
        ? clampArea({x: areaDrag.start.x + dx, y: areaDrag.start.y + dy, w: areaDrag.start.w, h: areaDrag.start.h})
        : resizeFromCorner(areaDrag.corner, areaDrag.start, dx, dy);
      CUST.areas[CUST.side] = next;
      positionWindow();
      positionHandles(); updateDpi();
    }
  });
  ['pointerup','pointercancel'].forEach(ev => stage.addEventListener(ev, () => {
    if(handleDrag){ handleDrag = null; pushHist(); updateDpi(); updateLast(); syncSliders(); }
    if(areaDrag){ areaDrag = null; updateDpi(); }
  }));
  const onWinResize = () => { positionHandles(); positionAreaHandles(); };
  window.addEventListener('resize', onWinResize);
  state.PAGE_CLEANUP.push(() => window.removeEventListener('resize', onWinResize));

  win.addEventListener('wheel', e => {
    const l = curLayer();
    if(!layerHas(l, CUST.sel)) return;
    e.preventDefault();
    l.scale = Math.min(2.5, Math.max(0.2, l.scale * (e.deltaY < 0 ? 1.06 : 0.94)));
    applyTransformLive(); syncSliders(); updateDpi();
    clearTimeout(wheelT); wheelT = setTimeout(() => { pushHist(); updateLast(); }, 400);
  }, {passive:false});

  let keyT = null;
  function onKey(e){
    if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); undo(); return; }
    const l = curLayer();
    if(!layerHas(l, CUST.sel)) return;
    const step = e.shiftKey ? 5 : 1;
    let moved = true;
    if(e.key === 'ArrowLeft') l.x -= step;
    else if(e.key === 'ArrowRight') l.x += step;
    else if(e.key === 'ArrowUp') l.y -= step;
    else if(e.key === 'ArrowDown') l.y += step;
    else moved = false;
    if(moved){
      e.preventDefault(); applyTransformLive();
      clearTimeout(keyT); keyT = setTimeout(() => { pushHist(); updateLast(); }, 500);
    }
  }
  document.addEventListener('keydown', onKey);
  state.PAGE_CLEANUP.push(() => document.removeEventListener('keydown', onKey));

  scaleR.addEventListener('input', () => { curLayer().scale = scaleR.value / 100; scaleO.textContent = scaleR.value + '%'; applyTransformLive(); updateDpi(); });
  rotR.addEventListener('input', () => { curLayer().rot = +rotR.value; rotO.textContent = rotR.value + '°'; applyTransformLive(); });
  [scaleR, rotR].forEach(r => r.addEventListener('change', () => { pushHist(); updateLast(); }));
  $('#tabImg').addEventListener('click', () => selectLayer('img'));
  $('#tabText').addEventListener('click', () => selectLayer('text'));
  $('#centreBtn').addEventListener('click', () => { const l = curLayer(); l.x = 0; l.y = 0; renderLayers(); pushHist(); updateLast(); });
  $('#resetBtn').addEventListener('click', () => {
    const l = curLayer();
    l.x = 0; l.y = CUST.sel === 'text' ? 28 : 0; l.scale = 1; l.rot = 0;
    if(CUST.sel === 'text') CUST.sides[CUST.side].text.curve = 0;
    renderLayers(); syncTextUI(); updateDpi(); pushHist(); updateLast();
  });
  $('#removeBtn').addEventListener('click', () => {
    const s = CUST.sides[CUST.side];
    if(CUST.sel === 'img'){ s.img.src = null; s.img.vec = false; fileInput.value = ''; }
    else { s.text.value = ''; }
    syncTextUI(); renderLayers(); updatePrice(); updateDpi(); pushHist(); updateLast();
  });
  $('#undoBtn').addEventListener('click', undo);

  function applyImg(src, ow, oh, vec){
    const s = CUST.sides[CUST.side];
    s.img = {src, ow: ow || 0, oh: oh || 0, vec: !!vec, x:0, y:0, scale:1, rot:0};
    renderLayers(); selectLayer('img'); updatePrice(); updateDpi(); pushHist(); updateLast();
    showToast('Design added — drag it into place ✓');
  }
  function handleFile(file){
    if(!file) return;
    if(!file.type.startsWith('image/')){ showToast("That file isn't an image — PNG, JPG or SVG please."); return; }
    const fr = new FileReader();
    fr.onload = () => {
      const src = fr.result;
      if(file.type === 'image/svg+xml'){ applyImg(src, 0, 0, true); return; }
      const im = new Image();
      im.onload = () => {
        const ow = im.width, oh = im.height;
        const max = 1100;
        let w = ow, h = oh;
        if(Math.max(w, h) > max){ const k = max / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(im, 0, 0, w, h);
        let out; try{ out = cv.toDataURL('image/png'); }catch(err){ out = src; }
        applyImg(out, ow, oh, false);
      };
      im.onerror = () => showToast("Couldn't read that image file.");
      im.src = src;
    };
    fr.readAsDataURL(file);
  }
  dropzone.addEventListener('click', e => { if(e.target !== fileInput) fileInput.click(); });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
  ['dragover','dragenter'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('over'); }));
  ['dragleave','drop'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('over'); }));
  dropzone.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));
  stage.addEventListener('dragover', e => e.preventDefault());
  stage.addEventListener('drop', e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });
  $('#clipGrid').addEventListener('click', e => {
    const b = e.target.closest('.clipbtn'); if(!b) return;
    const ink = CUST.sides[CUST.side].text.color || '#111013';
    const src = 'data:image/svg+xml;utf8,' + encodeURIComponent(CLIPARTS[+b.dataset.i].svg(ink));
    applyImg(src, 0, 0, true);
  });

  function applyCarry(d){
    if(!d) return;
    const s = CUST.sides[CUST.side];
    if(d.img && d.img.src) s.img = Object.assign({}, newSide().img, d.img);
    if(d.text && d.text.value) s.text = Object.assign({}, newSide().text, d.text);
    renderLayers(); syncTextUI(); updateDpi(); updatePrice(); pushHist(); updateLast();
  }
  $('#lastBtn').addEventListener('click', () => { applyCarry(state.LAST_DESIGN); showToast('Last design applied ✓'); });
  const APPLY_SET = ['work-tee','hoodie','mug','cap','tote','slate-sq','pint','sticker'].filter(id => id !== p.id).slice(0, 7);
  $('#applyMinis').innerHTML = APPLY_SET.map(id => {
    const q = prodById(id);
    return `<button class="applymini" data-pid="${id}" title="${q.name}" aria-label="Apply design to ${q.name}">${mockSVG(q, null, 'front')}</button>`;
  }).join('');
  $('#applyMinis').addEventListener('click', e => {
    const b = e.target.closest('.applymini'); if(!b) return;
    state.CARRY = snapSide(CUST.sides[CUST.side]);
    navigate('/product/' + b.dataset.pid);
  });

  let txtT = null;
  $('#textInput').addEventListener('input', e => {
    CUST.sides[CUST.side].text.value = e.target.value;
    renderLayers(); selectLayer('text'); updatePrice();
    clearTimeout(txtT); txtT = setTimeout(() => { pushHist(); updateLast(); }, 600);
  });
  $$('#fontPick button').forEach(b => b.addEventListener('click', () => {
    CUST.sides[CUST.side].text.font = b.dataset.f;
    syncTextUI(); renderLayers(); pushHist(); updateLast();
  }));
  $$('#inkDots .inkdot').forEach(b => b.addEventListener('click', () => {
    CUST.sides[CUST.side].text.color = b.dataset.c;
    syncTextUI(); renderLayers(); pushHist(); updateLast();
  }));
  $('#curveR').addEventListener('input', e => {
    CUST.sides[CUST.side].text.curve = +e.target.value;
    $('#curveO').textContent = e.target.value;
    renderLayers();
  });
  $('#curveR').addEventListener('change', () => { pushHist(); updateLast(); });

  const swWrap = $('#swatches');
  if(swWrap) swWrap.addEventListener('click', e => {
    const b = e.target.closest('.swatch'); if(!b) return;
    CUST.colorIdx = +b.dataset.i;
    $$('.swatch', swWrap).forEach(x => x.classList.toggle('on', x === b));
    $('#colName').textContent = p.colors[CUST.colorIdx].name;
    renderMock();
  });
  const szWrap = $('#sizechips');
  if(szWrap) szWrap.addEventListener('click', e => {
    const b = e.target.closest('.sizechip'); if(!b) return;
    CUST.size = b.dataset.s;
    $$('.sizechip', szWrap).forEach(x => x.classList.toggle('on', x === b));
    updatePrice(); updateDpi();
  });
  const st = $('#sideToggle');
  if(st) st.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b || b.dataset.side === CUST.side) return;
    CUST.side = b.dataset.side;
    $$('button', st).forEach(x => x.classList.toggle('on', x === b));
    $('#sideLabel').textContent = '· ' + (CUST.side === 'front' ? 'Front' : 'Back');
    renderMock(); positionWindow(); renderLayers(); syncTextUI(); updateDpi(); renderLocChips(); updatePrice();
  });
  const locWrap = $('#locChips');
  if(locWrap) locWrap.addEventListener('click', e => {
    const b = e.target.closest('.sizechip'); if(!b) return;
    const locId = b.dataset.loc, loc = locById(locId);
    CUST.locs[CUST.side] = locId;
    const s = CUST.sides[CUST.side];
    s.img.x = loc.x; s.img.y = loc.y; s.img.scale = loc.scale; s.img.rot = 0;
    s.text.x = loc.x; s.text.y = loc.y + 28; s.text.scale = loc.scale; s.text.rot = 0;
    renderLayers(); syncTextUI(); updatePrice(); updateDpi(); pushHist(); updateLast();
    renderLocChips();
    showToast(`Print location: ${loc.label} · +${gbp(loc.surcharge)}`);
  });
  function setAreaMode(on){
    CUST.areaMode = on;
    const b = $('#areaModeBtn');
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
    b.textContent = on ? '✕ Done adjusting print area' : '⛶ Adjust print area';
    positionHandles(); positionAreaHandles();
  }
  function setPreview(on){
    CUST.previewing = on;
    stage.classList.toggle('previewing', on);
    const b = $('#previewBtn');
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
    b.textContent = on ? '✎ Back to editing' : '👁 Preview design';
    positionHandles(); positionAreaHandles();
  }
  $('#previewBtn').addEventListener('click', () => setPreview(!CUST.previewing));
  $('#guideToggle').addEventListener('click', () => {
    CUST.guide = !CUST.guide;
    win.classList.toggle('show-guide', CUST.guide);
    const g = $('#guideToggle');
    g.setAttribute('aria-pressed', CUST.guide);
    g.textContent = '▣ Print area: ' + (CUST.guide ? 'on' : 'off');
    if(!CUST.guide && CUST.areaMode) setAreaMode(false); else positionAreaHandles();
  });
  $('#areaModeBtn').addEventListener('click', () => {
    if(!CUST.areaMode && !CUST.guide){
      CUST.guide = true;
      win.classList.add('show-guide');
      const g = $('#guideToggle'); g.setAttribute('aria-pressed', 'true'); g.textContent = '▣ Print area: on';
    }
    setAreaMode(!CUST.areaMode);
  });
  $('#resetAreaBtn').addEventListener('click', () => {
    CUST.areas[CUST.side] = null;
    positionWindow(); renderLayers(); syncTextUI(); updateDpi();
    showToast('Print area reset to default ✓');
  });

  const qtyIn = $('#qtyIn');
  $('#qMinus').addEventListener('click', () => { CUST.qty = Math.max(1, CUST.qty - 1); qtyIn.value = CUST.qty; updatePrice(); });
  $('#qPlus').addEventListener('click', () => { CUST.qty = Math.min(99, CUST.qty + 1); qtyIn.value = CUST.qty; updatePrice(); });
  qtyIn.addEventListener('change', () => { CUST.qty = Math.min(99, Math.max(1, parseInt(qtyIn.value, 10) || 1)); qtyIn.value = CUST.qty; updatePrice(); });
  $('#addBtn').addEventListener('click', () => {
    state.CART.push({
      uid: state.cartUid++, pid: p.id,
      color: p.colors ? {...p.colors[CUST.colorIdx]} : null,
      size: CUST.size, qty: CUST.qty, unit: priceFor(p, CUST.size) + printSurcharge(), disc: 0,
      sides: JSON.parse(JSON.stringify(CUST.sides)),
      areas: JSON.parse(JSON.stringify(CUST.areas)),
      locs: {...CUST.locs}
    });
    updateBadge(); saveCart(); updateLast();
    showToast('Added ✓ · <a href="#/cart">Basket</a> · <a href="#/shop" data-carry="1">Reuse design →</a>');
  });

  if(p.sizes){
    const tabs = $('#buyTabs'), bulkBox = $('#bulkBox'), singleBox = $('#singleBox');
    tabs.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      $$('button', tabs).forEach(x => x.classList.toggle('on', x === b));
      const bulk = b.dataset.m === 'bulk';
      bulkBox.style.display = bulk ? 'block' : 'none';
      singleBox.style.display = bulk ? 'none' : 'flex';
    });
    const inputs = $$('#bulkBox input');
    function calcBulk(){
      let tot = 0, sum = 0;
      const rows = [];
      inputs.forEach(i => {
        const q = Math.max(0, parseInt(i.value, 10) || 0);
        tot += q;
        rows.push({size: i.dataset.bs, q});
      });
      const off = breakFor(tot);
      rows.forEach(r => { r.unit = +(priceFor(p, r.size) * (1 - off)).toFixed(2); sum += r.unit * r.q; });
      $('#bulkInfo').innerHTML = tot
        ? `${tot} items · ${off ? `<strong>${Math.round(off * 100)}% bulk discount</strong> · ` : ''}total ${gbp(+sum.toFixed(2))}`
        : '0 items — enter quantities above';
      $('#bulkAddBtn').disabled = !tot;
      return {tot, off, rows};
    }
    inputs.forEach(i => i.addEventListener('input', calcBulk));
    $('#bulkAddBtn').addEventListener('click', () => {
      const {tot, off, rows} = calcBulk(); if(!tot) return;
      rows.forEach(r => {
        if(!r.q) return;
        state.CART.push({uid: state.cartUid++, pid: p.id, color: p.colors ? {...p.colors[CUST.colorIdx]} : null,
          size: r.size, qty: r.q, unit: +(r.unit + printSurcharge()).toFixed(2), disc: off, sides: JSON.parse(JSON.stringify(CUST.sides)),
          areas: JSON.parse(JSON.stringify(CUST.areas)), locs: {...CUST.locs}});
      });
      inputs.forEach(i => i.value = 0);
      calcBulk(); updateBadge(); saveCart(); updateLast();
      showToast(`Bulk order added ✓ — ${tot} items${off ? ` (−${Math.round(off * 100)}%)` : ''} · <a href="#/cart">Basket</a>`);
    });
  }

  function renderReviews(){
    const arr = [...(SEEDREV[p.id] || []), ...(state.REVIEWS[p.id] || [])];
    const sum = $('#revSummary'), list = $('#revList');
    if(!arr.length){
      sum.innerHTML = '<span class="pcard-rate">No reviews yet — be the first.</span>';
      list.innerHTML = '';
      return;
    }
    const avg = arr.reduce((n, r) => n + r.s, 0) / arr.length;
    sum.innerHTML = `<span class="rev-avg">${avg.toFixed(1)}</span><span class="stars" style="font-size:1.2rem">${starsHTML(avg)}</span><span class="pcard-rate">${arr.length} review${arr.length > 1 ? 's' : ''}</span>`;
    list.innerHTML = arr.map(r => `<div class="rev-item"><h4><span>${esc(r.n)}</span><span class="stars">${starsHTML(r.s)}</span></h4><p>${esc(r.t)}</p></div>`).join('');
  }
  $('#revForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#rv-name').value.trim() || 'Anonymous';
    const s = +$('#rv-stars').value;
    const t = $('#rv-text').value.trim();
    if(!t){ $('#rv-text').focus(); return; }
    (state.REVIEWS[p.id] = state.REVIEWS[p.id] || []).push({n, s, t});
    saveReviews();
    $('#rv-name').value = ''; $('#rv-text').value = '';
    renderReviews(); showToast('Review posted ✓ (demo)');
  });
  renderReviews();

  function svgToImg(svgStr){
    return new Promise((res, rej) => {
      const b = new Blob([svgStr], {type:'image/svg+xml'});
      const u = URL.createObjectURL(b);
      const im = new Image();
      im.onload = () => { URL.revokeObjectURL(u); res(im); };
      im.onerror = rej;
      im.src = u;
    });
  }
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

  function drawArc(ctx, text, curve, chord, fpx, color, stroke){
    const s = Math.abs(curve) / 100 * (chord * 0.33);
    const half = chord / 2;
    const R = (half * half + s * s) / (2 * s);
    const up = curve > 0;
    const cy = up ? (R - s) : (s - R);
    const theta = ctx.measureText(text).width / R;
    let a = up ? (-Math.PI / 2 - theta / 2) : (Math.PI / 2 + theta / 2);
    const dir = up ? 1 : -1;
    for(const ch of text){
      const da = (ctx.measureText(ch).width / 2) / R * dir;
      a += da;
      const x = Math.cos(a) * R, y = cy + Math.sin(a) * R;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + (up ? Math.PI / 2 : -Math.PI / 2));
      if(stroke){ ctx.lineWidth = fpx * .08; ctx.strokeStyle = '#111013'; ctx.strokeText(ch, 0, 0); }
      ctx.fillStyle = color; ctx.fillText(ch, 0, 0);
      ctx.restore();
      a += da;
    }
  }

  async function drawSidePanel(ctx, px, py, pw, side){
    const svgStr = mockSVG(p, curColor(), side).replace('<svg ', '<svg width="800" height="800" ');
    ctx.drawImage(await svgToImg(svgStr), px, py, pw, pw);
    const area = CUST.areas[side] || getArea(p, side), k = pw / 400;
    const ax = px + area.x * k, ay = py + area.y * k, aw = area.w * k, ah = area.h * k;
    ctx.save();
    const path = new Path2D();
    if(area.clip === 'circle'){ path.ellipse(ax + aw / 2, ay + ah / 2, aw / 2, ah / 2, 0, 0, Math.PI * 2); }
    else if(area.clip === 'heart'){
      const u = new Path2D('M0.5 1 C0.08 0.66 0 0.38 0 0.26 C0 0.08 0.14 0 0.30 0 C0.42 0 0.47 0.08 0.5 0.16 C0.53 0.08 0.58 0 0.70 0 C0.86 0 1 0.08 1 0.26 C1 0.38 0.92 0.66 0.5 1 Z');
      const m = new DOMMatrix(); m.translateSelf(ax, ay); m.scaleSelf(aw, ah);
      path.addPath(u, m);
    }
    else path.rect(ax, ay, aw, ah);
    ctx.clip(path);
    const S = CUST.sides[side];
    if(S.img && S.img.src){
      const im = await loadImg(S.img.src);
      const baseW = (BIGAREA.includes(p.mock) ? 90 : 75) / 100 * aw * S.img.scale;
      const ratio = (im.naturalHeight || 1) / (im.naturalWidth || 1);
      const cx = ax + aw / 2 + S.img.x / 100 * aw, cyy = ay + ah / 2 + S.img.y / 100 * ah;
      ctx.save(); ctx.translate(cx, cyy); ctx.rotate(S.img.rot * Math.PI / 180);
      ctx.drawImage(im, -baseW / 2, -baseW * ratio / 2, baseW, baseW * ratio);
      ctx.restore();
    }
    const T = S.text;
    if(T && T.value.trim()){
      const cx = ax + aw / 2 + T.x / 100 * aw, cyy = ay + ah / 2 + T.y / 100 * ah;
      const fpx = 0.16 * aw * T.scale;
      ctx.save(); ctx.translate(cx, cyy); ctx.rotate(T.rot * Math.PI / 180);
      ctx.font = `600 ${fpx}px ${FONTS[T.font]}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const doStroke = T.color === '#FAFAF7';
      if(Math.abs(T.curve || 0) < 3){
        if(doStroke){ ctx.lineWidth = fpx * .08; ctx.strokeStyle = '#111013'; ctx.strokeText(T.value, 0, 0); }
        ctx.fillStyle = T.color; ctx.fillText(T.value, 0, 0);
      } else {
        drawArc(ctx, T.value, T.curve, aw * 0.9, fpx, T.color, doStroke);
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = '#111013'; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, pw);
    ctx.font = '600 20px "IBM Plex Mono"'; ctx.fillStyle = '#75736C';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(side.toUpperCase(), px, py + pw + 30);
  }

  async function makeProof(){
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    const hasBack = MOCKS[p.mock].sides.includes('back') && sideHasContent(CUST.sides.back);
    const W = 1240, H = 1560;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#FAFAF7'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#111013'; ctx.lineWidth = 2;
    const cm = (x, y, dx, dy) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * 26, y); ctx.moveTo(x, y); ctx.lineTo(x, y + dy * 26); ctx.stroke(); };
    cm(36, 36, 1, 1); cm(W - 36, 36, -1, 1); cm(36, H - 36, 1, -1); cm(W - 36, H - 36, -1, -1);
    ctx.fillStyle = '#111013'; ctx.font = '400 52px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('BANNERS & BEYOND — CUSTOMER PROOF', 70, 118);
    const ref = 'BB-' + Math.floor(1000 + Math.random() * 9000);
    ctx.font = '500 20px "IBM Plex Mono"'; ctx.fillStyle = '#75736C';
    ctx.fillText(`REF ${p.id.toUpperCase()} · JOB ${ref} · ${new Date().toLocaleDateString('en-GB')}`, 70, 154);
    ctx.strokeStyle = '#111013'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(70, 180); ctx.lineTo(W - 70, 180); ctx.stroke();
    const pw = hasBack ? 500 : 640;
    const gap = hasBack ? (W - 2 * pw) / 3 : (W - pw) / 2;
    const py = 230;
    if(hasBack){ await drawSidePanel(ctx, gap, py, pw, 'front'); await drawSidePanel(ctx, gap * 2 + pw, py, pw, 'back'); }
    else await drawSidePanel(ctx, gap, py, pw, 'front');
    let sy = py + pw + 92;
    ctx.font = '400 36px Anton'; ctx.fillStyle = '#111013';
    ctx.fillText(p.name.toUpperCase(), 70, sy); sy += 46;
    ctx.font = '500 20px "IBM Plex Mono"';
    const fImg = CUST.sides.front.img;
    [['Colour', p.colors ? p.colors[CUST.colorIdx].name : '—'],
     ['Size', CUST.size || 'One size'],
     ['Quantity', String(CUST.qty)],
     ['Unit price', gbp(priceFor(p, CUST.size) + printSurcharge())],
     ['Artwork', fImg.src ? (fImg.vec ? 'Vector supplied' : 'Raster supplied') : 'Text / none']
    ].forEach(r => {
      ctx.fillStyle = '#75736C'; ctx.fillText(r[0].toUpperCase(), 70, sy);
      ctx.fillStyle = '#111013'; ctx.fillText(r[1], 320, sy);
      sy += 34;
    });
    ctx.save(); ctx.translate(W - 250, sy - 130); ctx.rotate(-0.1);
    ctx.strokeStyle = '#E5087E'; ctx.lineWidth = 5; ctx.strokeRect(-150, -42, 310, 84);
    ctx.fillStyle = '#E5087E'; ctx.font = '600 30px "IBM Plex Mono"'; ctx.textAlign = 'center';
    ctx.fillText('PROOF ONLY', 5, 10); ctx.restore();
    ctx.textAlign = 'left';
    const cols = ['#00A8E1','#E5087E','#FFD100','#111013','#C9EEFB','#FBD3E6','#FFF2BC','#8b8a85'];
    const bw = (W - 140) / 8;
    cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(70 + i * bw, H - 120, bw, 30); });
    ctx.font = '500 15px "IBM Plex Mono"'; ctx.fillStyle = '#75736C';
    ctx.fillText('GENERATED IN-BROWSER · CHECK SPELLING & PLACEMENT · APPROVAL REQUIRED BEFORE PRODUCTION', 70, H - 62);
    const url = cv.toDataURL('image/png');
    openModal(`<button class="modal-x" aria-label="Close">×</button><h2>Your proof sheet</h2><img class="proof-img" src="${url}" alt="Proof sheet preview"><a class="btn btn--solid" style="width:100%" download="proof-${p.id}-${ref}.png" href="${url}">Download PNG</a><p class="mono-note">If download is blocked in this preview, right-click or long-press the image and save it.</p>`);
  }
  $('#proofBtn').addEventListener('click', () => { makeProof().catch(() => showToast('Could not generate the proof — try again.')); });

  renderMock(); positionWindow(); renderLayers(); syncTextUI(); updatePrice(); updateDpi(); renderLocChips();
  pushHist();
  if(state.CARRY){ const d = state.CARRY; state.CARRY = null; applyCarry(d); showToast('Design carried over ✓ — adjust and add to basket'); }
}
