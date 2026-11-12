// Compare upstream province polygons against geoBoundaries ADM2 + Kepmendagri 2025 list (read-only).
import { readFileSync } from 'node:fs';
const [UP, ADM2, WIL, Warg] = process.argv.slice(2);
const W = Number(Warg || 3000);
const prov = JSON.parse(readFileSync(`${UP}/GeoJSON/indonesia-38-provinces.geojson`, 'utf8')).features;
const adm2 = JSON.parse(readFileSync(ADM2, 'utf8')).features;
const NONADMIN = /^(danau|waduk|wadung|hutan)\b/i;

// official list
const sql = readFileSync(WIL, 'utf8');
const provName = {}; for (const m of sql.matchAll(/\('(\d{2})','([^']+)'\)/g)) provName[m[1]] = m[2];
const norm = s => s.toLowerCase().replace(/^(kabupaten|kab\.|kota administrasi|kota adm\.|kota)\s+/, '').replace(/[^a-z]/g, '');
const official = {}; // key type|norm -> {code, name}
for (const m of sql.matchAll(/\('(\d{2})\.(\d{2})','([^']+)'\)/g)) {
  const name = m[3]; const type = /^Kota/i.test(name) ? 'Kota' : 'Kabupaten';
  official[`${type}|${norm(name)}`] = { code: `${m[1]}.${m[2]}`, prov: m[1], name };
}
const ALIAS = {}; // filled after first run if needed

const polys = g => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
for (const f of [...prov, ...adm2]) for (const p of polys(f.geometry)) for (const r of p) for (const [x, y] of r) { lonMin = Math.min(lonMin, x); lonMax = Math.max(lonMax, x); latMin = Math.min(latMin, y); latMax = Math.max(latMax, y); }
const H = Math.round(W * (latMax - latMin) / (lonMax - lonMin));
const gx = lo => (lo - lonMin) / (lonMax - lonMin) * (W - 1), gy = la => (latMax - la) / (latMax - latMin) * (H - 1);
function raster(feats, grid, cnt) {
  feats.forEach((f, idx) => polys(f.geometry).forEach(rings => {
    const R = rings.map(r => r.map(([a, b]) => [gx(a), gy(b)]));
    let y0 = Infinity, y1 = -Infinity; R.forEach(r => r.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }));
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5, xs = [];
      R.forEach(r => { for (let i = 0; i < r.length - 1; i++) { const a = r[i], b = r[i + 1]; if (a[1] === b[1]) continue; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); } });
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); x++) { const o = y * W + x; if (cnt) cnt[o]++; grid[o] = idx; }
    }
  }));
}
const SEA = 65535;
const PG = new Uint16Array(W * H).fill(SEA), PC = new Uint8Array(W * H);
raster(prov, PG, PC);
const units = adm2.filter(f => f.properties.shapeType === 'ADM2' && !NONADMIN.test(f.properties.shapeName || ''));
const KG = new Uint16Array(W * H).fill(SEA);
raster(units, KG, null);

// overlaps between provinces
let overlap = 0; const overlapPairs = {};
for (let i = 0; i < PC.length; i++) if (PC[i] > 1) overlap++;
let provLand = 0; for (let i = 0; i < PG.length; i++) if (PG[i] !== SEA) provLand++;
let kabLand = 0, kabNoProv = 0, provNoKab = 0;
for (let i = 0; i < KG.length; i++) { if (KG[i] !== SEA) { kabLand++; if (PG[i] === SEA) kabNoProv++; } else if (PG[i] !== SEA) provNoKab++; }
console.log(JSON.stringify({ W, H, cellKm: +((lonMax - lonMin) / W * 111).toFixed(2), provLand, kabLand, overlapCells: overlap, adm2CellsWithoutProvince: kabNoProv, pctAdm2Uncovered: +(100 * kabNoProv / kabLand).toFixed(2), provCellsWithoutAdm2: provNoKab }));

// per unit votes
const votes = units.map(() => new Map()), area = units.map(() => 0);
for (let i = 0; i < KG.length; i++) { const k = KG[i]; if (k === SEA) continue; area[k]++; const p = PG[i]; if (p !== SEA) votes[k].set(p, (votes[k].get(p) || 0) + 1); }
const res = units.map((f, i) => {
  const raw = f.properties.shapeName; const type = /^Kota\s+/i.test(raw) && !/^Kota\s+Baru$/i.test(raw) ? 'Kota' : 'Kabupaten';
  const key = `${type}|${norm(ALIAS[raw] || raw)}`; const off = official[key];
  const v = [...votes[i].entries()].sort((a, b) => b[1] - a[1]); const tot = v.reduce((s, e) => s + e[1], 0);
  const win = v[0] ? prov[v[0][0]].properties : null;
  return { name: raw, id: f.properties.shapeID, type, area: area[i], covered: tot, coverPct: area[i] ? +(100 * tot / area[i]).toFixed(1) : 0,
    win: win ? win.PROVINSI : null, winPct: tot ? +(100 * v[0][1] / tot).toFixed(1) : 0,
    split: v.slice(0, 3).map(([p, c]) => `${prov[p].properties.PROVINSI}:${(100 * c / tot).toFixed(1)}%`).join(', '),
    officialProv: off ? provName[off.prov] : null, officialCode: off ? off.code : null };
});
const unmatched = res.filter(r => !r.officialProv);
console.log('unmatched names:', unmatched.length, JSON.stringify(unmatched.map(r => r.name)));
const canon = s => s === 'Daerah Khusus Ibukota Jakarta' ? 'DKI Jakarta' : s;
const wrong = res.filter(r => r.officialProv && r.win && canon(r.officialProv) !== r.win);
console.log(`\nWRONG PROVINCE (majority of unit area falls in another province): ${wrong.length}`);
for (const r of wrong) console.log(JSON.stringify(r));
const noVote = res.filter(r => !r.win);
console.log(`\nNO PROVINCE AT ALL (unit fully outside every province polygon): ${noVote.length}`);
for (const r of noVote) console.log(JSON.stringify(r));
const lowCover = res.filter(r => r.win && r.coverPct < 80).sort((a, b) => a.coverPct - b.coverPct);
console.log(`\nLOW COVERAGE (<80% of unit area inside any province): ${lowCover.length}`);
for (const r of lowCover) console.log(JSON.stringify({ name: r.name, prov: r.officialProv, area: r.area, coverPct: r.coverPct }));
const split = res.filter(r => r.win && !wrong.includes(r) && r.winPct < 90 && r.area >= 30).sort((a, b) => a.winPct - b.winPct);
console.log(`\nSPLIT (correct winner but <90% share, area>=30 cells): ${split.length}`);
for (const r of split) console.log(JSON.stringify({ name: r.name, prov: r.officialProv, area: r.area, split: r.split }));
// per-province uncovered summary
const byProv = {};
for (const r of res) { if (!r.officialProv) continue; const p = canon(r.officialProv); byProv[p] ??= { area: 0, covered: 0 }; byProv[p].area += r.area; byProv[p].covered += r.covered; }
console.log('\nADM2 area NOT covered by province layer, by official province (top 12):');
console.log(Object.entries(byProv).map(([p, o]) => [p, o.area - o.covered, +(100 * (o.area - o.covered) / o.area).toFixed(1)]).sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x.join(' | ')).join('\n'));

// connected components of ADM2 land that no province polygon covers (missing islands)
const cellKm2 = ((lonMax - lonMin) / W * 111.32) * ((latMax - latMin) / H * 110.57);
const seen = new Uint8Array(W * H); const comps = [];
for (let i = 0; i < KG.length; i++) {
  if (seen[i] || KG[i] === SEA || PG[i] !== SEA) continue;
  const q = [i]; seen[i] = 1; let n = 0, sx = 0, sy = 0, touchesProv = false; const unitsHit = new Map();
  while (q.length) {
    const c = q.pop(); n++; const x = c % W, y = (c / W) | 0; sx += x; sy += y; unitsHit.set(KG[c], (unitsHit.get(KG[c]) || 0) + 1);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const o = ny * W + nx;
      if (PG[o] !== SEA) touchesProv = true;
      if (!seen[o] && KG[o] !== SEA && PG[o] === SEA) { seen[o] = 1; q.push(o); }
    }
  }
  const cx = sx / n, cy = sy / n;
  const lon = lonMin + cx / (W - 1) * (lonMax - lonMin), lat = latMax - cy / (H - 1) * (latMax - latMin);
  const u = [...unitsHit.entries()].sort((a, b) => b[1] - a[1])[0][0];
  comps.push({ n, km2: Math.round(n * cellKm2), lon: +lon.toFixed(3), lat: +lat.toFixed(3), unit: units[u].properties.shapeName, isolated: !touchesProv });
}
const isolated = comps.filter(c => c.isolated).sort((a, b) => b.n - a.n);
console.log(`\nMISSING ISLANDS: ${isolated.length} ADM2 land patches with no province cell next to them; total ≈ ${isolated.reduce((s, c) => s + c.km2, 0)} km². Largest 30:`);
for (const c of isolated.slice(0, 30)) console.log(JSON.stringify(c));
console.log(`edge slivers (touch a province, coarse coastline): ${comps.length - isolated.length} patches ≈ ${comps.filter(c => !c.isolated).reduce((s, c) => s + c.km2, 0)} km²`);
console.log('cell km2', cellKm2.toFixed(2));
