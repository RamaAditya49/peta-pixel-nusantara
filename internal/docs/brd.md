---
type: brd
status: draft          # draft | current | stale
updated: 2026-11-12
---

# BRD: Peta Pixel Nusantara

## Latar bisnis

Aiclub.id adalah komunitas AI gratis se-Nusantara. Komunitas ini ingin menampilkan persebaran builder per provinsi dan kota dengan rasa visual pixel.
Rama Aditya membuat peta ini untuk kebutuhan itu, lalu merilisnya sebagai open-source. Sumber: `README.md`, bagian "Why This Exists".

## Tujuan bisnis

| ID | Tujuan | Ukuran | Target | Tenggat |
|----|--------|--------|--------|---------|
| BG-01 | Sediakan peta pixel Indonesia untuk aiclub.id | TBD | TBD | TBD |
| BG-02 | Rilis peta sebagai open-source yang mudah dipakai ulang | TBD | TBD | TBD |

## Stakeholder

| Peran | Kepentingan | PIC |
|-------|-------------|-----|
| Pemilik proyek | Menerbitkan dan merawat repo | Rama Aditya |
| aiclub.id | Pemakai utama peta untuk persebaran builder | TBD |
| Kontributor open-source | Memperbaiki kode dan data | Kontributor GitHub |
| Penyedia data (geoBoundaries, denyherianto) | Atribusi sesuai CC-BY-4.0 | Pemilik sumber data |

## Model bisnis

Proyek open-source, tanpa pendapatan langsung. Kode berlisensi MIT.

## Aturan bisnis

| ID | Aturan | Sumber |
|----|--------|--------|
| BR-001 | Distribusi ulang data batas wilayah wajib menyertakan atribusi sumber. | `ATTRIBUTION.md` |
| BR-002 | Kode dan pixelisasi berlisensi MIT. | `LICENSE`, `ATTRIBUTION.md` |
| BR-003 | Batas kab/kota utama berasal dari geoBoundaries (CC-BY-4.0). | `AGENTS.md` |
| BR-004 | Fallback GADM punya syarat lebih ketat. Redistribusi atau pemakaian komersial butuh izin GADM. | `ATTRIBUTION.md` |
| BR-005 | Peta hanya untuk data agregat, bukan data pribadi. | `README.md`, bagian "Privacy" |
| BR-006 | `ATTRIBUTION.md`, teks sumber data di README, dan footer `index.html` harus konsisten saat sumber berubah. | `AGENTS.md` |

## KPI

| KPI | Target | Cara ukur | Alat |
|-----|--------|-----------|------|
| TBD | TBD | TBD | TBD |

## Asumsi dan batasan

- Proyek tetap tanpa dependensi, kecuali ada alasan kuat (`AGENTS.md`).
- Data kab/kota belum dinormalisasi ke kode BPS atau BIG, jadi belum cocok untuk sistem tingkat pemerintah.
- Repo ini publik. Dokumen ini tidak memuat angka bisnis.

## Risiko bisnis

- Pelanggaran lisensi GADM bila fallback dipakai untuk tujuan komersial → fallback hanya dipakai bila berkas geoBoundaries tidak ada.
- Data tidak akurat untuk keperluan resmi → `README.md` menyatakan batas ini di "Current Limitations".

## Pertanyaan terbuka

- TBD: Apa tujuan bisnis terukur untuk aiclub.id dan untuk adopsi open-source?
- TBD: Siapa PIC di aiclub.id?
- TBD: KPI apa yang Rama ingin pantau, dan Rama setuju memuat angkanya di repo publik?

## Sumber fakta

- `README.md`, `ATTRIBUTION.md`, `AGENTS.md`, `CITATION.cff`, `LICENSE`
