---
type: frd
status: draft          # draft | current | stale
updated: 2026-11-12
---

# FRD: Peta Pixel Nusantara

## Konvensi

- Tulis tiap requirement dengan pola EARS. Lihat referensi EARS di skill `rama-aditya-workflows`.
- Satu baris berisi satu perilaku yang bisa diverifikasi.
- ID `FR-001` dan `NFR-001` tetap selamanya. Jangan pakai ulang ID yang sudah dihapus.
- Requirement yang tidak berlaku lagi memakai status `deprecated`. Jangan hapus barisnya.
- Kolom "Sumber" berisi ID spec yang menambah atau mengubah requirement itu.

## Kontrak data

| ID | Pola | Requirement | Status | Sumber |
|----|------|-------------|--------|--------|
| FR-001 | Ubiquitous | The generated data shall contain exactly 38 provinces in `prov[]`. | implemented | bootstrap |
| FR-002 | Ubiquitous | The generated data shall contain exactly 514 ADM2 units in `kab[]`, made of 416 Kabupaten and 98 Kota. | implemented | bootstrap |
| FR-003 | Unwanted behavior | If a source feature is non-administrative (matched by `tools/non-admin-units.mjs`), then the rasterizer shall exclude it from `kab[]`. | implemented | bootstrap |
| FR-004 | Ubiquitous | Every ADM2 unit shall have a non-empty `c` code, and no two units shall share the same `c`. | implemented | bootstrap |
| FR-005 | Event-driven | When a source feature is a lake or reservoir, the rasterizer shall write it into `waterRle` and not into `kabRle`. | implemented | bootstrap |
| FR-006 | Ubiquitous | Every ADM2 unit shall point to a valid province index in `p`, and `provKab` shall list each unit exactly once under that province. | implemented | bootstrap |
| FR-007 | Unwanted behavior | If the grid width argument is not an integer between 100 and 10000, then the rasterizer shall stop with an error and write no data. | implemented | bootstrap |
| FR-008 | Ubiquitous | The area `a` of each province and ADM2 unit shall equal the count of its cells in the grid. | implemented | bootstrap |
| FR-009 | Unwanted behavior | If the generated data breaks any rule in FR-001 to FR-008, then `tools/verify-data.mjs` shall print the reason and exit with code 1. | implemented | bootstrap |

## Demo interaktif

| ID | Pola | Requirement | Status | Sumber |
|----|------|-------------|--------|--------|
| FR-010 | Event-driven | When the pointer moves over a region, the demo shall show a tooltip with the region name and its value. | implemented | bootstrap |
| FR-011 | Event-driven | When the user clicks a province, the demo shall zoom to that province and open the side panel with its Kabupaten and Kota list. | implemented | bootstrap |
| FR-012 | Event-driven | When the user drags, scrolls, pinches, presses the zoom buttons, or presses `+`, `-`, or `0`, the demo shall pan or zoom the map. | implemented | bootstrap |
| FR-013 | Event-driven | When the user types in the search field, the demo shall match provinces and ADM2 units by partial name or by part of the `shapeID`, and open the match on `Enter`. | implemented | bootstrap |
| FR-014 | Event-driven | When the map has focus and the user presses an arrow key, the demo shall move the map cursor one cell, or a larger step with `Shift`. | implemented | bootstrap |
| FR-015 | Ubiquitous | The demo shall paint the water layer over the province layer, and hit-testing shall treat water as "not a region". | implemented | bootstrap |
| FR-016 | Optional feature | Where `window.PETA_HD_MERGE` is defined, the demo shall set `m` of each province by name and of each ADM2 unit by `c` or name at boot. | implemented | bootstrap |
| FR-017 | Optional feature | Where `window.PETA_COLORS` holds exactly five valid hex colors, the demo shall use them as the color ramp. | implemented | bootstrap |
| FR-018 | Event-driven | When the user presses the PNG or JSON button, the demo shall download the current view as PNG or the data of the current region as JSON. | implemented | bootstrap |
| FR-019 | Event-driven | When the user presses `Esc`, the demo shall clear the search field if it has text, and otherwise go back one level. | implemented | bootstrap |
| FR-020 | Unwanted behavior | If the map data fails to load, then the demo shall show a load-failure message. | implemented | bootstrap |
| FR-021 | Event-driven | When the user clicks outside the side panel on an empty map area, the demo shall close the side panel. | implemented | bootstrap |

## Kebutuhan non-fungsional

| ID | Pola | Requirement | Status | Sumber |
|----|------|-------------|--------|--------|
| NFR-001 | Ubiquitous | The demo shall run from static files, with no build step and no backend. | implemented | bootstrap |
| NFR-002 | Ubiquitous | The demo shall render the grid with nearest-neighbor sampling and no smoothing. | implemented | bootstrap |
| NFR-003 | Ubiquitous | The demo shall load no network resource other than the web fonts, set by `connect-src 'none'` in its Content Security Policy. | implemented | bootstrap |
| NFR-004 | Ubiquitous | The demo shall escape region names before it puts them into `innerHTML`. | implemented | bootstrap |
| NFR-005 | Ubiquitous | The canvas shall have `role="img"`, an `aria-label`, and `tabindex="0"`. | implemented | bootstrap |
| NFR-006 | Ubiquitous | Rerunning `node tools/rasterize.mjs` on unchanged sources shall produce unchanged files in `data/`. | planned | bootstrap |

## Pertanyaan terbuka

- TBD: Apakah NFR-006 (output rasterizer identik) sudah pernah diuji? Tidak ada bukti di repo.
- TBD: Apakah `FR-012` mencakup tombol "Jump To Provinsi"? Isu #38 closed, tetapi `index.html` tidak memuat dropdown itu.
