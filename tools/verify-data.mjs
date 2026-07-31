#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(ROOT, 'sources/geoBoundaries-IDN-ADM2_simplified.geojson');
const dataPath = join(ROOT, 'data/peta-hd-data.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${error.code === 'ENOENT' ? 'Missing file' : error instanceof SyntaxError ? 'Invalid JSON' : 'Cannot read file'}: ${path} (${error.message})`);
  }
}

if (!existsSync(sourcePath)) {
  fail('Missing geoBoundaries ADM2 source');
}

const source = readJSON(sourcePath);
if (source.type !== 'FeatureCollection') {
  fail('geoBoundaries ADM2 source must be a FeatureCollection');
}

if ((source.features || []).length < 514) {
  fail(`Expected at least 514 ADM2 features, found ${source.features?.length || 0}`);
}

const data = readJSON(dataPath);
if (!Array.isArray(data.prov) || !Array.isArray(data.kab) || !Array.isArray(data.provKab)) {
  fail('Generated data must contain prov, kab, and provKab arrays');
}

if (data.kab.length < 514) {
  fail(`Expected generated ADM2 data to include at least 514 units, found ${data.kab.length}`);
}

if (data.prov.length !== 38) {
  fail(`Expected 38 provinces, found ${data.prov.length}`);
}

const kota = data.kab.filter(k => k.t === 'Kota').length;
if (kota < 98) {
  fail(`Expected at least 98 city units, found ${kota}`);
}

const unassigned = data.kab.filter(k => k.p === 255).map(k => k.n);
if (unassigned.length) {
  fail(`Found unassigned ADM2 units: ${unassigned.slice(0, 12).join(', ')}`);
}
if (data.kab.some(k => !Number.isInteger(k.p) || k.p < 0 || k.p >= data.prov.length)) {
  fail('Found ADM2 units with an invalid parent province');
}

const codes = data.kab.map(k => k.c);
if (codes.some(code => typeof code !== 'string' || !code)) {
  fail('Every ADM2 unit must have a stable code');
}
if (new Set(codes).size !== codes.length) {
  fail('ADM2 codes must be unique');
}

const validRegion = r => [r.a, r.x0, r.y0, r.x1, r.y1, r.cx, r.cy].every(Number.isFinite)
  && r.a > 0 && r.x0 <= r.cx && r.cx <= r.x1 && r.y0 <= r.cy && r.cy <= r.y1;
if (!data.prov.every(validRegion) || !data.kab.every(validRegion)) {
  fail('Region metadata contains an invalid area, bounding box, or centroid');
}

if (data.provKab.length !== data.prov.length) {
  fail(`Expected provKab to contain ${data.prov.length} province entries, found ${data.provKab.length}`);
}
const indexedKab = data.provKab.flat();
if (indexedKab.length !== data.kab.length || new Set(indexedKab).size !== data.kab.length
  || indexedKab.some(i => !Number.isInteger(i) || i < 0 || i >= data.kab.length || !data.provKab[data.kab[i].p].includes(i))) {
  fail('provKab must index every ADM2 unit exactly once under its parent province');
}

function verifyRle(name, rle, sea, limit) {
  if (!Array.isArray(rle) || rle.length % 2) fail(`${name} must contain value/count pairs`);
  let cells = 0;
  for (let i = 0; i < rle.length; i += 2) {
    const value = rle[i], count = rle[i + 1];
    if (!Number.isInteger(value) || (value !== sea && (value < 0 || value >= limit))) fail(`${name} contains out-of-range value ${value}`);
    if (!Number.isInteger(count) || count <= 0) fail(`${name} contains invalid run length ${count}`);
    cells += count;
  }
  if (cells !== data.W * data.H) fail(`${name} covers ${cells} cells; expected ${data.W * data.H}`);
}

verifyRle('provRle', data.provRle, 255, data.prov.length);
verifyRle('kabRle', data.kabRle, 65535, data.kab.length);

console.log(`data ok: ${data.prov.length} provinces, ${data.kab.length} ADM2 units, ${kota} cities`);
console.log('source: geoBoundaries ADM2 (sources/geoBoundaries-IDN-ADM2_simplified.geojson)');
