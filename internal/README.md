# internal/

Folder ini menyimpan dokumentasi kerja repo. Agent dan manusia memakai aturan yang sama.

| Folder | Isi |
|--------|-----|
| `docs/` | Dokumen pusat: kondisi produk saat ini. Mulai dari `docs/README.md`. |
| `research/` | Satu berkas untuk satu topik riset. Selalu perbarui, jangan mulai dari nol. |
| `spec/` | Apa dan kenapa untuk satu pekerjaan, dengan acceptance criteria EARS. |
| `plan/` | Cara mengerjakan spec. Tiap langkah menunjuk ID AC. |
| `done/` | Bukti bahwa tiap AC lulus. Dibuat hanya kalau pekerjaan selesai. |

Satu pekerjaan memakai satu nama berkas `YYYYMMDD-slug.md` di `spec/`, `plan/`, dan `done/`.

Aturan lengkap ada di skill `rama-aditya-workflows`.
