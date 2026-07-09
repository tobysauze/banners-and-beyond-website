/* Generates public/sitemap.xml from the catalogue at build time.
   Run before `vite build` (see package.json). */
import { writeFileSync } from 'node:fs';
import { PRODUCTS, COLLECTIONS } from '../src/data.js';
import { SITE_URL } from '../src/config.js';

const staticPaths = ['/', '/shop', '/deals', '/bundle', '/contact', '/delivery', '/privacy'];
const collPaths = Object.keys(COLLECTIONS).map(id => `/collection/${id}`);
const prodPaths = PRODUCTS.map(p => `/product/${p.id}`);
const all = [...staticPaths, ...collPaths, ...prodPaths];

const urls = all.map(u => `  <url><loc>${SITE_URL}${encodeURI(u)}</loc></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml written: ${all.length} URLs`);
