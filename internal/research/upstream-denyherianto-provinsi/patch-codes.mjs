// Minimal text patch: official Kepmendagri codes for the 4 new Papua provinces, ids aligned with KODE_PROV.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const [SRC, OUT] = process.argv.slice(2);
const CODE = { 'Papua Selatan': '93', 'Papua Tengah': '94', 'Papua Pegunungan': '95', 'Papua Barat Daya': '96', 'Papua': '91', 'Papua Barat': '92' };

// GeoJSON: lines  "id": "91", / "KODE_PROV": "91", / "PROVINSI": "<name>"
let gl = readFileSync(`${SRC}/GeoJSON/indonesia-38-provinces.geojson`, 'utf8').split('\n');
let gn = 0;
gl.forEach((line, i) => {
  const m = line.match(/"PROVINSI": "([^"]+)"/); if (!m || !(m[1] in CODE)) return;
  const c = CODE[m[1]];
  const before = [gl[i - 2], gl[i - 1]];
  gl[i - 2] = gl[i - 2].replace(/"id": "[^"]+"/, `"id": "${c}"`);
  gl[i - 1] = gl[i - 1].replace(/"KODE_PROV": "\d+"/, `"KODE_PROV": "${c}"`);
  if (gl[i - 2] !== before[0] || gl[i - 1] !== before[1]) gn++;
});
// TopoJSON: lines  "KODE_PROV": "91", / "PROVINSI": "<name>" / }, / "id": "91-D"
let tl = readFileSync(`${SRC}/TopoJSON/indonesia-38-provinces.topo.json`, 'utf8').split('\n');
let tn = 0;
tl.forEach((line, i) => {
  const m = line.match(/"PROVINSI": "([^"]+)"/); if (!m || !(m[1] in CODE)) return;
  const c = CODE[m[1]];
  const before = [tl[i - 1], tl[i + 2]];
  tl[i - 1] = tl[i - 1].replace(/"KODE_PROV": "\d+"/, `"KODE_PROV": "${c}"`);
  if (!/"id":/.test(tl[i + 2])) throw new Error(`unexpected TopoJSON layout near line ${i + 1}`);
  tl[i + 2] = tl[i + 2].replace(/"id": "[^"]+"/, `"id": "${c}"`);
  if (tl[i - 1] !== before[0] || tl[i + 2] !== before[1]) tn++;
});
mkdirSync(`${OUT}/GeoJSON`, { recursive: true }); mkdirSync(`${OUT}/TopoJSON`, { recursive: true });
writeFileSync(`${OUT}/GeoJSON/indonesia-38-provinces.geojson`, gl.join('\n'));
writeFileSync(`${OUT}/TopoJSON/indonesia-38-provinces.topo.json`, tl.join('\n'));
console.log(`changed features: geojson ${gn}, topojson ${tn}`);

// validate
const g = JSON.parse(gl.join('\n')), t = JSON.parse(tl.join('\n'));
const tg = t.objects['indonesia-38-prov-topo'].geometries;
const gc = g.features.map(f => f.properties.KODE_PROV), tc = tg.map(x => x.properties.KODE_PROV);
const ok = [
  ['38 features', g.features.length === 38 && tg.length === 38],
  ['KODE_PROV unique (geojson)', new Set(gc).size === 38],
  ['KODE_PROV unique (topojson)', new Set(tc).size === 38],
  ['geojson properties.id == KODE_PROV', g.features.every(f => f.properties.id === f.properties.KODE_PROV)],
  ['topojson geometry id == KODE_PROV', tg.every(x => x.id === x.properties.KODE_PROV)],
  ['same name->code in both files', g.features.every(f => tg.find(x => x.properties.PROVINSI === f.properties.PROVINSI)?.properties.KODE_PROV === f.properties.KODE_PROV)],
];
for (const [n, v] of ok) console.log(v ? 'PASS' : 'FAIL', n);
