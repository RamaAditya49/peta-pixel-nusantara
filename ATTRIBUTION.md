# Atribusi & Lisensi Data

Peta ini adalah **rasterisasi (pixelisasi)** dari batas wilayah administrasi
Indonesia. Kode + pixelisasi berlisensi **MIT** (lihat `LICENSE`). Data batas
wilayah di bawah ini punya lisensi masing-masing dan **wajib diatribusikan**
saat dipakai/didistribusikan ulang.

## Sumber batas wilayah

- Provinsi:
  [denyherianto/indonesia-geojson-topojson-maps-with-38-provinces][prov-src],
  file asal `TopoJSON/indonesia-38-provinces.topo.json`, lisensi CC-BY-4.0.
- Kabupaten/kota:
  [geoBoundaries][geoboundaries], file asal
  `geoBoundaries-IDN-ADM2_simplified.geojson`, lisensi CC-BY-4.0.
- Kabupaten/kota legacy fallback:
  [tvalentius/Indonesia-topojson][legacy-src], file
  `indonesia-topojson-city-regency.json`, lisensi GADM.

Salinan file sumber ada di `sources/`.

## Catatan lisensi geoBoundaries

Layer kabupaten/kota utama sekarang memakai **geoBoundaries** untuk Indonesia
ADM2. geoBoundaries menyediakan dataset di bawah lisensi **Creative Commons
Attribution 4.0 International (CC-BY-4.0)**. Saat memakai atau mendistribusikan
turunan data ini, sertakan atribusi ke geoBoundaries.

Rujukan sitasi yang direkomendasikan geoBoundaries:

> Runfola, D. et al. (2020) geoBoundaries: A global database of political
> administrative boundaries. PLoS ONE 15(4): e0231866.

## Catatan lisensi GADM legacy fallback

File `sources/indonesia-topojson-city-regency.json` masih disimpan sebagai
fallback lama. File itu diturunkan dari **GADM**. Data GADM gratis untuk
penggunaan akademik dan non-komersial lain; redistribusi atau penggunaan
komersial memerlukan izin dari GADM. Lihat <https://gadm.org/license.html>.

Rasterizer hanya memakai fallback GADM bila file geoBoundaries tidak ada.

## String atribusi (contoh, sertakan saat redistribusi)

> Peta Pixel Nusantara — batas provinsi via denyherianto (CC-BY-4.0);
> batas kabupaten/kota via geoBoundaries (CC-BY-4.0; Runfola et al., 2020).
> Pixelisasi, format grid & renderer © Rama Aditya (github.com/RamaAditya49)
> — MIT. Dibuat untuk aiclub.id.

## Vintage & kelengkapan data

- Rilis saat ini: geoBoundaries ADM2 simplified → **519 unit** (98 Kota + 421 Kabupaten).
- Fallback lama: GADM-derived adm2 v2.8 → **388 unit** (88 Kota + 300 Kabupaten).
- Untuk kebutuhan kode resmi: cocokkan nama ke data BPS/BIG, lalu regenerate.
  Pemetaan nama → kode wilayah resmi: [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah).

[prov-src]: https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces
[geoboundaries]: https://www.geoboundaries.org/
[legacy-src]: https://github.com/tvalentius/Indonesia-topojson
