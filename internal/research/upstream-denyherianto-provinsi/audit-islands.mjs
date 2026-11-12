import { readFileSync } from 'node:fs';
const prov = JSON.parse(readFileSync(process.argv[2], 'utf8')).features;
const polys = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const inRing = (pt, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const hit = pt => (prov.find(f => polys(f.geometry).some(p => inRing(pt, p[0]))) || { properties: { PROVINSI: '-' } }).properties.PROVINSI;
const S = { 'Nusa Penida': [[115.45,-8.72],[115.52,-8.74],[115.58,-8.78],[115.50,-8.80]], 'Tidore': [[127.38,0.66],[127.42,0.70],[127.40,0.64]], 'Dullah/Tual': [[132.72,-5.56],[132.76,-5.52],[132.73,-5.62]], 'Nias main (Gunungsitoli)': [[97.61,1.29],[97.55,1.10],[97.70,0.80]], 'Breueh': [[95.06,5.71],[95.10,5.66]], 'Karimun Besar': [[103.40,1.05],[103.38,1.00]], 'Salibabu': [[126.70,3.95],[126.66,4.00]], 'Kepulauan Seribu (Untung Jawa..Pramuka)': [[106.70,-5.97],[106.57,-5.80]], 'Bunyu': [[117.85,3.48]], 'Sapudi': [[114.33,-7.10],[114.30,-7.08]], 'Binongko': [[124.03,-5.95],[124.06,-5.97]] };
for (const [n, pts] of Object.entries(S)) console.log(n.padEnd(42), pts.map(p => `${p.join(',')}=>${hit(p)}`).join('  '));
