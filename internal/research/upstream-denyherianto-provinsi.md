---
type: research
topic: upstream-denyherianto-provinsi
status: current        # current | stale
created: 2026-11-12
updated: 2026-11-12
---

# Riset: masalah data provinsi upstream denyherianto

## Pertanyaan

- Bug dan masalah apa yang ada di data provinsi `denyherianto/indonesia-geojson-topojson-maps-with-38-provinces`?
- Masalah mana yang layak kita laporkan ke upstream sebagai isu atau PR?
- Perbaikan mana yang bisa kita kirim sendiri dengan diff kecil?

## Ringkasan temuan

| ID | Temuan | Tingkat | Yakin | Bentuk kontribusi |
|----|--------|---------|-------|-------------------|
| U-01 | `KODE_PROV` 4 provinsi Papua baru salah. Kode 91 dipakai 4 kali, kode 92 dipakai 2 kali. | Tinggi | Tinggi | PR siap (`pr-kode-papua.diff`) |
| U-02 | `id` 6 provinsi Papua berisi `91-A`…`92-B`. Dokumen upstream bilang `id` sama dengan `KODE_PROV`. | Sedang | Tinggi | Ikut PR U-01 |
| U-03 | Pulau berpenduduk hilang. Kota Tual dan Kepulauan Seribu tidak punya poligon sama sekali. | Sedang | Tinggi | Isu |
| U-04 | Batas Papua Barat/Papua Barat Daya dan Papua Pegunungan/Papua Tengah bergeser dari batas ADM2. | Sedang | Sedang | Isu |
| U-05 | `SOURCE.md` dirujuk tetapi tidak ada. GeoJSON terbalik di D3. Lokasi `id` tidak jelas di README. | Rendah | Tinggi | Isu |

Data kita sendiri tidak berubah oleh temuan ini. Rasterizer kita hanya memakai `PROVINSI`, bukan `KODE_PROV` — sumber: `tools/rasterize.mjs:82`.

Masalah yang sudah kita tangani di kode sendiri: Kepulauan Seribu tidak mendapat suara provinsi, jadi `tools/rasterize.mjs:148` memaksa `'Kepulauan Seribu': 'DKI Jakarta'`. Itu gejala U-03.

## Detail

### Versi yang diaudit

| Hal | Nilai |
|-----|-------|
| Commit upstream | `80aa4a9` (2025-12-18), push terakhir 2025-12-18 |
| Isu dan PR upstream | 0 isu, 0 PR (cek 2026-11-12) |
| `TopoJSON/indonesia-38-provinces.topo.json` | sha256 `6c22e92f…9230`, sama persis dengan `sources/indonesia-38-provinces.topo.json` kita |
| Lisensi | Data CC-BY-4.0 (`DATA_LICENSE.md`), dokumen dan skrip MIT |

### U-01 dan U-02: kode dan id provinsi Papua

Daftar resmi Kepmendagri No 300.2.2-2138 Tahun 2025 (via `cahyadsn/wilayah`, `db/wilayah.sql`) [S2]:
93 Papua Selatan, 94 Papua Tengah, 95 Papua Pegunungan, 96 Papua Barat Daya.

| PROVINSI | `KODE_PROV` upstream | `id` upstream | Kode resmi |
|----------|----------------------|---------------|------------|
| Papua | 91 | `91-A` | 91 |
| Papua Pegunungan | 91 | `91-B` | 95 |
| Papua Selatan | 91 | `91-C` | 93 |
| Papua Tengah | 91 | `91-D` | 94 |
| Papua Barat | 92 | `92-A` | 92 |
| Papua Barat Daya | 92 | `92-B` | 96 |

- `id` di GeoJSON ada di `properties.id`, bukan `Feature.id`. Di TopoJSON, `id` ada di objek geometri.
- `topojson-client` menyalin `id` geometri ke `feature.id`. Pengguna D3 mendapat `91-D`, bukan `94`.
- Akibat: join data per kode provinsi menggabungkan 4 provinsi ke satu baris "91".
- 32 provinsi lain cocok dengan daftar resmi, baik nama maupun kode.

Patch: `upstream-denyherianto-provinsi/patch-codes.mjs`. Diff: `upstream-denyherianto-provinsi/pr-kode-papua.diff`.
Diff mengubah 20 baris di tiap berkas. Diff hanya menyentuh nilai `KODE_PROV` dan `id`. Format berkas tetap sama.

Hasil validasi patch (2026-11-12):

```text
changed features: geojson 6, topojson 6
PASS 38 features
PASS KODE_PROV unique (geojson)
PASS KODE_PROV unique (topojson)
PASS geojson properties.id == KODE_PROV
PASS topojson geometry id == KODE_PROV
PASS same name->code in both files
git apply --check → APPLY_OK_IDENTICAL
```

### U-03: pulau dan wilayah yang hilang

Metode: rasterisasi poligon provinsi upstream dan geoBoundaries ADM2 ke grid yang sama, 3000 × 1114 sel, sekitar 1,7 km per sel (2,90 km²).
Skrip: `upstream-denyherianto-provinsi/audit-coverage.mjs`.

| Ukuran | Nilai |
|--------|-------|
| Sel daratan ADM2 tanpa provinsi | 19.357 sel, 2,96% daratan ADM2 |
| Bidang ADM2 terpisah tanpa provinsi di sekitarnya | 1.003 bidang, ±10.694 km² |
| Unit ADM2 tanpa satu sel provinsi pun | Kota Tual, Kepulauan Seribu |
| Unit ADM2 dengan cakupan < 80% | 33 unit |

Area ADM2 yang tidak tercakup, per provinsi resmi:

| Provinsi | Sel | ±km² | % daratan ADM2 |
|----------|-----|------|----------------|
| Maluku | 1.886 | 5.470 | 13,1 |
| Maluku Utara | 1.470 | 4.260 | 13,6 |
| Sulawesi Tengah | 1.118 | 3.240 | 5,3 |
| Kepulauan Riau | 1.080 | 3.130 | 38,0 |

Cek titik (point-in-polygon, `audit-points.mjs` dan `audit-islands.mjs`):

| Pulau | Unit | Titik di dalam provinsi | Titik provinsi terdekat |
|-------|------|-------------------------|-------------------------|
| Pulau Tidore | Kota Tidore Kepulauan | 0 dari 3 | 11,9 km |
| Pulau Dullah | Kota Tual | 0 dari 3 | 3,6 km |
| Kepulauan Seribu | Kab. Adm. Kepulauan Seribu | 0 dari 2 | 30,6 km |
| Pulau Breueh | Aceh Besar | 0 dari 2 | 22,1 km |
| Pulau Salibabu | Kepulauan Talaud | 0 dari 2 | 4,5 km |
| Pulau Bunyu | Bulungan | 0 dari 1 | 20,6 km |
| Pulau Sapudi | Sumenep | 0 dari 2 | 26,5 km |
| Pulau Binongko | Wakatobi | 0 dari 2 | 20,4 km |
| Nusa Penida | Klungkung | 1 dari 4 | — (terpotong) |
| Pulau Karimun Besar | Karimun | 1 dari 2 | — (terpotong) |

Pulau yang ada: Ternate, Weh, Batam, Bintan, Selayar, Siau, Banggai, Supiori, Nias, Tarakan.

Penyebab yang paling mungkin: simplifikasi berat. Seluruh berkas hanya punya 207 poligon dan 2.673 titik.

### U-04: batas provinsi Papua bergeser

Pembagian suara sel per unit ADM2 (`audit-coverage.mjs`, cross-check `audit-points.mjs` dengan ADM2 turunan GADM):

| Unit | Provinsi resmi | geoBoundaries ADM2 | GADM 2.8 ADM2 |
|------|----------------|--------------------|---------------|
| Teluk Bintuni | Papua Barat | Papua Barat 84,3%, Papua Barat Daya 15,7% | Papua Barat 79,3%, Papua Barat Daya 14,8%, tanpa provinsi 5,8% |
| Nduga | Papua Pegunungan | Papua Pegunungan 78,3%, Papua Tengah 18,7%, Papua Selatan 3,0% | unit belum ada di GADM 2.8 |
| Lanny Jaya | Papua Pegunungan | Papua Pegunungan 81,1%, Papua Tengah 18,9% | unit belum ada di GADM 2.8 |

- Bagian Teluk Bintuni di dalam poligon Papua Barat Daya: ±3.260 km². Dua sumber ADM2 independen setuju.
- Untuk Nduga dan Lanny Jaya, hanya geoBoundaries yang bisa dipakai. Keyakinan: sedang.
- Wilayah Papua punya sengketa batas kabupaten. Isu harus meminta cek ke BIG, bukan menuduh salah.
- Tidak ada unit ADM2 yang mayoritas luasnya jatuh ke provinsi yang salah (0 dari 507 unit yang cocok namanya).
- Selisih kecil di Jakarta, Tangerang Selatan, dan Kulon Progo berasal dari simplifikasi. Kita tidak melaporkannya terpisah.

### U-05: dokumentasi

- `DATA_LICENSE.md` dan `.github/PULL_REQUEST_TEMPLATE.md` merujuk `SOURCE.md`. Berkas itu tidak ada di repo.
- Exterior ring GeoJSON berlawanan jarum jam (RFC 7946). Exterior ring TopoJSON searah jarum jam.
- Uji di `rama-tuf` dengan `d3-geo@3.1.1` dan `topojson-client@3.1.0`:

```text
GeoJSON  inverted features in d3: 38 / 38  fitSize bounds: 100,0,700,600 scale=95
TopoJSON inverted features in d3: 0 / 38  fitSize bounds: 0,152,800,448 scale=1000
```

- Artinya: contoh D3 di README benar karena memakai TopoJSON. GeoJSON yang dipakai langsung di D3 terbalik dan menutupi seluruh dunia.
- README dan `SCHEMA.md` menulis "GeoJSON also includes `id`". Nilai itu ada di `properties.id`, bukan `Feature.id`.

### Cek yang lulus (tidak dilaporkan)

| Cek | Hasil |
|-----|-------|
| Jumlah fitur | 38 di GeoJSON dan TopoJSON |
| Ring tidak tertutup | 0 |
| Titik duplikat berurutan | 0 |
| Self-intersection | 0 |
| Hole | 0 |
| Tumpang tindih antarprovinsi | 3 sel (noise rasterisasi) |
| Selisih luas GeoJSON vs TopoJSON | < 1% untuk semua provinsi |
| Nama provinsi | 37 sama dengan daftar resmi. "DKI Jakarta" ditulis singkat. |

### Tidak dilaporkan, dengan alasan

| Hal | Alasan |
|-----|--------|
| Nama "DKI Jakarta" vs "Daerah Khusus Ibukota Jakarta" | Bentuk singkat umum dipakai. Status Jakarta sedang berubah (UU 2/2024). |
| GeoJSON 254 KB karena pretty-print, minified 72 KB | Pilihan gaya maintainer, bukan bug. |
| Nama ADM2 lama di geoBoundaries (Toba Samosir, Mamuju Utara, Maluku Tenggara Barat, dst.) | Masalah geoBoundaries, bukan repo denyherianto. |

## Draf kontribusi (bahasa Inggris, siap tempel)

Urutan kirim: PR-1, lalu ISSUE-2, ISSUE-3, ISSUE-4. Semua memakai template upstream.

### PR-1 — `Fix KODE_PROV and id for the new Papua-region provinces`

Branch fork: `fix/papua-province-codes`. Diff: `upstream-denyherianto-provinsi/pr-kode-papua.diff`.

```markdown
## Summary

Four new Papua-region provinces use the code of their parent province.
`KODE_PROV` 91 occurs 4 times and 92 occurs 2 times, so a join by code merges different provinces.
This PR sets the official Kemendagri codes and makes `id` equal to `KODE_PROV`, as `SCHEMA.md` states.

| PROVINSI | KODE_PROV before | id before | KODE_PROV / id after |
|---|---|---|---|
| Papua | 91 | 91-A | 91 |
| Papua Pegunungan | 91 | 91-B | 95 |
| Papua Selatan | 91 | 91-C | 93 |
| Papua Tengah | 91 | 91-D | 94 |
| Papua Barat | 92 | 92-A | 92 |
| Papua Barat Daya | 92 | 92-B | 96 |

Only these values change. Geometry, key order, and formatting stay the same (20 lines in each file).

Note: D3 users who keyed data on `91-A`…`92-B` must change to the numeric codes.

## Type of change

- [x] Data fix (properties)
- [ ] Data fix (geometry)
- [ ] Documentation
- [ ] Other

## Validation

- [x] I verified the dataset still contains 38 provinces/features.
- [x] I kept `PROVINSI` / `KODE_PROV` consistent.
- [ ] If geometry changed, I documented the source and tooling in `SOURCE.md`. (No geometry change.)

Checks after the change:
- 38 features in both files.
- 38 unique `KODE_PROV` values in both files.
- GeoJSON `properties.id` equals `KODE_PROV` for every feature.
- TopoJSON geometry `id` equals `KODE_PROV` for every geometry.
- The same name maps to the same code in both files.

## References

- Kepmendagri No 300.2.2-2138 Tahun 2025, as compiled in https://github.com/cahyadsn/wilayah (`db/wilayah.sql`): 93 Papua Selatan, 94 Papua Tengah, 95 Papua Pegunungan, 96 Papua Barat Daya.
```

### ISSUE-2 — `Data: some islands and two whole kabupaten/kota have no polygon`

Template: Data problem report → "Geometry/boundary issue".

```markdown
### Affected province(s)
Maluku (81), Maluku Utara (82), DKI Jakarta (31), Kepulauan Riau (21), Aceh (11), Sulawesi Utara (71), Kalimantan Utara (65), Jawa Timur (35), Sulawesi Tenggara (74)

### What's wrong?
Some inhabited islands have no polygon in either file. Two whole ADM2 units fall outside every province:

- Kota Tual (Maluku): Pulau Dullah is not in the Maluku polygon.
- Kabupaten Administrasi Kepulauan Seribu (DKI Jakarta): no island is in the DKI Jakarta polygon.

Other islands with no polygon (point-in-polygon test on the GeoJSON file):

| Island | Kabupaten/kota | Distance to nearest province vertex |
|---|---|---|
| Pulau Tidore | Kota Tidore Kepulauan | 11.9 km |
| Pulau Breueh | Aceh Besar | 22.1 km |
| Pulau Salibabu | Kepulauan Talaud | 4.5 km |
| Pulau Bunyu | Bulungan | 20.6 km |
| Pulau Sapudi | Sumenep | 26.5 km |
| Pulau Binongko | Wakatobi | 20.4 km |

Nusa Penida and Pulau Karimun Besar are only partly present.

We compared the province layer with geoBoundaries IDN ADM2 on a 3000 × 1114 grid (about 1.7 km per cell).
About 1,000 detached land patches (about 10,700 km²) are outside every province polygon.
The largest gaps are Maluku (about 13% of its ADM2 land), Maluku Utara (about 14%), and Kepulauan Riau (about 38%).

The files have 207 polygons and 2,673 vertices in total, so heavy simplification is the probable cause.

### References
- geoBoundaries IDN ADM2 (CC BY 4.0): https://www.geoboundaries.org/
- Kepmendagri No 300.2.2-2138 Tahun 2025 (Kota Tual 81.72, Kepulauan Seribu 31.01) via https://github.com/cahyadsn/wilayah

### Extra context (optional)
Suggested fix: keep islands above a minimum area when you simplify (for example, mapshaper `-simplify keep-shapes`).
If the small size is intentional, please document the simplification level in the README, so users know that small islands are not included.
```

### ISSUE-3 — `Data: Papua-region province borders differ from kabupaten borders (Teluk Bintuni, Nduga, Lanny Jaya)`

Template: Data problem report → "Geometry/boundary issue".

```markdown
### Affected province(s)
Papua Barat (92), Papua Barat Daya (96), Papua Pegunungan (95), Papua Tengah (94)

### What's wrong?
Each new Papua-region province is a group of whole kabupaten. Its border must follow kabupaten borders.
In this dataset, large parts of 3 kabupaten fall inside a neighbouring province:

| Kabupaten | Official province | Share inside the official province | Share inside another province |
|---|---|---|---|
| Teluk Bintuni | Papua Barat | 84.3% | 15.7% in Papua Barat Daya (about 3,260 km²) |
| Nduga | Papua Pegunungan | 78.3% | 18.7% in Papua Tengah, 3.0% in Papua Selatan |
| Lanny Jaya | Papua Pegunungan | 81.1% | 18.9% in Papua Tengah |

Method: we rasterized the province GeoJSON and geoBoundaries IDN ADM2 to the same grid (about 1.7 km per cell).
For Teluk Bintuni, a second source (GADM 2.8 ADM2) gives almost the same result: 14.8% inside Papua Barat Daya.

Some kabupaten borders in Papua are disputed. Please check these three borders against the BIG administrative boundary data.

### References
- UU No 14, 15, 16 Tahun 2022 (Papua Selatan, Papua Tengah, Papua Pegunungan) and UU No 29 Tahun 2022 (Papua Barat Daya) list the kabupaten of each province.
- geoBoundaries IDN ADM2: https://www.geoboundaries.org/
- Indonesia Geospatial Portal (BIG): https://tanahair.indonesia.go.id/
```

### ISSUE-4 — `Docs: SOURCE.md is missing; GeoJSON winding in D3; location of id`

Template: Feature request or blank issue.

```markdown
Three small documentation problems:

1. `DATA_LICENSE.md` and the PR template refer to `SOURCE.md`, but the repository has no `SOURCE.md`.
   Users cannot see the provenance of the boundaries or the upstream terms.
   Please add `SOURCE.md` with the source dataset, its license, and the tools you used.

2. The GeoJSON exterior rings are counter-clockwise (RFC 7946). The TopoJSON exterior rings are clockwise.
   D3 expects clockwise rings, so the GeoJSON file renders inverted in D3.
   Test with d3-geo 3.1.1: `geoArea()` is larger than 2π for 38 of 38 GeoJSON features and 0 of 38 TopoJSON features.
   With the GeoJSON file, `geoMercator().fitSize([800, 600], ...)` gives scale 95 (whole world) instead of 1000.
   Suggested README note: "For D3, use the TopoJSON file, or rewind the GeoJSON first (for example, with `@turf/rewind`)."

3. README and `SCHEMA.md` say "GeoJSON features also include `id`". The value is in `properties.id`, not in the Feature `id` member.
   Please write `properties.id`, or move the value to the Feature `id` member.
```

## Keputusan dari riset ini

- Kirim 1 PR (U-01, U-02) dan 3 isu (U-03, U-04, U-05) ke upstream. Rama setuju. Semua terkirim 2026-11-12:

| Draf | Tautan | Status 2026-11-12 |
|------|--------|-------------------|
| PR-1 (U-01, U-02) | https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/pull/1 | OPEN, mergeable |
| ISSUE-2 (U-03) | https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/issues/2 | OPEN |
| ISSUE-3 (U-04) | https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/issues/3 | OPEN |
| ISSUE-4 (U-05) | https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/issues/4 | OPEN |

- Fork: `RamaAditya49/indonesia-geojson-topojson-maps-with-38-provinces`, branch `fix/papua-province-codes`, commit `230d613`.
- Repo kita tetap memakai `sources/indonesia-38-provinces.topo.json` versi sekarang. Kita tidak memakai `KODE_PROV`, jadi PR-1 tidak memengaruhi data kita.

## Pertanyaan terbuka

- TBD: Kalau upstream menerima PR-1, apakah kita ikut memperbarui `sources/indonesia-38-provinces.topo.json` agar salinan kita sama dengan upstream?
- TBD: Kalau upstream memperbaiki pulau yang hilang (U-03), apakah kita hapus fallback `ADM2_PROV` di `tools/rasterize.mjs:148`?

## Sumber

- [S1] Repo upstream denyherianto — https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces (commit `80aa4a9`) — dicek 2026-11-12
- [S2] cahyadsn/wilayah, `db/wilayah.sql` (Kepmendagri No 300.2.2-2138 Tahun 2025) — https://github.com/cahyadsn/wilayah — dicek 2026-11-12
- [S3] geoBoundaries IDN ADM2 simplified — `sources/geoBoundaries-IDN-ADM2_simplified.geojson` — dicek 2026-11-12
- [S4] GADM 2.8 ADM2 turunan tvalentius — `sources/indonesia-topojson-city-regency.json` — dicek 2026-11-12
- [S5] Skrip audit — `internal/research/upstream-denyherianto-provinsi/` — dijalankan 2026-11-12

Cara ulang audit (lokal, beberapa detik; uji D3 dijalankan di `rama-tuf`):

```bash
U=<folder salinan upstream>; R=internal/research/upstream-denyherianto-provinsi
node $R/audit-geom.mjs $U
node --max-old-space-size=2048 $R/audit-coverage.mjs $U sources/geoBoundaries-IDN-ADM2_simplified.geojson <wilayah.sql> 3000
node $R/audit-points.mjs $U sources/indonesia-topojson-city-regency.json
node $R/audit-islands.mjs $U/GeoJSON/indonesia-38-provinces.geojson
node $R/patch-codes.mjs $U <folder output>
```

## Riwayat

- 2026-11-12: riset dibuat. Audit upstream commit `80aa4a9`. 5 temuan, 1 PR siap, 3 draf isu.
- 2026-11-12: PR #1 dan isu #2, #3, #4 terkirim ke upstream atas persetujuan Rama.
