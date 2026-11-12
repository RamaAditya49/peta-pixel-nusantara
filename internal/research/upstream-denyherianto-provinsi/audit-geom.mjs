// Audit geometry of upstream GeoJSON + TopoJSON (read-only, seconds).
import { readFileSync } from 'node:fs';
const DIR = process.argv[2];
const g = JSON.parse(readFileSync(`${DIR}/GeoJSON/indonesia-38-provinces.geojson`, 'utf8'));
const t = JSON.parse(readFileSync(`${DIR}/TopoJSON/indonesia-38-provinces.topo.json`, 'utf8'));

const signed = r => { let a = 0; for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return a / 2; };
const polysOf = geom => geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

// segment intersection (proper or touching, excluding shared endpoints of adjacent segments)
function segX(p1, p2, p3, p4) {
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function selfIntersections(r) {
  const n = r.length - 1; let hits = [];
  const segs = []; for (let i = 0; i < n; i++) { const a = r[i], b = r[i + 1]; segs.push([Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])]); }
  const order = [...segs.keys()].sort((i, j) => segs[i][0] - segs[j][0]);
  for (let ii = 0; ii < order.length; ii++) {
    const i = order[ii];
    for (let jj = ii + 1; jj < order.length; jj++) {
      const j = order[jj]; if (segs[j][0] > segs[i][1]) break;
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1) || (j === 0 && i === n - 1)) continue;
      if (segs[j][2] > segs[i][3] || segs[j][3] < segs[i][2]) continue;
      if (segX(r[i], r[i + 1], r[j], r[j + 1])) hits.push([r[i], r[j]]);
    }
  }
  return hits;
}

const rows = [];
let tot = { polys: 0, rings: 0, holes: 0, pts: 0, unclosed: 0, dupPts: 0, extCW: 0, extCCW: 0, holeCW: 0, holeCCW: 0, selfX: 0, tiny: 0 };
const precision = new Map();
for (const f of g.features) {
  const P = f.properties; const r = { name: P.PROVINSI, code: P.KODE_PROV, polys: 0, extCW: 0, extCCW: 0, holes: 0, selfX: 0, selfXAt: [], unclosed: 0, dup: 0 };
  for (const poly of polysOf(f.geometry)) {
    r.polys++; tot.polys++;
    poly.forEach((ring, k) => {
      tot.rings++; tot.pts += ring.length;
      for (const [x] of ring.slice(0, 3)) { const s = String(x).split('.')[1] || ''; precision.set(s.length, (precision.get(s.length) || 0) + 1); }
      const a = ring[0], b = ring[ring.length - 1];
      if (a[0] !== b[0] || a[1] !== b[1]) { r.unclosed++; tot.unclosed++; }
      for (let i = 1; i < ring.length; i++) if (ring[i][0] === ring[i - 1][0] && ring[i][1] === ring[i - 1][1]) { r.dup++; tot.dupPts++; }
      const s = signed(ring);
      if (k === 0) { if (s < 0) { r.extCW++; tot.extCW++; } else { r.extCCW++; tot.extCCW++; } if (Math.abs(s) < 1e-8) tot.tiny++; }
      else { r.holes++; tot.holes++; if (s < 0) tot.holeCW++; else tot.holeCCW++; }
      const sx = selfIntersections(ring); if (sx.length) { r.selfX += sx.length; tot.selfX += sx.length; r.selfXAt.push(...sx.slice(0, 2).map(h => h[0].map(v => +v.toFixed(5)))); }
    });
  }
  rows.push(r);
}
console.log('TOTAL', JSON.stringify(tot));
console.log('decimal places in coords (sample)', JSON.stringify([...precision.entries()].sort((a, b) => a[0] - b[0])));
for (const r of rows) if (r.extCW && r.extCCW || r.selfX || r.unclosed || r.dup) console.log(JSON.stringify(r));
console.log('provinces with CW exteriors only:', rows.filter(r => r.extCW && !r.extCCW).length, ' CCW only:', rows.filter(r => r.extCCW && !r.extCW).length, ' mixed:', rows.filter(r => r.extCW && r.extCCW).length);

// bbox
let b = [Infinity, Infinity, -Infinity, -Infinity];
for (const f of g.features) for (const p of polysOf(f.geometry)) for (const ring of p) for (const [x, y] of ring) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
console.log('geojson bbox', b.map(v => +v.toFixed(5)).join(','));

// TopoJSON: decode + compare with GeoJSON
const o = t.objects[Object.keys(t.objects)[0]];
const [sx, sy] = t.transform.scale, [tx, ty] = t.transform.translate;
const arcs = t.arcs.map(arc => { let x = 0, y = 0; return arc.map(d => { x += d[0]; y += d[1]; return [x * sx + tx, y * sy + ty]; }); });
const ring = list => { const c = []; list.forEach((ai, k) => { const a = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse(); for (let i = k ? 1 : 0; i < a.length; i++) c.push(a[i]); }); return c; };
let tExtCW = 0, tExtCCW = 0, tPts = 0, tSelfX = 0;
const topoArea = {}; const geoArea = {};
for (const geom of o.geometries) {
  const polys = geom.type === 'Polygon' ? [geom.arcs.map(ring)] : geom.arcs.map(p => p.map(ring));
  let A = 0;
  for (const p of polys) p.forEach((r, k) => { tPts += r.length; const s = signed(r); if (k === 0) { s < 0 ? tExtCW++ : tExtCCW++; } A += Math.abs(s) * (k ? -1 : 1); tSelfX += selfIntersections(r).length; });
  topoArea[geom.properties.PROVINSI] = A;
}
for (const f of g.features) { let A = 0; for (const p of polysOf(f.geometry)) p.forEach((r, k) => { A += Math.abs(signed(r)) * (k ? -1 : 1); }); geoArea[f.properties.PROVINSI] = A; }
console.log('topo', JSON.stringify({ geoms: o.geometries.length, arcs: t.arcs.length, pts: tPts, extCW: tExtCW, extCCW: tExtCCW, selfX: tSelfX }));
const diffs = Object.keys(geoArea).map(n => [n, +(100 * (topoArea[n] - geoArea[n]) / geoArea[n]).toFixed(2)]).filter(d => Math.abs(d[1]) > 1);
console.log('area diff topo vs geojson >1%:', JSON.stringify(diffs));
// smallest / largest by planar area
const byA = Object.entries(geoArea).sort((a, b) => a[1] - b[1]);
console.log('smallest', JSON.stringify(byA.slice(0, 3).map(([n, a]) => [n, +a.toFixed(4)])), 'largest', JSON.stringify(byA.slice(-3).map(([n, a]) => [n, +a.toFixed(3)])));
