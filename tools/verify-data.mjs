#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const sourcePath = join(ROOT, 'sources/geoBoundaries-IDN-ADM2_simplified.geojson');
const dataPath = join(ROOT, 'data/peta-hd-data.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  fail('Missing geoBoundaries ADM2 source');
}

const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
if (source.type !== 'FeatureCollection') {
  fail('geoBoundaries ADM2 source must be a FeatureCollection');
}

if ((source.features || []).length < 514) {
  fail(`Expected at least 514 ADM2 features, found ${source.features?.length || 0}`);
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
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

console.log(`data ok: ${data.prov.length} provinces, ${data.kab.length} ADM2 units, ${kota} cities`);
