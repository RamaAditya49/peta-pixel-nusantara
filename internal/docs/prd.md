---
type: prd
status: draft          # draft | current | stale
updated: 2026-11-12
---

# PRD: Peta Pixel Nusantara

## Masalah

Tile map biasa terlalu halus, bergantung pada jaringan, dan tidak cocok dengan gaya pixel. Komunitas butuh peta Indonesia 8bit untuk menampilkan data agregat per provinsi dan kota.
Aiclub.id membuat peta ini untuk menampilkan persebaran builder per provinsi dan kota.

## Pengguna

| Persona | Kebutuhan utama | Konteks pakai |
|---------|-----------------|---------------|
| Pengembang web | Peta interaktif tanpa tile server | Landing page, dashboard komunitas |
| Pengembang game atau mobile | Data grid yang bisa digambar di platform apa pun | Unity, Godot, Flutter, Skia |
| Pengelola komunitas | Peta agregat per provinsi dan kota | Demo di browser |
| Kontributor open-source | Data dan rasterizer yang bisa diulang | Repo GitHub |

Dasar persona: bagian "Use Cases" dan "Why This Exists" di `README.md`.

## Tujuan produk dan metrik sukses

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Data selalu sesuai kontrak | `node tools/verify-data.mjs` lulus | Lulus untuk tiap perubahan data |
| Peta mudah dipakai ulang | Format data tanpa ketergantungan platform | JSON plus grid RLE |
| Jangkauan pengguna | TBD | TBD |

## Fitur

| ID | Fitur | Prioritas | Status | FR terkait |
|----|-------|-----------|--------|------------|
| F-01 | Peta 38 provinsi dan 514 kab/kota sebagai grid pixel | must | live | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006 |
| F-02 | Hover dengan tooltip wilayah | must | live | FR-010 |
| F-03 | Zoom dari provinsi ke kab/kota lewat klik | must | live | FR-011 |
| F-04 | Pan dengan drag, zoom dengan scroll, pinch, tombol, dan keyboard | must | live | FR-012 |
| F-05 | Pencarian provinsi dan kab/kota, termasuk sebagian nama dan potongan `shapeID` | should | live | FR-013 |
| F-06 | Akses keyboard ke peta | should | live | FR-014 |
| F-07 | Layer air untuk danau dan waduk | should | live | FR-005, FR-015 |
| F-08 | Hook `window.PETA_HD_MERGE` untuk metrik sendiri | should | live | FR-016 |
| F-09 | Hook `window.PETA_COLORS` untuk skala warna | should | live | FR-017 |
| F-10 | Ekspor tampilan PNG dan data wilayah JSON | could | live | FR-018 |
| F-11 | Panel samping dengan daftar kab/kota per provinsi | should | live | FR-019 |
| F-12 | Pesan kegagalan saat data tidak termuat | should | live | FR-020 |
| F-13 | Rasterizer dengan lebar grid yang bisa diubah | should | live | FR-007 |

## Alur pengguna utama

1. Pengguna membuka `index.html`. Peta Indonesia muncul dengan 38 provinsi.
2. Pengguna menggerakkan kursor di atas provinsi. Tooltip menampilkan nama dan nilai.
3. Pengguna mengklik provinsi. Peta zoom ke provinsi itu dan panel menampilkan daftar kab/kota.
4. Pengguna mengklik kab/kota atau memilihnya dari daftar. Panel menampilkan detail wilayah.
5. Pengguna menekan `Esc`. Peta kembali satu tingkat.
6. Pengguna mencari wilayah lewat kolom pencarian. Peta membuka wilayah yang cocok.
7. Pengguna menekan tombol PNG atau JSON untuk mengekspor tampilan atau data.

## Kebutuhan non-fungsional

| Area | Target yang bisa diukur |
|------|-------------------------|
| Performa | Hit-test memakai satu pembacaan grid (`grid[y * W + x]`). Demo tidak memakai tile server atau backend. |
| Aksesibilitas | Canvas punya `role="img"`, `aria-label`, dan `tabindex="0"`. Peta bisa dioperasikan dengan keyboard. Target WCAG: TBD. |
| SEO | Frasa utama `peta indonesia 8bit` muncul dalam 100 kata pertama `README.md`. |
| Keamanan | Demo memakai Content Security Policy dengan `connect-src 'none'`. Nama wilayah di-escape sebelum masuk `innerHTML`. |

## Di luar lingkup

- Data pribadi. Peta ini hanya untuk angka agregat.
- Backend, tile server, dan penyimpanan data pengguna.
- Framework atau build tooling untuk demo. `AGENTS.md` melarangnya tanpa alasan kuat.
- Kode wilayah resmi BPS atau BIG. Normalisasi ini masih berupa saran kontribusi.

## Rilis

| Milestone | Isi | Target tanggal | Status |
|-----------|-----|----------------|--------|
| Rilis awal | Demo dan data provinsi plus kab/kota GADM | Tidak ada target | Selesai (commit `291583e`) |
| Data geoBoundaries | 514 unit ADM2 | Tidak ada target | Selesai (commit `ff29781`) |
| Perbaikan demo dan pipeline | PR #58 | Tidak ada target | Selesai (merged 2026-07-31) |
| Unit non-administratif dan keyboard | PR #65 | Tidak ada target | Selesai (merged 2026-08-13) |
| Optimasi canvas | PR #66 dari kontributor luar | Tidak ada target | Terbuka |

## Pertanyaan terbuka

- TBD: Metrik jangkauan apa yang dipakai (bintang GitHub, unduhan, pemakaian di aiclub.id)?
- TBD: Apakah WCAG 2.2 AA menjadi target resmi aksesibilitas?
- TBD: Apakah PR #66 diterima atau ditutup?

## Sumber fakta

- `README.md`, `CONTRIBUTING.md`, `AGENTS.md`
- `index.html` (tombol, hook, event handler, meta CSP)
- `gh issue list` dan `gh pr list` (dibaca 2026-11-12)
- `git log --oneline -30`
