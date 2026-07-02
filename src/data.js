// SVG helpers
export const INK = '#111013';

export const sw = 5; // stroke width
export const svgWrap = inner => `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
export const P = (d, fill, extra='') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const L = (d, extra='') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw*0.7}" stroke-linecap="round" ${extra}/>`;
export const SH = d => `<path d="${d}" fill="${INK}" opacity="0.07"/>`;

export const MOCKS = {

  tee: {
    label:'T-shirt', sides:['front','back'],
    area:{front:{x:138,y:170,w:124,h:135}, back:{x:135,y:158,w:130,h:150}},
    draw(c, side){
      const body = 'M132 96 L70 130 L92 192 L124 176 L124 344 L276 344 L276 176 L308 192 L330 130 L268 96 C255 121 231 133 200 133 C169 133 145 121 132 96 Z';
      let d = P(body, c);
      d += SH('M124 176 L124 344 L152 344 L152 200 Z');
      d += L('M124 176 L124 200'); d += L('M276 176 L276 200');
      if(side==='front'){
        d += P('M156 98 C165 118 181 127 200 127 C219 127 235 118 244 98 C232 112 217 119 200 119 C183 119 168 112 156 98 Z', c);
      } else {
        d += L('M162 100 C174 112 186 116 200 116 C214 116 226 112 238 100');
      }
      return svgWrap(d);
    }
  },

  hoodie: {
    label:'Hoodie', sides:['front','back'],
    area:{front:{x:143,y:190,w:114,h:98}, back:{x:135,y:168,w:130,h:145}},
    zip:false,
    draw(c, side, opts={}){
      const zip = opts.zip;
      const body = 'M130 106 L66 140 L90 204 L122 188 L122 348 L278 348 L278 188 L310 204 L334 140 L270 106 C258 128 232 140 200 140 C168 140 142 128 130 106 Z';
      let d = P(body, c);
      d += SH('M122 188 L122 348 L150 348 L150 210 Z');
      d += L('M122 188 L122 212'); d += L('M278 188 L278 212');
      if(side==='front'){
        d += P('M148 104 C150 84 172 70 200 70 C228 70 250 84 252 104 C244 128 226 142 200 142 C174 142 156 128 148 104 Z', c); // hood
        d += P('M166 108 C172 124 184 132 200 132 C216 132 228 124 234 108 C226 96 214 90 200 90 C186 90 174 96 166 108 Z', shade(c)); // hood opening
        d += L('M188 140 L184 176'); d += L('M212 140 L216 176'); // drawstrings
        d += `<circle cx="184" cy="180" r="4" fill="${INK}"/><circle cx="216" cy="180" r="4" fill="${INK}"/>`;
        if(zip){ d += L('M200 142 L200 348'); d += `<rect x="195" y="200" width="10" height="18" fill="${INK}"/>`; }
        else { d += P('M152 268 L172 244 L228 244 L248 268 L248 322 L152 322 Z', c); d += L('M172 244 L172 322'); d += L('M228 244 L228 322'); } // pocket
      } else {
        d += P('M144 118 C150 92 172 78 200 78 C228 78 250 92 256 118 C240 108 222 102 200 102 C178 102 160 108 144 118 Z', c); // hood from back
      }
      d += P('M122 330 L278 330 L278 348 L122 348 Z', shade(c)); // hem rib
      return svgWrap(d);
    }
  },

  crew: {
    label:'Sweatshirt', sides:['front','back'],
    area:{front:{x:140,y:172,w:120,h:130}, back:{x:136,y:162,w:128,h:145}},
    draw(c, side){
      const body = 'M132 102 L68 136 L92 198 L124 182 L124 344 L276 344 L276 182 L308 198 L332 136 L268 102 C256 124 230 136 200 136 C170 136 144 124 132 102 Z';
      let d = P(body, c);
      d += SH('M124 182 L124 344 L152 344 L152 204 Z');
      d += P('M160 102 C168 122 182 131 200 131 C218 131 232 122 240 102 C230 114 216 120 200 120 C184 120 170 114 160 102 Z', shade(c));
      d += P('M124 326 L276 326 L276 344 L124 344 Z', shade(c));
      d += L('M124 182 L124 206'); d += L('M276 182 L276 206');
      if(side==='back'){ d += L('M170 104 C180 112 190 115 200 115 C210 115 220 112 230 104'); }
      return svgWrap(d);
    }
  },

  polo: {
    label:'Polo shirt', sides:['front','back'],
    area:{front:{x:150,y:188,w:100,h:112}, back:{x:136,y:160,w:128,h:145}},
    draw(c, side){
      const body = 'M132 98 L70 132 L92 194 L124 178 L124 344 L276 344 L276 178 L308 194 L330 132 L268 98 C255 122 231 134 200 134 C169 134 145 122 132 98 Z';
      let d = P(body, c);
      d += SH('M124 178 L124 344 L152 344 L152 200 Z');
      if(side==='front'){
        d += P('M160 96 L184 128 L178 138 L152 112 Z', c);
        d += P('M240 96 L216 128 L222 138 L248 112 Z', c);
        d += L('M192 132 L192 178'); d += L('M208 132 L208 178');
        d += `<circle cx="200" cy="146" r="3.5" fill="${INK}"/><circle cx="200" cy="164" r="3.5" fill="${INK}"/>`;
      } else {
        d += P('M158 96 C166 108 182 116 200 116 C218 116 234 108 242 96 L246 106 C236 120 220 128 200 128 C180 128 164 120 154 106 Z', c);
      }
      return svgWrap(d);
    }
  },

  softshell: {
    label:'Softshell jacket', sides:['front','back'],
    area:{front:{x:222,y:186,w:56,h:64}, back:{x:136,y:166,w:128,h:140}},
    draw(c, side){
      const body = 'M134 100 L72 134 L94 198 L126 182 L126 348 L274 348 L274 182 L306 198 L328 134 L266 100 C254 118 230 128 200 128 C170 128 146 118 134 100 Z';
      let d = P(body, c);
      d += SH('M126 182 L126 348 L154 348 L154 204 Z');
      if(side==='front'){
        d += P('M164 96 L164 76 L236 76 L236 96 C226 110 214 116 200 116 C186 116 174 110 164 96 Z', c); // collar stand
        d += L('M200 116 L200 348'); // zip
        d += `<rect x="194" y="150" width="12" height="20" fill="${INK}"/>`;
        d += L('M146 214 L176 214'); d += L('M254 214 L224 214'); // pocket zips
        d += L('M126 300 L274 300', 'stroke-dasharray="3 8"');
      } else {
        d += P('M164 96 L164 78 L236 78 L236 96 C224 106 212 110 200 110 C188 110 176 106 164 96 Z', c);
        d += L('M126 300 L274 300', 'stroke-dasharray="3 8"');
      }
      return svgWrap(d);
    }
  },

  hivis: {
    label:'Hi-vis vest', sides:['front','back'],
    area:{front:{x:150,y:140,w:100,h:60}, back:{x:145,y:210,w:110,h:80}},
    draw(c, side){
      const body = 'M148 92 L120 110 L128 350 L272 350 L280 110 L252 92 C240 110 222 118 200 118 C178 118 160 110 148 92 Z';
      let d = P(body, c);
      // reflective bands
      const band = y => `<rect x="127" y="${y}" width="146" height="26" fill="#8b8a85" stroke="${INK}" stroke-width="${sw*0.7}"/><rect x="127" y="${y+9}" width="146" height="8" fill="#e7e6e2"/>`;
      if(side==='front'){
        d += band(212); d += band(300);
        d += L('M200 118 L200 350'); // front opening
      } else {
        d += band(150); d += band(300);
      }
      d += P('M148 92 L166 104 L160 130 L136 116 Z', c);
      d += P('M252 92 L234 104 L240 130 L264 116 Z', c);
      return svgWrap(d);
    }
  },

  cap: {
    label:'Cap', sides:['front'],
    area:{front:{x:152,y:158,w:96,h:70}},
    draw(c){
      let d = P('M108 232 C108 160 148 112 200 112 C252 112 292 160 292 232 Z', c);
      d += SH('M108 232 C108 160 148 112 200 112 C160 130 136 176 134 232 Z');
      d += L('M160 122 C150 152 146 190 146 232');
      d += L('M240 122 C250 152 254 190 254 232');
      d += P('M84 232 L316 232 L328 252 C288 268 112 268 72 252 Z', c);
      d += `<circle cx="200" cy="112" r="7" fill="${c}" stroke="${INK}" stroke-width="${sw*0.7}"/>`;
      return svgWrap(d);
    }
  },

  beanie: {
    label:'Beanie', sides:['front'],
    area:{front:{x:148,y:236,w:104,h:52}},
    draw(c){
      let d = P('M116 240 C116 156 152 104 200 104 C248 104 284 156 284 240 Z', c);
      d += SH('M116 240 C116 156 152 104 200 104 C164 122 142 178 140 240 Z');
      d += L('M168 116 C160 152 156 196 156 236');
      d += L('M200 108 L200 236');
      d += L('M232 116 C240 152 244 196 244 236');
      d += P('M112 236 L288 236 L288 292 L112 292 Z', c);
      d += L('M126 240 L126 288'); d += L('M146 240 L146 288'); d += L('M254 240 L254 288'); d += L('M274 240 L274 288');
      return svgWrap(d);
    }
  },

  bucket: {
    label:'Bucket hat', sides:['front'],
    area:{front:{x:158,y:158,w:84,h:60}},
    draw(c){
      let d = P('M144 148 C144 122 168 104 200 104 C232 104 256 122 256 148 L262 232 L138 232 Z', c);
      d += SH('M138 232 L144 148 C144 130 156 116 174 108 C160 130 154 180 152 232 Z');
      d += L('M141 156 L259 156');
      d += P('M92 232 C120 220 280 220 308 232 C316 240 312 256 300 260 C260 246 140 246 100 260 C88 256 84 240 92 232 Z', c);
      d += L('M100 244 C150 234 250 234 300 244', 'stroke-dasharray="2 7"');
      return svgWrap(d);
    }
  },

  mug: {
    label:'Mug', sides:['front'],
    area:{front:{x:120,y:130,w:140,h:150}},
    draw(c){
      let d = P('M282 128 L310 128 C336 128 348 148 348 180 C348 212 336 232 310 232 L282 232 L282 208 L306 208 C318 208 324 196 324 180 C324 164 318 152 306 152 L282 152 Z', '#FAFAF7');
      d += P('M104 108 L276 108 L272 300 C272 312 262 320 250 320 L130 320 C118 320 108 312 108 300 Z', '#FAFAF7');
      d += SH('M104 108 L134 108 L138 320 L130 320 C118 320 108 312 108 300 Z');
      d += `<ellipse cx="190" cy="108" rx="86" ry="14" fill="#FAFAF7" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<ellipse cx="190" cy="108" rx="70" ry="9" fill="${shade('#FAFAF7')}" stroke="${INK}" stroke-width="${sw*0.6}"/>`;
      return svgWrap(d);
    }
  },

  pint: {
    label:'Pint glass', sides:['front'],
    area:{front:{x:146,y:140,w:108,h:140}},
    draw(){
      const glass = '#EAF4F8';
      let d = P('M132 76 L268 76 L254 322 C254 334 244 342 232 342 L168 342 C156 342 146 334 146 322 Z', glass, 'opacity="0.96"');
      d += `<ellipse cx="200" cy="76" rx="68" ry="11" fill="${glass}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += L('M148 96 C150 170 152 250 156 316', 'opacity="0.5"');
      d += `<circle cx="176" cy="118" r="4" fill="none" stroke="${INK}" stroke-width="3" opacity="0.4"/>`;
      d += `<circle cx="228" cy="104" r="3" fill="none" stroke="${INK}" stroke-width="3" opacity="0.4"/>`;
      return svgWrap(d);
    }
  },

  stem: {
    label:'Gin glass', sides:['front'],
    area:{front:{x:148,y:112,w:104,h:96}},
    draw(){
      const glass = '#EAF4F8';
      let d = P('M124 120 C124 64 168 48 200 48 C232 48 276 64 276 120 C276 176 240 216 200 216 C160 216 124 176 124 120 Z', glass, 'opacity="0.96"');
      d += L('M200 216 L200 320');
      d += P('M148 328 C148 320 172 316 200 316 C228 316 252 320 252 328 C252 338 228 342 200 342 C172 342 148 338 148 328 Z', glass);
      d += L('M140 96 C138 150 158 192 184 206', 'opacity="0.45"');
      return svgWrap(d);
    }
  },

  slate: {
    label:'Slate', sides:['front'], slateShape:'sq',
    area:{front:{x:96,y:92,w:208,h:208}},
    draw(c, side, opts={}){
      const shape = opts.slateShape || 'sq';
      const stone = '#2E2C30';
      let d = '';
      if(shape === 'wide'){
        this.area.front = {x:56,y:130,w:288,h:150};
        d += P('M50 124 L354 128 L348 284 L54 280 Z', stone);
        d += chips(52,126,352,282);
        d += P('M150 284 L250 284 L262 322 L138 322 Z', INK);
      } else if(shape === 'heart'){
        this.area.front = {x:96,y:104,w:208,h:190, clip:'heart'};
        d += P('M200 316 C120 258 84 206 84 156 C84 118 112 92 146 92 C170 92 190 104 200 124 C210 104 230 92 254 92 C288 92 316 118 316 156 C316 206 280 258 200 316 Z', stone);
        d += P('M164 316 L236 316 L248 348 L152 348 Z', INK);
      } else {
        this.area.front = {x:96,y:92,w:208,h:208};
        d += P('M92 88 L310 94 L304 302 L96 296 Z', stone);
        d += chips(94,90,306,298);
        d += P('M150 300 L250 300 L262 338 L138 338 Z', INK);
      }
      return svgWrap(d);
    }
  },

  coaster: {
    label:'Slate coaster', sides:['front'],
    area:{front:{x:118,y:118,w:164,h:164, clip:'circle'}},
    draw(){
      const stone = '#2E2C30';
      let d = `<circle cx="212" cy="212" r="88" fill="${stone}" stroke="${INK}" stroke-width="${sw}" opacity="0.5"/>`;
      d += `<circle cx="200" cy="200" r="88" fill="${stone}" stroke="${INK}" stroke-width="${sw}"/>`;
      return svgWrap(d);
    }
  },

  teddy: {
    label:'Teddy bear', sides:['front'],
    area:{front:{x:158,y:216,w:84,h:74}},
    draw(c){
      const fur = c;
      let d = '';
      d += `<circle cx="142" cy="106" r="26" fill="${fur}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<circle cx="258" cy="106" r="26" fill="${fur}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<circle cx="142" cy="106" r="12" fill="${shade(fur)}"/>`;
      d += `<circle cx="258" cy="106" r="12" fill="${shade(fur)}"/>`;
      d += `<circle cx="200" cy="140" r="62" fill="${fur}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<ellipse cx="200" cy="162" rx="26" ry="20" fill="#F1E4CE" stroke="${INK}" stroke-width="${sw*0.7}"/>`;
      d += `<circle cx="178" cy="128" r="5" fill="${INK}"/><circle cx="222" cy="128" r="5" fill="${INK}"/>`;
      d += `<path d="M192 156 Q200 164 208 156" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
      d += `<ellipse cx="200" cy="150" rx="8" ry="6" fill="${INK}"/>`;
      d += `<ellipse cx="118" cy="252" rx="24" ry="42" fill="${fur}" stroke="${INK}" stroke-width="${sw}" transform="rotate(18 118 252)"/>`;
      d += `<ellipse cx="282" cy="252" rx="24" ry="42" fill="${fur}" stroke="${INK}" stroke-width="${sw}" transform="rotate(-18 282 252)"/>`;
      d += `<ellipse cx="154" cy="340" rx="30" ry="26" fill="${fur}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<ellipse cx="246" cy="340" rx="30" ry="26" fill="${fur}" stroke="${INK}" stroke-width="${sw}"/>`;
      d += P('M146 214 C160 200 240 200 254 214 L252 288 C252 300 240 306 200 306 C160 306 148 300 148 288 Z', '#FAFAF7'); // tee
      d += L('M162 208 L150 232'); d += L('M238 208 L250 232');
      return svgWrap(d);
    }
  },

  tote: {
    label:'Tote bag', sides:['front'],
    area:{front:{x:128,y:170,w:144,h:130}},
    draw(c){
      let d = L('M156 130 C156 84 176 64 200 64 C224 64 244 84 244 130', `stroke-width="${sw*1.6}"`);
      d += P('M112 130 L288 130 L300 330 L100 330 Z', c);
      d += SH('M100 330 L112 130 L140 130 L134 330 Z');
      d += L('M112 152 L288 152', 'stroke-dasharray="2 8"');
      return svgWrap(d);
    }
  },

  cushion: {
    label:'Cushion', sides:['front'],
    area:{front:{x:104,y:104,w:192,h:192}},
    draw(c){
      let d = P('M84 84 C140 68 260 68 316 84 C332 140 332 260 316 316 C260 332 140 332 84 316 C68 260 68 140 84 84 Z', c);
      d += SH('M84 84 C110 76 150 72 180 72 C130 120 108 220 116 308 C104 310 92 312 84 316 C68 260 68 140 84 84 Z');
      d += L('M96 96 C146 84 254 84 304 96 C316 146 316 254 304 304 C254 316 146 316 96 304 C84 254 84 146 96 96 Z', 'stroke-dasharray="2 9"');
      return svgWrap(d);
    }
  },

  banner: {
    label:'PVC banner', sides:['front'],
    area:{front:{x:64,y:136,w:272,h:128}},
    draw(c){
      let d = P('M40 120 L360 120 L360 280 L40 280 Z', c);
      d += L('M56 136 L344 136 L344 264 L56 264 Z', 'stroke-dasharray="3 8" opacity="0.5"');
      const grom = (x,y)=>`<circle cx="${x}" cy="${y}" r="9" fill="#FAFAF7" stroke="${INK}" stroke-width="${sw*0.7}"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${INK}" stroke-width="3"/>`;
      d += grom(58,138)+grom(200,138)+grom(342,138)+grom(58,262)+grom(200,262)+grom(342,262);
      return svgWrap(d);
    }
  },

  sign: {
    label:'ACM sign', sides:['front'],
    area:{front:{x:80,y:110,w:240,h:180}},
    draw(c, side, opts={}){
      const r = opts.rounded ? 22 : 4;
      let d = `<rect x="64" y="94" width="272" height="212" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>`;
      if(opts.rounded){
        d += L('M64 200 C150 186 250 186 336 200', 'opacity="0.25"');
      } else {
        const screw=(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="#d7d6d0" stroke="${INK}" stroke-width="3"/><path d="M${x-4} ${y} L${x+4} ${y} M${x} ${y-4} L${x} ${y+4}" stroke="${INK}" stroke-width="2.5"/>`;
        d += screw(82,112)+screw(318,112)+screw(82,288)+screw(318,288);
      }
      return svgWrap(d);
    }
  },

  sticker: {
    label:'Sticker', sides:['front'],
    area:{front:{x:110,y:110,w:180,h:180}},
    draw(){
      let d = `<rect x="96" y="96" width="208" height="208" rx="30" fill="#FAFAF7" stroke="${INK}" stroke-width="${sw}"/>`;
      d += `<rect x="88" y="88" width="208" height="208" rx="30" fill="none" stroke="${INK}" stroke-width="${sw*0.6}" opacity="0.3"/>`;
      d += P('M304 236 L304 304 L236 304 C262 292 292 262 304 236 Z', '#e7e6e2');
      return svgWrap(d);
    }
  }
};

export function chips(x1,y1,x2,y2){
  // small light nicks along slate edges for texture
  return `<path d="M${x1+30} ${y1} l14 6 l14 -6 M${x2-70} ${y1+2} l12 5 l12 -5 M${x1} ${y1+60} l6 12 l-6 12 M${x2} ${y2-80} l-6 12 l6 12" fill="none" stroke="#55525A" stroke-width="4" stroke-linecap="round"/>`;
}
export function shade(hex){
  // darken a hex colour ~14%
  const n = parseInt(hex.slice(1),16);
  const f = v => Math.max(0, Math.round(v*0.86));
  return '#'+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

export const GARMENT = [
  {name:'White', hex:'#F4F3EE'}, {name:'Black', hex:'#26242A'},
  {name:'Heather', hex:'#B9B7B0'}, {name:'Navy', hex:'#22304E'},
  {name:'Red', hex:'#D64545'}, {name:'Pink', hex:'#F2A9C6'},
  {name:'Sky', hex:'#9AD4EA'}, {name:'Sand', hex:'#E4D6B0'}
];
export const WORK = [
  {name:'Black', hex:'#26242A'}, {name:'Navy', hex:'#22304E'},
  {name:'Grey', hex:'#7A7873'}, {name:'Royal', hex:'#2456B8'},
  {name:'Bottle', hex:'#1F5C3F'}, {name:'Red', hex:'#C23B3B'}
];
export const HIVIS = [ {name:'Hi-Vis Yellow', hex:'#EFE81C'}, {name:'Hi-Vis Orange', hex:'#F97D2B'} ];
export const FUR = [ {name:'Honey', hex:'#D9A867'}, {name:'Brown', hex:'#9C6B3F'}, {name:'Grey', hex:'#A9A6A0'}, {name:'Cream', hex:'#EFE6D3'} ];
export const FACE = [ {name:'White', hex:'#F7F6F2'}, {name:'Yellow', hex:'#FFD100'}, {name:'Cyan', hex:'#8FD9F2'}, {name:'Ink', hex:'#1C1B1F'}, {name:'Red', hex:'#D64545'} ];
export const NAT = [ {name:'Natural', hex:'#E9DFC8'}, {name:'Black', hex:'#26242A'}, {name:'Navy', hex:'#22304E'} ];

export const ADULT = ['S','M','L','XL','2XL'];
export const KIDS = ['3-4','5-6','7-8','9-11','12-13'];

export const COLLECTIONS = {
  kids:     {name:'Kids',                 blurb:'Little tees, big opinions. Names, numbers and drawings welcome.'},
  hoodies:  {name:'Hoodies & Sweats',     blurb:'Heavyweight blanks with your artwork, front chest and full back.'},
  hats:     {name:'Hats & Caps',          blurb:'Embroidered, never ironed-on.'},
  gifting:  {name:'Gifting',              blurb:'One-offs for people who already have everything.'},
  slates:   {name:'Photo Slates',         blurb:'Your best photo, printed straight onto real stone.'},
  glassware:{name:'Glassware & Mugs',     blurb:'Pints, gin glasses and morning mugs with names, dates and in-jokes.'},
  workwear: {name:'Workwear',             blurb:'Kit for the crew — logo front chest, full back, or both.'},
  banners:  {name:'Banners & Signs',      blurb:'PVC banners, ACM signs, magnets and stickers by the metre.'}
};

export const PRODUCTS = [
  {id:'kid-tee', name:'Kids Classic Tee', price:12, mock:'tee', tags:['kids'], colors:GARMENT, sizes:KIDS, desc:'Soft cotton tee, printed front and back if you like. Draw it, scan it, wear it.'},
  {id:'kid-hoodie', name:'Kids Pullover Hoodie', price:22, mock:'hoodie', tags:['kids','hoodies'], colors:GARMENT, sizes:KIDS, desc:'Cosy pullover with a kangaroo pocket. Survives school, mostly.'},
  {id:'teddy', name:'Printed Teddy Bear', price:18, mock:'teddy', tags:['kids','gifting'], colors:FUR, sizes:null, desc:'A proper soft teddy wearing a tee printed with your design. New-baby classic.'},
  {id:'hoodie', name:'Heavyweight Hoodie', price:30, mock:'hoodie', tags:['hoodies'], colors:GARMENT, sizes:ADULT, desc:'350gsm brushed-back fleece. Front chest and full back print included.'},
  {id:'ziphood', name:'Zip-Through Hoodie', price:34, mock:'hoodie', mockOpts:{zip:true}, tags:['hoodies','workwear'], colors:WORK, sizes:ADULT, desc:'Full zip, two pockets, your logo. The site-to-pub layer.'},
  {id:'crew', name:'Crewneck Sweatshirt', price:26, mock:'crew', tags:['hoodies'], colors:GARMENT, sizes:ADULT, desc:'Clean crew neck, ribbed cuffs and hem. Prints beautifully big.'},
  {id:'cap', name:'Structured Snapback', price:14, mock:'cap', tags:['hats'], colors:WORK, sizes:null, desc:'Six-panel cap with your design stitched or pressed on the front panel.'},
  {id:'beanie', name:'Cuffed Beanie', price:12, mock:'beanie', tags:['hats','workwear'], colors:WORK, sizes:null, desc:'Double-knit cuff with your logo front and centre. Cornwall-proof.'},
  {id:'bucket', name:'Bucket Hat', price:16, mock:'bucket', tags:['hats'], colors:GARMENT, sizes:null, desc:'Festival-grade bucket with a printed front crown.'},
  {id:'mug', name:'Classic Photo Mug', price:10, mock:'mug', tags:['gifting','glassware'], colors:null, sizes:null, desc:'11oz ceramic, dishwasher safe. Photos, names, terrible jokes — all welcome.'},
  {id:'tote', name:'Canvas Tote', price:12, mock:'tote', tags:['gifting'], colors:NAT, sizes:null, desc:'Heavy cotton canvas with long handles and your artwork front and centre.'},
  {id:'cushion', name:'Printed Cushion', price:20, mock:'cushion', tags:['gifting'], colors:FACE, sizes:null, desc:'45 × 45 cm cushion with a full-face print. Insert included.'},
  {id:'coaster', name:'Slate Coaster Set (4)', price:14, mock:'coaster', tags:['gifting','slates'], colors:null, sizes:null, desc:'Four round slate coasters, each printed with your design. Feet included.'},
  {id:'slate-sq', name:'Medium Square Slate', price:17.5, sale:15, mock:'slate', mockOpts:{slateShape:'sq'}, tags:['slates','gifting'], colors:null, sizes:null, desc:'14 × 14 cm gloss slate with your photo edge to edge. Stand included. Gift of the month.'},
  {id:'slate-wide', name:'Large Panoramic Slate', price:24, mock:'slate', mockOpts:{slateShape:'wide'}, tags:['slates'], colors:null, sizes:null, desc:'30 × 20 cm landscape slate — made for beach panoramas and dog portraits.'},
  {id:'slate-heart', name:'Heart Slate', price:18, mock:'slate', mockOpts:{slateShape:'heart'}, tags:['slates','gifting'], colors:null, sizes:null, desc:'Heart-shaped slate with your photo printed to the edge. Anniversary insurance.'},
  {id:'pint', name:'Printed Pint Glass', price:11, mock:'pint', tags:['glassware'], colors:null, sizes:null, desc:'A proper pint with a name, date or crest printed on the front.'},
  {id:'stem', name:'Stemmed Gin Glass', price:13, mock:'stem', tags:['glassware','gifting'], colors:null, sizes:null, desc:'Balloon gin glass, printed. Add a name and it becomes theirs forever.'},
  {id:'polo', name:'Work Polo', price:16, mock:'polo', tags:['workwear'], colors:WORK, sizes:ADULT, desc:'Hardwearing pique polo, logo on the chest. The uniform staple.'},
  {id:'work-tee', name:'Work Tee', price:11, mock:'tee', tags:['workwear'], colors:WORK, sizes:ADULT, desc:'Heavy cotton tee with front chest and full back print. Order by the armful.'},
  {id:'softshell', name:'Softshell Jacket', price:38, mock:'softshell', tags:['workwear'], colors:WORK, sizes:ADULT, desc:'Windproof, shower-resistant, embroidered chest logo and full back print.'},
  {id:'hivis', name:'Hi-Vis Vest', price:13, mock:'hivis', tags:['workwear'], colors:HIVIS, sizes:ADULT, desc:'EN ISO 20471 vest with your company name across the back.'},
  {id:'banner', name:'PVC Banner', price:25, mock:'banner', tags:['banners'], colors:FACE, sizes:['1 m','2 m','3 m'], sizePrices:{'1 m':25,'2 m':40,'3 m':55}, desc:'440gsm PVC with hemmed edges and brass eyelets. Design the whole face below.'},
  {id:'sign', name:'ACM Sign Board', price:30, mock:'sign', tags:['banners'], colors:FACE, sizes:['A2','A1'], sizePrices:{'A2':30,'A1':45}, desc:'Rigid aluminium composite sign, printed and ready to fix. Screw caps included.'},
  {id:'magnet', name:'Vehicle Magnet Pair', price:28, mock:'sign', mockOpts:{rounded:true}, tags:['banners','workwear'], colors:FACE, sizes:null, desc:'Two 60 × 30 cm magnetic panels — turn any van into the work van.'},
  {id:'sticker', name:'Die-Cut Stickers (per metre)', price:18, mock:'sticker', tags:['banners'], colors:null, sizes:null, desc:'A metre of weatherproof vinyl stickers in your design. Tools, kits, laptops.'}
];
export const prodById = id => PRODUCTS.find(p => p.id === id);

export const FONTS = {anton:"'Anton',sans-serif", archivo:"'Archivo',sans-serif", mono:"'IBM Plex Mono',monospace", script:"'Caveat',cursive"};
export const TEXTINKS = ['#111013','#FAFAF7','#00A8E1','#E5087E','#FFD100'];
export const BIGAREA = ['slate','banner','sign','cushion','sticker','coaster'];

export const PRINT_LOCS = [
  {id:'left-chest',   label:'Left Chest',   side:'front', x:-22, y:-16, scale:0.50, mm:100, surcharge:2.50},
  {id:'right-chest',  label:'Right Chest',  side:'front', x: 22, y:-16, scale:0.50, mm:100, surcharge:2.50},
  {id:'centre-front', label:'Large Front',  side:'front', x:  0, y:  0, scale:1.05, mm:300, surcharge:5.00},
  {id:'xl-front',     label:'XL Front',     side:'front', x:  0, y:  0, scale:1.30, mm:500, surcharge:10.00},
  {id:'left-sleeve',  label:'Left Sleeve',  side:'front', x:-35, y:  2, scale:0.45, mm:100, surcharge:2.50},
  {id:'right-sleeve', label:'Right Sleeve', side:'front', x: 35, y:  2, scale:0.45, mm:100, surcharge:2.50},
  {id:'large-back',   label:'Large Back',   side:'back',  x:  0, y:  0, scale:1.05, mm:300, surcharge:5.00},
  {id:'xl-back',      label:'XL Back',      side:'back',  x:  0, y:  0, scale:1.30, mm:500, surcharge:10.00},
];
export const LOC_STANDARD = {id:'standard', label:'Standard', side:'front', x:0, y:0, scale:1, mm:0, surcharge:0};
export const locById = id => PRINT_LOCS.find(l => l.id === id) || LOC_STANDARD;

export const PRINT_TYPES = [
  {id:'digital',    label:'Digital Print', surcharge:0},
  {id:'embroidery', label:'Embroidery',    surcharge:1.50}
];

export const ICONS = {
  kids:`<svg viewBox="0 0 48 48"><path d="M17 10l-8 5 3 7 4-2v16h16V20l4 2 3-7-8-5c-1.5 2.5-4 4-7 4s-5.5-1.5-7-4z"/><path d="M20 26l2 2 4-5"/></svg>`,
  hoodies:`<svg viewBox="0 0 48 48"><path d="M16 12l-9 5 3 8 4-2v15h20V23l4 2 3-8-9-5"/><path d="M16 12c0-4 3.5-6 8-6s8 2 8 6c0 3-3 5-8 5s-8-2-8-5z"/><path d="M21 17v6M27 17v6"/><path d="M18 30h12v8H18z"/></svg>`,
  hats:`<svg viewBox="0 0 48 48"><path d="M10 26c0-8 6-14 14-14s14 6 14 14v3H10v-3z"/><path d="M10 29h24l8 4-2 4-30-3"/><circle cx="24" cy="12" r="1.5"/><path d="M24 12v6"/></svg>`,
  gifting:`<svg viewBox="0 0 48 48"><path d="M8 20h32v6H8z"/><path d="M11 26h26v14H11z"/><path d="M24 20v20"/><path d="M24 20c-6 0-9-2-9-5s2-4 4-4c4 0 5 5 5 9zM24 20c6 0 9-2 9-5s-2-4-4-4c-4 0-5 5-5 9z"/></svg>`,
  slates:`<svg viewBox="0 0 48 48"><path d="M9 9h30v26H9z"/><path d="M13 28l7-8 5 5 4-4 6 7"/><circle cx="18" cy="16" r="2.5"/><path d="M17 35l-4 6M31 35l4 6"/></svg>`,
  glassware:`<svg viewBox="0 0 48 48"><path d="M14 7h14l-2 34h-10z"/><path d="M15 15h12"/><circle cx="20" cy="24" r="1.4"/><circle cx="23" cy="31" r="1.4"/><path d="M32 18h5c3 0 4 2 4 4s-1 4-4 4h-4"/><path d="M28 14h6l-1 22h-6"/></svg>`,
  workwear:`<svg viewBox="0 0 48 48"><path d="M17 8l-4 3 2 30h18l2-30-4-3c-2 3-5 4-7 4s-5-1-7-4z"/><path d="M15 22h18M15 32h18"/><path d="M24 12v29"/></svg>`,
  banners:`<svg viewBox="0 0 48 48"><path d="M6 14h36v20H6z"/><circle cx="10" cy="18" r="1.6"/><circle cx="38" cy="18" r="1.6"/><circle cx="10" cy="30" r="1.6"/><circle cx="38" cy="30" r="1.6"/><path d="M15 24h18" stroke-dasharray="2 4"/></svg>`
};
export const FLOODS = ['var(--tint-c)','var(--tint-m)','var(--tint-y)'];

export const BREAKS = [{min:25, off:.15}, {min:10, off:.10}, {min:5, off:.05}];
export const breakFor = q => { for(const b of BREAKS) if(q >= b.min) return b.off; return 0; };

export let REVIEWS = {};

export const CLIPARTS = [
 {name:'Star',   svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="${c}" d="M100 12l26 56 62 8-45 43 11 61-54-29-54 29 11-61-45-43 62-8z"/></svg>`},
 {name:'Heart',  svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="${c}" d="M100 178C56 144 22 112 22 76c0-26 20-44 44-44 14 0 27 7 34 18 7-11 20-18 34-18 24 0 44 18 44 44 0 36-34 68-78 102z"/></svg>`},
 {name:'Bolt',   svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="${c}" d="M116 10L40 112h44l-14 78 90-114h-48z"/></svg>`},
 {name:'Wave',   svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round" d="M14 70c22-24 42-24 62 0s42 24 62 0 34-20 48-6M14 130c22-24 42-24 62 0s42 24 62 0 34-20 48-6"/></svg>`},
 {name:'Paw',    svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="${c}"><ellipse cx="60" cy="58" rx="19" ry="25"/><ellipse cx="140" cy="58" rx="19" ry="25"/><ellipse cx="25" cy="104" rx="16" ry="21"/><ellipse cx="175" cy="104" rx="16" ry="21"/><path d="M100 92c30 0 56 26 56 52 0 22-16 34-34 30-10-2-15-6-22-6s-12 4-22 6c-18 4-34-8-34-30 0-26 26-52 56-52z"/></g></svg>`},
 {name:'Anchor', svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="38" r="18"/><path d="M100 56v112M60 92h80"/><path d="M30 122c6 36 34 58 70 58s64-22 70-58l-26 10M30 122l26 10"/></g></svg>`},
 {name:'Smiley', svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="82" fill="none" stroke="${c}" stroke-width="14"/><circle cx="72" cy="82" r="10" fill="${c}"/><circle cx="128" cy="82" r="10" fill="${c}"/><path d="M60 122c12 20 28 28 40 28s28-8 40-28" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/></svg>`},
 {name:'Sun',    svg:c=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="40" fill="${c}"/><g stroke="${c}" stroke-width="12" stroke-linecap="round"><path d="M100 20v22M100 158v22M20 100h22M158 100h22M43 43l16 16M141 141l16 16M157 43l-16 16M59 141l-16 16"/></g></svg>`}
];

export const SEEDREV = {
 'slate-sq':[{n:'Megan T',s:5,t:'Photo of our wedding day on real stone — the colours came out unreal.'},{n:'Dan P',s:5,t:'Bought it for my mum. She cried. Ten out of ten.'},{n:'Chloe R',s:4,t:'Lovely gloss finish, and the stand is sturdier than I expected.'}],
 'hoodie':[{n:'Jake M',s:5,t:'Heavy, warm, and the print is still crisp after a dozen washes.'},{n:'Sophie L',s:4,t:'Runs slightly big — perfect if you like it baggy.'}],
 'mug':[{n:'Ellie W',s:5,t:'My dog\u2019s face on a mug. Best tenner I\u2019ve ever spent.'},{n:'Rob H',s:4,t:'Print wraps round nicely and the handle side stays clear.'}],
 'teddy':[{n:'Hannah B',s:5,t:'New-baby gift sorted. The little printed tee is adorable.'},{n:'Owen C',s:5,t:'Proper quality bear, not a cheap claw-machine one.'}],
 'banner':[{n:'Cornish Roofing Co',s:5,t:'Two-metre banner for the yard — bold print and proper brass eyelets.'},{n:'Tamsin F',s:4,t:'Birthday banner survived a full week of rain outside.'}],
 'polo':[{n:'JB Landscapes',s:5,t:'Ordered eight with our logo. The stitching is spot on.'},{n:'Mark D',s:4,t:'Smart and comfortable, and the colour matches our van.'}],
 'cap':[{n:'Lewis G',s:5,t:'Embroidery beats a pressed print on caps every single time.'}],
 'pint':[{n:'Katie S',s:5,t:'Best-man gift — the printed crest looks class in the pub.'}]
};

export function ratingFor(pid){
  const arr = [...(SEEDREV[pid] || []), ...(REVIEWS[pid] || [])];
  if(!arr.length) return null;
  return {avg: arr.reduce((n,r) => n + r.s, 0) / arr.length, count: arr.length};
}

export function starsHTML(avg){
  const f = Math.max(0, Math.min(5, Math.round(avg)));
  return '★'.repeat(f) + (f < 5 ? `<span class="dim">${'★'.repeat(5 - f)}</span>` : '');
}
