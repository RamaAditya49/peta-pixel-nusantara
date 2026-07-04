#!/usr/bin/env node
/**
 * Peta Pixel Nusantara — rasterizer
 * ---------------------------------
 * Membaca batas wilayah (TopoJSON) dari ../sources/ dan menuliskan grid pixel
 * ../data/peta-hd-data.js (window.PETA_HD) + ../data/peta-hd-data.json.
 *
 * Jalankan:  node tools/rasterize.mjs [lebarGrid=1600]
 *
 * Provinsi & kabupaten/kota dirender ke grid ukuran & bounds yang sama sehingga
 * SELARAS; tiap kabupaten di-assign ke provinsi 38 (terkini) lewat majority-vote
 * geografis (akurat di klaster padat mis. Jakarta), dengan fallback nama GADM.
 *
 * Catatan: field `m` (metrik/kepadatan per provinsi) diisi 0 di sini — ikat data
 * Anda sendiri (member, populasi, dsb) ke prov[].m untuk pewarnaan kepadatan.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const W = parseInt(process.argv[2] || '1600', 10);
const SEA8 = 255, SEA16 = 65535;

const readJSON = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

// ---- TopoJSON decode (delta-encoded arcs + quantized transform) ----
function decode(topo) {
  const hasT = !!topo.transform;
  const sx = hasT ? topo.transform.scale[0] : 1, sy = hasT ? topo.transform.scale[1] : 1;
  const tx = hasT ? topo.transform.translate[0] : 0, ty = hasT ? topo.transform.translate[1] : 0;
  const arcs = topo.arcs.map(arc => {
    if (hasT) { let x = 0, y = 0; const p = []; for (const d of arc) { x += d[0]; y += d[1]; p.push([x * sx + tx, y * sy + ty]); } return p; }
    return arc.map(d => [d[0], d[1]]);
  });
  const ring = (list) => { const c = []; list.forEach((ai, k) => { let a = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse(); const s = k === 0 ? 0 : 1; for (let i = s; i < a.length; i++) c.push(a[i]); }); return c; };
  const polys = (g) => g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(pp => pp.map(ring)) : [];
  const obj = topo.objects[Object.keys(topo.objects)[0]];
  return obj.geometries.map(g => ({ props: g.properties, polys: polys(g) }));
}

const provGeoms = decode(readJSON('sources/indonesia-38-provinces.topo.json')).map(g => ({ name: g.props.PROVINSI, polys: g.polys }));
let kabGeoms = decode(readJSON('sources/indonesia-topojson-city-regency.json')).map(g => {
  const isKota = g.props.TYPE_2 === 'Kotamadya' || g.props.ENGTYPE_2 === 'Municipality';
  const junk = g.props.TYPE_2 === 'Unknown' || /^n\.a/i.test(g.props.NAME_2 || '');
  let name = g.props.NAME_2 || ''; if (isKota) name = name.replace(/^Kota\s+/i, '');
  return { name, prov1: g.props.NAME_1, type: isKota ? 'Kota' : 'Kabupaten', junk, polys: g.polys };
});
kabGeoms = kabGeoms.filter(k => !k.junk);

const provNames = provGeoms.map(g => g.name);
const nameIdx = {}; provNames.forEach((n, i) => nameIdx[n] = i);

// ---- shared bounds (WGS84) ----
let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
const scan = gs => gs.forEach(g => g.polys.forEach(rr => rr.forEach(r => r.forEach(([lo, la]) => {
  if (lo < lonMin) lonMin = lo; if (lo > lonMax) lonMax = lo; if (la < latMin) latMin = la; if (la > latMax) latMax = la;
}))));
scan(provGeoms); scan(kabGeoms);
const H = Math.round(W * (latMax - latMin) / (lonMax - lonMin));
const gx = lo => (lo - lonMin) / (lonMax - lonMin) * (W - 1);
const gy = la => (latMax - la) / (latMax - latMin) * (H - 1);

// ---- scanline polygon fill ----
function raster(geoms, grid, SEA) {
  geoms.forEach((g, idx) => g.polys.forEach(rings => {
    const R = rings.map(r => r.map(([lo, la]) => [gx(lo), gy(la)]));
    let yMin = Infinity, yMax = -Infinity; R.forEach(r => r.forEach(p => { if (p[1] < yMin) yMin = p[1]; if (p[1] > yMax) yMax = p[1]; }));
    const y0 = Math.max(0, Math.floor(yMin)), y1 = Math.min(H - 1, Math.ceil(yMax));
    for (let y = y0; y <= y1; y++) {
      const yc = y + 0.5, xs = [];
      R.forEach(r => { for (let i = 0, n = r.length; i < n; i++) { const a = r[i], b = r[(i + 1) % n]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) { const t = (yc - a[1]) / (b[1] - a[1]); xs.push(a[0] + t * (b[0] - a[0])); } } });
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) { let ca = Math.ceil(xs[k] - 0.5), cb = Math.floor(xs[k + 1] - 0.5); if (ca < 0) ca = 0; if (cb > W - 1) cb = W - 1; for (let x = ca; x <= cb; x++) grid[y * W + x] = idx; }
    }
    // tandai sel-vertex agar pulau kecil / sliver tidak hilang
    R.forEach(r => r.forEach(p => { const xi = Math.round(p[0]), yi = Math.round(p[1]); if (xi >= 0 && xi < W && yi >= 0 && yi < H) { const o = yi * W + xi; if (grid[o] === SEA) grid[o] = idx; } }));
  }));
}
const PG = new Uint8Array(W * H).fill(SEA8); raster(provGeoms, PG, SEA8);
const KG = new Uint16Array(W * H).fill(SEA16); raster(kabGeoms, KG, SEA16);

// ---- kab -> province: majority vote over PG, fallback GADM NAME_1 ----
const NAME1 = { 'Aceh': 'Aceh', 'Bali': 'Bali', 'Bangka-Belitung': 'Kepulauan Bangka Belitung', 'Banten': 'Banten', 'Bengkulu': 'Bengkulu', 'Gorontalo': 'Gorontalo', 'Irian Jaya Barat': 'Papua Barat', 'Papua Barat': 'Papua Barat', 'Jakarta Raya': 'DKI Jakarta', 'Jambi': 'Jambi', 'Jawa Barat': 'Jawa Barat', 'Jawa Tengah': 'Jawa Tengah', 'Jawa Timur': 'Jawa Timur', 'Kalimantan Barat': 'Kalimantan Barat', 'Kalimantan Selatan': 'Kalimantan Selatan', 'Kalimantan Tengah': 'Kalimantan Tengah', 'Kalimantan Timur': 'Kalimantan Timur', 'Kalimantan Utara': 'Kalimantan Utara', 'Kepulauan Riau': 'Kepulauan Riau', 'Lampung': 'Lampung', 'Maluku': 'Maluku', 'Maluku Utara': 'Maluku Utara', 'Nusa Tenggara Barat': 'Nusa Tenggara Barat', 'Nusa Tenggara Timur': 'Nusa Tenggara Timur', 'Papua': 'Papua', 'Riau': 'Riau', 'Sulawesi Barat': 'Sulawesi Barat', 'Sulawesi Selatan': 'Sulawesi Selatan', 'Sulawesi Tengah': 'Sulawesi Tengah', 'Sulawesi Tenggara': 'Sulawesi Tenggara', 'Sulawesi Utara': 'Sulawesi Utara', 'Sumatera Barat': 'Sumatera Barat', 'Sumatera Selatan': 'Sumatera Selatan', 'Sumatera Utara': 'Sumatera Utara', 'Yogyakarta': 'Daerah Istimewa Yogyakarta' };
const votes = kabGeoms.map(() => ({}));
const st = kabGeoms.map(() => ({ x0: 1e9, y0: 1e9, x1: -1, y1: -1, sx: 0, sy: 0, a: 0 }));
for (let i = 0; i < KG.length; i++) {
  const kv = KG[i]; if (kv === SEA16) continue;
  const s = st[kv], x = i % W, y = (i / W) | 0;
  if (x < s.x0) s.x0 = x; if (x > s.x1) s.x1 = x; if (y < s.y0) s.y0 = y; if (y > s.y1) s.y1 = y; s.sx += x; s.sy += y; s.a++;
  const pv = PG[i]; if (pv !== SEA8) votes[kv][pv] = (votes[kv][pv] || 0) + 1;
}
const kab = kabGeoms.map((g, i) => {
  const v = votes[i]; let best = -1, bc = -1; for (const k in v) { if (v[k] > bc) { bc = v[k]; best = +k; } }
  if (best < 0) { const m = NAME1[g.prov1]; best = (m != null && nameIdx[m] != null) ? nameIdx[m] : 255; }
  const s = st[i];
  return { n: g.name, t: g.type, p: best, a: s.a, x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1, cx: s.a ? Math.round(s.sx / s.a) : 0, cy: s.a ? Math.round(s.sy / s.a) : 0 };
});

// ---- province metadata ----
const pst = provNames.map(() => ({ x0: 1e9, y0: 1e9, x1: -1, y1: -1, sx: 0, sy: 0, a: 0 }));
for (let i = 0; i < PG.length; i++) {
  const v = PG[i]; if (v === SEA8) continue; const s = pst[v], x = i % W, y = (i / W) | 0;
  if (x < s.x0) s.x0 = x; if (x > s.x1) s.x1 = x; if (y < s.y0) s.y0 = y; if (y > s.y1) s.y1 = y; s.sx += x; s.sy += y; s.a++;
}
const prov = provNames.map((n, i) => { const s = pst[i]; return { n, m: 0, a: s.a, x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1, cx: s.a ? Math.round(s.sx / s.a) : 0, cy: s.a ? Math.round(s.sy / s.a) : 0 }; });

const provKab = {}; kab.forEach((k, i) => { if (k.p === 255) return; (provKab[k.p] = provKab[k.p] || []).push(i); });

// ---- RLE ----
const rle = a => { const r = []; let c = a[0], n = 1; for (let i = 1; i < a.length; i++) { if (a[i] === c) n++; else { r.push(c, n); c = a[i]; n = 1; } } r.push(c, n); return r; };
const payload = { W, H, lonMin, lonMax, latMin, latMax, prov, kab, provKab, provRle: rle(PG), kabRle: rle(KG) };
const json = JSON.stringify(payload);

mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(join(ROOT, 'data/peta-hd-data.js'), 'window.PETA_HD=' + json + ';\n');
writeFileSync(join(ROOT, 'data/peta-hd-data.json'), json);

const kota = kab.filter(k => k.t === 'Kota').length;
console.log(`grid ${W}x${H} · ${prov.length} provinsi · ${kab.length} kab/kota (${kota} Kota + ${kab.length - kota} Kabupaten)`);
console.log(`ditulis: data/peta-hd-data.js (${Math.round(json.length / 1024)} KB) + .json`);
console.log('catatan: prov[].m = 0 — ikat metrik Anda sendiri untuk pewarnaan kepadatan.');
