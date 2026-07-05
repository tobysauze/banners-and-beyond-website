import { $, $$, esc, gbp } from './utils.js';
import { MOCKS, FONTS, TEXTINKS, BIGAREA, PRINT_TYPES, CLIPARTS, prodById, SEEDREV, ratingFor, starsHTML } from './data.js';
import { state, saveCart, updateBadge, saveLast, saveRecent, saveReviews } from './state.js';
import { navigate } from './router.js';
import { showToast, openModal } from './main.js';
import {
  newDesign, designHasContent, getArea, productLocations,
  windowStyle, clipStyle, layerTransform, buildLayersHTML, mockSVG, physFor
} from './geometry.js';

export const BREAKS = [{min:25, off:.15}, {min:10, off:.10}, {min:5, off:.05}];
export const breakFor = q => { for(const b of BREAKS) if(q >= b.min) return b.off; return 0; };

export function priceFor(p, size){
  return (p.sizePrices && size != null && p.sizePrices[size] != null)
    ? p.sizePrices[size]
    : (p.sale ?? p.price);
}

// snapshot a single design (for "reuse my last design")
export function snapDesign(d){ return JSON.parse(JSON.stringify({img:d.img, text:d.text})); }

export function initProduct(p){
  const isAdmin = /(?:^|[?&])admin=1(?:&|$)/.test((location.hash.split('?')[1]) || '');
  const LOCS = productLocations(p);              // [{id,label,side,area,surcharge,primary}]
  const locObj = id => LOCS.find(l => l.id === id);
  const sideLocs = side => LOCS.filter(l => l.side === side);
  const multiLoc = LOCS.length > 1;

  const firstFront = LOCS.find(l => l.side === 'front') || LOCS[0];
  const CUST = {
    side: firstFront.side,
    activeLoc: (LOCS.find(l => l.primary && l.side === firstFront.side) || firstFront).id,
    on: {}, designs: {},
    sel: 'img',
    colorIdx: 0,
    size: p.sizes ? p.sizes[0] : null,
    qty: 1,
    printType: 'digital',
    guide: true,
    previewing: false,
    admin: isAdmin
  };
  LOCS.forEach(l => { CUST.on[l.id] = !!l.primary; CUST.designs[l.id] = newDesign(); });
  state.RECENT = [p.id, ...state.RECENT.filter(x => x !== p.id)].slice(0, 8); saveRecent();

  const stage = $('#stage'), win = $('#printWin'), mock = $('#mockSvg'),
        handleLayer = $('#handleLayer'), areaHandles = $('#areaHandles'), otherWins = $('#otherWins');
  const scaleR = $('#scaleR'), scaleO = $('#scaleO'), rotR = $('#rotR'), rotO = $('#rotO');
  const fileInput = $('#fileInput'), dropzone = $('#dropzone');

  /* ---- accessors ---- */
  const curColor = () => p.colors ? p.colors[CUST.colorIdx].hex : null;
  const curLoc = () => locObj(CUST.activeLoc);
  const curDesign = () => CUST.designs[CUST.activeLoc];
  const curLayer = () => curDesign()[CUST.sel];
  const curArea = () => curLoc().area;
  const layerHas = (l, key) => key === 'img' ? !!l.src : !!(l.value && l.value.trim());
  const enabledSide = side => sideLocs(side).filter(l => CUST.on[l.id]);

  /* ---- history (undo) — snapshots all designs ---- */
  let HISTARR = [], histT = null;
  const pushHist = () => { HISTARR.push(JSON.stringify(CUST.designs)); if(HISTARR.length > 40) HISTARR.shift(); };
  function undo(){
    if(HISTARR.length < 2){ showToast('Nothing to undo'); return; }
    HISTARR.pop();
    CUST.designs = JSON.parse(HISTARR[HISTARR.length - 1]);
    renderStage(); syncTextUI(); updateDpi(); updateLast();
  }

  /* ---- rendering ---- */
  function renderMock(){ mock.innerHTML = mockSVG(p, curColor(), CUST.side); }

  function positionWindow(){
    const area = curArea();
    win.setAttribute('style', windowStyle(area) + clipStyle(area));
    win.classList.toggle('clip-circle', area.clip === 'circle');
    win.classList.toggle('show-guide', CUST.guide && !CUST.previewing);
    positionAreaHandles();
  }
  function renderOtherWins(){
    if(!otherWins) return;
    otherWins.innerHTML = enabledSide(CUST.side)
      .filter(l => l.id !== CUST.activeLoc)
      .map(l => `<div class="print-window static${CUST.guide && !CUST.previewing ? ' show-guide-faint' : ''}" data-loc="${l.id}" style="${windowStyle(l.area)}${clipStyle(l.area)}">${buildLayersHTML(CUST.designs[l.id], p)}</div>`)
      .join('');
  }
  function renderLayers(){
    win.innerHTML = buildLayersHTML(curDesign(), p);
    selectLayer(CUST.sel);
  }
  function renderStage(){
    renderMock(); positionWindow(); renderOtherWins(); renderLayers();
    renderLocChips(); updateApplyVis();
  }

  function selectLayer(key){
    CUST.sel = key;
    $('#tabImg').classList.toggle('on', key === 'img');
    $('#tabText').classList.toggle('on', key === 'text');
    $('#textTools').style.display = key === 'text' ? 'block' : 'none';
    $$('.layer', win).forEach(el => el.classList.toggle('selected', el.dataset.layer === key && !CUST.previewing));
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
    const t = curDesign().text;
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

  /* ---- location selector ---- */
  function renderLocChips(){
    const wrap = $('#locChips'); if(!wrap) return;
    const locs = sideLocs(CUST.side);
    wrap.innerHTML = locs.map(l => {
      const on = CUST.on[l.id], active = l.id === CUST.activeLoc;
      const fee = l.surcharge ? ` · +${gbp(l.surcharge)}` : '';
      return `<button class="locchip${on ? ' on' : ''}${active ? ' active' : ''}" data-loc="${l.id}" aria-pressed="${on}">
        <span class="locchip-dot" aria-hidden="true"></span><span>${l.label}${fee}</span>${on ? '<span class="locchip-x" data-x="1" role="button" aria-label="Turn off">×</span>' : ''}
      </button>`;
    }).join('');
    const name = curLoc() ? curLoc().label : '';
    const lbl = $('#activeLocLabel'); if(lbl) lbl.textContent = name;
    const alba = $('#activeLocLabelAdmin'); if(alba) alba.textContent = name;
  }
  function setActiveLoc(id, { enable = true } = {}){
    CUST.activeLoc = id;
    if(enable) CUST.on[id] = true;
    renderStage(); syncTextUI(); updateDpi(); updatePrice();
  }
  function disableLoc(id){
    CUST.on[id] = false;
    if(CUST.activeLoc === id){
      const remaining = enabledSide(CUST.side)[0] || sideLocs(CUST.side)[0];
      CUST.activeLoc = remaining ? remaining.id : id;
    }
    renderStage(); syncTextUI(); updateDpi(); updatePrice(); pushHist(); updateLast();
  }

  /* ---- pricing ---- */
  function printSurcharge(){
    let s = 0;
    for(const l of LOCS){ if(CUST.on[l.id] && designHasContent(CUST.designs[l.id])) s += l.surcharge; }
    const t = PRINT_TYPES.find(t => t.id === CUST.printType);
    const printedLocs = LOCS.filter(l => CUST.on[l.id] && designHasContent(CUST.designs[l.id])).length;
    if(t && t.surcharge) s += t.surcharge * printedLocs;
    return s;
  }
  function updatePrice(){
    const unit = priceFor(p, CUST.size) + printSurcharge();
    $('#ppPrice').textContent = gbp(unit);
    $('#addPrice').textContent = gbp(unit * CUST.qty);
  }

  /* ---- "reuse my last design" applies to the active location ---- */
  function updateLast(){
    const d = curDesign();
    if(designHasContent(d)){ state.LAST_DESIGN = snapDesign(d); saveLast(); }
    updateApplyVis();
  }
  function updateApplyVis(){
    const has = designHasContent(curDesign());
    const strip = $('#applyStrip'); if(strip) strip.style.display = has ? 'block' : 'none';
    const last = $('#lastBtn'); if(last) last.style.display = (!has && state.LAST_DESIGN) ? 'inline-block' : 'none';
  }

  /* ---- DPI badge (based on active location's fixed area) ---- */
  function updateDpi(){
    const b = $('#dpiBadge'); if(!b) return;
    const s = curDesign().img;
    if(!s.src){ b.style.display = 'none'; return; }
    b.style.display = 'inline-flex';
    const lbl = b.querySelector('span'), dot = b.querySelector('i');
    if(s.vec){ lbl.textContent = 'Vector artwork — sharp at any print size'; dot.style.background = 'var(--cyan)'; return; }
    const phys = physFor(p, CUST.size, CUST.side);
    const base = getArea(p, CUST.side), a = curArea();
    const areaScale = base.w ? (a.w / base.w) : 1;
    const imgFrac = (BIGAREA.includes(p.mock) ? 90 : 82) / 100;
    const wcm = imgFrac * s.scale * phys.w * areaScale;
    const ppi = s.ow / ((wcm / 2.54) || 1);
    let txt, col;
    if(ppi >= 150){ txt = `Sharp print — ${Math.round(ppi)} dpi at this size`; col = 'var(--cyan)'; }
    else if(ppi >= 90){ txt = `Good — ${Math.round(ppi)} dpi at this size`; col = 'var(--cyan)'; }
    else if(ppi >= 60){ txt = `Borderline — ${Math.round(ppi)} dpi, consider printing smaller`; col = 'var(--yellow)'; }
    else { txt = `Low res — ${Math.round(ppi)} dpi, may print blurry`; col = 'var(--magenta)'; }
    lbl.textContent = txt; dot.style.background = col;
  }

  /* ---- design resize/rotate handles (operate on active layer) ---- */
  function positionHandles(){
    if(!handleLayer) return;
    if(CUST.admin || CUST.previewing){ handleLayer.innerHTML = ''; return; }
    const l = curLayer();
    const el = win.querySelector(`[data-layer="${CUST.sel}"]`);
    if(!layerHas(l, CUST.sel) || !el){ handleLayer.innerHTML = ''; return; }
    const sRect = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - sRect.left, cy = r.top + r.height / 2 - sRect.top;
    const hw = el.offsetWidth * l.scale / 2, hh = el.offsetHeight * l.scale / 2;
    const rad = l.rot * Math.PI / 180;
    const rot = (lx, ly) => ({x: lx * Math.cos(rad) - ly * Math.sin(rad), y: lx * Math.sin(rad) + ly * Math.cos(rad)});
    const rp = rot(0, -(hh + 24)), sp = rot(hw + 8, hh + 8);
    handleLayer.innerHTML = `<svg style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><line class="handle-line" x1="${cx}" y1="${cy}" x2="${cx + rp.x}" y2="${cy + rp.y}"/></svg>
      <span class="layer-handle handle-rotate" data-h="rotate" title="Drag to rotate" style="left:${cx + rp.x}px;top:${cy + rp.y}px">⟳</span>
      <span class="layer-handle handle-resize" data-h="resize" title="Drag to resize" style="left:${cx + sp.x}px;top:${cy + sp.y}px"></span>`;
  }

  /* ---- ADMIN: move/resize the active location's fixed area ---- */
  function clampArea(a){
    let {x, y, w, h} = a;
    w = Math.max(30, Math.min(w, 400)); h = Math.max(30, Math.min(h, 400));
    x = Math.max(0, Math.min(x, 400 - w)); y = Math.max(0, Math.min(y, 400 - h));
    return {x, y, w, h, ...(a.clip ? {clip:a.clip} : {})};
  }
  function resizeFromCorner(corner, start, dx, dy){
    let {x, y, w, h} = start;
    if(corner === 'br'){ w += dx; h += dy; }
    else if(corner === 'tr'){ y += dy; w += dx; h -= dy; }
    else if(corner === 'bl'){ x += dx; w -= dx; h += dy; }
    else { x += dx; y += dy; w -= dx; h -= dy; }
    return clampArea({x, y, w, h, ...(start.clip ? {clip:start.clip} : {})});
  }
  function positionAreaHandles(){
    if(!areaHandles) return;
    if(!CUST.admin || CUST.previewing){ areaHandles.innerHTML = ''; return; }
    const sRect = stage.getBoundingClientRect(), r = win.getBoundingClientRect();
    const L = r.left - sRect.left, T = r.top - sRect.top, W = r.width, H = r.height;
    const corners = [['tl', L, T], ['tr', L + W, T], ['bl', L, T + H], ['br', L + W, T + H]];
    areaHandles.innerHTML = corners.map(([c, x, y]) => `<span class="area-handle area-corner ac-${c}" data-c="${c}" style="left:${x}px;top:${y}px"></span>`).join('')
      + `<span class="area-handle area-move" data-c="move" style="left:${L + W / 2}px;top:${T - 18}px" title="Move print area">✥</span>`;
  }

  /* ---- pointer: drag/pinch a layer inside the active window ---- */
  const PTS = new Map();
  let drag = null, gest = null, wheelT = null;
  win.addEventListener('pointerdown', e => {
    if(CUST.admin || CUST.previewing) return;
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

  /* ---- pointer: design handles + admin area handles ---- */
  let handleDrag = null, areaDrag = null;
  stage.addEventListener('pointerdown', e => {
    const h = e.target.closest('.layer-handle');
    if(h){
      stage.setPointerCapture(e.pointerId);
      const l = curLayer();
      const el = win.querySelector(`[data-layer="${CUST.sel}"]`); if(!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      handleDrag = h.dataset.h === 'resize'
        ? {mode:'resize', cx, cy, d0: Math.hypot(e.clientX - cx, e.clientY - cy) || 1, s0: l.scale}
        : {mode:'rotate', cx, cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), r0: l.rot};
      e.preventDefault(); e.stopPropagation();
      return;
    }
    const a = e.target.closest('.area-handle');
    if(a && CUST.admin){
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
        ? clampArea({x: areaDrag.start.x + dx, y: areaDrag.start.y + dy, w: areaDrag.start.w, h: areaDrag.start.h, ...(areaDrag.start.clip?{clip:areaDrag.start.clip}:{})})
        : resizeFromCorner(areaDrag.corner, areaDrag.start, dx, dy);
      curLoc().area = next;
      positionWindow(); renderOtherWins(); positionHandles();
    }
  });
  ['pointerup','pointercancel'].forEach(ev => stage.addEventListener(ev, () => {
    if(handleDrag){ handleDrag = null; pushHist(); updateDpi(); updateLast(); syncSliders(); }
    if(areaDrag){ areaDrag = null; }
  }));
  const onWinResize = () => { positionHandles(); positionAreaHandles(); };
  window.addEventListener('resize', onWinResize);
  state.PAGE_CLEANUP.push(() => window.removeEventListener('resize', onWinResize));

  /* wheel: Ctrl/Cmd + wheel resizes (plain wheel scrolls the page) */
  win.addEventListener('wheel', e => {
    if(CUST.admin || CUST.previewing) return;
    const l = curLayer();
    if(!layerHas(l, CUST.sel)) return;
    if(!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    l.scale = Math.min(2.5, Math.max(0.2, l.scale * (e.deltaY < 0 ? 1.06 : 0.94)));
    applyTransformLive(); syncSliders(); updateDpi();
    clearTimeout(wheelT); wheelT = setTimeout(() => { pushHist(); updateLast(); }, 400);
  }, {passive:false});

  /* keyboard: arrow-nudge active layer, Ctrl/Cmd+Z undo */
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
    if(moved){ e.preventDefault(); applyTransformLive(); clearTimeout(keyT); keyT = setTimeout(() => { pushHist(); updateLast(); }, 500); }
  }
  document.addEventListener('keydown', onKey);
  state.PAGE_CLEANUP.push(() => document.removeEventListener('keydown', onKey));

  /* ---- sliders + layer buttons ---- */
  scaleR.addEventListener('input', () => { curLayer().scale = scaleR.value / 100; scaleO.textContent = scaleR.value + '%'; applyTransformLive(); updateDpi(); });
  rotR.addEventListener('input', () => { curLayer().rot = +rotR.value; rotO.textContent = rotR.value + '°'; applyTransformLive(); });
  [scaleR, rotR].forEach(r => r.addEventListener('change', () => { pushHist(); updateLast(); }));
  $('#tabImg').addEventListener('click', () => selectLayer('img'));
  $('#tabText').addEventListener('click', () => selectLayer('text'));
  $('#centreBtn').addEventListener('click', () => { const l = curLayer(); l.x = 0; l.y = 0; renderLayers(); pushHist(); updateLast(); });
  $('#resetBtn').addEventListener('click', () => {
    const l = curLayer();
    l.x = 0; l.y = CUST.sel === 'text' ? 28 : 0; l.scale = 1; l.rot = 0;
    if(CUST.sel === 'text') curDesign().text.curve = 0;
    renderLayers(); syncTextUI(); updateDpi(); pushHist(); updateLast();
  });
  $('#removeBtn').addEventListener('click', () => {
    const d = curDesign();
    if(CUST.sel === 'img'){ d.img.src = null; d.img.vec = false; fileInput.value = ''; }
    else { d.text.value = ''; }
    syncTextUI(); renderStage(); updatePrice(); updateDpi(); pushHist(); updateLast();
  });
  $('#undoBtn').addEventListener('click', undo);

  /* ---- upload + clipart (into the active location) ---- */
  function applyImg(src, ow, oh, vec){
    const d = curDesign();
    d.img = {src, ow: ow || 0, oh: oh || 0, vec: !!vec, x:0, y:0, scale:1, rot:0};
    CUST.on[CUST.activeLoc] = true;
    renderStage(); selectLayer('img'); updatePrice(); updateDpi(); pushHist(); updateLast();
    showToast(`Design added to ${curLoc().label} — drag it into place ✓`);
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
        const ow = im.width, oh = im.height, max = 1100;
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
    const ink = curDesign().text.color || '#111013';
    const src = 'data:image/svg+xml;utf8,' + encodeURIComponent(CLIPARTS[+b.dataset.i].svg(ink));
    applyImg(src, 0, 0, true);
  });

  /* ---- reuse last design / apply to other products ---- */
  function applyCarry(d){
    if(!d) return;
    const dest = curDesign();
    if(d.img && d.img.src) dest.img = Object.assign({}, newDesign().img, d.img);
    if(d.text && d.text.value) dest.text = Object.assign({}, newDesign().text, d.text);
    CUST.on[CUST.activeLoc] = true;
    renderStage(); syncTextUI(); updateDpi(); updatePrice(); pushHist(); updateLast();
  }
  const lastBtn = $('#lastBtn');
  if(lastBtn) lastBtn.addEventListener('click', () => { applyCarry(state.LAST_DESIGN); showToast('Last design applied ✓'); });
  const APPLY_SET = ['work-tee','hoodie','mug','cap','tote','slate-sq','pint','sticker'].filter(id => id !== p.id && prodById(id)).slice(0, 7);
  const applyMinis = $('#applyMinis');
  if(applyMinis){
    applyMinis.innerHTML = APPLY_SET.map(id => {
      const q = prodById(id);
      return `<button class="applymini" data-pid="${id}" title="${q.name}" aria-label="Apply design to ${q.name}">${mockSVG(q, null, 'front')}</button>`;
    }).join('');
    applyMinis.addEventListener('click', e => {
      const b = e.target.closest('.applymini'); if(!b) return;
      state.CARRY = snapDesign(curDesign());
      navigate('/product/' + b.dataset.pid);
    });
  }

  /* ---- text tools ---- */
  let txtT = null;
  $('#textInput').addEventListener('input', e => {
    curDesign().text.value = e.target.value;
    CUST.on[CUST.activeLoc] = true;
    renderStage(); selectLayer('text'); updatePrice();
    clearTimeout(txtT); txtT = setTimeout(() => { pushHist(); updateLast(); }, 600);
  });
  $$('#fontPick button').forEach(b => b.addEventListener('click', () => {
    curDesign().text.font = b.dataset.f; syncTextUI(); renderStage(); selectLayer('text'); pushHist(); updateLast();
  }));
  $$('#inkDots .inkdot').forEach(b => b.addEventListener('click', () => {
    curDesign().text.color = b.dataset.c; syncTextUI(); renderStage(); selectLayer('text'); pushHist(); updateLast();
  }));
  $('#curveR').addEventListener('input', e => { curDesign().text.curve = +e.target.value; $('#curveO').textContent = e.target.value; renderStage(); selectLayer('text'); });
  $('#curveR').addEventListener('change', () => { pushHist(); updateLast(); });

  /* ---- options: colour, size, side, print type, location ---- */
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
    const sl = $('#sideLabel'); if(sl) sl.textContent = '· ' + (CUST.side === 'front' ? 'Front' : 'Back');
    const target = enabledSide(CUST.side)[0] || sideLocs(CUST.side)[0];
    if(target) CUST.activeLoc = target.id;
    renderStage(); syncTextUI(); updateDpi(); updatePrice();
  });
  const typeWrap = $('#typeChips');
  if(typeWrap) typeWrap.addEventListener('click', e => {
    const b = e.target.closest('[data-pt]'); if(!b) return;
    CUST.printType = b.dataset.pt;
    $$('[data-pt]', typeWrap).forEach(x => x.classList.toggle('on', x === b));
    updatePrice();
  });
  const locWrap = $('#locChips');
  if(locWrap) locWrap.addEventListener('click', e => {
    const x = e.target.closest('.locchip-x');
    const chip = e.target.closest('.locchip'); if(!chip) return;
    const id = chip.dataset.loc;
    if(x){ e.stopPropagation(); disableLoc(id); return; }
    setActiveLoc(id);
  });

  /* ---- preview + guide toggles ---- */
  function setPreview(on){
    CUST.previewing = on;
    stage.classList.toggle('previewing', on);
    const b = $('#previewBtn');
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    b.textContent = on ? '✎ Back to editing' : '👁 Preview';
    positionWindow(); renderOtherWins(); renderLayers();
  }
  $('#previewBtn').addEventListener('click', () => setPreview(!CUST.previewing));
  const guideBtn = $('#guideToggle');
  if(guideBtn) guideBtn.addEventListener('click', () => {
    CUST.guide = !CUST.guide;
    guideBtn.setAttribute('aria-pressed', CUST.guide);
    guideBtn.textContent = '▣ Print area: ' + (CUST.guide ? 'on' : 'off');
    positionWindow(); renderOtherWins();
  });

  /* ---- ADMIN editor: export baked layout ---- */
  if(CUST.admin){
    const bar = $('#adminBar'); if(bar) bar.style.display = 'flex';
    const exportBtn = $('#adminExportBtn');
    if(exportBtn) exportBtn.addEventListener('click', () => {
      const layout = {};
      LOCS.forEach(l => {
        const a = l.area;
        layout[l.id] = {x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.w), h: Math.round(a.h), ...(a.clip ? {clip:a.clip} : {})};
      });
      const snippet = `  '${p.id}': ${JSON.stringify(layout)},`;
      if(navigator.clipboard) navigator.clipboard.writeText(snippet).catch(() => {});
      openModal(`<button class="modal-x" aria-label="Close">×</button><h2>Layout for ${esc(p.name)}</h2>
        <p class="mono-note">Copied to clipboard. Paste this line inside <code>PRINT_LAYOUTS = { … }</code> in <code>src/data.js</code>, then deploy — the new positions go live for customers.</p>
        <textarea class="finput" style="min-height:120px;font-family:var(--mono);font-size:.8rem" readonly>${esc(snippet)}</textarea>`);
    });
  }

  /* ---- quantity + add to basket ---- */
  const qtyIn = $('#qtyIn');
  $('#qMinus').addEventListener('click', () => { CUST.qty = Math.max(1, CUST.qty - 1); qtyIn.value = CUST.qty; updatePrice(); });
  $('#qPlus').addEventListener('click', () => { CUST.qty = Math.min(99, CUST.qty + 1); qtyIn.value = CUST.qty; updatePrice(); });
  qtyIn.addEventListener('change', () => { CUST.qty = Math.min(99, Math.max(1, parseInt(qtyIn.value, 10) || 1)); qtyIn.value = CUST.qty; updatePrice(); });

  function cartLineBase(){
    return {
      pid: p.id,
      color: p.colors ? {...p.colors[CUST.colorIdx]} : null,
      printType: CUST.printType,
      designs: JSON.parse(JSON.stringify(CUST.designs)),
      on: {...CUST.on},
      locs: LOCS.filter(l => CUST.on[l.id] && designHasContent(CUST.designs[l.id])).map(l => l.id)
    };
  }
  $('#addBtn').addEventListener('click', () => {
    state.CART.push({ uid: state.cartUid++, ...cartLineBase(), size: CUST.size, qty: CUST.qty, unit: priceFor(p, CUST.size) + printSurcharge(), disc: 0 });
    updateBadge(); saveCart(); updateLast();
    showToast('Added ✓ · <a href="#/cart">Basket</a> · <a href="#/shop" data-carry="1">Reuse design →</a>');
  });

  /* ---- bulk mode ---- */
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
      let tot = 0, sum = 0; const rows = [];
      inputs.forEach(i => { const q = Math.max(0, parseInt(i.value, 10) || 0); tot += q; rows.push({size: i.dataset.bs, q}); });
      const off = breakFor(tot), sc = printSurcharge();
      rows.forEach(r => { r.unit = +((priceFor(p, r.size) + sc) * (1 - off)).toFixed(2); sum += r.unit * r.q; });
      $('#bulkInfo').innerHTML = tot ? `${tot} items · ${off ? `<strong>${Math.round(off * 100)}% bulk discount</strong> · ` : ''}total ${gbp(+sum.toFixed(2))}` : '0 items — enter quantities above';
      $('#bulkAddBtn').disabled = !tot;
      return {tot, off, rows};
    }
    inputs.forEach(i => i.addEventListener('input', calcBulk));
    $('#bulkAddBtn').addEventListener('click', () => {
      const {tot, off, rows} = calcBulk(); if(!tot) return;
      rows.forEach(r => { if(!r.q) return; state.CART.push({uid: state.cartUid++, ...cartLineBase(), size: r.size, qty: r.q, unit: r.unit, disc: off}); });
      inputs.forEach(i => i.value = 0);
      calcBulk(); updateBadge(); saveCart(); updateLast();
      showToast(`Bulk order added ✓ — ${tot} items${off ? ` (−${Math.round(off * 100)}%)` : ''} · <a href="#/cart">Basket</a>`);
    });
  }

  /* ---- reviews ---- */
  function renderReviews(){
    const arr = [...(SEEDREV[p.id] || []), ...(state.REVIEWS[p.id] || [])];
    const sum = $('#revSummary'), list = $('#revList'); if(!sum || !list) return;
    if(!arr.length){ sum.innerHTML = '<span class="pcard-rate">No reviews yet — be the first.</span>'; list.innerHTML = ''; return; }
    const avg = arr.reduce((n, r) => n + r.s, 0) / arr.length;
    sum.innerHTML = `<span class="rev-avg">${avg.toFixed(1)}</span><span class="stars" style="font-size:1.2rem">${starsHTML(avg)}</span><span class="pcard-rate">${arr.length} review${arr.length > 1 ? 's' : ''}</span>`;
    list.innerHTML = arr.map(r => `<div class="rev-item"><h4><span>${esc(r.n)}</span><span class="stars">${starsHTML(r.s)}</span></h4><p>${esc(r.t)}</p></div>`).join('');
  }
  const revForm = $('#revForm');
  if(revForm) revForm.addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#rv-name').value.trim() || 'Anonymous', s = +$('#rv-stars').value, t = $('#rv-text').value.trim();
    if(!t){ $('#rv-text').focus(); return; }
    (state.REVIEWS[p.id] = state.REVIEWS[p.id] || []).push({n, s, t});
    saveReviews(); $('#rv-name').value = ''; $('#rv-text').value = '';
    renderReviews(); showToast('Thanks for your review ✓');
  });
  renderReviews();

  /* ---- proof sheet ---- */
  function svgToImg(svgStr){
    return new Promise((res, rej) => {
      const b = new Blob([svgStr], {type:'image/svg+xml'});
      const u = URL.createObjectURL(b);
      const im = new Image();
      im.onload = () => { URL.revokeObjectURL(u); res(im); };
      im.onerror = rej; im.src = u;
    });
  }
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

  function drawArc(ctx, text, curve, chord, fpx, color, stroke){
    const s = Math.abs(curve) / 100 * (chord * 0.33), half = chord / 2;
    const R = (half * half + s * s) / (2 * s), up = curve > 0;
    const cy = up ? (R - s) : (s - R);
    const theta = ctx.measureText(text).width / R;
    let a = up ? (-Math.PI / 2 - theta / 2) : (Math.PI / 2 + theta / 2);
    const dir = up ? 1 : -1;
    for(const ch of text){
      const da = (ctx.measureText(ch).width / 2) / R * dir; a += da;
      const x = Math.cos(a) * R, y = cy + Math.sin(a) * R;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + (up ? Math.PI / 2 : -Math.PI / 2));
      if(stroke){ ctx.lineWidth = fpx * .08; ctx.strokeStyle = '#111013'; ctx.strokeText(ch, 0, 0); }
      ctx.fillStyle = color; ctx.fillText(ch, 0, 0); ctx.restore(); a += da;
    }
  }
  async function drawDesignInArea(ctx, design, area, px, py, pw){
    const k = pw / 400;
    const ax = px + area.x * k, ay = py + area.y * k, aw = area.w * k, ah = area.h * k;
    ctx.save();
    const path = new Path2D();
    if(area.clip === 'heart'){
      const u = new Path2D('M0.5 1 C0.08 0.66 0 0.38 0 0.26 C0 0.08 0.14 0 0.30 0 C0.42 0 0.47 0.08 0.5 0.16 C0.53 0.08 0.58 0 0.70 0 C0.86 0 1 0.08 1 0.26 C1 0.38 0.92 0.66 0.5 1 Z');
      const m = new DOMMatrix(); m.translateSelf(ax, ay); m.scaleSelf(aw, ah); path.addPath(u, m);
    } else path.rect(ax, ay, aw, ah);
    ctx.clip(path);
    const S = design;
    if(S.img && S.img.src){
      const im = await loadImg(S.img.src);
      const baseW = (BIGAREA.includes(p.mock) ? 90 : 82) / 100 * aw * S.img.scale;
      const ratio = (im.naturalHeight || 1) / (im.naturalWidth || 1);
      const cx = ax + aw / 2 + S.img.x / 100 * aw, cyy = ay + ah / 2 + S.img.y / 100 * ah;
      ctx.save(); ctx.translate(cx, cyy); ctx.rotate(S.img.rot * Math.PI / 180);
      ctx.drawImage(im, -baseW / 2, -baseW * ratio / 2, baseW, baseW * ratio); ctx.restore();
    }
    const T = S.text;
    if(T && T.value.trim()){
      const cx = ax + aw / 2 + T.x / 100 * aw, cyy = ay + ah / 2 + T.y / 100 * ah;
      const fpx = 0.20 * aw * T.scale;
      ctx.save(); ctx.translate(cx, cyy); ctx.rotate(T.rot * Math.PI / 180);
      ctx.font = `600 ${fpx}px ${FONTS[T.font]}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const doStroke = T.color === '#FAFAF7';
      if(Math.abs(T.curve || 0) < 3){
        if(doStroke){ ctx.lineWidth = fpx * .08; ctx.strokeStyle = '#111013'; ctx.strokeText(T.value, 0, 0); }
        ctx.fillStyle = T.color; ctx.fillText(T.value, 0, 0);
      } else drawArc(ctx, T.value, T.curve, aw * 0.9, fpx, T.color, doStroke);
      ctx.restore();
    }
    ctx.restore();
  }
  async function drawSidePanel(ctx, px, py, pw, side){
    const svgStr = mockSVG(p, curColor(), side).replace('<svg ', '<svg width="800" height="800" ');
    ctx.drawImage(await svgToImg(svgStr), px, py, pw, pw);
    for(const l of enabledSide(side)){
      if(designHasContent(CUST.designs[l.id])) await drawDesignInArea(ctx, CUST.designs[l.id], l.area, px, py, pw);
    }
    ctx.strokeStyle = '#111013'; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, pw);
    ctx.font = '600 20px "IBM Plex Mono"'; ctx.fillStyle = '#75736C'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(side.toUpperCase(), px, py + pw + 30);
  }
  async function makeProof(){
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    const hasBack = MOCKS[p.mock].sides.includes('back') && enabledSide('back').some(l => designHasContent(CUST.designs[l.id]));
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
    ctx.fillText(`REF ${p.id.toUpperCase()} · JOB ${ref}`, 70, 154);
    ctx.strokeStyle = '#111013'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, 180); ctx.lineTo(W - 70, 180); ctx.stroke();
    const pw = hasBack ? 500 : 640, gap = hasBack ? (W - 2 * pw) / 3 : (W - pw) / 2, py = 230;
    if(hasBack){ await drawSidePanel(ctx, gap, py, pw, 'front'); await drawSidePanel(ctx, gap * 2 + pw, py, pw, 'back'); }
    else await drawSidePanel(ctx, gap, py, pw, 'front');
    let sy = py + pw + 92;
    ctx.font = '400 36px Anton'; ctx.fillStyle = '#111013'; ctx.fillText(p.name.toUpperCase(), 70, sy); sy += 46;
    ctx.font = '500 20px "IBM Plex Mono"';
    const printed = LOCS.filter(l => CUST.on[l.id] && designHasContent(CUST.designs[l.id])).map(l => l.label).join(', ') || 'None';
    [['Colour', p.colors ? p.colors[CUST.colorIdx].name : '—'],
     ['Size', CUST.size || 'One size'],
     ['Quantity', String(CUST.qty)],
     ['Print type', (PRINT_TYPES.find(t => t.id === CUST.printType) || {}).label || 'Digital'],
     ['Locations', printed],
     ['Unit price', gbp(priceFor(p, CUST.size) + printSurcharge())]
    ].forEach(r => { ctx.fillStyle = '#75736C'; ctx.fillText(r[0].toUpperCase(), 70, sy); ctx.fillStyle = '#111013'; ctx.fillText(String(r[1]), 320, sy); sy += 34; });
    ctx.save(); ctx.translate(W - 250, sy - 130); ctx.rotate(-0.1);
    ctx.strokeStyle = '#E5087E'; ctx.lineWidth = 5; ctx.strokeRect(-150, -42, 310, 84);
    ctx.fillStyle = '#E5087E'; ctx.font = '600 30px "IBM Plex Mono"'; ctx.textAlign = 'center'; ctx.fillText('PROOF ONLY', 5, 10); ctx.restore();
    ctx.textAlign = 'left';
    const cols = ['#00A8E1','#E5087E','#FFD100','#111013','#C9EEFB','#FBD3E6','#FFF2BC','#8b8a85'], bw = (W - 140) / 8;
    cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(70 + i * bw, H - 120, bw, 30); });
    ctx.font = '500 15px "IBM Plex Mono"'; ctx.fillStyle = '#75736C';
    ctx.fillText('GENERATED IN-BROWSER · CHECK SPELLING & PLACEMENT · APPROVAL REQUIRED BEFORE PRODUCTION', 70, H - 62);
    const url = cv.toDataURL('image/png');
    openModal(`<button class="modal-x" aria-label="Close">×</button><h2>Your proof sheet</h2><img class="proof-img" src="${url}" alt="Proof sheet preview"><a class="btn btn--solid" style="width:100%" download="proof-${p.id}-${ref}.png" href="${url}">Download PNG</a><p class="mono-note">If download is blocked in this preview, right-click or long-press the image and save it.</p>`);
  }
  const proofBtn = $('#proofBtn');
  if(proofBtn) proofBtn.addEventListener('click', () => { makeProof().catch(() => showToast('Could not generate the proof — try again.')); });

  /* ---- boot ---- */
  renderStage(); syncTextUI(); updatePrice(); updateDpi();
  pushHist();
  if(state.CARRY){ const d = state.CARRY; state.CARRY = null; applyCarry(d); showToast('Design carried over ✓ — adjust and add to basket'); }
}
