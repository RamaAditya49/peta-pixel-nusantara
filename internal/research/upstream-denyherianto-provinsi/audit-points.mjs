// 1) point checks for known islands; 2) Papua split cross-check against GADM-derived ADM2 (read-only).
import { readFileSync } from 'node:fs';
const [UP, GADM] = process.argv.slice(2);
const prov = JSON.parse(readFileSync(`${UP}/GeoJSON/indonesia-38-provinces.geojson`, 'utf8')).features;
const polys = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const inRing = (pt, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const inFeat = (pt, f) => polys(f.geometry).some(p => inRing(pt, p[0]) && !p.slice(1).some(h => inRing(pt, h)));
const km = (a, b) => { const R = 6371, t = Math.PI / 180; const d = Math.sin((b[1] - a[1]) * t / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin((b[0] - a[0]) * t / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(d)); };
const nearest = pt => { let best = [Infinity, null]; for (const f of prov) for (const p of polys(f.geometry)) for (const r of p) for (const v of r) { const d = km(pt, v); if (d < best[0]) best = [d, f.properties.PROVINSI]; } return best; };
const POINTS = [
  ['Pulau Tidore (Kota Tidore Kepulauan)', 127.40, 0.68],
  ['Pulau Ternate (Kota Ternate)', 127.33, 0.80],
  ['Pulau Dullah (Kota Tual)', 132.74, -5.58],
  ['Kepulauan Seribu: Pulau Pramuka', 106.615, -5.745],
  ['Nusa Penida (Klungkung)', 115.51, -8.73],
  ['Pulau Weh / Sabang', 95.32, 5.86],
  ['Pulau Breueh (Aceh Besar)', 95.08, 5.69],
  ['Pulau Binongko (Wakatobi)', 124.03, -5.95],
  ['Pulau Salibabu (Talaud)', 126.68, 3.96],
  ['Pulau Bunyu (Bulungan)', 117.84, 3.48],
  ['Pulau Sapudi (Sumenep)', 114.33, -7.10],
  ['Pulau Batam (Kota Batam)', 104.03, 1.08],
  ['Pulau Bintan', 104.48, 1.05],
  ['Pulau Selayar', 120.47, -6.30],
  ['Pulau Siau (Sitaro)', 125.40, 2.73],
  ['Pulau Banggai (Banggai Laut)', 123.55, -1.60],
  ['Pulau Supiori', 135.60, -0.73],
  ['Pulau Nias (Nias Selatan, Telukdalam)', 97.80, 0.57],
  ['Pulau Tarakan', 117.60, 3.33],
  ['Pulau Karimun Besar', 103.42, 1.05],
];
console.log('POINT CHECKS (inside any upstream province polygon?)');
for (const [n, x, y] of POINTS) { const hit = prov.find(f => inFeat([x, y], f)); const [d, p] = hit ? [0, hit.properties.PROVINSI] : nearest([x, y]); console.log(`${hit ? 'IN ' : 'OUT'} ${n} @${x},${y} -> ${hit ? p : `nearest vertex ${d.toFixed(1)} km (${p})`}`); }

// GADM-derived ADM2 cross-check
const t = JSON.parse(readFileSync(GADM, 'utf8'));
const o = t.objects[Object.keys(t.objects)[0]];
const hasT = !!t.transform; const [sx, sy] = hasT ? t.transform.scale : [1, 1], [tx, ty] = hasT ? t.transform.translate : [0, 0];
const arcs = t.arcs.map(arc => { if (!hasT) return arc; let x = 0, y = 0; return arc.map(d => { x += d[0]; y += d[1]; return [x * sx + tx, y * sy + ty]; }); });
const ring = list => { const c = []; list.forEach((ai, k) => { const a = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse(); for (let i = k ? 1 : 0; i < a.length; i++) c.push(a[i]); }); return c; };
const want = ['Teluk Bintuni', 'Nduga', 'Lanny Jaya', 'Kulon Progo', 'Tangerang Selatan'];
console.log('\nGADM-derived ADM2: share of each unit (by sample grid) inside each upstream province');
for (const g of o.geometries) {
  const name = g.properties.NAME_2; if (!want.includes(name)) continue;
  const P = g.type === 'Polygon' ? [g.arcs.map(ring)] : g.arcs.map(p => p.map(ring));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; P.forEach(p => p[0].forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }));
  const step = Math.max(x1 - x0, y1 - y0) / 120; const cnt = {}; let tot = 0;
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) {
    if (!P.some(p => inRing([x, y], p[0]))) continue; tot++;
    const f = prov.find(f => inFeat([x, y], f)); const k = f ? f.properties.PROVINSI : '(none)'; cnt[k] = (cnt[k] || 0) + 1;
  }
  console.log(name, '|', g.properties.NAME_1, '|', Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${(100 * v / tot).toFixed(1)}%`).join(', '));
}
