# Peta Pixel Nusantara

Peta **8-bit interaktif Indonesia** — dari tampilan nasional (38 provinsi) → zoom → **kabupaten/kota** asli, sebagai region pixel yang tetap tajam di zoom berapa pun. Batas wilayah nyata **dirasterisasi jadi grid pixel**, jadi terlihat retro, offline, dan gampang diimplementasi ulang di platform mana pun.

**Owner:** [Rama Aditya](https://github.com/RamaAditya49/) · **Lisensi:** kode MIT · data CC-BY-4.0 / GADM ([ATTRIBUTION.md](ATTRIBUTION.md)) · **Asal:** dibuat untuk [aiclub.id](https://aiclub.id).

## Quick start

- **Lihat demo:** buka `index.html` di browser — tanpa build, tanpa server.
- **Pakai datanya:** muat `data/peta-hd-data.js` (`window.PETA_HD`) via `<script>`, atau `data/peta-hd-data.json` untuk platform lain.
- **Regenerasi / upgrade data:** `node tools/rasterize.mjs` (Node 18+) — baca dari `sources/`, tulis ke `data/`.

## Struktur repo

```
peta-pixel-nusantara/
├─ index.html                              demo interaktif (vanilla, no build)
├─ data/
│  ├─ peta-hd-data.js                      window.PETA_HD (untuk <script>)
│  └─ peta-hd-data.json                    JSON murni (platform lain)
├─ sources/
│  ├─ indonesia-38-provinces.topo.json     batas provinsi (adm1)
│  └─ indonesia-topojson-city-regency.json batas kabupaten/kota (adm2)
├─ tools/
│  └─ rasterize.mjs                        generator grid: sources → data
├─ README.md
├─ ATTRIBUTION.md
└─ LICENSE
```

---

> **Peta 8-bit interaktif Indonesia**: dari tampilan nasional (38 provinsi) → zoom → **kabupaten/kota** asli, semuanya sebagai region pixel yang tetap tajam di zoom berapa pun.
>
> **TL;DR (EN):** A pixel-art interactive map of Indonesia. Real administrative boundaries (provinces + regencies/cities) are **rasterized into a pixel grid**, RLE-compressed, and rendered on a canvas with nearest-neighbor scaling — so it looks 8-bit, stays razor-sharp at any zoom, works offline, and is trivial to reimplement on any platform that can draw rectangles.

- **Pemilik / Owner:** Rama Aditya — <https://github.com/RamaAditya49/>
- **Dipakai untuk:** landing utama **[aiclub.id](https://aiclub.id)** — komunitas AI gratis se-Nusantara.
- **Lisensi:** kode `MIT` · data batas wilayah `CC-BY-4.0` (lihat [Atribusi](#sumber-data--atribusi)).
- **Status data:** GADM adm2 (v2.8) → **388 unit** (88 Kota + 300 Kabupaten). Peta jalan ke 514 unit resmi: lihat [Keterbatasan & Upgrade](#keterbatasan--upgrade-data).

---

## Cerita di balik peta ini

Peta ini lahir untuk mengerjakan **aiclub.id** — komunitas AI gratis yang mendata builder per provinsi & kota. Prinsip produknya: **"peta = panggung utama"** — landing bukan halaman yang kebetulan ada petanya, tapi peta itu sendiri yang jadi panggung.

Tantangannya: bikin peta Indonesia yang (1) **beridentitas 8-bit/retro**, (2) **detail sampai kabupaten** dan tetap **jelas saat di-zoom**, (3) **ringan & offline**, (4) menghormati privasi (hanya agregat, sembunyikan grup <5). Peta tile biasa (OpenStreetMap dll) bertabrakan dengan estetika pixel dan butuh jaringan. Solusinya: **rasterisasi batas wilayah asli jadi grid pixel** lalu render nearest-neighbor. Hasilnya akurat secara geografis, tapi berbentuk pixel yang kres di zoom manapun.

---

## Apa yang dilakukan peta ini

| Level | Tampilan | Interaksi |
|---|---|---|
| **Nasional** | 38 provinsi, warna = kepadatan builder | hover → tooltip · klik provinsi → zoom |
| **Provinsi** | semua kabupaten/kota provinsi itu sebagai region pixel ber-outline, warna = kepadatan | hover → tooltip (KOTA/KAB.) · klik → detail |
| **Kabupaten/Kota** | unit terpilih di-highlight | panel: builder, gender, top pekerjaan, daftar unit lain |

- **Tajam di zoom manapun** — canvas `image-rendering: pixelated`, scaling nearest-neighbor.
- **Navigasi**: pan (drag), zoom (scroll / tombol), breadcrumb, ESC bertingkat (kota → provinsi → nasional).
- **Privasi**: angka agregat; kelompok <5 ditampilkan `<5`.

Demo web: buka **`index.html`** langsung di browser (tanpa build, tanpa server). Data: **`data/peta-hd-data.js`**.

---

## Arsitektur & pipeline data

```
Batas wilayah asli (TopoJSON, GADM)          <- sumber
        │  decode arcs → ring lon/lat (WGS84)
        ▼
Rasterisasi scanline → grid pixel W×H          <- 1 sel = 1 provinsi/kabupaten
        │  (provinsi & kabupaten dirender ke grid yang sama & selaras)
        ▼
Assign kabupaten → provinsi (majority-vote geografis)
        │
        ▼
RLE-compress + metadata (bbox, centroid, luas) <- peta-hd-data.js
        │
        ▼
Render: canvas drawImage nearest-neighbor + hit-test lewat grid
```

**Kenapa rasterisasi (bukan render polygon/SVG)?**
- Estetika **8-bit** langsung dapat — dunia jadi kotak pixel, bukan garis halus.
- **Zoom = tetap tajam**: pixel jadi kotak besar yang kres, tidak blur, tanpa re-tessellation.
- **Ringan & offline**: satu file data ±250 KB, tanpa server tile.
- **Platform-agnostik**: cukup bisa gambar persegi + baca array → bisa render (web, mobile, game engine).
- **Hit-test O(1)**: `grid[y*W+x]` → indeks wilayah. Tak perlu point-in-polygon saat runtime.

---

## Sumber data & atribusi

Wajib dicantumkan bila memakai/menurunkan data ini.

| Layer | Repo GitHub | File | Cakupan | Lisensi |
|---|---|---|---|---|
| **Provinsi (adm1)** | [denyherianto/indonesia-geojson-topojson-maps-with-38-provinces](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces) | `TopoJSON/indonesia-38-provinces.topo.json` | 38 provinsi (2024, termasuk provinsi Papua baru) | CC-BY-4.0 |
| **Kabupaten/Kota (adm2)** | [tvalentius/Indonesia-topojson](https://github.com/tvalentius/Indonesia-topojson) | `indonesia-topojson-city-regency.json` | 388 kab/kota (GADM adm2) | GADM |
| **Upstream batas** | [GADM](https://gadm.org) · [BIG — geoservice.big.go.id](https://geoservice.big.go.id) | — | Batas administrasi RI | GADM / BIG terms |

**Alternatif / untuk upgrade** (lihat bagian upgrade):
- [superpikar/indonesia-geojson](https://github.com/superpikar/indonesia-geojson) — provinsi (GeoJSON/SHP).
- `geojson-indonesia` (npm, GADM v4.1: `gadm41_IDN_1..4.json`) — adm1–adm4 versi terbaru.
- [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) — kode wilayah resmi BPS/Kemendagri (untuk memetakan nama → kode).

**Contoh string atribusi:**
> Peta Pixel Nusantara — batas wilayah © GADM (gadm.org); provinsi via denyherianto (CC-BY-4.0); kabupaten/kota via tvalentius. Pixelisasi & komponen © Rama Aditya (github.com/RamaAditya49) — MIT. Dibuat untuk aiclub.id.

---

## Format data — `peta-hd-data.js`

Satu objek global `window.PETA_HD` (atau muat sebagai JSON). Skema:

```jsonc
{
  "W": 1600, "H": 594,                 // dimensi grid (kolom × baris)
  "lonMin": 95.01, "lonMax": 141.02,   // batas geografis (WGS84, derajat)
  "latMin": -11.01, "latMax": 6.08,

  "prov": [                            // index array = ID provinsi
    { "n":"Aceh", "m":44,              // n=nama, m=jumlah builder (agregat)
      "a":1234,                        // a=luas dalam sel
      "x0":.., "y0":.., "x1":.., "y1":..,   // bounding box (sel)
      "cx":.., "cy":.. }               // centroid (sel)
  ],

  "kab": [                             // index array = ID kabupaten/kota
    { "n":"Semarang", "t":"Kota",      // t = "Kota" | "Kabupaten"
      "p":13,                          // p = index provinsi induk (ke prov[])
      "a":.., "x0":.., "y0":.., "x1":.., "y1":.., "cx":.., "cy":.. }
  ],

  "provKab": { "13": [120,121,122, ...] },  // provIndex → daftar kabIndex

  "provRle": [255, 8000, 0, 12, ...],  // grid provinsi, Uint8: 255=laut, lain=provIndex
  "kabRle":  [65535, 8000, 12, 4, ...] // grid kab, Uint16: 65535=laut, lain=kabIndex
}
```

- **RLE** = pasangan `[value, count]` berurutan **row-major** (kiri→kanan, atas→bawah).
- `provRle` dan `kabRle` **selaras**: sel yang sama merujuk lokasi geografis yang sama, jadi setiap sel kabupaten bisa dipetakan ke provinsinya lewat `kab[kabIndex].p`.
- Angka `m` (builder) berasal dari data agregat aiclub; untuk pemakaian umum, isi/ubah sesuka Anda (peta tak bergantung padanya).

### Dekode RLE → grid

```js
function inflate(rle, size, SEA) {
  const g = new (size > 65535 ? Uint16Array : Uint16Array)(size); // pakai Uint8Array utk provRle
  let o = 0;
  for (let i = 0; i < rle.length; i += 2) {
    const v = rle[i], c = rle[i+1];
    for (let j = 0; j < c; j++) g[o++] = v;
  }
  return g;
}
// const PG = inflate(D.provRle, D.W*D.H); // 255 = laut
// const KG = inflate(D.kabRle,  D.W*D.H); // 65535 = laut
```

### Konversi lon/lat ↔ sel grid

```
cellX = round( (lon - lonMin) / (lonMax - lonMin) * (W - 1) )
cellY = round( (latMax - lat) / (latMax - latMin) * (H - 1) )   // Y dibalik: utara di atas
// balik:
lon = lonMin + cellX/(W-1) * (lonMax - lonMin)
lat = latMax - cellY/(H-1) * (latMax - latMin)
```

---

## Panduan implementasi multi-platform

Datanya JSON murni + dua grid RLE. Renderer apa pun yang bisa **(a) menggambar persegi** dan **(b) membaca array** bisa memakainya. Aturan wajib agar tetap 8-bit:

1. **Nearest-neighbor / matikan smoothing.** Web: `ctx.imageSmoothingEnabled=false` + CSS `image-rendering:pixelated`. Flutter: `FilterQuality.none`. Skia: `Paint..filterQuality=none`. Unity: `Point (no filter)` + `Pixels Per Unit` pas.
2. **Skala integer** kalau bisa (×2, ×3, …) supaya semua pixel sama besar.
3. **Laut = transparan** (SEA), gambar hanya sel daratan.
4. **Warna = ramp kepadatan** (lihat bawah), bukan warna acak.

### Render inti (pseudocode, berlaku semua platform)

```
grid = inflate(kabRle)            // atau provRle utk tampilan nasional
for y in 0..H-1:
  for x in 0..W-1:
    v = grid[y*W + x]
    if v == SEA: continue
    color = ramp[ bucket(density(v)) ]
    drawRect(x*scale, y*scale, scale, scale, color)   // no anti-alias
```

### Zoom & pan

Simpan **viewport** dalam koordinat grid `{vx, vy, vw, vh}` lalu petakan ke layar. Di web dilakukan via satu `drawImage(base, vx,vy,vw,vh, 0,0,screenW,screenH)`. Di platform lain: gambar hanya sel dalam viewport, `screenScale = screenW / vw`.

### Hit-test (hover/klik) — O(1)

```
// dari titik layar (sx, sy):
gx = floor( vx + sx/screenW * vw )
gy = floor( vy + sy/screenH * vh )
index = grid[gy*W + gx]        // SEA → kosong
// nasional: index = provinsi; zoom: index = kabupaten (cek kab[index].p == provinsiTerpilih)
```

### Catatan per platform

- **Web** — Canvas 2D (`drawImage` + `imageSmoothingEnabled=false`) atau WebGL/regl (grid sebagai texture, sampler NEAREST). Referensi: `AIClub Peta.dc.html`.
- **Flutter** — `CustomPainter`; `canvas.drawRect` per sel, atau bikin `dart:ui.Image` dari grid lalu `drawImageRect` dengan `FilterQuality.none`.
- **React Native** — `@shopify/react-native-skia`, `Image`/`Rect`, `filterQuality="none"`.
- **iOS (SwiftUI)** — `Canvas` + `context.fill(Path(rect))`, atau `CGImage` + `.interpolation(.none)`.
- **Android (Compose)** — `Canvas` `drawRect`, atau `Bitmap` + `filterQuality = None`.
- **Game engine** — Unity `Tilemap`/`Texture2D` (`filterMode=Point`), Godot `TileMap`/`Image` (nearest). Grid langsung jadi peta ubin; provinsi/kabupaten = ID ubin.

Semua platform berbagi **satu file data** dan **satu ramp warna** → tampilan konsisten.

---

## Estetika 8-bit — token render

Ramp kepadatan (bucket → warna). Skema default **Cyan klasik**:

```
ramp = ["#131C33", "#0E3C50", "#0E607A", "#00A7C4", "#00E5FF"]   // 0 → padat
```

Ambang bucket berbeda per level (angka provinsi jauh lebih besar dari kabupaten):

```
bucketProvinsi(m):  m<=0→0 · <50→1 · <150→2 · <400→3 · else→4
bucketKabupaten(m): m<=0→0 · <5→1  · <20→2  · <60→3  · else→4
```

Skema alternatif (opsional): **Cyan→Magenta** `#9A3A9E/#FF00E5`, **Kuning** `#B89A16/#FFE500`. Aksen: cyan `#00E5FF`, kuning `#FFE500`, magenta `#FF00E5`. BG gelap `#070B14`. Outline sel: warna BG (garis pemisah), highlight hover kuning, terpilih cyan. Detail palet & tipografi: lihat proyek asal (aiclub.id).

---

## Privasi (khusus aiclub.id)

Peta hanya menampilkan **agregat**. Aturan **<5**: setiap kelompok (gender/pekerjaan per wilayah) yang berisi 1–4 orang ditampilkan `<5`, tidak pernah angka pastinya — mencegah individu ditebak. Tidak ada nama/email/no. HP di data peta. Aturan privasi lengkap ada di proyek asal (aiclub.id).

---

## Regenerasi data (rasterizer)

Prinsip generator (dari TopoJSON/GeoJSON → `peta-hd-data.js`):

1. **Decode arcs** TopoJSON (delta-encoded + `transform` quantized) → ring `lon/lat`.
2. **Bounds** = union semua ring (provinsi + kabupaten) → `lonMin..latMax`. Pilih `W` (mis. 1600); `H = round(W · (latSpan/lonSpan))` supaya sel ~persегi (equirectangular).
3. **Rasterisasi scanline** tiap poligon ke grid (even-odd per ring, + tandai sel-vertex agar pulau kecil tak hilang). Provinsi & kabupaten dirender ke grid ukuran/bounds sama → **selaras**.
4. **Assign kabupaten → provinsi**: majority-vote sel kabupaten terhadap grid provinsi (akurat di klaster padat mis. Jakarta/Banten/Jabar); fallback nama provinsi GADM.
5. **Metadata** per wilayah: bbox, centroid, luas. **RLE** encode kedua grid. Tulis `peta-hd-data.js`.

Klasifikasi **Kota vs Kabupaten** dari GADM: `TYPE_2 == "Kotamadya"` / `ENGTYPE_2 == "Municipality"` → **Kota**, selain itu **Kabupaten** (prefix nama "Kota " di-strip; unit `TYPE_2="Unknown"`/`n.a.` dibuang).

### Keterbatasan & upgrade data

- **Vintage sekarang:** GADM adm2 v2.8 → **388 unit** (88 Kota + 300 Kabupaten). Angka resmi terkini **514** (98 Kota + 416 Kabupaten) — selisihnya adalah unit hasil **pemekaran** yang lebih baru (mis. Kota Tangerang Selatan, Kota Serang, beberapa kabupaten baru).
- **Cara upgrade ke 514 (skema tak berubah):** ganti sumber adm2 ke **GADM v4.1** (`gadm41_IDN_2.json`) atau **BPS 2020** (mis. dari BIG), lalu jalankan ulang rasterizer di atas. Komponen render **tidak perlu diubah** — hanya `peta-hd-data.js` yang di-regenerate. Pemetaan nama→kode resmi bisa pakai [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah).
- **Provinsi baru** (pecahan Papua, Kaltara): sudah benar karena tiap kabupaten di-assign ulang ke 38 provinsi **secara geografis**, bukan mengikuti label provinsi lama GADM.

---

## Manifest file

| File | Isi |
|---|---|
| `index.html` | Demo peta interaktif (vanilla JS, tanpa framework) |
| `data/peta-hd-data.js` · `data/peta-hd-data.json` | Data grid + metadata (`window.PETA_HD` / JSON) |
| `sources/indonesia-38-provinces.topo.json` | Sumber provinsi (adm1) |
| `sources/indonesia-topojson-city-regency.json` | Sumber kabupaten/kota (adm2) |
| `README.md` | Dokumen ini · `tools/rasterize.mjs` | Generator data |

---

## Lisensi

- **Kode & pixelisasi:** MIT © Rama Aditya (<https://github.com/RamaAditya49/>).
- **Data batas wilayah:** CC-BY-4.0 / GADM — wajib atribusi ke sumber di [tabel](#sumber-data--atribusi).
- Saat redistribusi, sertakan string atribusi & tautan sumber.

