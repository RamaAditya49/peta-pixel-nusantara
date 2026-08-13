/**
 * geoBoundaries IDN ADM2 tags 5 physical features (lakes, a reservoir, a forest)
 * as shapeType=ADM2. shapeISO is empty for every feature, so there is no metadata
 * to filter on — these are matched by stable shapeID, with a name pattern as a
 * second gate for future source releases.
 *
 * Shared by tools/rasterize.mjs (excludes them from ADM2, keeps water as a layer)
 * and tools/verify-data.mjs (fails if any slips back into the published units).
 */
export const WATER_IDS = new Set([
  '22746128B15758871990616', // Danau
  '22746128B58041142516585', // Danau Toba
  '22746128B76055711701199', // Waduk Cirata
  '22746128B86942252851890', // "Wadung Kedungombo" (typo in source; Waduk Kedungombo)
]);

export const NON_ADMIN_IDS = new Set([
  ...WATER_IDS,
  '22746128B69994664325988', // Hutan
]);

// No official kabupaten/kota name starts with these words.
export const NON_ADMIN_NAME = /^(Danau|Waduk|Wadung|Hutan|Bendungan|Situ|Rawa|Telaga|Laut)\b/i;

export const isNonAdmin = (code, name) => NON_ADMIN_IDS.has(code) || NON_ADMIN_NAME.test(name || '');
export const isWater = (code, name) => WATER_IDS.has(code) || /^(Danau|Waduk|Wadung|Bendungan|Situ|Telaga)\b/i.test(name || '');
