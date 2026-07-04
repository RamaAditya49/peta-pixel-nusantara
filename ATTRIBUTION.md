# Atribusi & Lisensi Data

Peta ini adalah **rasterisasi (pixelisasi)** dari batas wilayah administrasi Indonesia.
Kode + pixelisasi berlisensi **MIT** (lihat `LICENSE`). Data batas wilayah di bawah ini
punya lisensi masing-masing dan **wajib diatribusikan** saat dipakai/didistribusikan ulang.

## Sumber batas wilayah

| Layer | Sumber (GitHub) | File asal | Lisensi |
|---|---|---|---|
| Provinsi (adm1, 38 provinsi 2024) | [denyherianto/indonesia-geojson-topojson-maps-with-38-provinces](https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces) | `TopoJSON/indonesia-38-provinces.topo.json` | CC-BY-4.0 |
| Kabupaten/Kota (adm2) | [tvalentius/Indonesia-topojson](https://github.com/tvalentius/Indonesia-topojson) | `indonesia-topojson-city-regency.json` | GADM (lihat di bawah) |
| Batas upstream | [GADM](https://gadm.org) · [Badan Informasi Geospasial (BIG)](https://geoservice.big.go.id) | — | GADM / BIG terms |

Salinan file sumber ada di `sources/`.

## Catatan lisensi GADM (penting)

Data kabupaten/kota diturunkan dari **GADM**. Data GADM **gratis untuk penggunaan akademik
dan non-komersial lain**; **redistribusi atau penggunaan komersial memerlukan izin** dari GADM.
Lihat <https://gadm.org/license.html>. Karena data di repo ini adalah turunan (rasterisasi)
dari GADM, batasan yang sama berlaku untuk layer kabupaten/kota.

**Untuk penggunaan yang lebih bebas (mis. komersial / open data penuh):** ganti sumber adm2
ke data pemerintah Indonesia — **BPS / BIG** (Badan Informasi Geospasial), atau **GADM v4.1**
sesuai lisensinya — lalu jalankan ulang `tools/rasterize.mjs`. Format & renderer tidak berubah.

## String atribusi (contoh, sertakan saat redistribusi)

> Peta Pixel Nusantara — batas wilayah © GADM (gadm.org); provinsi via denyherianto
> (CC-BY-4.0); kabupaten/kota via tvalentius (GADM adm2). Pixelisasi, format grid & renderer
> © Rama Aditya (github.com/RamaAditya49) — MIT. Dibuat untuk aiclub.id.

## Vintage & kelengkapan data

- Rilis saat ini: GADM adm2 **v2.8** → **388 unit** (88 Kota + 300 Kabupaten).
- Angka resmi terkini: **514** (98 Kota + 416 Kabupaten). Selisih = unit hasil **pemekaran**
  terbaru yang belum ada di GADM v2.8.
- Naik ke 514: pakai GADM v4.1 (`gadm41_IDN_2`) atau data BPS/BIG, lalu regenerate.
  Pemetaan nama → kode wilayah resmi: [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah).
